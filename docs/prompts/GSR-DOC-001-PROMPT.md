# Claude Code Prompt — GSR-DOC-001: Backend Foundation + Schema + Seeds

Read `CLAUDE.md` first, then `docs/design/GSR-DOC-000-PLATFORM-SPEC.md` for the canonical schema definitions.

---

## TASK

Build the backend foundation, complete database schema, and seed data for the Grey Sky Responder platform. This is Phase 2 — the data layer everything else depends on.

Execute these steps in order. Commit after each major section.

---

## STEP 1: Backend Project Structure

Create `/backend` with Express.js + TypeScript:

```
/backend
  /src
    /routes/index.ts        — health check route only for now
    /middleware/             — empty directory with index.ts stub
    /services/              — empty directory with index.ts stub
    /models/                — TypeScript interfaces (all DB entities)
    /migrations/            — node-pg-migrate migration files
    /seeds/                 — seed scripts
    server.ts               — Express app entry
  tsconfig.json
  package.json
  .env.example
```

**package.json dependencies:**
- express, cors, helmet
- pg, node-pg-migrate
- zod (for validation)
- dotenv
- typescript, @types/express, @types/node, @types/pg, tsx (dev)

**tsconfig.json:** strict mode, ES2022 target, NodeNext module resolution.

**server.ts:** Basic Express setup with:
- Helmet middleware
- CORS (configurable origin)
- JSON body parser
- Health check at `GET /api/health`
- Port from env (default 3001)

**.env.example:**
```
# Database
DATABASE_URL=postgres://greysky:greysky@localhost:5432/greysky
POSTGRES_USER=greysky
POSTGRES_PASSWORD=greysky
POSTGRES_DB=greysky

# Backend
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

# Frontend
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Future
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENDGRID_API_KEY=
AZURE_STORAGE_CONNECTION_STRING=
```

**Commit:** `feat: backend foundation — Express.js + TypeScript project structure`

---

## STEP 2: Docker Compose

Create `docker-compose.yml` at project root:

```yaml
services:
  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-greysky}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-greysky}
      POSTGRES_DB: ${POSTGRES_DB:-greysky}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U greysky"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgres://greysky:greysky@db:5432/greysky
      PORT: 3001
      CORS_ORIGIN: http://localhost:3000
      NODE_ENV: development
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    depends_on:
      - backend

volumes:
  pgdata:
```

Create `backend/Dockerfile`:
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npx", "tsx", "src/server.ts"]
```

Create `Dockerfile.frontend`:
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
```

**Commit:** `feat: docker-compose — PostgreSQL 16, backend, frontend services`

---

## STEP 3: TypeScript Models

Create `/backend/src/models/` with interfaces matching every entity in the platform spec. Create one file per domain:

**`user.ts`** — User, Organization, UserOrganization
**`deployment.ts`** — Incident, Position, DeploymentRecord, ValidationRequest, EvaluationRequest
**`economy.ts`** — SkyPointsLedgerEntry (transaction types: membership_credit, purchase, spend, refund, admin_adjustment, sponsor_credit)
**`documents.ts`** — Document, CertificationPathway, UserCertification
**`srt-cap.ts`** — SrtCapEngagement, SrtCapSelfAssessment, SrtCapSaSection, SrtCapSiteAssessment, SrtCapReport, SrtCapReportSection, SrtCapTeamMember
**`community.ts`** — Affinity, UserAffinity
**`audit.ts`** — AuditLogEntry
**`index.ts`** — re-exports all

Use the exact column names, types, and enums from GSR-DOC-000 Section 3. Every enum should be a TypeScript union type. Every nullable field should use `| null`.

**Commit:** `feat: TypeScript models — all platform entities with strict typing`

---

## STEP 4: Database Migration

Create a single comprehensive migration file at `backend/src/migrations/001_initial_schema.sql`.

Use the schema from GSR-DOC-000 Section 3 EXACTLY. Every table, every column, every type, every constraint.

Key requirements:
- Use `gen_random_uuid()` for all UUID defaults (requires pgcrypto)
- All `TIMESTAMPTZ` with `DEFAULT now()` where specified
- CHECK constraints on all enum columns
- Foreign key constraints with appropriate ON DELETE behavior
- All indexes listed in GSR-DOC-000 (foreign keys, unique constraints, composite indexes)

**Critical triggers:**

