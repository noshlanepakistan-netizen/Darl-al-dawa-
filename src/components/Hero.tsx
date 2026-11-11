import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  PhoneCall,
  ShieldCheck,
  Clock,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  MessageSquare,
  Calendar,
  User,
  Stethoscope,
  AlertCircle
} from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';
import { usePatientAuth } from '../context/PatientAuthContext';
import { formatWhatsAppLink, formatTelLink, formatDisplayPhone, triggerWhatsApp } from '../utils/phoneUtils';
import { playNotificationChime } from '../utils/audioChime';

interface HeroProps {
  lang: 'en' | 'ur';
  onQuickBook?: (name: string, phone: string, deptId: string, date: string) => void;
  onNavigateToAppointment?: () => void;
  preselectedDeptId?: string;
  preselectedDoctorId?: string;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  onQuickBook,
  onNavigateToAppointment,
  preselectedDeptId,
  preselectedDoctorId
}) => {
  const t = UI_TRANSLATIONS[lang].hero;
  const isUrdu = lang === 'ur';
  const { homepageSettings, hospitalConfig, departments: liveDepts, doctors: liveDoctors, addAppointment, showToast } = useAdminData();
  const { patient, addPatientAppointment } = usePatientAuth();
  const deptsList = liveDepts || [];
  const doctorsList = liveDoctors || [];

  const heroHeading = homepageSettings?.heroHeading || (isUrdu ? 'دار الدواء میڈیکل سنٹر' : 'Caring for You, Every Step of the Way');
  const heroSubtitle = homepageSettings?.heroSubheading || t.subtitle;
  const heroBtnText = homepageSettings?.heroButtonText || t.bookAppointmentBtn;
  const sliderImages = homepageSettings?.heroSliderImages?.length
    ? homepageSettings.heroSliderImages
    : [
        "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80"
      ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (sliderImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [sliderImages.length]);

  // Quick form state
  const [quickName, setQuickName] = useState(patient?.fullName || '');
  const [quickPhone, setQuickPhone] = useState(patient?.phone || '');
  const [quickDept, setQuickDept] = useState(preselectedDeptId || liveDepts?.[0]?.id || 'cardiology');
  const [quickDoctor, setQuickDoctor] = useState(preselectedDoctorId || '');
  const [quickDate, setQuickDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [quickSlot, setQuickSlot] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [quickSymptoms, setQuickSymptoms] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [bookedDetails, setBookedDetails] = useState<{
    token: string;
    name: string;
    phone: string;
    deptTitle: string;
    doctorName: string;
    date: string;
    slot: string;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Sync preselected department and doctor from external clicks (e.g. from Doctors or Departments section)
  useEffect(() => {
    if (preselectedDeptId) setQuickDept(preselectedDeptId);
    if (preselectedDoctorId) setQuickDoctor(preselectedDoctorId);
  }, [preselectedDeptId, preselectedDoctorId]);

  useEffect(() => {
    if (liveDepts && liveDepts.length > 0 && (!quickDept || quickDept === 'cardiology')) {
      setQuickDept(liveDepts[0].id);
    }
  }, [liveDepts]);

  // Filter available doctors by chosen department
  const filteredDoctors = doctorsList.filter(
    (d) => !quickDept || d.departmentId === quickDept
  );

  const handleCopyToken = (token: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2500);
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; phone?: string } = {};
    if (!quickName.trim()) {
      newErrors.name = isUrdu ? 'براہ کرم مریض کا نام درج کریں۔' : 'Please enter patient full name.';
    }
    const cleanDigits = quickPhone.replace(/\D/g, '');
    if (!quickPhone.trim() || cleanDigits.length < 10) {
      newErrors.phone = isUrdu ? 'درست موبائل نمبر درج کریں (مثلاً 03001234567)' : 'Please enter a valid mobile number.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      } catch {}
      return;
    }

    setErrors({});

    const token = `DAD-${Math.floor(100000 + Math.random() * 900000)}`;

    let finalPhone = quickPhone.trim();
    if (cleanDigits.length === 10 && cleanDigits.startsWith('3')) {
      finalPhone = '0' + cleanDigits;
    } else if (cleanDigits.length === 12 && cleanDigits.startsWith('923')) {
      finalPhone = '0' + cleanDigits.slice(2);
    }

    const finalDate = quickDate || new Date().toISOString().split('T')[0];
    const deptObj = liveDepts?.find((d) => d.id === quickDept);
    const docObj = doctorsList.find((d) => d.id === quickDoctor);

    const appointmentPayload = {
      token,
      patientId: patient?.id || '',
      patientName: quickName.trim(),
      phone: finalPhone,
      departmentId: quickDept || 'cardiology',
      doctorId: quickDoctor || '',
      appointmentDate: finalDate,
      timeSlot: quickSlot,
      patientType: 'new' as const,
      notes: quickSymptoms ? `(Quick OPD) ${quickSymptoms.trim()}` : '(Quick OPD Booking)',
      status: 'pending' as const
    };

    // 1. Save to master Admin & Firestore database
    addAppointment(appointmentPayload);

    // 2. Save directly to Patient Appointments state & local storage
    if (addPatientAppointment) {
      addPatientAppointment({
        id: `app-${Date.now()}`,
        ...appointmentPayload,
        createdAt: new Date().toISOString()
      });
    }

    try {
      const existingTokens: string[] = JSON.parse(localStorage.getItem('dad_booked_tokens') || '[]');
      if (!existingTokens.includes(token)) {
        existingTokens.push(token);
        localStorage.setItem('dad_booked_tokens', JSON.stringify(existingTokens));
      }
    } catch {}

    // 3. Audio & Haptic Feedback on User's Phone
    try {
      playNotificationChime();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([250, 100, 250]);
      }
    } catch {}

    if (showToast) {
      showToast(
        isUrdu
          ? `ٹوکن #${token} کے ساتھ آپ کی اپوائنٹمنٹ درج ہو گئی ہے!`
          : `Appointment booked successfully! Token #${token}`,
        'success'
      );
    }

    setBookedDetails({
      token,
      name: quickName.trim(),
      phone: finalPhone,
      deptTitle: isUrdu ? deptObj?.titleUrdu || quickDept : deptObj?.title || quickDept,
      doctorName: docObj ? (isUrdu ? docObj.nameUrdu : docObj.name) : (isUrdu ? 'ماہر کنسلٹنٹ ڈاکٹر' : 'Specialist Consultant Doctor'),
      date: finalDate,
      slot: quickSlot
    });

    if (onQuickBook) {
      onQuickBook(quickName, quickPhone, quickDept, finalDate);
    }
    setFormSubmitted(true);
  };

  return (
    <section id="home" className="relative bg-gradient-to-b from-blue-50/70 via-white to-[#F7FAFC] pt-4 pb-14 md:py-14 overflow-hidden">
      {/* Decorative subtle medical background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative space-y-8">
        {/* Banner Slider */}
        {sliderImages.length > 0 && (
          <div className="relative w-full h-44 sm:h-64 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 group">
            {sliderImages.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={img}
                  alt={`Banner ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent flex items-end p-5 md:p-8">
                  <div className="text-white max-w-xl">
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-400 bg-black/40 px-2.5 py-1 rounded-full border border-emerald-400/30">
                      {hospitalConfig?.name || "Dar al Dawa Medical Center"}
                    </span>
                    <h3 className="text-base sm:text-xl md:text-2xl font-bold mt-2 drop-shadow-sm line-clamp-1">
                      {heroHeading}
                    </h3>
                  </div>
                </div>
              </div>
            ))}

            {sliderImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                  title="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSlide((prev) => (prev + 1) % sliderImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                  title="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="absolute bottom-3 right-5 z-20 flex items-center gap-1.5">
                  {sliderImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === activeSlide ? 'w-6 bg-emerald-400' : 'w-2 bg-white/60 hover:bg-white'
                      }`}
                      title={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines, Trust badges & Action CTAs */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Location & Accreditation chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#2E9E5B] text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#2E9E5B]" />
              <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-slate-900 leading-[1.2] ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
              {homepageSettings?.heroHeading ? (
                <span className="text-slate-900">
                  {heroHeading.split(' ').slice(0, -2).join(' ')}{' '}
                  <span className="text-[#2E9E5B]">{heroHeading.split(' ').slice(-2).join(' ')}</span>
                </span>
              ) : isUrdu ? (
                <span>
                  <span className="text-[#1E5AA8]">ہر قدم پر آپ کی صحت اور </span>
                  <span className="text-[#2E9E5B]">دیکھ بھال کا امین</span>
                </span>
              ) : (
                <span>
                  <span className="text-[#1E5AA8]">Caring for You, </span>
                  <span className="text-[#2E9E5B]">Every Step of the Way</span>
                </span>
              )}
            </h1>

            {/* Subtitle */}
            <p className={`text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl ${isUrdu ? 'font-urdu text-base leading-loose' : 'font-body'}`}>
              {heroSubtitle}
            </p>

            {/* Primary Action Buttons: Book, Simple Call, Emergency 24/7, WhatsApp */}
            <div className="flex flex-wrap gap-2.5 sm:gap-3 pt-2">
              {/* 1. Book Appointment CTA */}
              <button
                onClick={onNavigateToAppointment}
                type="button"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span className={isUrdu ? 'font-urdu' : ''}>{heroBtnText}</span>
              </button>

              {/* 2. Simple Blue Call Button */}
              <a
                href={formatTelLink(hospitalConfig.contact.emergencyNumber)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
                title={isUrdu ? `کال کریں: ${formatDisplayPhone(hospitalConfig.contact.emergencyNumber)}` : `Call: ${formatDisplayPhone(hospitalConfig.contact.emergencyNumber)}`}
              >
                <PhoneCall className="w-4 h-4 text-white" />
                <span className="font-bold">
                  {isUrdu ? `کال: ${formatDisplayPhone(hospitalConfig.contact.emergencyNumber)}` : `Call: ${formatDisplayPhone(hospitalConfig.contact.emergencyNumber)}`}
                </span>
              </a>

              {/* 3. Emergency 24/7 Button (Red) */}
              <a
                href={formatTelLink(hospitalConfig.contact.emergencyNumber)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#D62828] hover:bg-[#b71f1f] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
                title={isUrdu ? '24/7 ایمرجنسی ہاٹ لائن' : '24/7 Emergency Hotline'}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <AlertCircle className="w-4 h-4 text-white" />
                <span>{isUrdu ? 'ایمرجنسی 24/7' : 'Emergency 24/7'}</span>
              </a>

              {/* 4. WhatsApp Button (Green) */}
              <a
                href={formatWhatsAppLink(
                  hospitalConfig?.contact?.whatsapp,
                  isUrdu ? 'اسلام علیکم، مجھے فوری رہنمائی چاہیے' : 'Hello Dar al Dawa Medical Center, I would like to inquire about...'
                )}
                onClick={(e) =>
                  triggerWhatsApp(
                    hospitalConfig?.contact?.whatsapp,
                    isUrdu ? 'اسلام علیکم، مجھے فوری رہنمائی چاہیے' : 'Hello Dar al Dawa Medical Center, I would like to inquire about...',
                    e
                  )
                }
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                title={isUrdu ? 'واٹس ایپ پر رابطہ کریں' : 'Chat on WhatsApp'}
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
              </a>
            </div>

            {/* Key Quality Assurances */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/80 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E9E5B] flex-shrink-0" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'پنجاب ہیلتھ کیئر کمیشن لائسنس' : 'PHC Category-1 Regular'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E9E5B] flex-shrink-0" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'پی ایم ڈی سی تصدیق شدہ فیکلٹی' : 'PMDC Verified Doctors'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E9E5B] flex-shrink-0" />
                <span className={isUrdu ? 'font-urdu' : ''}>{isUrdu ? 'صحت کارڈ پلس پینل' : 'Sehat Card Plus Empaneled'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Appointment Booking Card with Visual Accent */}
          <div className="lg:col-span-5" id="appointment">
            <div className="relative" id="quick-appointment">
              {/* Glow backdrop */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl blur-sm opacity-20"></div>

              {/* Form Card */}
              <div className="relative bg-white rounded-2xl p-5 sm:p-7 shadow-xl border border-slate-100">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'فوری او پی ڈی بکنگ' : 'Instant OPD Booking'}</span>
                    </div>
                    <h3 className={`text-xl font-bold text-slate-900 mt-0.5 ${isUrdu ? 'font-urdu text-xl' : 'font-heading'}`}>
                      {isUrdu ? (
                        <span>فوری <span className="text-[#2E9E5B]">اپوائنٹمنٹ</span></span>
                      ) : (
                        <span>Quick <span className="text-[#2E9E5B]">Appointment</span></span>
                      )}
                    </h3>
                    <p className={`text-xs text-slate-500 mt-0.5 ${isUrdu ? 'font-urdu' : ''}`}>
                      {t.quickBookingSub}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#2E9E5B] flex items-center justify-center flex-shrink-0 shadow-2xs border border-emerald-100">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                </div>

                {formSubmitted && bookedDetails ? (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                      </div>
                      <h4 className={`text-base font-bold text-emerald-900 ${isUrdu ? 'font-urdu text-lg' : ''}`}>
                        {isUrdu ? 'اپوائنٹمنٹ کی درخواست کامیابی سے درج ہو گئی ہے!' : 'Appointment Successfully Booked!'}
                      </h4>
                      <p className="text-xs text-emerald-800">
                        {isUrdu
                          ? 'ہسپتال عملہ جلد آپ سے تصدیق کے لیے رابطہ کرے گا۔ برائے مہربانی اپنا ٹوکن محفوظ رکھیں۔'
                          : 'Our hospital reception team will confirm your consultation shortly. Please save your token.'}
                      </p>

                      {/* Token Box */}
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-emerald-300 shadow-2xs">
                          <span className="text-[11px] font-bold text-slate-500 uppercase">{isUrdu ? 'ٹوکن:' : 'Token:'}</span>
                          <span className="font-mono font-bold text-sm text-[#1E5AA8]">#{bookedDetails.token}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyToken(bookedDetails.token)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                            title="Copy Token"
                          >
                            {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Booking Summary Card */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                        <span className="text-slate-500">{isUrdu ? 'مریض کا نام' : 'Patient Name'}:</span>
                        <span className="font-bold text-slate-900">{bookedDetails.name}</span>
                      </div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                        <span className="text-slate-500">{isUrdu ? 'شعبہ' : 'Department'}:</span>
                        <span className="font-semibold text-slate-800">{bookedDetails.deptTitle}</span>
                      </div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                        <span className="text-slate-500">{isUrdu ? 'کنسلٹنٹ ڈاکٹر' : 'Doctor'}:</span>
                        <span className="font-semibold text-[#1E5AA8]">{bookedDetails.doctorName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">{isUrdu ? 'تاریخ و شفٹ' : 'Date & Slot'}:</span>
                        <span className="font-medium text-slate-800 capitalize">
                          {bookedDetails.date} ({bookedDetails.slot})
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: WhatsApp & Reset */}
                    <div className="space-y-2 pt-1">
                      <a
                        href={formatWhatsAppLink(
                          hospitalConfig.contact.whatsapp,
                          `Hello Dar al Dawa, I booked quick appointment token #${bookedDetails.token} for ${bookedDetails.name} scheduled on ${bookedDetails.date} (${bookedDetails.slot} slot) with ${bookedDetails.doctorName}.`
                        )}
                        onClick={(e) =>
                          triggerWhatsApp(
                            hospitalConfig.contact.whatsapp,
                            `Hello Dar al Dawa, I booked quick appointment token #${bookedDetails.token} for ${bookedDetails.name} scheduled on ${bookedDetails.date} (${bookedDetails.slot} slot) with ${bookedDetails.doctorName}.`,
                            e
                          )
                        }
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{isUrdu ? 'واٹس ایپ پر فوری تصدیق حاصل کریں' : 'Chat on WhatsApp with Token'}</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setFormSubmitted(false);
                          setBookedDetails(null);
                          setQuickName('');
                          setQuickPhone('');
                          setQuickSymptoms('');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer text-center"
                      >
                        {isUrdu ? 'دوسری اپوائنٹمنٹ بک کریں' : 'Book Another Appointment'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleQuickSubmit} noValidate className="space-y-3.5">
                    {/* Error Banner if any */}
                    {(errors.name || errors.phone) && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                        {errors.name || errors.phone}
                      </div>
                    )}

                    {/* Patient Name */}
                    <div>
                      <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                        {isUrdu ? 'مریض کا پورا نام *' : 'Patient Full Name *'}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={quickName}
                          onChange={(e) => {
                            setQuickName(e.target.value);
                            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                          }}
                          placeholder={isUrdu ? "مثلاً محمد احمد" : "e.g. Muhammad Ahmed"}
                          className={`w-full pl-3.5 pr-9 py-2.5 rounded-xl border outline-none text-sm transition-all bg-slate-50/50 ${
                            errors.name ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-300 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100'
                          }`}
                        />
                        <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                        {isUrdu ? 'موبائل نمبر (واٹس ایپ) *' : 'WhatsApp / Mobile Number *'}
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={quickPhone}
                          onChange={(e) => {
                            setQuickPhone(e.target.value);
                            if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                          }}
                          placeholder="0300-1234567"
                          className={`w-full pl-3.5 pr-9 py-2.5 rounded-xl border outline-none text-sm font-mono transition-all bg-slate-50/50 ${
                            errors.phone ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-300 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100'
                          }`}
                        />
                        <PhoneCall className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      </div>
                    </div>

                    {/* Department & Doctor Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                          {t.selectDept}
                        </label>
                        <select
                          value={quickDept}
                          onChange={(e) => {
                            setQuickDept(e.target.value);
                            setQuickDoctor('');
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm bg-slate-50/50 cursor-pointer"
                        >
                          {deptsList.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {isUrdu ? dept.titleUrdu : dept.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                          {isUrdu ? 'کنسلٹنٹ ڈاکٹر' : 'Doctor / Specialist'}
                        </label>
                        <select
                          value={quickDoctor}
                          onChange={(e) => setQuickDoctor(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm bg-slate-50/50 cursor-pointer"
                        >
                          <option value="">
                            {isUrdu ? 'کوئی بھی دستیاب ماہر ڈاکٹر' : 'Any Available Specialist'}
                          </option>
                          {filteredDoctors.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {isUrdu ? doc.nameUrdu : doc.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Date & Time Slot Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                          {t.preferredDate}
                        </label>
                        <input
                          type="date"
                          required
                          value={quickDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setQuickDate(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm bg-slate-50/50 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                          {isUrdu ? 'وقت / شفٹ' : 'Time Shift'}
                        </label>
                        <div className="grid grid-cols-3 gap-1 pt-0.5">
                          {[
                            { id: 'morning', label: isUrdu ? 'صبح' : 'Morn', time: '9AM-12PM' },
                            { id: 'afternoon', label: isUrdu ? 'دوپہر' : 'Aft', time: '1PM-4PM' },
                            { id: 'evening', label: isUrdu ? 'شام' : 'Eve', time: '5PM-9PM' }
                          ].map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setQuickSlot(s.id as any)}
                              className={`py-2 px-1 text-center rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                                quickSlot === s.id
                                  ? 'bg-[#1E5AA8] text-white border-[#1E5AA8] shadow-2xs font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <div>{s.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Optional Symptoms / Reason for Visit */}
                    <div>
                      <input
                        type="text"
                        value={quickSymptoms}
                        onChange={(e) => setQuickSymptoms(e.target.value)}
                        placeholder={isUrdu ? "مختصر علامات (اختیاری): مثلاً سر درد، شوگر چیک اپ..." : "Brief reason / symptoms (optional): e.g. chest pain, checkup..."}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#1E5AA8] focus:ring-1 focus:ring-blue-100 outline-none text-xs bg-slate-50/50 placeholder:text-slate-400"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-1 py-3 px-4 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span className={isUrdu ? 'font-urdu' : ''}>
                        {isUrdu ? 'فوری اپوائنٹمنٹ بک کریں' : 'Confirm & Book Appointment'}
                      </span>
                    </button>
                  </form>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {isUrdu ? 'او پی ڈی سنٹر فعال ہے' : 'OPD Desk Active Now'}
                  </span>
                  <a
                    href={formatWhatsAppLink(hospitalConfig.contact.whatsapp, 'Hello, I want to inquire about OPD appointment')}
                    onClick={(e) => triggerWhatsApp(hospitalConfig.contact.whatsapp, 'Hello, I want to inquire about OPD appointment', e)}
                    rel="noopener noreferrer"
                    className="text-[#2E9E5B] hover:underline font-medium cursor-pointer"
                  >
                    {isUrdu ? 'واٹس ایپ پر رابطہ' : 'Chat via WhatsApp'}
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Trust Stats Bar */}
        <div className="mt-12 lg:mt-16 bg-white rounded-2xl shadow-md border border-slate-200/70 p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {(hospitalConfig.trustStats || []).map((stat, idx) => (
              <div key={idx} className={`pt-4 md:pt-0 ${idx > 0 && !isUrdu ? 'md:pl-6' : ''}`}>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#1E5AA8] font-heading tracking-tight">
                  {stat.value}
                </div>
                <div className={`text-xs sm:text-sm text-slate-600 mt-1 font-medium ${isUrdu ? 'font-urdu text-sm' : ''}`}>
                  {isUrdu ? stat.labelUrdu : stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
};
