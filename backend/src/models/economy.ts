export type SkyPointsTransactionType =
  | 'membership_credit'
  | 'purchase'
  | 'spend'
  | 'refund'
  | 'admin_adjustment'
  | 'sponsor_credit';

export interface SkyPointsLedgerEntry {
  id: string;
  user_id: string;
  transaction_type: SkyPointsTransactionType;
  amount: number;
  balance_after: number;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  created_at: Date;
}
