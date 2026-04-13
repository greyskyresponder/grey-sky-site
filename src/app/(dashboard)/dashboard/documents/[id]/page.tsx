import { notFound, redirect } from 'next/navigation';
import { getUser } from '@/lib/auth/getUser';
import { getDocumentById } from '@/lib/actions/documents';
import DocumentDetail from '@/components/documents/DocumentDetail';

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getUser();
  if (!session) redirect('/login');

  const { id } = await params;
  const { document, error } = await getDocumentById(id);

  if (error || !document) notFound();

  return <DocumentDetail document={document} />;
}
