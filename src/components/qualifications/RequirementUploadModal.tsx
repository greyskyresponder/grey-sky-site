'use client';

import { useEffect, useState, useTransition } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { getMyDocuments, uploadDocument } from '@/lib/actions/documents';
import { attachDocumentToRequirement } from '@/lib/actions/requirements';
import type { DocumentCategory } from '@/lib/types/enums';
import type { RequirementSlotView } from '@/lib/types/requirements';

type DocRow = {
  id: string;
  file_name: string;
  title: string | null;
  category: DocumentCategory;
};

/**
 * Outer shell — gates on slot != null, then renders the inner form
 * keyed on requirement ID so React remounts (and resets state) automatically
 * when a different slot is selected. Avoids setState-in-effect lint errors.
 */
export default function RequirementUploadModal({
  slot,
  onClose,
  onAttached,
}: {
  slot: RequirementSlotView | null;
  onClose: () => void;
  onAttached: () => void;
}) {
  if (!slot) return null;

  return (
    <RequirementUploadForm
      key={slot.requirement.id}
      slot={slot}
      onClose={onClose}
      onAttached={onAttached}
    />
  );
}

function RequirementUploadForm({
  slot,
  onClose,
  onAttached,
}: {
  slot: RequirementSlotView;
  onClose: () => void;
  onAttached: () => void;
}) {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [existing, setExisting] = useState<DocRow[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [documentDate, setDocumentDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Fetch existing documents on mount (runs once per key/slot)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await getMyDocuments({ page: 1, per_page: 50 });
      if (cancelled) return;
      setExisting(
        data.map((d) => ({
          id: d.id,
          file_name: d.file_name,
          title: d.title,
          category: d.category,
        }))
      );
    })();
    return () => { cancelled = true; };
  }, []);

  function suggestedCategory(): DocumentCategory {
    return (slot.requirement.document_category ?? 'other') as DocumentCategory;
  }

  function submit() {
    setError(null);

    startTransition(async () => {
      let documentId = selectedDocId;

      if (mode === 'new') {
        if (!file) {
          setError('Please choose a file to upload.');
          return;
        }
        const fd = new FormData();
        fd.append('file', file);
        fd.append('title', slot.requirement.title);
        fd.append('category', suggestedCategory());
        if (documentDate) fd.append('document_date', documentDate);
        const upRes = await uploadDocument(fd);
        if (upRes.error || !upRes.id) {
          setError(upRes.error ?? 'Upload failed');
          return;
        }
        documentId = upRes.id;
      }

      if (!documentId) {
        setError('Please select a document.');
        return;
      }

      const attachRes = await attachDocumentToRequirement({
        requirement_id: slot.requirement.id,
        document_id: documentId,
        document_date: documentDate || '',
        notes: notes || '',
      });

      if (attachRes.error) {
        setError(attachRes.error);
        return;
      }

      onAttached();
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[8vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Upload for requirement"
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl flex flex-col max-h-[84vh]">
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-[var(--gs-navy,#0A1628)]">
              Upload for: {slot.requirement.title}
            </h2>
            {slot.requirement.code && (
              <p className="text-xs text-[var(--gs-gold,#C5933A)] font-mono mt-0.5">
                {slot.requirement.code}
              </p>
            )}
            <p className="text-xs text-[var(--gs-steel,#6B7280)] mt-1">
              Staff verifies every upload. You can attach a file now or pick from documents you&apos;ve already uploaded.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 border-b border-gray-200 flex gap-2">
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
              mode === 'new'
                ? 'bg-[var(--gs-navy,#0A1628)] text-white'
                : 'bg-gray-100 text-[var(--gs-steel,#6B7280)] hover:bg-gray-200'
            }`}
          >
            Upload new
          </button>
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
              mode === 'existing'
                ? 'bg-[var(--gs-navy,#0A1628)] text-white'
                : 'bg-gray-100 text-[var(--gs-steel,#6B7280)] hover:bg-gray-200'
            }`}
          >
            Use existing document
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {error && (
            <div className="px-3 py-2 rounded bg-red-50 text-red-800 text-sm">{error}</div>
          )}

          {mode === 'new' ? (
            <>
              <label className="block">
                <span className="text-xs font-semibold text-[var(--gs-navy,#0A1628)] uppercase tracking-wide">
                  File (PDF or image, max 10 MB)
                </span>
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp,image/heic"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="mt-1 block w-full text-sm"
                />
              </label>
            </>
          ) : (
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded">
              {existing.length === 0 ? (
                <p className="px-3 py-4 text-sm text-[var(--gs-steel,#6B7280)]">
                  No documents in your library yet.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {existing.map((d) => (
                    <li key={d.id}>
                      <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="pick-doc"
                          value={d.id}
                          checked={selectedDocId === d.id}
                          onChange={() => setSelectedDocId(d.id)}
                          className="text-[var(--gs-gold,#C5933A)]"
                        />
                        <FileText className="w-4 h-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--gs-navy,#0A1628)] truncate">
                            {d.title || d.file_name}
                          </p>
                          <p className="text-xs text-[var(--gs-steel,#6B7280)] truncate">{d.category}</p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <label className="block">
            <span className="text-xs font-semibold text-[var(--gs-navy,#0A1628)] uppercase tracking-wide">
              Document date (optional)
            </span>
            <input
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gs-gold,#C5933A)]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-[var(--gs-navy,#0A1628)] uppercase tracking-wide">
              Notes for the verifier (optional)
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--gs-gold,#C5933A)]"
              placeholder="Anything staff should know when reviewing — equivalent course, re-issue number, etc."
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--gs-steel,#6B7280)] hover:text-[var(--gs-navy,#0A1628)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[var(--gs-gold,#C5933A)] text-[var(--gs-navy,#0A1628)] rounded hover:bg-[var(--gs-gold,#C5933A)]/90 disabled:opacity-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {isPending ? 'Submitting…' : 'Submit for review'}
          </button>
        </div>
      </div>
    </div>
  );
}
