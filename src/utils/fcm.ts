/**
 * Client-Side Firebase Cloud Messaging (FCM) Integration
 * Dar al Dawa Medical Center
 */

import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { app, db } from '../firebase/config';
import { playNotificationChime } from './audioChime';

let messagingInstance: Messaging | null = null;
let isFCMSupported = false;

// Check FCM support on initial load
export const checkFCMSupport = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  try {
    const supported = await isSupported();
    isFCMSupported = supported;
    if (supported && !messagingInstance) {
      messagingInstance = getMessaging(app);
    }
    return supported;
  } catch (err) {
    console.warn('FCM isSupported check failed:', err);
    return false;
  }
};

/**
 * Register Service Worker and retrieve FCM Registration Token
 */
export const requestFcmToken = async (params: {
  role: 'admin' | 'patient' | 'guest';
  userId?: string;
  phone?: string;
  email?: string;
}): Promise<{ success: boolean; token?: string; error?: string }> => {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window not defined.' };
  }

  try {
    const supported = await checkFCMSupport();
    if (!supported) {
      return { success: false, error: 'Push notifications are not supported in this browser.' };
    }

    if (!('Notification' in window)) {
      return { success: false, error: 'Notifications API not supported.' };
    }

    // 1. Request Browser Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        error: permission === 'denied'
          ? 'Notification permission was blocked in browser settings.'
          : 'Notification permission was dismissed.'
      };
    }

    // 2. Register Service Worker if not registered
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      try {
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/'
        });
        await navigator.serviceWorker.ready;
      } catch (swErr) {
        console.warn('Could not register firebase-messaging-sw.js:', swErr);
      }
    }

    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }

    // 3. Obtain Token from FCM
    const token = await getToken(messagingInstance, {
      serviceWorkerRegistration: swRegistration
    });

    if (!token) {
      return { success: false, error: 'Failed to generate registration token from FCM.' };
    }

    // 4. Save device token into existing Firestore database (`fcm_tokens` collection)
    const sanitizedId = token.replace(/[^a-zA-Z0-9_-]/g, '').slice(-64) || `tok-${Date.now()}`;
    const tokenDocRef = doc(db, 'fcm_tokens', sanitizedId);

    const tokenPayload = {
      token,
      userId: params.userId || 'guest',
      role: params.role,
      phone: params.phone || '',
      email: params.email || '',
      deviceType: /Android/i.test(navigator.userAgent) ? 'android_chrome' : /iPhone|iPad/i.test(navigator.userAgent) ? 'ios_safari' : 'desktop',
      userAgent: navigator.userAgent.slice(0, 200),
      updatedAt: new Date().toISOString()
    };

    await setDoc(tokenDocRef, tokenPayload, { merge: true });

    // Store in localStorage for rapid client reference
    try {
      localStorage.setItem('dad_fcm_token', token);
      localStorage.setItem('dad_fcm_role', params.role);
    } catch {}

    // 5. Attach Foreground Message Listener
    listenToForegroundMessages();

    return { success: true, token };
  } catch (err: any) {
    console.warn('Error requesting FCM token:', err);
    return { success: false, error: err?.message || 'Could not register for push notifications.' };
  }
};

/**
 * Show a native device notification that reliably works across Android Chrome (via Service Worker)
 * and Desktop browsers (via Notification API), with audio chime and haptic vibration.
 */
export const showDeviceNotification = async (
  title: string,
  options?: NotificationOptions & { url?: string }
): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Play audio chime and trigger mobile vibration
    try {
      playNotificationChime();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([250, 100, 250]);
      }
    } catch {}

    if (!('Notification' in window)) return false;

    // Check or request permission
    let perm = Notification.permission;
    if (perm === 'default') {
      try {
        perm = await Notification.requestPermission();
      } catch {
        // ignore
      }
    }

    if (perm !== 'granted') return false;

    const notifOptions: any = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [250, 100, 250],
      tag: 'dad-notification',
      renotify: true,
      ...options
    };

    // 2. Android Chrome REQUIRES ServiceWorkerRegistration.showNotification()
    // Calling `new Notification()` directly in Android Chrome throws:
    // "TypeError: Failed to construct 'Notification': Illegal constructor."
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg && typeof reg.showNotification === 'function') {
          await reg.showNotification(title, notifOptions);
          return true;
        }
      } catch (swErr) {
        console.warn('SW showNotification error, falling back:', swErr);
      }
    }

    // 3. Fallback for Desktop Browsers (Chrome, Firefox, Safari)
    try {
      new Notification(title, notifOptions);
      return true;
    } catch (notifErr) {
      console.warn('Direct new Notification() failed:', notifErr);
    }
  } catch (err) {
    console.warn('showDeviceNotification error:', err);
  }
  return false;
};

/**
 * Listens for messages arriving while the website is in the active foreground tab
 */
let isListenerAttached = false;
export const listenToForegroundMessages = () => {
  if (isListenerAttached || !messagingInstance) return;
  isListenerAttached = true;

  onMessage(messagingInstance, (payload) => {
    console.log('[FCM] Foreground push message received:', payload);

    const title = payload.notification?.title || payload.data?.title || 'Hospital Alert 🩺';
    const body = payload.notification?.body || payload.data?.body || payload.data?.message || '';

    // Show native device notification reliably (Android SW + Desktop)
    showDeviceNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: payload.data?.token || 'fcm-foreground'
    }).catch(() => {});
  });
};

/**
 * Dispatch Push Notification to all Admin Devices via Secure Server Backend
 */
export const triggerAdminPush = async (params: {
  title: string;
  body: string;
  token?: string;
  type?: 'appointment' | 'registration' | 'inquiry' | 'general';
  url?: string;
}): Promise<boolean> => {
  try {
    const res = await fetch('/api/notifications/fcm/send-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not dispatch admin push via server:', err);
    return false;
  }
};

/**
 * Dispatch Push Notification to a Specific Patient via Secure Server Backend
 */
export const triggerPatientPush = async (params: {
  phone?: string;
  patientId?: string;
  title: string;
  body: string;
  token?: string;
  type?: 'appointment_confirmed' | 'appointment_cancelled' | 'reminder';
  url?: string;
}): Promise<boolean> => {
  try {
    const res = await fetch('/api/notifications/fcm/send-patient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.ok;
  } catch (err) {
    console.warn('Could not dispatch patient push via server:', err);
    return false;
  }
};
