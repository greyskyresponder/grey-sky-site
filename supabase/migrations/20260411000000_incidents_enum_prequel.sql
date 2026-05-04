-- DOC-204 prequel: enum value additions split out of 20260411000001_incidents_expansion.sql
--
-- WHY THIS EXISTS:
-- Postgres rejects use of newly-ALTERed enum values in the same transaction
-- as the ALTER TYPE statement (SQLSTATE 55P04 "unsafe use of new value").
-- The original DOC-204 migration adds 'historical', 'merged', 'draft' to
-- incident_status_enum and 'natural_disaster' / 'technological' / etc. to
-- incident_type_enum, then later in the same transaction creates RLS
-- policies referencing those values. That fails on a fresh `supabase db reset`.
--
-- This migration runs first (timestamp 20260411000000 sorts before
-- 20260411000001), commits the enum additions, and lets the subsequent
-- migration create policies that reference them.
--
-- Authored 2026-05-04 by ATLAS during DOC-208 build, after `db reset` failed
-- on this same enum-then-policy pattern. Out-of-scope-but-blocking fix per
-- CLAUDE-CODE-DISCIPLINE.md Section 6 ("note in completion report").

BEGIN;

-- incident_type_enum expansions (idempotent — IF NOT EXISTS on each)
ALTER TYPE incident_type_enum ADD VALUE IF NOT EXISTS 'natural_disaster';
ALTER TYPE incident_type_enum ADD VALUE IF NOT EXISTS 'technological';
ALTER TYPE incident_type_enum ADD VALUE IF NOT EXISTS 'human_caused';
ALTER TYPE incident_type_enum ADD VALUE IF NOT EXISTS 'biological';

-- incident_status_enum expansions
ALTER TYPE incident_status_enum ADD VALUE IF NOT EXISTS 'historical';
ALTER TYPE incident_status_enum ADD VALUE IF NOT EXISTS 'merged';
ALTER TYPE incident_status_enum ADD VALUE IF NOT EXISTS 'draft';

COMMIT;
