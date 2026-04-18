'use server';

// TODO: test — happy path: create deployment with RTLT position, verify draft status
// TODO: test — happy path: update draft deployment, verify non-draft blocks edit
// TODO: test — happy path: submit draft deployment transitions to submitted
// TODO: test — error path: unauthenticated request returns error
// TODO: test — error path: submit non-draft record returns error
// TODO: test — inline incident creation: new incident created when incidentName provided without incidentId

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createDeploymentSchema } from '@/lib/validators/deployments';
import {
  createDeployment,
  updateDeployment,
  submitDeployment,
} from '@/lib/queries/deployments';

function parseIntField(formData: FormData, key: string): number | null {
  const raw = formData.get(key);
  if (raw === null || raw === '') return null;
  const parsed = parseInt(String(raw), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseStringField(formData: FormData, key: string): string | null {
  const raw = formData.get(key);
  if (raw === null) return null;
  const str = String(raw).trim();
  return str.length === 0 ? null : str;
}

function parseFormPayload(formData: FormData) {
  return {
    incidentId: parseStringField(formData, 'incidentId'),
    incidentName: parseStringField(formData, 'incidentName'),
    incidentType: parseStringField(formData, 'incidentType'),
    incidentState: parseStringField(formData, 'incidentState'),
    incidentStartDate: parseStringField(formData, 'incidentStartDate'),
    positionId: parseStringField(formData, 'positionId'),
    positionFreeText: parseStringField(formData, 'positionFreeText'),
    orgId: parseStringField(formData, 'orgId'),
    startDate: formData.get('startDate') as string,
    endDate: parseStringField(formData, 'endDate'),
    hours: parseIntField(formData, 'hours'),
    totalDays: parseIntField(formData, 'totalDays'),
    operationalPeriods: parseIntField(formData, 'operationalPeriods'),
    operationalSetting: parseStringField(formData, 'operationalSetting'),
    operationalSettingOther: parseStringField(formData, 'operationalSettingOther'),
    compensationStatus: parseStringField(formData, 'compensationStatus'),
    compensationStatusOther: parseStringField(formData, 'compensationStatusOther'),
    dutiesSummary: parseStringField(formData, 'dutiesSummary'),
    keyAccomplishments: parseStringField(formData, 'keyAccomplishments'),
    personnelSupervised: parseStringField(formData, 'personnelSupervised'),
    equipmentSupervised: parseStringField(formData, 'equipmentSupervised'),
    supervisorName: parseStringField(formData, 'supervisorName'),
    supervisorEmail: parseStringField(formData, 'supervisorEmail'),
    notes: parseStringField(formData, 'notes'),
  };
}

export async function createDeploymentAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const certifyAndSubmit = formData.get('certifyAndSubmit') === 'true';
  const raw = parseFormPayload(formData);
  const validation = createDeploymentSchema.safeParse(raw);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { error: firstError.message };
  }

  const result = await createDeployment(supabase, user.id, validation.data);
  if (result.error) return { error: result.error };

  if (certifyAndSubmit && result.id) {
    const submitResult = await submitDeployment(supabase, user.id, result.id);
    if (submitResult.error) return { error: submitResult.error };
  }

  redirect(`/dashboard/records/${result.id}`);
}

export async function updateDeploymentAction(recordId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const certifyAndSubmit = formData.get('certifyAndSubmit') === 'true';
  const raw = parseFormPayload(formData);
  const validation = createDeploymentSchema.safeParse(raw);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { error: firstError.message };
  }

  const result = await updateDeployment(supabase, user.id, recordId, validation.data);
  if (result.error) return { error: result.error };

  if (certifyAndSubmit) {
    const submitResult = await submitDeployment(supabase, user.id, recordId);
    if (submitResult.error) return { error: submitResult.error };
  }

  revalidatePath(`/dashboard/records/${recordId}`);
  redirect(`/dashboard/records/${recordId}`);
}

export async function submitDeploymentAction(recordId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const result = await submitDeployment(supabase, user.id, recordId);
  if (result.error) return { error: result.error };

  revalidatePath(`/dashboard/records/${recordId}`);
  revalidatePath('/dashboard/records');
  return { error: null };
}
