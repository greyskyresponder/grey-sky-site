import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { getUser } from '@/lib/auth/getUser';
import { listDeployments } from '@/lib/queries/deployments';
import { createClient } from '@/lib/supabase/server';
import { RecordCard } from '@/components/dashboard/records/RecordCard';
import { RecordsFilters } from '@/components/dashboard/records/RecordsFilters';
import { EmptyRecords } from '@/components/dashboard/records/EmptyRecords';
import type { DeploymentFilters } from '@/lib/types/deployment-views';

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function RecordsPage({ searchParams }: Props) {
  const session = await getUser();
  if (!session) redirect('/login');

  const params = await searchParams;
  const filters: DeploymentFilters = {
    status: (params.status as DeploymentFilters['status']) ?? 'all',
    verificationTier: (params.tier as DeploymentFilters['verificationTier']) ?? 'all',
    dateFrom: params.from ?? null,
    dateTo: params.to ?? null,
    search: params.search ?? '',
    page: parseInt(params.page ?? '1', 10),
    perPage: 20,
  };

  const supabase = await createClient();
  const { records, total } = await listDeployments(supabase, session.user.id, filters);
  const totalPages = Math.ceil(total / filters.perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[var(--gs-navy)]">Service Record</h1>
        <Link
          href="/dashboard/records/new"
          className="bg-[var(--gs-navy)] text-white hover:opacity-90 px-4 py-2 rounded-md text-sm font-medium transition-opacity"
        >
          Record a Deployment
        </Link>
      </div>

      <Suspense fallback={null}>
        <RecordsFilters />
      </Suspense>

      {records.length === 0 && filters.status === 'all' && !filters.dateFrom ? (
        <EmptyRecords />
      ) : records.length === 0 ? (
        <p className="text-sm text-[var(--gs-steel)] text-center py-8">
          No records match your filters.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {records.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-[var(--gs-steel)]">
                Page {filters.page} of {totalPages} ({total} records)
              </p>
              <div className="flex gap-2">
                {filters.page > 1 && (
                  <Link
                    href={`/dashboard/records?page=${filters.page - 1}&status=${params.status ?? ''}&tier=${params.tier ?? ''}`}
                    className="px-3 py-1.5 border border-[var(--gs-cloud)] rounded text-sm hover:bg-[var(--gs-white)]"
                  >
                    Previous
                  </Link>
                )}
                {filters.page < totalPages && (
                  <Link
                    href={`/dashboard/records?page=${filters.page + 1}&status=${params.status ?? ''}&tier=${params.tier ?? ''}`}
                    className="px-3 py-1.5 bg-[var(--gs-navy)] text-white rounded text-sm hover:opacity-90"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
