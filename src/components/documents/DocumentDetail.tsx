// TODO: test — renders preview, metadata, linked entities, archive confirmation, privacy badge
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Archive, Link2, Unlink } from 'lucide-react';
import { archiveDocument, linkDocumentToQualification, unlinkDocument } from '@/lib/actions/documents';
import DocumentPreview from './DocumentPreview';
import DocumentLinkSelector from './DocumentLinkSelector';
import type { Document } from '@/lib/types/documents';

const categoryLabels: Record<string, string> = {
  certification: 'Certifications & Licenses',
  training: 'Training Records',
  deployment: 'Deployment Records',
  identification: 'Identification',
  medical: 'Medical Records',
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

export default function DocumentDetail({ document: doc }: { document: Document }) {
  const router = useRouter();
  const [archiving, setArchiving] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [linkingQual, setLinkingQual] = useState(false);
  const [selectedQualId, setSelectedQualId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayTitle = doc.title || doc.file_name;
  const isSensitive = ['identification', 'medical'].includes(doc.category);
  const canLinkQual = ['certification', 'training'].includes(doc.category);

  async function handleArchive() {
    setArchiving(true);
    const result = await archiveDocument(doc.id);
    if (result.error) {
      setError(result.error);
      setArchiving(false);
    } else {
      router.push('/dashboard/documents');
    }
  }

  async function handleLinkQual() {
    if (!selectedQualId) return;
    const result = await linkDocumentToQualification(doc.id, selectedQualId);
    if (result.error) setError(result.error);
    else { setLinkingQual(false); router.refresh(); }
  }

  async function handleUnlinkQual() {
    const result = await unlinkDocument(doc.id, 'qualification');
    if (result.error) setError(result.error);
    else router.refresh();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/documents"
        className="inline-flex items-center gap-1 text-sm text-[var(--gs-steel)] hover:text-[var(--gs-navy)] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Documents
      </Link>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview */}
        <div className="lg:col-span-2">
          <DocumentPreview documentId={doc.id} fileType={doc.file_type} fileName={doc.file_name} />
        </div>

        {/* Metadata panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-5">
            <h2 className="text-lg font-bold text-[var(--gs-navy)] mb-3">{displayTitle}</h2>

            {isSensitive && (
              <div className="p-2.5 rounded bg-[var(--gs-navy)]/5 border border-[var(--gs-navy)]/10 text-xs text-[var(--gs-steel)] mb-3">
                This document contains sensitive personal information. It is visible only to you and Grey Sky staff.
              </div>
            )}

            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-xs font-medium text-[var(--gs-steel)] uppercase">Category</dt>
                <dd className="text-[var(--gs-navy)]">{categoryLabels[doc.category] ?? doc.category}</dd>
              </div>
              {doc.subcategory && (
                <div>
                  <dt className="text-xs font-medium text-[var(--gs-steel)] uppercase">Subcategory</dt>
                  <dd className="text-[var(--gs-navy)]">{doc.subcategory}</dd>
                </div>
              )}
              {doc.issuing_authority && (
                <div>
                  <dt className="text-xs font-medium text-[var(--gs-steel)] uppercase">Issuing Authority</dt>
                  <dd className="text-[var(--gs-navy)]">{doc.issuing_authority}</dd>
                </div>
              )}
              {doc.document_date && (
                <div>
                  <dt className="text-xs font-medium text-[var(--gs-steel)] uppercase">Document Date</dt>
                  <dd className="text-[var(--gs-navy)]">{doc.document_date}</dd>
                </div>
              )}
              {doc.expiration_date && (
                <div>
                  <dt className="text-xs font-medium text-[var(--gs-steel)] uppercase">Expiration</dt>
                  <dd className={new Date(doc.expiration_date) < new Date() ? 'text-[var(--gs-alert)]' : 'text-[var(--gs-navy)]'}>
                    {doc.expiration_date}
                    {new Date(doc.expiration_date) < new Date() && ' (expired)'}
                  </dd>
                </div>
              )}
              {doc.description && (
                <div>
                  <dt className="text-xs font-medium text-[var(--gs-steel)] uppercase">Description</dt>
                  <dd className="text-[var(--gs-navy)]">{doc.description}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs font-medium text-[var(--gs-steel)] uppercase">Status</dt>
                <dd>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${verificationColors[doc.verification_status] ?? verificationColors.uploaded}`}>
                    {doc.verification_status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--gs-steel)] uppercase">File</dt>
                <dd className="text-[var(--gs-navy)]">{doc.file_name} ({formatSize(doc.file_size)})</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-[var(--gs-steel)] uppercase">Uploaded</dt>
                <dd className="text-[var(--gs-navy)]">{new Date(doc.created_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>

          {/* Linked Qualification */}
          {canLinkQual && (
            <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-5">
              <h3 className="text-sm font-semibold text-[var(--gs-navy)] mb-2">Linked Qualification</h3>
              {doc.linked_qualification_id ? (
                <div className="flex items-center justify-between">
                  <Link href="/dashboard/profile#qualifications" className="text-sm text-[var(--gs-gold)] hover:underline">
                    View Qualification
                  </Link>
                  <button type="button" onClick={handleUnlinkQual} className="inline-flex items-center gap-1 text-xs text-[var(--gs-steel)] hover:text-[var(--gs-alert)]">
                    <Unlink className="w-3 h-3" /> Unlink
                  </button>
                </div>
              ) : linkingQual ? (
                <div className="space-y-2">
                  <DocumentLinkSelector mode="qualification" value={selectedQualId} onChange={setSelectedQualId} />
                  <div className="flex gap-2">
                    <button type="button" onClick={handleLinkQual} disabled={!selectedQualId} className="px-3 py-1.5 text-xs font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg disabled:opacity-50">
                      Link
                    </button>
                    <button type="button" onClick={() => setLinkingQual(false)} className="px-3 py-1.5 text-xs text-[var(--gs-steel)]">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => setLinkingQual(true)} className="inline-flex items-center gap-1 text-sm text-[var(--gs-gold)] hover:text-[var(--gs-navy)]">
                  <Link2 className="w-4 h-4" /> Link to Qualification
                </button>
              )}
            </div>
          )}

          {/* Archive */}
          <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-5">
            {showArchiveConfirm ? (
              <div className="space-y-2">
                <p className="text-sm text-[var(--gs-steel)]">Archive this document? It will be removed from your library but not permanently deleted.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={handleArchive} disabled={archiving} className="px-3 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg disabled:opacity-50">
                    {archiving ? 'Archiving...' : 'Confirm Archive'}
                  </button>
                  <button type="button" onClick={() => setShowArchiveConfirm(false)} className="px-3 py-1.5 text-xs text-[var(--gs-steel)]">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setShowArchiveConfirm(true)} className="inline-flex items-center gap-1 text-sm text-[var(--gs-steel)] hover:text-[var(--gs-alert)]">
                <Archive className="w-4 h-4" /> Archive Document
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
