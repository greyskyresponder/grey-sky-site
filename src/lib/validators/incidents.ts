// TODO: Add tests — validate all enum values, date format enforcement, lat/lng bounds, max lengths, optional field omission
import { z } from 'zod';

const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date (YYYY-MM-DD)');

const incidentTypeEnum = z.enum([
  'natural_disaster',
  'technological',
  'human_caused',
  'biological',
  'planned_event',
  'exercise',
  'training',
  'steady_state',
  'disaster',
]);

const incidentStatusEnum = z.enum(['active', 'closed', 'historical', 'merged', 'draft']);

const incidentVerificationEnum = z.enum(['unverified', 'staff_verified', 'fema_matched', 'authoritative']);

const stateCode = z.string().length(2, 'State must be a 2-letter code').toUpperCase();

export const incidentCreateSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(255),
  incident_type: incidentTypeEnum,
  incident_subtype: z.string().max(100).optional(),
  incident_start_date: isoDateString,
  incident_end_date: isoDateString.optional().or(z.literal('')),
  location_state: stateCode,
  location_county: z.string().max(100).optional().or(z.literal('')),
  location_city: z.string().max(100).optional().or(z.literal('')),
  location_description: z.string().max(500).optional().or(z.literal('')),
  location_latitude: z.coerce.number().min(-90).max(90).optional(),
  location_longitude: z.coerce.number().min(-180).max(180).optional(),
  fema_disaster_number: z.string().max(10).optional().or(z.literal('')),
  description: z.string().max(2000).optional().or(z.literal('')),
});

export type IncidentCreateFormData = z.infer<typeof incidentCreateSchema>;

export const incidentSearchSchema = z.object({
  query: z.string().max(200).optional(),
  incident_type: incidentTypeEnum.optional(),
  location_state: z.string().max(2).optional(),
  date_from: isoDateString.optional(),
  date_to: isoDateString.optional(),
  status: incidentStatusEnum.optional(),
  verification_status: incidentVerificationEnum.optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  per_page: z.coerce.number().int().min(10).max(100).optional().default(20),
});

export type IncidentSearchParams = z.infer<typeof incidentSearchSchema>;
