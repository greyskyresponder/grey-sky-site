// TODO: Add tests — searchIncidents empty query returns [], ilike filter, status exclusion, limit, createIncident returns id, error handling
import type { SupabaseClient } from '@supabase/supabase-js';
import type { IncidentSummary } from '@/lib/types/incidents';

export async function searchIncidents(
  supabase: SupabaseClient,
  query: string
): Promise<IncidentSummary[]> {
  if (!query.trim()) return [];

  const { data, error } = await supabase
    .from('incidents')
    .select('id, name, slug, incident_type, incident_subtype, incident_start_date, incident_end_date, location_state, location_county, fema_disaster_number, verification_status, status, deployment_count, responder_count')
    .ilike('name', `%${query}%`)
    .neq('status', 'merged')
    .order('incident_start_date', { ascending: false })
    .limit(10);

  if (error) return [];
  return (data ?? []) as IncidentSummary[];
}

export async function createIncident(
  supabase: SupabaseClient,
  payload: {
    name: string;
    incident_type: string;
    location_state?: string | null;
    incident_start_date: string;
    created_by?: string;
  }
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from('incidents')
    .insert({
      name: payload.name,
      incident_type: payload.incident_type,
      location_state: payload.location_state ?? null,
      incident_start_date: payload.incident_start_date,
      status: 'active',
      source: 'member_submitted',
      verification_status: 'unverified',
      created_by: payload.created_by ?? null,
    })
    .select('id')
    .single();

  if (error) return { id: null, error: error.message };
  return { id: data.id, error: null };
}
