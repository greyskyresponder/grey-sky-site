import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/getUser';
import { createClient } from '@/lib/supabase/server';
import { getPositionCategories } from '@/lib/queries/positions-search';
import { RecordForm } from '@/components/dashboard/records/RecordForm';

export default async function NewRecordPage() {
  const session = await getUser();
  if (!session) redirect('/login');

  const supabase = await createClient();

  const [categories, orgsResult] = await Promise.all([
    getPositionCategories(supabase),
    supabase
      .from('user_organizations')
      .select('org_id, organizations(id, name)')
      .eq('user_id', session.user.id),
  ]);

  const userOrgs = (orgsResult.data ?? []).map((row: Record<string, unknown>) => {
    const org = row.organizations as Record<string, unknown> | null;
    return {
      id: (org?.id as string) ?? (row.org_id as string),
      name: (org?.name as string) ?? '',
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--gs-navy)]">Submit Response Report</h1>
        <p className="text-sm text-[var(--gs-steel)] mt-0.5">
          ICS 222 Response Report — document your deployment for your service record.
        </p>
      </div>
      <RecordForm categories={categories} userOrgs={userOrgs} />
    </div>
  );
}
