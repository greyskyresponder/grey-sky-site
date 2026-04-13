// TODO: test — renders language tags with proficiency badges
// TODO: test — empty state renders with correct copy
import type { UserLanguage } from '@/lib/types/profile';

const proficiencyColors: Record<string, string> = {
  native: 'bg-[var(--gs-navy)]/10 text-[var(--gs-navy)]',
  fluent: 'bg-[var(--gs-gold)]/10 text-[var(--gs-gold)]',
  conversational: 'bg-[var(--gs-cloud)] text-[var(--gs-steel)]',
  basic: 'bg-gray-100 text-gray-500',
};

export default function LanguagesSection({ languages }: { languages: UserLanguage[] }) {
  if (languages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-2">Languages</h3>
        <p className="text-sm text-[var(--gs-steel)]">
          Every language is a lifeline in a disaster.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
      <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">Languages</h3>
      <div className="flex flex-wrap gap-2">
        {languages.map((lang) => (
          <div key={lang.id} className="inline-flex items-center gap-1.5 border border-[var(--gs-cloud)] rounded-full px-3 py-1">
            <span className="text-sm text-[var(--gs-navy)]">{lang.language}</span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${proficiencyColors[lang.proficiency] ?? proficiencyColors.basic}`}>
              {lang.proficiency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
