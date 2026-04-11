# GSR-DOC-005: Environment Configuration

| Field | Value |
|-------|-------|
| Phase | 0 |
| Status | draft |
| Blocks on | DOC-004 |
| Priority | high |

---

## Purpose

Establish environment variable management, secrets handling, and service abstraction layers that allow the Grey Sky platform to run identically across local development, CI, staging, and production environments. This doc takes the `.env.example` stub from DOC-004 and makes it operational — defining every variable the platform needs, how secrets are managed in each environment, and how storage and email services swap between local stubs and production providers without code changes.

This matters because Grey Sky will run on Roy's ATLAS (Mac Mini) for local dev, GitHub Actions for CI, and Azure Static Web Apps for production. The same codebase must work cleanly across all three with no manual reconfiguration beyond environment variables.

---

## Data Entities

No new database entities. This doc configures access to existing entities via environment-driven service abstraction.

---

## Structure

### Files to Create or Modify

```
src/lib/config/
├── env.ts                    # Typed env var loader with runtime validation
├── storage.ts                # Storage abstraction (Supabase Storage / Azure Blob)
└── email.ts                  # Email abstraction (console / SendGrid)

.env.example                  # Updated with all vars (extends DOC-004 stub)
.env.test                     # CI-specific overrides (committed, no secrets)
```

