// TODO: test — AvatarUpload: validates image type/size, uploads, updates preview
'use client';

import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { uploadAvatar } from '@/lib/actions/documents';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

interface Props {
  currentUrl: string | null;
  initials?: string;
  onUploaded?: (url: string) => void;
}

export default function AvatarUpload({ currentUrl, initials, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Avatar must be JPEG, PNG, or WebP');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Avatar must be under 5 MB');
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    const { url, error: uploadError } = await uploadAvatar(formData);

    setUploading(false);
    if (uploadError || !url) {
      setError(uploadError ?? 'Upload failed');
      setPreview(currentUrl);
      return;
    }
    setPreview(url);
    onUploaded?.(url);
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative group w-24 h-24 rounded-full overflow-hidden bg-[var(--gs-cloud)] flex items-center justify-center text-[var(--gs-navy)] font-semibold text-xl disabled:opacity-60"
        aria-label="Change profile photo"
      >
        {preview ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <span>{initials ?? '?'}</span>
        )}
        <span className="absolute inset-0 bg-[var(--gs-navy)]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-6 h-6 text-[var(--gs-white)]" />
        </span>
      </button>
      <div className="text-sm">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-[var(--gs-navy)] font-medium hover:text-[var(--gs-gold)] disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : preview ? 'Change photo' : 'Upload photo'}
        </button>
        <p className="text-xs text-[var(--gs-steel)] mt-1">JPEG, PNG, or WebP. Max 5 MB.</p>
        {error && <p className="text-xs text-[var(--gs-alert)] mt-1">{error}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleChange}
        className="hidden"
        aria-label="Avatar file input"
      />
    </div>
  );
}
