// TODO: test — list with inline edit/remove, category dropdown, expiration indicator, add opens form
'use client';

import { useState } from 'react';
import { Plus, X, Pencil } from 'lucide-react';
import { addQualification, updateQualification, removeQualification } from '@/lib/actions/profile';
import type { UserQualification } from '@/lib/types/profile';

const inputClass = 'w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none';
const labelClass = 'block text-sm font-medium text-[var(--gs-steel)] mb-1';

const CATEGORIES = [
  { value: 'medical', label: 'Medical' },
  { value: 'technical', label: 'Technical' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'hazmat', label: 'HazMat' },
  { value: 'communications', label: 'Communications' },
  { value: 'legal', label: 'Legal' },
  { value: 'fema_ics', label: 'FEMA / ICS' },
  { value: 'state_cert', label: 'State Certification' },
  { value: 'other', label: 'Other' },
] as const;

interface FormState {
  qualification_name: string;
  issuing_authority: string;
  credential_number: string;
  issued_date: string;
  expiration_date: string;
  is_active: boolean;
  category: string;
}

const emptyForm: FormState = {
  qualification_name: '', issuing_authority: '', credential_number: '',
  issued_date: '', expiration_date: '', is_active: true, category: '',
};

function qualToForm(q: UserQualification): FormState {
  return {
    qualification_name: q.qualification_name,
    issuing_authority: q.issuing_authority ?? '',
    credential_number: q.credential_number ?? '',
    issued_date: q.issued_date ?? '',
    expiration_date: q.expiration_date ?? '',
    is_active: q.is_active,
    category: q.category ?? '',
  };
}

function formToPayload(f: FormState) {
  return {
    qualification_name: f.qualification_name,
    issuing_authority: f.issuing_authority || '',
    credential_number: f.credential_number || '',
    issued_date: f.issued_date || '',
    expiration_date: f.expiration_date || '',
    is_active: f.is_active,
    category: f.category || null,
    verification_status: 'self_reported' as const,
  };
}

export default function QualificationEditor({ qualifications: initial }: { qualifications: UserQualification[] }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAdd() {
    setSaving(true); setError(null);
    const result = await addQualification(formToPayload(form));
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setItems((prev) => [...prev, { id: crypto.randomUUID(), document_id: null, ...formToPayload(form) } as unknown as UserQualification]);
    setForm(emptyForm); setAdding(false);
  }

  async function handleUpdate(id: string) {
    setSaving(true); setError(null);
    const result = await updateQualification(id, formToPayload(form));
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setItems((prev) => prev.map((q) => q.id === id ? { ...q, ...formToPayload(form) } as unknown as UserQualification : q));
    setEditing(null);
  }

  async function handleRemove(id: string) {
    const result = await removeQualification(id);
    if (!result.error) setItems((prev) => prev.filter((q) => q.id !== id));
  }

  function renderForm(onSave: () => void) {
    return (
      <div className="space-y-3 border border-[var(--gs-cloud)] rounded-lg p-4 bg-[var(--gs-white)]/50">
        {error && <p className="text-xs text-[var(--gs-alert)]">{error}</p>}
        <div>
          <label className={labelClass}>Qualification Name <span className="text-red-500">*</span></label>
          <input type="text" value={form.qualification_name} onChange={(e) => set('qualification_name', e.target.value)} placeholder="e.g., EMT-P, COML, ICS-300" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Issuing Authority</label>
            <input type="text" value={form.issuing_authority} onChange={(e) => set('issuing_authority', e.target.value)} placeholder="e.g., NREMT, State of Florida" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Category</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputClass}>
              <option value="">Select category...</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Credential Number</label>
          <input type="text" value={form.credential_number} onChange={(e) => set('credential_number', e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Issued Date</label>
            <input type="date" value={form.issued_date} onChange={(e) => set('issued_date', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Expiration Date</label>
            <input type="date" value={form.expiration_date} onChange={(e) => set('expiration_date', e.target.value)} className={inputClass} />
            {form.expiration_date && new Date(form.expiration_date) < new Date() && (
              <p className="text-xs text-[var(--gs-alert)] mt-1">This credential has expired</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onSave} disabled={saving} className="px-4 py-1.5 text-xs font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold)]/90 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => { setAdding(false); setEditing(null); setError(null); }} className="px-4 py-1.5 text-xs text-[var(--gs-steel)] hover:text-[var(--gs-navy)]">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((q) => (
        <div key={q.id}>
          {editing === q.id ? (
            renderForm(() => handleUpdate(q.id))
          ) : (
            <div className="flex items-center justify-between border border-[var(--gs-cloud)] rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-[var(--gs-navy)]">{q.qualification_name}</p>
                <p className="text-xs text-[var(--gs-steel)]">
                  {q.issuing_authority}{q.category ? ` · ${CATEGORIES.find((c) => c.value === q.category)?.label ?? q.category}` : ''}
                  {!q.is_active && <span className="text-[var(--gs-alert)]"> · Expired</span>}
                </p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => { setEditing(q.id); setForm(qualToForm(q)); }} className="p-1 text-[var(--gs-steel)] hover:text-[var(--gs-navy)]" aria-label="Edit qualification">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => handleRemove(q.id)} className="p-1 text-[var(--gs-steel)] hover:text-[var(--gs-alert)]" aria-label="Remove qualification">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding ? (
        renderForm(handleAdd)
      ) : (
        <button type="button" onClick={() => { setAdding(true); setForm(emptyForm); }} className="inline-flex items-center gap-1 text-sm text-[var(--gs-gold)] hover:text-[var(--gs-navy)] transition-colors">
          <Plus className="w-4 h-4" /> Add Qualification
        </button>
      )}
    </div>
  );
}
