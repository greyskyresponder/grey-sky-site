// GSR-DOC-205: Sky Coins server actions
'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  CoinBalance,
  CoinLedgerEntry,
  CoinProduct,
  CoinTransactionType,
  ProductCategory,
} from '@/lib/types/economy';

/**
 * Get current coin balance for a user.
 */
export async function getBalance(userId: string): Promise<CoinBalance> {
  const fallback: CoinBalance = { balance: 0, lifetimeEarned: 0, lifetimeSpent: 0, frozen: false };

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('coin_accounts')
      .select('balance, lifetime_earned, lifetime_spent, frozen')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return fallback;
    }

    return {
      balance: data.balance,
      lifetimeEarned: data.lifetime_earned,
      lifetimeSpent: data.lifetime_spent,
      frozen: data.frozen,
    };
  } catch (err) {
    console.warn('[coins] getBalance failed, returning default balance:', err);
    return fallback;
  }
}

/**
 * Get paginated transaction history for a user.
 */
export async function getHistory(
  userId: string,
  page: number = 1,
  limit: number = 25,
  type?: CoinTransactionType,
): Promise<{ transactions: CoinLedgerEntry[]; total: number }> {
  const supabase = await createClient();

  // Get account ID
  const { data: account } = await supabase
    .from('coin_accounts')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!account) {
    return { transactions: [], total: 0 };
  }

  const offset = (page - 1) * limit;

  let query = supabase
    .from('coin_transactions')
    .select('id, type, amount, balance_after, description, product_code, created_at', { count: 'exact' })
    .eq('account_id', account.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq('type', type);
  }

  const { data, count, error } = await query;

  if (error || !data) {
    return { transactions: [], total: 0 };
  }

  const transactions: CoinLedgerEntry[] = data.map((row) => ({
    id: row.id,
    type: row.type as CoinTransactionType,
    amount: row.amount,
    balanceAfter: row.balance_after,
    description: row.description,
    productCode: row.product_code,
    createdAt: row.created_at,
  }));

  return { transactions, total: count ?? 0 };
}

/**
 * Spend coins on a product. Calls the database spend_coins() function.
 */
export async function spendCoins(
  userId: string,
  productCode: string,
  referenceId?: string,
  referenceType?: string,
  description?: string,
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  const supabase = await createClient();

  // Look up product price at transaction time
  const { data: product } = await supabase
    .from('coin_products')
    .select('cost_coins, name')
    .eq('code', productCode)
    .eq('is_active', true)
    .single();

  if (!product) {
    return { success: false, error: 'Product not found or inactive.' };
  }

  if (product.cost_coins === 0) {
    return { success: true, newBalance: undefined };
  }

  const desc = description || product.name;

  const { data, error } = await supabase.rpc('spend_coins', {
    p_user_id: userId,
    p_amount: product.cost_coins,
    p_product_code: productCode,
    p_reference_id: referenceId ?? null,
    p_reference_type: referenceType ?? null,
    p_description: desc,
  });

  if (error) {
    return { success: false, error: 'Transaction failed. Please try again.' };
  }

  if (!data) {
    // spend_coins returned false — insufficient balance or frozen
    const balance = await getBalance(userId);
    if (balance.frozen) {
      return {
        success: false,
        error: 'Your Sky Coins are on hold while your membership is inactive. Renew your membership to resume using your balance.',
      };
    }
    return {
      success: false,
      error: `You need ${(product.cost_coins - balance.balance).toLocaleString()} more Sky Coins to ${product.name.toLowerCase()}. Add coins to continue.`,
    };
  }

  const newBalance = await getBalance(userId);
  return { success: true, newBalance: newBalance.balance };
}

/**
 * Credit coins to a user. Calls the database credit_coins() function.
 */
export async function creditCoins(
  userId: string,
  amount: number,
  type: CoinTransactionType,
  productCode?: string,
  referenceId?: string,
  description?: string,
): Promise<{ success: boolean }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('credit_coins', {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_product_code: productCode ?? null,
    p_reference_id: referenceId ?? null,
    p_reference_type: null,
    p_description: description ?? '',
  });

  if (error || !data) {
    return { success: false };
  }

  return { success: true };
}

/**
 * Get active products from the catalog, optionally filtered by category.
 */
export async function getProducts(category?: ProductCategory): Promise<CoinProduct[]> {
  const supabase = await createClient();

  let query = supabase
    .from('coin_products')
    .select('*')
    .eq('is_active', true)
    .order('tier', { ascending: true })
    .order('cost_coins', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    tier: row.tier,
    costCoins: row.cost_coins,
    earnCoins: row.earn_coins,
    category: row.category as ProductCategory,
    isActive: row.is_active,
    requiresStaffAction: row.requires_staff_action,
    metadata: row.metadata ?? {},
  }));
}
