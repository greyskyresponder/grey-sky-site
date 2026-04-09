export type AffinityCategory =
  | 'hazard_type'
  | 'functional_specialty'
  | 'sector_experience'
  | 'srt_discipline';

export interface Affinity {
  id: string;
  category: AffinityCategory;
  value: string;
  description: string | null;
  sort_order: number | null;
}

export interface UserAffinity {
  user_id: string;
  affinity_id: string;
}
