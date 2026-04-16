import { z } from 'zod';

export const ratingSchema = z.number().int().min(1, 'Rating must be 1-5').max(5, 'Rating must be 1-5');

export const requestEvaluationSchema = z.object({
  deploymentRecordId: z.string().uuid(),
  evaluatorEmail: z.string().email('Enter a valid email address').max(255),
  evaluatorName: z.string().min(1, 'Evaluator name is required').max(200).trim(),
  evaluatorRole: z.string().max(500).optional(),
});

export type RequestEvaluationInput = z.infer<typeof requestEvaluationSchema>;

export const completedEvaluationSchema = z.object({
  token: z.string().uuid('Invalid token'),
  status: z.literal('completed'),
  ratingLeadership: ratingSchema,
  ratingTactical: ratingSchema,
  ratingCommunication: ratingSchema,
  ratingPlanning: ratingSchema,
  ratingTechnical: ratingSchema,
  commentary: z.string().max(5000).optional(),
  attestationAccepted: z.literal(true, { message: 'You must accept the attestation to submit' }),
});

export const declinedEvaluationSchema = z.object({
  token: z.string().uuid('Invalid token'),
  status: z.literal('denied'),
  commentary: z.string().max(5000).optional(),
});

export const submitEvaluationSchema = z.discriminatedUnion('status', [
  completedEvaluationSchema,
  declinedEvaluationSchema,
]);

export type SubmitEvaluationInput = z.infer<typeof submitEvaluationSchema>;

export const RATING_LABELS = [
  { value: 5, label: 'Outstanding', description: 'Significantly exceeds expectations' },
  { value: 4, label: 'Superior', description: 'Exceeds expectations' },
  { value: 3, label: 'Satisfactory', description: 'Meets expectations' },
  { value: 2, label: 'Needs Improvement', description: 'Below expectations in some areas' },
  { value: 1, label: 'Unsatisfactory', description: 'Does not meet minimum expectations' },
] as const;

export const RATING_AREAS = [
  { key: 'ratingLeadership', label: 'Leadership', description: 'Ability to lead, motivate, and manage personnel' },
  { key: 'ratingTactical', label: 'Tactical', description: 'Technical proficiency in assigned role and ICS functions' },
  { key: 'ratingCommunication', label: 'Communication', description: 'Clear, timely, effective communication up/down/lateral' },
  { key: 'ratingPlanning', label: 'Planning', description: 'Ability to anticipate needs, plan operations, and adapt' },
  { key: 'ratingTechnical', label: 'Technical', description: 'Subject matter expertise and specialized skills' },
] as const;
