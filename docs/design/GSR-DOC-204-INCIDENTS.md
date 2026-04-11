# GSR-DOC-204: Incident Registry — Search + Create

| Field | Value |
|-------|-------|
| Phase | 2 |
| Status | draft |
| Blocks on | DOC-002 ✅ |
| Priority | critical |

---

## Purpose

The incident registry is the shared event backbone of the Grey Sky platform. Every deployment record (DOC-203) references an incident. Every validation, every evaluation, every credential ultimately traces back to "where did you serve, and what happened there."

But this is more than a lookup table. The incident registry is a **content engine** — rich enough to power public-facing storytelling, geospatial visualizations, community narratives, agency impact summaries, industry trend analysis, and affinity connections across the platform. When Grey Sky publishes "The Story of Hurricane Milton" or "Florida's Decade of Disaster Response," the incident registry is the data source.

The data model is informed by three authoritative sources:
1. **ICS 209 (Incident Status Summary)** — the NIMS standard for incident reporting, with location, hazard, impact, resource, and timeline fields
2. **OpenFEMA Disaster Declarations Summaries v2** — the federal dataset ATLAS will use for automated enrichment (DOC-302)
3. **Grey Sky platform needs** — affinity tagging, editorial narrative, geospatial storytelling, and cross-referencing with deployment records

Design principle: **Capture once, tell stories forever.** Every field exists because it enables a narrative, a visualization, or a connection that serves responders, agencies, communities, or the profession.

---

## Data Entities

### Primary Table: `incidents`

This replaces the minimal `incidents` definition in DOC-000. The expanded schema supports ICS 209-aligned incident data, FEMA declaration enrichment, geospatial storytelling, and editorial content generation.

#### Core Identity

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `name` | `varchar(255)` | NO | — | Incident name (e.g., "Hurricane Milton," "Surfside Building Collapse"). ICS 209 Block 1. |
| `slug` | `varchar(255)` | NO | — | URL-safe slug, auto-generated from name. Unique. Used for `/incidents/[slug]` routes. |
| `description` | `text` | YES | — | Brief factual summary of the incident. Not editorial — this is the "what happened" baseline. ICS 209 Block 9 (Incident Definition). |
| `incident_number` | `varchar(50)` | YES | — | Internal or jurisdictional incident number. ICS 209 Block 2. Not the FEMA disaster number. |
| `created_by` | `uuid` | YES | — | FK → `users.id`. The member who created this record. NULL if system/ATLAS-created. |
| `created_at` | `timestamptz` | NO | `now()` | Record creation timestamp. |
| `updated_at` | `timestamptz` | NO | `now()` | Last modification timestamp. Auto-updated by trigger. |

#### Classification & Typing

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `incident_type` | `incident_type_enum` | NO | — | Primary classification. Enum values: `natural_disaster`, `technological`, `human_caused`, `biological`, `planned_event`, `exercise`, `training`, `steady_state`. Aligned with FEMA incident types + Grey Sky additions. |
| `incident_subtype` | `varchar(100)` | YES | — | Specific incident kind within type. Examples: "Hurricane," "Tornado," "Wildfire," "HazMat Release," "Structural Collapse," "Mass Casualty," "Pandemic," "Civil Unrest," "Planned Security Event." Free text to allow emerging categories. ICS 209 Block 9. |
| `complexity_level` | `smallint` | YES | — | ICS incident complexity level (1–5). 1 = most complex (Type 1 IMT). ICS 209 Block 10. NULL if not assessed. |
| `incident_scale` | `incident_scale_enum` | YES | — | Operational magnitude. Enum: `local`, `regional`, `state`, `multi_state`, `national`, `international`. Drives storytelling scope and affinity tagging. |

#### FEMA Declaration Data (OpenFEMA Enrichment Target)

These fields are populated by ATLAS (DOC-302) via the OpenFEMA Disaster Declarations Summaries v2 API. They can also be manually entered by staff. When ATLAS enriches a record, it sets `fema_enriched_at`.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `fema_disaster_number` | `varchar(10)` | YES | — | FEMA disaster number (e.g., "4834"). Unique within FEMA system. Sequencing: 0001–1999 = Major Disaster, 2000–2999 = Fire Mgmt, 3000–3999 = Emergency, 4000+ = Major Disaster (current). |
| `fema_declaration_string` | `varchar(20)` | YES | — | FEMA's standard declaration identifier. Concatenation of declaration type + disaster number + state code (e.g., "DR-4834-FL"). |
| `fema_declaration_type` | `varchar(5)` | YES | — | FEMA declaration type code: `DR` (Major Disaster), `EM` (Emergency), `FM` (Fire Management). |
| `fema_declaration_date` | `date` | YES | — | Date the federal disaster was declared. |
| `fema_fiscal_year` | `smallint` | YES | — | Fiscal year of declaration. |
| `fema_incident_type` | `varchar(50)` | YES | — | FEMA's incident type string (e.g., "Hurricane," "Flood," "Fire," "Severe Storm(s)"). Stored as-is from OpenFEMA for cross-reference. |
| `fema_declaration_title` | `varchar(255)` | YES | — | Official FEMA title for the disaster (e.g., "HURRICANE MILTON"). |
| `fema_ih_program_declared` | `boolean` | YES | — | Whether Individual & Households assistance was declared. |
| `fema_ia_program_declared` | `boolean` | YES | — | Whether Individual Assistance was declared. |
| `fema_pa_program_declared` | `boolean` | YES | — | Whether Public Assistance was declared. |
| `fema_hm_program_declared` | `boolean` | YES | — | Whether Hazard Mitigation was declared. |
| `fema_place_code` | `varchar(10)` | YES | — | FEMA's place code (99 + 3-digit county FIPS). |
| `fema_designated_area` | `varchar(255)` | YES | — | FEMA designated area description (county name or "Statewide"). |
| `fema_enriched_at` | `timestamptz` | YES | — | Timestamp of last ATLAS enrichment from OpenFEMA API. NULL = not enriched. |

