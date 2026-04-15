/**
 * Coin economy test fixtures.
 */

export const mockCoinAccountRow = {
  id: 'coin-account-uuid-1234',
  user_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  balance: 1000,
  lifetime_earned: 1000,
  lifetime_spent: 0,
  frozen: false,
};

export const mockFrozenAccountRow = {
  ...mockCoinAccountRow,
  balance: 500,
  frozen: true,
};

export const mockLowBalanceAccountRow = {
  ...mockCoinAccountRow,
  balance: 50,
};

export const mockProductRow = {
  id: 'product-uuid-validation-request',
  code: 'validation_request',
  name: 'Validation Request',
  description: 'Request a 360-degree validation',
  tier: 2,
  cost_coins: 100,
  earn_coins: 0,
  category: 'network',
  is_active: true,
  requires_staff_action: false,
  metadata: {},
};

export const mockExpensiveProductRow = {
  ...mockProductRow,
  id: 'product-uuid-cert-standard',
  code: 'certification_standard',
  name: 'Standard Certification',
  cost_coins: 5000,
  tier: 3,
  category: 'certification',
};
