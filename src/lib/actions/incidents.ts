// TODO: Add tests — auth guard (reject unauthenticated), validation errors returned, slug generation, search filtering, pagination, public vs dashboard access
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';
import { incidentCreateSchema } from '@/lib/validators/incidents';
import type { Incident, IncidentSummary, IncidentUpdate } from '@/lib/types/incidents';

const SUMMARY_COLUMNS = `
  id, name, slug, incident_type, incident_subtype,
  incident_start_date, incident_end_date, location_state, location_county,
  fema_disaster_number, verification_status, status, deployment_count, responder_count
`;

export async function searchIncidents(params: {
  query?: string;
  incident_type?: string;
  location_state?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  verification_status?: string;
  page?: number;
  per_page?: number;
}): Promise<{ data: IncidentSummary[]; total: number }> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from('incidents')
    .select(SUMMARY_COLUMNS, { count: 'exact' });

  // Exclude merged
  query = query.neq('status', 'merged');

  if (params.query?.trim()) {
    query = query.ilike('name', `%${params.query.trim()}%`);
  }
  if (params.incident_type) {
    query = query.eq('incident_type', params.incident_type);
  }
  if (params.location_state) {
    query = query.eq('location_state', params.location_state);
  }
  if (params.date_from) {
    query = query.gte('incident_start_date', params.date_from);
  }
  if (params.date_to) {
    query = query.lte('incident_start_date', params.date_to);
  }
  if (params.status) {
    query = query.eq('status', params.status);
  }
  if (params.verification_status) {
    query = query.eq('verification_status', params.verification_status);
  }

  const { data, count, error } = await query
    .order('incident_start_date', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error) return { data: [], total: 0 };
  return { data: (data ?? []) as IncidentSummary[], total: count ?? 0 };
}

export async function getIncidentBySlug(
  slug: string
): Promise<{ incident: Incident | null; updates: IncidentUpdate[] }> {
  const supabase = await createClient();

  const { data: incident } = await supabase
    .from('incidents')
    .select('*')
    .eq('slug', slug)
    .neq('status', 'merged')
    .single();

  if (!incident) return { incident: null, updates: [] };

  const { data: updates } = await supabase
    .from('incident_updates')
    .select('*')
    .eq('incident_id', incident.id)
    .order('update_date', { ascending: true });

  return {
    incident: incident as Incident,
    updates: (updates ?? []) as IncidentUpdate[],
  };
}

export async function getIncidentById(id: string): Promise<IncidentSummary | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('incidents')
    .select(SUMMARY_COLUMNS)
    .eq('id', id)
    .single();

  return (data as IncidentSummary) ?? null;
}

export async function createIncidentAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await getUser();
  if (!session) return { error: 'You must be logged in to create an incident.' };

  const raw = {
    name: formData.get('name') as string,
    incident_type: formData.get('incident_type') as string,
    incident_subtype: formData.get('incident_subtype') as string,
    incident_start_date: formData.get('incident_start_date') as string,
    incident_end_date: formData.get('incident_end_date') as string,
    location_state: formData.get('location_state') as string,
    location_county: formData.get('location_county') as string,
    location_city: formData.get('location_city') as string,
    location_description: formData.get('location_description') as string,
    location_latitude: formData.get('location_latitude')
      ? Number(formData.get('location_latitude'))
      : undefined,
    location_longitude: formData.get('location_longitude')
      ? Number(formData.get('location_longitude'))
      : undefined,
    fema_disaster_number: formData.get('fema_disaster_number') as string,
    description: formData.get('description') as string,
  };

  const parsed = incidentCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid form data.' };
  }

  const supabase = await createClient();
  const payload: Record<string, unknown> = {
    name: parsed.data.name,
    incident_type: parsed.data.incident_type,
    incident_start_date: parsed.data.incident_start_date,
    location_state: parsed.data.location_state,
    source: 'member_submitted',
    verification_status: 'unverified',
    status: 'active',
    created_by: session.user.id,
  };

  if (parsed.data.incident_subtype) payload.incident_subtype = parsed.data.incident_subtype;
  if (parsed.data.incident_end_date) payload.incident_end_date = parsed.data.incident_end_date;
  if (parsed.data.location_county) payload.location_county = parsed.data.location_county;
  if (parsed.data.location_city) payload.location_city = parsed.data.location_city;
  if (parsed.data.location_description) payload.location_description = parsed.data.location_description;
  if (parsed.data.location_latitude !== undefined) payload.location_latitude = parsed.data.location_latitude;
  if (parsed.data.location_longitude !== undefined) payload.location_longitude = parsed.data.location_longitude;
  if (parsed.data.fema_disaster_number) payload.fema_disaster_number = parsed.data.fema_disaster_number;
  if (parsed.data.description) payload.description = parsed.data.description;

  const { data, error } = await supabase
    .from('incidents')
    .insert(payload)
    .select('slug')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/dashboard/incidents');
  redirect(`/dashboard/incidents/${data.slug}`);
}

export async function getPublicIncidents(params: {
  incident_type?: string;
  location_state?: string;
  page?: number;
  per_page?: number;
}): Promise<{ data: IncidentSummary[]; total: number }> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from('incidents')
    .select(SUMMARY_COLUMNS, { count: 'exact' })
    .eq('public_visible', true)
    .not('status', 'in', '("merged","draft")');

  if (params.incident_type) {
    query = query.eq('incident_type', params.incident_type);
  }
  if (params.location_state) {
    query = query.eq('location_state', params.location_state);
  }

  const { data, count } = await query
    .order('incident_start_date', { ascending: false })
    .range(offset, offset + perPage - 1);

  return { data: (data ?? []) as IncidentSummary[], total: count ?? 0 };
}

export async function getFeaturedIncidents(): Promise<IncidentSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('incidents')
    .select(SUMMARY_COLUMNS)
    .eq('featured', true)
    .eq('public_visible', true)
    .not('status', 'in', '("merged","draft")')
    .order('incident_start_date', { ascending: false })
    .limit(6);

  return (data ?? []) as IncidentSummary[];
}