#### State & Local Declaration Data

Not all incidents have a federal declaration. State and local declarations are independently significant and often precede federal action.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `state_declaration_number` | `varchar(50)` | YES | — | State-level declaration or executive order number. |
| `state_declaration_date` | `date` | YES | — | Date the state declared emergency/disaster. |
| `local_declaration_number` | `varchar(50)` | YES | — | County/municipal declaration number. |
| `local_declaration_date` | `date` | YES | — | Date the local jurisdiction declared. |

#### Temporal Data

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `incident_start_date` | `date` | NO | — | When the incident began. ICS 209 Block 6. For hurricanes, this is typically landfall or first impact. |
| `incident_start_time` | `timetz` | YES | — | Start time if known. ICS 209 Block 6. |
| `incident_end_date` | `date` | YES | — | When the incident was operationally closed. NULL = ongoing. |
| `incident_end_time` | `timetz` | YES | — | End time if known. |
| `duration_days` | `integer` | YES | — | Computed or manually entered. ATLAS can calculate from start/end. Useful for storytelling ("a 14-day operation"). |
| `operational_periods` | `integer` | YES | — | Number of operational periods during the incident. Indicates operational tempo and complexity. |

#### Geospatial Data

PostGIS is already enabled in the Supabase stack (DOC-002). These fields power map visualizations, proximity queries, and geospatial storytelling.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `location_point` | `geography(POINT, 4326)` | YES | — | Primary incident point of origin. WGS84. Used for map pins, proximity searches, and clustering. |
| `location_polygon` | `geography(POLYGON, 4326)` | YES | — | Incident impact area boundary. Used for area-based visualizations (e.g., hurricane impact footprint, flood zone, wildfire perimeter). |
| `location_state` | `varchar(2)` | NO | — | Two-letter state code. Primary geographic filter. ICS 209 Block 16. |
| `location_county` | `varchar(100)` | YES | — | County, parish, or borough. ICS 209 Block 17. |
| `location_city` | `varchar(100)` | YES | — | City or municipality. ICS 209 Block 18. |
| `location_address` | `text` | YES | — | Street address or specific location description if applicable. |
| `location_description` | `text` | YES | — | Short narrative location description for context. ICS 209 Block 25. "The southern third of Florida" or "within a 5-mile radius of Walden, CO." |
| `location_latitude` | `decimal(10,7)` | YES | — | Latitude (redundant with `location_point` but useful for direct queries and export). |
| `location_longitude` | `decimal(10,7)` | YES | — | Longitude (redundant with `location_point`). |
| `fips_state_code` | `varchar(2)` | YES | — | FIPS state code for federal data cross-reference. |
| `fips_county_code` | `varchar(5)` | YES | — | Full FIPS county code (state + county). |
| `affected_states` | `text[]` | YES | — | Array of all state codes affected (for multi-state incidents like hurricanes). Drives multi-state storytelling. |
| `affected_counties` | `jsonb` | YES | — | Array of `{state, county, fips_code}` objects for all affected jurisdictions. Drives county-level impact maps. |

#### Impact & Scope Data (ICS 209-Aligned)

These fields capture the human and physical impact of the incident — essential for storytelling, infographics, and demonstrating responder value.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `area_size` | `varchar(50)` | YES | — | Incident size with unit label (e.g., "150 sq mi," "3 city blocks," "45,000 acres"). ICS 209 Block 7. Free text because units vary by incident type. |
| `population_affected` | `integer` | YES | — | Estimated number of civilians affected. For infographics and impact narrative. |
| `fatalities_civilian` | `integer` | YES | — | Civilian fatalities. ICS 209 Block 31D. |
| `fatalities_responder` | `integer` | YES | — | Responder fatalities. ICS 209 Block 32D. |
| `injuries_civilian` | `integer` | YES | — | Civilian injuries/illness. ICS 209 Block 31E. |
| `injuries_responder` | `integer` | YES | — | Responder injuries/illness. ICS 209 Block 32E. |
| `evacuations` | `integer` | YES | — | Number evacuated. ICS 209 Block 31H. |
| `sheltered` | `integer` | YES | — | Number in temporary shelters. ICS 209 Block 31J. |
| `structures_damaged` | `integer` | YES | — | Structures damaged. ICS 209 Block 30C. |
| `structures_destroyed` | `integer` | YES | — | Structures destroyed. ICS 209 Block 30D. |
| `estimated_cost` | `decimal(15,2)` | YES | — | Estimated total incident cost in USD. ICS 209 Block 45/46. |
| `primary_hazards` | `text[]` | YES | — | Array of primary materials or hazards involved (e.g., ["Category 4 Hurricane", "Storm Surge", "Inland Flooding"]). ICS 209 Block 29. |
| `damage_summary` | `text` | YES | — | Narrative damage assessment summary. ICS 209 Block 30 narrative. |
| `peak_responders` | `integer` | YES | — | Peak number of responders committed. Indicates scale of response. |
| `peak_resources` | `integer` | YES | — | Peak number of resources (vehicles, teams, aircraft, etc.) committed. |

