// TODO: test — form renders all fields, category change shows/hides conditional fields, submit uploads
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadDocument } from '@/lib/actions/documents';
import FileDropzone from './FileDropzone';
import DocumentLinkSelector from './DocumentLinkSelector';

const inputClass = 'w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none';
const labelClass = 'block text-sm font-medium text-[var(--gs-steel)] mb-1';

const CATEGORIES = [
  { value: 'certification', label: 'Certifications & Licenses' },
  { value: 'training', label: 'Training Records' },
  { value: 'deployment', label: 'Deployment Records' },
  { value: 'identification', label: 'Identification' },
  { value: 'medical', label: 'Medical Records' },
  { value: 'assessment', label: 'Assessment Documents' },
  { value: 'correspondence', label: 'Correspondence' },
  { value: 'membership', label: 'Membership Documents' },
  { value: 'other', label: 'Other' },
] as const;

export default function DocumentUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [description, setDescription] = useState('');
  const [linkedQualId, setLinkedQualId] = useState<string | null>(null);
  const [linkedDeployId, setLinkedDeployId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showIssuingAuthority = ['certification', 'training'].includes(category);
  const showExpiration = ['certification', 'training', 'medical'].includes(category);
  const showQualLink = ['certification', 'training'].includes(category);
  const showDeployLink = category === 'deployment';
  const isSensitive = ['identification', 'medical'].includes(category);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError('Please select a file'); return; }
    if (!category) { setError('Please select a category'); return; }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.set('file', file);
    formData.set('category', category);
    formData.set('title', title);
    formData.set('description', description);
    formData.set('issuing_authority', issuingAuthority);
    formData.set('document_date', documentDate);
    formData.set('expiration_date', expirationDate);
    if (linkedQualId) formData.set('linked_qualification_id', linkedQualId);
    if (linkedDeployId) formData.set('linked_deployment_id', linkedDeployId);

    const result = await uploadDocument(formData);
    setUploading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.id) {
      router.push(`/dashboard/documents/${result.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}

      {/* File */}
      <FileDropzone onFileSelect={setFile} selectedFile={file} onClear={() => setFile(null)} />

      {/* Category */}
      <div>
        <label htmlFor="category" className={labelClass}>Category <span className="text-red-500">*</span></label>
        <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className={inputClass}>
          <option value="">Select category...</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {isSensitive && (
        <div className="p-3 rounded-lg bg-[var(--gs-navy)]/5 border border-[var(--gs-navy)]/10 text-xs text-[var(--gs-steel)]">
          This document contains sensitive personal information. It is visible only to you and Grey Sky staff.
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className={labelClass}>Title</label>
        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} placeholder="Optional — defaults to filename" className={inputClass} />
      </div>

      {/* Issuing Authority */}
      {showIssuingAuthority && (
        <div>
          <label htmlFor="issuing_authority" className={labelClass}>Issuing Authority</label>
          <input id="issuing_authority" type="text" value={issuingAuthority} onChange={(e) => setIssuingAuthority(e.target.value)} placeholder='e.g., "FEMA EMI", "NREMT"' className={inputClass} />
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="document_date" className={labelClass}>Document Date</label>
          <input id="document_date" type="date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} className={inputClass} />
        </div>
        {showExpiration && (
          <div>
            <label htmlFor="expiration_date" className={labelClass}>Expiration Date</label>
            <input id="expiration_date" type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className={inputClass} />
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Optional notes about this document" className={inputClass} />
      </div>

      {/* Link to Qualification */}
      {showQualLink && (
        <div>
          <label className={labelClass}>Link to Qualification</label>
          <p className="text-xs text-[var(--gs-steel)] mb-2">Link this document to a qualification in your profile to verify your credentials.</p>
          <DocumentLinkSelector mode="qualification" value={linkedQualId} onChange={setLinkedQualId} />
        </div>
      )}

      {/* Link to Deployment */}
      {showDeployLink && (
        <div>
          <label className={labelClass}>Link to Deployment</label>
          <DocumentLinkSelector mode="deployment" value={linkedDeployId} onChange={setLinkedDeployId} />
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={uploading || !file}
        className="w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  );
}
