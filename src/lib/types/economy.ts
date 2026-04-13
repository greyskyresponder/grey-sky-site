// Group C: Economy — Sky Coins (GSR-DOC-205)

export type CoinTransactionType =
  | 'membership_grant'
  | 'purchase'
  | 'spend'
  | 'earn_validation'
  | 'earn_evaluation'
  | 'earn_qrb_review'
  | 'refund'
  | 'admin_adjustment'
  | 'pending_transfer'
  | 'freeze'
  | 'unfreeze';

export type ProductCategory =
  | 'record_building'
  | 'network'
  | 'certification'
  | 'credentialing'
  | 'product'
  | 'purchase';

export type CertificationTier = '3A' | '3B';
export type CredentialingTier = '4A' | '4B' | '4C';

/** coin_accounts — one row per user */
export interface CoinAccount {
  id: string;
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  frozen: boolean;
  createdAt: string;
  updatedAt: string;
}

/** coin_transactions — append-only ledger */
export interface CoinTransaction {
  id: string;
  accountId: string;
  type: CoinTransactionType;
  amount: number;
  balanceAfter: number;
  productCode: string | null;
  referenceId: string | null;
  referenceType: string | null;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  createdBy: string | null;
}

/** coin_products — admin-managed product catalog */
export interface CoinProduct {
  id: string;
  code: string;
  name: string;
  description: string | null;
  tier: number;
  costCoins: number;
  earnCoins: number;
  category: ProductCategory;
  isActive: boolean;
  requiresStaffAction: boolean;
  metadata: Record<string, unknown>;
}

/** Stripe purchase package definition */
export interface CoinPurchasePackage {
  code: string;
  coins: number;
  priceUsd: number;
  stripePriceId: string;
}

/** Subset of CoinAccount for balance display */
export interface CoinBalance {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  frozen: boolean;
}

/** Subset of CoinTransaction for ledger display */
export interface CoinLedgerEntry {
  id: string;
  type: CoinTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  productCode: string | null;
  createdAt: string;
}

/** Pricing tier resolution for an RTLT position */
export interface PositionPricing {
  rtltPositionId: string;
  positionName: string;
  certificationTier: CertificationTier;
  certificationCost: number;
  certificationRenewal: number;
  credentialingTier: CredentialingTier;
  credentialingCost: number;
  credentialingRenewal: number;
  qrbSize: number;
  hasOverride: boolean;
}
