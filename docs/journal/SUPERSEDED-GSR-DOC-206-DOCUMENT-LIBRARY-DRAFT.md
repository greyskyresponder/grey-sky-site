# GSR-DOC-206: Document Library — Upload + Categorize + Link

| Field | Value |
|-------|-------|
| Phase | 2 |
| Status | draft |
| Blocks on | GSR-DOC-201 (Dashboard Layout) ✅ |
| Priority | high |

---

## Purpose

The document library is where a responder's paper trail becomes digital. Every certification has a card behind it. Every training has a certificate. Every deployment has an ICS form. Every qualification claim in the profile (DOC-202) is currently self-reported — the document library is how those claims get linked to proof.

**This doc builds:**
- Upload interface for member documents (dashboard)
- Document categorization and metadata capture
- Document list/grid view with filters
- Document detail view with preview
- Linking mechanism to connect documents to profile qualifications (DOC-202) and deployment records (DOC-203)
- Storage abstraction using Supabase Storage (with future Azure Blob overflow)
- Document table in database with RLS
- Server actions for upload, categorize, link, delete

**What it does NOT build:**
- AI document extraction/parsing (DOC-303 — Phase 3, ATLAS scope)
- Public document access (all documents are private to the member + staff)
- Bulk import tools
- Document versioning (v1 — replace, not version)

**Why it matters:**
Self-attestation is the problem Grey Sky exists to solve. A qualification without proof is just a claim. When a member uploads their EMT-P card and links it to their "EMT-Paramedic" qualification entry, that qualification's `verification_status` upgrades from `self_reported` to `document_linked`. That's the first step on the trust ladder. Staff review later upgrades it to `staff_verified`. Documents are the receipts.

---

## Data Entities

### Primary Table: `documents`

This table already exists in the DOC-002 schema with a minimal definition. This doc expands it to support categorized uploads with linking.

Check the existing `documents` table definition and ADD or ALTER columns as needed. The target schema:

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | NO | — | FK → `users.id` ON DELETE CASCADE. Owner of this document. |
| `file_name` | `varchar(500)` | NO | — | Original filename as uploaded. |
| `file_type` | `varchar(100)` | NO | — | MIME type (e.g., `application/pdf`, `image/jpeg`). |
| `file_size` | `integer` | NO | — | Size in bytes. |
| `storage_path` | `varchar(1000)` | NO | — | Path in Supabase Storage bucket. Format: `documents/{user_id}/{uuid}.{ext}` |
| `storage_bucket` | `varchar(100)` | NO | `'documents'` | Supabase Storage bucket name. |
| `title` | `varchar(300)` | YES | NULL | Member-provided title. If NULL, display `file_name`. |
| `description` | `text` | YES | NULL | Optional description/notes. |
| `category` | `document_category_enum` | NO | `'other'` | Classification. See enum below. |
| `subcategory` | `varchar(100)` | YES | NULL | Free-text refinement within category. |
| `issuing_authority` | `varchar(300)` | YES | NULL | Who issued this document (e.g., "FEMA EMI", "State of Florida BFST"). |
| `document_date` | `date` | YES | NULL | Date on the document (issue date, completion date, etc.). |
| `expiration_date` | `date` | YES | NULL | If the document has an expiration. |
| `linked_qualification_id` | `uuid` | YES | NULL | FK → `user_qualifications.id` ON DELETE SET NULL. Links this doc to a profile qualification. |
| `linked_deployment_id` | `uuid` | YES | NULL | FK → `deployment_records.id` ON DELETE SET NULL. Links this doc to a deployment record. |
| `linked_incident_id` | `uuid` | YES | NULL | FK → `incidents.id` ON DELETE SET NULL. Links this doc to an incident. |
| `ai_extracted_data` | `jsonb` | YES | NULL | Reserved for DOC-303 ATLAS extraction. Not populated by this doc. |
| `verification_status` | `varchar(20)` | NO | `'uploaded'` | `uploaded`, `reviewed`, `verified`, `rejected`. Staff workflow. |
| `reviewed_by` | `uuid` | YES | NULL | FK → `users.id`. Staff member who reviewed. |
| `reviewed_at` | `timestamptz` | YES | NULL | When review occurred. |
| `status` | `varchar(20)` | NO | `'active'` | `active`, `archived`, `deleted`. Soft delete. |
| `created_at` | `timestamptz` | NO | `now()` | — |
| `updated_at` | `timestamptz` | NO | `now()` | — |

