import React, { useState, useEffect } from 'react';
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
  MessageSquare
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
  const { patient, logout, myAppointments, addPatientAppointment, cancelAppointment, updateProfile } = usePatientAuth();
  const { departments, doctors, labReports, hospitalConfig, addAppointment } = useAdminData();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const isUrdu = lang === 'ur';

  const [activeTab, setActiveTab] = useState<'appointments' | 'book' | 'reports' | 'notifications' | 'profile'>('appointments');

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

  useEffect(() => {
    if (patient?.phone && !bookPhone) {
      setBookPhone(patient.phone);
    }
  }, [patient?.phone]);

  if (!isOpen || !patient) return null;

  // Patient's lab reports matched by phone
  const patientLabReports = labReports.filter(
    (r) => r.patientPhone && patient.phone && (
      r.patientPhone.replace(/\D/g, '') === patient.phone.replace(/\D/g, '') ||
      r.patientPhone.includes(patient.phone) ||
      patient.phone.includes(r.patientPhone)
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
    } else {
      setProfileFeedback(res.error || 'Failed to update profile.');
    }
  };

  const handleDashboardBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const token = `DAD-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalPhone = (bookPhone || patient.phone || '').trim();
    const finalDate = bookDate || new Date().toISOString().split('T')[0];

    const payload = {
      token,
      patientId: patient.id,
      patientName: patient.fullName || 'Patient',
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
        
        {/* Header Bar */}
        <div className="bg-[#1F2933] text-white p-5 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E5AA8] to-teal-600 flex items-center justify-center font-bold text-lg text-white shadow-md border border-white/20">
              {patient.fullName ? patient.fullName.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{patient.fullName}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {isUrdu ? 'مریض پورٹل' : 'Verified Patient'}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-0.5">
                <span className="font-mono text-slate-300">{patient.phone}</span>
                <span>•</span>
                <span className="truncate max-w-xs">{patient.email}</span>
                <span>•</span>
                <span>{patient.city}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-rose-300 border border-red-800/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'لاگ آؤٹ' : 'Logout'}</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 sm:px-6 flex items-center gap-2 overflow-x-auto scrollbar-none py-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'bg-white text-[#1E5AA8] shadow-xs font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-[#1E5AA8]" />
            <span>{isUrdu ? 'میری اپوائنٹمنٹس' : 'My Appointments'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-[#1E5AA8] font-bold">
              {myAppointments.length}
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
          
          {/* TAB 1: APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isUrdu ? 'آپ کی ہسپتال اپوائنٹمنٹس' : 'Your Hospital Appointments'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isUrdu ? 'تمام ماضی اور آنے والی اپوائنٹمنٹس کی مکمل تفصیل۔' : 'Track schedule, consultation tokens, and doctor status.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('book')}
                  className="px-3.5 py-2 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'نئی بکنگ' : 'Book New'}</span>
                </button>
              </div>

              {myAppointments.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No appointments recorded yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Book your first doctor appointment online in seconds.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('book')}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#1E5AA8] text-white text-xs font-bold hover:bg-[#154685] transition-colors cursor-pointer"
                  >
                    Book Appointment Now
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myAppointments.map((appt) => {
                    const deptObj = departments.find((d) => d.id === appt.departmentId);
                    const docObj = doctors.find((d) => d.id === appt.doctorId);

                    return (
                      <div
                        key={appt.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#1E5AA8] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                              {appt.token}
                            </span>
                            {getStatusBadge(appt.status)}
                            <span className="text-xs font-semibold text-slate-800">
                              {isUrdu ? deptObj?.titleUrdu : deptObj?.title || appt.departmentId}
                            </span>
                          </div>

                          <div className="text-sm font-bold text-slate-900">
                            {docObj ? (isUrdu ? docObj.nameUrdu : docObj.name) : (isUrdu ? 'ماہر کنسلٹنٹ ڈاکٹر' : 'Specialist Consultant')}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{appt.appointmentDate}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span className="capitalize">{appt.timeSlot}</span>
                            </span>
                            {appt.notes && (
                              <span className="text-slate-400 italic">“{appt.notes}”</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {appt.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleCancel(appt.id)}
                              disabled={cancellingId === appt.id}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{cancellingId === appt.id ? 'Cancelling...' : 'Cancel'}</span>
                            </button>
                          )}

                          <a
                            href={formatWhatsAppLink(
                              hospitalConfig.contact.whatsapp,
                              `Hello Dar al Dawa, I am inquiring about my appointment token ${appt.token} scheduled on ${appt.appointmentDate}.`
                            )}
                            onClick={(e) =>
                              triggerWhatsApp(
                                hospitalConfig.contact.whatsapp,
                                `Hello Dar al Dawa, I am inquiring about my appointment token ${appt.token} scheduled on ${appt.appointmentDate}.`,
                                e
                              )
                            }
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp Inquire</span>
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
                        value={patient.fullName}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {isUrdu ? 'موبائل فون نمبر' : 'Mobile Phone'} {patient.phone ? '(Auto-filled)' : '*'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={patient.phone || bookPhone}
                        onChange={(e) => setBookPhone(e.target.value)}
                        disabled={!!patient.phone}
                        placeholder="0300-1234567"
                        className={`w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-medium ${
                          patient.phone ? 'bg-slate-100 text-slate-700 cursor-not-allowed' : 'bg-white text-slate-900 focus:border-[#1E5AA8]'
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
                  <p className="text-sm font-bold text-slate-700">No lab reports found for {patient.phone}</p>
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
                      value={patient.email}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
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
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
