'use server';

// TODO: test — getMyDocuments: returns paginated list with category filter
// TODO: test — uploadDocument: validates file type/size, stores to Supabase, creates DB record
// TODO: test — linkDocumentToQualification: updates qualification verification_status to document_linked
// TODO: test — unlinkDocument: reverts qualification verification_status to self_reported
// TODO: test — archiveDocument: soft deletes (status → archived)
// TODO: test — getDocumentUrl: generates 5-minute signed URL

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  documentUploadSchema,
  documentUpdateSchema,
  documentFilterSchema,
  avatarUploadMimeTypes,
  AVATAR_MAX_BYTES,
} from '@/lib/validators/documents';
import type { Document, DocumentSummary } from '@/lib/types/documents';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENTS = 200;

async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ── List documents ──

export async function getMyDocuments(filters?: Record<string, unknown>): Promise<{
  data: DocumentSummary[];
  total: number;
  error: string | null;
}> {
  const userId = await getAuthUserId();
  if (!userId) return { data: [], total: 0, error: 'Not authenticated' };

  const parsed = documentFilterSchema.safeParse(filters ?? {});
  const f = parsed.success ? parsed.data : { page: 1, per_page: 20 };

  const supabase = await createClient();
  let query = supabase
    .from('documents')
    .select('id, file_name, file_type, file_size, title, category, document_date, expiration_date, verification_status, status, created_at, linked_qualification_id, linked_deployment_id, user_qualifications(qualification_name)', { count: 'exact' })
    .eq('user_id', userId)
    .eq('status', f.status ?? 'active')
    .order('created_at', { ascending: false });

  if (f.category) {
    query = query.eq('category', f.category);
  }

  if (f.search) {
    query = query.or(`title.ilike.%${f.search}%,file_name.ilike.%${f.search}%`);
  }

  const from = ((f.page ?? 1) - 1) * (f.per_page ?? 20);
  const to = from + (f.per_page ?? 20) - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;
  if (error) return { data: [], total: 0, error: error.message };

  const mapped: DocumentSummary[] = (data ?? []).map((row: Record<string, unknown>) => {
    const qual = row.user_qualifications as Record<string, unknown> | null;
    return {
      id: row.id as string,
      file_name: row.file_name as string,
      file_type: row.file_type as string,
      file_size: row.file_size as number,
      title: row.title as string | null,
      category: row.category as DocumentSummary['category'],
      document_date: row.document_date as string | null,
      expiration_date: row.expiration_date as string | null,
      verification_status: row.verification_status as DocumentSummary['verification_status'],
      status: row.status as DocumentSummary['status'],
      created_at: row.created_at as string,
      linked_qualification_name: (qual?.qualification_name as string | null) ?? null,
      linked_deployment_position: null,
    };
  });

  return { data: mapped, total: count ?? 0, error: null };
}

// ── Get single document ──

