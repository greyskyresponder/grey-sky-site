import { z } from 'zod';

// TODO: test — happy path: valid profile update with all fields
// TODO: test — error path: missing firstName, invalid phone format, bio > 500 chars
// TODO: test — edge case: empty phone/location strings coerce to null

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
