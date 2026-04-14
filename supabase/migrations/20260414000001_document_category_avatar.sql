-- GSR-DOC-206 v2 additions: add 'avatar' to document_category_enum.
-- Separate migration file because ALTER TYPE ... ADD VALUE cannot run in the
-- same transaction that uses the new value.

ALTER TYPE document_category_enum ADD VALUE IF NOT EXISTS 'avatar';
