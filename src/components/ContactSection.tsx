import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building,
  Navigation
} from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';
import { formatTelLink, formatDisplayPhone } from '../utils/phoneUtils';

interface ContactSectionProps {
  lang: 'en' | 'ur';
}

export const ContactSection: React.FC<ContactSectionProps> = ({ lang }) => {
  const t = UI_TRANSLATIONS[lang].contact;
  const isUrdu = lang === 'ur';
  const { addMessage, hospitalConfig } = useAdminData();


  // Contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    addMessage({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject,
      message: message.trim()
    });

    setIsSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setIsSent(false);
    }, 5000);
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-[#2E9E5B] border border-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.badge}</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-3 ${isUrdu ? 'font-urdu text-3xl sm:text-4xl leading-[1.6]' : 'font-heading'}`}>
            {isUrdu ? (
              <span>رابطہ اور <span className="text-[#2E9E5B]">ہسپتال کا پتہ</span></span>
            ) : (
              <span>Contact & <span className="text-[#2E9E5B]">Hospital Location</span></span>
            )}
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#2E9E5B] to-emerald-400 rounded-full mx-auto mb-3" />
          <p className={`text-slate-600 text-sm sm:text-base leading-relaxed ${isUrdu ? 'font-urdu text-base' : 'font-body'}`}>
            {t.subheading}
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          
          {/* Card 1: 24/7 Emergency */}
          <div className="bg-red-50/70 border border-red-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#D62828] text-white flex items-center justify-center mb-4 shadow-xs">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold text-slate-900 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                {t.emergencyTitle}
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                {isUrdu ? 'لاہور میں فوری ٹراما و ایمرجنسی نگہداشت' : 'Rapid trauma care & critical resuscitation'}
              </p>
            </div>
            <a
              href={formatTelLink(hospitalConfig.contact.emergencyNumber)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white font-mono text-sm font-bold shadow-xs transition-colors w-fit"
            >
              <Phone className="w-4 h-4 text-white" />
              <span>{isUrdu ? 'کال:' : 'Call:'} {formatDisplayPhone(hospitalConfig.contact.emergencyNumber)}</span>
            </a>
          </div>

          {/* Card 2: General Reception */}
          <div className="bg-blue-50/70 border border-blue-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#1E5AA8] text-white flex items-center justify-center mb-4 shadow-xs">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold text-slate-900 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                {t.receptionTitle}
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                {isUrdu ? 'او پی ڈی رہنمائی اور ڈاکٹرز کے اوقات' : 'OPD information & consultation timing'}
              </p>
            </div>
            <div>
              <a
                href={formatTelLink(hospitalConfig.contact.receptionPhone)}
                className="font-mono text-sm font-bold text-[#1E5AA8] hover:underline block"
              >
                {hospitalConfig.contact.receptionPhone || '042-35789000'}
              </a>
              <a
                href={formatTelLink(hospitalConfig.contact.mobileEmergency)}
                className="font-mono text-xs text-slate-600 hover:underline block mt-0.5"
              >
                {hospitalConfig.contact.mobileEmergency || '0300-1234567'}
              </a>
            </div>
          </div>

          {/* Card 3: Address & Landmark */}
          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#2E9E5B] text-white flex items-center justify-center mb-4 shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold text-slate-900 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                {t.addressTitle}
              </h3>
              <p className={`text-xs text-slate-700 leading-relaxed mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? (hospitalConfig.contact.addressUrdu || hospitalConfig.contact.address) : hospitalConfig.contact.address}
              </p>
            </div>
            <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-emerald-200/60 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-[#2E9E5B]" />
              <span>{isUrdu ? (hospitalConfig.contact.landmarkUrdu || 'مین بلیوارڈ، گلبرگ 3') : (hospitalConfig.contact.landmark || 'Main Boulevard, Gulberg III')}</span>
            </div>
          </div>

          {/* Card 4: Operating Hours */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-4 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className={`text-base font-bold text-slate-900 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'اوقاتِ کار' : 'Working Hours'}
              </h3>
              <p className="text-xs text-slate-600 mb-1">
                <strong>{isUrdu ? 'ایمرجنسی:' : 'Emergency:'}</strong> {hospitalConfig.contact.hours?.emergency || '24/7 Always Open'}
              </p>
              <p className="text-xs text-slate-600">
                <strong>{isUrdu ? 'او پی ڈی کلینک:' : 'OPD Clinics:'}</strong> {hospitalConfig.contact.hours?.opd || '8 AM – 10 PM'}
              </p>
            </div>
            <a
              href={`mailto:${hospitalConfig.contact.email}`}
              className="text-xs font-semibold text-[#1E5AA8] hover:underline pt-2 border-t border-slate-200 block truncate"
            >
              {hospitalConfig.contact.email}
            </a>
          </div>

        </div>

        {/* Map & Inquiry Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Google Maps Embed (Gulberg III Lahore) */}
          <div className="lg:col-span-6 rounded-3xl overflow-hidden border border-slate-200 shadow-md relative min-h-[380px] bg-slate-100">
            <iframe
              src={hospitalConfig.contact.googleMapsEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3401.3!2d74.34!3d31.52"}
              title="Hospital Location Map - Gulberg Lahore"
              className="w-full h-full min-h-[380px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Map floating card */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 shadow-md flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">{hospitalConfig.name}</div>
                <div className="text-[11px] text-slate-500">{isUrdu ? (hospitalConfig.contact.addressUrdu || hospitalConfig.contact.address) : hospitalConfig.contact.address}</div>
              </div>
              <a
                href="https://maps.google.com/?q=Gulberg+III+Lahore"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#1E5AA8] text-white text-xs font-semibold hover:bg-blue-800 transition-colors"
              >
                {isUrdu ? 'ڈائریکشن حاصل کریں' : 'Get Directions'}
              </a>
            </div>
          </div>

          {/* Right: Interactive Contact Form */}
          <div className="lg:col-span-6 bg-[#F7FAFC] border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-md">
            <div className="mb-6">
              <h3 className={`text-xl font-bold text-slate-900 ${isUrdu ? 'font-urdu text-2xl' : 'font-heading'}`}>
                {t.sendMessageTitle}
              </h3>
              <p className={`text-xs text-slate-600 mt-1 ${isUrdu ? 'font-urdu' : ''}`}>
                {t.sendMessageSub}
              </p>
            </div>

            {isSent ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className={`font-semibold text-emerald-900 ${isUrdu ? 'font-urdu' : ''}`}>
                  {t.messageSent}
                </p>
                <p className="text-xs text-emerald-700">
                  {isUrdu ? 'ہمارا کوآرڈینیٹر جلد از جلد آپ سے رابطہ کرے گا۔' : 'Our coordinator will respond to your inquiry shortly.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                      {t.yourName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isUrdu ? "مثلاً حمزہ خان" : "e.g. Hamza Khan"}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                      {t.yourPhone}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300-1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-mono outline-none focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                      {t.yourEmail}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                      {t.subject}
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="General Inquiry">{isUrdu ? 'عام معلومات' : 'General Inquiry'}</option>
                      <option value="Doctor Timings">{isUrdu ? 'ڈاکٹرز کے اوقات' : 'Doctor OPD Timings'}</option>
                      <option value="Lab Test / Home Sampling">{isUrdu ? 'لیب ٹیسٹ و ہوم سیمپلنگ' : 'Lab Test / Home Sampling'}</option>
                      <option value="Sehat Card / Panel">{isUrdu ? 'صحت کارڈ پینل کی معلومات' : 'Sehat Card / Insurance Panel'}</option>
                      <option value="Feedback / Complaint">{isUrdu ? 'شکایت یا رائے' : 'Feedback / Complaint'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold text-slate-700 mb-1 ${isUrdu ? 'font-urdu' : ''}`}>
                    {t.message} *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isUrdu ? "اپنا پیغام یہاں تحریر کریں..." : "Write your inquiry or question here..."}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#1E5AA8] hover:bg-[#164785] text-white font-semibold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className={isUrdu ? 'font-urdu' : ''}>{t.sendBtn}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
