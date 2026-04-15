import { createClient } from './server';
import type { MembershipStatus } from '@/lib/types/enums';

export interface DashboardStats {
  deployment_count: number;
  incident_count: number;
  document_count: number;
  pending_validations: number;
  pending_evaluations: number;
  profile_completeness: number;
  membership_status: MembershipStatus;
  membership_expires_at: string | null;
}

const EMPTY_STATS: DashboardStats = {
  deployment_count: 0,
  incident_count: 0,
  document_count: 0,
  pending_validations: 0,
  pending_evaluations: 0,
  profile_completeness: 0,
  membership_status: 'none',
  membership_expires_at: null,
};

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_dashboard_stats', { p_user_id: userId });

  if (error || !data) {
    if (error) console.error('Dashboard stats error:', error);
    return EMPTY_STATS;
  }

  return data as DashboardStats;
}
