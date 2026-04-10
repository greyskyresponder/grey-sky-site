// Group F: Community & Taxonomy

import type { AffinityCategory } from './enums';

/** affinities — 5 columns */
export interface Affinity {
  id: string;
  category: AffinityCategory;
  value: string;
  description: string | null;
  sort_order: number | null;
}

/** user_affinities — 2 columns (composite PK) */
export interface UserAffinity {
  user_id: string;
  affinity_id: string;
}

/** rtlt_team_types — 7 columns */
export interface RtltTeamType {
  id: string;
  code: string;
  name: string;
  discipline: string | null;
  nims_category: string | null;
  description: string | null;
  sort_order: number | null;
  created_at: string;
}
