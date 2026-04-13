// TODO: test — list with inline edit/remove, add community opens form, validation errors
'use client';

import { useState } from 'react';
import { Plus, X, Pencil } from 'lucide-react';
import { addCommunity, updateCommunity, removeCommunity } from '@/lib/actions/profile';
import { US_STATES } from '@/lib/constants/states';
import type { UserCommunity } from '@/lib/types/profile';

const inputClass = 'w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none';
const labelClass = 'block text-sm font-medium text-[var(--gs-steel)] mb-1';

const RELATIONSHIPS = [
  { value: 'home_base', label: 'Home Base' },
  { value: 'deployed_to', label: 'Deployed To' },
  { value: 'assigned_to', label: 'Assigned To' },
  { value: 'mutual_aid', label: 'Mutual Aid' },
] as const;

interface FormState {
  community_name: string;
  state: string;
  country: string;
  relationship: string;
  start_year: string;
  end_year: string;
  is_current: boolean;
  notes: string;
}

const emptyForm: FormState = {
  community_name: '', state: '', country: 'USA', relationship: '',
  start_year: '', end_year: '', is_current: false, notes: '',
};

function communityToForm(c: UserCommunity): FormState {
  return {
    community_name: c.community_name,
    state: c.state ?? '',
    country: c.country,
    relationship: c.relationship,
    start_year: c.start_year?.toString() ?? '',
    end_year: c.end_year?.toString() ?? '',
    is_current: c.is_current,
    notes: c.notes ?? '',
  };
}

function formToPayload(f: FormState) {
  return {
    community_name: f.community_name,
    state: f.state || '',
    country: f.country || 'USA',
    relationship: f.relationship,
    start_year: f.start_year ? parseInt(f.start_year, 10) : null,
    end_year: f.end_year ? parseInt(f.end_year, 10) : null,
    is_current: f.is_current,
    notes: f.notes || '',
  };
}

export default function CommunityEditor({ communities: initial }: { communities: UserCommunity[] }) {
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
    setSaving(true);
    setError(null);
    const result = await addCommunity(formToPayload(form));
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setItems((prev) => [...prev, { id: crypto.randomUUID(), ...formToPayload(form) } as unknown as UserCommunity]);
    setForm(emptyForm);
    setAdding(false);
  }

  async function handleUpdate(id: string) {
    setSaving(true);
    setError(null);
    const result = await updateCommunity(id, formToPayload(form));
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setItems((prev) => prev.map((c) => c.id === id ? { ...c, ...formToPayload(form) } as unknown as UserCommunity : c));
    setEditing(null);
  }

  async function handleRemove(id: string) {
    const result = await removeCommunity(id);
    if (!result.error) setItems((prev) => prev.filter((c) => c.id !== id));
  }

  function renderForm(onSave: () => void) {
    return (
      <div className="space-y-3 border border-[var(--gs-cloud)] rounded-lg p-4 bg-[var(--gs-white)]/50">
        {error && <p className="text-xs text-[var(--gs-alert)]">{error}</p>}
        <div>
          <label className={labelClass}>Community Name <span className="text-red-500">*</span></label>
          <input type="text" value={form.community_name} onChange={(e) => set('community_name', e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>State</label>
            <select value={form.state} onChange={(e) => set('state', e.target.value)} className={inputClass}>
              <option value="">Select state</option>
              {US_STATES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Relationship <span className="text-red-500">*</span></label>
            <select value={form.relationship} onChange={(e) => set('relationship', e.target.value)} className={inputClass}>
              <option value="">Select...</option>
              {RELATIONSHIPS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
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
        <div>
          <label className={labelClass}>Notes</label>
          <input type="text" value={form.notes} onChange={(e) => set('notes', e.target.value)} maxLength={500} className={inputClass} />
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
      {items.map((c) => (
        <div key={c.id}>
          {editing === c.id ? (
            renderForm(() => handleUpdate(c.id))
          ) : (
            <div className="flex items-center justify-between border border-[var(--gs-cloud)] rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-[var(--gs-navy)]">
                  {c.community_name}{c.state ? `, ${c.state}` : ''}
                </p>
                <p className="text-xs text-[var(--gs-steel)]">
                  {RELATIONSHIPS.find((r) => r.value === c.relationship)?.label}
                  {c.is_current ? ' · Current' : ''}
                  {c.start_year ? ` · ${c.start_year}${c.end_year ? `–${c.end_year}` : ''}` : ''}
                </p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => { setEditing(c.id); setForm(communityToForm(c)); }} className="p-1 text-[var(--gs-steel)] hover:text-[var(--gs-navy)]" aria-label="Edit community">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => handleRemove(c.id)} className="p-1 text-[var(--gs-steel)] hover:text-[var(--gs-alert)]" aria-label="Remove community">
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
          <Plus className="w-4 h-4" /> Add Community
        </button>
      )}
    </div>
  );
}
