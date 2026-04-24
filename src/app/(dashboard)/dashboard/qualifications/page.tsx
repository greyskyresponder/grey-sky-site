import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/getUser';
import { listMyPursuits } from '@/lib/actions/requirements';
import PursuitGrid from '@/components/qualifications/PursuitGrid';

export const dynamic = 'force-dynamic';

export default async function QualificationsPage() {
  const session = await getUser();
  if (!session) redirect('/login?redirect=/dashboard/qualifications');

  const { data: pursuits, error } = await listMyPursuits();

  const totalSlots = pursuits.reduce((sum, p) => sum + p.total_required, 0);
  const totalVerified = pursuits.reduce((sum, p) => sum + p.verified_required, 0);
  const overallPct = totalSlots === 0 ? 0 : Math.round((totalVerified / totalSlots) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--gs-navy,#0A1628)]">Qualifications</h1>
        <p className="text-sm text-[var(--gs-steel,#6B7280)] mt-1">
          Every position has a FEMA-defined checklist. Pick the roles you&apos;re working toward, upload against each requirement, and our team verifies it.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>
      )}

      {pursuits.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--gs-steel,#6B7280)] font-semibold">
                Overall progress
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--gs-navy,#0A1628)]">
                {overallPct}%
              </p>
              <p className="text-xs text-[var(--gs-steel,#6B7280)] mt-1">
                {totalVerified} of {totalSlots} required items verified · {pursuits.length} position{pursuits.length === 1 ? '' : 's'} pursued
              </p>
            </div>
          </div>
        </div>
      )}

      <PursuitGrid pursuits={pursuits} />
    </div>
  );
}
