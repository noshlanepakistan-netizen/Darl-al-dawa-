/**
 * Image Upload & Client-Side Compression Utility
 * Reads images from device gallery / camera / file system,
 * resizes and compresses them via HTML Canvas,
 * returning lightweight Base64 Data URLs.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  mimeType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 1000,
  maxHeight: 1000,
  quality: 0.8,
  mimeType: 'image/jpeg'
};

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
export const ACCEPT_IMAGE_ATTR = 'image/jpeg,image/png,image/webp,image/jpg';

/**
 * Compresses a single File object and returns a Promise resolving to base64 Data URL.
 */
export async function compressImageFile(file: File, options?: CompressOptions): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpe?g|png|webp)$/i)) {
      return reject(new Error('Please select a valid image file (JPG, PNG, or WEBP).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file from device.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image from device.'));
      img.onload = () => {
        try {
          let { width, height } = img;
          const maxW = opts.maxWidth || 1000;
          const maxH = opts.maxHeight || 1000;

          if (width > maxW || height > maxH) {
            const ratio = Math.min(maxW / width, maxH / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(e.target?.result as string);
          }

          // Fill white background for transparency in jpeg
          if (opts.mimeType === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL(opts.mimeType, opts.quality);
          resolve(dataUrl);
        } catch {
          // Fallback to original data URL if canvas fails
          resolve(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses multiple files in parallel and returns array of Data URLs.
 */
export async function compressMultipleImageFiles(
  files: FileList | File[],
  options?: CompressOptions
): Promise<string[]> {
  const fileArray = Array.from(files);
  const promises = fileArray.map((file) => compressImageFile(file, options));
  return Promise.all(promises);
}
