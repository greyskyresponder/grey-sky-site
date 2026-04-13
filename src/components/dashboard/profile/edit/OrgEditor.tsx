// TODO: test — list with inline edit/remove, is_primary radio, add org opens form
'use client';

import { useState } from 'react';
import { Plus, X, Pencil, Star } from 'lucide-react';
import { addServiceOrg, updateServiceOrg, removeServiceOrg, setPrimaryOrg } from '@/lib/actions/profile';
import type { UserServiceOrg } from '@/lib/types/profile';

const inputClass = 'w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none';
const labelClass = 'block text-sm font-medium text-[var(--gs-steel)] mb-1';

interface FormState {
  organization_name: string;
  organization_type: string;
  role_title: string;
  start_year: string;
  end_year: string;
  is_current: boolean;
  is_primary: boolean;
}

const emptyForm: FormState = {
  organization_name: '', organization_type: '', role_title: '',
  start_year: '', end_year: '', is_current: false, is_primary: false,
};

function orgToForm(o: UserServiceOrg): FormState {
  return {
    organization_name: o.organization_name,
    organization_type: o.organization_type ?? '',
    role_title: o.role_title ?? '',
    start_year: o.start_year?.toString() ?? '',
    end_year: o.end_year?.toString() ?? '',
    is_current: o.is_current,
    is_primary: o.is_primary,
  };
}

function formToPayload(f: FormState) {
  return {
    organization_name: f.organization_name,
    organization_type: f.organization_type || '',
    role_title: f.role_title || '',
    start_year: f.start_year ? parseInt(f.start_year, 10) : null,
    end_year: f.end_year ? parseInt(f.end_year, 10) : null,
    is_current: f.is_current,
    is_primary: f.is_primary,
  };
}

export default function OrgEditor({ orgs: initial }: { orgs: UserServiceOrg[] }) {
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
    const result = await addServiceOrg(formToPayload(form));
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setItems((prev) => [...prev, { id: crypto.randomUUID(), organization_id: null, ...formToPayload(form) } as unknown as UserServiceOrg]);
    setForm(emptyForm); setAdding(false);
  }

  async function handleUpdate(id: string) {
    setSaving(true); setError(null);
    const result = await updateServiceOrg(id, formToPayload(form));
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setItems((prev) => prev.map((o) => o.id === id ? { ...o, ...formToPayload(form) } as unknown as UserServiceOrg : o));
    setEditing(null);
  }

  async function handleRemove(id: string) {
    const result = await removeServiceOrg(id);
    if (!result.error) setItems((prev) => prev.filter((o) => o.id !== id));
  }

  async function handleSetPrimary(id: string) {
    const result = await setPrimaryOrg(id);
    if (!result.error) setItems((prev) => prev.map((o) => ({ ...o, is_primary: o.id === id })));
  }

  function renderForm(onSave: () => void) {
    return (
      <div className="space-y-3 border border-[var(--gs-cloud)] rounded-lg p-4 bg-[var(--gs-white)]/50">
        {error && <p className="text-xs text-[var(--gs-alert)]">{error}</p>}
        <div>
          <label className={labelClass}>Organization Name <span className="text-red-500">*</span></label>
          <input type="text" value={form.organization_name} onChange={(e) => set('organization_name', e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Organization Type</label>
            <input type="text" value={form.organization_type} onChange={(e) => set('organization_type', e.target.value)} placeholder="e.g., Fire Department" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Your Role / Title</label>
            <input type="text" value={form.role_title} onChange={(e) => set('role_title', e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Start Year</label>
            <input type="number" min={1950} max={new Date().getFullYear()} value={form.start_year} onChange={(e) => set('start_year', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>End Year</label>
            <input type="number" min={1950} max={new Date().getFullYear()} value={form.end_year} onChange={(e) => set('end_year', e.target.value)} className={inputClass} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--gs-navy)]">
          <input type="checkbox" checked={form.is_current} onChange={(e) => set('is_current', e.target.checked)} className="rounded border-[var(--gs-cloud)]" />
          Currently serving here
        </label>
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
      {items.map((org) => (
        <div key={org.id}>
          {editing === org.id ? (
            renderForm(() => handleUpdate(org.id))
          ) : (
            <div className="flex items-center justify-between border border-[var(--gs-cloud)] rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-[var(--gs-navy)]">
                  {org.is_primary && <span className="text-[var(--gs-gold)] mr-1">★</span>}
                  {org.organization_name}
                </p>
                <p className="text-xs text-[var(--gs-steel)]">
                  {org.organization_type}{org.role_title ? ` · ${org.role_title}` : ''}
                  {org.is_current ? ' · Current' : ''}
                  {org.start_year ? ` · ${org.start_year}${org.end_year ? `–${org.end_year}` : ''}` : ''}
                </p>
              </div>
              <div className="flex gap-1">
                {!org.is_primary && (
                  <button type="button" onClick={() => handleSetPrimary(org.id)} className="p-1 text-[var(--gs-steel)] hover:text-[var(--gs-gold)]" aria-label="Set as primary organization" title="Set as primary">
                    <Star className="w-3.5 h-3.5" />
                  </button>
                )}
                <button type="button" onClick={() => { setEditing(org.id); setForm(orgToForm(org)); }} className="p-1 text-[var(--gs-steel)] hover:text-[var(--gs-navy)]" aria-label="Edit organization">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => handleRemove(org.id)} className="p-1 text-[var(--gs-steel)] hover:text-[var(--gs-alert)]" aria-label="Remove organization">
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
          <Plus className="w-4 h-4" /> Add Organization
        </button>
      )}
    </div>
  );
}
