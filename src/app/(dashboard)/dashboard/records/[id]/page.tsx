import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/lib/auth/getUser';
import { getDeployment } from '@/lib/queries/deployments';
import { createClient } from '@/lib/supabase/server';
import { RecordDetail } from '@/components/dashboard/records/RecordDetail';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RecordDetailPage({ params }: Props) {
  const session = await getUser();
  if (!session) redirect('/login');

  const { id } = await params;
  const supabase = await createClient();
  const record = await getDeployment(supabase, session.user.id, id);

  if (!record) notFound();

  return <RecordDetail record={record} />;
}
