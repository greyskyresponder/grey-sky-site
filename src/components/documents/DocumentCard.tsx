// TODO: test — renders thumbnail, title, category badge, date, verification badge, file size
import Link from 'next/link';
import { FileText, Image } from 'lucide-react';
import type { DocumentSummary } from '@/lib/types/documents';

const categoryLabels: Record<string, string> = {
  certification: 'Certification',
  training: 'Training',
  deployment: 'Deployment',
  identification: 'ID',
  medical: 'Medical',
  assessment: 'Assessment',
  correspondence: 'Correspondence',
  membership: 'Membership',
  other: 'Other',
};

const verificationColors: Record<string, string> = {
  uploaded: 'bg-gray-100 text-gray-600',
  reviewed: 'bg-blue-100 text-blue-700',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentCard({ doc }: { doc: DocumentSummary }) {
  const isImage = doc.file_type.startsWith('image/');
  const displayTitle = doc.title || doc.file_name;

  return (
    <Link
      href={`/dashboard/documents/${doc.id}`}
      className="block border border-[var(--gs-cloud)] rounded-lg p-4 hover:border-[var(--gs-gold)] transition-colors"
    >
      <div className="flex items-center justify-center h-24 bg-[var(--gs-cloud)]/30 rounded mb-3">
        {isImage ? (
          <Image className="w-10 h-10 text-[var(--gs-steel)]" />
        ) : (
          <FileText className="w-10 h-10 text-[var(--gs-steel)]" />
        )}
      </div>
      <p className="text-sm font-medium text-[var(--gs-navy)] truncate" title={displayTitle}>{displayTitle}</p>
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)]">
          {categoryLabels[doc.category] ?? doc.category}
        </span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${verificationColors[doc.verification_status] ?? verificationColors.uploaded}`}>
          {doc.verification_status}
        </span>
      </div>
      <div className="flex items-center justify-between mt-2 text-xs text-[var(--gs-steel)]">
        <span>{doc.document_date ?? new Date(doc.created_at).toLocaleDateString()}</span>
        <span>{formatSize(doc.file_size)}</span>
      </div>
    </Link>
  );
}
