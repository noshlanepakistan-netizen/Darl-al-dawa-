import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Phone,
  User,
  CreditCard,
  Building,
  Clock,
  MessageSquare,
  AlertCircle,
  Share2,
  CalendarDays,
  FileText
} from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';
import { usePatientAuth } from '../context/PatientAuthContext';
import { tagGuestDevice } from '../utils/oneSignal';
import { formatWhatsAppLink, triggerWhatsApp } from '../utils/phoneUtils';

interface AppointmentSectionProps {
  lang: 'en' | 'ur';
  preselectedDeptId?: string;
  preselectedDoctorId?: string;
  prefillName?: string;
  prefillPhone?: string;
  prefillDate?: string;
}

export const AppointmentSection: React.FC<AppointmentSectionProps> = ({
  lang,
  preselectedDeptId,
  preselectedDoctorId,
  prefillName = '',
  prefillPhone = '',
  prefillDate = ''
}) => {
  const t = UI_TRANSLATIONS[lang].appointment;
  const isUrdu = lang === 'ur';
  const { addAppointment, departments: liveDepts, doctors: liveDocs, hospitalConfig } = useAdminData();
  const { patient, isAuthenticated } = usePatientAuth();

  const deptsList = liveDepts || [];
  const docsList = liveDocs || [];

  // Form states - prefill from patient if logged in
  const [patientName, setPatientName] = useState(prefillName || (patient?.fullName || ''));
  const [phone, setPhone] = useState(prefillPhone || (patient?.phone || ''));
  const [cnic, setCnic] = useState('');
  const [departmentId, setDepartmentId] = useState(preselectedDeptId || (deptsList[0]?.id || 'cardiology'));
  const [doctorId, setDoctorId] = useState(preselectedDoctorId || '');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    if (prefillDate) return prefillDate;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('evening');
  const [patientType, setPatientType] = useState<'new' | 'followup'>('new');
  const [notes, setNotes] = useState('');

  // Auto-fill if patient logs in afterwards
  useEffect(() => {
    if (isAuthenticated && patient) {
      if (!patientName) setPatientName(patient.fullName);
      if (!phone) setPhone(patient.phone);
    }
  }, [isAuthenticated, patient]);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [appointmentToken, setAppointmentToken] = useState('');

  // Sync external preselects
  useEffect(() => {
    if (preselectedDeptId) setDepartmentId(preselectedDeptId);
    if (preselectedDoctorId) setDoctorId(preselectedDoctorId);
    if (prefillName) setPatientName(prefillName);
    if (prefillPhone) setPhone(prefillPhone);
    if (prefillDate) setAppointmentDate(prefillDate);
  }, [preselectedDeptId, preselectedDoctorId, prefillName, prefillPhone, prefillDate]);

  // Doctors matching current department
  const availableDoctors = docsList.filter((d) => d.departmentId === departmentId && d.active !== false);

  // Validate Pakistani phone
  const validatePakistaniPhone = (value: string): boolean => {
    const clean = value.replace(/[\s-]/g, '');
    return /^03[0-9]{9}$/.test(clean) || /^\+923[0-9]{9}$/.test(clean);
  };

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!patientName.trim()) {
      newErrors.patientName = isUrdu ? 'براہ کرم مریض کا نام درج کریں۔' : 'Please enter patient full name.';
    }

    if (!validatePakistaniPhone(phone)) {
      newErrors.phone = isUrdu
        ? 'براہ کرم درست پاکستانی نمبر درج کریں (مثلاً: 0300-1234567)'
        : 'Please enter a valid Pakistani mobile number (e.g. 0300-1234567)';
    }

    if (!appointmentDate) {
      newErrors.date = isUrdu ? 'تاریخ منتخب کریں۔' : 'Please select preferred date.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Generate simulated Token ID
    const randomToken = `DAD-${Math.floor(100000 + Math.random() * 900000)}`;
    setAppointmentToken(randomToken);

    // Save to master Admin & Firestore database
    addAppointment({
      token: randomToken,
      patientName: patientName.trim(),
      phone: phone.trim(),
      cnic: cnic.trim(),
      departmentId,
      doctorId: doctorId || undefined,
      appointmentDate,
      timeSlot,
      patientType,
      notes,
      status: 'pending'
    });

    setIsSubmitted(true);
  };

  // Generate WhatsApp prefilled message URL
  const selectedDeptObj = deptsList.find((d) => d.id === departmentId);
  const selectedDocObj = docsList.find((d) => d.id === doctorId);

  const generateWhatsAppMessage = () => {
    const deptTitle = isUrdu ? selectedDeptObj?.titleUrdu : selectedDeptObj?.title;
    const docName = selectedDocObj
      ? (isUrdu ? selectedDocObj.nameUrdu : selectedDocObj.name)
      : (isUrdu ? 'پہلا دستیاب ڈاکٹر' : 'First Available Specialist');

    return isUrdu
      ? `السلام علیکم! دار الدواء میڈیکل سنٹر لاہور میں آن لائن اپوائنٹمنٹ کی تصدیق:\n` +
        `ٹوکن: ${appointmentToken || 'نیا'}\n` +
        `مریض: ${patientName}\n` +
        `فون: ${phone}\n` +
        (cnic ? `شناختی کارڈ: ${cnic}\n` : '') +
        `شعبہ: ${deptTitle}\n` +
        `ڈاکٹر: ${docName}\n` +
        `تاریخ: ${appointmentDate}\n` +
        `وقت: ${timeSlot}\n` +
        `مریض کی قسم: ${patientType === 'new' ? 'نیا مریض' : 'فالو اپ'}\n` +
        (notes ? `علامات: ${notes}` : '')
      : `*Dar al Dawa Medical Center - Appointment Request*\n` +
        `*Token:* ${appointmentToken || 'NEW'}\n` +
        `*Patient Name:* ${patientName}\n` +
        `*Phone:* ${phone}\n` +
        (cnic ? `*CNIC:* ${cnic}\n` : '') +
        `*Department:* ${deptTitle}\n` +
        `*Consultant:* ${docName}\n` +
        `*Date:* ${appointmentDate}\n` +
        `*Time Slot:* ${timeSlot.toUpperCase()}\n` +
        `*Type:* ${patientType === 'new' ? 'New Patient' : 'Follow-up'}\n` +
        (notes ? `*Notes:* ${notes}` : '');
  };

  const generateWhatsAppUrl = () => {
    return formatWhatsAppLink(hospitalConfig.contact.whatsapp, generateWhatsAppMessage());
  };


  return (
    <section id="appointment" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-3 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {isUrdu ? (
              <span>آن لائن <span className="text-[#2E9E5B]">اپوائنٹمنٹ بک کریں</span></span>
            ) : (
              <span>Book Your Hospital <span className="text-[#2E9E5B]">Appointment Online</span></span>
            )}
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#2E9E5B] to-emerald-400 rounded-full mx-auto mb-3" />
          <p className={`text-slate-600 text-sm sm:text-base leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg relative">
          
          {isSubmitted ? (
            /* Success confirmation card */
            <div className="bg-white rounded-2xl p-8 border border-emerald-200 text-center space-y-6 shadow-sm animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#2E9E5B] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className={`text-xl sm:text-2xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
                  {t.form.successHeading}
                </h3>
                <p className={`text-xs sm:text-sm text-slate-600 ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                  {t.form.successMessage}
                </p>
              </div>

              {/* Summary Dossier Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 max-w-lg mx-auto text-left divide-y divide-slate-200 text-xs sm:text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">{isUrdu ? 'ٹوکن نمبر:' : 'Token Number:'}</span>
                  <span className="font-mono font-bold text-[#1E5AA8] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {appointmentToken}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">{isUrdu ? 'مریض کا نام:' : 'Patient Name:'}</span>
                  <span className="font-semibold text-slate-800">{patientName}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">{isUrdu ? 'موبائل نمبر:' : 'Contact Phone:'}</span>
                  <span className="font-mono text-slate-800">{phone}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">{isUrdu ? 'شعبہ:' : 'Department:'}</span>
                  <span className="font-semibold text-slate-800">
                    {isUrdu ? selectedDeptObj?.titleUrdu : selectedDeptObj?.title}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">{isUrdu ? 'ڈاکٹر:' : 'Doctor:'}</span>
                  <span className="font-semibold text-slate-800">
                    {selectedDocObj ? (isUrdu ? selectedDocObj.nameUrdu : selectedDocObj.name) : (isUrdu ? 'پہلا دستیاب ڈاکٹر' : 'First Available Doctor')}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">{isUrdu ? 'تاریخ و وقت:' : 'Date & Slot:'}</span>
                  <span className="font-semibold text-[#2E9E5B]">{appointmentDate} ({timeSlot})</span>
                </div>
              </div>

              {/* WhatsApp Action Button */}
              <div className="pt-2 max-w-md mx-auto space-y-3">
                <p className={`text-xs text-slate-500 ${isUrdu ? 'font-urdu' : ''}`}>
                  {t.form.whatsappSuccessPrompt}
                </p>
                <a
                  href={generateWhatsAppUrl()}
                  onClick={(e) => triggerWhatsApp(hospitalConfig.contact.whatsapp, generateWhatsAppMessage(), e)}
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className={isUrdu ? 'font-urdu text-base font-normal' : ''}>
                    {t.form.confirmViaWhatsAppBtn}
                  </span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setPatientName('');
                    setPhone('');
                    setNotes('');
                  }}
                  className="text-xs text-[#1E5AA8] hover:underline font-medium block mx-auto cursor-pointer"
                >
                  {t.form.bookAnother}
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Booking Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Patient Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-xs font-semibold text-slate-700 mb-1.5 ${isUrdu ? 'font-urdu' : ''}`}>
                    {t.form.patientName}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder={isUrdu ? "محمد احمد" : "e.g. Muhammad Ahmed"}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm outline-none transition-all ${
                        errors.patientName ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-300 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                  {errors.patientName && (
                    <p className="text-red-500 text-xs mt-1">{errors.patientName}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-xs font-semibold text-slate-700 mb-1.5 ${isUrdu ? 'font-urdu' : ''}`}>
                    {t.form.phone}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="0300-1234567"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm font-mono outline-none transition-all ${
                        errors.phone ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-300 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                  {errors.phone ? (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      {isUrdu ? 'کسی بھی پاکستانی نیٹ ورک (Jazz, Zong, Telenor, Ufone) کا نمبر' : 'Accepts 03XX-XXXXXXX format'}
                    </p>
                  )}
                </div>
              </div>

              {/* Row 2: CNIC & Patient Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-xs font-semibold text-slate-700 mb-1.5 ${isUrdu ? 'font-urdu' : ''}`}>
                    {t.form.cnic}
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={cnic}
                      onChange={(e) => setCnic(e.target.value)}
                      placeholder="35202-XXXXXXX-X"
                      maxLength={15}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-mono focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isUrdu ? 'صحت کارڈ پینل یا ہسپتال ریکارڈ کے لیے مفید' : 'Helpful for Sehat Card & medical history'}
                  </p>
                </div>

                <div>
                  <label className={`block text-xs font-semibold text-slate-700 mb-1.5 ${isUrdu ? 'font-urdu' : ''}`}>
                    {t.form.patientType}
                  </label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-all ${
                      patientType === 'new' ? 'bg-blue-50 border-[#1E5AA8] text-[#1E5AA8] font-bold' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="patientType"
                        checked={patientType === 'new'}
                        onChange={() => setPatientType('new')}
                        className="text-[#1E5AA8]"
                      />
                      <span className={isUrdu ? 'font-urdu' : ''}>{t.form.newPatient}</span>
                    </label>

                    <label className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-medium transition-all ${
                      patientType === 'followup' ? 'bg-blue-50 border-[#1E5AA8] text-[#1E5AA8] font-bold' : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      <input
                        type="radio"
                        name="patientType"
                        checked={patientType === 'followup'}
                        onChange={() => setPatientType('followup')}
                        className="text-[#1E5AA8]"
                      />
                      <span className={isUrdu ? 'font-urdu' : ''}>{t.form.followUp}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Row 3: Department & Doctor Dropdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-xs font-semibold text-slate-700 mb-1.5 ${isUrdu ? 'font-urdu' : ''}`}>
                    {t.form.department}
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={departmentId}
                      onChange={(e) => {
                        setDepartmentId(e.target.value);
                        setDoctorId('');
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100"
                    >
                      {deptsList.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {isUrdu ? dept.titleUrdu : dept.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold text-slate-700 mb-1.5 ${isUrdu ? 'font-urdu' : ''}`}>
                    {t.form.doctor}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">{t.form.anyDoctor}</option>
                      {availableDoctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {isUrdu ? doc.nameUrdu : doc.name} ({doc.qualification.split(',')[0]}) - Rs. {doc.feePKR}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 4: Preferred Date & Time Slot */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={`block text-xs font-semibold text-slate-700 mb-1.5 ${isUrdu ? 'font-urdu' : ''}`}>
                    {t.form.date}
                  </label>
                  <div className="relative">
                    <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100"
                    >
                    </input>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold text-slate-700 mb-1.5 ${isUrdu ? 'font-urdu' : ''}`}>
                    {t.form.timeSlot}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'morning', label: 'Morning', labelUrdu: 'صبح', time: '9AM - 12PM' },
                      { id: 'afternoon', label: 'Afternoon', labelUrdu: 'دوپہر', time: '1PM - 4PM' },
                      { id: 'evening', label: 'Evening', labelUrdu: 'شام', time: '5PM - 9PM' }
                    ].map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setTimeSlot(slot.id)}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          timeSlot === slot.id
                            ? 'bg-blue-50 border-[#1E5AA8] text-[#1E5AA8] ring-1 ring-[#1E5AA8]'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs font-bold">
                          {isUrdu ? slot.labelUrdu : slot.label}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {slot.time}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 5: Notes / Symptoms */}
              <div>
                <label className={`block text-xs font-semibold text-slate-700 mb-1.5 ${isUrdu ? 'font-urdu' : ''}`}>
                  {t.form.notes}
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.form.notesPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button & Direct WhatsApp Link */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span className={isUrdu ? 'font-urdu text-base font-normal' : ''}>
                    {t.form.submitBtn}
                  </span>
                </button>

                <a
                  href={formatWhatsAppLink(hospitalConfig.contact.whatsapp, 'Hello Dar al Dawa Hospital, I would like to book an OPD appointment')}
                  onClick={(e) => triggerWhatsApp(hospitalConfig.contact.whatsapp, 'Hello Dar al Dawa Hospital, I would like to book an OPD appointment', e)}
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl border border-emerald-600/40 bg-emerald-50 hover:bg-emerald-100 text-[#2E9E5B] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >

                  <MessageSquare className="w-4 h-4" />
                  <span className={isUrdu ? 'font-urdu' : ''}>{t.form.whatsappOption}</span>
                </a>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
