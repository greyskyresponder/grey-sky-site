// TODO: test — grid/list toggle, category filter, search, pagination, empty state
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, Grid3X3, List } from 'lucide-react';
import { getMyDocuments } from '@/lib/actions/documents';
import DocumentCard from './DocumentCard';
import DocumentRow from './DocumentRow';
import type { DocumentSummary } from '@/lib/types/documents';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'certification', label: 'Certifications & Licenses' },
  { value: 'training', label: 'Training Records' },
  { value: 'deployment', label: 'Deployment Records' },
  { value: 'identification', label: 'Identification' },
  { value: 'medical', label: 'Medical Records' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'correspondence', label: 'Correspondence' },
  { value: 'membership', label: 'Membership' },
  { value: 'other', label: 'Other' },
];

export default function DocumentLibrary({
  initialResults,
  initialTotal,
}: {
  initialResults: DocumentSummary[];
  initialTotal: number;
}) {
  const [results, setResults] = useState(initialResults);
  const [total, setTotal] = useState(initialTotal);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (cat: string, q: string, p: number) => {
    setLoading(true);
    const filters: Record<string, unknown> = { page: p, per_page: 20 };
    if (cat) filters.category = cat;
    if (q) filters.search = q;
    const { data, total: t } = await getMyDocuments(filters);
    setResults(data);
    setTotal(t);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(category, search, 1);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [category, search, doSearch]);

  const totalPages = Math.ceil(total / 20);

  function handlePageChange(newPage: number) {
    setPage(newPage);
    doSearch(category, search, newPage);
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gs-steel)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            aria-label="Search documents"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--gs-cloud)] text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--gs-gold)]"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="rounded-md border border-[var(--gs-cloud)] px-3 py-2 text-sm text-[var(--gs-navy)] focus:border-[var(--gs-gold)] focus:outline-none"
        >
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        <div className="flex border border-[var(--gs-cloud)] rounded-md">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-[var(--gs-cloud)]/50 text-[var(--gs-navy)]' : 'text-[var(--gs-steel)]'}`}
            aria-label="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-[var(--gs-cloud)]/50 text-[var(--gs-navy)]' : 'text-[var(--gs-steel)]'}`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="py-8 text-center text-sm text-[var(--gs-steel)]">Loading...</div>
      )}

      {!loading && results.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-[var(--gs-steel)]">
            You haven&apos;t uploaded any documents yet. When you&apos;re ready, this is where your records live.
          </p>
          <Link
            href="/dashboard/documents/upload"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2 text-sm font-semibold bg-[var(--gs-gold)] text-[var(--gs-navy)] rounded-lg hover:bg-[var(--gs-gold)]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Upload Your First Document
          </Link>
        </div>
      )}

      {!loading && results.length > 0 && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((doc) => <DocumentCard key={doc.id} doc={doc} />)}
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((doc) => <DocumentRow key={doc.id} doc={doc} />)}
          </div>
        )
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[var(--gs-cloud)]">
          <span className="text-xs text-[var(--gs-steel)]">{total} document{total !== 1 ? 's' : ''}</span>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 text-xs font-medium rounded border border-[var(--gs-cloud)] text-[var(--gs-navy)] hover:bg-[var(--gs-cloud)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-xs text-[var(--gs-steel)]">{page} / {totalPages}</span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-xs font-medium rounded border border-[var(--gs-cloud)] text-[var(--gs-navy)] hover:bg-[var(--gs-cloud)]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
