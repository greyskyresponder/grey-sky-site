'use client';

import { useState, useRef } from 'react';
import { uploadAvatarAction } from '@/lib/actions/profile';

interface Props {
  currentUrl: string | null;
  firstName: string;
  lastName: string;
}

export function AvatarUpload({ currentUrl, firstName, lastName }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (file.size > 2 * 1024 * 1024) {
      setError('File must be under 2 MB');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('File must be JPEG, PNG, or WebP');
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.set('avatar', file);

    const result = await uploadAvatarAction(formData);
    if (result.error) {
      setError(result.error);
      setPreview(currentUrl);
    } else if (result.url) {
      setPreview(result.url);
    }
    setUploading(false);
  }

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={preview}
          alt=""
          className="w-16 h-16 rounded-full object-cover border-2 border-[var(--gs-cloud)]"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-[var(--gs-navy)] flex items-center justify-center text-white font-bold">
          {initials}
        </div>
      )}
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-medium text-[var(--gs-navy)] hover:text-[var(--gs-gold)] transition-colors disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Change photo'}
        </button>
        <p className="text-xs text-[var(--gs-steel)] mt-0.5">
          JPEG, PNG, or WebP. Max 2 MB.
        </p>
        {error && (
          <p className="text-xs text-[var(--gs-alert)] mt-1">{error}</p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        aria-label="Upload profile photo"
        className="hidden"
      />
    </div>
  );
}
