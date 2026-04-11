import { FileText, ShieldCheck, Coins, Award } from 'lucide-react';
import StatCard from './StatCard';

type StatusGridProps = {
  recordsCount: number;
  verificationBreakdown: {
    self_certified: number;
    validated: number;
    evaluated: number;
  };
  skyPointsBalance: number;
  certsActive: number;
  certsInProgress: number;
};

export default function StatusGrid({
  recordsCount,
  verificationBreakdown,
  skyPointsBalance,
  certsActive,
  certsInProgress,
}: StatusGridProps) {
  const totalVerifiable = recordsCount;
  const verified =
    verificationBreakdown.validated + verificationBreakdown.evaluated;
  const verificationSubtitle =
    totalVerifiable > 0
      ? `${verified} of ${totalVerifiable} records verified`
      : 'No records to verify yet';

  const certSubtitle =
    certsInProgress > 0
      ? `${certsInProgress} in progress`
      : 'Start a pathway';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Response Reports"
        value={recordsCount}
        subtitle={recordsCount === 1 ? '1 record filed' : `${recordsCount} records filed`}
        href="/dashboard/records"
        icon={FileText}
      />
      <StatCard
        title="Verification Progress"
        value={verified}
        subtitle={verificationSubtitle}
        href="/dashboard/records"
        icon={ShieldCheck}
      />
      <StatCard
        title="Sky Points"
        value={skyPointsBalance}
        subtitle="Available balance"
        href="/dashboard/points"
        icon={Coins}
      />
      <StatCard
        title="Certifications"
        value={certsActive}
        subtitle={certSubtitle}
        href="/dashboard/certifications"
        icon={Award}
      />
    </div>
  );
}
