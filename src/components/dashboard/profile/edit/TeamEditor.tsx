// TODO: test — list with inline edit/remove, team_type_id dropdown, add team opens form
'use client';

import { useState } from 'react';
import { Plus, X, Pencil } from 'lucide-react';
import { addTeam, updateTeam, removeTeam } from '@/lib/actions/profile';
import type { UserTeam } from '@/lib/types/profile';

const inputClass = 'w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none';
const labelClass = 'block text-sm font-medium text-[var(--gs-steel)] mb-1';

interface TeamType { id: string; name: string; }

interface FormState {
  team_name: string;
  team_type_id: string;
  position_on_team: string;
  start_year: string;
  end_year: string;
  is_current: boolean;
}

const emptyForm: FormState = {
  team_name: '', team_type_id: '', position_on_team: '',
  start_year: '', end_year: '', is_current: false,
};

function teamToForm(t: UserTeam): FormState {
  return {
    team_name: t.team_name,
    team_type_id: t.team_type_id ?? '',
    position_on_team: t.position_on_team ?? '',
    start_year: t.start_year?.toString() ?? '',
    end_year: t.end_year?.toString() ?? '',
    is_current: t.is_current,
  };
}

function formToPayload(f: FormState) {
  return {
    team_name: f.team_name,
    team_type_id: f.team_type_id || null,
    organization_id: null,
    position_on_team: f.position_on_team || '',
    rtlt_position_slug: '',
    start_year: f.start_year ? parseInt(f.start_year, 10) : null,
    end_year: f.end_year ? parseInt(f.end_year, 10) : null,
    is_current: f.is_current,
  };
}

export default function TeamEditor({ teams: initial, teamTypes }: { teams: UserTeam[]; teamTypes: TeamType[] }) {
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
    const result = await addTeam(formToPayload(form));
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    const typeName = teamTypes.find((t) => t.id === form.team_type_id)?.name;
    setItems((prev) => [...prev, { ...formToPayload(form), id: crypto.randomUUID(), team_type_name: typeName } as unknown as UserTeam]);
    setForm(emptyForm); setAdding(false);
  }

  async function handleUpdate(id: string) {
    setSaving(true); setError(null);
    const result = await updateTeam(id, formToPayload(form));
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setItems((prev) => prev.map((t) => t.id === id ? { ...t, ...formToPayload(form), team_type_name: teamTypes.find((tt) => tt.id === form.team_type_id)?.name } as unknown as UserTeam : t));
    setEditing(null);
  }

  async function handleRemove(id: string) {
    const result = await removeTeam(id);
    if (!result.error) setItems((prev) => prev.filter((t) => t.id !== id));
  }

  function renderForm(onSave: () => void) {
    return (
      <div className="space-y-3 border border-[var(--gs-cloud)] rounded-lg p-4 bg-[var(--gs-white)]/50">
        {error && <p className="text-xs text-[var(--gs-alert)]">{error}</p>}
        <div>
          <label className={labelClass}>Team Name <span className="text-red-500">*</span></label>
          <input type="text" value={form.team_name} onChange={(e) => set('team_name', e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Team Type</label>
            <select value={form.team_type_id} onChange={(e) => set('team_type_id', e.target.value)} className={inputClass}>
              <option value="">Select type...</option>
              {teamTypes.map((tt) => <option key={tt.id} value={tt.id}>{tt.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Your Position</label>
            <input type="text" value={form.position_on_team} onChange={(e) => set('position_on_team', e.target.value)} className={inputClass} />
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
          Currently on this team
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
      {items.map((team) => (
        <div key={team.id}>
          {editing === team.id ? (
            renderForm(() => handleUpdate(team.id))
          ) : (
            <div className="flex items-center justify-between border border-[var(--gs-cloud)] rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-[var(--gs-navy)]">{team.team_name}</p>
                <p className="text-xs text-[var(--gs-steel)]">
                  {team.team_type_name}{team.position_on_team ? ` · ${team.position_on_team}` : ''}
                  {team.is_current ? ' · Current' : ''}
                  {team.start_year ? ` · ${team.start_year}${team.end_year ? `–${team.end_year}` : ''}` : ''}
                </p>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => { setEditing(team.id); setForm(teamToForm(team)); }} className="p-1 text-[var(--gs-steel)] hover:text-[var(--gs-navy)]" aria-label="Edit team">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => handleRemove(team.id)} className="p-1 text-[var(--gs-steel)] hover:text-[var(--gs-alert)]" aria-label="Remove team">
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
          <Plus className="w-4 h-4" /> Add Team
        </button>
      )}
    </div>
  );
}