```sql
-- Prevent modifications to sky_points_ledger
CREATE OR REPLACE FUNCTION prevent_ledger_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'sky_points_ledger is append-only. UPDATE and DELETE are prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sky_points_no_update
  BEFORE UPDATE ON sky_points_ledger
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

CREATE TRIGGER trg_sky_points_no_delete
  BEFORE DELETE ON sky_points_ledger
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

-- Same for audit_log
CREATE TRIGGER trg_audit_log_no_update
  BEFORE UPDATE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

CREATE TRIGGER trg_audit_log_no_delete
  BEFORE DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Apply `set_updated_at` trigger to: users, organizations, user_organizations, deployment_records, srt_cap_engagements, srt_cap_self_assessments, srt_cap_sa_sections, srt_cap_site_assessments, srt_cap_report_sections.

Also create `backend/src/migrations/run.ts` — a script that reads migration files and applies them via pg client, tracking applied migrations in a `schema_migrations` table.

**Do NOT modify the existing `supabase/schema.sql`** — leave it for reference. The new schema lives entirely in `/backend/src/migrations/`.

**Commit:** `feat: database schema — all entities, indexes, constraints, append-only triggers`

---

## STEP 5: Seed Data

Create `backend/src/seeds/` with these scripts:

### `001_positions.ts`
Seed the `positions` table with:

**Standard ICS Positions** (Type 1-4 where applicable):
- Command Staff: Incident Commander, Deputy IC, Safety Officer, Public Information Officer, Liaison Officer
- Operations: Operations Section Chief, Division Supervisor, Group Supervisor, Branch Director, Task Force Leader, Strike Team Leader
- Planning: Planning Section Chief, Situation Unit Leader, Resources Unit Leader, Documentation Unit Leader, Demobilization Unit Leader
- Logistics: Logistics Section Chief, Supply Unit Leader, Facilities Unit Leader, Ground Support Unit Leader, Communications Unit Leader, Food Unit Leader, Medical Unit Leader
- Finance/Admin: Finance Section Chief, Time Unit Leader, Procurement Unit Leader, Compensation/Claims Unit Leader, Cost Unit Leader

Each position gets Type 1 through Type 4 entries with `nims_type`, `complexity_level`, and `resource_category`.

**RTLT Position Qualifications** — read from `references/FEMA_RTLT_NQS_Database.json`:
- Filter for `record_type === "position_qualifications"` (328 records)
- Map each to a `positions` row: use `fema_id` as `rtlt_code`, `name` as `title`, `resource_category` as `resource_category`, extract discipline from category, store `type_levels` and requirements in `requirements_json`

### `002_affinities.ts`
Seed the `affinities` table:

**Hazard types** (category: `hazard_type`):
Hurricane, Tornado, Flood, Earthquake, Wildfire, HazMat Release, Structural Collapse, Mass Casualty, Pandemic, Radiological, Terrorism, Cyber, Dam/Levee Failure

**Functional specialties** (category: `functional_specialty`):
Incident Command, Operations, Planning, Logistics, Finance/Admin, Emergency Communications, Damage Assessment, Mass Care, Evacuation, Search & Rescue, Law Enforcement, Fire Suppression, EMS, Public Health, Environmental Response

**Sector experience** (category: `sector_experience`):
Federal, State, County, Municipal, Tribal, Private Sector, NGO/Voluntary, Military, International

### `003_srt_disciplines.ts`
Seed 13 SRT disciplines as affinities (category: `srt_discipline`) and also populate reference data:
1. Urban Search & Rescue (US&R)
2. Swiftwater/Flood Rescue Team (SWFRT)
3. Hazardous Materials (HazMat)
4. Special Weapons and Tactics (SWAT)
5. Bomb Squad
6. Waterborne Search & Rescue
7. Land Search & Rescue
8. Small Unmanned Aircraft Systems (sUAS)
9. Rotary Wing Search & Rescue
10. Animal Rescue/SAR
11. Incident Management Teams (IMT)
12. EOC Management Support Teams
13. Public Safety Dive Teams

### `run-seeds.ts`
Script that executes all seed files in order against the database, with idempotency (check before insert, use ON CONFLICT DO NOTHING).

Create `package.json` scripts:
```json
{
  "scripts": {
    "dev": "tsx src/server.ts",
    "build": "tsc",
    "migrate": "tsx src/migrations/run.ts",
    "seed": "tsx src/seeds/run-seeds.ts",
    "setup": "npm run migrate && npm run seed"
  }
}
```

**Commit:** `feat: seed data — ICS positions, RTLT qualifications, SRT disciplines, affinities`

---

## STEP 6: Verify Everything Works

1. Run `cd backend && npm install`
2. Run `npm run build` — must pass with zero TypeScript errors
3. Run `cd .. && npm run build` — frontend must still build clean
4. Verify the migration SQL is syntactically valid
5. Verify all TypeScript model interfaces match the migration schema exactly (same column names, same types)

**Commit:** `chore: verify build — backend + frontend clean`

Push all commits to `main`.

---

## CONSTRAINTS

- **Azure, not Vercel** — do not use Vercel-specific features. The frontend deploys to Azure Static Web Apps.
- **Supabase for Postgres** — we use Supabase-hosted PostgreSQL. The migration files should be compatible with Supabase (standard PostgreSQL, pgcrypto extension). No proprietary pg extensions beyond pgcrypto.
- **Leave existing frontend alone** — do not modify any files in `src/` (the Next.js app). This phase is backend only.
- **Leave `supabase/schema.sql` in place** — it's the old schema, kept for reference.
- **Do not create API route implementations** — just the directory structure and stubs. API routes are Phase 3+.
- **Every model interface must exactly match the migration** — if the migration says `membership_status` is `enum[active/expired/none]`, the TypeScript type must be `'active' | 'expired' | 'none'`.
