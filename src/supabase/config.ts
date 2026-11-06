import { createClient, SupabaseClient } from '@supabase/supabase-js';

// LocalStorage keys for browser-configured credentials
const STORAGE_KEY_URL = 'daraldawa_supabase_url';
const STORAGE_KEY_ANON = 'daraldawa_supabase_anon_key';

/**
 * Retrieves the currently active Supabase URL.
 * Priority:
 * 1. Saved in browser localStorage (allows instant admin setup directly from UI)
 * 2. Vite environment variable (VITE_SUPABASE_URL in Netlify/Vercel)
 * 3. Fallback placeholder
 */
export const getSupabaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_URL);
      if (saved && (saved.startsWith('http://') || saved.startsWith('https://')) && !saved.includes('PASTE_YOUR_PROJECT_URL_HERE')) {
        return saved.trim().replace(/\/+$/, '');
      }
    } catch {
      // ignore localStorage security error in sandboxed frames
    }
  }

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http') && !envUrl.includes('PASTE_YOUR_PROJECT_URL_HERE')) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  return 'PASTE_YOUR_PROJECT_URL_HERE';
};

/**
 * Retrieves the currently active Supabase Anon Public Key.
 * Priority:
 * 1. Saved in browser localStorage
 * 2. Vite environment variable (VITE_SUPABASE_ANON_KEY)
 * 3. Fallback placeholder
 */
export const getSupabaseAnonKey = (): string => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANON);
      if (saved && !saved.includes('PASTE_YOUR_ANON_KEY_HERE') && saved.length > 20) {
        return saved.trim();
      }
    } catch {
      // ignore
    }
  }

  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envKey && typeof envKey === 'string' && !envKey.includes('PASTE_YOUR_ANON_KEY_HERE') && envKey.length > 20) {
    return envKey.trim();
  }

  return 'PASTE_YOUR_ANON_KEY_HERE';
};

/**
 * Checks whether Supabase is configured with a valid, non-placeholder URL and Key.
 */
export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  const isUrlValid =
    Boolean(url) &&
    (url.startsWith('https://') || url.startsWith('http://')) &&
    !url.includes('PASTE_YOUR_PROJECT_URL_HERE') &&
    !url.includes('placeholder.supabase.co');

  const isKeyValid =
    Boolean(key) &&
    !key.includes('PASTE_YOUR_ANON_KEY_HERE') &&
    key.length > 20;

  return isUrlValid && isKeyValid;
};

// Internal active client reference
let activeClient: SupabaseClient = createClient(
  isSupabaseConfigured() ? getSupabaseUrl() : 'https://placeholder.supabase.co',
  isSupabaseConfigured() ? getSupabaseAnonKey() : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

/**
 * Save new Supabase credentials in browser localStorage and immediately re-initialize the client.
 */
export const saveSupabaseCredentials = (
  rawUrl: string,
  rawKey: string
): { success: boolean; error?: string } => {
  const url = (rawUrl || '').trim().replace(/\/+$/, '');
  const key = (rawKey || '').trim();

  if (!url) {
    return { success: false, error: 'Supabase Project URL is required.' };
  }
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    return { success: false, error: 'URL must start with https:// (e.g. https://xyz.supabase.co)' };
  }
  if (url.includes('PASTE_YOUR_PROJECT_URL_HERE')) {
    return { success: false, error: 'Please enter your actual Supabase URL, not the placeholder.' };
  }
  if (!key || key.length < 20 || key.includes('PASTE_YOUR_ANON_KEY_HERE')) {
    return { success: false, error: 'Please enter a valid Supabase anon public key (usually starts with eyJ...).' };
  }

  try {
    localStorage.setItem(STORAGE_KEY_URL, url);
    localStorage.setItem(STORAGE_KEY_ANON, key);

    // Recreate active client
    activeClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to save credentials in localStorage.' };
  }
};

/**
 * Clears saved Supabase credentials from browser localStorage.
 */
export const clearSupabaseCredentials = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
  } catch {
    // ignore
  }
};

/**
 * Proxy export for Supabase Client so all existing `supabase.from(...)` imports dynamically
 * route to the active client without requiring page reload or code changes.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const val = (activeClient as any)[prop];
    if (typeof val === 'function') {
      return val.bind(activeClient);
    }
    return val;
  }
});

// Backward-compatibility exports
export const SUPABASE_URL: string = getSupabaseUrl();
export const SUPABASE_ANON_KEY: string = getSupabaseAnonKey();

/**
 * Client-side image compressor:
 * Takes a File (e.g. from mobile camera or PC), resizes if dimensions > 1600px,
 * compresses to JPEG (quality 0.82) so uploads are fast (<300KB) and respect bandwidth.
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

    img.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads an image directly to the 'images' Supabase Storage bucket.
 * Automatically compresses the file first, generates a unique file path,
 * and returns the public CDN URL.
 */
export const uploadImageToStorage = async (file: File, folder = 'general'): Promise<string> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please connect your Supabase database in System Check.');
  }

  try {
    const compressedBlob = await compressImage(file);
    const cleanExt = file.type === 'image/svg+xml' ? 'svg' : 'jpg';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, compressedBlob, {
        contentType: file.type === 'image/svg+xml' ? 'image/svg+xml' : 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
    return data.publicUrl;
  } catch (err) {
    console.error('Failed to upload image to Supabase:', err);
    throw err;
  }
};
