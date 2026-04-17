import { env } from '@/lib/env';
import { createClient } from '@supabase/supabase-js';

export interface StorageAdapter {
  upload(bucket: string, path: string, file: Buffer, contentType: string): Promise<{ url: string }>;
  getSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<string>;
  remove(bucket: string, path: string): Promise<void>;
}

function createSupabaseStorage(): StorageAdapter {
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY
  );

  return {
    async upload(bucket, path, file, contentType) {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType, upsert: true });
      if (error) throw new Error(`Storage upload failed: ${error.message}`);
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return { url: data.publicUrl };
    },
    async getSignedUrl(bucket, path, expiresIn = 3600) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);
      if (error) throw new Error(`Signed URL failed: ${error.message}`);
      return data.signedUrl;
    },
    async remove(bucket, path) {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw new Error(`Storage delete failed: ${error.message}`);
    },
  };
}

function createAzureStorage(): StorageAdapter {
  // Azure Blob Storage implementation — production overflow only
  // Requires @azure/storage-blob package
  throw new Error('Azure storage not yet implemented. Use STORAGE_MODE=supabase.');
}

export function getStorage(): StorageAdapter {
  switch (env.STORAGE_MODE) {
    case 'supabase':
      return createSupabaseStorage();
    case 'azure':
      return createAzureStorage();
    default:
      return createSupabaseStorage();
  }
}