### `src/lib/config/env.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // ── Supabase ───────────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_DB_URL: z.string().min(1),

  // ── Application ────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Grey Sky Responder Society'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // ── Stripe ─────────────────────────────────────────────────
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),

  // ── Email ──────────────────────────────────────────────────
  EMAIL_MODE: z.enum(['console', 'sendgrid']).default('console'),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_FROM_EMAIL: z.string().email().default('noreply@greysky.dev'),

  // ── Storage ────────────────────────────────────────────────
  STORAGE_MODE: z.enum(['supabase', 'azure']).default('supabase'),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  AZURE_STORAGE_CONTAINER: z.string().default('documents'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${missing}`);
  }
  return result.data;
}

// Singleton — validated once at startup
export const env = loadEnv();
```

### `src/lib/config/storage.ts`

```typescript
import { env } from './env';
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
```

### `src/lib/config/email.ts`

```typescript
import { env } from './env';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailAdapter {
  send(message: EmailMessage): Promise<{ success: boolean; messageId?: string }>;
}

function createConsoleEmail(): EmailAdapter {
  return {
    async send(message) {
      console.log('═══ EMAIL (console mode) ═══');
      console.log(`To:      ${message.to}`);
      console.log(`From:    ${message.from || env.SENDGRID_FROM_EMAIL}`);
      console.log(`Subject: ${message.subject}`);
      console.log(`Body:    ${message.html.substring(0, 200)}...`);
      console.log('═══════════════════════════');
      return { success: true, messageId: `console-${Date.now()}` };
    },
  };
}

function createSendGridEmail(): EmailAdapter {
  return {
    async send(message) {
      if (!env.SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY required when EMAIL_MODE=sendgrid');
      }
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: message.to }] }],
          from: { email: message.from || env.SENDGRID_FROM_EMAIL },
          subject: message.subject,
          content: [{ type: 'text/html', value: message.html }],
        }),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`SendGrid failed (${response.status}): ${body}`);
      }
      return {
        success: true,
        messageId: response.headers.get('x-message-id') || undefined,
      };
    },
  };
}

export function getEmail(): EmailAdapter {
  switch (env.EMAIL_MODE) {
    case 'sendgrid':
      return createSendGridEmail();
    case 'console':
    default:
      return createConsoleEmail();
  }
}
```

### Updated `.env.example`

```bash
# =============================================================================
# Grey Sky Responder Society — Environment Variables
# GSR-DOC-005: Environment Configuration
# Longview Solutions Group LLC | DBA Grey Sky Responders
#
# Copy to .env.local and fill in values from `npx supabase start` output.
# NEVER commit .env.local to version control.
# =============================================================================

# ── Supabase ─────────────────────────────────────────────────────────────────
# Local dev values from `npx supabase start` output
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres

# ── Application ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Grey Sky Responder Society"
NODE_ENV=development

# ── Stripe (test mode only until launch) ─────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_placeholder

# ── Email ────────────────────────────────────────────────────────────────────
# console = log to terminal (dev), sendgrid = live delivery (production)
EMAIL_MODE=console
SENDGRID_API_KEY=SG.placeholder
SENDGRID_FROM_EMAIL=noreply@greysky.dev

# ── Storage ──────────────────────────────────────────────────────────────────
# supabase = Supabase Storage (dev + production), azure = Azure Blob (overflow)
STORAGE_MODE=supabase
# AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;...
# AZURE_STORAGE_CONTAINER=documents
```

### `.env.test`

```bash
# =============================================================================
# Grey Sky Responder Society — CI Test Environment
# Safe to commit — contains no secrets, uses test/mock values only
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-role-key
SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=test
STRIPE_SECRET_KEY=sk_test_fake
STRIPE_WEBHOOK_SECRET=whsec_test_fake
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_fake
EMAIL_MODE=console
STORAGE_MODE=supabase
```

---

## Business Rules

1. **Startup validation is mandatory.** The `env.ts` module validates all required variables at import time. If any are missing or malformed, the application throws with a clear error listing every issue. This prevents silent failures in production.

2. **No secrets in client bundles.** Only variables prefixed with `NEXT_PUBLIC_` are available in browser code. `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `SENDGRID_API_KEY`, and `AZURE_STORAGE_CONNECTION_STRING` are server-only. The Zod schema enforces this by design — these vars exist on `env` but never on `process.env` in client components.

3. **Email defaults to console.** In development and test, `EMAIL_MODE=console` logs emails to stdout. Production sets `EMAIL_MODE=sendgrid`. The abstraction means no code changes between environments.

4. **Storage defaults to Supabase.** Azure Blob is available as a production overflow target but is not implemented in MVP. The adapter interface is defined so it can be added later without changing calling code.

5. **`.env.test` is committed.** It contains no secrets — only test/mock values that CI uses. `.env.local` is always gitignored.

---

## Copy Direction

No user-facing text in this doc. All output is developer tooling.

---

## Acceptance Criteria

1. `src/lib/config/env.ts` exists, exports typed `env` object, and throws at startup if required variables are missing
2. `src/lib/config/storage.ts` exports `getStorage()` returning a `StorageAdapter` that works with Supabase Storage
3. `src/lib/config/email.ts` exports `getEmail()` returning an `EmailAdapter` that logs to console in dev mode
4. `.env.example` contains all variables with descriptive comments
5. `.env.test` committed to repo with safe mock values
6. `npm run build` passes with valid `.env.local`
7. Starting the app with missing required env vars produces a clear error message listing all missing vars
8. No secrets appear in any committed file

---

## Agent Lenses

- **Baseplate** (data/schema): No schema changes. Config module is pure utility. Imports are clean — no circular dependencies.
- **Meridian** (doctrine): N/A — infrastructure doc, no NIMS terminology.
- **Lookout** (UX): N/A — no user-facing components.
- **Threshold** (security): Server-only secrets are never exposed to client bundles. Zod validation prevents startup with missing auth credentials. `.env.local` is gitignored. `.env.test` contains only mock values.

---

## Claude Code Prompt

```
Read CLAUDE.md and GSR-DOC-000-PLATFORM-SPEC.md first.

You are building GSR-DOC-005: Environment Configuration for the Grey Sky Responder Society platform.

CONTEXT:
- DOC-004 (Scaffolding) is complete. The project has .env.example stub, supabase/config.toml, docker-compose.yml, and full directory structure.
- Stack: Next.js 16, React 19, TypeScript 5, Supabase (Postgres + Auth + Storage), Tailwind CSS 4
- This doc adds typed env validation, storage abstraction, and email abstraction.
- Zod is already a dependency (used for validators in src/lib/validators/).

CREATE THESE FILES:

1. src/lib/config/env.ts
   - Import z from 'zod'
   - Define envSchema with all variables: NEXT_PUBLIC_SUPABASE_URL (url), NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL, NEXT_PUBLIC_APP_URL (url, default localhost:3000), NEXT_PUBLIC_APP_NAME (default "Grey Sky Responder Society"), NODE_ENV (enum dev/prod/test, default development), STRIPE_SECRET_KEY (starts with sk_), STRIPE_WEBHOOK_SECRET (starts with whsec_), NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (starts with pk_), EMAIL_MODE (enum console/sendgrid, default console), SENDGRID_API_KEY (optional), SENDGRID_FROM_EMAIL (email, default noreply@greysky.dev), STORAGE_MODE (enum supabase/azure, default supabase), AZURE_STORAGE_CONNECTION_STRING (optional), AZURE_STORAGE_CONTAINER (default "documents")
   - Export type Env = z.infer<typeof envSchema>
   - loadEnv() function: safeParse process.env, throw with formatted error on failure
   - Export const env = loadEnv() as singleton

2. src/lib/config/storage.ts
   - Import env from './env' and createClient from '@supabase/supabase-js'
   - Define StorageAdapter interface: upload(bucket, path, file: Buffer, contentType) => Promise<{url}>, getSignedUrl(bucket, path, expiresIn?) => Promise<string>, remove(bucket, path) => Promise<void>
   - createSupabaseStorage(): uses service role key, implements all three methods via supabase.storage
   - createAzureStorage(): throws "not yet implemented"
   - Export getStorage(): returns adapter based on env.STORAGE_MODE

3. src/lib/config/email.ts
   - Import env from './env'
   - Define EmailMessage interface: to, subject, html, from?
   - Define EmailAdapter interface: send(message) => Promise<{success, messageId?}>
   - createConsoleEmail(): logs formatted email to console, returns success with console-{timestamp} id
   - createSendGridEmail(): validates SENDGRID_API_KEY exists, calls SendGrid v3 API via fetch, returns success with x-message-id
   - Export getEmail(): returns adapter based on env.EMAIL_MODE

4. UPDATE .env.example — replace existing file with complete version including all vars from env.ts schema, grouped with section comments (Supabase, Application, Stripe, Email, Storage), every line with descriptive comment

5. CREATE .env.test — CI-safe file with mock values only (no real secrets), committed to repo

6. UPDATE .gitignore — ensure .env.local is listed (should already be from DOC-004, verify)

VERIFY:
- npm run build passes
- Importing env from '@/lib/config/env' in a server component works
- Remove a required var from .env.local, restart — should see formatted error
- No secrets in any committed file

COMMIT: "feat: environment config — typed env validation, storage + email abstraction (DOC-005)"
```