#### Industry & Sector Data

These fields enable Grey Sky to tell stories by industry and professional community — "How HazMat teams responded to Hurricane Milton" or "IMT deployments across Florida's 2024 hurricane season."

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `disciplines_involved` | `text[]` | YES | — | Array of RTLT discipline slugs that were involved (e.g., ["usar", "swiftwater", "hazmat", "imt"]). Links to Grey Sky's team taxonomy. Drives discipline-specific storytelling. |
| `resource_categories_involved` | `text[]` | YES | — | Array of RTLT resource categories deployed. Broader than disciplines — includes overhead, logistics, etc. |
| `sectors_involved` | `text[]` | YES | — | Array of sector values from affinity vocabulary: ["federal", "state", "county", "municipal", "private_sector", "ngo", "military"]. Who showed up. |
| `agencies_involved` | `jsonb` | YES | — | Array of `{name, type, role}` objects for key responding agencies. Example: `[{"name": "FL SERT", "type": "state_agency", "role": "lead"}, {"name": "FEMA Region 4", "type": "federal", "role": "support"}]`. |
| `mutual_aid_activated` | `boolean` | YES | — | Whether mutual aid agreements were activated (EMAC, intrastate, etc.). |
| `emac_activated` | `boolean` | YES | — | Whether EMAC (Emergency Management Assistance Compact) was activated. National-level mutual aid. |
| `mission_types` | `text[]` | YES | — | Types of missions conducted (e.g., ["search_and_rescue", "debris_removal", "mass_care", "damage_assessment", "evacuation"]). |

#### Editorial & Storytelling Fields

These fields are what make Grey Sky's incident pages more than a data table. This is where the content engine lives.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `narrative_summary` | `text` | YES | — | Editorial narrative written by Grey Sky staff or AI-assisted. The "story" of this incident for public consumption. Rich, human, service-oriented. |
| `lessons_learned` | `text` | YES | — | Key lessons, improvements, or innovations from this incident. Sourced from AARs and public reports. |
| `significance` | `text` | YES | — | Why this incident matters to the profession. What it changed. What it proved. Grey Sky editorial voice. |
| `hero_image_url` | `varchar(500)` | YES | — | URL to primary hero image for incident page (Supabase Storage). |
| `gallery_urls` | `text[]` | YES | — | Array of image URLs for incident gallery. |
| `external_links` | `jsonb` | YES | — | Array of `{title, url, source, type}` for external references. Examples: FEMA disaster page, state EOC reports, news coverage, AAR documents. Type: "fema", "state", "news", "aar", "report". |
| `tags` | `text[]` | YES | — | Freeform tags for editorial categorization and search. Examples: ["historic", "first_response", "long_duration", "multi_agency", "emerging_threat"]. |
| `featured` | `boolean` | NO | `false` | Whether this incident is featured on public pages (homepage, stories, etc.). Staff-curated. |
| `public_visible` | `boolean` | NO | `true` | Whether the incident appears on public-facing pages. Some incidents may be draft or restricted. |

#### Data Provenance & Verification

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `source` | `incident_source_enum` | NO | `'member_submitted'` | Who created/populated this record. Enum: `member_submitted`, `staff_created`, `atlas_enriched`, `fema_imported`, `seed_data`. |
| `verification_status` | `incident_verification_enum` | NO | `'unverified'` | Data quality flag. Enum: `unverified` (member-submitted, not reviewed), `staff_verified` (staff confirmed accuracy), `fema_matched` (matched to OpenFEMA record), `authoritative` (official source, fully verified). |
| `verified_by` | `uuid` | YES | — | FK → `users.id`. Staff member who verified the record. |
| `verified_at` | `timestamptz` | YES | — | When verification occurred. |
| `merge_target_id` | `uuid` | YES | — | FK → `incidents.id`. If this record was merged into another (duplicate resolution), points to the surviving record. |
| `merged_at` | `timestamptz` | YES | — | When the merge occurred. |
| `status` | `incident_status_enum` | NO | `'active'` | Record lifecycle. Enum: `active`, `closed`, `historical`, `merged`, `draft`. |

#### Aggregate Counters (Denormalized for Performance)

These are updated by database triggers when deployment records, validations, or evaluations reference this incident. They power dashboard counts and public storytelling without expensive JOINs.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `deployment_count` | `integer` | NO | `0` | Number of deployment records referencing this incident. Updated by trigger. |
| `responder_count` | `integer` | NO | `0` | Number of unique responders (distinct `user_id` from deployment records). Updated by trigger. |
| `agency_count` | `integer` | NO | `0` | Number of unique agencies (distinct `org_id` from deployment records). Updated by trigger. |
| `validation_count` | `integer` | NO | `0` | Number of completed validations for deployments at this incident. |

---

### Supporting Table: `incident_affinities`

