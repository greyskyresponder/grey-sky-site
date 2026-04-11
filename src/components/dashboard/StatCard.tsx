import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  href: string;
  icon: LucideIcon;
};

export default function StatCard({
  title,
  value,
  subtitle,
  href,
  icon: Icon,
}: StatCardProps) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded bg-[#C5933A]/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-[#C5933A]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-[#0A1628] mt-0.5">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
