import React from 'react';
import { Clock, Mail, MessageSquare, AlertCircle, MapPin, User, Bell } from 'lucide-react';
import { UI_TRANSLATIONS } from '../data/hospitalData';
import { useAdminData } from '../admin/context/AdminDataContext';
import { usePatientAuth } from '../context/PatientAuthContext';
import { useNotifications } from '../context/NotificationContext';
import { formatWhatsAppLink, formatTelLink, formatDisplayPhone } from '../utils/phoneUtils';

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
  onGoToAdmin,
  onOpenPatientAuth,
  onOpenPatientDashboard
}) => {
  const { hospitalConfig } = useAdminData();
  const { patient, isAuthenticated } = usePatientAuth();
  const { unreadCount } = useNotifications();
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

        {/* Right: Patient Account, Reports, Staff Portal & WhatsApp */}
        <div className="flex items-center gap-3.5 flex-wrap">
          {/* Patient Portal / Login / My Account */}
          {isAuthenticated && patient ? (
            <button
              onClick={onOpenPatientDashboard}
              type="button"
              className="flex items-center gap-1.5 text-emerald-300 hover:text-white font-semibold bg-emerald-950/70 hover:bg-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-700/50 cursor-pointer transition-colors"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[120px]">{patient.fullName || 'My Account'}</span>
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          ) : (
            <button
              onClick={onOpenPatientAuth}
              type="button"
              className="flex items-center gap-1 text-blue-300 hover:text-white font-semibold bg-blue-950/70 hover:bg-blue-900 px-2.5 py-0.5 rounded-full border border-blue-800/60 cursor-pointer transition-colors"
            >
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>{isUrdu ? 'لاگ ان / سائن اپ' : 'Login / Sign Up'}</span>
            </button>
          )}

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