Links incidents to the controlled affinity vocabulary. Enables "show me all hurricanes" or "incidents involving HazMat" queries and affinity-based content connections.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `incident_id` | `uuid` | NO | — | FK → `incidents.id` |
| `affinity_id` | `uuid` | NO | — | FK → `affinities.id` |
| `created_at` | `timestamptz` | NO | `now()` | — |

Primary key: `(incident_id, affinity_id)`.

This table connects incidents to the three affinity categories already in the platform:
- **Hazard types**: Hurricane, Tornado, Flood, Earthquake, Wildfire, HazMat Release, etc.
- **Functional specialties**: Incident Command, Operations, Planning, Logistics, SAR, etc.
- **Sector experience**: Federal, State, County, Municipal, Tribal, Private, NGO, Military, International

---

### Supporting Table: `incident_updates`

Tracks significant status changes and editorial updates over time. Powers timeline storytelling ("Day 1: Landfall... Day 3: EMAC activated... Day 14: Demob begins").

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `incident_id` | `uuid` | NO | — | FK → `incidents.id` |
| `update_date` | `date` | NO | — | Date of the update/event |
| `update_time` | `timetz` | YES | — | Time if known |
| `title` | `varchar(255)` | NO | — | Short headline (e.g., "Federal Disaster Declaration Issued," "EMAC Activated," "Demobilization Begins") |
| `body` | `text` | YES | — | Detailed description of the update |
| `update_type` | `varchar(50)` | NO | — | Category: `declaration`, `escalation`, `milestone`, `operational`, `demobilization`, `editorial`, `correction` |
| `source` | `varchar(100)` | YES | — | Who reported this update (e.g., "FEMA," "FL SERT," "Grey Sky Staff") |
| `created_by` | `uuid` | YES | — | FK → `users.id` |
| `created_at` | `timestamptz` | NO | `now()` | — |

---

### New Enum Types

```sql
CREATE TYPE incident_type_enum AS ENUM (
  'natural_disaster',
  'technological',
  'human_caused',
  'biological',
  'planned_event',
  'exercise',
  'training',
  'steady_state'
);

CREATE TYPE incident_scale_enum AS ENUM (
  'local',
  'regional',
  'state',
  'multi_state',
  'national',
  'international'
);

CREATE TYPE incident_source_enum AS ENUM (
  'member_submitted',
  'staff_created',
  'atlas_enriched',
  'fema_imported',
  'seed_data'
);

CREATE TYPE incident_verification_enum AS ENUM (
  'unverified',
  'staff_verified',
  'fema_matched',
  'authoritative'
);

CREATE TYPE incident_status_enum AS ENUM (
  'active',
  'closed',
  'historical',
  'merged',
  'draft'
);
```

---

## TypeScript Types

```typescript
// src/lib/types/incidents.ts

export type IncidentType =
  | 'natural_disaster'
  | 'technological'
  | 'human_caused'
  | 'biological'
  | 'planned_event'
  | 'exercise'
  | 'training'
  | 'steady_state';

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

  // Geospatial (point and polygon are PostGIS — returned as GeoJSON or lat/lng)
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

// Minimal incident for search results and deployment record lookups
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

// Form input for member-submitted incidents (minimal required fields)
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
```

---

## Structure

### New Migration File

```
supabase/migrations/20260411000001_incidents_expansion.sql
```

This migration:
1. Adds new enum types
2. Adds new columns to existing `incidents` table (if it exists) or creates it fresh
3. Creates `incident_affinities` junction table
4. Creates `incident_updates` table
5. Creates indexes for search, geospatial, and filtering
6. Creates trigger for `updated_at`
7. Creates RLS policies

### Routes

```
src/app/(dashboard)/dashboard/incidents/page.tsx        — Incident search + list (member view)
src/app/(dashboard)/dashboard/incidents/new/page.tsx    — Create new incident
src/app/(dashboard)/dashboard/incidents/[slug]/page.tsx — Incident detail (member view)
src/app/(public)/incidents/page.tsx                     — Public incident index (featured + recent)
src/app/(public)/incidents/[slug]/page.tsx              — Public incident detail page (storytelling)
```

### Components

```
src/components/incidents/IncidentSearch.tsx          — Type-ahead search with filters
src/components/incidents/IncidentSearchResult.tsx    — Individual search result card
src/components/incidents/IncidentCreateForm.tsx      — Member-facing create form (minimal fields)
src/components/incidents/IncidentDetail.tsx          — Full incident detail display
src/components/incidents/IncidentTimeline.tsx        — Timeline from incident_updates
src/components/incidents/IncidentMap.tsx             — Map visualization (single incident)
src/components/incidents/IncidentImpactSummary.tsx   — Impact data visualization (infographic-ready)
src/components/incidents/IncidentSelector.tsx        — Inline selector used by DOC-203 (deployment record create form)
```

### Server Actions

```
src/lib/actions/incidents.ts
  - searchIncidents(query, filters)     — Full-text + filter search
  - getIncidentBySlug(slug)             — Full detail fetch
  - getIncidentById(id)                 — By ID (for deployment record linking)
  - createIncident(data)                — Member-submitted creation
  - updateIncident(id, data)            — Staff edit
  - verifyIncident(id)                  — Staff verification
  - mergeIncidents(sourceId, targetId)  — Duplicate resolution (staff)
  - getPublicIncidents(filters)         — Public-facing filtered list
  - getFeaturedIncidents()              — Homepage/stories featured incidents
```

### Types & Validators

