import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import StatusPill from '@/components/admin/StatusPill';
import VerificationActions from '@/components/admin/VerificationActions';
import { getFulfillmentById } from '@/lib/actions/requirements';
import { getDocumentUrl } from '@/lib/actions/documents';

export const dynamic = 'force-dynamic';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function VerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { entry, error } = await getFulfillmentById(id);
  if (!entry) notFound();

  let documentUrl: string | null = null;
  if (entry.fulfillment.document_id) {
    const urlRes = await getDocumentUrl(entry.fulfillment.document_id);
    documentUrl = urlRes.url;
  }

  return (
    <div>
      <Link
        href="/admin/verifications"
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#0A1628] mb-3"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to verification queue
      </Link>

      <AdminPageHeader
        title="Review submission"
        description="Confirm this document satisfies the RTLT requirement. Approve with an optional expiry, or reject with a clear reason the responder will see."
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Requirement
            </h2>
            <p className="mt-1 text-base font-semibold text-[#0A1628]">
              {entry.requirement.code && (
                <span className="text-[#C5933A] font-mono mr-2">{entry.requirement.code}</span>
              )}
              {entry.requirement.title}
            </p>
            <p className="mt-1 text-xs text-gray-500 capitalize">
              {entry.requirement.requirement_type} · {entry.requirement.group_label ?? 'Requirements'}
            </p>
            {entry.requirement.description && (
              <p className="mt-2 text-sm text-gray-700">{entry.requirement.description}</p>
            )}
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Document
            </h2>
            <p className="mt-1 text-sm text-[#0A1628] font-medium">
              {entry.document_name ?? 'No document attached'}
            </p>
            {documentUrl && (
              <a
                href={documentUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#C5933A] hover:text-[#0A1628]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open signed URL (5-min)
              </a>
            )}
            {entry.fulfillment.document_date && (
              <p className="mt-2 text-xs text-gray-500">
                Document date: {formatDate(entry.fulfillment.document_date)}
              </p>
            )}
            {entry.fulfillment.notes && (
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold">Responder note:</span> {entry.fulfillment.notes}
              </p>
            )}
          </section>

          {entry.fulfillment.status === 'pending' && (
            <section className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Decision
              </h2>
              <VerificationActions
                fulfillmentId={entry.fulfillment.id}
                defaultExpiresAt={entry.fulfillment.expires_at}
              />
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</h2>
            <div className="mt-2">
              <StatusPill label={entry.fulfillment.status} tone="warn" />
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Submitted</dt>
                <dd className="text-gray-800">{formatDate(entry.fulfillment.created_at)}</dd>
              </div>
              {entry.fulfillment.verified_at && (
                <div>
                  <dt className="text-xs text-gray-500">Reviewed</dt>
                  <dd className="text-gray-800">{formatDate(entry.fulfillment.verified_at)}</dd>
                </div>
              )}
              {entry.fulfillment.expires_at && (
                <div>
                  <dt className="text-xs text-gray-500">Expires</dt>
                  <dd className="text-gray-800">{formatDate(entry.fulfillment.expires_at)}</dd>
                </div>
              )}
              {entry.fulfillment.rejection_reason && (
                <div>
                  <dt className="text-xs text-gray-500">Rejection reason</dt>
                  <dd className="text-red-700">{entry.fulfillment.rejection_reason}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Responder
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#0A1628]">
              {entry.user.first_name} {entry.user.last_name}
            </p>
            <p className="text-xs text-gray-500">{entry.user.email}</p>
            <Link
              href={`/admin/users/${entry.user.id}`}
              className="mt-2 inline-block text-xs font-semibold text-[#C5933A] hover:text-[#0A1628]"
            >
              View profile →
            </Link>
          </section>

          <section className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Position
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#0A1628]">{entry.position.title}</p>
            {entry.position.rtlt_code && (
              <p className="text-xs text-gray-400">RTLT {entry.position.rtlt_code}</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
