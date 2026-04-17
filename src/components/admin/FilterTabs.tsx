import Link from 'next/link';

type Tab = {
  label: string;
  value: string;
  count?: number;
};

type FilterTabsProps = {
  basePath: string;
  paramName: string;
  tabs: Tab[];
  active: string;
  extraParams?: Record<string, string | undefined>;
};

function buildHref(
  basePath: string,
  paramName: string,
  value: string,
  extraParams?: Record<string, string | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(extraParams ?? {})) {
    if (v) search.set(k, v);
  }
  if (value !== 'all') search.set(paramName, value);
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function FilterTabs({
  basePath,
  paramName,
  tabs,
  active,
  extraParams,
}: FilterTabsProps) {
  return (
    <div
      role="tablist"
      className="inline-flex rounded-lg border border-gray-200 bg-white overflow-hidden"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <Link
            key={tab.value}
            href={buildHref(basePath, paramName, tab.value, extraParams)}
            role="tab"
            aria-selected={isActive}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-[#0A1628] text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1.5 inline-block text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
