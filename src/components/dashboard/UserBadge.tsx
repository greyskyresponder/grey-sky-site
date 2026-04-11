import type { MembershipStatus } from '@/lib/types/enums';

type UserBadgeProps = {
  displayName: string;
  avatarUrl: string | null;
  membershipStatus: MembershipStatus;
  membershipExpiresAt: string | null;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getMembershipBadge(
  status: MembershipStatus,
  expiresAt: string | null
): { label: string; className: string } {
  if (status === 'active' && expiresAt) {
    const daysUntilExpiry = Math.floor(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilExpiry <= 30) {
      return {
        label: 'Expiring',
        className: 'bg-amber-500/20 text-amber-400',
      };
    }
    return { label: 'Active', className: 'bg-green-500/20 text-green-400' };
  }
  if (status === 'expired') {
    return { label: 'Expired', className: 'bg-red-500/20 text-red-400' };
  }
  // 'none' = pending/not yet paid
  return { label: 'Pending', className: 'bg-gray-500/20 text-gray-400' };
}

export default function UserBadge({
  displayName,
  avatarUrl,
  membershipStatus,
  membershipExpiresAt,
}: UserBadgeProps) {
  const badge = getMembershipBadge(membershipStatus, membershipExpiresAt);

  return (
    <div className="flex items-center gap-3 px-4 py-4">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#C5933A]/20 flex items-center justify-center text-[#C5933A] text-sm font-semibold flex-shrink-0">
          {getInitials(displayName)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white truncate">{displayName}</p>
        <span
          className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded-full ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
    </div>
  );
}
