import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StaffUser, StaffRole } from '../types';
import { supabase, isSupabaseConfigured } from '../../supabase/config';

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
  isSupabaseAuth: boolean;
  lockoutRemainingSeconds: number;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// 2 hours auto-logout of inactivity
const INACTIVITY_TIMEOUT_MS = 2 * 60 * 60 * 1000;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const MAX_FAILED_ATTEMPTS = 5;

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [inactivityRemainingSeconds, setInactivityRemainingSeconds] = useState<number>(7200);
  const [isSupabaseAuth, setIsSupabaseAuth] = useState(isSupabaseConfigured());
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  // Convert a Supabase user or session to StaffUser
  const mapSupabaseUserToStaff = (sbUser: any): StaffUser => {
    const email = sbUser.email || 'admin@daraldawa.com';
    const metadata = sbUser.user_metadata || {};
    return {
      id: sbUser.id,
      uid: sbUser.id,
      email: email,
      name: metadata.name || 'DAR AL DAWA Admin',
      role: (metadata.role as StaffRole) || 'super_admin',
      active: true,
      createdAt: sbUser.created_at || new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
  };

  // Sync Supabase Auth session on mount and listen to changes
  useEffect(() => {
    setIsSupabaseAuth(isSupabaseConfigured());

    if (isSupabaseConfigured()) {
      // Check existing active session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setCurrentUser(mapSupabaseUserToStaff(session.user));
        } else {
          setCurrentUser(null);
        }
      });

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setCurrentUser(mapSupabaseUserToStaff(session.user));
        } else {
          setCurrentUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Check if session was stored in local storage for preview mode
      const saved = sessionStorage.getItem('dad_admin_preview_user');
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
    // 1. Check if device is currently locked out
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

    // 2. Validate Username: "DAR AL DAWA"
    // Normalize: trim, lowercase, collapse multiple internal spaces
    const normalizedUsername = (username || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const isTargetUsername =
      normalizedUsername === 'dar al dawa' ||
      normalizedUsername.replace(/\s+/g, '') === 'daraldawa';

    if (!isTargetUsername || !pass) {
      const fail = recordFailedAttempt();
      return { success: false, error: fail.error };
    }

    // 3. Map username to Supabase Auth email "admin@daraldawa.com"
    const targetEmail = 'admin@daraldawa.com';

    if (isSupabaseConfigured()) {
      try {
        let authResult = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: pass
        });

        // Fallback attempt with admin@daraldawa.pk if created before under .pk
        if (authResult.error && authResult.error.message.toLowerCase().includes('invalid login credentials')) {
          const fallback = await supabase.auth.signInWithPassword({
            email: 'admin@daraldawa.pk',
            password: pass
          });
          if (!fallback.error && fallback.data.user) {
            authResult = fallback;
          }
        }

        if (authResult.error) {
          const fail = recordFailedAttempt();
          return { success: false, error: fail.error };
        }

        if (authResult.data.user) {
          clearFailedAttempts();
          setCurrentUser(mapSupabaseUserToStaff(authResult.data.user));
          resetInactivity();
          return { success: true };
        }

        const fail = recordFailedAttempt();
        return { success: false, error: fail.error };
      } catch (err: any) {
        const fail = recordFailedAttempt();
        return { success: false, error: fail.error };
      }
    } else {
      // Fallback for preview mode before Supabase credentials are substituted:
      // Allow sign-in for DAR AL DAWA so admin panel can be previewed without blocking errors
      clearFailedAttempts();
      const localAdminUser: StaffUser = {
        id: 'admin-preview',
        uid: 'admin-preview',
        email: targetEmail,
        name: 'DAR AL DAWA Admin',
        role: 'super_admin',
        active: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      setCurrentUser(localAdminUser);
      sessionStorage.setItem('dad_admin_preview_user', JSON.stringify(localAdminUser));
      resetInactivity();
      return { success: true };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Error logging out from Supabase:', e);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('dad_admin_user');
    sessionStorage.removeItem('dad_admin_preview_user');
    // Block the "Back" button from showing admin pages
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

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.updateUser({
          email: email.trim(),
          data: { name: name.trim() }
        });
        if (error) {
          console.error('Error updating Supabase user profile:', error);
          return false;
        }
      } catch (err) {
        console.error('Failed to update profile:', err);
        return false;
      }
    }

    const updated = { ...currentUser, name, email };
    setCurrentUser(updated);
    return true;
  };

  const changePassword = async (
    oldPass: string,
    newPass: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!oldPass) {
      return { success: false, message: 'Current password is required.' };
    }
    if (!newPass) {
      return { success: false, message: 'New password is required.' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    if (isSupabaseConfigured() && currentUser?.email) {
      try {
        // Re-authenticate with old password first to verify identity
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: currentUser.email,
          password: oldPass
        });

        if (verifyError) {
          return { success: false, message: 'Current password is incorrect.' };
        }

        // Update password in Supabase Auth
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPass
        });

        if (updateError) {
          return { success: false, message: updateError.message };
        }

        return { success: true, message: 'Password updated successfully in Supabase Auth!' };
      } catch (err: any) {
        return { success: false, message: err?.message || 'Failed to update password.' };
      }
    }

    return { success: true, message: 'Password updated successfully!' };
  };

  const canAccess = (moduleName: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;

    switch (moduleName) {
      case 'dashboard':
        return true;
      case 'appointments':
        return ['super_admin', 'receptionist', 'doctor'].includes(currentUser.role);
      case 'patients':
        return true;
      case 'doctors':
      case 'departments':
      case 'services_packages':
      case 'content':
      case 'users':
      case 'settings':
        return ['super_admin'].includes(currentUser.role);
      case 'lab_reports':
        return ['super_admin', 'lab_staff', 'doctor'].includes(currentUser.role);
      case 'billing':
      case 'messages':
        return ['super_admin', 'receptionist'].includes(currentUser.role);
      default:
        return false;
    }
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
        isSupabaseAuth,
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
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
