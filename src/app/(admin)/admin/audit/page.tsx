// TODO: test — default paginates most-recent-first
// TODO: test — filter by actor_id narrows results; invalid UUID returns empty set
// TODO: test — date range filters apply correctly across timezones
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AuditFilters from '@/components/admin/AuditFilters';
import AuditLogList from '@/components/admin/AuditLogList';
import Pagination from '@/components/admin/Pagination';
import { listAuditLog, getAuditFilterOptions } from '@/lib/queries/admin';

export const dynamic = 'force-dynamic';

const PER_PAGE = 50;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parsePage(v: string | undefined): number {
  const n = Number(v ?? 1);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(1000, Math.floor(n));
}

function parseIsoDate(v: string | undefined, endOfDay = false): string | undefined {
  if (!v) return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  if (endOfDay) d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const toStr = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const actorRaw = toStr(sp.actor_id);
  const actorId = actorRaw && UUID_RE.test(actorRaw) ? actorRaw : undefined;
  const action = toStr(sp.action);
  const entityType = toStr(sp.entity_type);
  const dateFrom = parseIsoDate(toStr(sp.from));
  const dateTo = parseIsoDate(toStr(sp.to), true);
  const page = parsePage(toStr(sp.page));

  const [{ rows, total }, options] = await Promise.all([
    listAuditLog({
      actorId,
      action,
      entityType,
      dateFrom,
      dateTo,
      page,
      perPage: PER_PAGE,
    }),
    getAuditFilterOptions(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Audit log"
        description="Every platform action, newest first. The log is tamper-evident via the hash chain computed at insert time."
      />

      <AuditFilters actions={options.actions} entityTypes={options.entityTypes} />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <AuditLogList entries={rows} />
        <Pagination
          basePath="/admin/audit"
          params={{
            actor_id: actorId,
            action,
            entity_type: entityType,
            from: toStr(sp.from),
            to: toStr(sp.to),
          }}
          page={page}
          total={total}
          perPage={PER_PAGE}
        />
      </div>
    </div>
  );
}
