import { z } from 'zod';

export const requestValidationSchema = z.object({
  deploymentRecordId: z.string().uuid(),
  validatorEmail: z.string().email('Enter a valid email address').max(255),
  validatorName: z.string().min(1, 'Validator name is required').max(200).trim(),
  relationshipContext: z.string().max(1000).optional(),
});

export type RequestValidationInput = z.infer<typeof requestValidationSchema>;

export const submitValidationSchema = z.object({
  token: z.string().uuid('Invalid token'),
  status: z.enum(['confirmed', 'denied']),
  responseText: z.string().max(2000).optional(),
  attestationAccepted: z.boolean(),
}).refine(
  (data) => data.status === 'denied' || data.attestationAccepted === true,
  { message: 'You must accept the attestation to confirm', path: ['attestationAccepted'] },
);

export type SubmitValidationInput = z.infer<typeof submitValidationSchema>;
