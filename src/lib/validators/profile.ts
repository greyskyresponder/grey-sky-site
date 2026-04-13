// TODO: test — happy path: valid profile update with all fields
// TODO: test — error path: missing firstName, invalid phone format, bio > 500 chars
// TODO: test — edge case: empty phone/location strings coerce to null
// TODO: test — basicInfoSchema: validates required first/last name, optional fields
// TODO: test — serviceIdentitySchema: validates year range 1950-current, statement max 500
// TODO: test — communitySchema: validates relationship enum, year range logic
// TODO: test — qualificationSchema: validates category enum, verification_status default

import { z } from 'zod';

const currentYear = new Date().getFullYear();

// ── Legacy schema (still used by existing basic profile edit) ──

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100).trim(),
  lastName: z.string().min(1, 'Last name is required').max(100).trim(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g. +15551234567)')
    .nullable()
    .or(z.literal('')),
  locationCity: z.string().max(100).nullable().or(z.literal('')),
  locationState: z.string().max(50).nullable().or(z.literal('')),
  locationCountry: z.string().max(50).nullable().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be 500 characters or less').nullable().or(z.literal('')),
  affinityIds: z.array(z.string().uuid()),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ── DOC-202 Expansion schemas ──

export const basicInfoSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100).trim(),
  last_name: z.string().min(1, 'Last name is required').max(100).trim(),
  preferred_name: z.string().max(100).trim().optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g. +15551234567)')
    .optional()
    .or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  location_city: z.string().max(100).optional().or(z.literal('')),
  location_state: z.string().length(2, 'State must be a 2-letter code').optional().or(z.literal('')),
  location_country: z.string().max(3).default('USA'),
});

export const serviceIdentitySchema = z.object({
  primary_discipline: z.string().optional().or(z.literal('')),
  secondary_disciplines: z.array(z.string()).optional(),
  service_start_year: z
    .number()
    .int()
    .min(1950, 'Year must be 1950 or later')
    .max(currentYear, `Year cannot be after ${currentYear}`)
    .optional()
    .nullable(),
  service_statement: z.string().max(500, 'Service statement must be 500 characters or less').optional().or(z.literal('')),
});

export const communitySchema = z.object({
  community_name: z.string().min(1, 'Community name is required').max(200).trim(),
  state: z.string().length(2).optional().or(z.literal('')),
  country: z.string().max(3).default('USA'),
  relationship: z.enum(['home_base', 'deployed_to', 'assigned_to', 'mutual_aid'], {
    message: 'Relationship is required',
  }),
  start_year: z.number().int().min(1950).max(currentYear).optional().nullable(),
  end_year: z.number().int().min(1950).max(currentYear).optional().nullable(),
  is_current: z.boolean().default(false),
  notes: z.string().max(500).optional().or(z.literal('')),
}).refine(
  (data) => !data.end_year || !data.start_year || data.end_year >= data.start_year,
  { message: 'End year must be after start year', path: ['end_year'] }
);

export const serviceOrgSchema = z.object({
  organization_name: z.string().min(1, 'Organization name is required').max(300).trim(),
  organization_id: z.string().uuid().optional().nullable(),
  organization_type: z.string().optional().or(z.literal('')),
  role_title: z.string().max(200).optional().or(z.literal('')),
  start_year: z.number().int().min(1950).max(currentYear).optional().nullable(),
  end_year: z.number().int().min(1950).max(currentYear).optional().nullable(),
  is_current: z.boolean().default(false),
  is_primary: z.boolean().default(false),
}).refine(
  (data) => !data.end_year || !data.start_year || data.end_year >= data.start_year,
  { message: 'End year must be after start year', path: ['end_year'] }
);

export const teamSchema = z.object({
  team_name: z.string().min(1, 'Team name is required').max(300).trim(),
  team_type_id: z.string().uuid().optional().nullable(),
  organization_id: z.string().uuid().optional().nullable(),
  position_on_team: z.string().max(200).optional().or(z.literal('')),
  rtlt_position_slug: z.string().optional().or(z.literal('')),
  start_year: z.number().int().min(1950).max(currentYear).optional().nullable(),
  end_year: z.number().int().min(1950).max(currentYear).optional().nullable(),
  is_current: z.boolean().default(false),
}).refine(
  (data) => !data.end_year || !data.start_year || data.end_year >= data.start_year,
  { message: 'End year must be after start year', path: ['end_year'] }
);

export const qualificationSchema = z.object({
  qualification_name: z.string().min(1, 'Qualification name is required').max(300).trim(),
  issuing_authority: z.string().max(300).optional().or(z.literal('')),
  credential_number: z.string().max(100).optional().or(z.literal('')),
  issued_date: z.string().optional().or(z.literal('')),
  expiration_date: z.string().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  category: z.enum(['medical', 'technical', 'leadership', 'hazmat', 'communications', 'legal', 'fema_ics', 'state_cert', 'other']).optional().nullable(),
  verification_status: z.enum(['self_reported', 'document_linked', 'staff_verified']).default('self_reported'),
});

export const languageSchema = z.object({
  language: z.string().min(1, 'Language is required').max(100).trim(),
  proficiency: z.enum(['native', 'fluent', 'conversational', 'basic'], {
    message: 'Proficiency level is required',
  }),
});

export const affinitiesSchema = z.array(z.string().uuid());

export type BasicInfoInput = z.infer<typeof basicInfoSchema>;
export type ServiceIdentityInput = z.infer<typeof serviceIdentitySchema>;
export type CommunityInput = z.infer<typeof communitySchema>;
export type ServiceOrgInput = z.infer<typeof serviceOrgSchema>;
export type TeamInput = z.infer<typeof teamSchema>;
export type QualificationInput = z.infer<typeof qualificationSchema>;
export type LanguageInput = z.infer<typeof languageSchema>;
