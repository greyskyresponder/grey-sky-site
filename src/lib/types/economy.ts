// Group C: Economy

import type { SkyPointsTransactionType } from './enums';

/** sky_points_ledger — 8 columns */
export interface SkyPointsLedgerEntry {
  id: string;
  user_id: string;
  transaction_type: SkyPointsTransactionType;
  amount: number;
  balance_after: number;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}
