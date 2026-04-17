import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type AdminStatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
  icon: LucideIcon;
  tone?: 'default' | 'alert' | 'success';
};

const toneStyles: Record<'default' | 'alert' | 'success', string> = {
  default: 'bg-[#C5933A]/10 text-[#C5933A]',
  alert: 'bg-red-50 text-red-600',
  success: 'bg-green-50 text-green-600',
};

export default function AdminStatCard({
  title,
  value,
  subtitle,
  href,
  icon: Icon,
  tone = 'default',
}: AdminStatCardProps) {
  const content = (
    <div className="flex items-start gap-3">
      <div
        className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${toneStyles[tone]}`}
      >
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-[#0A1628] mt-0.5 tabular-nums">
          {value}
        </p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-[#C5933A]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
      {content}
    </div>
  );
}
