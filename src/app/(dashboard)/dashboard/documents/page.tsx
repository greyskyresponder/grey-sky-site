import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getUser } from '@/lib/auth/getUser';
import { getMyDocuments } from '@/lib/actions/documents';
import DocumentLibrary from '@/components/documents/DocumentLibrary';

export default async function DocumentsPage() {
  const session = await getUser();
  if (!session) redirect('/login');

  const { data, total } = await getMyDocuments({ page: 1, per_page: 20 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--gs-navy)]">Your Documents</h1>
          <p className="text-sm text-[var(--gs-steel)] mt-1">
            The paper trail of a life in service. Upload, organize, and link your records.
          </p>
        </div>
        <Link
          href="/dashboard/documents/upload"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold)]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </Link>
      </div>

      <DocumentLibrary initialResults={data} initialTotal={total} />
    </div>
  );
}
