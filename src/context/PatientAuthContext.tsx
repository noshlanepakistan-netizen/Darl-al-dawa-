import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PatientProfile, PatientAppointment } from '../types/patient';
import { supabase, isSupabaseConfigured } from '../supabase/config';
import { tagPatientDevice, logoutOneSignal } from '../utils/oneSignal';

interface PatientAuthContextType {
  patient: PatientProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (params: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    gender: 'Male' | 'Female' | 'Other';
    dateOfBirth?: string;
    city: string;
  }) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
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

  // Fetch patient profile from 'patients' table
  const fetchPatientProfile = useCallback(async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching patient profile:', error);
      }

      if (data) {
        if (data.is_blocked) {
          await supabase.auth.signOut();
          setPatient(null);
          return { blocked: true };
        }

        const profile: PatientProfile = {
          id: data.id,
          email: data.email || userEmail || '',
          fullName: data.full_name || data.name || '',
          phone: data.phone || '',
          gender: data.gender || 'Male',
          dateOfBirth: data.date_of_birth || undefined,
          city: data.city || data.address || 'Lahore',
          isBlocked: data.is_blocked || false,
          createdAt: data.created_at || new Date().toISOString()
        };
        setPatient(profile);
        tagPatientDevice(profile.id, profile.email);
        return { profile };
      } else if (userEmail && userEmail !== 'admin@daraldawa.com') {
        // Fallback: If auth user exists but patient row was not yet created
        const tempProfile: PatientProfile = {
          id: userId,
          email: userEmail,
          fullName: userEmail.split('@')[0],
          phone: '',
          gender: 'Male',
          city: 'Lahore',
          createdAt: new Date().toISOString()
        };
        setPatient(tempProfile);
        return { profile: tempProfile };
      }
    } catch (err) {
      console.error('Failed to load patient record:', err);
    }
    return { profile: null };
  }, []);

  // Fetch appointments for this patient
  const fetchMyAppointments = useCallback(async () => {
    if (!patient?.id && !patient?.phone) return;

    try {
      let query = supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false });

      if (patient.id) {
        query = query.or(`patient_id.eq.${patient.id},phone.eq.${patient.phone}`);
      } else {
        query = query.eq('phone', patient.phone);
      }

      const { data, error } = await query;
      if (!error && data) {
        setMyAppointments(
          data.map((a: any) => ({
            id: a.id,
            token: a.token,
            patientId: a.patient_id,
            patientName: a.patient_name,
            phone: a.phone,
            cnic: a.cnic,
            departmentId: a.department_id,
            doctorId: a.doctor_id,
            appointmentDate: a.appointment_date,
            timeSlot: a.time_slot,
            patientType: a.patient_type || 'new',
            notes: a.notes,
            status: a.status,
            createdAt: a.created_at
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to fetch patient appointments:', err);
    }
  }, [patient]);

  // Sync auth state on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && session.user.email !== 'admin@daraldawa.com') {
          // If session is a patient, fetch their profile
          await fetchPatientProfile(session.user.id, session.user.email);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && session.user.email !== 'admin@daraldawa.com') {
        await fetchPatientProfile(session.user.id, session.user.email);
      } else if (!session) {
        setPatient(null);
        setMyAppointments([]);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchPatientProfile]);

  // Load appointments whenever patient profile is active
  useEffect(() => {
    if (patient) {
      fetchMyAppointments();
    }
  }, [patient, fetchMyAppointments]);

  // Real-time listener for patient's appointments
  useEffect(() => {
    if (!patient?.id) return;

    const channel = supabase
      .channel(`patient_appts:${patient.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          fetchMyAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patient?.id, fetchMyAppointments]);

  // Sign Up
  const signUp = async (params: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    gender: 'Male' | 'Female' | 'Other';
    dateOfBirth?: string;
    city: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Database is not connected.' };
    }

    const cleanEmail = params.email.trim().toLowerCase();
    if (cleanEmail === 'admin@daraldawa.com') {
      return { success: false, error: 'This email is reserved for hospital administration.' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: {
            full_name: params.fullName.trim(),
            phone: params.phone.trim(),
            gender: params.gender,
            city: params.city.trim()
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      const uid = authData.user?.id;
      if (!uid) {
        return { success: false, error: 'Unable to create user account. Please try again.' };
      }

      // Upsert into patients table
      const profileRow = {
        id: uid,
        email: cleanEmail,
        full_name: params.fullName.trim(),
        name: params.fullName.trim(),
        phone: params.phone.trim(),
        gender: params.gender,
        date_of_birth: params.dateOfBirth || null,
        city: params.city.trim(),
        address: params.city.trim(),
        is_blocked: false,
        created_at: new Date().toISOString()
      };

      const { error: profileError } = await supabase
        .from('patients')
        .upsert(profileRow);

      if (profileError) {
        console.warn('Profile table insert warning:', profileError);
      }

      // Create initial notification for hospital admin and patient
      try {
        await supabase.from('notifications').insert([
          {
            user_id: uid,
            role: 'patient',
            title: 'Welcome to Dar al Dawa Medical Center',
            message: `Hello ${params.fullName}, your patient portal is now active. You can manage your appointments and view reports online.`,
            type: 'patient_registered',
            read: false,
            created_at: new Date().toISOString()
          },
          {
            user_id: 'admin',
            role: 'admin',
            title: 'New Patient Registration',
            message: `${params.fullName} (${params.phone}) registered a new patient account from ${params.city}.`,
            type: 'patient_registered',
            read: false,
            created_at: new Date().toISOString()
          }
        ]);
      } catch {
        // ignore
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
        createdAt: profileRow.created_at
      };

      setPatient(newProfile);
      tagPatientDevice(uid, cleanEmail);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  // Login
  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    if (cleanEmail === 'admin@daraldawa.com') {
      return {
        success: false,
        error: 'Administrator accounts must sign in via the Staff Admin Portal.'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Invalid email or password.' };
      }

      const res = await fetchPatientProfile(data.user.id, data.user.email);
      if (res?.blocked) {
        return {
          success: false,
          error: 'Your patient account has been suspended by hospital administration. Please contact reception.'
        };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  // Logout
  const logout = async () => {
    try {
      logoutOneSignal();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setPatient(null);
    setMyAppointments([]);
  };

  // Forgot password
  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/#reset-password`
      });
      if (error) {
        return { success: false, message: error.message };
      }
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
      const payload: any = {
        full_name: updates.fullName !== undefined ? updates.fullName : patient.fullName,
        name: updates.fullName !== undefined ? updates.fullName : patient.fullName,
        phone: updates.phone !== undefined ? updates.phone : patient.phone,
        gender: updates.gender !== undefined ? updates.gender : patient.gender,
        date_of_birth: updates.dateOfBirth !== undefined ? updates.dateOfBirth : patient.dateOfBirth,
        city: updates.city !== undefined ? updates.city : patient.city,
        address: updates.city !== undefined ? updates.city : patient.city,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('patients')
        .update(payload)
        .eq('id', patient.id);

      if (error) {
        return { success: false, error: error.message };
      }

      const updated = { ...patient, ...updates };
      setPatient(updated);

      // Notify admin of profile update
      try {
        await supabase.from('notifications').insert({
          user_id: 'admin',
          role: 'admin',
          title: 'Patient Profile Updated',
          message: `${updated.fullName} (${updated.phone}) updated their medical contact profile.`,
          type: 'system',
          read: false,
          created_at: new Date().toISOString()
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

      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local state
      setMyAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
      );

      // Add notifications
      try {
        await supabase.from('notifications').insert([
          {
            user_id: patient?.id,
            role: 'patient',
            title: 'Appointment Cancelled',
            message: `Your appointment token ${target.token} for ${target.appointmentDate} has been cancelled.`,
            type: 'appointment_status',
            read: false,
            created_at: new Date().toISOString()
          },
          {
            user_id: 'admin',
            role: 'admin',
            title: 'Appointment Cancelled by Patient',
            message: `Patient ${target.patientName} (${target.phone}) cancelled token ${target.token}.`,
            type: 'appointment_status',
            read: false,
            created_at: new Date().toISOString()
          }
        ]);
      } catch {
        // ignore
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Cancellation failed.' };
    }
  };

  return (
    <PatientAuthContext.Provider
      value={{
        patient,
        isAuthenticated: !!patient,
        isLoading,
        signUp,
        login,
        logout,
        forgotPassword,
        updateProfile,
        myAppointments,
        cancelAppointment,
        refreshAppointments: fetchMyAppointments
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
