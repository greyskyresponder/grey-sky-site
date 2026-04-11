// TODO: test — happy path: listDeployments with filters (status, date range, pagination)
// TODO: test — happy path: getDeployment returns full record with joins
// TODO: test — createDeployment: inline incident creation + record insertion
// TODO: test — updateDeployment: only draft records editable, ownership enforced
// TODO: test — submitDeployment: transitions draft → submitted, blocks non-draft
import type { SupabaseClient } from '@supabase/supabase-js';
import type { NimsType } from '@/lib/types/enums';
import type {
  DeploymentRecordDetail,
  DeploymentFilters,
  CreateDeploymentPayload,
} from '@/lib/types/deployment-views';

function mapRecord(row: Record<string, unknown>): DeploymentRecordDetail {
  const incident = row.incidents as Record<string, unknown> | null;
  const position = row.positions as Record<string, unknown> | null;
  const organization = row.organizations as Record<string, unknown> | null;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    incidentId: row.incident_id as string | null,
    positionId: row.position_id as string | null,
    positionFreeText: (row.position_free_text as string) ?? null,
    orgId: row.org_id as string | null,
    startDate: row.start_date as string,
    endDate: row.end_date as string | null,
    hours: row.hours as number | null,
    verificationTier: row.verification_tier as DeploymentRecordDetail['verificationTier'],
    supervisorName: row.supervisor_name as string | null,
    supervisorEmail: row.supervisor_email as string | null,
    notes: row.notes as string | null,
    status: row.status as DeploymentRecordDetail['status'],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    incident: incident
      ? {
          id: incident.id as string,
          name: incident.name as string,
          type: incident.incident_type as DeploymentRecordDetail['incident'] extends { type: infer T } ? T : never,
          state: incident.location_state as string | null,
          startDate: incident.incident_start_date as string,
          endDate: incident.incident_end_date as string | null,
          femaDisasterNumber: incident.fema_disaster_number as string | null,
        }
      : null,
    position: position
      ? {
          id: position.id as string,
          title: position.title as string,
          nimsType: (position.nims_type as NimsType | null) ?? null,
          resourceCategory: (position.resource_category as string) ?? null,
          discipline: (position.discipline as string) ?? null,
        }
      : null,
    organization: organization
      ? {
          id: organization.id as string,
          name: organization.name as string,
          type: organization.type as string,
        }
      : null,
    validationCount: (row.validation_count as number) ?? 0,
    evaluationCount: (row.evaluation_count as number) ?? 0,
  };
}

const RECORD_SELECT = `
  *,
  incidents(id, name, incident_type, location_state, incident_start_date, incident_end_date, fema_disaster_number),
  positions(id, title, nims_type, resource_category, discipline),
  organizations(id, name, type)
`;

export async function listDeployments(
  supabase: SupabaseClient,
  userId: string,
  filters: DeploymentFilters
): Promise<{ records: DeploymentRecordDetail[]; total: number }> {
  let query = supabase
    .from('deployment_records')
    .select(RECORD_SELECT, { count: 'exact' })
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  if (filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }
  if (filters.verificationTier !== 'all') {
    query = query.eq('verification_tier', filters.verificationTier);
  }
  if (filters.dateFrom) {
    query = query.gte('start_date', filters.dateFrom);
  }
  if (filters.dateTo) {
    query = query.lte('start_date', filters.dateTo);
  }

  const from = (filters.page - 1) * filters.perPage;
  const to = from + filters.perPage - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const records = (data ?? []).map((row) => mapRecord(row as Record<string, unknown>));
  return { records, total: count ?? 0 };
}

export async function getDeployment(
  supabase: SupabaseClient,
  userId: string,
  recordId: string
): Promise<DeploymentRecordDetail | null> {
  const { data, error } = await supabase
    .from('deployment_records')
    .select(RECORD_SELECT)
    .eq('id', recordId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return mapRecord(data as Record<string, unknown>);
}

export async function createDeployment(
  supabase: SupabaseClient,
  userId: string,
  payload: CreateDeploymentPayload
): Promise<{ id: string | null; error: string | null }> {
  let incidentId = payload.incidentId;

  // Create inline incident if needed
  if (!incidentId && payload.incidentName) {
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .insert({
        name: payload.incidentName,
        incident_type: payload.incidentType ?? 'steady_state',
        location_state: payload.incidentState ?? null,
        incident_start_date: payload.incidentStartDate ?? payload.startDate,
        status: 'active',
        source: 'member_submitted',
        verification_status: 'unverified',
      })
      .select('id')
      .single();

    if (incidentError) return { id: null, error: incidentError.message };
    incidentId = incident.id;
  }

  const { data, error } = await supabase
    .from('deployment_records')
    .insert({
      user_id: userId,
      incident_id: incidentId ?? null,
      position_id: payload.positionId ?? null,
      position_free_text: payload.positionFreeText ?? null,
      org_id: payload.orgId ?? null,
      start_date: payload.startDate,
      end_date: payload.endDate ?? null,
      hours: payload.hours ?? null,
      verification_tier: 'self_certified',
      supervisor_name: payload.supervisorName ?? null,
      supervisor_email: payload.supervisorEmail ?? null,
      notes: payload.notes ?? null,
      status: 'draft',
    })
    .select('id')
    .single();

  if (error) return { id: null, error: error.message };
  return { id: data.id, error: null };
}

export async function updateDeployment(
  supabase: SupabaseClient,
  userId: string,
  recordId: string,
  payload: CreateDeploymentPayload
): Promise<{ error: string | null }> {
  // Verify draft status
  const { data: existing } = await supabase
    .from('deployment_records')
    .select('status')
    .eq('id', recordId)
    .eq('user_id', userId)
    .single();

  if (!existing) return { error: 'Record not found' };
  if (existing.status !== 'draft') return { error: 'Only draft records can be edited' };

  let incidentId = payload.incidentId;
  if (!incidentId && payload.incidentName) {
    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .insert({
        name: payload.incidentName,
        incident_type: payload.incidentType ?? 'steady_state',
        location_state: payload.incidentState ?? null,
        incident_start_date: payload.incidentStartDate ?? payload.startDate,
        status: 'active',
        source: 'member_submitted',
        verification_status: 'unverified',
      })
      .select('id')
      .single();

    if (incidentError) return { error: incidentError.message };
    incidentId = incident.id;
  }

  const { error } = await supabase
    .from('deployment_records')
    .update({
      incident_id: incidentId ?? null,
      position_id: payload.positionId ?? null,
      position_free_text: payload.positionFreeText ?? null,
      org_id: payload.orgId ?? null,
      start_date: payload.startDate,
      end_date: payload.endDate ?? null,
      hours: payload.hours ?? null,
      supervisor_name: payload.supervisorName ?? null,
      supervisor_email: payload.supervisorEmail ?? null,
      notes: payload.notes ?? null,
    })
    .eq('id', recordId)
    .eq('user_id', userId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function submitDeployment(
  supabase: SupabaseClient,
  userId: string,
  recordId: string
): Promise<{ error: string | null }> {
  const { data: existing } = await supabase
    .from('deployment_records')
    .select('status')
    .eq('id', recordId)
    .eq('user_id', userId)
    .single();

  if (!existing) return { error: 'Record not found' };
  if (existing.status !== 'draft') return { error: 'Only draft records can be submitted' };

  const { error } = await supabase
    .from('deployment_records')
    .update({ status: 'submitted' })
    .eq('id', recordId)
    .eq('user_id', userId);

  if (error) return { error: error.message };
  return { error: null };
}
