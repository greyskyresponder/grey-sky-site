import type { VerificationTier } from '@/lib/types/enums';

const config: Record<VerificationTier, { label: string; description: string; className: string }> = {
  self_certified: {
    label: 'Self-Reported',
    description: 'You recorded this deployment.',
    className: 'bg-gray-100 text-gray-700',
  },
  validated_360: {
    label: 'Peer Verified',
    description: 'Confirmed by a colleague or supervisor.',
    className: 'bg-[var(--gs-gold)]/10 text-[var(--gs-gold-dark)]',
  },
  evaluated_ics225: {
    label: 'Formally Evaluated',
    description: 'Evaluated against ICS performance standards.',
    className: 'bg-green-100 text-green-700',
  },
};

export function RecordVerificationBadge({
  tier,
  showDescription = false,
}: {
  tier: VerificationTier;
  showDescription?: boolean;
}) {
  const { label, description, className } = config[tier];

  return (
    <div>
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      >
        {label}
      </span>
      {showDescription && (
        <p className="text-xs text-[var(--gs-steel)] mt-1">{description}</p>
      )}
    </div>
  );
}