### New Enum

```sql
CREATE TYPE document_category_enum AS ENUM (
  'certification',      -- Certs, licenses, credentials (EMT-P card, CDL, FEMA certs)
  'training',           -- Course completion certificates, transcripts
  'deployment',         -- ICS forms (ICS-214, ICS-225, ICS-222), AARs, mission assignments
  'identification',     -- Government ID, passport (PII — extra sensitivity)
  'medical',            -- Fit-for-duty, immunization records (PII — extra sensitivity)
  'assessment',         -- Self-assessment docs, assessor reports, team eval docs
  'correspondence',     -- Letters of recommendation, commendations, official correspondence
  'membership',         -- Grey Sky membership card, Society docs
  'other'               -- Catch-all
);
```

### TypeScript Types

```typescript
// src/lib/types/documents.ts

export type DocumentCategory =
  | 'certification'
  | 'training'
  | 'deployment'
  | 'identification'
  | 'medical'
  | 'assessment'
  | 'correspondence'
  | 'membership'
  | 'other';

export type DocumentVerificationStatus = 'uploaded' | 'reviewed' | 'verified' | 'rejected';
export type DocumentStatus = 'active' | 'archived' | 'deleted';

export interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  storage_bucket: string;
  title: string | null;
  description: string | null;
  category: DocumentCategory;
  subcategory: string | null;
  issuing_authority: string | null;
  document_date: string | null;
  expiration_date: string | null;
  linked_qualification_id: string | null;
  linked_deployment_id: string | null;
  linked_incident_id: string | null;
  ai_extracted_data: Record<string, unknown> | null;
  verification_status: DocumentVerificationStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
}

export interface DocumentSummary {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  title: string | null;
  category: DocumentCategory;
  document_date: string | null;
  expiration_date: string | null;
  verification_status: DocumentVerificationStatus;
  status: DocumentStatus;
  created_at: string;
  // Linked entity names for display
  linked_qualification_name: string | null;
  linked_deployment_position: string | null;
}

export interface DocumentUploadInput {
  file: File;
  title?: string;
  description?: string;
  category: DocumentCategory;
  subcategory?: string;
  issuing_authority?: string;
  document_date?: string;
  expiration_date?: string;
  linked_qualification_id?: string;
  linked_deployment_id?: string;
  linked_incident_id?: string;
}
```

---

## Structure

### Migration

```
supabase/migrations/20260413000002_documents_expansion.sql
```

### Storage

Create Supabase Storage bucket `documents` with:
- Private (no public access)
- Max file size: 10MB
- Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`, `image/webp`, `image/heic`
- RLS: user can only access files in their own `documents/{user_id}/` prefix

### Routes

```
src/app/(dashboard)/dashboard/documents/page.tsx            — Document library (list/grid)
src/app/(dashboard)/dashboard/documents/upload/page.tsx     — Upload form
src/app/(dashboard)/dashboard/documents/[id]/page.tsx       — Document detail + preview
```

### Components

```
src/components/documents/DocumentLibrary.tsx          — List/grid view with filters
src/components/documents/DocumentCard.tsx             — Card in grid view
src/components/documents/DocumentRow.tsx              — Row in list view
src/components/documents/DocumentUploadForm.tsx       — Upload form with category, metadata, linking
src/components/documents/DocumentDetail.tsx           — Full detail view with preview
src/components/documents/DocumentPreview.tsx          — Inline preview (PDF iframe or image)
src/components/documents/DocumentLinkSelector.tsx     — Combo box to link to qualification or deployment
src/components/documents/FileDropzone.tsx             — Drag-and-drop file upload area
```

### Server Actions

```
src/lib/actions/documents.ts
  - getMyDocuments(filters?)          — Paginated list with category/status filters
  - getDocumentById(id)               — Full document record
  - uploadDocument(formData)          — Upload file to storage + create DB record
  - updateDocument(id, data)          — Update metadata (title, category, links)
  - archiveDocument(id)               — Soft delete (status → 'archived')
  - getDocumentUrl(id)                — Generate signed URL for file access (short-lived)
  - linkDocumentToQualification(docId, qualId) — Set linked_qualification_id + update qualification verification_status to 'document_linked'
  - unlinkDocument(docId, linkType)   — Clear a linked_* field
