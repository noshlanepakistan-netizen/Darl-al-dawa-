import React, { useState, useEffect } from 'react';
import { PhoneCall, ArrowUp, AlertCircle } from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';
import { formatWhatsAppLink, formatTelLink, formatDisplayPhone, triggerWhatsApp } from '../utils/phoneUtils';

// Official WhatsApp Vector Icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface FloatingActionsProps {
  lang: 'en' | 'ur';
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({ lang }) => {
  const { hospitalConfig } = useAdminData();
  const t = UI_TRANSLATIONS[lang].floating;
  const isUrdu = lang === 'ur';

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const emergencyPhone = formatDisplayPhone(hospitalConfig?.contact?.emergencyNumber);
  const emergencyPhoneRaw = formatTelLink(hospitalConfig?.contact?.emergencyNumber);
  const whatsappHref = formatWhatsAppLink(
    hospitalConfig?.contact?.whatsapp,
    "Hello Dar al Dawa Medical Center Lahore, I have an inquiry"
  );

  return (
    <aside
      aria-label="Floating quick actions"
      className="fixed bottom-4 sm:bottom-6 right-3 min-[360px]:right-4 sm:right-6 rtl:right-auto rtl:left-3 min-[360px]:rtl:left-4 sm:rtl:left-6 z-50 flex flex-col items-end rtl:items-start gap-2 sm:gap-2.5 pointer-events-none select-none"
    >
      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          type="button"
          aria-label={t.backToTop}
          className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 shadow-xl border border-slate-200 transition-all hover:-translate-y-1 active:scale-95 cursor-pointer group"
          title={t.backToTop}
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-[#1E5AA8] transition-colors" />
        </button>
      )}

      {/* 1. Emergency 24/7 Button (Red) */}
      <a
        href={`tel:${emergencyPhoneRaw}`}
        className="pointer-events-auto group relative flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full bg-[#D62828] hover:bg-[#b51f1f] text-white shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap border-2 border-white/30"
        title={isUrdu ? `24/7 ایمرجنسی: ${emergencyPhone}` : `24/7 Emergency: ${emergencyPhone}`}
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="text-xs font-bold whitespace-nowrap">
          {isUrdu ? 'ایمرجنسی' : 'Emergency'}
        </span>
      </a>

      {/* 2. Simple Call Button (Blue) */}
      <a
        href={`tel:${emergencyPhoneRaw}`}
        className="pointer-events-auto group relative flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full bg-[#1E5AA8] hover:bg-[#154685] text-white shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap border-2 border-white/30"
        title={isUrdu ? `کال کریں: ${emergencyPhone}` : `Call: ${emergencyPhone}`}
      >
        <PhoneCall className="w-4 h-4 shrink-0" />
        <span className="text-xs font-bold font-mono tracking-wide whitespace-nowrap">
          {isUrdu ? 'کال:' : 'Call:'} {emergencyPhone}
        </span>
      </a>

      {/* 3. WhatsApp Chat Floating Button (Green) */}
      <a
        href={whatsappHref}
        onClick={(e) => triggerWhatsApp(hospitalConfig?.contact?.whatsapp, "Hello Dar al Dawa Medical Center Lahore, I have an inquiry", e)}
        rel="noopener noreferrer"
        className="pointer-events-auto group relative flex items-center gap-1.5 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap border-2 border-white/40 cursor-pointer"
        title={isUrdu ? 'واٹس ایپ پر رابطہ کریں' : 'Chat on WhatsApp'}
      >
        <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 fill-white" />
        <span className="text-xs font-extrabold tracking-wide whitespace-nowrap">
          {isUrdu ? 'واٹس ایپ' : 'WhatsApp'}
        </span>
      </a>
    </aside>
  );
};
