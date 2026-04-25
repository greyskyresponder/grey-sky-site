---
doc_id: GSR-DOC-206
title: "Document Library — Upload, Categorize, Link"
phase: 2
status: approved
blocks_on:
  - GSR-DOC-201
priority: high
author: Architecture Agent (Claude App)
created: 2026-04-13
updated: 2026-04-13
notes: >
  Document library enables members to upload, categorize, and link supporting
  documents to deployment records, certification pathways, and profile sections.
  Also enables avatar upload for member profiles (deferred from DOC-202).
  Uses Supabase Storage with RLS bucket policies.
---

# GSR-DOC-206: Document Library — Upload, Categorize, Link

| Field | Value |
|-------|-------|
| Phase | 2 |
| Status | approved |
| Blocks on | GSR-DOC-201 (Dashboard Layout) ✅ |
| Priority | high |

---

## Purpose

A responder's service record is only as credible as the documentation behind it. Training certificates, deployment orders, ICS forms, licenses, performance evaluations, task book completions — these documents are the evidence layer that transforms self-reported records into verified professional history.

The document library gives every member a secure, organized place to store, categorize, and link supporting documents to their deployment records, certification pathways, and profile. It is the portfolio that certification reviewers and QRB credentialing panels examine.

**This doc builds:**
- Document upload with drag-and-drop and file picker
- Document categorization (certificate, license, training record, ICS form, deployment order, photo ID, task book, letter of recommendation, other)
- Document linking to deployment records, certification pathways, and profile sections
- Document list view with filters and search
- Document detail view with preview (images, PDFs)
- Avatar/profile photo upload (deferred from DOC-202)
- Supabase Storage bucket configuration with RLS
- AI extraction placeholder (metadata field for DOC-303 ATLAS integration)
- Server actions for upload, categorize, link, delete

**What it does NOT build:**
- AI document processing (DOC-303 — ATLAS layer)
- Organization-level document management (DOC-609+)
- Assessor report uploads (DOC-605/606 — separate workflow)
- Public document sharing (documents are private to the member and Grey Sky staff)

**Why it matters:**
Every certification pathway requires evidence. Every credentialing review examines documents. Every verified response report is strengthened by supporting documentation. Without the document library, the trust pipeline from response report → validation → certification → credential has no evidence backbone.

---

## Data Entities

### Table: `documents`

This table already exists in the schema (migration `20260409000003_core_tables.sql`). The existing definition is:

```sql
-- Already exists — verify and extend if needed
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,          -- Path in Supabase Storage bucket
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  category document_category NOT NULL,
  description TEXT,
  linked_record_type TEXT,             -- 'deployment_record', 'certification_pathway', 'profile', 'incident'
  linked_record_id UUID,
  ai_extracted_data JSONB DEFAULT '{}',
  upload_status upload_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**If the `document_category` enum needs extending, add a migration:**

```sql
-- Migration: 20260413000002_document_library.sql

-- Extend document_category enum if needed
-- Check existing enum values first
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'ics_form';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'deployment_order';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'task_book';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'letter_of_recommendation';
ALTER TYPE document_category ADD VALUE IF NOT EXISTS 'avatar';

-- Add thumbnail_path for image/PDF preview
ALTER TABLE documents ADD COLUMN IF NOT EXISTS thumbnail_path TEXT;

-- Add tags for flexible categorization
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_linked ON documents(linked_record_type, linked_record_id);
CREATE INDEX IF NOT EXISTS idx_documents_upload_status ON documents(upload_status);
```

### Supabase Storage Buckets

```sql
-- Create via Supabase CLI or dashboard
-- Bucket: member-documents (private, RLS enforced)
-- Bucket: avatars (public read, authenticated write)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('member-documents', 'member-documents', false, 26214400, -- 25MB
   ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp',
         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('avatars', 'avatars', true, 5242880, -- 5MB
   ARRAY['image/jpeg', 'image/png', 'image/webp']);

-- RLS on member-documents: user can only access own files
CREATE POLICY "Users manage own documents" ON storage.objects
  FOR ALL USING (
    bucket_id = 'member-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- RLS on avatars: anyone can read, only owner can write
CREATE POLICY "Public avatar read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users manage own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### RLS on `documents` Table

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Members see only their own documents
CREATE POLICY "Users view own documents" ON documents
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users insert own documents" ON documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own documents" ON documents
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users delete own documents" ON documents
  FOR DELETE USING (user_id = auth.uid());

-- Platform admins see all (for certification/credentialing review)
CREATE POLICY "Admins view all documents" ON documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'platform_admin')
  );