```

### Validators

```
src/lib/validators/documents.ts
  - documentUploadSchema
  - documentUpdateSchema
  - documentFilterSchema
```

---

## Business Rules

### Upload Constraints
- Max file size: 10MB per file
- Allowed types: PDF, JPEG, PNG, WebP, HEIC
- Max documents per member: 200 (application-level enforcement)
- File stored at: `documents/{user_id}/{document_uuid}.{extension}`
- Original filename preserved in `file_name` column, NOT used as storage path (security: prevent path traversal)

### Category-Specific Behavior
- `identification` and `medical` categories display a privacy badge: "This document contains sensitive personal information. It is visible only to you and Grey Sky staff."
- `certification` and `training` categories show a prompt to link to a profile qualification: "Link this to a qualification in your profile to verify your credentials."
- `deployment` category shows a prompt to link to a deployment record.

### Linking Logic
- When a document is linked to a `user_qualifications` entry via `linked_qualification_id`, the qualification's `verification_status` automatically updates to `'document_linked'` (if currently `'self_reported'`). The qualification's `document_id` field is also set.
- When a document is unlinked, the qualification's `verification_status` reverts to `'self_reported'` and `document_id` is cleared.
- A document can be linked to one qualification AND one deployment AND one incident simultaneously (different link types, not mutually exclusive).
- Linking is optional. A document can exist without any links.

### Access Control
- Member can only see/upload/edit/archive their own documents (RLS: `user_id = auth.uid()`)
- Staff (`platform_admin`) can VIEW any member's documents for verification purposes. Cannot edit or delete.
- No public access to documents. No shared URLs. Signed URLs expire after 5 minutes.

### File Access
- Files are never served directly. Always use Supabase Storage signed URLs.
- `getDocumentUrl(id)` verifies ownership via RLS, then generates a 5-minute signed URL.
- PDF preview: iframe with signed URL. Image preview: `<img>` with signed URL.
- HEIC files: display as download link only (no browser preview).

---

## Copy Direction

### Section Headers & Prompts

| Context | Header | Prompt |
|---------|--------|--------|
| Library page | **Your Documents** | "The paper trail of a life in service. Upload, organize, and link your records." |
| Upload page | **Add a Document** | "Certifications, training records, ICS forms, credentials — everything that proves what you've done." |
| Category: certification | **Certifications & Licenses** | "Your EMT card, your CDL, your FEMA certs — the credentials that open doors." |
| Category: training | **Training Records** | "Course completions, transcripts, continuing education. Every class counts." |
| Category: deployment | **Deployment Records** | "ICS-214s, mission assignments, AARs. The operational record." |
| Category: identification | **Identification** | "Government ID, passport. Stored securely — visible only to you and Grey Sky staff." |
| Category: medical | **Medical Records** | "Fit-for-duty, immunization records. Private and protected." |
| Empty library | — | "You haven't uploaded any documents yet. When you're ready, this is where your records live." |
| Link prompt | — | "Link this document to a qualification in your profile to verify your credentials." |

### Tone
- Never say "attach" or "attachment" — say "upload" or "add"
- Documents are "records" and "proof" — not "files" or "attachments"
- Privacy messaging is matter-of-fact, not alarming: "Stored securely" not "WARNING: SENSITIVE"

---

## Acceptance Criteria

1. Migration creates or expands `documents` table with all columns specified, including `document_category_enum` enum type, foreign keys, and indexes.
2. RLS policies enforce: SELECT where `user_id = auth.uid()` OR role is `platform_admin`; INSERT/UPDATE/DELETE where `user_id = auth.uid()`.
3. Supabase Storage bucket `documents` exists with private access and correct RLS.
4. `/dashboard/documents` renders document library with grid and list view toggle, category filter, and search.
5. `/dashboard/documents/upload` renders upload form with file dropzone, category selector, metadata fields, and optional linking.
6. File upload stores to `documents/{user_id}/{uuid}.{ext}`, creates DB record, and redirects to document detail.
7. `/dashboard/documents/[id]` renders document detail with preview (PDF iframe or image), metadata, and linked entities.
8. Linking a document to a qualification updates the qualification's `verification_status` to `'document_linked'` and sets `document_id`.
9. Unlinking reverts the qualification's `verification_status` to `'self_reported'`.
10. Archive (soft delete) sets `status = 'archived'` and removes from library view.
11. Signed URLs expire after 5 minutes. No direct file access.
12. Max file size 10MB enforced at client (before upload) and server (storage policy).
13. Privacy badge appears on `identification` and `medical` category documents.
14. "Documents" nav link in dashboard sidebar with file icon.
15. `npm run build` passes with zero errors.

---

## Agent Lenses

### Baseplate (data/schema)
- ✅ `documents` table expands existing DOC-002 definition — additive, not breaking.
- ✅ Three separate link columns (`linked_qualification_id`, `linked_deployment_id`, `linked_incident_id`) rather than a polymorphic `linked_entity_id` — cleaner joins, explicit relationships.
- ✅ `storage_path` is the canonical file reference; `file_name` is display-only.
- ✅ `ai_extracted_data` jsonb reserved for DOC-303 but not populated here.
- ✅ Soft delete via `status` column — no data loss on archive.

### Meridian (doctrine)
- ✅ Category enum aligns with ICS document types (ICS-214, ICS-225, AARs under `deployment`).
- ✅ `certification` and `training` categories map directly to NQS credential evidence requirements.
- ✅ No invented categories — each maps to a real document type responders carry.

### Lookout (UX)
- ✅ File dropzone for easy upload — drag and drop or click to browse.
- ✅ Category selector helps organize from the start. Not required to fill every field.
- ✅ Link-to-qualification prompt appears contextually when category is `certification` or `training`.
- ✅ Preview works inline — no separate window or download required for PDF/images.
- ✅ Mobile-friendly: upload from phone camera (HEIC support).

### Threshold (security)
- ✅ Private storage bucket. No public URLs.
- ✅ Signed URLs expire in 5 minutes.
- ✅ Path uses UUID, not original filename (no path traversal).
- ✅ `identification` and `medical` flagged with privacy badges.
- ✅ Staff can view, not edit or delete member documents.
- ✅ `credential_number` in linked qualifications remains masked — documents prove without exposing.

---

## Claude Code Prompt

### Context

You are adding a document library to the Grey Sky Responder Society platform. The platform is Next.js 16 (App Router, React 19, TypeScript 5, Tailwind CSS 4) backed by Supabase (PostgreSQL 16 + PostGIS + Storage). Auth is Supabase Auth (GoTrue). Brand: `--gs-navy: #0A1628`, `--gs-gold: #C5933A`, `--gs-white: #F5F5F5`. Font: Inter.

