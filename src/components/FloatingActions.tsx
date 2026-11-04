import React, { useState, useEffect } from 'react';
import { MessageSquare, PhoneCall, ArrowUp } from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';

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

  // Hospital phone number from Admin Panel settings (fallback to 042-111-327-227, 1122 purged)
  const rawEmergency = hospitalConfig?.contact?.emergencyNumber || "042-111-327-227";
  const emergencyPhone = rawEmergency.replace(/\b1122\b/g, '').replace(/\s*\/\s*/g, '').trim() || "042-111-327-227";
  const emergencyPhoneRaw = hospitalConfig?.contact?.emergencyNumberRaw
    ? hospitalConfig.contact.emergencyNumberRaw.replace(/1122/g, '')
    : emergencyPhone.replace(/[\s-]/g, '') || "042111327227";

  const whatsappNumberClean = hospitalConfig?.contact?.whatsappClean || "923001234567";

  return (
    <aside
      aria-label="Floating quick actions"
      className="fixed bottom-5 right-5 rtl:right-auto rtl:left-5 z-40 flex flex-col items-end rtl:items-start gap-2.5 sm:gap-3 pointer-events-none select-none"
    >
      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          type="button"
          aria-label={t.backToTop}
          className="pointer-events-auto p-2.5 sm:p-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 shadow-lg border border-slate-200 transition-all hover:-translate-y-1 active:scale-95 cursor-pointer group"
          title={t.backToTop}
        >
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 group-hover:text-[#1E5AA8] transition-colors" />
        </button>
      )}

      {/* 24/7 Hospital Helpline Call button: Full number 042-111-327-227, single line, no overlap */}
      <a
        href={`tel:${emergencyPhoneRaw}`}
        className="pointer-events-auto group relative flex items-center gap-2 p-2.5 sm:px-4 sm:py-3 rounded-full bg-[#D62828] hover:bg-[#b51f1f] text-white shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
        title={isUrdu ? `ہسپتال کال کریں: ${emergencyPhone}` : `Call Hospital: ${emergencyPhone}`}
      >
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
        <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse shrink-0" />
        <span className="hidden sm:inline text-xs font-bold font-mono tracking-wide whitespace-nowrap">
          {emergencyPhone}
        </span>
      </a>

      {/* WhatsApp Chat button (Green #2E9E5B) */}
      <a
        href={`https://wa.me/${whatsappNumberClean}?text=Hello%20Dar%20al%20Dawa%20Medical%20Center%20Lahore,%20I%20have%20an%20inquiry`}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto group relative flex items-center gap-2 p-2.5 sm:px-4 sm:py-3 rounded-full bg-[#2E9E5B] hover:bg-[#25824b] text-white shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
        title={t.whatsappTooltip}
      >
        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        <span className="hidden sm:inline text-xs font-bold whitespace-nowrap">
          {isUrdu ? 'واٹس ایپ رابطہ' : 'WhatsApp Us'}
        </span>
      </a>
    </aside>
  );
};
