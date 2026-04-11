// TODO: Add tests — type-level checks: verify IncidentSummary is subset of Incident, IncidentCreateInput has all required fields, enum unions exhaustive
// GSR-DOC-204: Incident Registry Types
// Comprehensive incident model for ICS 209, FEMA enrichment, and editorial storytelling

export type IncidentType =
  | 'natural_disaster'
  | 'technological'
  | 'human_caused'
  | 'biological'
  | 'planned_event'
  | 'exercise'
  | 'training'
  | 'steady_state'
  | 'disaster'; // legacy value from DOC-002

export type IncidentScale =
  | 'local'
  | 'regional'
  | 'state'
  | 'multi_state'
  | 'national'
  | 'international';

export type IncidentSource =
  | 'member_submitted'
  | 'staff_created'
  | 'atlas_enriched'
  | 'fema_imported'
  | 'seed_data';

export type IncidentVerification =
  | 'unverified'
  | 'staff_verified'
  | 'fema_matched'
  | 'authoritative';

export type IncidentStatus =
  | 'active'
  | 'closed'
  | 'historical'
  | 'merged'
  | 'draft';

export interface AgencyInvolved {
  name: string;
  type: string;
  role: 'lead' | 'support' | 'mutual_aid' | 'federal_support';
}

export interface ExternalLink {
  title: string;
  url: string;
  source: string;
  type: 'fema' | 'state' | 'news' | 'aar' | 'report' | 'data' | 'other';
}

export interface AffectedCounty {
  state: string;
  county: string;
  fips_code?: string;
}

export interface Incident {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  incident_number: string | null;

  // Classification
  incident_type: IncidentType;
  incident_subtype: string | null;
  complexity_level: number | null;
  incident_scale: IncidentScale | null;

  // FEMA
  fema_disaster_number: string | null;
  fema_declaration_string: string | null;
  fema_declaration_type: string | null;
  fema_declaration_date: string | null;
  fema_fiscal_year: number | null;
  fema_incident_type: string | null;
  fema_declaration_title: string | null;
  fema_ih_program_declared: boolean | null;
  fema_ia_program_declared: boolean | null;
  fema_pa_program_declared: boolean | null;
  fema_hm_program_declared: boolean | null;
  fema_place_code: string | null;
  fema_designated_area: string | null;
  fema_enriched_at: string | null;

  // State/Local
  state_declaration_number: string | null;
  state_declaration_date: string | null;
  local_declaration_number: string | null;
  local_declaration_date: string | null;

  // Temporal
  incident_start_date: string;
  incident_start_time: string | null;
  incident_end_date: string | null;
  incident_end_time: string | null;
  duration_days: number | null;
  operational_periods: number | null;

  // Geospatial
  location_state: string;
  location_county: string | null;
  location_city: string | null;
  location_address: string | null;
  location_description: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  fips_state_code: string | null;
  fips_county_code: string | null;
  affected_states: string[] | null;
  affected_counties: AffectedCounty[] | null;

  // Impact
  area_size: string | null;
  population_affected: number | null;
  fatalities_civilian: number | null;
  fatalities_responder: number | null;
  injuries_civilian: number | null;
  injuries_responder: number | null;
  evacuations: number | null;
  sheltered: number | null;
  structures_damaged: number | null;
  structures_destroyed: number | null;
  estimated_cost: number | null;
  primary_hazards: string[] | null;
  damage_summary: string | null;
  peak_responders: number | null;
  peak_resources: number | null;

  // Industry & Sector
  disciplines_involved: string[] | null;
  resource_categories_involved: string[] | null;
  sectors_involved: string[] | null;
  agencies_involved: AgencyInvolved[] | null;
  mutual_aid_activated: boolean | null;
  emac_activated: boolean | null;
  mission_types: string[] | null;

  // Editorial
  narrative_summary: string | null;
  lessons_learned: string | null;
  significance: string | null;
  hero_image_url: string | null;
  gallery_urls: string[] | null;
  external_links: ExternalLink[] | null;
  tags: string[] | null;
  featured: boolean;
  public_visible: boolean;

  // Provenance
  source: IncidentSource;
  verification_status: IncidentVerification;
  verified_by: string | null;
  verified_at: string | null;
  merge_target_id: string | null;
  merged_at: string | null;
  status: IncidentStatus;

  // Aggregates
  deployment_count: number;
  responder_count: number;
  agency_count: number;
  validation_count: number;

  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentUpdate {
  id: string;
  incident_id: string;
  update_date: string;
  update_time: string | null;
  title: string;
  body: string | null;
  update_type: string;
  source: string | null;
  created_by: string | null;
  created_at: string;
}

export interface IncidentSummary {
  id: string;
  name: string;
  slug: string;
  incident_type: IncidentType;
  incident_subtype: string | null;
  incident_start_date: string;
  incident_end_date: string | null;
  location_state: string;
  location_county: string | null;
  fema_disaster_number: string | null;
  verification_status: IncidentVerification;
  status: IncidentStatus;
  deployment_count: number;
  responder_count: number;
}

export interface IncidentCreateInput {
  name: string;
  incident_type: IncidentType;
  incident_subtype?: string;
  incident_start_date: string;
  incident_end_date?: string;
  location_state: string;
  location_county?: string;
  location_city?: string;
  location_description?: string;
  location_latitude?: number;
  location_longitude?: number;
  fema_disaster_number?: string;
  description?: string;
}

export interface IncidentSearchFilters {
  query?: string;
  incident_type?: IncidentType;
  location_state?: string;
  date_from?: string;
  date_to?: string;
  status?: IncidentStatus;
  verification_status?: IncidentVerification;
  page?: number;
  per_page?: number;
}
