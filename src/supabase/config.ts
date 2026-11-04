import { createClient } from '@supabase/supabase-js';

// Supabase Connection Configuration
// If environment variables are set (e.g. in Netlify), they take priority.
// Otherwise, the fallback values below are used directly.
const rawUrl =
  import.meta.env.VITE_SUPABASE_URL || 'PASTE_YOUR_PROJECT_URL_HERE';
const rawKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'PASTE_YOUR_ANON_PUBLIC_KEY_HERE';

// Detect if valid Supabase credentials have been configured
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(rawUrl) &&
    rawUrl.startsWith('http') &&
    !rawUrl.includes('PASTE_YOUR_') &&
    Boolean(rawKey) &&
    !rawKey.includes('PASTE_YOUR_')
  );
};

// Safe initialization so createClient never crashes on startup
const supabaseUrl = isSupabaseConfigured()
  ? rawUrl
  : rawUrl.startsWith('http')
  ? rawUrl
  : 'https://placeholder.supabase.co';

const supabaseAnonKey = isSupabaseConfigured()
  ? rawKey
  : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Client-side image compressor:
 * Takes a File (e.g. from mobile camera or PC), resizes if dimensions > 1600px,
 * compresses to JPEG (quality 0.82) so uploads are fast (<300KB) and respect bandwidth.
 */
export const compressImage = async (file: File, maxDim = 1600, quality = 0.82): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // If SVG, don't compress
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
 * Uploads an image to the 'images' Supabase Storage bucket.
 * Automatically compresses the file first, generates a unique file path,
 * and returns the public CDN URL.
 */
export const uploadImageToStorage = async (file: File, folder = 'general'): Promise<string> => {
  if (!isSupabaseConfigured()) {
    // Fallback for development preview before Supabase keys are pasted
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
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
