import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, RefreshCw, Plus, Check } from 'lucide-react';
import { uploadImageToStorage } from '../../supabase/config';
import { ACCEPT_IMAGE_ATTR } from '../utils/imageUpload';

interface SingleImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  aspectRatio?: 'square' | 'wide' | 'avatar';
  helpText?: string;
  required?: boolean;
  folder?: string;
}

export const ImageUploadField: React.FC<SingleImageUploadProps> = ({
  label,
  value,
  onChange,
  onRemove,
  aspectRatio = 'square',
  helpText,
  required = false,
  folder = 'hospital'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);
    try {
      const publicUrl = await uploadImageToStorage(file, folder);
      onChange(publicUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to process and upload image');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTriggerClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
  };

  const aspectClass =
    aspectRatio === 'avatar'
      ? 'w-24 h-24 rounded-full'
      : aspectRatio === 'wide'
      ? 'w-full h-44 rounded-2xl'
      : 'w-32 h-32 rounded-2xl';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {helpText && <span className="text-[11px] text-slate-400">{helpText}</span>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_IMAGE_ATTR}
        onChange={handleFileSelect}
        className="hidden"
      />

      {value ? (
        <div className="flex items-start gap-3">
          <div className={`relative overflow-hidden border border-slate-200 bg-slate-100 shadow-xs flex-shrink-0 ${aspectClass}`}>
            <img
              src={value}
              alt={label}
              className="w-full h-full object-cover"
            />
            {loading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-1">
            <button
              type="button"
              onClick={handleTriggerClick}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>{loading ? 'Uploading...' : 'Change Image'}</span>
            </button>

            <button
              type="button"
              onClick={handleRemove}
              className="block text-xs text-red-600 hover:text-red-800 hover:underline font-medium cursor-pointer"
            >
              Remove
            </button>
            <div className="text-[10px] text-slate-400">Uploads to Supabase Storage (auto-compressed)</div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleTriggerClick}
          className={`border-2 border-dashed border-slate-300 hover:border-[#1E5AA8] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/30 flex flex-col items-center justify-center gap-2 group ${
            aspectRatio === 'wide' ? 'h-36' : 'h-28'
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-1">
              <RefreshCw className="w-6 h-6 text-[#1E5AA8] animate-spin" />
              <span className="text-[11px] text-slate-500 font-medium">Compressing & Uploading to Supabase...</span>
            </div>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-2xs text-slate-500 group-hover:text-[#1E5AA8] group-hover:border-blue-200 flex items-center justify-center transition-colors">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#1E5AA8] group-hover:underline">
                  Choose from Gallery / Files
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  JPG, PNG, WEBP (auto-compressed & stored in Supabase)
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};

interface MultipleImageUploadProps {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  maxCount?: number;
  helpText?: string;
  folder?: string;
}

export const MultipleImageUploadField: React.FC<MultipleImageUploadProps> = ({
  label,
  values = [],
  onChange,
  maxCount = 12,
  helpText,
  folder = 'gallery'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMultipleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setLoading(true);
    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadImageToStorage(file, folder)
      );
      const publicUrls = await Promise.all(uploadPromises);
      const combined = [...values, ...publicUrls].slice(0, maxCount);
      onChange(combined);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload images');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveIndex = (idx: number) => {
    const updated = values.filter((_, i) => i !== idx);
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          {label} ({values.length}/{maxCount})
        </label>
        {helpText && <span className="text-[11px] text-slate-400">{helpText}</span>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_IMAGE_ATTR}
        onChange={handleMultipleSelect}
        className="hidden"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {values.map((imgUrl, idx) => (
          <div
            key={idx}
            className="group relative h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
          >
            <img src={imgUrl} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemoveIndex(idx)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow-xs cursor-pointer"
              title="Remove image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {values.length < maxCount && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#1E5AA8] bg-slate-50 hover:bg-blue-50/30 flex flex-col items-center justify-center text-slate-500 hover:text-[#1E5AA8] transition-colors cursor-pointer gap-1"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-[#1E5AA8]" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span className="text-[11px] font-semibold">Add Photos</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
