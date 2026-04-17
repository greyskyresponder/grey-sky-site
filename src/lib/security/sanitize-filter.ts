// GSR-DOC-900: Defense-in-depth against PostgREST filter injection.
//
// Supabase's .or() / .and() / .filter() string arguments are parsed as a
// filter DSL — segments like `field.op.value` are separated by `.` and `,`,
// with `(` `)` grouping clauses. Interpolating user input directly lets an
// attacker inject extra clauses (e.g. `.eq.`, `.is.null`, `.not.`, `or(...)`)
// and exfiltrate rows that RLS+filters were meant to hide.
//
// Zod validators are the primary gate; these functions backstop by whitelisting
// only characters that cannot alter filter structure.

// Whitelist for ilike search terms: unicode letters/marks/numbers, plus a few
// punctuation marks humans actually type in names/emails/titles. Strips every
// PostgREST meta-character (. , ( ) % ! \ : * = < > etc.).
const ILIKE_DISALLOWED = /[^\p{L}\p{M}\p{N} \-'_@]/gu;

export function sanitizeIlikeTerm(input: string): string {
  return input.replace(ILIKE_DISALLOWED, '').trim();
}

// Whitelist for equality values known to be simple identifiers (UUIDs, slugs,
// numeric ids). Anything outside [A-Za-z0-9_-] is stripped.
const FILTER_VALUE_DISALLOWED = /[^A-Za-z0-9_-]/g;

export function sanitizeFilterValue(input: string): string {
  return input.replace(FILTER_VALUE_DISALLOWED, '');
}
