// TODO: test — unknown validation id renders not-found
// TODO: test — non-pending request hides the action form
// TODO: test — requestor link navigates to /admin/users/[id]
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import StatusPill from '@/components/admin/StatusPill';
import ValidationActionForm from '@/components/admin/ValidationActionForm';
import { getValidationDetail, type ValidationStatus } from '@/lib/queries/admin';

export const dynamic = 'force-dynamic';

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function statusTone(s: ValidationStatus): 'warn' | 'success' | 'alert' | 'neutral' {
  switch (s) {
    case 'pending':
      return 'warn';
    case 'confirmed':
      return 'success';
    case 'denied':
      return 'alert';
    case 'expired':
      return 'neutral';
  }
}

export default async function AdminValidationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getValidationDetail(id);

  if (!detail) notFound();

  return (
    <div>
      <Link
        href="/admin/validations"
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#0A1628] mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to validation queue
      </Link>

      <AdminPageHeader
        title="Validation request"
        description={`Issued to ${detail.validator_email}`}
        actions={<StatusPill label={detail.status} tone={statusTone(detail.status)} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-[#0A1628] mb-3">Details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Validator</dt>
                <dd className="text-gray-800">
                  {detail.validator_name ?? '—'}
                  <span className="block text-xs text-gray-500">
                    {detail.validator_email}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Requestor</dt>
                <dd>
                  <Link
                    href={`/admin/users/${detail.requestor_id}`}
                    className="text-[#0A1628] font-medium hover:text-[#C5933A]"
                  >
                    {detail.requestor_name || detail.requestor_email || 'Unknown'}
                  </Link>
                  {detail.requestor_email && (
                    <span className="block text-xs text-gray-500">
                      {detail.requestor_email}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Deployment record</dt>
                <dd className="text-gray-800 font-mono text-xs break-all">
                  {detail.deployment_record_id}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Created</dt>
                <dd className="text-gray-800">{formatDateTime(detail.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Expires</dt>
                <dd className="text-gray-800">{formatDateTime(detail.expires_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Responded</dt>
                <dd className="text-gray-800">{formatDateTime(detail.responded_at)}</dd>
              </div>
              {detail.response_text && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-gray-500">Validator response</dt>
                  <dd className="mt-1 p-3 rounded bg-gray-50 border border-gray-100 text-sm text-gray-800 whitespace-pre-wrap">
                    {detail.response_text}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-[#0A1628] mb-3">
              Admin decision
            </h2>
            {detail.status === 'pending' ? (
              <ValidationActionForm validationId={detail.id} />
            ) : (
              <p className="text-xs text-gray-500">
                This request has already been resolved. No further admin action is
                available from this screen.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
