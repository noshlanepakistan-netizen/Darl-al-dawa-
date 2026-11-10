import React, { useState, useEffect } from 'react';
import { Bell, BellRing, CheckCircle2, X, Smartphone } from 'lucide-react';
import { requestFcmToken } from '../utils/fcm';
import { usePatientAuth } from '../context/PatientAuthContext';
import { useAdminAuth } from '../admin/context/AdminAuthContext';

interface NotificationPermissionBannerProps {
  lang: 'en' | 'ur';
}

export const NotificationPermissionBanner: React.FC<NotificationPermissionBannerProps> = ({ lang }) => {
  const isUrdu = lang === 'ur';
  const { patient, isAuthenticated: isPatientAuth } = usePatientAuth();
  const { isAuthenticated: isAdminAuth } = useAdminAuth();

  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionState(Notification.permission);
    }
    const dismissed = localStorage.getItem('dad_notification_banner_dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  // If already granted, dismissed, or notifications not supported, don't show the sticky banner
  if (permissionState === 'granted' || isDismissed || typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const role = isAdminAuth ? 'admin' : isPatientAuth ? 'patient' : 'guest';
      const res = await requestFcmToken({
        role,
        userId: patient?.id,
        phone: patient?.phone,
        email: patient?.email
      });

      if (res.success) {
        setSuccess(true);
        setPermissionState('granted');
        setTimeout(() => {
          setIsDismissed(true);
        }, 2500);
      } else {
        if ('Notification' in window) {
          setPermissionState(Notification.permission);
        }
      }
    } catch (err) {
      console.warn('Notification permission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('dad_notification_banner_dismissed', 'true');
    } catch {}
  };

  return (
    <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-white rounded-2xl shadow-xl border border-blue-200 p-4 animate-in slide-in-from-bottom duration-300 ${isUrdu ? 'font-urdu' : 'font-body'}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E5AA8] flex items-center justify-center shrink-0 border border-blue-100">
          {success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 animate-in zoom-in" />
          ) : (
            <BellRing className="w-5 h-5 text-[#1E5AA8] animate-bounce" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>{isUrdu ? 'موبائل پش نوٹیفکیشنز' : 'Mobile Push Notifications'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                FCM Real-time
              </span>
            </h4>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {success
              ? (isUrdu ? 'موبائل پش نوٹیفکیشن کامیابی سے فعال ہو گئی ہیں! ✓' : 'Push notifications successfully enabled! ✓')
              : isUrdu
              ? 'اپوائنٹمنٹ تصدیق، ڈاکٹر الرٹس اور ٹوکن سٹیٹس براہ راست اپنے فون پر حاصل کرنے کے لیے نوٹیفکیشن آن کریں۔'
              : 'Enable Android Chrome push notifications for instant appointment updates, token status, and hospital alerts.'}
          </p>

          {!success && (
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleEnableNotifications}
                disabled={loading}
                className="py-1.5 px-3.5 rounded-xl bg-[#1E5AA8] hover:bg-[#154685] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{loading ? (isUrdu ? 'فعال ہو رہا ہے...' : 'Enabling...') : (isUrdu ? 'نوٹیفکیشن فعال کریں' : 'Enable Notifications')}</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="py-1.5 px-2.5 rounded-xl text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {isUrdu ? 'بعد میں' : 'Later'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
