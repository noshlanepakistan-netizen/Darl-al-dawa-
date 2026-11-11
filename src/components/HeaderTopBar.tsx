import React from 'react';
import { Clock, Mail, MessageSquare, PhoneCall, AlertCircle, MapPin } from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';
import { formatWhatsAppLink, formatTelLink, formatDisplayPhone, triggerWhatsApp } from '../utils/phoneUtils';

interface HeaderTopBarProps {
  lang: 'en' | 'ur';
  onOpenReportsModal?: () => void;
  onGoToAdmin?: () => void;
  onOpenPatientAuth?: () => void;
  onOpenPatientDashboard?: () => void;
}

export const HeaderTopBar: React.FC<HeaderTopBarProps> = ({
  lang,
  onOpenReportsModal,
  onGoToAdmin
}) => {
  const { hospitalConfig } = useAdminData();
  const t = UI_TRANSLATIONS[lang].topBar;
  const isUrdu = lang === 'ur';

  const emergencyPhone = formatDisplayPhone(hospitalConfig?.contact?.emergencyNumber);
  const emergencyPhoneRaw = formatTelLink(hospitalConfig?.contact?.emergencyNumber);

  const email = hospitalConfig?.contact?.email || "info@daraldawa.pk";
  const address = isUrdu
    ? (hospitalConfig?.contact?.addressUrdu || "گلبرگ 3، لاہور، پنجاب")
    : (hospitalConfig?.contact?.address || "Gulberg III, Lahore, Punjab");
  const whatsappHref = formatWhatsAppLink(
    hospitalConfig?.contact?.whatsapp,
    "Hello Dar al Dawa Medical Center Lahore, I would like to inquire about..."
  );

  return (
    <div className="bg-[#1F2933] text-slate-200 text-xs py-2 px-4 border-b border-slate-700/60 hidden md:block select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-2">
        {/* Left: Emergency Helpline, Simple Call & Location */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* 1. Emergency Button (Red) */}
          <a
            href={`tel:${emergencyPhoneRaw}`}
            className="flex items-center gap-1.5 font-bold text-white transition-all bg-[#D62828] hover:bg-[#b51f1f] px-2.5 py-1 rounded-full shadow-xs active:scale-95 border border-red-400/30"
            title={isUrdu ? `24/7 ایمرجنسی: ${emergencyPhone}` : `24/7 Emergency: ${emergencyPhone}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-white" />
            <span>{isUrdu ? 'ایمرجنسی 24/7' : 'Emergency 24/7'}</span>
          </a>

          {/* 2. Simple Call Button (Blue) */}
          <a
            href={`tel:${emergencyPhoneRaw}`}
            className="flex items-center gap-1.5 font-bold text-white transition-all bg-[#1E5AA8] hover:bg-[#154685] px-2.5 py-1 rounded-full shadow-xs active:scale-95 border border-blue-400/30"
            title={isUrdu ? `کال کریں: ${emergencyPhone}` : `Call: ${emergencyPhone}`}
          >
            <PhoneCall className="w-3.5 h-3.5 text-white" />
            <span>{isUrdu ? 'کال:' : 'Call:'}</span>
            <span className="font-mono tracking-wider">{emergencyPhone}</span>
          </a>

          <div className="flex items-center gap-1.5 text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-[#2E9E5B]" />
            <span className={isUrdu ? 'font-urdu' : ''}>
              {address}
            </span>
          </div>
        </div>

        {/* Right: Patient Account, Reports, Staff Portal & WhatsApp */}
        <div className="flex items-center gap-3.5 flex-wrap">


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
            href={whatsappHref}
            onClick={(e) => triggerWhatsApp(hospitalConfig?.contact?.whatsapp, "Hello Dar al Dawa Medical Center Lahore, I would like to inquire about...", e)}
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className={isUrdu ? 'font-urdu' : ''}>{t.whatsapp}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