export async function getDocumentById(id: string): Promise<{ document: Document | null; error: string | null }> {
  const userId = await getAuthUserId();
  if (!userId) return { document: null, error: 'Not authenticated' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return { document: null, error: error?.message ?? 'Document not found' };
  return { document: data as Document, error: null };
}

// ── Upload document ──

export async function uploadDocument(formData: FormData): Promise<{ id: string | null; error: string | null }> {
  const userId = await getAuthUserId();
  if (!userId) return { id: null, error: 'Not authenticated' };

  const supabase = await createClient();

  // Check document count limit
  const { count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active');

  if ((count ?? 0) >= MAX_DOCUMENTS) {
    return { id: null, error: `Maximum ${MAX_DOCUMENTS} documents allowed` };
  }

  const file = formData.get('file') as File;
  if (!file || file.size === 0) return { id: null, error: 'No file provided' };
  if (file.size > MAX_FILE_SIZE) return { id: null, error: 'File must be under 10 MB' };
  if (!ALLOWED_TYPES.includes(file.type)) return { id: null, error: 'File must be PDF, JPEG, PNG, WebP, or HEIC' };

  // Validate metadata
  const metaRaw = {
    title: (formData.get('title') as string) || '',
    description: (formData.get('description') as string) || '',
    category: (formData.get('category') as string) || 'other',
    subcategory: (formData.get('subcategory') as string) || '',
    issuing_authority: (formData.get('issuing_authority') as string) || '',
    document_date: (formData.get('document_date') as string) || '',
    expiration_date: (formData.get('expiration_date') as string) || '',
    linked_qualification_id: (formData.get('linked_qualification_id') as string) || null,
    linked_deployment_id: (formData.get('linked_deployment_id') as string) || null,
    linked_incident_id: (formData.get('linked_incident_id') as string) || null,
  };

  const parsed = documentUploadSchema.safeParse(metaRaw);
  if (!parsed.success) return { id: null, error: parsed.error.issues[0].message };

  // Generate storage path
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const docUuid = crypto.randomUUID();
  const storagePath = `${userId}/${docUuid}.${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) return { id: null, error: uploadError.message };

  // Create DB record
  const { data: doc, error: dbError } = await supabase
    .from('documents')
    .insert({
      user_id: userId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
      storage_bucket: 'documents',
      title: parsed.data.title || null,
      description: parsed.data.description || null,
      category: parsed.data.category,
      subcategory: parsed.data.subcategory || null,
      issuing_authority: parsed.data.issuing_authority || null,
      document_date: parsed.data.document_date || null,
      expiration_date: parsed.data.expiration_date || null,
      linked_qualification_id: parsed.data.linked_qualification_id ?? null,
      linked_deployment_id: parsed.data.linked_deployment_id ?? null,
      linked_incident_id: parsed.data.linked_incident_id ?? null,
    })
    .select('id')
    .single();

  if (dbError) return { id: null, error: dbError.message };

  // If linked to a qualification, upgrade its verification_status
  if (parsed.data.linked_qualification_id && doc) {
    await supabase
      .from('user_qualifications')
      .update({ document_id: doc.id, verification_status: 'document_linked' })
      .eq('id', parsed.data.linked_qualification_id)
      .eq('user_id', userId)
      .eq('verification_status', 'self_reported');
  }

  revalidatePath('/dashboard/documents');
  return { id: doc?.id ?? null, error: null };
}

// ── Update document metadata ──

export async function updateDocument(id: string, data: unknown): Promise<{ error: string | null }> {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const parsed = documentUpdateSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from('documents')
    .update({
      title: parsed.data.title || null,
      description: parsed.data.description || null,
      category: parsed.data.category,
      subcategory: parsed.data.subcategory || null,
      issuing_authority: parsed.data.issuing_authority || null,
      document_date: parsed.data.document_date || null,
      expiration_date: parsed.data.expiration_date || null,
    })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/documents');
  return { error: null };
}

// ── Archive (soft delete) ──

export async function archiveDocument(id: string): Promise<{ error: string | null }> {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = await createClient();

  // If linked to a qualification, revert verification before archiving
  const { data: doc } = await supabase
    .from('documents')
    .select('linked_qualification_id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (doc?.linked_qualification_id) {
    await supabase
      .from('user_qualifications')
      .update({ document_id: null, verification_status: 'self_reported' })
      .eq('id', doc.linked_qualification_id)
      .eq('user_id', userId);
  }

  const { error } = await supabase
    .from('documents')
    .update({ status: 'archived' })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return { error: error.message };
  revalidatePath('/dashboard/documents');
  return { error: null };
}

// ── Get signed URL ──

export async function getDocumentUrl(id: string): Promise<{ url: string | null; error: string | null }> {
  const userId = await getAuthUserId();
  if (!userId) return { url: null, error: 'Not authenticated' };

  const supabase = await createClient();
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('storage_path, storage_bucket')
    .eq('id', id)
    .single();

  if (fetchError || !doc) return { url: null, error: 'Document not found' };

  const { data, error: signError } = await supabase.storage
    .from(doc.storage_bucket)
    .createSignedUrl(doc.storage_path, 300); // 5 minutes

  if (signError) return { url: null, error: signError.message };
  return { url: data.signedUrl, error: null };
}

// ── Link document to qualification ──

export async function linkDocumentToQualification(docId: string, qualId: string): Promise<{ error: string | null }> {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = await createClient();

  // Set link on document
  const { error: docError } = await supabase
    .from('documents')
    .update({ linked_qualification_id: qualId })
    .eq('id', docId)
    .eq('user_id', userId);

  if (docError) return { error: docError.message };

  // Upgrade qualification verification_status
  await supabase
    .from('user_qualifications')
    .update({ document_id: docId, verification_status: 'document_linked' })
    .eq('id', qualId)
    .eq('user_id', userId)
    .eq('verification_status', 'self_reported');

  revalidatePath('/dashboard/documents');
  revalidatePath('/dashboard/profile');
  return { error: null };
}

// ── Unlink document ──

export async function unlinkDocument(docId: string, linkType: 'qualification' | 'deployment' | 'incident'): Promise<{ error: string | null }> {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = await createClient();

  if (linkType === 'qualification') {
    // Get the linked qualification id first
    const { data: doc } = await supabase
      .from('documents')
      .select('linked_qualification_id')
      .eq('id', docId)
      .eq('user_id', userId)
      .single();

    // Clear link on document
    await supabase
      .from('documents')
      .update({ linked_qualification_id: null })
      .eq('id', docId)
      .eq('user_id', userId);

    // Revert qualification verification_status
    if (doc?.linked_qualification_id) {
      await supabase
        .from('user_qualifications')
        .update({ document_id: null, verification_status: 'self_reported' })
        .eq('id', doc.linked_qualification_id)
        .eq('user_id', userId);
    }
  } else if (linkType === 'deployment') {
    await supabase
      .from('documents')
      .update({ linked_deployment_id: null })
      .eq('id', docId)
      .eq('user_id', userId);
  } else {
    await supabase
      .from('documents')
      .update({ linked_incident_id: null })
      .eq('id', docId)
      .eq('user_id', userId);
  }

  revalidatePath('/dashboard/documents');
  revalidatePath('/dashboard/profile');
  return { error: null };
}

// ── Hard delete (removes storage object + row; clears avatar_url if avatar) ──

export async function deleteDocument(id: string): Promise<{ error: string | null }> {
  const userId = await getAuthUserId();
  if (!userId) return { error: 'Not authenticated' };

  const supabase = await createClient();

  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('storage_path, storage_bucket, category, linked_qualification_id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (fetchError || !doc) return { error: 'Document not found' };

  if (doc.linked_qualification_id) {
    await supabase
      .from('user_qualifications')
      .update({ document_id: null, verification_status: 'self_reported' })
      .eq('id', doc.linked_qualification_id)
      .eq('user_id', userId);
  }

  await supabase.storage.from(doc.storage_bucket).remove([doc.storage_path]);

  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (deleteError) return { error: deleteError.message };

  if (doc.category === 'avatar') {
    await supabase.from('users').update({ avatar_url: null }).eq('id', userId);
  }

  revalidatePath('/dashboard/documents');
  revalidatePath('/dashboard/profile');
  return { error: null };
}

// ── Avatar upload (public bucket, updates users.avatar_url) ──

export async function uploadAvatar(
  formData: FormData
): Promise<{ url: string | null; error: string | null }> {
  const userId = await getAuthUserId();
  if (!userId) return { url: null, error: 'Not authenticated' };

  const file = formData.get('file') as File;
  if (!file || file.size === 0) return { url: null, error: 'No file provided' };
  if (file.size > AVATAR_MAX_BYTES) return { url: null, error: 'Avatar must be under 5 MB' };
  if (!(avatarUploadMimeTypes as readonly string[]).includes(file.type)) {
    return { url: null, error: 'Avatar must be JPEG, PNG, or WebP' };
  }

  const supabase = await createClient();

  // Remove any prior avatar (storage + documents rows).
  const { data: priorAvatars } = await supabase
    .from('documents')
    .select('id, storage_path, storage_bucket')
    .eq('user_id', userId)
    .eq('category', 'avatar');

  if (priorAvatars && priorAvatars.length > 0) {
    const paths = priorAvatars
      .filter((a) => a.storage_bucket === 'avatars')
      .map((a) => a.storage_path);
    if (paths.length > 0) {
      await supabase.storage.from('avatars').remove(paths);
    }
    await supabase
      .from('documents')
      .delete()
      .eq('user_id', userId)
      .eq('category', 'avatar');
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const avatarUuid = crypto.randomUUID();
  const storagePath = `${userId}/${avatarUuid}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(storagePath, file, { contentType: file.type, upsert: false });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(storagePath);
  const publicUrl = publicUrlData.publicUrl;

  const { error: dbError } = await supabase.from('documents').insert({
    user_id: userId,
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    storage_path: storagePath,
    storage_bucket: 'avatars',
    category: 'avatar',
  });

  if (dbError) {
    await supabase.storage.from('avatars').remove([storagePath]);
    return { url: null, error: dbError.message };
  }

  const { error: userError } = await supabase
    .from('users')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);

  if (userError) return { url: null, error: userError.message };

  revalidatePath('/dashboard/profile');
  return { url: publicUrl, error: null };
}
