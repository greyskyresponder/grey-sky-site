// GSR-DOC-205: Sky Coins product constants and helpers

import type { CoinPurchasePackage } from '@/lib/types/economy';

/** $1 USD = 10 Sky Coins */
export const COIN_EXCHANGE_RATE = 10;

/** Annual membership grants 1,000 Sky Coins */
export const ANNUAL_MEMBERSHIP_COINS = 1000;

/** Smallest purchase package */
export const MIN_PURCHASE_COINS = 250;

/** Largest purchase package */
export const MAX_PURCHASE_COINS = 10000;

/** Purchase packages available to members */
export const PURCHASE_PACKAGES: CoinPurchasePackage[] = [
  { code: 'purchase_250', coins: 250, priceUsd: 25, label: '250 Sky Coins', stripePriceId: '' },
  { code: 'purchase_500', coins: 500, priceUsd: 50, label: '500 Sky Coins', stripePriceId: '' },
  { code: 'purchase_1000', coins: 1000, priceUsd: 100, label: '1,000 Sky Coins', stripePriceId: '' },
  { code: 'purchase_2500', coins: 2500, priceUsd: 250, label: '2,500 Sky Coins', stripePriceId: '' },
  { code: 'purchase_5000', coins: 5000, priceUsd: 500, label: '5,000 Sky Coins', stripePriceId: '' },
];

/** Format a coin amount for display: 1000 → "1,000 Sky Coins" */
export function formatCoinAmount(coins: number): string {
  return `${coins.toLocaleString('en-US')} Sky Coins`;
}

/** Convert coins to USD display string: 1000 → "$100.00" */
export function coinsToUsd(coins: number): string {
  const usd = coins / COIN_EXCHANGE_RATE;
  return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Convert USD to coins: 100 → 1000 */
export function usdToCoins(usd: number): number {
  return Math.round(usd * COIN_EXCHANGE_RATE);
}
