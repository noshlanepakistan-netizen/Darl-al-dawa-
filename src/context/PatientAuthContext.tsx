import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc
} from 'firebase/firestore';
import { PatientProfile, PatientAppointment } from '../types/patient';
import { auth, db, isFirebaseConfigured } from '../firebase/config';
import { tagPatientDevice, logoutOneSignal } from '../utils/oneSignal';

interface PatientAuthContextType {
  patient: PatientProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (params: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
    gender: 'Male' | 'Female' | 'Other';
    dateOfBirth?: string;
    city: string;
  }) => Promise<{ success: boolean; error?: string }>;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<PatientProfile>) => Promise<{ success: boolean; error?: string }>;
  myAppointments: PatientAppointment[];
  cancelAppointment: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshAppointments: () => Promise<void>;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

export const PatientAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [myAppointments, setMyAppointments] = useState<PatientAppointment[]>([]);

  // Fetch patient profile from Firestore 'patients' collection
  const fetchPatientProfile = useCallback(async (userId: string, userEmail?: string, userDisplayName?: string) => {
    try {
      const patientRef = doc(db, 'patients', userId);
      const snap = await getDoc(patientRef);

      if (snap.exists()) {
        const data = snap.data();
        if (data.is_blocked || data.isBlocked) {
          await fbSignOut(auth);
          setPatient(null);
          return { blocked: true };
        }

        const profile: PatientProfile = {
          id: snap.id,
          email: data.email || userEmail || '',
          fullName: data.full_name || data.name || data.fullName || userDisplayName || '',
          phone: data.phone || '',
          gender: data.gender || 'Male',
          dateOfBirth: data.date_of_birth || data.dateOfBirth || undefined,
          city: data.city || data.address || 'Lahore',
          isBlocked: data.is_blocked || data.isBlocked || false,
          createdAt: data.created_at || data.createdAt || new Date().toISOString()
        };
        setPatient(profile);
        tagPatientDevice(profile.id, profile.email);
        return { profile };
      } else if (userEmail && userEmail !== 'admin@daraldawa.com') {
        // Automatically create patient record in Firestore 'patients' collection for new Google or authenticated users
        const cleanName = userDisplayName || userEmail.split('@')[0] || 'Patient';
        const newPatientDoc = {
          id: userId,
          email: userEmail,
          fullName: cleanName,
          name: cleanName,
          phone: '',
          gender: 'Male',
          city: 'Lahore',
          address: 'Lahore',
          isBlocked: false,
          createdAt: new Date().toISOString()
        };
        await setDoc(patientRef, newPatientDoc);

        // Add welcome notification
        try {
          const notifsRef = collection(db, 'notifications');
          await addDoc(notifsRef, {
            userId,
            role: 'patient',
            title: 'Welcome to Dar al Dawa Medical Center',
            message: `Hello ${cleanName}, your patient portal is now active. You can manage your appointments and view reports online.`,
            type: 'patient_registered',
            read: false,
            createdAt: new Date().toISOString()
          });

          await addDoc(notifsRef, {
            userId: 'admin',
            role: 'admin',
            title: 'New Patient Registration (Google)',
            message: `${cleanName} (${userEmail || 'Google User'}) registered a new patient account via Google Login.`,
            type: 'patient_registered',
            read: false,
            createdAt: new Date().toISOString()
          });
        } catch {
          // ignore
        }

        const profile: PatientProfile = {
          id: userId,
          email: userEmail,
          fullName: cleanName,
          phone: '',
          gender: 'Male',
          city: 'Lahore',
          isBlocked: false,
          createdAt: newPatientDoc.createdAt
        };
        setPatient(profile);
        tagPatientDevice(profile.id, profile.email);
        return { profile };
      }
    } catch (err) {
      console.error('Failed to load patient record from Firestore:', err);
    }
    return { profile: null };
  }, []);

  // Sync auth state with Firebase Auth on mount
  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser && firebaseUser.email !== 'admin@daraldawa.com') {
          await fetchPatientProfile(firebaseUser.uid, firebaseUser.email || undefined, firebaseUser.displayName || undefined);
        } else if (!firebaseUser) {
          setPatient(null);
          setMyAppointments([]);
        }
      } catch (err) {
        console.warn('Patient auth state change warning:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [fetchPatientProfile]);

  // Real-time listener for patient's appointments from Firestore
  useEffect(() => {
    if (!patient?.id && !patient?.phone) {
      setMyAppointments([]);
      return;
    }

    try {
      const apptsRef = collection(db, 'appointments');
      // Set up real-time listener filtering by patientId or phone
      let q = query(apptsRef, orderBy('createdAt', 'desc'));
      if (patient.id) {
        q = query(apptsRef, where('patientId', '==', patient.id));
      }

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: PatientAppointment[] = [];
          snapshot.forEach((docSnap) => {
            const a = docSnap.data();
            list.push({
              id: docSnap.id,
              token: a.token || a.id || docSnap.id.substring(0, 6).toUpperCase(),
              patientId: a.patientId || a.patient_id,
              patientName: a.patientName || a.patient_name || a.name || '',
              phone: a.phone || '',
              cnic: a.cnic,
              departmentId: a.departmentId || a.department_id || '',
              doctorId: a.doctorId || a.doctor_id || '',
              appointmentDate: a.appointmentDate || a.appointment_date || a.date || '',
              timeSlot: a.timeSlot || a.time_slot || a.time || '',
              patientType: a.patientType || a.patient_type || 'new',
              notes: a.notes,
              status: (a.status as any) || 'pending',
              createdAt: a.createdAt || a.created_at || new Date().toISOString()
            });
          });
          setMyAppointments(list);
        },
        (error) => {
          console.warn('Error listening to patient appointments:', error);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Could not subscribe to patient appointments:', err);
    }
  }, [patient?.id, patient?.phone]);

  // Sign Up
  const signUp = async (params: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
    gender: 'Male' | 'Female' | 'Other';
    dateOfBirth?: string;
    city: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseConfigured()) {
      return { success: false, error: 'Database is not connected.' };
    }

    const cleanPhone = params.phone.replace(/\D/g, '');
    let cleanEmail = (params.email || '').trim().toLowerCase();

    // If no email was provided or invalid, map to virtual patient email using phone number
    if (!cleanEmail || !cleanEmail.includes('@')) {
      cleanEmail = `${cleanPhone || 'patient' + Date.now()}@daraldawa.patient`;
    }

    if (cleanEmail === 'admin@daraldawa.com') {
      return { success: false, error: 'This email is reserved for hospital administration.' };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
      const uid = userCredential.user.uid;

      // Upsert into Firestore 'patients' collection
      const profileDoc = {
        id: uid,
        email: cleanEmail,
        fullName: params.fullName.trim(),
        name: params.fullName.trim(),
        phone: params.phone.trim(),
        gender: params.gender,
        dateOfBirth: params.dateOfBirth || null,
        city: params.city.trim(),
        address: params.city.trim(),
        isBlocked: false,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'patients', uid), profileDoc);

      // Create initial notifications in Firestore
      try {
        const notifsRef = collection(db, 'notifications');
        await addDoc(notifsRef, {
          userId: uid,
          role: 'patient',
          title: 'Welcome to Dar al Dawa Medical Center',
          message: `Hello ${params.fullName}, your patient portal is now active. You can manage your appointments and view reports online.`,
          type: 'patient_registered',
          read: false,
          createdAt: new Date().toISOString()
        });

        await addDoc(notifsRef, {
          userId: 'admin',
          role: 'admin',
          title: 'New Patient Registration',
          message: `${params.fullName} (${params.phone}) registered a new patient account from ${params.city}.`,
          type: 'patient_registered',
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Failed to insert initial notification:', err);
      }

      const newProfile: PatientProfile = {
        id: uid,
        email: cleanEmail,
        fullName: params.fullName.trim(),
        phone: params.phone.trim(),
        gender: params.gender,
        dateOfBirth: params.dateOfBirth,
        city: params.city.trim(),
        isBlocked: false,
        createdAt: profileDoc.createdAt
      };

      setPatient(newProfile);
      tagPatientDevice(uid, cleanEmail);
      return { success: true };
    } catch (err: any) {
      let message = err.message || 'Registration failed';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please log in.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      }
      return { success: false, error: message };
    }
  };

  // Login
  const login = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    let clean = identifier.trim().toLowerCase();

    if (clean === 'admin@daraldawa.com') {
      return {
        success: false,
        error: 'Administrator accounts must sign in via the Staff Admin Portal.'
      };
    }

    // Convert phone number to virtual email if no '@' present
    if (!clean.includes('@')) {
      const digits = clean.replace(/\D/g, '');
      if (digits.length < 9) {
        return {
          success: false,
          error: 'Please enter a valid mobile number or email address.'
        };
      }
      clean = `${digits}@daraldawa.patient`;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, clean, pass);
      const user = userCredential.user;

      const res = await fetchPatientProfile(user.uid, user.email || undefined);
      if (res?.blocked) {
        return {
          success: false,
          error: 'Your patient account has been suspended by hospital administration. Please contact reception.'
        };
      }

      return { success: true };
    } catch (err: any) {
      let message = err.message || 'Login failed';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid mobile number/email or password.';
      }
      return { success: false, error: message };
    }
  };

  // Google Sign In / Sign Up
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isFirebaseConfigured()) {
      return { success: false, error: 'Database is not connected.' };
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      if (user.email === 'admin@daraldawa.com') {
        await fbSignOut(auth);
        return {
          success: false,
          error: 'Administrator accounts must sign in via the Staff Admin Portal.'
        };
      }

      const res = await fetchPatientProfile(
        user.uid,
        user.email || undefined,
        user.displayName || undefined
      );

      if (res?.blocked) {
        return {
          success: false,
          error: 'Your patient account has been suspended by hospital administration. Please contact reception.'
        };
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      let message = err.message || 'Google sign-in failed.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in popup was closed before completing.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = 'Only one sign-in window at a time is allowed.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Popup was blocked by your browser. Please allow popups for this site.';
      } else if (err.code === 'auth/unauthorized-domain' || err.message?.includes('unauthorized-domain')) {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'Netlify';
        message = `UNAUTHORIZED_DOMAIN:${host}`;
      }
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      logoutOneSignal();
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    setPatient(null);
    setMyAppointments([]);
  };

  // Forgot password
  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return {
        success: true,
        message: 'Password reset link sent! Please check your email inbox.'
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to send reset link.' };
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<PatientProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!patient) return { success: false, error: 'Not authenticated' };

    try {
      const patientRef = doc(db, 'patients', patient.id);
      const payload: any = {
        fullName: updates.fullName !== undefined ? updates.fullName : patient.fullName,
        name: updates.fullName !== undefined ? updates.fullName : patient.fullName,
        phone: updates.phone !== undefined ? updates.phone : patient.phone,
        gender: updates.gender !== undefined ? updates.gender : patient.gender,
        dateOfBirth: updates.dateOfBirth !== undefined ? updates.dateOfBirth : patient.dateOfBirth,
        city: updates.city !== undefined ? updates.city : patient.city,
        address: updates.city !== undefined ? updates.city : patient.city,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(patientRef, payload);

      const updated = { ...patient, ...updates };
      setPatient(updated);

      // Notify admin of profile update
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: 'admin',
          role: 'admin',
          title: 'Patient Profile Updated',
          message: `${updated.fullName} (${updated.phone}) updated their medical contact profile.`,
          type: 'system',
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch {
        // ignore
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Profile update failed' };
    }
  };

  // Cancel pending appointment
  const cancelAppointment = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const target = myAppointments.find((a) => a.id === id);
      if (!target) return { success: false, error: 'Appointment not found.' };

      if (target.status !== 'pending') {
        return { success: false, error: 'Only pending appointments can be cancelled online.' };
      }

      const apptRef = doc(db, 'appointments', id);
      await updateDoc(apptRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setMyAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
      );

      // Add notifications
      try {
        const notifsRef = collection(db, 'notifications');
        await addDoc(notifsRef, {
          userId: patient?.id,
          role: 'patient',
          title: 'Appointment Cancelled',
          message: `Your appointment token ${target.token} for ${target.appointmentDate} has been cancelled.`,
          type: 'appointment_status',
          read: false,
          createdAt: new Date().toISOString()
        });

        await addDoc(notifsRef, {
          userId: 'admin',
          role: 'admin',
          title: 'Appointment Cancelled by Patient',
          message: `Patient ${target.patientName} (${target.phone}) cancelled token ${target.token}.`,
          type: 'appointment_status',
          read: false,
          createdAt: new Date().toISOString()
        });
      } catch {
        // ignore
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Cancellation failed.' };
    }
  };

  const refreshAppointments = async () => {
    // onSnapshot keeps it automatically up to date
  };

  return (
    <PatientAuthContext.Provider
      value={{
        patient,
        isAuthenticated: !!patient,
        isLoading,
        signUp,
        login,
        loginWithGoogle,
        logout,
        forgotPassword,
        updateProfile,
        myAppointments,
        cancelAppointment,
        refreshAppointments
      }}
    >
      {children}
    </PatientAuthContext.Provider>
  );
};

export const usePatientAuth = () => {
  const context = useContext(PatientAuthContext);
  if (!context) {
    throw new Error('usePatientAuth must be used within PatientAuthProvider');
  }
  return context;
};
