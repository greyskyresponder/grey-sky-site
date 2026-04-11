"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Position {
  slug: string;
  title: string;
  category: string;
  record_type: string;
  type_levels: string[];
}

const PAGE_SIZE = 50;

// TODO: test — pagination boundary conditions (first page, last page, single page)
// TODO: test — category filter resets to page 1 and shows correct count
// TODO: test — keyboard navigation through page controls

export default function PositionsGrid({
  positions,
  categories,
}: {
  positions: Position[];
  categories: string[];
}) {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");

  const filtered = useMemo(
    () =>
      category
        ? positions.filter((p) => p.category === category)
        : positions,
    [positions, category]
  );

  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const safePage = Math.min(page, totalPages || 1);
  const start = (safePage - 1) * PAGE_SIZE;
  const pagePositions = filtered.slice(start, start + PAGE_SIZE);

  function handleCategoryChange(value: string) {
    setCategory(value);
    setPage(1);
  }

  // Generate visible page numbers: show first, last, and nearby pages
  function getPageNumbers(): (number | "ellipsis")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [1];
    if (safePage > 3) pages.push("ellipsis");
    for (
      let i = Math.max(2, safePage - 1);
      i <= Math.min(totalPages - 1, safePage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) pages.push("ellipsis");
    pages.push(totalPages);
    return pages;
  }

  return (
    <>
      {/* Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <label htmlFor="category-filter" className="sr-only">
          Filter by category
        </label>
        <select
          id="category-filter"
          value={category}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="border border-[var(--gs-cloud)] rounded px-3 py-2 text-sm text-[var(--gs-navy)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--gs-gold)]"
          aria-label="Filter positions by resource category"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <p className="text-sm text-[var(--gs-steel)]">
          Showing {total > 0 ? start + 1 : 0}&ndash;{Math.min(start + PAGE_SIZE, total)} of{" "}
          {total} position{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {pagePositions.map((pos) => (
          <Link
            key={pos.slug}
            href={`/positions/${pos.slug}`}
            className="border border-[var(--gs-cloud)] rounded-lg p-4 bg-white hover:border-[var(--gs-gold)]/40 hover:shadow-lg transition-all"
          >
            <p className="font-semibold text-[var(--gs-navy)] mb-1">
              {pos.title}
            </p>
            {pos.category && (
              <p className="text-sm text-[var(--gs-steel)]">{pos.category}</p>
            )}
            {pos.record_type && (
              <span className="inline-block mt-2 text-xs bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)] px-2 py-0.5 rounded">
                {pos.record_type}
              </span>
            )}
            {pos.type_levels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {pos.type_levels.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-[var(--gs-gold)]/10 text-[var(--gs-gold-dark,#9a7430)] px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Positions pagination" className="flex items-center justify-between">
          <p className="text-sm text-[var(--gs-steel)]">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="px-3 py-2 border border-[var(--gs-cloud)] rounded text-sm hover:bg-[var(--gs-white)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              Previous
            </button>

            {getPageNumbers().map((n, i) =>
              n === "ellipsis" ? (
                <span key={`e${i}`} className="px-2 text-[var(--gs-steel)]">
                  &hellip;
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`px-3 py-2 rounded text-sm transition-colors ${
                    n === safePage
                      ? "bg-[var(--gs-navy)] text-white"
                      : "border border-[var(--gs-cloud)] hover:bg-[var(--gs-white)]"
                  }`}
                  aria-label={`Page ${n}`}
                  aria-current={n === safePage ? "page" : undefined}
                >
                  {n}
                </button>
              )
            )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="px-3 py-2 bg-[var(--gs-navy)] text-white rounded text-sm hover:bg-[var(--gs-gold)] hover:text-[var(--gs-navy)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </>
  );
}
