-- GSR-DOC-206 v2 additions: thumbnail_path, tags, avatars storage bucket.

ALTER TABLE documents ADD COLUMN IF NOT EXISTS thumbnail_path varchar(1000);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING gin(tags);

-- Avatars bucket: public read, owner write/update/delete.
DO $$ BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'avatars',
    'avatars',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  );
EXCEPTION WHEN unique_violation THEN NULL;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_avatars_select') THEN
    CREATE POLICY storage_avatars_select ON storage.objects FOR SELECT
      USING (bucket_id = 'avatars');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_avatars_insert') THEN
    CREATE POLICY storage_avatars_insert ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_avatars_update') THEN
    CREATE POLICY storage_avatars_update ON storage.objects FOR UPDATE
      USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_avatars_delete') THEN
    CREATE POLICY storage_avatars_delete ON storage.objects FOR DELETE
      USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;
