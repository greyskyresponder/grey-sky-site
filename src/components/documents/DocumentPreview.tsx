// TODO: test — PDF renders in iframe, images render as img, HEIC shows download link, loading state
'use client';

import { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { getDocumentUrl } from '@/lib/actions/documents';

interface Props {
  documentId: string;
  fileType: string;
  fileName: string;
}

export default function DocumentPreview({ documentId, fileType, fileName }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const result = await getDocumentUrl(documentId);
      if (result.error) setError(result.error);
      else setUrl(result.url);
      setLoading(false);
    }
    load();
  }, [documentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-[var(--gs-cloud)]/20 rounded-lg">
        <p className="text-sm text-[var(--gs-steel)]">Loading preview...</p>
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="flex items-center justify-center h-96 bg-[var(--gs-cloud)]/20 rounded-lg">
        <p className="text-sm text-[var(--gs-alert)]">{error ?? 'Unable to load preview'}</p>
      </div>
    );
  }

  // HEIC — download only
  if (fileType === 'image/heic') {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-[var(--gs-cloud)]/20 rounded-lg">
        <FileText className="w-16 h-16 text-[var(--gs-steel)] mb-4" />
        <p className="text-sm text-[var(--gs-steel)] mb-3">HEIC files cannot be previewed in the browser.</p>
        <a
          href={url}
          download={fileName}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--gs-navy)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" />
          Download
        </a>
      </div>
    );
  }

  // PDF — iframe
  if (fileType === 'application/pdf') {
    return (
      <iframe
        src={url}
        title={fileName}
        className="w-full h-[600px] rounded-lg border border-[var(--gs-cloud)]"
      />
    );
  }

  // Images — img tag
  if (fileType.startsWith('image/')) {
    return (
      <div className="rounded-lg overflow-hidden border border-[var(--gs-cloud)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={fileName} className="w-full max-h-[600px] object-contain bg-[var(--gs-cloud)]/20" />
      </div>
    );
  }

  // Fallback
  return (
    <div className="flex flex-col items-center justify-center h-96 bg-[var(--gs-cloud)]/20 rounded-lg">
      <FileText className="w-16 h-16 text-[var(--gs-steel)] mb-4" />
      <a
        href={url}
        download={fileName}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[var(--gs-navy)] text-white rounded-lg hover:opacity-90 transition-opacity"
      >
        <Download className="w-4 h-4" />
        Download
      </a>
    </div>
  );
}
