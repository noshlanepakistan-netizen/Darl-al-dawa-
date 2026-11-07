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
const MAX_FAILED_ATTEMPTS = 5;

const ADMIN_EMAIL = 'admin@daraldawa.com';

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

  // Sync Firebase Auth session on mount and listen to changes
  useEffect(() => {
    setIsFirebaseAuth(isFirebaseConfigured());

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && (user.email === ADMIN_EMAIL || user.email?.includes('admin@'))) {
        const staff = mapFirebaseUserToStaff(user);
        setCurrentUser(staff);
        sessionStorage.setItem('dad_admin_session_user', JSON.stringify(staff));
      } else {
        // Fallback to active session storage if available
        const saved = sessionStorage.getItem('dad_admin_session_user');
        if (saved) {
          try {
            setCurrentUser(JSON.parse(saved));
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
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
    _remember = true
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. Validate Username: "DAR AL DAWA" (handles extra spaces, lowercase, etc.)
    const cleanUser = (username || '').trim();
    const normalizedUsername = cleanUser.toLowerCase().replace(/\s+/g, ' ');
    const isTargetUsername =
      normalizedUsername === 'dar al dawa' ||
      normalizedUsername.replace(/\s+/g, '') === 'daraldawa' ||
      normalizedUsername === 'admin' ||
      normalizedUsername === ADMIN_EMAIL;

    // 2. Validate Password: trim trailing spaces that mobile keyboards often add
    const cleanPass = (pass || '').trim();

    // 3. Check lockout
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

    try {
      // Attempt sign in with Firebase Auth
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, cleanPass);
      } catch (authErr: any) {
        // If user not found yet in Firebase project, auto-bootstrap the initial admin user!
        if (
          authErr.code === 'auth/user-not-found' ||
          authErr.code === 'auth/invalid-credential' ||
          authErr.message?.includes('user-not-found')
        ) {
          try {
            userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, cleanPass);
          } catch (createErr) {
            // If creation fails (e.g. user already existed and bad password), throw original
            throw authErr;
          }
        } else {
          throw authErr;
        }
      }

      if (userCredential?.user) {
        clearFailedAttempts();
        const staff = mapFirebaseUserToStaff(userCredential.user);
        setCurrentUser(staff);
        sessionStorage.setItem('dad_admin_session_user', JSON.stringify(staff));
        resetInactivity();
        return { success: true };
      }
    } catch (err: any) {
      console.warn('Firebase Auth sign-in failed:', err);
      const fail = recordFailedAttempt();
      return { success: false, error: fail.error };
    }

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
    if (!user || !user.email) {
      return { success: false, message: 'You must be logged in to change your password.' };
    }

    try {
      // Re-authenticate user before updating password
      const credential = EmailAuthProvider.credential(user.email, oldPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      resetInactivity();
      return { success: true, message: 'Password updated successfully in Firebase Auth ✓' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to update password. Please check your old password.' };
    }
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
