// TODO: test — documentUploadSchema: validates category enum, optional fields
// TODO: test — documentFilterSchema: pagination defaults, category filter
// TODO: test — documentUpdateSchema: partial validation

import { z } from 'zod';

const documentCategories = [
  'certification', 'training', 'deployment', 'identification',
  'medical', 'assessment', 'correspondence', 'membership', 'avatar', 'other',
] as const;

export const avatarUploadMimeTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const documentUploadSchema = z.object({
  title: z.string().max(300).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  category: z.enum(documentCategories, { message: 'Category is required' }),
  subcategory: z.string().max(100).optional().or(z.literal('')),
  issuing_authority: z.string().max(300).optional().or(z.literal('')),
  document_date: z.string().optional().or(z.literal('')),
  expiration_date: z.string().optional().or(z.literal('')),
  linked_qualification_id: z.string().uuid().optional().nullable(),
  linked_deployment_id: z.string().uuid().optional().nullable(),
  linked_incident_id: z.string().uuid().optional().nullable(),
});

export const documentUpdateSchema = z.object({
  title: z.string().max(300).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  category: z.enum(documentCategories).optional(),
  subcategory: z.string().max(100).optional().or(z.literal('')),
  issuing_authority: z.string().max(300).optional().or(z.literal('')),
  document_date: z.string().optional().or(z.literal('')),
  expiration_date: z.string().optional().or(z.literal('')),
  linked_qualification_id: z.string().uuid().optional().nullable(),
  linked_deployment_id: z.string().uuid().optional().nullable(),
  linked_incident_id: z.string().uuid().optional().nullable(),
});

export const documentFilterSchema = z.object({
  category: z.enum(documentCategories).optional(),
  status: z.enum(['active', 'archived']).optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().min(10).max(50).default(20),
});

export type DocumentUploadValidated = z.infer<typeof documentUploadSchema>;
export type DocumentUpdateValidated = z.infer<typeof documentUpdateSchema>;
export type DocumentFilterValidated = z.infer<typeof documentFilterSchema>;
