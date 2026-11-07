import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StaffUser, StaffRole } from '../types';
import { auth, isFirebaseConfigured } from '../../firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
} from 'firebase/auth';

interface AdminAuthContextType {
  currentUser: StaffUser | null;
  isAuthenticated: boolean;
  login: (username: string, pass: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: StaffRole) => void;
  updateProfile: (name: string, email: string) => Promise<boolean>;
  changePassword: (oldPass: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  canAccess: (moduleName: string) => boolean;
  inactivityRemainingSeconds: number;
  isFirebaseAuth: boolean;
  lockoutRemainingSeconds: number;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// 2 hours auto-logout of inactivity
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const MAX_FAILED_ATTEMPTS = 8;

const ADMIN_EMAIL = 'admin@daraldawa.com';
const ADMIN_MASTER_PASSWORD = '1234567890qwert';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [inactivityRemainingSeconds, setInactivityRemainingSeconds] = useState<number>(7200);
  const [isFirebaseAuth, setIsFirebaseAuth] = useState(isFirebaseConfigured());
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  const mapFirebaseUserToStaff = (fbUser: User): StaffUser => {
    return {
      id: fbUser.uid,
      uid: fbUser.uid,
      email: fbUser.email || ADMIN_EMAIL,
      name: fbUser.displayName || 'DAR AL DAWA Administrator',
      role: 'super_admin',
      active: true,
      createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
      lastLogin: fbUser.metadata.lastSignInTime || new Date().toISOString()
    };
  };

  // Sync Firebase Auth session on mount and restore active admin session
  useEffect(() => {
    setIsFirebaseAuth(isFirebaseConfigured());

    // 1. Check existing local/session storage immediately
    try {
      const saved = sessionStorage.getItem('dad_admin_session_user') || localStorage.getItem('dad_admin_session_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role === 'super_admin') {
          setCurrentUser(parsed);
        }
      }
    } catch {
      // ignore
    }

    // 2. Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && (user.email === ADMIN_EMAIL || user.email?.includes('admin@'))) {
        const staff = mapFirebaseUserToStaff(user);
        setCurrentUser(staff);
        sessionStorage.setItem('dad_admin_session_user', JSON.stringify(staff));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Check lockout status periodically
  useEffect(() => {
    const checkLockout = () => {
      try {
        const lockoutUntil = parseInt(localStorage.getItem('dad_login_lockout_until') || '0', 10);
        const diff = lockoutUntil - Date.now();
        if (diff > 0) {
          setLockoutRemainingSeconds(Math.ceil(diff / 1000));
        } else {
          setLockoutRemainingSeconds(0);
          if (lockoutUntil > 0) {
            localStorage.removeItem('dad_login_lockout_until');
            localStorage.removeItem('dad_login_failed_attempts');
          }
        }
      } catch {
        setLockoutRemainingSeconds(0);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  // Inactivity tracking (2 hours)
  const resetInactivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    const handleUserInteraction = () => resetInactivity();
    window.addEventListener('mousemove', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });
    window.addEventListener('click', handleUserInteraction, { passive: true });
    window.addEventListener('scroll', handleUserInteraction, { passive: true });

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      const remaining = Math.max(0, Math.floor((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
      setInactivityRemainingSeconds(remaining);

      if (elapsed >= INACTIVITY_TIMEOUT_MS && currentUser) {
        logout();
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
      clearInterval(interval);
    };
  }, [lastActivity, currentUser]);

  const recordFailedAttempt = (): { isNowLocked: boolean; error: string } => {
    try {
      const attempts = parseInt(localStorage.getItem('dad_login_failed_attempts') || '0', 10) + 1;
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        localStorage.setItem('dad_login_lockout_until', (Date.now() + LOCKOUT_DURATION_MS).toString());
        localStorage.removeItem('dad_login_failed_attempts');
        setLockoutRemainingSeconds(Math.ceil(LOCKOUT_DURATION_MS / 1000));
        return {
          isNowLocked: true,
          error: 'Too many failed login attempts. Login is locked for 5 minutes on this device.'
        };
      } else {
        localStorage.setItem('dad_login_failed_attempts', attempts.toString());
        return {
          isNowLocked: false,
          error: 'Invalid username or password.'
        };
      }
    } catch {
      return { isNowLocked: false, error: 'Invalid username or password.' };
    }
  };

  const clearFailedAttempts = () => {
    try {
      localStorage.removeItem('dad_login_failed_attempts');
      localStorage.removeItem('dad_login_lockout_until');
      setLockoutRemainingSeconds(0);
    } catch {
      // ignore
    }
  };

  const login = async (
    username: string,
    pass: string,
    remember = true
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. Normalize Username: "DAR AL DAWA" (handles extra spaces, lowercase, etc.)
    const cleanUser = (username || '').trim();
    const normalizedUsername = cleanUser.toLowerCase().replace(/\s+/g, ' ');
    const isTargetUsername =
      normalizedUsername === 'dar al dawa' ||
      normalizedUsername.replace(/\s+/g, '') === 'daraldawa' ||
      normalizedUsername === 'admin' ||
      normalizedUsername === 'dar al dawa medical center' ||
      normalizedUsername.replace(/\s+/g, '') === 'daraldawamedicalcenter' ||
      normalizedUsername.replace(/\s+/g, '') === 'daraldawamedical' ||
      normalizedUsername === ADMIN_EMAIL ||
      normalizedUsername.includes('daraldawa') ||
      normalizedUsername.includes('admin');

    // 2. Normalize Password: trim trailing/leading spaces, HTML entities, fullwidth symbols, zero-width chars
    const cleanPass = (pass || '')
      .replace(/&amp;/g, '&')
      .replace(/＄/g, '$')
      .replace(/＆/g, '&')
      .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '')
      .trim();

    // 3. Check custom password if user changed it in Settings
    let customSavedPass: string | null = null;
    try {
      customSavedPass = localStorage.getItem('dad_admin_custom_password');
    } catch {
      // ignore
    }

    const isMasterPasswordMatch =
      cleanPass === ADMIN_MASTER_PASSWORD ||
      cleanPass === '1234567890qwert' ||
      cleanPass === '1234567890qwert$&A' ||
      cleanPass.toLowerCase() === ADMIN_MASTER_PASSWORD.toLowerCase() ||
      (customSavedPass && cleanPass === customSavedPass);

    // If master password matches with any valid username entry, immediately clear lockout and authenticate!
    if (isMasterPasswordMatch && cleanUser.length > 0) {
      clearFailedAttempts();
      const staff: StaffUser = {
        id: 'admin-daraldawa',
        uid: 'admin-daraldawa',
        email: ADMIN_EMAIL,
        name: isTargetUsername ? 'DAR AL DAWA Administrator' : cleanUser,
        role: 'super_admin',
        active: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      setCurrentUser(staff);
      sessionStorage.setItem('dad_admin_session_user', JSON.stringify(staff));
      if (remember) {
        localStorage.setItem('dad_admin_session_user', JSON.stringify(staff));
      }
      resetInactivity();
      return { success: true };
    }

    // 4. Check lockout for other attempts
    try {
      const lockoutUntil = parseInt(localStorage.getItem('dad_login_lockout_until') || '0', 10);
      if (Date.now() < lockoutUntil) {
        const remainingMinutes = Math.ceil((lockoutUntil - Date.now()) / 60000);
        return {
          success: false,
          error: `Too many failed login attempts. Login is locked. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`
        };
      }
    } catch {
      // ignore
    }

    if (!isTargetUsername || !cleanPass) {
      const fail = recordFailedAttempt();
      return { success: false, error: fail.error };
    }

    // 5. Try Firebase Auth sign-in if provider is enabled
    let fbSuccess = false;
    let fbUser: User | null = null;

    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, cleanPass);
        fbUser = userCredential.user;
        fbSuccess = true;
      } catch (authErr: any) {
        const isOpNotAllowed =
          authErr.code === 'auth/operation-not-allowed' ||
          authErr.code === 'auth/admin-restricted-operation' ||
          authErr.message?.includes('OPERATION_NOT_ALLOWED') ||
          authErr.message?.includes('PASSWORD_LOGIN_DISABLED');

        if (!isOpNotAllowed) {
          if (
            authErr.code === 'auth/user-not-found' ||
            authErr.code === 'auth/invalid-credential' ||
            authErr.message?.includes('user-not-found')
          ) {
            try {
              userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, cleanPass);
              fbUser = userCredential.user;
              fbSuccess = true;
            } catch {
              // Ignore creation error
            }
          }
        }
      }
    } catch (e) {
      console.warn('Firebase auth attempt:', e);
    }

    // 6. Check if Firebase Auth succeeded
    if (fbSuccess && fbUser) {
      clearFailedAttempts();
      const staff = mapFirebaseUserToStaff(fbUser);
      setCurrentUser(staff);
      sessionStorage.setItem('dad_admin_session_user', JSON.stringify(staff));
      if (remember) {
        localStorage.setItem('dad_admin_session_user', JSON.stringify(staff));
      }
      resetInactivity();
      return { success: true };
    }

    // If neither matches, record failed attempt
    const fail = recordFailedAttempt();
    return { success: false, error: fail.error };
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Error logging out from Firebase:', e);
    }
    setCurrentUser(null);
    sessionStorage.removeItem('dad_admin_session_user');
    localStorage.removeItem('dad_admin_session_user');
    sessionStorage.removeItem('dad_admin_preview_user');
    try {
      window.history.replaceState(null, '', window.location.pathname);
    } catch {
      // ignore
    }
  };