```

---

## TypeScript Types

```typescript
// src/lib/types/documents.ts

export type DocumentCategory =
  | 'certificate'
  | 'license'
  | 'training_record'
  | 'ics_form'
  | 'deployment_order'
  | 'task_book'
  | 'letter_of_recommendation'
  | 'assessment_report'
  | 'field_report'
  | 'self_assessment'
  | 'photo_id'
  | 'avatar'
  | 'other';

export type UploadStatus = 'pending' | 'processed' | 'failed';

export type LinkedRecordType =
  | 'deployment_record'
  | 'certification_pathway'
  | 'profile'
  | 'incident';

export interface Document {
  id: string;
  userId: string;
  orgId: string | null;
  filename: string;
  originalFilename: string;
  storagePath: string;
  mimeType: string;
  fileSizeBytes: number;
  category: DocumentCategory;
  description: string | null;
  linkedRecordType: LinkedRecordType | null;
  linkedRecordId: string | null;
  aiExtractedData: Record<string, unknown>;
  uploadStatus: UploadStatus;
  thumbnailPath: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUploadInput {
  file: File;
  category: DocumentCategory;
  description?: string;
  linkedRecordType?: LinkedRecordType;
  linkedRecordId?: string;
  tags?: string[];
}

export interface DocumentListFilters {
  category?: DocumentCategory;
  linkedRecordType?: LinkedRecordType;
  linkedRecordId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DocumentSummary {
  totalDocuments: number;
  byCategory: Record<DocumentCategory, number>;
  totalSizeBytes: number;
}
```

---

## Structure

### New Files

```
src/app/(dashboard)/dashboard/documents/page.tsx              — Document library list
src/app/(dashboard)/dashboard/documents/[id]/page.tsx         — Document detail + preview
src/app/api/documents/upload/route.ts                         — POST upload handler
src/app/api/documents/[id]/route.ts                           — GET detail, DELETE
src/app/api/documents/[id]/link/route.ts                      — PUT link/unlink
src/components/documents/DocumentList.tsx                      — Filterable document grid/list
src/components/documents/DocumentUpload.tsx                    — Drag-and-drop + file picker
src/components/documents/DocumentDetail.tsx                    — Preview + metadata + actions
src/components/documents/DocumentCard.tsx                      — Card for grid view
src/components/documents/DocumentCategoryBadge.tsx             — Category badge (color-coded)
src/components/documents/AvatarUpload.tsx                      — Profile photo upload (for DOC-202)
src/lib/documents/actions.ts                                   — Server actions
src/lib/documents/storage.ts                                   — Supabase Storage helpers
src/lib/validators/documents.ts                                — Zod schemas
supabase/migrations/20260413000002_document_library.sql        — Enum extensions, columns, storage buckets, RLS
```

### Modified Files

```
src/lib/types/documents.ts       — Replace existing placeholder types
src/lib/types/index.ts           — Update barrel export
src/components/dashboard/Sidebar.tsx   — Add "Documents" nav link
src/components/dashboard/MobileNav.tsx — Add "Documents" nav link
```

---

## Business Rules

1. **File size limits.** Member documents: 25MB max. Avatars: 5MB max. Enforced at Supabase Storage bucket level AND validated client-side before upload.

2. **Allowed file types.** Documents: PDF, JPEG, PNG, WebP, DOC, DOCX. Avatars: JPEG, PNG, WebP. Enforced at bucket level AND client-side.

3. **Storage path convention.** All files stored under the user's UUID: `{userId}/{uuid}.{ext}`. This enables RLS using `storage.foldername(name)`.

4. **Original filename preserved.** The `original_filename` column stores what the user uploaded. The `filename` column stores the sanitized, UUID-based name used in storage.

5. **Document linking.** A document can be linked to ONE record at a time (deployment record, certification pathway, profile section, or incident). Linking is a metadata update, not a file move. A document can be unlinked and re-linked.

6. **Avatar is a document.** Avatar uploads create a `documents` row with `category = 'avatar'`. The `users.avatar_url` column is updated to point to the public Supabase Storage URL. Only one active avatar — uploading a new one replaces the old.

7. **Deletion.** Deleting a document removes the storage object AND the database row. If the document is linked, the link is broken. If it's an avatar, `users.avatar_url` is cleared. Deletion is permanent — no soft delete, no trash.

8. **AI extraction placeholder.** The `ai_extracted_data` JSONB column exists but is not populated in this build. DOC-303 (Document AI Processing) will populate it via ATLAS. The UI shows an "AI Processing" badge when `upload_status = 'pending'` and the field is empty.

9. **No sharing.** Documents are visible only to the member and platform admins. No member-to-member sharing. No public URLs for member documents. Avatars are public (stored in public bucket).

10. **Storage quota.** No hard quota at launch. Monitor via `DocumentSummary.totalSizeBytes`. Add quota enforcement in DOC-900 if needed.

---

## Copy Direction

**Page title:** "Documents" — simple, clear.

**Upload area:** "Drop files here or click to browse" — standard pattern, no creativity needed.

**Category labels:** Use plain language. "Training Certificate" not "training_record". "ICS Form" not "ics_form". Map enum values to display labels in `DocumentCategoryBadge`.

**Empty state:** "No documents yet. Upload training certificates, deployment orders, ICS forms, and other supporting documents to build your professional portfolio."

**Linked document:** Show the linked record name with a link. "Linked to: Hurricane Milton Response (Oct 2024)".

**AI processing badge:** "Processing..." (gold badge) — placeholder for DOC-303.

---

## Acceptance Criteria

1. Migration extends `document_category` enum and adds `thumbnail_path`, `tags` columns
2. Supabase Storage buckets created: `member-documents` (private, 25MB, doc types) and `avatars` (public, 5MB, image types)
3. Storage RLS policies enforce user-only access on `member-documents` and public-read + owner-write on `avatars`
4. Document RLS policies enforce user-only access with admin read-all
5. Upload works via drag-and-drop and file picker with client-side validation (size + type)
6. Documents display in a filterable list with category badges
7. Document detail page shows preview (inline image or PDF embed) with metadata
8. Documents can be linked to deployment records and certification pathways
9. Documents can be unlinked
10. Document deletion removes both storage object and database row
11. Avatar upload updates `users.avatar_url` and creates a `documents` row with `category = 'avatar'`
12. Dashboard sidebar/mobile nav includes "Documents" link
13. TypeScript types and Zod validators cover all inputs
14. `npm run build` passes with zero errors

---

## Agent Lenses

### Baseplate (data/schema)
- `documents` table already exists — migration only extends enum and adds columns, does not recreate
- Storage paths use `{userId}/{uuid}.{ext}` for clean RLS folder-based policies
- `linked_record_type` + `linked_record_id` is a polymorphic reference — acceptable for document linking where the set of linkable types is small and stable
- Indexes on `user_id`, `category`, `linked_record_type + linked_record_id`, and `upload_status` cover all query patterns

### Meridian (doctrine)
- Document categories align with ICS/NIMS documentation standards (ICS forms, task books, deployment orders)
- Category list covers the evidence types that certification pathways and QRB credentialing panels expect to review

### Lookout (UX)
- Drag-and-drop is expected. File picker is backup. Both must work.
- Category selection should default to the most common type (certificate) or auto-detect from filename patterns
- Preview inline — don't force download to see a document
- Linked record shown as a clickable reference, not just an ID

### Threshold (security)
- Private bucket with folder-based RLS — users cannot access other users' documents even with direct URLs
- File type validation at BOTH client (fast feedback) and bucket level (enforcement)
- No executable file types allowed (no .exe, .sh, .bat, .js)
- `ai_extracted_data` is server-populated only — no client writes to this field
- Avatar bucket is public-read but owner-write — users can't replace other users' avatars

---

## Claude Code Prompt

You are building the document library for the Grey Sky Responder Society portal. This is a Next.js 16 + Supabase (Postgres + Storage) application.

### What You Are Building

A complete document management system: Supabase Storage buckets, database migration, TypeScript types, Zod validators, server actions, upload/list/detail/delete UI, avatar upload, and dashboard integration.

### Prerequisites

The following already exist in the codebase:
- `documents` table in `supabase/migrations/20260409000003_core_tables.sql` — check existing enum values and columns before extending
- `document_category` and `upload_status` enums in `supabase/migrations/20260409000002_enums.sql`
- Dashboard layout with sidebar, header, and mobile nav (`src/components/dashboard/`)
- Supabase client at `src/lib/supabase/client.ts` and admin at `src/lib/supabase/admin.ts`
- Type system at `src/lib/types/` with barrel export
- Validator system at `src/lib/validators/`
- Brand: Command Navy `#0A1628`, Signal Gold `#C5933A`, Ops White `#F5F5F5`
- Tailwind CSS 4, React 19

### Step 1: Migration

Create `supabase/migrations/20260413000002_document_library.sql`:

1. Check existing `document_category` enum values and ADD VALUE IF NOT EXISTS for: `ics_form`, `deployment_order`, `task_book`, `letter_of_recommendation`, `avatar`
2. Add columns to `documents`: `thumbnail_path TEXT`, `tags TEXT[] DEFAULT '{}'`
3. Add column `original_filename TEXT` if not present (copy from `filename` for existing rows)
4. Add column `storage_path TEXT` if not present
5. Create indexes: `idx_documents_user`, `idx_documents_category`, `idx_documents_linked`, `idx_documents_upload_status`
6. Create Supabase Storage buckets: `member-documents` (private, 25MB, PDF/JPEG/PNG/WebP/DOC/DOCX) and `avatars` (public, 5MB, JPEG/PNG/WebP)
7. Create Storage RLS policies as specified in the Data Entities section
8. Create/update document table RLS policies: user sees own, admin sees all, user CRUDs own

### Step 2: TypeScript Types

Update `src/lib/types/documents.ts` with the full type definitions from this spec. Update barrel export.

### Step 3: Zod Validators

Create/update `src/lib/validators/documents.ts`:
- `DocumentUploadSchema` — { category: DocumentCategory, description?: string, linkedRecordType?: string, linkedRecordId?: string, tags?: string[] }
- `DocumentLinkSchema` — { linkedRecordType: LinkedRecordType, linkedRecordId: string }
- `DocumentListQuerySchema` — { category?: string, linkedRecordType?: string, linkedRecordId?: string, search?: string, page?: number, limit?: number (max 50) }

### Step 4: Storage Helpers

Create `src/lib/documents/storage.ts`:
- `uploadDocument(userId: string, file: File): Promise<{ storagePath: string, filename: string }>` — uploads to `member-documents/{userId}/{uuid}.{ext}`
- `uploadAvatar(userId: string, file: File): Promise<{ storagePath: string, publicUrl: string }>` — uploads to `avatars/{userId}/{uuid}.{ext}`, returns public URL
- `deleteStorageObject(bucket: string, path: string): Promise<void>`
- `getPublicUrl(bucket: string, path: string): string`
- `getSignedUrl(bucket: string, path: string, expiresIn?: number): Promise<string>` — for private documents, default 1 hour

### Step 5: Server Actions

Create `src/lib/documents/actions.ts`:
- `uploadDocument(userId: string, formData: FormData): Promise<Document>` — validates file, uploads to storage, creates database row
- `listDocuments(userId: string, filters: DocumentListFilters): Promise<{ documents: Document[], total: number }>`
- `getDocument(userId: string, documentId: string): Promise<Document & { signedUrl: string }>`
- `linkDocument(userId: string, documentId: string, linkedRecordType: LinkedRecordType, linkedRecordId: string): Promise<Document>`
- `unlinkDocument(userId: string, documentId: string): Promise<Document>`
- `deleteDocument(userId: string, documentId: string): Promise<void>` — deletes storage object and database row, clears avatar_url if avatar
- `uploadAvatar(userId: string, formData: FormData): Promise<string>` — uploads, updates users.avatar_url, creates document row, returns public URL
- `getDocumentSummary(userId: string): Promise<DocumentSummary>`

### Step 6: API Routes

Create:
- `src/app/api/documents/upload/route.ts` — POST, multipart form data, calls uploadDocument action
- `src/app/api/documents/[id]/route.ts` — GET (detail with signed URL), DELETE
- `src/app/api/documents/[id]/link/route.ts` — PUT (link), DELETE (unlink)

### Step 7: Components

**DocumentUpload** (`src/components/documents/DocumentUpload.tsx`):
- Drag-and-drop zone with dashed border
- File picker button as alternative
- Category dropdown (required before upload)
- Optional description text field
- Client-side validation: file size (25MB) and type (PDF, JPEG, PNG, WebP, DOC, DOCX)
- Upload progress indicator
- Error display for validation failures

**DocumentList** (`src/components/documents/DocumentList.tsx`):
- Grid/list toggle (default grid on desktop, list on mobile)
- Filter bar: category dropdown, search input
- Each document shows: thumbnail/icon, filename, category badge, upload date, linked record (if any)
- Click navigates to detail page
- Empty state with call to action

**DocumentCard** (`src/components/documents/DocumentCard.tsx`):
- Thumbnail or file-type icon (PDF icon, image thumbnail, doc icon)
- Original filename (truncated)
- Category badge (color-coded by category)
- File size
- Upload date
- Linked record indicator (small link icon if linked)

**DocumentDetail** (`src/components/documents/DocumentDetail.tsx`):
- Preview area: inline image display for JPEG/PNG/WebP, PDF embed for PDFs, download link for DOC/DOCX
- Metadata: original filename, category, file size, upload date, description
- Linked record: clickable link to the deployment record/certification, or "Link to a record" button
- Actions: Delete (with confirmation), Download, Edit description/category
- AI extraction section: "Processing..." badge or extracted data display (placeholder for DOC-303)

**DocumentCategoryBadge** (`src/components/documents/DocumentCategoryBadge.tsx`):
- Small colored badge
- Colors: certificates (green), licenses (blue), training (gold), ICS forms (navy), deployment orders (slate), task books (steel), letters (purple), other (gray)

**AvatarUpload** (`src/components/documents/AvatarUpload.tsx`):
- Circular preview of current avatar (or initials placeholder)
- Click to open file picker (JPEG/PNG/WebP only, 5MB max)
- Crop is not required — accept as-is
- Shows upload progress
- Updates avatar immediately on success
- Exports for use in profile edit page (DOC-202)

### Step 8: Pages

**`/dashboard/documents`** (`src/app/(dashboard)/dashboard/documents/page.tsx`):
- Server component, auth-gated
- Fetches document list with filters from URL params
- Renders DocumentUpload (collapsed by default, expand with button) + DocumentList
- Page title: "Documents"

**`/dashboard/documents/[id]`** (`src/app/(dashboard)/dashboard/documents/[id]/page.tsx`):
- Server component, auth-gated
- Fetches document detail with signed URL
- Renders DocumentDetail
- 404 if document not found or not owned by user

### Step 9: Dashboard Integration

- Add "Documents" link to sidebar nav (`src/components/dashboard/Sidebar.tsx`) — icon: file/folder
- Add "Documents" link to mobile nav (`src/components/dashboard/MobileNav.tsx`)
- Add document count to StatusGrid if appropriate

### Step 10: Verify

- `npm run build` must pass with zero errors
- Upload a PDF → verify it appears in document list
- Upload an image → verify thumbnail/preview works
- Link a document to a deployment record → verify link appears
- Delete a document → verify storage object AND database row removed
- Upload avatar → verify `users.avatar_url` updated and image displays
- Verify RLS: user cannot access another user's documents via direct storage URL

### Commit Message

`GSR-DOC-206: document library — storage, upload, categorize, link, avatar`
