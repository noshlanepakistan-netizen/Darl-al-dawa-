// NOTE: REST API key is NEVER used here. It is used strictly in backend Firebase Cloud Functions.

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    OneSignal?: any;
  }
}

export const ONESIGNAL_APP_ID =
  import.meta.env.VITE_ONESIGNAL_APP_ID || 'PASTE_APP_ID_HERE';

let isInitialized = false;

export const initOneSignal = () => {
  if (typeof window === 'undefined') return;
  if (isInitialized) return;

  // Check if placeholder is still set
  if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'PASTE_APP_ID_HERE') {
    return;
  }

  window.OneSignalDeferred = window.OneSignalDeferred || [];

  // Inject OneSignal SDK script if not already present
  if (!document.getElementById('onesignal-sdk')) {
    const script = document.createElement('script');
    script.id = 'onesignal-sdk';
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
        notifyButton: {
          enable: false
        }
      });
      isInitialized = true;
    } catch (err) {
      console.warn('OneSignal initialization warning:', err);
    }
  });
};

export const requestPushPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      try {
        if (!OneSignal?.Notifications) {
          resolve(false);
          return;
        }
        const permission = await OneSignal.Notifications.requestPermission();
        resolve(permission === true || permission === 'granted');
      } catch {
        resolve(false);
      }
    });
  });
};

export const tagAdminDevice = () => {
  if (typeof window === 'undefined') return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      if (OneSignal?.User) {
        await OneSignal.User.addTags({ role: 'admin', hospital: 'dar_al_dawa' });
      }
    } catch {
      // ignore
    }
  });
};

export const tagPatientDevice = (patientId: string, email?: string) => {
  if (typeof window === 'undefined' || !patientId) return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      if (OneSignal?.login) {
        await OneSignal.login(patientId);
      }
      if (OneSignal?.User) {
        const tags: Record<string, string> = { role: 'patient' };
        if (email) tags.email = email;
        await OneSignal.User.addTags(tags);
      }
    } catch {
      // ignore
    }
  });
};

export const tagGuestDevice = (appointmentToken: string) => {
  if (typeof window === 'undefined' || !appointmentToken) return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      if (OneSignal?.User) {
        await OneSignal.User.addTags({
          role: 'guest_patient',
          last_token: appointmentToken
        });
      }
    } catch {
      // ignore
    }
  });
};

export const logoutOneSignal = () => {
  if (typeof window === 'undefined') return;
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OneSignal: any) => {
    try {
      if (OneSignal?.logout) {
        await OneSignal.logout();
      }
    } catch {
      // ignore
    }
  });
};