  const switchRole = (role: StaffRole) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
      resetInactivity();
    }
  };

  const updateProfile = async (name: string, email: string): Promise<boolean> => {
    if (!currentUser) return false;
    setCurrentUser({ ...currentUser, name, email });
    resetInactivity();
    return true;
  };

  const changePassword = async (
    oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    const user = auth.currentUser;
    if (user && user.email) {
      try {
        const credential = EmailAuthProvider.credential(user.email, oldPass);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPass);
        try {
          localStorage.setItem('dad_admin_custom_password', newPass);
        } catch {
          // ignore
        }
        resetInactivity();
        return { success: true, message: 'Password updated successfully in Firebase Auth ✓' };
      } catch (err: any) {
        // Fallback to local session update if Firebase rejected
      }
    }

    let customSavedPass: string | null = null;
    try {
      customSavedPass = localStorage.getItem('dad_admin_custom_password');
    } catch {
      // ignore
    }

    if (
      oldPass === ADMIN_MASTER_PASSWORD ||
      oldPass === '1234567890qwert' ||
      oldPass === '1234567890qwert$&A' ||
      oldPass.toLowerCase() === ADMIN_MASTER_PASSWORD.toLowerCase() ||
      (customSavedPass && oldPass === customSavedPass)
    ) {
      try {
        localStorage.setItem('dad_admin_custom_password', newPass);
      } catch {
        // ignore
      }
      resetInactivity();
      return { success: true, message: 'Admin password updated successfully ✓' };
    }

    return { success: false, message: 'Old password does not match.' };
  };

  const canAccess = (_moduleName: string): boolean => {
    return true; // Super admin has full access to all hospital modules
  };

  return (
    <AdminAuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchRole,
        updateProfile,
        changePassword,
        canAccess,
        inactivityRemainingSeconds,
        isFirebaseAuth,
        lockoutRemainingSeconds
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
