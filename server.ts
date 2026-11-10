/**
 * Server-Side Backend for Dar al Dawa Medical Center
 * Express server running on port 3000 mounting Vite middlewares in dev
 * Handles secure Firebase Cloud Messaging (FCM) push notification delivery
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp as initAdminApp, getApps as getAdminApps, getApp as getAdminApp, App as AdminApp } from 'firebase-admin/app';
import { getMessaging, MulticastMessage } from 'firebase-admin/messaging';
import { initializeApp as initClientApp, getApps as getClientApps } from 'firebase/app';
import { initializeFirestore, collection, getDocs, query, where, doc, deleteDoc, addDoc } from 'firebase/firestore';
import bundledConfig from './firebase-applet-config.json' with { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// 1. Initialize Firebase Client SDK for reliable Firestore access
const clientApp = !getClientApps().length
  ? initClientApp({
      apiKey: bundledConfig.apiKey,
      projectId: bundledConfig.projectId,
      authDomain: bundledConfig.authDomain
    })
  : getClientApps()[0];

const clientDb = initializeFirestore(clientApp, {}, bundledConfig.firestoreDatabaseId);

// 2. Initialize Firebase Admin SDK for FCM message dispatch
let adminApp: AdminApp | null = null;
try {
  if (!getAdminApps().length) {
    adminApp = initAdminApp({
      projectId: bundledConfig.projectId || 'gen-lang-client-0019179268'
    });
  } else {
    adminApp = getAdminApp();
  }
} catch (err: any) {
  console.warn('[Server] Firebase Admin init notice:', err?.message || err);
}

// ----------------------------------------------------------------------------
// NOTIFICATION API ROUTES
// ----------------------------------------------------------------------------

/**
 * Health check endpoint
 */
app.get('/api/notifications/status', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    projectId: bundledConfig.projectId,
    firestoreDatabaseId: bundledConfig.firestoreDatabaseId,
    fcmReady: !!adminApp,
    serverTime: new Date().toISOString()
  });
});

/**
 * Send FCM push notification to all Hospital Admin devices
 * Used for: New Appointment Bookings, New Patient Registrations, Contact Messages
 */
app.post('/api/notifications/fcm/send-admin', async (req: Request, res: Response) => {
  const { title, body, token: apptToken, type = 'general', url = '/#admin' } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required.' });
  }

  try {
    // 1. Retrieve admin tokens from Firestore
    const tokensRef = collection(clientDb, 'fcm_tokens');
    const q = query(tokensRef, where('role', '==', 'admin'));
    const snap = await getDocs(q);

    const targetTokens: string[] = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.token && typeof data.token === 'string') {
        targetTokens.push(data.token);
      }
    });

    // Also persist notification into Firestore `notifications` collection
    try {
      await addDoc(collection(clientDb, 'notifications'), {
        role: 'admin',
        userId: 'admin',
        title,
        message: body,
        type: type || 'general',
        token: apptToken || '',
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch {}

    if (targetTokens.length === 0) {
      console.log('[FCM-Server] No registered admin device tokens found.');
      return res.json({
        success: true,
        message: 'Notification recorded. No active admin device tokens registered yet.',
        deliveredCount: 0
      });
    }

    // 2. Dispatch FCM Multicast message
    let deliveredCount = 0;
    try {
      const payload: MulticastMessage = {
        tokens: targetTokens,
        notification: {
          title: title || 'Dar al Dawa Hospital Admin 🩺',
          body: body || ''
        },
        data: {
          title: title || '',
          body: body || '',
          url: url || '/#admin',
          role: 'admin',
          token: apptToken || '',
          type
        },
        android: {
          priority: 'high',
          notification: {
            icon: 'stock_ticker_update',
            color: '#1E5AA8',
            sound: 'default'
          }
        }
      };

      const messaging = adminApp ? getMessaging(adminApp) : getMessaging();
      const response = await messaging.sendEachForMulticast(payload);
      deliveredCount = response.successCount;
      console.log(`[FCM-Server] Admin push response: ${response.successCount} succeeded, ${response.failureCount} failed.`);

      // Clean up invalid tokens
      if (response.failureCount > 0) {
        response.responses.forEach(async (resp, idx) => {
          if (!resp.success && resp.error) {
            const errCode = resp.error.code;
            if (
              errCode === 'messaging/invalid-registration-token' ||
              errCode === 'messaging/registration-token-not-registered'
            ) {
              const badToken = targetTokens[idx];
              const sanitizedId = badToken.replace(/[^a-zA-Z0-9_-]/g, '').slice(-64);
              deleteDoc(doc(clientDb, 'fcm_tokens', sanitizedId)).catch(() => {});
            }
          }
        });
      }
    } catch (fcmErr: any) {
      console.warn('[FCM-Server] FCM transport dispatch note:', fcmErr?.message || fcmErr);
    }

    return res.json({
      success: true,
      deliveredCount,
      totalTokens: targetTokens.length
    });
  } catch (err: any) {
    console.error('[FCM-Server] Admin push notification error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to dispatch admin notification.'
    });
  }
});

