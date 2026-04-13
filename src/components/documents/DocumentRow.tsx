// TODO: test — compact row with icon, title, category badge, date, size, verification badge
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

export default function DocumentRow({ doc }: { doc: DocumentSummary }) {
  const isImage = doc.file_type.startsWith('image/');
  const displayTitle = doc.title || doc.file_name;
  const Icon = isImage ? Image : FileText;

  return (
    <Link
      href={`/dashboard/documents/${doc.id}`}
      className="flex items-center gap-3 border border-[var(--gs-cloud)] rounded-lg p-3 hover:border-[var(--gs-gold)] transition-colors"
    >
      <Icon className="w-5 h-5 text-[var(--gs-steel)] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--gs-navy)] truncate">{displayTitle}</p>
        {doc.linked_qualification_name && (
          <p className="text-xs text-[var(--gs-steel)] truncate">Linked: {doc.linked_qualification_name}</p>
        )}
      </div>
      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)]">
        {categoryLabels[doc.category] ?? doc.category}
      </span>
      <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${verificationColors[doc.verification_status] ?? verificationColors.uploaded}`}>
        {doc.verification_status}
      </span>
      <span className="text-xs text-[var(--gs-steel)] flex-shrink-0">{formatSize(doc.file_size)}</span>
      <span className="text-xs text-[var(--gs-steel)] flex-shrink-0 hidden sm:inline">
        {doc.document_date ?? new Date(doc.created_at).toLocaleDateString()}
      </span>
    </Link>
  );
}
