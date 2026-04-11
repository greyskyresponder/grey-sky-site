import { z } from 'zod';

// TODO: test — happy path: valid deployment with RTLT position + incident
// TODO: test — happy path: valid deployment with free-text position, no incident
// TODO: test — error path: missing both positionId and positionFreeText
// TODO: test — error path: endDate before startDate, future startDate
// TODO: test — edge case: nullable fields (supervisor, orgId, hours)

const isoDateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be a valid date (YYYY-MM-DD)');

export const createDeploymentSchema = z
  .object({
    incidentId: z.string().uuid().nullable(),
    incidentName: z.string().max(200).nullable(),
    incidentType: z
      .enum(['disaster', 'exercise', 'planned_event', 'training', 'steady_state'])
      .nullable(),
    incidentState: z.string().max(50).nullable(),
    incidentStartDate: isoDateString.nullable(),
    positionId: z.string().uuid().nullable(),
    positionFreeText: z.string().max(200).nullable(),
    orgId: z.string().uuid().nullable(),
    startDate: isoDateString.refine(
      (d) => new Date(d) <= new Date(),
      'Start date cannot be in the future'
    ),
    endDate: isoDateString.nullable(),
    hours: z.number().int().min(1).max(8760).nullable(),
    supervisorName: z.string().max(200).nullable(),
    supervisorEmail: z.string().email('Invalid email').nullable().or(z.literal('')),
    notes: z.string().max(2000).nullable(),
  })
  .refine(
    (data) => !!data.positionId || !!data.positionFreeText,
    { message: 'Either an RTLT position or a free-text position is required', path: ['positionId'] }
  )
  .refine(
    (data) => {
      if (data.endDate && data.startDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    { message: 'End date must be on or after start date', path: ['endDate'] }
  )
  .refine(
    (data) => {
      if (data.endDate) return new Date(data.endDate) <= new Date();
      return true;
    },
    { message: 'End date cannot be in the future', path: ['endDate'] }
  );

export type CreateDeploymentInput = z.infer<typeof createDeploymentSchema>;