```
src/lib/types/incidents.ts              — TypeScript interfaces (defined above)
src/lib/validators/incidents.ts         — Zod schemas for create/update/search
```

---

## Business Rules

1. **Any authenticated member can create an incident.** New incidents default to `source: 'member_submitted'` and `verification_status: 'unverified'`.

2. **Member-submitted incidents require minimal fields.** Name, type, start date, and state are required. Everything else is optional. Members should not be burdened with data entry — the goal is to get them to their deployment record fast.

3. **Staff can verify, enrich, and edit any incident.** Verification status progression: `unverified` → `staff_verified` → `fema_matched` → `authoritative`. Only platform_admin role can verify.

4. **ATLAS enrichment (DOC-302) matches by FEMA disaster number or name+date+state.** When a match is found, ATLAS populates all `fema_*` fields and sets `fema_enriched_at`. ATLAS does not overwrite staff-entered data.

5. **Duplicate resolution via merge.** When staff identifies duplicates, the source record's `merge_target_id` is set to the surviving record's ID, status is set to `merged`, and all deployment records referencing the source are re-pointed to the target. This is a staff-only operation.

6. **Slug generation.** Auto-generated from name using `slugify(name)`. Must be unique. On collision, append a numeric suffix (e.g., `hurricane-milton-2`).

7. **Aggregate counters updated by trigger.** When a deployment record is created, updated, or deleted, triggers update `deployment_count`, `responder_count`, `agency_count` on the referenced incident.

8. **Public visibility.** Only incidents with `public_visible = true` and `status != 'draft'` and `status != 'merged'` appear on public pages. All non-merged incidents are visible to authenticated members for deployment record linking.

9. **Geospatial point auto-population.** When `location_latitude` and `location_longitude` are provided, a trigger populates `location_point` as `ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography`.

10. **Search.** Full-text search on `name`, `description`, `incident_subtype`, `location_description`, `fema_declaration_title`. Filter by: `incident_type`, `location_state`, `status`, `verification_status`, date range. Sort by: `incident_start_date DESC` (default), `name`, `deployment_count`.

---

## Copy Direction

**Public incident pages** tell the story of what happened and who served. The tone is operational respect — these are real events where real people did real work. Never sensationalized, never minimized. Speak to the gravity of the work without drama.

**Member-facing search and create** is utilitarian. The member is here to find or log an incident so they can attach their deployment record. Get out of their way. The search should feel instant. The create form should be three fields and a submit button.

**Infographic and visualization copy** uses precise numbers and factual statements. "412 responders from 28 agencies served across 14 counties over 21 days." Let the data speak.

---

## Acceptance Criteria

1. Migration runs successfully, creating all tables, columns, enums, indexes, and RLS policies
2. TypeScript types compile with zero errors
3. Zod validators enforce required fields on create (name, incident_type, incident_start_date, location_state)
4. Incident search returns results with type-ahead on name within 200ms
5. Incident search supports filters: type, state, date range, verification status
6. Member can create a new incident with minimal fields (name, type, start date, state) and receive a success confirmation
7. Incident detail page renders all populated fields with appropriate formatting
8. Slug generation produces URL-safe unique slugs
9. Public incident index renders featured incidents and supports browsing
10. Public incident detail page renders narrative, impact data, and timeline (if updates exist)
11. `location_point` trigger populates geography from lat/lng
12. `updated_at` trigger fires on row modification
13. RLS policies enforce: any authenticated user can SELECT; only creator or platform_admin can UPDATE; only platform_admin can DELETE
14. All pages render correctly on mobile (bottom nav) and desktop (sidebar)
15. `npm run build` passes with zero errors

---

## Agent Lenses

### Baseplate (data/schema)
- ✅ 80+ fields across 3 tables — comprehensive but every field justifiable by storytelling, enrichment, or operational need
- ✅ PostGIS geography types for proper geospatial queries
- ✅ Denormalized aggregate counters with trigger-based updates — avoids expensive JOINs on hot queries
- ✅ FEMA fields exactly match OpenFEMA API field structure for clean enrichment mapping
- ✅ Junction table for affinities follows existing pattern from `user_affinities`
- ⚠️ `affected_counties` as JSONB rather than a separate junction table — acceptable because this data is write-once (ATLAS enrichment) and read-many (rendering), not queried by individual county FK
- ✅ Indexes on all FKs, text search fields, geospatial columns, and common filter combinations

### Meridian (doctrine)
- ✅ Field names and descriptions cite ICS 209 block numbers for traceability
- ✅ FEMA fields align exactly with OpenFEMA DisasterDeclarationsSummaries v2 dataset
- ✅ Complexity levels use ICS standard 1–5 scale
- ✅ Incident types include all FEMA categories plus Grey Sky additions (exercise, training, steady_state)
- ✅ Discipline references use RTLT taxonomy slugs, not custom values
- ✅ Temporal data supports ICS operational period concept

### Lookout (UX)
- ✅ Member create form requires only 4 fields — minimal friction to log and move to deployment record
- ✅ Search is type-ahead with filters — responder under stress can find "Milton" in seconds
- ✅ Public pages are storytelling-first — narrative, impact, timeline — not data tables
- ✅ IncidentSelector component designed for inline use in deployment record creation (DOC-203)

