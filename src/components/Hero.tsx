import React, { useState } from 'react';
import { CalendarCheck, PhoneCall, ShieldCheck, Clock, Users, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { HOSPITAL_CONFIG, DEPARTMENTS, UI_TRANSLATIONS } from '../data/hospitalData';

interface HeroProps {
  lang: 'en' | 'ur';
  onQuickBook: (name: string, phone: string, deptId: string, date: string) => void;
  onNavigateToAppointment: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  onQuickBook,
  onNavigateToAppointment
}) => {
  const t = UI_TRANSLATIONS[lang].hero;
  const isUrdu = lang === 'ur';

  // Quick form state
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickDept, setQuickDept] = useState(DEPARTMENTS[0].id);
  const [quickDate, setQuickDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || !quickPhone.trim()) return;
    onQuickBook(quickName, quickPhone, quickDept, quickDate);
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 4000);
  };

  return (
    <section id="home" className="relative bg-gradient-to-b from-blue-50/70 via-white to-[#F7FAFC] pt-6 pb-16 md:py-16 overflow-hidden">
      {/* Decorative subtle medical background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines, Trust badges & Action CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Location & Accreditation chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-[#1E5AA8] text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#2E9E5B]" />
              <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-slate-900 leading-[1.2] ${isUrdu ? 'font-urdu text-4xl sm:text-5xl leading-[1.6]' : 'font-heading'}`}>
              <span className="text-[#1E5AA8]">{isUrdu ? 'دار الدواء' : 'Caring for You,'}</span>{' '}
              <span className="text-slate-900">
                {isUrdu ? 'ہر قدم پر آپ کی صحت اور دیکھ بھال کا امین' : 'Every Step of the Way'}
              </span>
            </h1>

            {/* Subtitle */}
            <p className={`text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl ${isUrdu ? 'font-urdu text-lg leading-loose' : 'font-body'}`}>
              {t.subtitle}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onNavigateToAppointment}
                type="button"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#2E9E5B] hover:bg-[#25824b] text-white font-semibold text-base shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <CalendarCheck className="w-5 h-5" />
                <span className={isUrdu ? 'font-urdu' : ''}>{t.bookAppointmentBtn}</span>
              </button>

              <a
                href={`tel:${HOSPITAL_CONFIG.contact.emergencyNumberRaw}`}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#D62828] hover:bg-[#b71f1f] text-white font-bold text-base shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                <PhoneCall className="w-5 h-5 animate-bounce" />
                <span className={isUrdu ? 'font-urdu' : ''}>
                  {isUrdu ? 'ایمرجنسی: 042-111-327-227' : t.emergencyCallBtn}
                </span>
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
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Glow backdrop */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl blur-sm opacity-20"></div>

              {/* Form Card */}
              <div className="relative bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-slate-100">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div>
                    <h3 className={`text-xl font-bold text-[#1E5AA8] ${isUrdu ? 'font-urdu text-xl' : 'font-heading'}`}>
                      {t.quickBookingTitle}
                    </h3>
                    <p className={`text-xs text-slate-500 mt-0.5 ${isUrdu ? 'font-urdu' : ''}`}>
                      {t.quickBookingSub}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#2E9E5B] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>

                {formSubmitted ? (
                  <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in fade-in">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <p className={`font-semibold text-emerald-900 ${isUrdu ? 'font-urdu' : ''}`}>
                      {t.quickSuccess}
                    </p>
                    <p className="text-xs text-emerald-700">
                      {isUrdu ? 'آپ کو مکمل فارم پر منتقل کیا جا رہا ہے...' : 'Redirecting to full appointment manager...'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleQuickSubmit} className="space-y-4">
                    <div>
                      <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                        {t.fullName}
                      </label>
                      <input
                        type="text"
                        required
                        value={quickName}
                        onChange={(e) => setQuickName(e.target.value)}
                        placeholder={isUrdu ? "مثلاً محمد احمد" : "e.g. Muhammad Ahmed"}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                        {t.phoneNumber}
                      </label>
                      <input
                        type="tel"
                        required
                        value={quickPhone}
                        onChange={(e) => setQuickPhone(e.target.value)}
                        placeholder="0300-1234567"
                        pattern="^03[0-9]{2}-?[0-9]{7}$"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 outline-none text-sm font-mono transition-all bg-slate-50/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                          {t.selectDept}
                        </label>
                        <select
                          value={quickDept}
                          onChange={(e) => setQuickDept(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm bg-slate-50/50"
                        >
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {isUrdu ? dept.titleUrdu : dept.title}
                            </option>
                          ))}
                        </select>
                      </div>

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
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 outline-none text-xs sm:text-sm bg-slate-50/50"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1E5AA8] hover:bg-[#164785] text-white font-semibold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className={isUrdu ? 'font-urdu' : ''}>{t.submitQuick}</span>
                      <ArrowRight className={`w-4 h-4 ${isUrdu ? 'rotate-180' : ''}`} />
                    </button>
                  </form>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {isUrdu ? 'او پی ڈی سنٹر فعال ہے' : 'OPD Desk Active Now'}
                  </span>
                  <a
                    href={`https://wa.me/${HOSPITAL_CONFIG.contact.whatsappClean}?text=Hello,%20I%20want%20to%20inquire%20about%20OPD%20appointment`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2E9E5B] hover:underline font-medium"
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
            {HOSPITAL_CONFIG.trustStats.map((stat, idx) => (
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
