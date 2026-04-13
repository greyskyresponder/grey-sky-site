// GSR-DOC-205: Sky Coins Zod validators
import { z } from 'zod';

const coinTransactionTypeEnum = z.enum([
  'membership_grant',
  'purchase',
  'spend',
  'earn_validation',
  'earn_evaluation',
  'earn_qrb_review',
  'refund',
  'admin_adjustment',
  'pending_transfer',
  'freeze',
  'unfreeze',
]);

const purchaseCodeEnum = z.enum([
  'purchase_250',
  'purchase_500',
  'purchase_1000',
  'purchase_2500',
  'purchase_5000',
]);

export const spendCoinsSchema = z.object({
  productCode: z.string().min(1, 'Product code is required'),
  referenceId: z.string().uuid().optional(),
  referenceType: z.string().optional(),
});

export const purchaseCoinsSchema = z.object({
  packageCode: purchaseCodeEnum,
});

export const adminAdjustmentSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  amount: z.number().int('Amount must be a whole number').refine((n) => n !== 0, 'Amount cannot be zero'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
});

export const coinHistoryQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(25),
  type: coinTransactionTypeEnum.optional(),
});

export type SpendCoinsInput = z.infer<typeof spendCoinsSchema>;
export type PurchaseCoinsInput = z.infer<typeof purchaseCoinsSchema>;
export type AdminAdjustmentInput = z.infer<typeof adminAdjustmentSchema>;
export type CoinHistoryQuery = z.infer<typeof coinHistoryQuerySchema>;
