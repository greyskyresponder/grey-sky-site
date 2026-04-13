// TODO: test — renders team cards with type and org
// TODO: test — empty state renders with correct copy
import type { UserTeam } from '@/lib/types/profile';

export default function TeamsSection({ teams }: { teams: UserTeam[] }) {
  if (teams.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
        <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-2">Your Teams</h3>
        <p className="text-sm text-[var(--gs-steel)]">
          Your crews, task forces, and units. The teams that had your back.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[var(--gs-cloud)] p-6">
      <h3 className="text-lg font-semibold text-[var(--gs-navy)] mb-4">Your Teams</h3>
      <div className="space-y-3">
        {teams.map((team) => (
          <div key={team.id} className="flex items-start justify-between border border-[var(--gs-cloud)] rounded-lg p-3">
            <div className="min-w-0">
              <p className="font-medium text-sm text-[var(--gs-navy)]">{team.team_name}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {team.team_type_name && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--gs-cloud)]/50 text-[var(--gs-steel)]">
                    {team.team_type_name}
                  </span>
                )}
                {team.organization_name && (
                  <span className="text-xs text-[var(--gs-steel)]">{team.organization_name}</span>
                )}
                {team.position_on_team && (
                  <span className="text-xs text-[var(--gs-steel)]">&middot; {team.position_on_team}</span>
                )}
                {team.is_current && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Current
                  </span>
                )}
              </div>
            </div>
            <div className="text-right text-xs text-[var(--gs-steel)] flex-shrink-0 ml-4">
              {team.start_year && (
                <p>{team.start_year}{team.end_year ? ` – ${team.end_year}` : ' – present'}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
