// TODO: Tests needed — validate schema edge cases (min/max length, email format, password mismatch)
import { z } from 'zod';

export const registrationSchema = z
  .object({
    email: z.string().email('Invalid email address').max(255),
    password: z.string().min(12, 'Password must be at least 12 characters').max(128),
    confirm_password: z.string(),
    first_name: z.string().min(1, 'First name is required').max(100).trim(),
    last_name: z.string().min(1, 'Last name is required').max(100).trim(),
    phone: z.string().max(30).optional(),
    location_state: z.string().length(2, 'State must be a 2-letter code').optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updatePasswordSchema = z
  .object({
    password: z.string().min(12, 'Password must be at least 12 characters').max(128),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
