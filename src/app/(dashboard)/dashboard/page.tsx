import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/getUser';
import { createAdminClient } from '@/lib/supabase/admin';
import WelcomeBar from '@/components/dashboard/WelcomeBar';
import StatusGrid from '@/components/dashboard/StatusGrid';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActionPanel from '@/components/dashboard/QuickActionPanel';

export default async function DashboardPage() {
  const session = await getUser();
  if (!session) {
    redirect('/auth/login?redirect=/dashboard');
  }

  const { profile } = session;
  const userId = session.user.id;
  const supabase = createAdminClient();

  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(' ') ||
    session.user.email?.split('@')[0] ||
    'Responder';

  // Fetch dashboard data in parallel
  const [
    recordsCountResult,
    tierBreakdownResult,
    certsActiveResult,
    certsInProgressResult,
    recentLedgerResult,
    recentRecordsResult,
  ] = await Promise.all([
    // Total deployment records
    supabase
      .from('deployment_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),

    // Verification tier breakdown
    supabase
      .from('deployment_records')
      .select('verification_tier')
      .eq('user_id', userId),

    // Active certifications
    supabase
      .from('user_certifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'certified')
      .or('expires_at.is.null,expires_at.gt.now()'),

    // In-progress certifications
    supabase
      .from('user_certifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'in_progress'),

    // Last 5 sky points ledger entries
    supabase
      .from('sky_points_ledger')
      .select('id, transaction_type, amount, description, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),

    // Last 3 deployment records
    supabase
      .from('deployment_records')
      .select('id, verification_tier, created_at, start_date, positions(title)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  // Compute verification breakdown
  const tierRows = tierBreakdownResult.data || [];
  const verificationBreakdown = {
    self_certified: tierRows.filter(
      (r: { verification_tier: string }) => r.verification_tier === 'self_certified'
    ).length,
    validated: tierRows.filter(
      (r: { verification_tier: string }) => r.verification_tier === 'validated_360'
    ).length,
    evaluated: tierRows.filter(
      (r: { verification_tier: string }) => r.verification_tier === 'evaluated_ics225'
    ).length,
  };

  const recordsCount = recordsCountResult.count ?? 0;
  // sky_points_balance may not be on the User type yet — safely access via indexing
  const skyPointsBalance =
    typeof (profile as unknown as Record<string, unknown>).sky_points_balance === 'number'
      ? ((profile as unknown as Record<string, unknown>).sky_points_balance as number)
      : 0;
  const certsActive = certsActiveResult.count ?? 0;
  const certsInProgress = certsInProgressResult.count ?? 0;
  const recentLedger = recentLedgerResult.data ?? [];
  const recentRecords = recentRecordsResult.data ?? [];

  const hasRecords = recordsCount > 0;
  const hasValidations =
    verificationBreakdown.validated > 0 || verificationBreakdown.evaluated > 0;
  const firstRecordId = recentRecords.length > 0 ? recentRecords[0].id : undefined;

  return (
    <div>
      <WelcomeBar
        displayName={displayName}
        membershipStatus={profile.membership_status}
      />

      <StatusGrid
        recordsCount={recordsCount}
        verificationBreakdown={verificationBreakdown}
        skyPointsBalance={skyPointsBalance}
        certsActive={certsActive}
        certsInProgress={certsInProgress}
      />

      <RecentActivity
        recentLedger={recentLedger}
        recentRecords={recentRecords}
      />

      <QuickActionPanel
        hasRecords={hasRecords}
        hasValidations={hasValidations}
        firstRecordId={firstRecordId}
      />
    </div>
  );
}