### Threshold (security)
- ✅ RLS policies: read = any auth user; write = creator or admin; delete = admin only
- ✅ Public pages only show `public_visible = true` records
- ✅ No PII in incident records (member data is in deployment records, not here)
- ✅ Verification status prevents unverified data from appearing authoritative
- ✅ Merge operations are admin-only with audit trail via `merged_at` timestamp

---

## Claude Code Prompt

### Context

You are adding the expanded incident registry to the Grey Sky Responder Society platform. The platform is a Next.js 16 app (App Router, React 19, TypeScript 5, Tailwind CSS 4) backed by Supabase (PostgreSQL 16 + PostGIS). Auth is Supabase Auth (GoTrue), NOT NextAuth.js. Hosting is Azure Static Web Apps.

The existing database has 8 migrations in `supabase/migrations/`. The existing `incidents` table from migration `20260409000003_core_tables.sql` has a minimal schema. This migration expands it significantly.

Brand tokens: Command Navy `#0A1628`, Signal Gold `#C5933A`, Ops White `#F5F5F5`. Font: Inter. Status badges: Green = verified, Gold = in progress, Red = expired/failed, Gray = not started.

### Step 1: Create Migration

Create `supabase/migrations/20260411000001_incidents_expansion.sql`:

```sql
-- GSR-DOC-204: Incident Registry Expansion
-- Expands the incidents table from DOC-002 minimal schema to comprehensive
-- content-engine schema with ICS 209 alignment, FEMA enrichment fields,
-- geospatial support, and editorial storytelling capabilities.

-- New enum types
DO $$ BEGIN
  CREATE TYPE incident_type_enum AS ENUM (
    'natural_disaster', 'technological', 'human_caused', 'biological',
    'planned_event', 'exercise', 'training', 'steady_state'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_scale_enum AS ENUM (
    'local', 'regional', 'state', 'multi_state', 'national', 'international'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_source_enum AS ENUM (
    'member_submitted', 'staff_created', 'atlas_enriched', 'fema_imported', 'seed_data'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_verification_enum AS ENUM (
    'unverified', 'staff_verified', 'fema_matched', 'authoritative'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_status_enum AS ENUM (
    'active', 'closed', 'historical', 'merged', 'draft'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Check if incidents table exists from DOC-002. If the original enum exists,
-- we need to migrate the type column. This handles both fresh installs and upgrades.

-- Add all new columns to incidents table
-- (Using ADD COLUMN IF NOT EXISTS for idempotency)

ALTER TABLE incidents ADD COLUMN IF NOT EXISTS slug varchar(255);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_number varchar(50);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES users(id) ON DELETE SET NULL;

-- Classification
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_subtype varchar(100);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS complexity_level smallint CHECK (complexity_level BETWEEN 1 AND 5);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_scale incident_scale_enum;

-- FEMA Declaration
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_disaster_number varchar(10);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_declaration_string varchar(20);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_declaration_type varchar(5);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_declaration_date date;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_fiscal_year smallint;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_incident_type varchar(50);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_declaration_title varchar(255);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_ih_program_declared boolean;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_ia_program_declared boolean;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_pa_program_declared boolean;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_hm_program_declared boolean;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_place_code varchar(10);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_designated_area varchar(255);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fema_enriched_at timestamptz;

-- State/Local Declaration
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS state_declaration_number varchar(50);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS state_declaration_date date;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS local_declaration_number varchar(50);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS local_declaration_date date;

-- Temporal
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_start_time timetz;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS incident_end_time timetz;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS duration_days integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS operational_periods integer;

-- Geospatial
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_point geography(POINT, 4326);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_polygon geography(POLYGON, 4326);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_city varchar(100);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_address text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_description text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_latitude decimal(10,7);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS location_longitude decimal(10,7);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fips_state_code varchar(2);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fips_county_code varchar(5);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS affected_states text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS affected_counties jsonb;

-- Impact
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS area_size varchar(50);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS population_affected integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fatalities_civilian integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS fatalities_responder integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS injuries_civilian integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS injuries_responder integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS evacuations integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS sheltered integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS structures_damaged integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS structures_destroyed integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS estimated_cost decimal(15,2);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS primary_hazards text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS damage_summary text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS peak_responders integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS peak_resources integer;

-- Industry & Sector
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS disciplines_involved text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS resource_categories_involved text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS sectors_involved text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS agencies_involved jsonb;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS mutual_aid_activated boolean;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS emac_activated boolean;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS mission_types text[];

-- Editorial
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS narrative_summary text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS lessons_learned text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS significance text;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS hero_image_url varchar(500);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS gallery_urls text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS external_links jsonb;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS public_visible boolean NOT NULL DEFAULT true;

-- Provenance
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS source incident_source_enum NOT NULL DEFAULT 'member_submitted';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS verification_status incident_verification_enum NOT NULL DEFAULT 'unverified';
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS verified_at timestamptz;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS merge_target_id uuid REFERENCES incidents(id) ON DELETE SET NULL;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS merged_at timestamptz;

-- Aggregates
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS deployment_count integer NOT NULL DEFAULT 0;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS responder_count integer NOT NULL DEFAULT 0;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS agency_count integer NOT NULL DEFAULT 0;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS validation_count integer NOT NULL DEFAULT 0;

-- Rename existing columns to match new schema if needed
-- (DOC-002 used 'state' and 'county'; we use 'location_state' and 'location_county')
-- Handle with DO block to check existing column names

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_incidents_slug ON incidents(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_incidents_fema_disaster_number 
  ON incidents(fema_disaster_number) WHERE fema_disaster_number IS NOT NULL;

-- Search indexes
CREATE INDEX IF NOT EXISTS idx_incidents_name_trgm ON incidents USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_incidents_location_state ON incidents(location_state);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_verification ON incidents(verification_status);
CREATE INDEX IF NOT EXISTS idx_incidents_start_date ON incidents(incident_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_featured ON incidents(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_incidents_public ON incidents(public_visible, status);

-- Geospatial index
CREATE INDEX IF NOT EXISTS idx_incidents_location_point ON incidents USING gist (location_point);
CREATE INDEX IF NOT EXISTS idx_incidents_location_polygon ON incidents USING gist (location_polygon);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_incidents_fts ON incidents USING gin (
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || 
  coalesce(incident_subtype, '') || ' ' || coalesce(location_description, '') || ' ' ||
  coalesce(fema_declaration_title, ''))
);

-- Enable trigram extension for fuzzy search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Junction table: incident_affinities
CREATE TABLE IF NOT EXISTS incident_affinities (
  incident_id uuid NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  affinity_id uuid NOT NULL REFERENCES affinities(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (incident_id, affinity_id)
);

-- Timeline table: incident_updates
CREATE TABLE IF NOT EXISTS incident_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  update_date date NOT NULL,
  update_time timetz,
  title varchar(255) NOT NULL,
  body text,
  update_type varchar(50) NOT NULL,
  source varchar(100),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incident_updates_incident ON incident_updates(incident_id, update_date);

-- Trigger: auto-populate location_point from lat/lng
CREATE OR REPLACE FUNCTION incidents_set_location_point()
RETURNS trigger AS $$
BEGIN
  IF NEW.location_latitude IS NOT NULL AND NEW.location_longitude IS NOT NULL THEN
    NEW.location_point := ST_SetSRID(ST_MakePoint(NEW.location_longitude, NEW.location_latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incidents_set_location_point ON incidents;
CREATE TRIGGER trg_incidents_set_location_point
  BEFORE INSERT OR UPDATE OF location_latitude, location_longitude ON incidents
  FOR EACH ROW EXECUTE FUNCTION incidents_set_location_point();

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION incidents_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incidents_updated_at ON incidents;
CREATE TRIGGER trg_incidents_updated_at
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION incidents_set_updated_at();

-- Trigger: auto-generate slug from name on insert
CREATE OR REPLACE FUNCTION incidents_generate_slug()
RETURNS trigger AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := lower(regexp_replace(regexp_replace(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM incidents WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_incidents_generate_slug ON incidents;
CREATE TRIGGER trg_incidents_generate_slug
  BEFORE INSERT OR UPDATE OF name ON incidents
  FOR EACH ROW EXECUTE FUNCTION incidents_generate_slug();

-- RLS Policies
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_affinities ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;

-- Incidents: any authenticated user can read non-merged incidents
CREATE POLICY incidents_select_authenticated ON incidents
  FOR SELECT TO authenticated
  USING (status != 'merged');

-- Incidents: public can read public_visible non-merged incidents
CREATE POLICY incidents_select_public ON incidents
  FOR SELECT TO anon
  USING (public_visible = true AND status NOT IN ('merged', 'draft'));

-- Incidents: any authenticated user can insert
CREATE POLICY incidents_insert_authenticated ON incidents
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Incidents: creator or platform_admin can update
CREATE POLICY incidents_update_owner_or_admin ON incidents
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid() OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- Incidents: only platform_admin can delete
CREATE POLICY incidents_delete_admin ON incidents
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin')
  );

-- incident_affinities: follow parent incident policies
CREATE POLICY incident_affinities_select ON incident_affinities
  FOR SELECT TO authenticated USING (true);

CREATE POLICY incident_affinities_insert ON incident_affinities
  FOR INSERT TO authenticated WITH CHECK (true);

-- incident_updates: follow parent incident policies
CREATE POLICY incident_updates_select ON incident_updates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY incident_updates_select_public ON incident_updates
  FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM incidents WHERE id = incident_id AND public_visible = true AND status NOT IN ('merged', 'draft'))
  );

CREATE POLICY incident_updates_insert ON incident_updates
  FOR INSERT TO authenticated WITH CHECK (true);
```

