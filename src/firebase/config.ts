import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import bundledAppletConfig from '../../firebase-applet-config.json';

/**
 * Dar al Dawa Medical Center - Firebase Client Configuration
 *
 * Safe to embed directly in client code; does NOT depend on Netlify environment variables.
 * If you have a different Firebase project, paste your configuration object below.
 */
export const firebaseConfig = {
  apiKey: bundledAppletConfig.apiKey || "AIzaSyB7mnyoZ4Qi_hDEXR0c2VL7z5Wl8LV2pOY",
  authDomain: bundledAppletConfig.authDomain || "gen-lang-client-0019179268.firebaseapp.com",
  projectId: bundledAppletConfig.projectId || "gen-lang-client-0019179268",
  firestoreDatabaseId: bundledAppletConfig.firestoreDatabaseId || "ai-studio-darlaldawa-19ecd389-339d-4fe7-833b-b757b0452621",
  storageBucket: bundledAppletConfig.storageBucket || "gen-lang-client-0019179268.firebasestorage.app",
  messagingSenderId: bundledAppletConfig.messagingSenderId || "234501490401",
  appId: bundledAppletConfig.appId || "1:234501490401:web:3022672f7e910f457119a0"
};

/**
 * Cloudinary Unsigned Upload Configuration
 * If left empty or as placeholder, images automatically upload to Firebase Storage instead.
 */
export const CLOUDINARY_CONFIG = {
  cloudName: "PASTE_CLOUD_NAME_HERE",
  uploadPreset: "PASTE_UPLOAD_PRESET_HERE"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Firestore must be initialized with the specific databaseId if configured and use long-polling for instant connection
const firestoreDbId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

export const db = (() => {
  try {
    return firestoreDbId
      ? initializeFirestore(app, { experimentalForceLongPolling: true }, firestoreDbId)
      : initializeFirestore(app, { experimentalForceLongPolling: true });
  } catch {
    return firestoreDbId ? getFirestore(app, firestoreDbId) : getFirestore(app);
  }
})();

export const auth = getAuth(app);
export const storage = getStorage(app);

/**
 * Checks whether Firebase is initialized with valid credentials.
 */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('PASTE_') &&
    !firebaseConfig.projectId.includes('PASTE_')
  );
};

/**
 * Client-side image compressor:
 * Takes a File (e.g. from camera or computer), resizes if dimensions > 1600px,
 * compresses to JPEG (quality 0.82) so uploads are fast (<300KB) and preserve bandwidth.
 */
export const compressImage = async (file: File, maxDim = 1600, quality = 0.82): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      resolve(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);

    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/jpeg',
        quality
      );
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Uploads an image:
 * 1. Checks if Cloudinary is configured (unsigned upload). If so, uploads to Cloudinary.
 * 2. Otherwise, uploads to Firebase Storage and returns the public download URL.
 */
export const uploadImageToStorage = async (file: File, folder = 'general'): Promise<string> => {
  const isCloudinaryReady =
    CLOUDINARY_CONFIG.cloudName &&
    CLOUDINARY_CONFIG.uploadPreset &&
    CLOUDINARY_CONFIG.cloudName !== 'PASTE_CLOUD_NAME_HERE' &&
    CLOUDINARY_CONFIG.uploadPreset !== 'PASTE_UPLOAD_PRESET_HERE';

  const compressedBlob = await compressImage(file);

  if (isCloudinaryReady) {
    try {
      const formData = new FormData();
      formData.append('file', compressedBlob);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', `daraldawa/${folder}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Cloudinary upload failed');
      }

      const data = await response.json();
      return data.secure_url || data.url;
    } catch (cloudinaryErr) {
      console.warn('Cloudinary upload failed, falling back to Firebase Storage:', cloudinaryErr);
    }
  }

  // Firebase Storage fallback
  try {
    const cleanExt = file.type === 'image/svg+xml' ? 'svg' : 'jpg';
    const filePath = `uploads/${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, compressedBlob, {
      contentType: file.type === 'image/svg+xml' ? 'image/svg+xml' : 'image/jpeg'
    });

    const publicUrl = await getDownloadURL(storageRef);
    return publicUrl;
  } catch (storageErr: any) {
    console.error('Firebase Storage upload error:', storageErr);
    throw new Error(storageErr?.message || 'Failed to upload image. Please check database connection.');
  }
};

/**
 * Diagnostic test connection that tests read/write to Firestore.
 */
export const testFirebaseConnection = async (): Promise<{ success: boolean; latencyMs?: number; error?: string }> => {
  const start = performance.now();
  const testId = `ping-${Date.now()}`;

  try {
    const testDocRef = doc(db, 'activity_logs', testId);
    await setDoc(testDocRef, {
      action: 'System Ping Self-Test',
      module: 'System Check',
      timestamp: new Date().toISOString(),
      details: 'Diagnostic health check ping'
    });

    const readSnap = await getDoc(testDocRef);
    if (!readSnap.exists()) {
      throw new Error('Test document was written but could not be read back.');
    }

    await deleteDoc(testDocRef);

    const latencyMs = Math.round(performance.now() - start);
    return { success: true, latencyMs };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to connect to Firebase Firestore.' };
  }
};
