# GSR-DOC-006: CI/CD Pipeline

| Field | Value |
|-------|-------|
| Phase | 0 |
| Status | draft |
| Blocks on | DOC-004 |
| Priority | normal |

---

## Purpose

Establish the automated build, test, and deployment pipeline for the Grey Sky Responder platform using GitHub Actions. Every push to `main` triggers lint, type-check, and build verification. Pull requests run the same checks plus any future test suites. Production deploys to Azure Static Web Apps on merge to `main`.

This is the last Phase 0 foundation doc. Once DOC-005 (env config) and DOC-006 (CI/CD) are complete, the infrastructure layer is finished and all Phase 2+ builds have automated quality gates.

---

## Data Entities

No database entities. This doc creates GitHub Actions workflow files and supporting configuration only.

---

## Structure

### Files to Create

```
.github/
├── workflows/
│   ├── ci.yml                # Lint + type-check + build on every push/PR
│   └── deploy.yml            # Azure Static Web Apps deployment on main
├── CODEOWNERS                # Roy owns everything
└── pull_request_template.md  # PR checklist

next.config.ts                # Update: add output: 'standalone' for Azure
```

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    name: Lint, Type-Check, Build
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type-check
        run: npx tsc --noEmit

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://localhost:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ci-placeholder
          SUPABASE_SERVICE_ROLE_KEY: ci-placeholder
          SUPABASE_DB_URL: postgresql://postgres:postgres@localhost:54322/postgres
          NEXT_PUBLIC_APP_URL: http://localhost:3000
          STRIPE_SECRET_KEY: sk_test_ci_placeholder
          STRIPE_WEBHOOK_SECRET: whsec_ci_placeholder
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_ci_placeholder
          EMAIL_MODE: console
          STORAGE_MODE: supabase
```

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    name: Build and Deploy
    runs-on: ubuntu-latest
    timeout-minutes: 15
    # Only deploy from the main branch, not PRs
    if: github.event_name == 'push'

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
          STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_WEBHOOK_SECRET }}
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY }}
          EMAIL_MODE: sendgrid
          SENDGRID_API_KEY: ${{ secrets.SENDGRID_API_KEY }}
          STORAGE_MODE: supabase

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: upload
          app_location: /
          output_location: .next
          skip_app_build: true
```

### `.github/CODEOWNERS`

```
# Grey Sky Responder Society — Code Ownership
# All changes require Roy's review
* @roydunn
```

### `.github/pull_request_template.md`

```markdown
## What this PR does

<!-- Brief description of changes -->

## Design Doc Reference

GSR-DOC-___

## Checklist

- [ ] `npm run lint` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes
- [ ] Tested locally against Supabase
- [ ] No Vercel-specific dependencies added
- [ ] No secrets in committed files
- [ ] Acceptance criteria from design doc met
```

---

## Business Rules

1. **Every push to `main` runs CI.** No exceptions. If lint, type-check, or build fails, the commit is marked as failed in GitHub. This protects against broken builds reaching production.

2. **CI uses placeholder env vars.** The CI build verifies that code compiles and types check — it does not run against a real Supabase instance. The DOC-005 env validation is designed to accept these placeholders for build purposes.

3. **Deploy only on push to `main`.** Pull requests run CI checks but do not deploy. Only merged code reaches Azure.

4. **Secrets live in GitHub Actions secrets.** Production Supabase URL, keys, Stripe keys, SendGrid API key, and Azure deployment token are stored as GitHub repository secrets. Never in code, never in committed files.

5. **Concurrency control.** Multiple pushes to the same branch cancel in-progress CI runs. This prevents queue buildup during rapid iteration.

6. **10-minute timeout on CI, 15 on deploy.** If a build hangs, it fails cleanly rather than consuming runner minutes.

7. **CODEOWNERS set to Roy.** All PRs require Roy's approval. This is a single-operator project — the gate is intentional.

---

## Copy Direction

No user-facing text. Developer tooling only.

---

## Acceptance Criteria

1. `.github/workflows/ci.yml` exists and triggers on push/PR to `main`
2. `.github/workflows/deploy.yml` exists and triggers on push to `main` only
3. CI workflow runs: `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build` in sequence
4. Deploy workflow uses GitHub secrets for all env vars (no hardcoded secrets)
5. `.github/CODEOWNERS` assigns Roy as owner
6. `.github/pull_request_template.md` includes design doc reference and checklist
7. Pushing to `main` triggers both CI and deploy workflows
8. A PR with a TypeScript error fails CI before merge

---

## Agent Lenses

- **Baseplate** (data/schema): N/A — no schema changes.
- **Meridian** (doctrine): N/A — infrastructure doc.
- **Lookout** (UX): N/A — no user-facing components.
- **Threshold** (security): All secrets managed via GitHub Actions secrets. No secrets in committed files. Deploy workflow only fires on push to main (not PRs from forks). Azure deployment token is a repository secret.

---

## Claude Code Prompt

```
Read CLAUDE.md first.

You are building GSR-DOC-006: CI/CD Pipeline for the Grey Sky Responder Society platform.

CONTEXT:
- DOC-004 (Scaffolding) and DOC-005 (Env Config) are complete.
- Stack: Next.js 16, React 19, TypeScript 5, Supabase, Tailwind CSS 4
- Hosting: Azure Static Web Apps (NOT Vercel)
- GitHub org: greyskyresponder, repo: grey-sky-site
- Roy is the sole developer/reviewer

CREATE THESE FILES:

1. .github/workflows/ci.yml
   - Triggers: push to main, pull_request to main
   - Concurrency: cancel in-progress runs on same ref
   - Single job "check" on ubuntu-latest, timeout 10 min
   - Steps: checkout (v4), setup-node (v4, node 22, cache npm), npm ci, npm run lint, npx tsc --noEmit, npm run build
   - Build step uses placeholder env vars (not secrets): NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321, NEXT_PUBLIC_SUPABASE_ANON_KEY=ci-placeholder, SUPABASE_SERVICE_ROLE_KEY=ci-placeholder, SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres, NEXT_PUBLIC_APP_URL=http://localhost:3000, STRIPE_SECRET_KEY=sk_test_ci_placeholder, STRIPE_WEBHOOK_SECRET=whsec_ci_placeholder, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_ci_placeholder, EMAIL_MODE=console, STORAGE_MODE=supabase

2. .github/workflows/deploy.yml
   - Triggers: push to main only
   - Single job "deploy" on ubuntu-latest, timeout 15 min
   - Condition: github.event_name == 'push'
   - Steps: checkout, setup-node, npm ci, npm run build (with all env vars from GitHub secrets using ${{ secrets.VAR_NAME }} syntax), Azure/static-web-apps-deploy@v1 action (app_location: /, output_location: .next, skip_app_build: true, azure_static_web_apps_api_token from secrets)

3. .github/CODEOWNERS
   - Single line: * @roydunn

4. .github/pull_request_template.md
   - Sections: What this PR does (comment placeholder), Design Doc Reference (GSR-DOC-___), Checklist with checkboxes: lint passes, tsc passes, build passes, tested locally, no Vercel deps, no secrets, acceptance criteria met

VERIFY:
- All YAML files are valid (no syntax errors)
- No secrets or real keys appear in any committed file
- ci.yml triggers on both push and pull_request
- deploy.yml triggers ONLY on push

COMMIT: "feat: CI/CD pipeline — GitHub Actions for lint, build, Azure deploy (DOC-006)"
```
