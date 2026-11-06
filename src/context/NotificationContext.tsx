import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem, NotificationSettings } from '../types/notification';
import { supabase, isSupabaseConfigured } from '../supabase/config';
import { playNotificationChime } from '../utils/audioChime';
import { initOneSignal } from '../utils/oneSignal';

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
}> = ({ children, userRole = 'guest', userId }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('dad_notification_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Initialize OneSignal on mount
  useEffect(() => {
    initOneSignal();
  }, []);

  // Fetch notifications from Supabase
  const fetchNotifications = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(40);

      // Filter by role / userId
      if (userRole === 'admin') {
        query = query.or('role.eq.admin,role.eq.all');
      } else if (userRole === 'patient' && userId) {
        query = query.or(`user_id.eq.${userId},role.eq.all,and(role.eq.patient,user_id.is.null)`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setNotifications(
          data.map((n: any) => ({
            id: n.id,
            userId: n.user_id,
            role: n.role,
            title: n.title,
            message: n.message,
            type: n.type || 'system',
            link: n.link,
            read: n.read ?? false,
            createdAt: n.created_at
          }))
        );
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  }, [userRole, userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time listener for incoming notifications
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const item = payload.new;
          // Check if this notification is relevant to this user
          const isForAdmin = userRole === 'admin' && (item.role === 'admin' || item.role === 'all' || item.user_id === 'admin');
          const isForPatient = userRole === 'patient' && (item.user_id === userId || item.role === 'patient' || item.role === 'all');
          const isForGuest = userRole === 'guest' && item.role === 'all';

          if (isForAdmin || isForPatient || isForGuest) {
            const newNotif: NotificationItem = {
              id: item.id,
              userId: item.user_id,
              role: item.role,
              title: item.title,
              message: item.message,
              type: item.type || 'system',
              link: item.link,
              read: item.read ?? false,
              createdAt: item.created_at
            };

            setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);

            // Play gentle audio chime if sound is enabled
            if (notificationSettings.soundEnabled) {
              playNotificationChime();
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === payload.new.id ? { ...n, read: payload.new.read } : n))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userRole, userId, notificationSettings.soundEnabled]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      const ids = notifications.filter((n) => !n.read).map((n) => n.id);
      if (ids.length > 0) {
        await supabase.from('notifications').update({ read: true }).in('id', ids);
      }
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
    const newRow = {
      user_id: item.userId || null,
      role: item.role,
      title: item.title,
      message: item.message,
      type: item.type,
      link: item.link || null,
      read: false,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('notifications').insert(newRow);
    } catch (err) {
      console.warn('Failed to insert notification:', err);
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
      userId: role === 'admin' ? 'admin' : userId,
      title: 'Dar al Dawa Hospital Alert Test',
      message: `System notification test dispatched at ${new Date().toLocaleTimeString()}. Audio chime and live real-time sync verified.`,
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
