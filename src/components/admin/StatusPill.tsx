type StatusPillProps = {
  label: string;
  tone?: 'neutral' | 'success' | 'warn' | 'alert' | 'info';
};

const toneClass: Record<NonNullable<StatusPillProps['tone']>, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-800',
  warn: 'bg-amber-100 text-amber-800',
  alert: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
};

export default function StatusPill({ label, tone = 'neutral' }: StatusPillProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full uppercase tracking-wide ${toneClass[tone]}`}
    >
      {label}
    </span>
  );
}
