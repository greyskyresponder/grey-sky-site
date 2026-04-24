'use client';

import { useTransition } from 'react';
import { Check, Clock, X, AlertTriangle, Upload, FileText, RotateCcw } from 'lucide-react';
import { detachDocument } from '@/lib/actions/requirements';
import type { RequirementSlotView } from '@/lib/types/requirements';

type StatusMeta = {
  label: string;
  className: string;
  Icon: typeof Check;
};

const STATUS_META: Record<string, StatusMeta> = {
  unfulfilled: {
    label: 'Needed',
    className: 'bg-gray-100 text-gray-600',
    Icon: Upload,
  },
  pending: {
    label: 'Under Review',
    className: 'bg-[var(--gs-gold,#C5933A)]/15 text-[var(--gs-gold,#C5933A)]',
    Icon: Clock,
  },
  verified: {
    label: 'Verified',
    className: 'bg-green-100 text-green-800',
    Icon: Check,
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800',
    Icon: X,
  },
  expired: {
    label: 'Expired',
    className: 'bg-amber-100 text-amber-800',
    Icon: AlertTriangle,
  },
};

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

export default function RequirementSlot({
  slot,
  onUploadClick,
}: {
  slot: RequirementSlotView;
  onUploadClick: (slot: RequirementSlotView) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const status = slot.fulfillment?.status ?? 'unfulfilled';
  const meta = STATUS_META[status] ?? STATUS_META.unfulfilled;
  const { Icon } = meta;

  const canUpload = !slot.fulfillment || ['unfulfilled', 'rejected', 'expired'].includes(status);
  const canDetach = slot.fulfillment && ['pending', 'rejected'].includes(status);

  function handleDetach() {
    if (!slot.fulfillment) return;
    if (!confirm('Detach this document from the slot?')) return;
    startTransition(async () => {
      await detachDocument({ fulfillment_id: slot.fulfillment!.id });
    });
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {slot.requirement.code && (
              <span className="text-[11px] font-mono text-[var(--gs-gold,#C5933A)] font-semibold">
                {slot.requirement.code}
              </span>
            )}
            <h4 className="text-sm font-semibold text-[var(--gs-navy,#0A1628)]">
              {slot.requirement.title}
            </h4>
            {!slot.requirement.is_required && (
              <span className="text-[10px] uppercase tracking-wide text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                Optional
              </span>
            )}
          </div>
          {slot.requirement.description && (
            <p className="text-xs text-[var(--gs-steel,#6B7280)] mt-1 line-clamp-2">
              {slot.requirement.description}
            </p>
          )}
          {slot.document_name && (
            <p className="text-xs text-[var(--gs-steel,#6B7280)] mt-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span className="truncate">{slot.document_name}</span>
            </p>
          )}
          {status === 'rejected' && slot.fulfillment?.rejection_reason && (
            <p className="text-xs text-red-700 mt-2">
              <span className="font-semibold">Rejected:</span> {slot.fulfillment.rejection_reason}
            </p>
          )}
          {status === 'verified' && slot.fulfillment?.verified_at && (
            <p className="text-xs text-green-700 mt-2">
              Verified {formatDate(slot.fulfillment.verified_at)}
              {slot.fulfillment.expires_at && (
                <> · Expires {formatDate(slot.fulfillment.expires_at)}</>
              )}
            </p>
          )}
          {status === 'expired' && slot.fulfillment?.expires_at && (
            <p className="text-xs text-amber-700 mt-2">
              Expired {formatDate(slot.fulfillment.expires_at)}
            </p>
          )}
        </div>

        <span
          className={`flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded whitespace-nowrap ${meta.className}`}
        >
          <Icon className="w-3 h-3" />
          {meta.label}
        </span>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
        {canDetach && (
          <button
            type="button"
            onClick={handleDetach}
            disabled={isPending}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[var(--gs-steel,#6B7280)] hover:text-[var(--gs-navy,#0A1628)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Detach
          </button>
        )}
        {canUpload && (
          <button
            type="button"
            onClick={() => onUploadClick(slot)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[var(--gs-navy,#0A1628)] text-white rounded hover:bg-[var(--gs-gold,#C5933A)] hover:text-[var(--gs-navy,#0A1628)] transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            {status === 'rejected' ? 'Re-upload' : status === 'expired' ? 'Upload Renewal' : 'Upload'}
          </button>
        )}
      </div>
    </div>
  );
}
