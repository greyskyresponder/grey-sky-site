import type { SupabaseClient } from '@supabase/supabase-js';
import type { Incident } from '@/lib/types/deployments';

export async function searchIncidents(
  supabase: SupabaseClient,
  query: string
): Promise<Incident[]> {
  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('start_date', { ascending: false })
    .limit(10);

  if (error) return [];
  return (data ?? []) as Incident[];
}

export async function createIncident(
  supabase: SupabaseClient,
  payload: {
    name: string;
    type: string;
    state?: string | null;
    startDate: string;
  }
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('incidents')
    .insert({
      name: payload.name,
      type: payload.type,
      state: payload.state ?? null,
      start_date: payload.startDate,
      status: 'active',
    })
    .select('id')
    .single();

  if (error) return { id: null, error: error.message };
  return { id: data.id, error: null };
}
