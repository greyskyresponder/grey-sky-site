'use server';

import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getUser';
import { spendCoins } from '@/lib/coins/actions';
import {
  requestEvaluationSchema,
  submitEvaluationSchema,
  type RequestEvaluationInput,
  type SubmitEvaluationInput,
} from './schemas';

const ATTESTATION_TEXT =
  'I attest that this evaluation reflects my honest professional assessment based on direct observation during the deployment described above. I understand that this evaluation may be used in professional credentialing processes.';

export interface EvaluationTokenView {
  request: {
    id: string;
    status: string;
    evaluator_email: string;
    evaluator_name: string | null;
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

export interface EvaluationSummary {
  id: string;
  status: 'pending' | 'completed' | 'denied' | 'expired';
  evaluatorName: string | null;
  evaluatorEmail: string;
  respondedAt: string | null;
  createdAt: string;
  expiresAt: string;
  ratings: {
    leadership: number | null;
    tactical: number | null;
    communication: number | null;
    planning: number | null;
    technical: number | null;
    overall: number | null;
  };
  commentary: string | null;
}

export async function requestEvaluation(
  input: RequestEvaluationInput,
): Promise<{ success: true; token: string } | { error: string }> {
  const parsed = requestEvaluationSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const session = await getUser();
  if (!session) return { error: 'Not authenticated.' };
  if (session.profile.membership_status !== 'active') {
    return { error: 'An active membership is required to request evaluations.' };
  }

  const { deploymentRecordId, evaluatorEmail, evaluatorName, evaluatorRole } = parsed.data;
  const supabase = await createClient();

  const { data: record } = await supabase
    .from('deployment_records')
    .select('id, user_id')
    .eq('id', deploymentRecordId)
    .eq('user_id', session.user.id)
    .single();
  if (!record) return { error: 'Deployment record not found.' };

  const { data: existing } = await supabase
    .from('evaluation_requests')
    .select('id')
    .eq('deployment_record_id', deploymentRecordId)
    .eq('evaluator_email', evaluatorEmail)
    .eq('status', 'pending')
    .maybeSingle();
  if (existing) {
    return { error: 'An evaluation request to this email for this deployment is already pending.' };
  }

  const spend = await spendCoins(
    session.user.id,
    'evaluation_request',
    deploymentRecordId,
    'deployment_record',
    `Evaluation request — ${evaluatorEmail}`,
  );
  if (!spend.success) return { error: spend.error ?? 'Unable to deduct Sky Coins.' };

  const { data: inserted, error: insertError } = await supabase
    .from('evaluation_requests')
    .insert({
      deployment_record_id: deploymentRecordId,
      requestor_id: session.user.id,
      evaluator_email: evaluatorEmail,
      evaluator_name: evaluatorName,
      attestation_text: evaluatorRole ?? null,
    })
    .select('token')
    .single();

  if (insertError || !inserted) {
    console.error('[evaluation.requestEvaluation] insert failed', insertError);
    return { error: 'Unable to create evaluation request.' };
  }

  if (process.env.NODE_ENV !== 'production') {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    console.log(`[evaluation] token URL: ${base}/evaluate/${inserted.token}`);
  }

  return { success: true, token: inserted.token };
}

export async function getEvaluationByToken(token: string): Promise<EvaluationTokenView | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_evaluation_token_view', { p_token: token });
  if (error || !data) return null;
  return data as EvaluationTokenView;
}

export async function submitEvaluationResponse(
  input: SubmitEvaluationInput,
): Promise<{ success: true } | { error: string }> {
  const parsed = submitEvaluationSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();

  if (parsed.data.status === 'denied') {
    const { data, error } = await supabase.rpc('submit_evaluation_response', {
      p_token: parsed.data.token,
      p_status: 'denied',
      p_rating_leadership: null,
      p_rating_tactical: null,
      p_rating_communication: null,
      p_rating_planning: null,
      p_rating_technical: null,
      p_overall_rating: null,
      p_commentary: parsed.data.commentary ?? null,
      p_attestation_accepted: false,
    });
    if (error) return { error: 'Something went wrong. Please try again.' };
    if (!data) return { error: 'This evaluation link has expired or has already been used.' };
    return { success: true };
  }

  const {
    token,
    ratingLeadership,
    ratingTactical,
    ratingCommunication,
    ratingPlanning,
    ratingTechnical,
    commentary,
  } = parsed.data;

  const overall =
    Math.round(
      ((ratingLeadership + ratingTactical + ratingCommunication + ratingPlanning + ratingTechnical) /
        5) *
        100,
    ) / 100;

  const { data, error } = await supabase.rpc('submit_evaluation_response', {
    p_token: token,
    p_status: 'completed',
    p_rating_leadership: ratingLeadership,
    p_rating_tactical: ratingTactical,
    p_rating_communication: ratingCommunication,
    p_rating_planning: ratingPlanning,
    p_rating_technical: ratingTechnical,
    p_overall_rating: overall,
    p_commentary: commentary ?? null,
    p_attestation_accepted: true,
  });

  if (error) {
    console.error('[evaluation.submit] rpc error', error);
    return { error: 'Something went wrong. Please try again.' };
  }
  if (!data) return { error: 'This evaluation link has expired or has already been used.' };

  await supabase
    .from('evaluation_requests')
    .update({ attestation_text: ATTESTATION_TEXT })
    .eq('token', token);

  return { success: true };
}

export async function getDeploymentEvaluations(
  deploymentRecordId: string,
): Promise<EvaluationSummary[]> {
  const session = await getUser();
  if (!session) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from('evaluation_requests')
    .select(
      'id, status, evaluator_name, evaluator_email, responded_at, created_at, expires_at, rating_leadership, rating_tactical, rating_communication, rating_planning, rating_technical, overall_rating, commentary',
    )
    .eq('deployment_record_id', deploymentRecordId)
    .order('created_at', { ascending: false });

  if (!data) return [];
  return data.map((row) => ({
    id: row.id,
    status: row.status,
    evaluatorName: row.evaluator_name,
    evaluatorEmail: row.evaluator_email,
    respondedAt: row.responded_at,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    ratings: {
      leadership: row.rating_leadership,
      tactical: row.rating_tactical,
      communication: row.rating_communication,
      planning: row.rating_planning,
      technical: row.rating_technical,
      overall: row.overall_rating,
    },
    commentary: row.commentary,
  }));
}
