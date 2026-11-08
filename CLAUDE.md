@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

P011 Ai Email — single-tenant AI email composer + campaign tool. Next.js 16 + Prisma 7 + SQLite, sends mail via Resend. Companion to P010 Ai CRM (consumes contacts via `CRM_APP_URL`). LCF revenue project.

Status: **PLANNING** — scaffolded. Routes for `/compose`, `/campaigns`, `/templates`, `/analytics` exist; not yet deployed.

## Commands

```bash
npm run dev      # next dev --webpack --port 3001 (NOT 3000 — avoids collision with P010 Ai CRM)
npm run build    # next build
npm run start    # next start
npm run lint     # eslint
npx prisma generate
npx prisma db push          # SQLite — no migrations dir, just push
npx prisma studio
node --import tsx prisma/seed.mjs   # seed script (note .mjs, not .ts like P010)
```

## Architecture

- **Next.js 16.2.1** App Router (`src/app/`), React 19.2.4
- **Prisma 7.5** with `prisma-client` provider; output to `src/generated/prisma/`
- **SQLite via libsql** — `@prisma/adapter-libsql` + `@libsql/client` (Turso-compatible). `dev.db` is the local file
- **Resend** (`resend` SDK) for transactional + campaign email delivery
- **Anthropic SDK** for AI features (subject/body generation, tone adjustment, template authoring — `Email.tone`, `Template.isAiGenerated`)
- **Tailwind v4** via `@tailwindcss/postcss`

### Data Model (3 tables)

| Model | Purpose |
|---|---|
| `Email` | subject, body, tone, status (`draft`/`sent`), `sentAt`, `opened`/`openedAt`, denormalized `crmContactId` + `contactName` + `contactEmail` (CRM lookup is by URL, not FK), optional FK → Campaign + `templateId` |
| `Campaign` | name, description, status (`draft`/`active`/`done`), `templateId`, has-many Email |
| `Template` | name, subject, body, category, variables (JSON-string), `isAiGenerated` |

CUID string IDs. Contact relationship is intentionally NOT a Prisma FK — emails reference CRM contacts by ID stored as a string, since the CRM lives in a separate database (P010). Cross-app sync happens via HTTP (`CRM_APP_URL`).

### Routes (current scaffold)

`/compose`, `/campaigns`, `/templates`, `/analytics`, `/api/*`.

## Environment

Required in `.env`:
- `DATABASE_URL` — SQLite file path or Turso URL
- `DATABASE_AUTH_TOKEN` — Turso auth token
- `ANTHROPIC_API_KEY` — for AI features
- `RESEND_API_KEY` — for sending mail
- `RESEND_FROM_EMAIL` — verified sender address
- `RESEND_REPLY_TO` — Reply-To header
- `CRM_APP_URL` — base URL of P010 Ai CRM (to fetch contact lists)
- `NEXT_PUBLIC_APP_URL` — own public URL (used in tracking links)

## Cross-app integration

P011 (Email) is paired with [P010 Ai CRM](../P010%20Ai%20CRM/CLAUDE.md). Emails reference CRM contacts via stored `crmContactId` (string, not FK) plus a snapshot of `contactName`/`contactEmail` so historical email rows survive contact deletion in the CRM. The multi-tenant fusion of both apps is [P012 Ai SaaS](../P012%20Ai%20SaaS/CLAUDE.md) — there the same Email/Campaign/Template tables exist but are scoped by `org_id` and Contact is a real FK relation.

## Conventions

- IDs: CUID strings (`@default(cuid())`)
- Email status flow: `draft` → `sent` → (`opened` flips when Resend webhook fires)
- Variables on Template are JSON arrays as strings (SQLite — no native JSON)
