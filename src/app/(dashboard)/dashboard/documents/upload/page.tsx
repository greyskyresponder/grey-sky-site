import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getUser } from '@/lib/auth/getUser';
import DocumentUploadForm from '@/components/documents/DocumentUploadForm';

export default async function DocumentUploadPage() {
  const session = await getUser();
  if (!session) redirect('/login');

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/documents"
        className="inline-flex items-center gap-1 text-sm text-[var(--gs-steel)] hover:text-[var(--gs-navy)] transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Documents
      </Link>

      <div>
        <h1 className="text-xl font-bold text-[var(--gs-navy)]">Add a Document</h1>
        <p className="text-sm text-[var(--gs-steel)] mt-1">
          Certifications, training records, ICS forms, credentials — everything that proves what you&apos;ve done.
        </p>
      </div>

      <DocumentUploadForm />
    </div>
  );
}
