// TODO: test — compact inline add/remove, proficiency dropdown, duplicate language prevention
'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { addLanguage, removeLanguage } from '@/lib/actions/profile';
import type { UserLanguage } from '@/lib/types/profile';

const inputClass = 'w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none';

const PROFICIENCIES = [
  { value: 'native', label: 'Native' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'basic', label: 'Basic' },
] as const;

export default function LanguageEditor({ languages: initial }: { languages: UserLanguage[] }) {
  const [items, setItems] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [lang, setLang] = useState('');
  const [proficiency, setProficiency] = useState('conversational');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setSaving(true); setError(null);
    const result = await addLanguage({ language: lang, proficiency });
    setSaving(false);
    if (result.error) { setError(result.error); return; }
    setItems((prev) => [...prev, { id: crypto.randomUUID(), language: lang, proficiency } as UserLanguage]);
    setLang(''); setProficiency('conversational'); setAdding(false);
  }

  async function handleRemove(id: string) {
    const result = await removeLanguage(id);
    if (!result.error) setItems((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((l) => (
          <div key={l.id} className="inline-flex items-center gap-1.5 border border-[var(--gs-cloud)] rounded-full px-3 py-1">
            <span className="text-sm text-[var(--gs-navy)]">{l.language}</span>
            <span className="text-xs text-[var(--gs-steel)]">({l.proficiency})</span>
            <button type="button" onClick={() => handleRemove(l.id)} className="text-[var(--gs-steel)] hover:text-[var(--gs-alert)]" aria-label={`Remove ${l.language}`}>
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex items-end gap-2 border border-[var(--gs-cloud)] rounded-lg p-3 bg-[var(--gs-white)]/50">
          {error && <p className="text-xs text-[var(--gs-alert)]">{error}</p>}
          <div className="flex-1">
            <input type="text" value={lang} onChange={(e) => setLang(e.target.value)} placeholder="Language" className={inputClass} aria-label="Language name" />
          </div>
          <div>
            <select value={proficiency} onChange={(e) => setProficiency(e.target.value)} className={inputClass} aria-label="Proficiency level">
              {PROFICIENCIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <button type="button" onClick={handleAdd} disabled={saving || !lang.trim()} className="px-3 py-2 text-xs font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold)]/90 disabled:opacity-50">
            {saving ? '...' : 'Add'}
          </button>
          <button type="button" onClick={() => { setAdding(false); setError(null); }} className="px-3 py-2 text-xs text-[var(--gs-steel)] hover:text-[var(--gs-navy)]">
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="inline-flex items-center gap-1 text-sm text-[var(--gs-gold)] hover:text-[var(--gs-navy)] transition-colors">
          <Plus className="w-4 h-4" /> Add Language
        </button>
      )}
    </div>
  );
}