The dashboard layout (DOC-201) is built. Member profiles (DOC-202) include `user_qualifications` table with `document_id` and `verification_status` columns. Deployment records (DOC-203) are built with `deployment_records` table. The `documents` table may already exist in a minimal form from DOC-002 migrations — check existing schema and ALTER/ADD as needed rather than CREATE if it exists.

Storage abstraction exists at `src/lib/config/` (DOC-005). Use Supabase Storage client from `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/admin.ts` (server).

### Step 1: Create Migration

Create `supabase/migrations/20260413000002_documents_expansion.sql`:

```sql
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

-- Check if documents table exists; if so, alter. If not, create.
-- The safest approach: use IF NOT EXISTS for CREATE, and IF NOT EXISTS for each ADD COLUMN.

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

-- If table already existed with fewer columns, add missing ones:
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(user_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_documents_qualification ON documents(linked_qualification_id) WHERE linked_qualification_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_deployment ON documents(linked_deployment_id) WHERE linked_deployment_id IS NOT NULL;

-- updated_at trigger
CREATE TRIGGER trg_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_select ON documents FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'platform_admin'));

CREATE POLICY documents_insert ON documents FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY documents_update ON documents FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY documents_delete ON documents FOR DELETE
  USING (user_id = auth.uid());
```