/**
 * Send FCM push notification to a specific Patient
 * Used for: Appointment Confirmation, Reschedule, Cancellation, and Reminders
 */
app.post('/api/notifications/fcm/send-patient', async (req: Request, res: Response) => {
  const { phone, patientId, title, body, token: apptToken, type = 'appointment_status', url = '/#appointment' } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required.' });
  }

  try {
    const tokensRef = collection(clientDb, 'fcm_tokens');
    const targetTokens: string[] = [];

    // Query tokens by patientId
    if (patientId) {
      const q = query(tokensRef, where('userId', '==', patientId));
      const snap = await getDocs(q);
      snap.forEach((d) => {
        const val = d.data().token;
        if (val && !targetTokens.includes(val)) targetTokens.push(val);
      });
    }

    // Query tokens by phone number
    if (phone) {
      const cleanDigits = phone.replace(/\D/g, '');
      const allSnap = await getDocs(tokensRef);
      allSnap.forEach((d) => {
        const data = d.data();
        if (data.phone) {
          const dDigits = data.phone.replace(/\D/g, '');
          if (dDigits.includes(cleanDigits) || cleanDigits.includes(dDigits)) {
            if (data.token && !targetTokens.includes(data.token)) targetTokens.push(data.token);
          }
        }
      });
    }

    // Also persist in Firestore `notifications` collection
    try {
      await addDoc(collection(clientDb, 'notifications'), {
        role: 'patient',
        userId: patientId || '',
        phone: phone || '',
        title,
        message: body,
        type: type || 'general',
        token: apptToken || '',
        read: false,
        createdAt: new Date().toISOString()
      });
    } catch {}

    if (targetTokens.length === 0) {
      console.log(`[FCM-Server] No registered tokens for patient ${patientId || phone}.`);
      return res.json({
        success: true,
        message: 'Notification recorded. No active device tokens for this patient yet.',
        deliveredCount: 0
      });
    }

    let deliveredCount = 0;
    try {
      const payload: MulticastMessage = {
        tokens: targetTokens,
        notification: {
          title: title || 'Dar al Dawa Medical Center',
          body: body || ''
        },
        data: {
          title: title || '',
          body: body || '',
          url: url || '/#appointment',
          role: 'patient',
          token: apptToken || '',
          type
        },
        android: {
          priority: 'high',
          notification: {
            icon: 'stock_ticker_update',
            color: '#2E9E5B',
            sound: 'default'
          }
        }
      };

      const messaging = adminApp ? getMessaging(adminApp) : getMessaging();
      const response = await messaging.sendEachForMulticast(payload);
      deliveredCount = response.successCount;
      console.log(`[FCM-Server] Patient push response: ${response.successCount} succeeded, ${response.failureCount} failed.`);
    } catch (fcmErr: any) {
      console.warn('[FCM-Server] FCM patient transport note:', fcmErr?.message || fcmErr);
    }

    return res.json({
      success: true,
      deliveredCount,
      totalTokens: targetTokens.length
    });
  } catch (err: any) {
    console.error('[FCM-Server] Patient push notification error:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to dispatch patient notification.'
    });
  }
});

// ----------------------------------------------------------------------------
// SERVER HOSTING & VITE MIDDLEWARE SETUP
// ----------------------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Server] Dar al Dawa Medical Center live on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Critical start error:', err);
  process.exit(1);
});
