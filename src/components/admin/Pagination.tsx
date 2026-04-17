import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  basePath: string;
  /** Current query params (page will be overridden) */
  params: Record<string, string | undefined>;
  page: number;
  total: number;
  perPage: number;
};

function buildHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && k !== 'page') search.set(k, v);
  }
  if (page > 1) search.set('page', String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function Pagination({
  basePath,
  params,
  page,
  total,
  perPage,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) {
    return (
      <div className="px-4 py-3 text-xs text-gray-400 text-right">
        {total.toLocaleString()} total
      </div>
    );
  }

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);

  return (
    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
      <span>
        {start.toLocaleString()}–{end.toLocaleString()} of {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link
            href={buildHref(basePath, params, prevPage)}
            className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 flex items-center gap-1"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </Link>
        ) : (
          <span className="px-2 py-1 rounded border border-gray-100 text-gray-300 flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" />
            Prev
          </span>
        )}
        <span className="px-2">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={buildHref(basePath, params, nextPage)}
            className="px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 flex items-center gap-1"
            aria-label="Next page"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <span className="px-2 py-1 rounded border border-gray-100 text-gray-300 flex items-center gap-1">
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}
