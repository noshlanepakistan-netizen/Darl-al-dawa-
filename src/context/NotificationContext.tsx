import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { NotificationItem, NotificationSettings } from '../types/notification';
import { db, isFirebaseConfigured } from '../firebase/config';
import { playNotificationChime } from '../utils/audioChime';
import { initOneSignal } from '../utils/oneSignal';
import { Bell, X } from 'lucide-react';
import { usePatientAuth } from './PatientAuthContext';
import { cleanWhatsAppNumber } from '../utils/phoneUtils';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  createNotification: (item: {
    userId?: string;
    role: 'admin' | 'patient' | 'all';
    title: string;
    message: string;
    type: NotificationItem['type'];
    link?: string;
  }) => Promise<void>;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  sendTestNotification: (role?: 'admin' | 'patient') => Promise<void>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  appointmentBooked: true,
  appointmentCancelled: true,
  patientRegistered: true,
  profileUpdated: true,
  contactMessage: true,
  labReportReady: true,
  soundEnabled: true
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{
  children: React.ReactNode;
  userRole?: 'admin' | 'patient' | 'guest';
  userId?: string;
}> = ({ children, userRole: propUserRole = 'guest', userId: propUserId }) => {
  const { patient, isAuthenticated: isPatientAuth } = usePatientAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeAlert, setActiveAlert] = useState<NotificationItem | null>(null);
  const isFirstLoadRef = useRef<boolean>(true);
  const knownIdsRef = useRef<Set<string>>(new Set());

  // Determine active role dynamically:
  // If user is logged into admin panel -> 'admin'
  // If user is logged in as patient -> 'patient'
  // Otherwise -> 'guest'
  const isAdminLoggedIn = typeof window !== 'undefined' && localStorage.getItem('dad_admin_session_auth') === 'true';
  const effectiveRole: 'admin' | 'patient' | 'guest' =
    propUserRole && propUserRole !== 'guest'
      ? propUserRole
      : (isAdminLoggedIn ? 'admin' : (isPatientAuth && patient ? 'patient' : 'guest'));

  const effectiveUserId = propUserId || (effectiveRole === 'patient' ? patient?.id : (effectiveRole === 'admin' ? 'admin' : undefined));

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('dad_notification_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Auto-dismiss floating alert card after 6.5 seconds
  useEffect(() => {
    if (!activeAlert) return;
    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, 6500);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  // Initialize OneSignal on mount
  useEffect(() => {
    initOneSignal();
  }, []);

  // Real-time Firestore listener for incoming notifications
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    try {
      const notifsRef = collection(db, 'notifications');
      const q = query(notifsRef, orderBy('createdAt', 'desc'), limit(50));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: NotificationItem[] = [];
          let hasNewRelevantItem = false;
          let newestAlertItem: NotificationItem | null = null;

          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const id = docSnap.id;
            const itemRole = data.role || 'all';
            const itemUserId = data.userId || data.user_id;
            const itemPhone = data.phone ? cleanWhatsAppNumber(data.phone) : '';
            const currentPatientPhone = patient?.phone ? cleanWhatsAppNumber(patient.phone) : '';

            // Check if this notification is relevant to this user
            const isForAdmin = effectiveRole === 'admin' && (itemRole === 'admin' || itemRole === 'all' || itemUserId === 'admin');
            const isForPatient = effectiveRole === 'patient' && (
              itemRole === 'patient' ||
              itemRole === 'all' ||
              (effectiveUserId && itemUserId === effectiveUserId) ||
              (itemPhone && currentPatientPhone && itemPhone === currentPatientPhone)
            );
            const isForGuest = effectiveRole === 'guest' && itemRole === 'all';

            if (isForAdmin || isForPatient || isForGuest) {
              const notif: NotificationItem = {
                id,
                userId: itemUserId,
                role: itemRole,
                title: data.title || '',
                message: data.message || '',
                type: data.type || 'system',
                link: data.link,
                read: data.read ?? false,
                createdAt: data.createdAt || data.created_at || new Date().toISOString()
              };
              list.push(notif);

              if (!isFirstLoadRef.current && !knownIdsRef.current.has(id) && !notif.read) {
                hasNewRelevantItem = true;
                if (!newestAlertItem) newestAlertItem = notif;
              }
              knownIdsRef.current.add(id);
            }
          }

          setNotifications(list);

          // Deliver immediate multi-sensory notification to phone/desktop
          const itemToAlert: NotificationItem | null = newestAlertItem;
          if (hasNewRelevantItem && itemToAlert) {
            // 1. Play pleasant audio chime
            if (notificationSettings.soundEnabled) {
              playNotificationChime();
            }

            // 2. Vibrate phone (haptic feedback on mobile)
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate([200, 100, 200]);
              } catch {}
            }

            // 3. Trigger native browser push notification if permitted
            if (typeof window !== 'undefined' && 'Notification' in window) {
              const alertTitle = itemToAlert.title || 'Dar al Dawa Medical Center';
              const alertBody = itemToAlert.message || 'You have a new hospital notification.';
              try {
                if (Notification.permission === 'granted') {
                  new Notification(alertTitle, {
                    body: alertBody,
                    icon: '/favicon.ico'
                  });
                } else if (Notification.permission === 'default') {
                  Notification.requestPermission().then((perm) => {
                    if (perm === 'granted') {
                      new Notification(alertTitle, {
                        body: alertBody,
                        icon: '/favicon.ico'
                      });
                    }
                  });
                }
              } catch {}
            }

            // 4. Show instant floating alert on screen
            setActiveAlert(itemToAlert);
          }

          isFirstLoadRef.current = false;
        },
        (error) => {
          console.warn('Firestore notifications listener error:', error);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed to attach Firestore notification listener:', err);
    }
  }, [effectiveRole, effectiveUserId, patient?.phone, notificationSettings.soundEnabled]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { read: true });
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const unreadList = notifications.filter((n) => !n.read);
      if (unreadList.length === 0) return;

      const batch = writeBatch(db);
      unreadList.forEach((n) => {
        batch.update(doc(db, 'notifications', n.id), { read: true });
      });
      await batch.commit();
    } catch {
      // ignore
    }
  };

  const clearAll = async () => {
    setNotifications([]);
  };

  const createNotification = async (item: {
    userId?: string;
    role: 'admin' | 'patient' | 'all';
    title: string;
    message: string;
    type: NotificationItem['type'];
    link?: string;
  }) => {
    const newDoc = {
      userId: item.userId || null,
      role: item.role,
      title: item.title,
      message: item.message,
      type: item.type,
      link: item.link || null,
      read: false,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'notifications'), newDoc);
    } catch (err) {
      console.warn('Failed to insert notification into Firestore:', err);
    }
  };

  const updateNotificationSettings = (newSettings: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('dad_notification_settings', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const sendTestNotification = async (role: 'admin' | 'patient' = 'admin') => {
    playNotificationChime();
    await createNotification({
      role,
      userId: role === 'admin' ? 'admin' : effectiveUserId,
      title: 'Dar al Dawa Hospital Alert Test',
      message: `System notification test dispatched at ${new Date().toLocaleTimeString()}. Audio chime and live real-time sync verified via Cloud Firestore.`,
      type: 'system'
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        createNotification,
        notificationSettings,
        updateNotificationSettings,
        sendTestNotification
      }}
    >
      {/* Floating Instant Alert Banner across Phone / Desktop Screen */}
      {activeAlert && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-[9999] w-[94%] max-w-md animate-in slide-in-from-top-4 fade-in duration-300"
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-xs sm:text-sm text-emerald-300 truncate">
                  {activeAlert.title}
                </h4>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">Just now</span>
              </div>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                {activeAlert.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveAlert(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 shrink-0 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
