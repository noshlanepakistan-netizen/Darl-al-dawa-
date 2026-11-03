import React, { useState, useEffect } from 'react';
import { MessageSquare, PhoneCall, ArrowUp } from 'lucide-react';
import { HOSPITAL_CONFIG, UI_TRANSLATIONS } from '../data/hospitalData';

interface FloatingActionsProps {
  lang: 'en' | 'ur';
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({ lang }) => {
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

  return (
    <aside aria-label="Floating quick actions" className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          type="button"
          aria-label={t.backToTop}
          className="pointer-events-auto p-3 rounded-full bg-white hover:bg-slate-50 text-slate-700 shadow-lg border border-slate-200 transition-all hover:-translate-y-1 active:scale-95 cursor-pointer group"
          title={t.backToTop}
        >
          <ArrowUp className="w-5 h-5 group-hover:text-[#1E5AA8] transition-colors" />
        </button>
      )}

      {/* 24/7 Emergency Call button (Red #D62828) */}
      <a
        href={`tel:${HOSPITAL_CONFIG.contact.emergencyNumberRaw}`}
        className="pointer-events-auto group relative flex items-center gap-2 p-3 sm:px-4 sm:py-3 rounded-full bg-[#D62828] hover:bg-[#b51f1f] text-white shadow-xl transition-all hover:scale-105 active:scale-95"
        title={t.callEmergencyTooltip}
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <PhoneCall className="w-5 h-5 animate-pulse" />
        <span className="hidden sm:inline text-xs font-bold font-mono tracking-wide">
          {HOSPITAL_CONFIG.contact.emergencyNumber}
        </span>
      </a>

      {/* WhatsApp Chat button (Green #2E9E5B) */}
      <a
        href={`https://wa.me/${HOSPITAL_CONFIG.contact.whatsappClean}?text=Hello%20Dar%20al%20Dawa%20Medical%20Center%20Lahore,%20I%20have%20an%20inquiry`}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto group relative flex items-center gap-2 p-3 sm:px-4 sm:py-3 rounded-full bg-[#2E9E5B] hover:bg-[#25824b] text-white shadow-xl transition-all hover:scale-105 active:scale-95"
        title={t.whatsappTooltip}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="hidden sm:inline text-xs font-bold">
          {isUrdu ? 'واٹس ایپ رابطہ' : 'WhatsApp Us'}
        </span>
      </a>

    </aside>
  );
};