### Step 2: Configure Supabase Storage

The Supabase Storage bucket `documents` needs to be created. Add to `supabase/config.toml` or create via migration/seed:

```sql
-- In seed.sql or a separate setup script:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
```

For local dev, create the bucket programmatically in a setup script or via the Supabase Studio UI. The storage RLS policy:

```sql
-- Storage RLS: users can only access their own documents folder
CREATE POLICY storage_documents_select ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY storage_documents_insert ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY storage_documents_delete ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
```

Add these to the migration file.

### Step 3: Create/Update TypeScript Types

Create or update `src/lib/types/documents.ts` with the interfaces defined in the Data Entities section above. Export all types. Add to barrel export.

### Step 4: Create Zod Validators

Create `src/lib/validators/documents.ts`:

- `documentUploadSchema` — title (optional, max 300), description (optional), category (required, enum), subcategory (optional, max 100), issuing_authority (optional, max 300), document_date (optional ISO date), expiration_date (optional ISO date), linked_qualification_id (optional uuid), linked_deployment_id (optional uuid), linked_incident_id (optional uuid)
- `documentUpdateSchema` — partial of upload schema (all optional)
- `documentFilterSchema` — category (optional enum), status (optional enum), search (optional string), page (positive int), per_page (10-50)

### Step 5: Create Server Actions

Create `src/lib/actions/documents.ts` with `'use server'`:

- `getMyDocuments(filters?)` — Query `documents` where `user_id = auth.uid()` and `status = 'active'`. Optional category and search filters. Paginated (default 20/page). Join to `user_qualifications.qualification_name` and `deployment_records` for linked entity display names. Sort by `created_at DESC`.
- `getDocumentById(id)` — Full document record. Verify ownership via RLS.
- `uploadDocument(formData: FormData)` — Extract file from FormData. Validate file type (PDF, JPEG, PNG, WebP, HEIC) and size (max 10MB). Generate storage path: `{user_id}/{uuid}.{ext}`. Upload to Supabase Storage bucket `documents`. Create DB record. Return document id.
- `updateDocument(id, data)` — Update metadata fields. Validate with `documentUpdateSchema`.
- `archiveDocument(id)` — Set `status = 'archived'`. Do NOT delete from storage (soft delete).
- `getDocumentUrl(id)` — Verify ownership. Generate Supabase Storage signed URL with 300-second expiry. Return URL.
- `linkDocumentToQualification(docId, qualId)` — Set `linked_qualification_id` on document. Update target `user_qualifications` row: set `document_id = docId` and `verification_status = 'document_linked'` (only if currently `'self_reported'`).
- `unlinkDocument(docId, linkType: 'qualification' | 'deployment' | 'incident')` — Clear the appropriate `linked_*` field. If unlinking qualification, revert qualification's `verification_status` to `'self_reported'` and clear `document_id`.

All mutations: `revalidatePath('/dashboard/documents')`.

### Step 6: Create Components

**`src/components/documents/FileDropzone.tsx`**
- Client component. Drag-and-drop zone with click-to-browse fallback.
- Accepts: PDF, JPEG, PNG, WebP, HEIC. Max 10MB.
- Shows file preview (thumbnail for images, PDF icon for PDFs) after selection.
- Error state for wrong file type or oversized file.
- Styled: dashed border, navy on hover/drag, gold accent on active drop.