### Step 2: Create TypeScript Types

Create `src/lib/types/incidents.ts` with the full type definitions shown in the Data Entities section above. Export all types. Add to the barrel export in `src/lib/types/index.ts`.

### Step 3: Create Zod Validators

Create `src/lib/validators/incidents.ts`:

- `incidentCreateSchema`: validates `IncidentCreateInput` (name required min 3 chars, incident_type required as enum value, incident_start_date required as ISO date string, location_state required as 2-char uppercase)
- `incidentUpdateSchema`: partial of all incident fields, no required fields
- `incidentSearchSchema`: validates search params (query optional string, incident_type optional enum, location_state optional string, date_from optional date, date_to optional date, status optional enum, verification_status optional enum, page optional positive int, per_page optional 10-100)

### Step 4: Create Server Actions

Create `src/lib/actions/incidents.ts` with these server actions using Supabase client:

- `searchIncidents(params)`: Full-text search on name/description with trigram similarity for fuzzy matching. Supports all filter params from search schema. Returns paginated `IncidentSummary[]` with total count. Default sort: `incident_start_date DESC`.
- `getIncidentBySlug(slug)`: Returns full `Incident` or null. Includes related `incident_updates` ordered by `update_date ASC`.
- `getIncidentById(id)`: Returns `IncidentSummary` for deployment record linking. Lightweight query.
- `createIncident(data)`: Validates with `incidentCreateSchema`. Sets `created_by` to current user, `source` to `member_submitted`, `verification_status` to `unverified`. Returns created incident with slug.
- `getPublicIncidents(filters)`: Returns incidents where `public_visible = true` and `status NOT IN ('merged', 'draft')`. Paginated.
- `getFeaturedIncidents()`: Returns incidents where `featured = true` and `public_visible = true`. Limited to 6.

