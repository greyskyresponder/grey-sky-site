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

function parseFormPayload(formData: FormData) {
  return {
    incidentId: (formData.get('incidentId') as string) || null,
    incidentName: (formData.get('incidentName') as string) || null,
    incidentType: (formData.get('incidentType') as string) || null,
    incidentState: (formData.get('incidentState') as string) || null,
    incidentStartDate: (formData.get('incidentStartDate') as string) || null,
    positionId: (formData.get('positionId') as string) || null,
    positionFreeText: (formData.get('positionFreeText') as string) || null,
    orgId: (formData.get('orgId') as string) || null,
    startDate: formData.get('startDate') as string,
    endDate: (formData.get('endDate') as string) || null,
    hours: formData.get('hours') ? Number(formData.get('hours')) : null,
    supervisorName: (formData.get('supervisorName') as string) || null,
    supervisorEmail: (formData.get('supervisorEmail') as string) || null,
    notes: (formData.get('notes') as string) || null,
  };
}

export async function createDeploymentAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const raw = parseFormPayload(formData);
  const validation = createDeploymentSchema.safeParse(raw);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { error: firstError.message };
  }

  const result = await createDeployment(supabase, user.id, validation.data);
  if (result.error) return { error: result.error };

  redirect(`/dashboard/records/${result.id}`);
}

export async function updateDeploymentAction(recordId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  const raw = parseFormPayload(formData);
  const validation = createDeploymentSchema.safeParse(raw);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return { error: firstError.message };
  }

  const result = await updateDeployment(supabase, user.id, recordId, validation.data);
  if (result.error) return { error: result.error };

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