**`src/components/documents/DocumentUploadForm.tsx`**
- Client component. FileDropzone at top, then metadata fields:
  - Category (required dropdown with all 9 categories, human-readable labels)
  - Title (optional text)
  - Issuing Authority (optional text — show if category is certification/training)
  - Document Date (date picker)
  - Expiration Date (date picker — show if category is certification/training/medical)
  - Description (optional textarea)
  - Link to Qualification (combo box — fetches user's qualifications, shows if category is certification/training)
  - Link to Deployment (combo box — fetches user's deployment records, shows if category is deployment)
- Submit uploads file + creates record. Redirect to document detail on success.
- Header: "Add a Document" / "Certifications, training records, ICS forms, credentials — everything that proves what you've done."

**`src/components/documents/DocumentLibrary.tsx`**
- Client component. Toggle between grid and list view.
- Filter bar: category dropdown, search input (searches title and file_name).
- Grid: `DocumentCard` components. List: `DocumentRow` components.
- Pagination.
- Empty state: "You haven't uploaded any documents yet. When you're ready, this is where your records live."

**`src/components/documents/DocumentCard.tsx`**
- Thumbnail (PDF icon or image preview), title or file_name, category badge, date, verification status badge, file size.
- Click navigates to detail page.

**`src/components/documents/DocumentRow.tsx`**
- Compact row: icon, title/filename, category badge, date, size, verification badge, linked entity name if any.
- Click navigates to detail.

**`src/components/documents/DocumentDetail.tsx`**
- Left: DocumentPreview (takes up most of width). Right (or below on mobile): metadata panel.
- Metadata: title, category, subcategory, issuing authority, dates, description, verification status, linked entities (as clickable links to qualification/deployment detail).
- Actions: Edit metadata, Link to qualification, Archive (with confirmation).
- Privacy badge for identification/medical categories.

**`src/components/documents/DocumentPreview.tsx`**
- Client component. Calls `getDocumentUrl(id)` to get signed URL.
- PDF: `<iframe>` with signed URL. Fallback: download link.
- Images (JPEG/PNG/WebP): `<img>` with signed URL.
- HEIC: download link only.
- Loading state while URL is fetched.

**`src/components/documents/DocumentLinkSelector.tsx`**
- Combo box used in upload form and detail page.
- Two modes: "qualification" (fetches `user_qualifications` for the user) and "deployment" (fetches `deployment_records`).
- Shows name/title, category/position, and existing link status.
- Returns selected entity ID.

### Step 7: Create Dashboard Pages

**`src/app/(dashboard)/dashboard/documents/page.tsx`**
- Server component. Fetches initial document list. Renders `DocumentLibrary`.
- Page title: "Your Documents"
- Breadcrumb: Dashboard > Documents

**`src/app/(dashboard)/dashboard/documents/upload/page.tsx`**
- Server component rendering `DocumentUploadForm`.
- Page title: "Add a Document"
- Breadcrumb: Dashboard > Documents > Upload

**`src/app/(dashboard)/dashboard/documents/[id]/page.tsx`**
- Server component. Fetches document by id. Renders `DocumentDetail`.
- 404 if not found or not owned by current user.
- Page title: document title or filename
- Breadcrumb: Dashboard > Documents > [title]

### Step 8: Update Dashboard Navigation

Add "Documents" to dashboard sidebar nav. Icon: `file-text` from lucide-react. Position: after Records (DOC-203), before other items. Link: `/dashboard/documents`.

### Step 9: Verify

- Run `npx supabase db reset` to apply all migrations
- Run `npm run build` — must pass with zero errors
- Verify document upload works (PDF and image)
- Verify document list/grid renders with filters
- Verify document preview works for PDF and images
- Verify linking a document to a qualification updates verification_status
- Verify unlinking reverts verification_status
- Verify signed URLs expire (not accessible after 5 minutes)
- Verify RLS prevents cross-user document access
- Verify privacy badge appears on identification/medical documents
- Verify archive (soft delete) removes from list but does not delete file

### Commit Message

```
feat: document library — upload, categorize, preview, link to qualifications and deployments (DOC-206)
```

---

*End of GSR-DOC-206*
