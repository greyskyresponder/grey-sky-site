'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DeploymentRecordDetail } from '@/lib/types/deployment-views';
import { RecordVerificationBadge } from './RecordVerificationBadge';
import { RecordStatusBadge } from './RecordStatusBadge';
import { submitDeploymentAction } from '@/lib/actions/deployments';

export function RecordDetail({ record }: { record: DeploymentRecordDetail }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const positionTitle =
    record.position?.title ?? record.positionFreeText ?? 'Unknown Position';
  const dateRange = record.endDate
    ? `${new Date(record.startDate).toLocaleDateString()} \u2013 ${new Date(record.endDate).toLocaleDateString()}`
    : `${new Date(record.startDate).toLocaleDateString()} \u2013 Present`;

  async function handleSubmit() {
    setSubmitting(true);
    const result = await submitDeploymentAction(record.id);
    if (result.error) {
      alert(result.error);
      setSubmitting(false);
    } else {
      setShowConfirm(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--gs-navy)]">{positionTitle}</h2>
            {record.position?.resourceCategory && (
              <p className="text-sm text-[var(--gs-steel)] mt-0.5">
                {record.position.resourceCategory}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <RecordVerificationBadge tier={record.verificationTier} />
            <RecordStatusBadge status={record.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-[var(--gs-steel)] text-xs mb-0.5">Dates</p>
            <p className="text-[var(--gs-navy)] font-medium">{dateRange}</p>
          </div>
          {record.hours && (
            <div>
              <p className="text-[var(--gs-steel)] text-xs mb-0.5">Hours</p>
              <p className="text-[var(--gs-navy)] font-medium">{record.hours}</p>
            </div>
          )}
          {record.organization && (
            <div>
              <p className="text-[var(--gs-steel)] text-xs mb-0.5">Organization</p>
              <p className="text-[var(--gs-navy)] font-medium">{record.organization.name}</p>
            </div>
          )}
          <div>
            <p className="text-[var(--gs-steel)] text-xs mb-0.5">Verification</p>
            <RecordVerificationBadge tier={record.verificationTier} showDescription />
          </div>
        </div>
      </div>

      {/* Incident */}
      {record.incident && (
        <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
          <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-3">Incident</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--gs-steel)] text-xs mb-0.5">Name</p>
              <p className="text-[var(--gs-navy)] font-medium">{record.incident.name}</p>
            </div>
            <div>
              <p className="text-[var(--gs-steel)] text-xs mb-0.5">Type</p>
              <p className="text-[var(--gs-navy)] font-medium capitalize">
                {record.incident.type.replace(/_/g, ' ')}
              </p>
            </div>
            {record.incident.state && (
              <div>
                <p className="text-[var(--gs-steel)] text-xs mb-0.5">State</p>
                <p className="text-[var(--gs-navy)] font-medium">{record.incident.state}</p>
              </div>
            )}
            {record.incident.femaDisasterNumber && (
              <div>
                <p className="text-[var(--gs-steel)] text-xs mb-0.5">FEMA Disaster #</p>
                <p className="text-[var(--gs-navy)] font-medium">
                  {record.incident.femaDisasterNumber}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supervisor */}
      {(record.supervisorName || record.supervisorEmail) && (
        <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
          <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-3">
            Supervisor / Point of Contact
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {record.supervisorName && (
              <div>
                <p className="text-[var(--gs-steel)] text-xs mb-0.5">Name</p>
                <p className="text-[var(--gs-navy)]">{record.supervisorName}</p>
              </div>
            )}
            {record.supervisorEmail && (
              <div>
                <p className="text-[var(--gs-steel)] text-xs mb-0.5">Email</p>
                <p className="text-[var(--gs-navy)]">{record.supervisorEmail}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {record.notes && (
        <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
          <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-3">Additional Context</h3>
          <p className="text-sm text-[var(--gs-steel)] whitespace-pre-line">{record.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        {record.status === 'draft' && (
          <>
            <Link
              href={`/dashboard/records/${record.id}/edit`}
              className="bg-[var(--gs-navy)] text-white hover:opacity-90 px-4 py-2 rounded-md text-sm font-medium transition-opacity"
            >
              Edit Record
            </Link>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="bg-[var(--gs-gold)] text-[var(--gs-navy)] hover:opacity-90 px-4 py-2 rounded-md text-sm font-medium transition-opacity"
            >
              Submit Record
            </button>
          </>
        )}
        {record.status === 'submitted' && (
          <>
            <button
              type="button"
              disabled
              title="Coming in a future update"
              className="bg-gray-100 text-gray-400 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
            >
              Request Validation
            </button>
            <button
              type="button"
              disabled
              title="Coming in a future update"
              className="bg-gray-100 text-gray-400 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
            >
              Request Evaluation
            </button>
          </>
        )}
        <Link
          href="/dashboard/records"
          className="border border-[var(--gs-cloud)] text-[var(--gs-steel)] hover:bg-[var(--gs-white)] px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Back to Records
        </Link>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-3">
              Submit this record?
            </h3>
            <p className="text-sm text-[var(--gs-steel)] mb-6">
              Once submitted, this record becomes part of your permanent service history.
              You can request verifications after submission. Are you sure?
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="border border-[var(--gs-cloud)] text-[var(--gs-steel)] px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[var(--gs-gold)] text-[var(--gs-navy)] px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Yes, Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
