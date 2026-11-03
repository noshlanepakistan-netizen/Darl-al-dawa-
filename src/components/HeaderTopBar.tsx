import React from 'react';
import { Phone, Clock, Mail, MessageSquare, AlertCircle, MapPin } from 'lucide-react';
import { HOSPITAL_CONFIG, UI_TRANSLATIONS } from '../data/hospitalData';

interface HeaderTopBarProps {
  lang: 'en' | 'ur';
  onOpenReportsModal?: () => void;
  onGoToAdmin?: () => void;
}

export const HeaderTopBar: React.FC<HeaderTopBarProps> = ({ lang, onOpenReportsModal, onGoToAdmin }) => {
  const t = UI_TRANSLATIONS[lang].topBar;
  const isUrdu = lang === 'ur';

  return (
    <div className="bg-[#1F2933] text-slate-200 text-xs py-2 px-4 border-b border-slate-700/60 hidden md:block">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2">
        {/* Left: Emergency Hotline & Location */}
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href={`tel:${HOSPITAL_CONFIG.contact.emergencyNumberRaw}`}
            className="flex items-center gap-1.5 font-semibold text-rose-400 hover:text-rose-300 transition-colors bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800/50"
            title="Call 24/7 Emergency"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t.emergency247}</span>
            <span className="text-white font-mono font-bold tracking-wider">{HOSPITAL_CONFIG.contact.emergencyNumber}</span>
          </a>

          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-[#2E9E5B]" />
            <span className={isUrdu ? 'font-urdu' : ''}>
              {isUrdu ? 'گلبرگ 3، لاہور، پنجاب' : 'Gulberg III, Lahore, Punjab'}
            </span>
          </div>
        </div>

        {/* Right: Reports, Hours, Staff Portal & WhatsApp */}
        <div className="flex items-center gap-4 flex-wrap">
          {onOpenReportsModal && (
            <button
              onClick={onOpenReportsModal}
              type="button"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'آن لائن لیب رپورٹ ڈاؤن لوڈ' : 'Download Lab Report'}</span>
            </button>
          )}

          {onGoToAdmin && (
            <button
              onClick={onGoToAdmin}
              type="button"
              className="flex items-center gap-1 text-slate-300 hover:text-white font-medium bg-slate-800 px-2 py-0.5 rounded border border-slate-700 cursor-pointer"
            >
              <span>{isUrdu ? 'اسٹاف پورٹل' : 'Staff Portal'}</span>
            </button>
          )}

          <a
            href={`mailto:${HOSPITAL_CONFIG.contact.email}`}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{HOSPITAL_CONFIG.contact.email}</span>
          </a>

          <a
            href={`https://wa.me/${HOSPITAL_CONFIG.contact.whatsappClean}?text=Hello%20Dar%20al%20Dawa%20Medical%20Center%20Lahore,%20I%20would%20like%20to%20inquire%20about...`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.whatsapp}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
