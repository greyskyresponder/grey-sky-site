import Link from 'next/link';
import { FileText, ShieldCheck } from 'lucide-react';

type QuickActionPanelProps = {
  hasRecords: boolean;
  hasValidations: boolean;
  firstRecordId?: string;
};

export default function QuickActionPanel({
  hasRecords,
  hasValidations,
  firstRecordId,
}: QuickActionPanelProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-[#0A1628] mb-4">
        Quick Actions
      </h2>

      {!hasRecords && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-4">
            You haven&apos;t filed any Response Reports yet. Your service
            matters — start by documenting your most recent deployment.
          </p>
          <Link
            href="/dashboard/records/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C5933A] text-[#0A1628] font-semibold text-sm rounded hover:bg-[#C5933A]/90 transition-colors"
          >
            <FileText className="w-4 h-4" />
            File Your First Response Report
          </Link>
        </div>
      )}

      {hasRecords && !hasValidations && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500 mb-4">
            You have Response Reports on file. Strengthen your record by
            requesting verification from a supervisor or colleague.
          </p>
          <Link
            href={
              firstRecordId
                ? `/dashboard/records/${firstRecordId}`
                : '/dashboard/records'
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C5933A] text-[#0A1628] font-semibold text-sm rounded hover:bg-[#C5933A]/90 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            Request Your First Validation
          </Link>
        </div>
      )}

      {hasRecords && hasValidations && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/records/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C5933A] text-[#0A1628] font-semibold text-sm rounded hover:bg-[#C5933A]/90 transition-colors flex-1"
          >
            <FileText className="w-4 h-4" />
            New Response Report
          </Link>
          <Link
            href="/dashboard/records"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-[#C5933A] text-[#C5933A] font-semibold text-sm rounded hover:bg-[#C5933A]/10 transition-colors flex-1"
          >
            <ShieldCheck className="w-4 h-4" />
            Request Validation
          </Link>
        </div>
      )}
    </div>
  );
}
