import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { PatientProfile, PatientAppointment } from '../../types/patient';
import { usePatientAuth } from '../../context/PatientAuthContext';
import { useAdminData } from '../../admin/context/AdminDataContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  X,
  User,
  CalendarCheck,
  Calendar,
  FileCheck2,
  Bell,
  LogOut,
  Clock,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  Building,
  Edit2,
  Save,
  MessageSquare,
  RefreshCw,
  History,
  CalendarDays,
  Filter,
  CheckCircle,
  XCircle,
  CheckCheck
} from 'lucide-react';
import { formatWhatsAppLink, triggerWhatsApp } from '../../utils/phoneUtils';
import { playNotificationChime } from '../../utils/audioChime';

interface PatientDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ur';
  onNavigateToBooking?: () => void;
}

export const PatientDashboardModal: React.FC<PatientDashboardModalProps> = ({
  isOpen,
  onClose,
  lang,
  onNavigateToBooking
}) => {
  const { patient, logout, myAppointments, addPatientAppointment, cancelAppointment, updateProfile, deleteAccount } = usePatientAuth();
  const { departments, doctors, labReports, hospitalConfig, addAppointment } = useAdminData();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const isUrdu = lang === 'ur';

  // Live Fetched Patient Profile State directly from Firestore database
  const [liveProfile, setLiveProfile] = useState<PatientProfile | null>(patient);
  const [isFetchingProfile, setIsFetchingProfile] = useState<boolean>(false);

  // Active Tab: Default to 'history'
  const [activeTab, setActiveTab] = useState<'history' | 'appointments' | 'book' | 'reports' | 'notifications' | 'profile'>('history');

  // Appointment History State, Live Fetching & Interactive Filters
  const [firestoreAppointments, setFirestoreAppointments] = useState<PatientAppointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState<boolean>(false);
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'upcoming' | 'past' | 'pending' | 'confirmed' | 'cancelled'>('all');

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(patient?.fullName || '');
  const [profilePhone, setProfilePhone] = useState(patient?.phone || '');
  const [profileGender, setProfileGender] = useState<'Male' | 'Female' | 'Other'>(patient?.gender || 'Male');
  const [profileDob, setProfileDob] = useState(patient?.dateOfBirth || '');
  const [profileCity, setProfileCity] = useState(patient?.city || 'Lahore');
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);

  // Quick In-Dashboard Booking State
  const [bookDeptId, setBookDeptId] = useState(departments[0]?.id || 'cardiology');
  const [bookDoctorId, setBookDoctorId] = useState('');
  const [bookDate, setBookDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookSlot, setBookSlot] = useState('evening');
  const [bookNotes, setBookNotes] = useState('');
  const [bookPhone, setBookPhone] = useState(patient?.phone || '');
  const [bookSuccessToken, setBookSuccessToken] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Automatically fetch logged-in user profile details from Firestore on modal open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchLatestProfile = async () => {
      const activeUid = auth.currentUser?.uid || patient?.id;
      if (!activeUid) {
        if (patient && isMounted) setLiveProfile(patient);
        return;
      }

      setIsFetchingProfile(true);
      try {
        const patientDocRef = doc(db, 'patients', activeUid);
        const snap = await getDoc(patientDocRef);

        if (snap.exists() && isMounted) {
          const data = snap.data();
          const cleanEmail = (
            data.email ||
            auth.currentUser?.email ||
            patient?.email ||
            ''
          ).toString().trim();

          const cleanName = (
            data.fullName ||
            data.name ||
            data.full_name ||
            auth.currentUser?.displayName ||
            patient?.fullName ||
            'Patient'
          ).toString().trim();

          const cleanPhone = (
            data.phone ||
            data.mobile ||
            data.phoneNumber ||
            patient?.phone ||
            ''
          ).toString().trim();

          const loadedProfile: PatientProfile = {
            id: snap.id,
            email: cleanEmail,
            fullName: cleanName,
            phone: cleanPhone,
            gender: data.gender || patient?.gender || 'Male',
            dateOfBirth: data.date_of_birth || data.dateOfBirth || patient?.dateOfBirth,
            city: data.city || data.address || patient?.city || 'Lahore',
            isBlocked: data.is_blocked || data.isBlocked || false,
            createdAt: data.created_at || data.createdAt || patient?.createdAt || new Date().toISOString()
          };

          setLiveProfile(loadedProfile);
          if (!isEditingProfile) {
            setProfileName(cleanName);
            setProfilePhone(cleanPhone);
            setProfileGender(loadedProfile.gender);
            if (loadedProfile.dateOfBirth) setProfileDob(loadedProfile.dateOfBirth);
            if (loadedProfile.city) setProfileCity(loadedProfile.city);
          }
        } else if (isMounted) {
          // If Firestore doc doesn't exist yet, derive from auth.currentUser or patient state
          const fallback: PatientProfile = {
            id: activeUid,
            email: auth.currentUser?.email || patient?.email || '',
            fullName: auth.currentUser?.displayName || patient?.fullName || 'Patient',
            phone: patient?.phone || '',
            gender: patient?.gender || 'Male',
            city: patient?.city || 'Lahore',
            createdAt: patient?.createdAt || new Date().toISOString()
          };
          setLiveProfile(fallback);
        }
      } catch (err) {
        console.warn('Failed to fetch patient profile from Firestore:', err);
      } finally {
        if (isMounted) setIsFetchingProfile(false);
      }
    };

    fetchLatestProfile();

    return () => {
      isMounted = false;
    };
  }, [isOpen, patient?.id]);

  useEffect(() => {
    const activePhone = liveProfile?.phone || patient?.phone;
    if (activePhone && !bookPhone) {
      setBookPhone(activePhone);
    }
  }, [liveProfile?.phone, patient?.phone]);

  // Fetch user's appointments directly from Firestore
  const fetchAppointmentsFromFirestore = useCallback(async () => {
    const activeUid = auth.currentUser?.uid || liveProfile?.id || patient?.id;
    const activePhone = liveProfile?.phone || patient?.phone;
    const activeEmail = liveProfile?.email || patient?.email;
    const activeName = (liveProfile?.fullName || patient?.fullName || '').toLowerCase().trim();

    if (!activeUid && !activePhone && !activeEmail) return;

    setIsLoadingAppointments(true);
    try {
      const apptsRef = collection(db, 'appointments');
      const snap = await getDocs(apptsRef);
      const list: PatientAppointment[] = [];

      const normUserPhone = activePhone ? activePhone.replace(/\D/g, '').slice(-10) : '';
      const normUserEmail = (activeEmail || '').toLowerCase().trim();
      const bookedTokens: string[] = (() => {
        try {
          return JSON.parse(localStorage.getItem('dad_booked_tokens') || '[]');
        } catch {
          return [];
        }
      })();

      snap.forEach((docSnap) => {
        const a = docSnap.data();
        const appToken = (a.token || `DAD-${docSnap.id.slice(-6).toUpperCase()}`).toString().trim();
        const appPatientId = (a.patientId || a.patient_id || '').toString().trim();
        const rawPhone = (a.phone || a.mobile || a.phoneNumber || a.phone_number || '').toString().trim();
        const normAppPhone = rawPhone ? rawPhone.replace(/\D/g, '').slice(-10) : '';
        const appEmail = (a.email || '').toString().trim().toLowerCase();
        const appPatientName = (a.patientName || a.patient_name || a.name || a.fullName || '').toString().trim().toLowerCase();

        const isMatch =
          (activeUid && appPatientId && activeUid === appPatientId) ||
          (normUserPhone && normAppPhone && normUserPhone === normAppPhone) ||
          (normUserEmail && appEmail && normUserEmail === appEmail) ||
          (appToken && bookedTokens.includes(appToken)) ||
          (activeName && appPatientName && activeName === appPatientName);

        if (isMatch) {
          list.push({
            id: docSnap.id,
            token: appToken,
            patientId: appPatientId || activeUid,
            patientName: (a.patientName || a.patient_name || a.name || liveProfile?.fullName || 'Patient').toString().trim(),
            phone: (rawPhone || activePhone || '').toString().trim(),
            cnic: a.cnic,
            departmentId: (a.departmentId || a.department_id || '').toString(),
            doctorId: (a.doctorId || a.doctor_id || '').toString(),
            appointmentDate: (a.appointmentDate || a.appointment_date || a.date || '').toString(),
            timeSlot: (a.timeSlot || a.time_slot || a.time || 'morning').toString(),
            patientType: (a.patientType || a.patient_type || 'new') as 'new' | 'followup',
            notes: a.notes,
            status: (a.status as any) || 'pending',
            createdAt: (a.createdAt || a.created_at || new Date().toISOString()).toString()
          });
        }
      });

      list.sort((x, y) => {
        const dX = new Date(x.appointmentDate || x.createdAt).getTime();
        const dY = new Date(y.appointmentDate || y.createdAt).getTime();
        return dY - dX;
      });

      setFirestoreAppointments(list);
    } catch (err) {
      console.warn('Error fetching appointments history from Firestore:', err);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [liveProfile?.id, liveProfile?.phone, liveProfile?.email, liveProfile?.fullName, patient?.id, patient?.phone, patient?.email, patient?.fullName]);

  // Sync on modal open & subscribe to live appointment status updates
  useEffect(() => {
    if (!isOpen) return;
    fetchAppointmentsFromFirestore();

    try {
      const unsubscribe = onSnapshot(collection(db, 'appointments'), () => {
        fetchAppointmentsFromFirestore();
      });
      return () => unsubscribe();
    } catch {
      // ignore
    }
  }, [isOpen, fetchAppointmentsFromFirestore]);

  const currentPatient = liveProfile || patient || (auth.currentUser ? {
    id: auth.currentUser.uid,
    email: auth.currentUser.email || '',
    fullName: auth.currentUser.displayName || 'Patient',
    phone: '',
    gender: 'Male' as const,
    city: 'Lahore',
    createdAt: new Date().toISOString()
  } : null);

  // Helper date comparisons for upcoming vs past appointments
  const todayStr = new Date().toISOString().split('T')[0];

  const isUpcoming = (appt: PatientAppointment) => {
    const d = appt.appointmentDate || appt.createdAt.split('T')[0];
    return d >= todayStr && appt.status !== 'cancelled' && appt.status !== 'completed';
  };

  const isPast = (appt: PatientAppointment) => {
    const d = appt.appointmentDate || appt.createdAt.split('T')[0];
    return d < todayStr || appt.status === 'completed' || appt.status === 'cancelled';
  };

  // Combine Firestore query results + local state appointments
  const combinedAppointments = (() => {
    const map = new Map<string, PatientAppointment>();
    firestoreAppointments.forEach((a) => map.set(a.token || a.id, a));
    myAppointments.forEach((a) => {
      const key = a.token || a.id;
      if (!map.has(key)) map.set(key, a);
    });
    const list = Array.from(map.values());
    list.sort((x, y) => {
      const dX = new Date(x.appointmentDate || x.createdAt).getTime();
      const dY = new Date(y.appointmentDate || y.createdAt).getTime();
      return dY - dX;
    });
    return list;
  })();

  const upcomingCount = combinedAppointments.filter(isUpcoming).length;
  const pastCount = combinedAppointments.filter(isPast).length;
  const pendingCount = combinedAppointments.filter((a) => a.status === 'pending').length;
  const confirmedCount = combinedAppointments.filter((a) => a.status === 'confirmed').length;
  const cancelledCount = combinedAppointments.filter((a) => a.status === 'cancelled').length;

  const filteredAppointments = combinedAppointments.filter((a) => {
    if (appointmentFilter === 'upcoming') return isUpcoming(a);
    if (appointmentFilter === 'past') return isPast(a);
    if (appointmentFilter === 'pending') return a.status === 'pending';
    if (appointmentFilter === 'confirmed') return a.status === 'confirmed';
    if (appointmentFilter === 'cancelled') return a.status === 'cancelled';
    return true;
  });

  if (!isOpen || !currentPatient) return null;

  // Patient's lab reports matched by phone
  const patientLabReports = labReports.filter(
    (r) => r.patientPhone && currentPatient.phone && (
      r.patientPhone.replace(/\D/g, '') === currentPatient.phone.replace(/\D/g, '') ||
      r.patientPhone.includes(currentPatient.phone) ||
      currentPatient.phone.includes(r.patientPhone)
    )
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFeedback(null);
    const res = await updateProfile({
      fullName: profileName.trim(),
      phone: profilePhone.trim(),
      gender: profileGender,
      dateOfBirth: profileDob || undefined,
      city: profileCity.trim()
    });

    if (res.success) {
      setProfileFeedback('Profile details updated successfully!');
      setIsEditingProfile(false);
      setLiveProfile((prev) => prev ? {
        ...prev,
        fullName: profileName.trim(),
        phone: profilePhone.trim(),
        gender: profileGender,
        dateOfBirth: profileDob || undefined,
        city: profileCity.trim()
      } : null);
    } else {
      setProfileFeedback(res.error || 'Failed to update profile.');
    }
  };

  const handleDashboardBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `DAD-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalPhone = (bookPhone || currentPatient.phone || '').trim();
    const finalDate = bookDate || new Date().toISOString().split('T')[0];

    const payload = {
      token,
      patientId: currentPatient.id,
      patientName: currentPatient.fullName || 'Patient',
      phone: finalPhone,
      departmentId: bookDeptId || 'cardiology',
      doctorId: bookDoctorId || '',
      appointmentDate: finalDate,
      timeSlot: bookSlot || 'morning',
      patientType: 'new' as const,
      notes: bookNotes ? `(Online Portal) ${bookNotes}` : '(Online Portal)',
      status: 'pending' as const
    };

    addAppointment(payload);

    if (addPatientAppointment) {
      addPatientAppointment({
        id: `app-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString()
      });
    }

    try {
      playNotificationChime();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([250, 100, 250]);
      }
    } catch {}

    setBookSuccessToken(token);
    setBookNotes('');
  };

  const handleCancel = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this pending appointment?')) {
      setCancellingId(id);
      await cancelAppointment(id);
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Confirmed ✓</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Pending Review</span>;
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto ${isUrdu ? 'font-urdu' : 'font-body'}`}>
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Top 'My Account' Profile Bar - Fetches & Displays User Name and Email Prominently */}
        <div className="bg-[#1F2933] text-white p-4 sm:p-6 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1E5AA8] via-blue-600 to-teal-500 flex items-center justify-center font-bold text-xl text-white shadow-lg border border-white/20">
                  {currentPatient.fullName ? currentPatient.fullName.charAt(0).toUpperCase() : 'P'}
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#1F2933]" title="Online Patient" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
                    {isUrdu ? 'میرا اکاؤنٹ' : 'My Account'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{isUrdu ? 'تصدیق شدہ مریض' : 'Verified Patient'}</span>
                  </span>
                  {isFetchingProfile && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-blue-300 animate-pulse font-mono">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>{isUrdu ? 'تازہ ڈیٹا...' : 'Fetching live profile...'}</span>
                    </span>
                  )}
                </div>

                {/* Patient Full Name */}
                <h2 className="text-lg sm:text-xl font-bold text-white truncate mt-1">
                  {currentPatient.fullName}
                </h2>

                {/* Logged-in User's Email & Details Displayed Clearly */}
                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-2 mt-2">
                  {/* Email Box */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-blue-200 shadow-2xs font-mono text-xs">
                    <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-slate-400 text-[10px] uppercase font-sans font-bold">{isUrdu ? 'ای میل:' : 'Email:'}</span>
                    <span className="font-semibold text-white truncate max-w-[240px] sm:max-w-[320px]">
                      {currentPatient.email || (isUrdu ? 'کوئی ای میل نہیں' : 'No email attached')}
                    </span>
                  </div>

                  {/* Phone Box */}
                  {currentPatient.phone && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-emerald-300 shadow-2xs font-mono text-xs">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-slate-400 text-[10px] uppercase font-sans font-bold">{isUrdu ? 'فون:' : 'Phone:'}</span>
                      <span className="font-semibold text-white">{currentPatient.phone}</span>
                    </div>
                  )}

                  {/* City Box */}
                  {currentPatient.city && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{currentPatient.city}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
              {onNavigateToBooking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToBooking();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap active:scale-95"
                  title="Open Hospital Appointment Form"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'اپوائنٹمنٹ فارم کھولیں' : 'Open Booking Form'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                type="button"
                className="px-3 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-rose-300 border border-red-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'لاگ آؤٹ' : 'Logout'}</span>
              </button>

              <button
                onClick={onClose}
                type="button"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto scrollbar-none py-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history' || activeTab === 'appointments'
                ? 'bg-white text-[#1E5AA8] shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-[#1E5AA8]" />
            <span>{isUrdu ? 'اپوائنٹمنٹ ہسٹری' : 'Appointment History'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-[#1E5AA8] font-bold">
              {combinedAppointments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('book')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'book'
                ? 'bg-white text-[#2E9E5B] shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-4 h-4 text-[#2E9E5B]" />
            <span>{isUrdu ? 'نئی اپوائنٹمنٹ بک کریں' : 'Book Appointment'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-white text-teal-700 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-teal-600" />
            <span>{isUrdu ? 'میری لیب رپورٹس' : 'My Lab Reports'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-bold">
              {patientLabReports.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-white text-[#1E5AA8] shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-500" />
            <span>{isUrdu ? 'نوٹیفکیشنز' : 'Notifications'}</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-slate-600" />
            <span>{isUrdu ? 'میری پروفائل' : 'My Profile'}</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: APPOINTMENT HISTORY (PAST & UPCOMING) */}
          {(activeTab === 'history' || activeTab === 'appointments') && (
            <div className="space-y-4">
              {/* Header and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-[#1E5AA8]" />
                    <h3 className="text-base font-bold text-slate-900">
                      {isUrdu ? 'اپوائنٹمنٹ کی مکمل ہسٹری اور شیڈول' : 'Appointment History & Schedule'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isUrdu
                      ? 'کلاؤڈ ڈیٹا بیس سے لائیو ریکارڈز (ماضی و آئندہ وزٹ، ٹوکن، اسٹیٹس اور ڈاکٹر کی تفصیل)'
                      : 'Live records fetched from hospital database (past & upcoming visits, status, tokens)'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchAppointmentsFromFirestore()}
                    disabled={isLoadingAppointments}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 disabled:opacity-60"
                    title="Refresh appointment list from Firestore"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isLoadingAppointments ? 'animate-spin' : ''}`} />
                    <span>{isUrdu ? 'ریفریش' : 'Refresh'}</span>
                  </button>

                  {onNavigateToBooking && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToBooking();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'آن لائن فارم کھولیں' : 'Open Full Form'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab('book')}
                    className="px-3.5 py-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'فوری بکنگ' : 'Quick Book'}</span>
                  </button>
                </div>
              </div>

              {/* Summary Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                <div
                  onClick={() => setAppointmentFilter('all')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    appointmentFilter === 'all'
                      ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    {isUrdu ? 'کل بکنگز' : 'Total'}
                  </div>
                  <div className="text-xl font-bold text-[#1E5AA8] mt-0.5">
                    {combinedAppointments.length}
                  </div>
                </div>

                <div
                  onClick={() => setAppointmentFilter('upcoming')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    appointmentFilter === 'upcoming'
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide flex items-center gap-1">
                    <span>{isUrdu ? 'آئندہ وزٹس' : 'Upcoming'}</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-600 mt-0.5">
                    {upcomingCount}
                  </div>
                </div>

                <div
                  onClick={() => setAppointmentFilter('confirmed')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    appointmentFilter === 'confirmed'
                      ? 'bg-teal-50/80 border-teal-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-teal-700 uppercase tracking-wide">
                    {isUrdu ? 'کنفرمڈ' : 'Confirmed'}
                  </div>
                  <div className="text-xl font-bold text-teal-700 mt-0.5">
                    {confirmedCount}
                  </div>
                </div>

                <div
                  onClick={() => setAppointmentFilter('pending')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    appointmentFilter === 'pending'
                      ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
                    {isUrdu ? 'پینڈنگ' : 'Pending'}
                  </div>
                  <div className="text-xl font-bold text-amber-600 mt-0.5">
                    {pendingCount}
                  </div>
                </div>

                <div
                  onClick={() => setAppointmentFilter('past')}
                  className={`col-span-2 sm:col-span-1 p-3 rounded-2xl border transition-all cursor-pointer ${
                    appointmentFilter === 'past'
                      ? 'bg-slate-100 border-slate-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    {isUrdu ? 'سابقہ / مکمل' : 'Past'}
                  </div>
                  <div className="text-xl font-bold text-slate-700 mt-0.5">
                    {pastCount}
                  </div>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 text-xs">
                <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px] shrink-0">
                  <Filter className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'فلٹر:' : 'Filter:'}</span>
                </span>
                {[
                  { id: 'all', label: isUrdu ? 'تمام' : 'All', count: combinedAppointments.length },
                  { id: 'upcoming', label: isUrdu ? 'آئندہ وزٹس' : 'Upcoming', count: upcomingCount },
                  { id: 'past', label: isUrdu ? 'سابقہ' : 'Past', count: pastCount },
                  { id: 'pending', label: isUrdu ? 'پینڈنگ ریویو' : 'Pending', count: pendingCount },
                  { id: 'confirmed', label: isUrdu ? 'کنفرم شدہ' : 'Confirmed', count: confirmedCount },
                  { id: 'cancelled', label: isUrdu ? 'منسوخ شدہ' : 'Cancelled', count: cancelledCount }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAppointmentFilter(f.id as any)}
                    className={`px-3 py-1 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      appointmentFilter === f.id
                        ? 'bg-[#1E5AA8] text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        appointmentFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Loading Indicator */}
              {isLoadingAppointments && combinedAppointments.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                  <RefreshCw className="w-8 h-8 text-[#1E5AA8] animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    {isUrdu ? 'کلاؤڈ ڈیٹا بیس سے اپوائنٹمنٹس لوڈ ہو رہی ہیں...' : 'Fetching appointments from cloud database...'}
                  </p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">
                    {appointmentFilter === 'all'
                      ? (isUrdu ? 'کوئی اپوائنٹمنٹ ریکارڈ نہیں ملا' : 'No appointments recorded yet.')
                      : (isUrdu ? `کوئی "${appointmentFilter}" اپوائنٹمنٹ نہیں ہے` : `No ${appointmentFilter} appointments found.`)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {appointmentFilter === 'all'
                      ? (isUrdu ? 'چند سیکنڈ میں آن لائن او پی ڈی کنسلٹیشن بک کریں۔' : 'Book your doctor appointment online in seconds.')
                      : (isUrdu ? 'تمام ریکارڈز دیکھنے کے لیے فلٹر کو تمام پر تبدیل کریں۔' : 'Try clearing the filter to view all appointment history.')}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
                    {appointmentFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setAppointmentFilter('all')}
                        className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                      >
                        {isUrdu ? 'تمام ریکارڈز دیکھیں' : 'Show All Appointments'}
                      </button>
                    )}
                    {onNavigateToBooking && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToBooking();
                        }}
                        className="px-4 py-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <CalendarCheck className="w-4 h-4" />
                        <span>{isUrdu ? 'اپوائنٹمنٹ فارم پر جائیں' : 'Go to Appointment Form'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab('book')}
                      className="px-4 py-2 rounded-xl bg-[#1E5AA8] text-white text-xs font-bold hover:bg-[#154685] transition-colors cursor-pointer"
                    >
                      {isUrdu ? 'یہاں فوری بک کریں' : 'Quick Book Here'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAppointments.map((appt) => {
                    const deptObj = departments.find((d) => d.id === appt.departmentId);
                    const docObj = doctors.find((d) => d.id === appt.doctorId);
                    const upcoming = isUpcoming(appt);

                    return (
                      <div
                        key={appt.id || appt.token}
                        className={`bg-white p-4 rounded-2xl border transition-shadow shadow-2xs hover:shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          upcoming ? 'border-emerald-200/90' : 'border-slate-200/90'
                        }`}
                      >
                        <div className="space-y-2 min-w-0">
                          {/* Badges: Token, Status, Upcoming/Past, Department */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#1E5AA8] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                              #{appt.token}
                            </span>
                            
                            {getStatusBadge(appt.status)}

                            {upcoming ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                <span>{isUrdu ? 'آئندہ وزٹ' : 'Upcoming Visit'}</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                {isUrdu ? 'سابقہ وزٹ' : 'Past Visit'}
                              </span>
                            )}

                            <span className="text-xs font-semibold text-slate-700">
                              {isUrdu ? deptObj?.titleUrdu || appt.departmentId : deptObj?.title || appt.departmentId}
                            </span>
                          </div>

                          {/* Doctor Name & Consultation Type */}
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span>
                              {docObj
                                ? isUrdu
                                  ? docObj.nameUrdu
                                  : docObj.name
                                : isUrdu
                                ? 'ماہر کنسلٹنٹ ڈاکٹر'
                                : 'Specialist Consultant Doctor'}
                            </span>
                            {docObj?.qualification && (
                              <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">
                                ({docObj.qualification})
                              </span>
                            )}
                          </div>

                          {/* Date, Time, Patient Name & Registered Phone */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <Calendar className="w-3.5 h-3.5 text-[#1E5AA8]" />
                              <span>{appt.appointmentDate || 'Date Scheduled'}</span>
                            </span>
                            <span className="flex items-center gap-1 capitalize font-medium text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{appt.timeSlot} slot</span>
                            </span>
                            {appt.patientName && (
                              <span className="flex items-center gap-1 text-slate-600">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>{appt.patientName}</span>
                              </span>
                            )}
                            {appt.phone && (
                              <span className="flex items-center gap-1 text-slate-600 font-mono">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{appt.phone}</span>
                              </span>
                            )}
                          </div>

                          {/* Notes / Symptoms */}
                          {appt.notes && (
                            <p className="text-xs text-slate-500 italic bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 inline-block">
                              “{appt.notes}”
                            </p>
                          )}
                        </div>

                        {/* Actions (Cancel, WhatsApp Inquire) */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                          {appt.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleCancel(appt.id)}
                              disabled={cancellingId === appt.id}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              title="Cancel Pending Appointment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{cancellingId === appt.id ? 'Cancelling...' : (isUrdu ? 'منسوخ کریں' : 'Cancel')}</span>
                            </button>
                          )}

                          <a
                            href={formatWhatsAppLink(
                              hospitalConfig.contact.whatsapp,
                              `Hello Dar al Dawa, I am inquiring about my appointment token #${appt.token} scheduled on ${appt.appointmentDate} with ${docObj?.name || 'doctor'}.`
                            )}
                            onClick={(e) =>
                              triggerWhatsApp(
                                hospitalConfig.contact.whatsapp,
                                `Hello Dar al Dawa, I am inquiring about my appointment token #${appt.token} scheduled on ${appt.appointmentDate} with ${docObj?.name || 'doctor'}.`,
                                e
                              )
                            }
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'واٹس ایپ رابطہ' : 'WhatsApp Inquire'}</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BOOK NEW APPOINTMENT */}
          {activeTab === 'book' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isUrdu ? 'نئی او پی ڈی اپوائنٹمنٹ بک کریں' : 'Book an OPD Consultation'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isUrdu ? 'آپ کے پروفائل کی تفصیلات خودکار طور پر درج کر دی گئی ہیں۔' : 'Your patient information is pre-filled from your profile.'}
                </p>
              </div>

              {bookSuccessToken ? (
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#2E9E5B] mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Appointment Request Submitted!</h4>
                  <p className="text-xs text-slate-600">
                    Your appointment token is <span className="font-mono font-bold text-[#1E5AA8] bg-white px-2 py-0.5 rounded border border-blue-200">{bookSuccessToken}</span>.
                    The hospital reception will confirm your consultation slot shortly.
                  </p>
                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setBookSuccessToken(null)}
                      className="px-4 py-2 rounded-xl bg-[#1E5AA8] text-white text-xs font-bold"
                    >
                      Book Another
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('appointments')}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold"
                    >
                      View All Appointments
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleDashboardBooking} noValidate className="space-y-4 text-xs bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Patient Name (Auto-filled)</label>
                      <input
                        type="text"
                        disabled
                        value={currentPatient.fullName}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isUrdu ? 'موبائل فون نمبر' : 'Mobile Phone'} {currentPatient.phone ? '(Auto-filled)' : '*'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={currentPatient.phone || bookPhone}
                        onChange={(e) => setBookPhone(e.target.value)}
                        disabled={!!currentPatient.phone}
                        placeholder="0300-1234567"
                        className={`w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-medium ${
                          currentPatient.phone ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : 'bg-white text-slate-900 focus:border-[#1E5AA8]'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Select Department *</label>
                      <select
                        value={bookDeptId}
                        onChange={(e) => {
                          setBookDeptId(e.target.value);
                          setBookDoctorId('');
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E5AA8]"
                      >
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {isUrdu ? dept.titleUrdu : dept.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Specialist Consultant (Optional)</label>
                      <select
                        value={bookDoctorId}
                        onChange={(e) => setBookDoctorId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E5AA8]"
                      >
                        <option value="">First Available Specialist</option>
                        {doctors
                          .filter((d) => d.departmentId === bookDeptId && d.active !== false)
                          .map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {doc.name} - Rs. {doc.feePKR}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Preferred Consultation Date *</label>
                      <input
                        type="date"
                        required
                        value={bookDate}
                        onChange={(e) => setBookDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Preferred Time Slot *</label>
                      <select
                        value={bookSlot}
                        onChange={(e) => setBookSlot(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm outline-none"
                      >
                        <option value="morning">Morning (09:00 AM – 01:00 PM)</option>
                        <option value="afternoon">Afternoon (01:00 PM – 05:00 PM)</option>
                        <option value="evening">Evening (05:00 PM – 09:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Symptoms / Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={bookNotes}
                      onChange={(e) => setBookNotes(e.target.value)}
                      placeholder="Briefly describe your symptoms or reason for visit..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Confirm OPD Booking</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: LAB REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isUrdu ? 'میری تشخیصی لیب رپورٹس' : 'Your Diagnostic Laboratory Reports'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isUrdu ? 'صرف وہ ٹیسٹ رپورٹس جو آپ کے موبائل نمبر کے ساتھ منسلک ہیں۔' : 'Showing reports linked to your registered mobile number.'}
                </p>
              </div>

              {patientLabReports.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No lab reports found for {currentPatient.phone || 'your account'}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    When you perform blood, pathology or radiology tests at Dar al Dawa, your official verified report will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientLabReports.map((rep) => (
                    <div
                      key={rep.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                            {rep.reportId}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rep.status === 'ready'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rep.status === 'ready' ? 'Report Ready ✓' : 'Processing in Lab'}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-slate-900">{rep.testName}</div>
                        <div className="text-xs text-slate-500">
                          {rep.department} • Date: {rep.reportDate} • Ref: {rep.referringDoctor || 'Hospital Consultant'}
                        </div>
                        {rep.resultSummary && (
                          <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg mt-1 font-mono">
                            {rep.resultSummary}
                          </div>
                        )}
                      </div>

                      {rep.pdfUrl && (
                        <a
                          href={rep.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isUrdu ? 'آپ کے ہسپتال نوٹیفکیشنز' : 'Your Hospital Notifications'}
                  </h3>
                  <p className="text-xs text-slate-500">Real-time alerts, appointment updates, and test results.</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllAsRead()}
                    className="text-xs font-semibold text-[#1E5AA8] hover:underline cursor-pointer"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Bell className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No notifications yet.</p>
                  <p className="text-xs text-slate-500 mt-1">You will receive instant updates whenever an appointment is confirmed or updated.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        notif.read
                          ? 'bg-white border-slate-200'
                          : 'bg-blue-50/70 border-blue-200 ring-1 ring-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            {!notif.read && <span className="w-2 h-2 rounded-full bg-[#1E5AA8]" />}
                            <span className="font-bold text-xs text-slate-900">{notif.title}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-xl mx-auto space-y-4">
              {/* Profile Card Header with Name & Email */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1E5AA8] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                    {currentPatient.fullName ? currentPatient.fullName.charAt(0).toUpperCase() : 'P'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900 truncate">{currentPatient.fullName}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {isUrdu ? 'ایکٹو' : 'Active'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 font-mono">
                      <Mail className="w-3.5 h-3.5 text-[#1E5AA8] shrink-0" />
                      <span className="truncate">{currentPatient.email}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono block">
                    {isUrdu ? 'مریض شناختی نمبر:' : 'Patient ID:'}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {currentPatient.id.slice(0, 10)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isUrdu ? 'مریض کا ذاتی پروفائل' : 'Patient Demographic Profile'}
                  </h3>
                  <p className="text-xs text-slate-500">Manage your contact information and identity record.</p>
                </div>
                {!isEditingProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {profileFeedback && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{profileFeedback}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm outline-none ${
                      isEditingProfile ? 'border-slate-300 bg-white focus:border-[#1E5AA8]' : 'border-slate-200 bg-slate-100 text-slate-700'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
                    <input
                      type="tel"
                      disabled={!isEditingProfile}
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-mono text-sm outline-none ${
                        isEditingProfile ? 'border-slate-300 bg-white focus:border-[#1E5AA8]' : 'border-slate-200 bg-slate-100 text-slate-700'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email (Account ID)</label>
                    <input
                      type="email"
                      disabled
                      value={currentPatient.email}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 text-sm cursor-not-allowed font-medium font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      disabled={!isEditingProfile}
                      value={profileGender}
                      onChange={(e) => setProfileGender(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                        isEditingProfile ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-100 text-slate-700'
                      }`}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      disabled={!isEditingProfile}
                      value={profileDob}
                      onChange={(e) => setProfileDob(e.target.value)}
                      className={`w-full px-2.5 py-2 rounded-xl border text-xs outline-none ${
                        isEditingProfile ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-100 text-slate-700'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                        isEditingProfile ? 'border-slate-300 bg-white' : 'border-slate-200 bg-slate-100 text-slate-700'
                      }`}
                    />
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                )}
              </form>

              {/* Danger Zone: Remove / Delete Patient Account */}
              <div className="mt-8 pt-6 border-t border-red-100 bg-red-50/50 rounded-2xl p-4 sm:p-5 border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider">
                      {isUrdu ? 'مریض کا اکاؤنٹ ختم کریں' : 'Delete Patient Account'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-md">
                      {isUrdu
                        ? 'یہاں کلک کرنے سے آپ کا مریض اکاؤنٹ کلاؤڈ ڈیٹا بیس سے مستقل طور پر ریموو کر دیا جائے گا۔'
                        : 'Permanently remove your patient account profile from the hospital cloud database.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(isUrdu ? 'کیا آپ واقعی اپنا مریض اکاؤنٹ مستقل ختم کرنا چاہتے ہیں؟' : 'Are you sure you want to permanently delete your patient account?')) {
                        const res = await deleteAccount();
                        if (res.success) {
                          onClose();
                        } else {
                          alert(res.error || 'Failed to remove account.');
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'اکاؤنٹ مستقل ریموو کریں' : 'Delete Account Permanently'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
