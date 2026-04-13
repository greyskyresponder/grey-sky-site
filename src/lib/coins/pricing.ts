// GSR-DOC-205: RTLT position → certification/credentialing tier + cost resolution
'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  CertificationTier,
  CredentialingTier,
  PositionPricing,
} from '@/lib/types/economy';

/** Command-track resource categories that qualify for higher tiers */
const COMMAND_CATEGORIES = new Set([
  'Incident Management',
  'Command Staff',
  'Section Chief',
  'Branch Director',
  'Division/Group Supervisor',
  'Unit Leader',
]);

/** Positions that qualify for Tier 4C (3 QRB reviewers) */
const COMMAND_CREDENTIAL_POSITIONS = new Set([
  'Incident Commander',
  'Deputy Incident Commander',
  'Agency Representative',
]);

/** Certification tier pricing (coins) */
const CERT_PRICING: Record<CertificationTier, { initial: number; renewal: number }> = {
  '3A': { initial: 4000, renewal: 1600 },
  '3B': { initial: 5000, renewal: 2000 },
};

/** Credentialing tier pricing (coins) */
const CRED_PRICING: Record<CredentialingTier, { initial: number; renewal: number; qrbSize: number }> = {
  '4A': { initial: 10000, renewal: 4000, qrbSize: 2 },
  '4B': { initial: 20000, renewal: 8000, qrbSize: 2 },
  '4C': { initial: 30000, renewal: 12000, qrbSize: 3 },
};

/**
 * Resolve certification and credentialing tiers for an RTLT position.
 * Checks rtlt_position_overrides first, then derives from RTLT data.
 */
export async function getPositionPricing(rtltPositionId: string): Promise<PositionPricing | null> {
  const supabase = await createClient();

  // Check for admin override
  const { data: override } = await supabase
    .from('rtlt_position_overrides')
    .select('certification_tier, credentialing_tier')
    .eq('rtlt_position_id', rtltPositionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fetch position data
  const { data: position } = await supabase
    .from('rtlt_positions')
    .select('id, title, nqs_type_level, resource_category')
    .eq('id', rtltPositionId)
    .single();

  if (!position) return null;

  const typeLevel = position.nqs_type_level ?? 4;
  const category = position.resource_category ?? '';
  const title = position.title ?? '';
  const isCommandTrack = COMMAND_CATEGORIES.has(category);
  const isHighType = typeLevel <= 2;

  // Derive certification tier
  let certTier: CertificationTier;
  if (override?.certification_tier) {
    certTier = override.certification_tier as CertificationTier;
  } else {
    certTier = isHighType && isCommandTrack ? '3B' : '3A';
  }

  // Derive credentialing tier
  let credTier: CredentialingTier;
  if (override?.credentialing_tier) {
    credTier = override.credentialing_tier as CredentialingTier;
  } else if (COMMAND_CREDENTIAL_POSITIONS.has(title)) {
    credTier = '4C';
  } else if (isHighType && isCommandTrack) {
    credTier = '4B';
  } else {
    credTier = '4A';
  }

  const certPricing = CERT_PRICING[certTier];
  const credPricing = CRED_PRICING[credTier];

  return {
    rtltPositionId: position.id,
    positionName: title,
    certificationTier: certTier,
    certificationCost: certPricing.initial,
    certificationRenewal: certPricing.renewal,
    credentialingTier: credTier,
    credentialingCost: credPricing.initial,
    credentialingRenewal: credPricing.renewal,
    qrbSize: credPricing.qrbSize,
    hasOverride: !!(override?.certification_tier || override?.credentialing_tier),
  };
}
