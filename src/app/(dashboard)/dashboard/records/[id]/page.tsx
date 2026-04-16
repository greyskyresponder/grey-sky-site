import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/lib/auth/getUser';
import { getDeployment } from '@/lib/queries/deployments';
import { createClient } from '@/lib/supabase/server';
import { RecordDetail } from '@/components/dashboard/records/RecordDetail';
import { getDeploymentValidations } from '@/lib/validation/actions';
import { getDeploymentEvaluations } from '@/lib/evaluation/actions';

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

  const [validations, evaluations] = await Promise.all([
    getDeploymentValidations(id),
    getDeploymentEvaluations(id),
  ]);

  return <RecordDetail record={record} validations={validations} evaluations={evaluations} />;
}