### Step 5: Create Dashboard Components

**`src/components/incidents/IncidentSearch.tsx`**
- Client component with debounced type-ahead input (300ms)
- Filter bar: incident type dropdown, state dropdown (all 50 + territories), date range picker, verification status
- Results list using `IncidentSearchResult` component
- Pagination controls
- "No results? Create a new incident" CTA at bottom

**`src/components/incidents/IncidentSearchResult.tsx`**
- Compact card: name (bold), type badge (color-coded by incident_type), dates, state/county, verification badge (color by status), deployment count
- Clickable → navigates to incident detail

**`src/components/incidents/IncidentCreateForm.tsx`**
- Minimal form: name (text), incident type (select), start date (date picker), state (select)
- Optional expandable section: end date, county, city, description, FEMA disaster number, lat/lng
- Submit calls `createIncident` server action
- On success: redirect to new incident detail page with toast "Incident created. You can now attach deployment records."

**`src/components/incidents/IncidentSelector.tsx`**
- Designed for inline use in deployment record creation (DOC-203)
- Combo box: type-ahead search → select from results OR "Create new" button
- Returns selected `incident_id` to parent form
- Shows: name, type, dates, state, verification badge

**`src/components/incidents/IncidentDetail.tsx`**
- Server component displaying full incident data
- Sections: Header (name, type, dates, status badges), Location (state/county/city with map if coords available), Impact Summary (key numbers in stat cards), Timeline (from incident_updates), FEMA Data (if enriched), Narrative (if editorial content exists)
- "Deployment count" badge showing how many Grey Sky members served here

**`src/components/incidents/IncidentTimeline.tsx`**
- Vertical timeline of `incident_updates` ordered by date
- Each entry: date, title, body (collapsed by default), source badge
- Used on both dashboard and public detail pages

**`src/components/incidents/IncidentMap.tsx`**
- Client component using Leaflet (or mapbox-gl if configured) showing incident point marker
- If polygon data exists, render the impact area boundary
- If neither exists, show state-centered marker as fallback
- Dependencies: `leaflet`, `react-leaflet` (add to package.json)

**`src/components/incidents/IncidentImpactSummary.tsx`**
- Stat card grid showing key impact numbers: population affected, fatalities, evacuations, structures damaged/destroyed, peak responders, estimated cost
- Only renders cards where data exists (no empty cards)
- Uses Command Navy background with Signal Gold accent numbers
- Infographic-ready styling

### Step 6: Create Dashboard Pages

**`src/app/(dashboard)/dashboard/incidents/page.tsx`**
- Server component that renders `IncidentSearch` with initial results
- Page title: "Incident Registry"
- Breadcrumb: Dashboard > Incidents

**`src/app/(dashboard)/dashboard/incidents/new/page.tsx`**
- Server component that renders `IncidentCreateForm`
- Page title: "Log New Incident"
- Breadcrumb: Dashboard > Incidents > New

**`src/app/(dashboard)/dashboard/incidents/[slug]/page.tsx`**
- Server component fetching incident by slug, rendering `IncidentDetail`
- 404 if not found
- Edit button visible only to creator or platform_admin

### Step 7: Create Public Pages

**`src/app/(public)/incidents/page.tsx`**
- Server component: featured incidents at top (hero cards), then browsable list with filters
- Page title: "Where We Serve" (not "Incidents" — that's internal language)
- Subtitle: "The events that define our service. The communities we stand with."
- Uses `getPublicIncidents` and `getFeaturedIncidents`

**`src/app/(public)/incidents/[slug]/page.tsx`**
- Server component: full storytelling page
- Hero image (if available), narrative summary, impact stats, timeline, disciplines involved, "X Grey Sky members served here"
- If no narrative/editorial content: shows factual summary with impact data
- CTA at bottom: "Were you there? Join Grey Sky and record your service."

### Step 8: Add Nav Links

Add "Incidents" to dashboard sidebar navigation in the existing `src/components/dashboard/` nav components. Icon: map-pin or alert-triangle from lucide-react.

Add "Where We Serve" to public site navigation (header) between existing nav items. Only show if there are public incidents (`getFeaturedIncidents().length > 0`).

### Step 9: Verify

- Run `npx supabase db reset` to apply all migrations including the new one
- Run `npm run build` — must pass with zero errors
- Verify incident search, create, and detail pages render correctly
- Verify public incident pages render with appropriate data

### Commit Message

```
feat: incident registry — comprehensive data model, search, create, detail, public storytelling (DOC-204)
```

---

*End of GSR-DOC-204*
