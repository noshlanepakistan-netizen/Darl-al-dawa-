import React from 'react';
import { Clock, Mail, MessageSquare, AlertCircle, MapPin } from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';

interface HeaderTopBarProps {
  lang: 'en' | 'ur';
  onOpenReportsModal?: () => void;
  onGoToAdmin?: () => void;
}

export const HeaderTopBar: React.FC<HeaderTopBarProps> = ({ lang, onOpenReportsModal, onGoToAdmin }) => {
  const { hospitalConfig } = useAdminData();
  const t = UI_TRANSLATIONS[lang].topBar;
  const isUrdu = lang === 'ur';

  // Hospital phone number from Admin Panel settings (fallback to 042-111-327-227, 1122 purged)
  const rawEmergency = hospitalConfig?.contact?.emergencyNumber || "042-111-327-227";
  const emergencyPhone = rawEmergency.replace(/\b1122\b/g, '').replace(/\s*\/\s*/g, '').trim() || "042-111-327-227";
  const emergencyPhoneRaw = hospitalConfig?.contact?.emergencyNumberRaw
    ? hospitalConfig.contact.emergencyNumberRaw.replace(/1122/g, '')
    : emergencyPhone.replace(/[\s-]/g, '') || "042111327227";

  const email = hospitalConfig?.contact?.email || "info@daraldawa.pk";
  const address = isUrdu
    ? (hospitalConfig?.contact?.addressUrdu || "گلبرگ 3، لاہور، پنجاب")
    : (hospitalConfig?.contact?.address || "Gulberg III, Lahore, Punjab");
  const whatsappNumberClean = hospitalConfig?.contact?.whatsappClean || "923001234567";

  return (
    <div className="bg-[#1F2933] text-slate-200 text-xs py-2 px-4 border-b border-slate-700/60 hidden md:block select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2">
        {/* Left: Emergency Helpline & Location */}
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href={`tel:${emergencyPhoneRaw}`}
            className="flex items-center gap-1.5 font-semibold text-rose-400 hover:text-rose-300 transition-colors bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-800/50"
            title={isUrdu ? `24/7 ایمرجنسی ہاٹ لائن کال کریں: ${emergencyPhone}` : `Call 24/7 Helpline: ${emergencyPhone}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{t.emergency247}</span>
            <span className="text-white font-mono font-bold tracking-wider">{emergencyPhone}</span>
          </a>

          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-[#2E9E5B]" />
            <span className={isUrdu ? 'font-urdu' : ''}>
              {address}
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
            href={`mailto:${email}`}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{email}</span>
          </a>

          <a
            href={`https://wa.me/${whatsappNumberClean}?text=Hello%20Dar%20al%20Dawa%20Medical%20Center%20Lahore,%20I%20would%20like%20to%20inquire%20about...`}
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
