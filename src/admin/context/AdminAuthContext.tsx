import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StaffUser, StaffRole } from '../types';
import { INITIAL_STAFF_USERS } from '../data/sampleAdminData';

interface AdminAuthContextType {
  currentUser: StaffUser | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string, remember: boolean) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: StaffRole) => void;
  updateProfile: (name: string, email: string) => boolean;
  changePassword: (oldPass: string, newPass: string) => { success: boolean; message: string };
  canAccess: (moduleName: string) => boolean;
  inactivityRemainingSeconds: number;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
    const saved = localStorage.getItem('dad_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_STAFF_USERS[0];
      }
    }
    return INITIAL_STAFF_USERS[0]; // Default logged in as Super Admin for instant inspection
  });

  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [inactivityRemainingSeconds, setInactivityRemainingSeconds] = useState<number>(900);

  // Inactivity tracking
  const resetInactivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    const handleUserInteraction = () => resetInactivity();
    window.addEventListener('mousemove', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });
    window.addEventListener('click', handleUserInteraction, { passive: true });

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      const remaining = Math.max(0, Math.floor((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
      setInactivityRemainingSeconds(remaining);

      if (elapsed >= INACTIVITY_TIMEOUT_MS && currentUser) {
        logout();
      }
    }, 5000);

    return () => {
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      clearInterval(interval);
    };
  }, [lastActivity, currentUser]);

  const login = async (email: string, pass: string, remember: boolean): Promise<boolean> => {
    // Find staff user or simulate authentication
    const matched = INITIAL_STAFF_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    const userToSet: StaffUser = matched || {
      id: `user-${Date.now()}`,
      uid: `uid-${Date.now()}`,
      email: email.trim(),
      name: email.split('@')[0],
      role: 'super_admin',
      active: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    setCurrentUser(userToSet);
    if (remember) {
      localStorage.setItem('dad_admin_user', JSON.stringify(userToSet));
    }
    resetInactivity();
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dad_admin_user');
  };

  const switchRole = (role: StaffRole) => {
    const matched = INITIAL_STAFF_USERS.find((u) => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem('dad_admin_user', JSON.stringify(matched));
      resetInactivity();
    }
  };

  const updateProfile = (name: string, email: string): boolean => {
    if (!currentUser) return false;
    const updated = { ...currentUser, name, email };
    setCurrentUser(updated);
    localStorage.setItem('dad_admin_user', JSON.stringify(updated));
    return true;
  };

  const changePassword = (oldPass: string, newPass: string): { success: boolean; message: string } => {
    if (!oldPass || !newPass) {
      return { success: false, message: 'All password fields are required.' };
    }
    if (newPass.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }
    // Save password change to local storage key
    localStorage.setItem('dad_admin_password', newPass);
    return { success: true, message: 'Admin password updated successfully!' };
  };

  /**
   * Role-Based Access Control logic:
   * Super Admin: full access to everything
   * Receptionist: appointments, patients, billing, messages, dashboard
   * Doctor: dashboard, appointments, patients, lab_reports
   * Lab Staff: dashboard, patients, lab_reports
   */
  const canAccess = (moduleName: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;

    switch (moduleName) {
      case 'dashboard':
        return true;
      case 'appointments':
        return ['super_admin', 'receptionist', 'doctor'].includes(currentUser.role);
      case 'patients':
        return true; // all staff can see basic records
      case 'doctors':
        return ['super_admin'].includes(currentUser.role);
      case 'departments':
        return ['super_admin'].includes(currentUser.role);
      case 'services_packages':
        return ['super_admin'].includes(currentUser.role);
      case 'lab_reports':
        return ['super_admin', 'lab_staff', 'doctor'].includes(currentUser.role);
      case 'billing':
        return ['super_admin', 'receptionist'].includes(currentUser.role);
      case 'content':
        return ['super_admin'].includes(currentUser.role);
      case 'messages':
        return ['super_admin', 'receptionist'].includes(currentUser.role);
      case 'users':
        return ['super_admin'].includes(currentUser.role);
      case 'settings':
        return ['super_admin'].includes(currentUser.role);
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
        inactivityRemainingSeconds
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
