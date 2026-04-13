// TODO: test — drag-and-drop triggers, file type/size validation, preview shows after selection
'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_SIZE = 10 * 1024 * 1024;

interface Props {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export default function FileDropzone({ onFileSelect, selectedFile, onClear }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = useCallback((file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('File must be PDF, JPEG, PNG, WebP, or HEIC');
      return false;
    }
    if (file.size > MAX_SIZE) {
      setError('File must be under 10 MB');
      return false;
    }
    setError(null);
    return true;
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && validate(file)) onFileSelect(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && validate(file)) onFileSelect(file);
  }

  const isImage = selectedFile && selectedFile.type.startsWith('image/');

  if (selectedFile) {
    return (
      <div className="border border-[var(--gs-cloud)] rounded-lg p-4 flex items-center gap-4">
        {isImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={URL.createObjectURL(selectedFile)}
            alt=""
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-[var(--gs-cloud)]/50 rounded flex items-center justify-center">
            <FileText className="w-8 h-8 text-[var(--gs-steel)]" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--gs-navy)] truncate">{selectedFile.name}</p>
          <p className="text-xs text-[var(--gs-steel)]">{(selectedFile.size / 1024).toFixed(0)} KB</p>
        </div>
        <button type="button" onClick={onClear} className="p-1 text-[var(--gs-steel)] hover:text-[var(--gs-alert)]" aria-label="Remove file">
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-[var(--gs-gold)] bg-[var(--gs-gold)]/5'
            : 'border-[var(--gs-cloud)] hover:border-[var(--gs-navy)]'
        }`}
        role="button"
        tabIndex={0}
        aria-label="Upload a document — drag and drop or click to browse"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        <Upload className="w-8 h-8 text-[var(--gs-steel)] mx-auto mb-2" />
        <p className="text-sm text-[var(--gs-navy)] font-medium">
          {dragging ? 'Drop your file here' : 'Drag and drop or click to browse'}
        </p>
        <p className="text-xs text-[var(--gs-steel)] mt-1">
          PDF, JPEG, PNG, WebP, or HEIC. Max 10 MB.
        </p>
      </div>
      {error && <p className="text-xs text-[var(--gs-alert)] mt-2">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
        onChange={handleChange}
        className="hidden"
        aria-label="File input"
      />
    </div>
  );
}
