import type { ProfileStats as Stats } from '@/lib/types/profile';

export function ProfileStats({ stats }: { stats: Stats }) {
  const items = [
    { label: 'Total Deployments', value: stats.totalDeployments },
    { label: 'Verified', value: stats.verifiedDeployments },
    { label: 'Hours Served', value: stats.totalHours.toLocaleString() },
    { label: 'Certifications', value: stats.certificationsEarned },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
      <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">
        Service Record Summary
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-2xl font-bold text-[var(--gs-navy)]">{item.value}</p>
            <p className="text-xs text-[var(--gs-steel)] mt-1">{item.label}</p>
          </div>
        ))}
      </div>
      {stats.totalDeployments === 0 && (
        <p className="text-sm text-[var(--gs-steel)] text-center mt-4">
          No deployments recorded yet. Your service record starts with your first entry.
        </p>
      )}
    </div>
  );
}
