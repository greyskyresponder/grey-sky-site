import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getUser } from '@/lib/auth/getUser';
import { createClient } from '@/lib/supabase/server';
import { getPositionRequirements, addPursuit } from '@/lib/actions/requirements';
import RequirementChecklist from '@/components/qualifications/RequirementChecklist';
import CompletionBar from '@/components/qualifications/CompletionBar';
import type { NimsType } from '@/lib/types/enums';

export const dynamic = 'force-dynamic';

function formatNimsType(nt: NimsType | null): string {
  if (!nt) return '';
  return `Type ${nt.replace('type', '')}`;
}

export default async function PositionRequirementsPage({
  params,
}: {
  params: Promise<{ positionId: string }>;
}) {
  const { positionId } = await params;

  const session = await getUser();
  if (!session) redirect(`/login?redirect=/dashboard/qualifications/${positionId}`);

  if (!/^[0-9a-f-]{36}$/i.test(positionId)) notFound();

  const supabase = await createClient();
  const { data: position } = await supabase
    .from('positions')
    .select('id, title, rtlt_code, nims_type, discipline, resource_category, description')
    .eq('id', positionId)
    .single();

  if (!position) notFound();

  // Ensure user is pursuing this position when they land here directly.
  const { data: pursuitRow } = await supabase
    .from('user_position_pursuits')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('position_id', positionId)
    .maybeSingle();
  if (!pursuitRow) {
    await addPursuit({ position_id: positionId });
  }

  const { slots, error } = await getPositionRequirements(positionId);

  const requiredSlots = slots.filter((s) => s.requirement.is_required);
  const verified = requiredSlots.filter((s) => s.fulfillment?.status === 'verified').length;
  const pending = requiredSlots.filter((s) => s.fulfillment?.status === 'pending').length;
  const rejected = requiredSlots.filter((s) => s.fulfillment?.status === 'rejected').length;
  const expired = requiredSlots.filter((s) => s.fulfillment?.status === 'expired').length;
  const total = requiredSlots.length;
  const pct = total === 0 ? 0 : Math.round((verified / total) * 100);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/qualifications"
          className="inline-flex items-center gap-1 text-xs text-[var(--gs-steel,#6B7280)] hover:text-[var(--gs-navy,#0A1628)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Qualifications
        </Link>
        <h1 className="mt-2 text-xl font-bold text-[var(--gs-navy,#0A1628)]">
          {position.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[var(--gs-steel,#6B7280)]">
          {position.nims_type && (
            <span className="px-2 py-0.5 rounded bg-[var(--gs-navy,#0A1628)] text-white font-medium">
              {formatNimsType(position.nims_type as NimsType)}
            </span>
          )}
          {position.discipline && <span>{position.discipline}</span>}
          {position.resource_category && position.resource_category !== position.discipline && (
            <span>· {position.resource_category}</span>
          )}
          {position.rtlt_code && <span className="text-[11px] text-gray-400">RTLT {position.rtlt_code}</span>}
        </div>
        {position.description && (
          <p className="mt-2 text-sm text-[var(--gs-steel,#6B7280)] max-w-3xl">
            {position.description}
          </p>
        )}
      </div>

      {error && (
        <div className="px-4 py-3 rounded bg-red-50 text-red-800 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <CompletionBar
          percent={pct}
          verified={verified}
          total={total}
          pending={pending}
          rejected={rejected}
          expired={expired}
        />
      </div>

      <RequirementChecklist slots={slots} />
    </div>
  );
}
