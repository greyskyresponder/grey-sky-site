'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';
import { spendCoins } from '@/lib/coins/actions';
import {
  requestValidationSchema,
  submitValidationSchema,
  type RequestValidationInput,
  type SubmitValidationInput,
} from './schemas';

const ATTESTATION_TEXT =
  'I attest that the information I have provided is true and accurate to the best of my knowledge. I understand that this attestation may be used in professional credentialing processes.';

export interface ValidationTokenView {
  request: {
    id: string;
    status: string;
    validator_email: string;
    validator_name: string | null;
    expires_at: string;
    responded_at: string | null;
  };
  deployment: {
    id: string;
    start_date: string | null;
    end_date: string | null;
    position_title: string | null;
    agency: string | null;
  };
  member: { first_name: string | null; last_name: string | null };
  incident: { id: string; name: string; type: string; state: string | null } | null;
}

export interface ValidationSummary {
  id: string;
  status: 'pending' | 'confirmed' | 'denied' | 'expired';
  validatorName: string | null;
  validatorEmail: string;
  respondedAt: string | null;
  createdAt: string;
  expiresAt: string;
  responseText: string | null;
}

export async function requestValidation(
  input: RequestValidationInput,
): Promise<{ success: true; token: string } | { error: string }> {
  const parsed = requestValidationSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const session = await getUser();
  if (!session) return { error: 'Not authenticated.' };
  if (session.profile.membership_status !== 'active') {
    return { error: 'An active membership is required to request validations.' };
  }

  const { deploymentRecordId, validatorEmail, validatorName, relationshipContext } = parsed.data;
  const supabase = await createClient();

  const { data: record } = await supabase
    .from('deployment_records')
    .select('id, user_id')
    .eq('id', deploymentRecordId)
    .eq('user_id', session.user.id)
    .single();
  if (!record) return { error: 'Deployment record not found.' };

  const { data: existing } = await supabase
    .from('validation_requests')
    .select('id')
    .eq('deployment_record_id', deploymentRecordId)
    .eq('validator_email', validatorEmail)
    .eq('status', 'pending')
    .maybeSingle();
  if (existing) {
    return { error: 'A validation request to this email for this deployment is already pending.' };
  }

  const spend = await spendCoins(
    session.user.id,
    'validation_request',
    deploymentRecordId,
    'deployment_record',
    `Validation request — ${validatorEmail}`,
  );
  if (!spend.success) return { error: spend.error ?? 'Unable to deduct Sky Coins.' };

  const { data: inserted, error: insertError } = await supabase
    .from('validation_requests')
    .insert({
      deployment_record_id: deploymentRecordId,
      requestor_id: session.user.id,
      validator_email: validatorEmail,
      validator_name: validatorName,
      attestation_text: relationshipContext ?? null,
    })
    .select('token')
    .single();

  if (insertError || !inserted) {
    console.error('[validation.requestValidation] insert failed', insertError);
    return { error: 'Unable to create validation request.' };
  }

  if (process.env.NODE_ENV !== 'production') {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    console.log(`[validation] token URL: ${base}/validate/${inserted.token}`);
  }

  return { success: true, token: inserted.token };
}

export async function getValidationByToken(token: string): Promise<ValidationTokenView | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_validation_token_view', { p_token: token });
  if (error || !data) return null;
  return data as ValidationTokenView;
}

export async function submitValidationResponse(
  input: SubmitValidationInput,
): Promise<{ success: true } | { error: string }> {
  const parsed = submitValidationSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { token, status, responseText, attestationAccepted } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('submit_validation_response', {
    p_token: token,
    p_status: status,
    p_response_text: responseText ?? null,
    p_attestation_accepted: attestationAccepted,
  });

  if (error) {
    console.error('[validation.submit] rpc error', error);
    return { error: 'Something went wrong. Please try again.' };
  }
  if (!data) return { error: 'This validation link has expired or has already been used.' };

  if (attestationAccepted && status === 'confirmed') {
    await supabase
      .from('validation_requests')
      .update({ attestation_text: ATTESTATION_TEXT })
      .eq('token', token);
  }

  return { success: true };
}

export async function getDeploymentValidations(
  deploymentRecordId: string,
): Promise<ValidationSummary[]> {
  const session = await getUser();
  if (!session) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('validation_requests')
    .select('id, status, validator_name, validator_email, responded_at, created_at, expires_at, response_text')
    .eq('deployment_record_id', deploymentRecordId)
    .order('created_at', { ascending: false });

  if (!data) return [];
  return data.map((row) => ({
    id: row.id,
    status: row.status,
    validatorName: row.validator_name,
    validatorEmail: row.validator_email,
    respondedAt: row.responded_at,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    responseText: row.response_text,
  }));
}
