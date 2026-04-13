// TODO: test — fetches qualifications or deployments, select/clear, displays name
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface LinkOption {
  id: string;
  label: string;
}

interface Props {
  mode: 'qualification' | 'deployment';
  value: string | null;
  onChange: (id: string | null) => void;
}

export default function DocumentLinkSelector({ mode, value, onChange }: Props) {
  const [options, setOptions] = useState<LinkOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      if (mode === 'qualification') {
        const { data } = await supabase
          .from('user_qualifications')
          .select('id, qualification_name, category')
          .eq('is_active', true)
          .order('qualification_name');
        setOptions((data ?? []).map((q: Record<string, unknown>) => ({
          id: q.id as string,
          label: `${q.qualification_name}${q.category ? ` (${q.category})` : ''}`,
        })));
      } else {
        const { data } = await supabase
          .from('deployment_records')
          .select('id, incidents(name)')
          .in('status', ['submitted', 'verified'])
          .order('created_at', { ascending: false })
          .limit(50);
        setOptions((data ?? []).map((d: Record<string, unknown>) => {
          const inc = d.incidents as Record<string, unknown> | null;
          return {
            id: d.id as string,
            label: (inc?.name as string) ?? 'Deployment',
          };
        }));
      }
      setLoading(false);
    }
    load();
  }, [mode]);

  if (loading) return <p className="text-xs text-[var(--gs-steel)]">Loading...</p>;
  if (options.length === 0) return <p className="text-xs text-[var(--gs-steel)]">No {mode === 'qualification' ? 'qualifications' : 'deployments'} to link</p>;

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:ring-1 focus:ring-[var(--gs-gold)] focus:outline-none"
      aria-label={`Link to ${mode}`}
    >
      <option value="">None</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>{o.label}</option>
      ))}
    </select>
  );
}
