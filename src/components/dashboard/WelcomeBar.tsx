import type { MembershipStatus } from '@/lib/types/enums';

type WelcomeBarProps = {
  displayName: string;
  membershipStatus: MembershipStatus;
};

function getStatusBadge(status: MembershipStatus): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'active':
      return { label: 'Active Member', className: 'bg-green-100 text-green-800' };
    case 'expired':
      return { label: 'Membership Expired', className: 'bg-red-100 text-red-800' };
    default:
      return { label: 'Pending', className: 'bg-gray-100 text-gray-600' };
  }
}

export default function WelcomeBar({
  displayName,
  membershipStatus,
}: WelcomeBarProps) {
  const badge = getStatusBadge(membershipStatus);

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-[#0A1628]">
          Welcome back, {displayName}
        </h1>
        <span
          className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Your service record and readiness status at a glance.
      </p>
    </div>
  );
}
