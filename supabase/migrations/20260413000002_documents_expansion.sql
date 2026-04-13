-- GSR-DOC-206: Document Library Expansion
-- Expands documents table for full categorized upload + linking system

-- Create category enum if not exists
DO $$ BEGIN
  CREATE TYPE document_category_enum AS ENUM (
    'certification', 'training', 'deployment', 'identification',
    'medical', 'assessment', 'correspondence', 'membership', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Ensure documents table exists with full schema
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name varchar(500) NOT NULL,
  file_type varchar(100) NOT NULL,
  file_size integer NOT NULL,
  storage_path varchar(1000) NOT NULL,
  storage_bucket varchar(100) NOT NULL DEFAULT 'documents',
  title varchar(300),
  description text,
  category document_category_enum NOT NULL DEFAULT 'other',
  subcategory varchar(100),
  issuing_authority varchar(300),
  document_date date,
  expiration_date date,
  linked_qualification_id uuid REFERENCES user_qualifications(id) ON DELETE SET NULL,
  linked_deployment_id uuid REFERENCES deployment_records(id) ON DELETE SET NULL,
  linked_incident_id uuid REFERENCES incidents(id) ON DELETE SET NULL,
  ai_extracted_data jsonb,
  verification_status varchar(20) NOT NULL DEFAULT 'uploaded'
    CHECK (verification_status IN ('uploaded', 'reviewed', 'verified', 'rejected')),
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  status varchar(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- If table already existed with fewer columns, add missing ones
ALTER TABLE documents ADD COLUMN IF NOT EXISTS storage_bucket varchar(100) NOT NULL DEFAULT 'documents';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS title varchar(300);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS subcategory varchar(100);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS issuing_authority varchar(300);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_date date;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS expiration_date date;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS linked_qualification_id uuid REFERENCES user_qualifications(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS linked_deployment_id uuid REFERENCES deployment_records(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS linked_incident_id uuid REFERENCES incidents(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_extracted_data jsonb;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS verification_status varchar(20) NOT NULL DEFAULT 'uploaded';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'active';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_documents_qualification ON documents(linked_qualification_id) WHERE linked_qualification_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_deployment ON documents(linked_deployment_id) WHERE linked_deployment_id IS NOT NULL;

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_documents_updated_at') THEN
    CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'documents_select') THEN
    CREATE POLICY documents_select ON documents FOR SELECT
      USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'documents_insert') THEN
    CREATE POLICY documents_insert ON documents FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'documents_update') THEN
    CREATE POLICY documents_update ON documents FOR UPDATE
      USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'documents_delete') THEN
    CREATE POLICY documents_delete ON documents FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Storage bucket and policies (wrapped in exception handlers for idempotency)
DO $$ BEGIN
  INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
EXCEPTION WHEN unique_violation THEN NULL;
END $$;

-- Storage RLS: users can only access their own documents folder
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_documents_select') THEN
    CREATE POLICY storage_documents_select ON storage.objects FOR SELECT
      USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_documents_insert') THEN
    CREATE POLICY storage_documents_insert ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_documents_delete') THEN
    CREATE POLICY storage_documents_delete ON storage.objects FOR DELETE
      USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;
