/**
 * Firebase Cloud Messaging Service Worker
 * Handles background push notifications on Android Chrome & mobile browsers
 * Dar al Dawa Medical Center
 */

importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyB7mnyoZ4Qi_hDEXR0c2VL7z5Wl8LV2pOY",
  authDomain: "gen-lang-client-0019179268.firebaseapp.com",
  projectId: "gen-lang-client-0019179268",
  storageBucket: "gen-lang-client-0019179268.firebasestorage.app",
  messagingSenderId: "234501490401",
  appId: "1:234501490401:web:3022672f7e910f457119a0"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background notification reception
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM-SW] Received background message:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || 'Dar al Dawa Medical Center';
  const notificationBody = payload.notification?.body || payload.data?.body || payload.data?.message || 'New hospital notification received.';
  
  const notificationOptions = {
    body: notificationBody,
    icon: payload.notification?.icon || payload.data?.icon || '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [250, 100, 250, 100, 250],
    tag: payload.data?.tag || payload.data?.token || 'hospital-notification',
    renotify: true,
    requireInteraction: true,
    data: {
      url: payload.data?.url || (payload.data?.role === 'admin' ? '/#admin' : '/#appointment'),
      token: payload.data?.token || '',
      type: payload.data?.type || 'general'
    },
    actions: [
      {
        action: 'open_app',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle clicking on notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (let client of windowClients) {
        if ('focus' in client) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            return client.navigate(targetUrl);
          }
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
