import type { SupabaseClient } from '@supabase/supabase-js';
import type { Position } from '@/lib/types/deployments';

export async function searchPositions(
  supabase: SupabaseClient,
  query: string,
  category?: string
): Promise<Position[]> {
  if (!query.trim()) return [];

  let q = supabase
    .from('positions')
    .select('*')
    .ilike('title', `%${query}%`)
    .order('resource_category')
    .order('title')
    .limit(20);

  if (category) {
    q = q.eq('resource_category', category);
  }

  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as Position[];
}

export async function getPositionCategories(
  supabase: SupabaseClient
): Promise<string[]> {
  const { data, error } = await supabase
    .from('positions')
    .select('resource_category')
    .not('resource_category', 'is', null)
    .order('resource_category');

  if (error || !data) return [];

  const unique = [...new Set(data.map((r) => r.resource_category as string).filter(Boolean))];
  return unique;
}
