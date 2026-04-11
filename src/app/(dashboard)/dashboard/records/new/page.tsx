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
      <h1 className="text-xl font-bold text-[var(--gs-navy)] mb-6">Record a Deployment</h1>
      <RecordForm categories={categories} userOrgs={userOrgs} />
    </div>
  );
}
