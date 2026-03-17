# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

pnpm workspaces monorepo (`pnpm-workspace.yaml`) with two packages:

- `frontend/` — Next.js 16 + React 19, App Router, Tailwind CSS v4, TypeScript
- `backend/` — NestJS 11, TypeScript, Express platform

Package names: `@lead-tracker/frontend`, `@lead-tracker/backend`

## Commands

Run from the **root** unless noted otherwise. Always use `pnpm`.

### Development
```bash
pnpm dev          # Next.js frontend (port 3000)
pnpm dev:backend  # NestJS backend (port 3000 by default — likely needs different port)
pnpm dev:all      # Both simultaneously via concurrently
```

### Build
```bash
pnpm build        # Build both packages
```

### Lint
```bash
pnpm lint         # Lint both packages
```

### Backend tests
```bash
pnpm test                                              # Unit tests
pnpm --filter @lead-tracker/backend test:watch        # Watch mode
pnpm --filter @lead-tracker/backend test:cov          # Coverage
pnpm --filter @lead-tracker/backend test:e2e          # E2E tests
```

To run a single test file:
```bash
cd backend && pnpm exec jest src/path/to/file.spec.ts
```

### Install dependencies
```bash
pnpm install                                          # All workspaces
pnpm --filter @lead-tracker/frontend add <pkg>        # Frontend only
pnpm --filter @lead-tracker/backend add <pkg>         # Backend only
pnpm --filter @lead-tracker/frontend add -D <pkg>     # Frontend devDep
```

## Architecture

### Frontend (`frontend/src/app/`)
Uses Next.js App Router. Pages are in `src/app/` — `layout.tsx` wraps all pages, `page.tsx` is the root route. Path alias `@/*` maps to `src/*`. Styling via Tailwind CSS v4 (`@import "tailwindcss"` syntax, not `@tailwind` directives).

### Backend (`backend/src/`)
Standard NestJS module structure: each feature has a `*.module.ts`, `*.controller.ts`, `*.service.ts`, and `*.repository.ts`. Entry point is `main.ts` → bootstraps `AppModule`. Compiled output goes to `backend/dist/`.

Backend TypeScript uses `"module": "nodenext"` — imports must use explicit file extensions (`.js`) when importing local files.

### Database (`backend/src/database/`)
Drizzle ORM with `postgres` (postgres.js) driver. `schema.ts` is the single source of truth for all table definitions and inferred TypeScript types. `DrizzleModule` is `@Global()` — imported once in `AppModule`, provides `DRIZZLE_TOKEN` everywhere.

Migrations live in `backend/drizzle/`. Run with:
```bash
pnpm --filter @lead-tracker/backend db:generate   # generate SQL from schema changes
pnpm --filter @lead-tracker/backend db:migrate    # apply migrations
pnpm --filter @lead-tracker/backend db:studio     # open Drizzle Studio
```

### Repository pattern
Each feature module owns its repository (`*.repository.ts`). Repositories are the **only** place that use Drizzle APIs directly — they inject `DRIZZLE_TOKEN`. Services inject repositories, not Drizzle. Controllers inject services only.

```
Controller → Service → Repository → DRIZZLE_TOKEN (db) → PostgreSQL
```

Type flow: `schema.ts` → `$inferSelect` / `$inferInsert` types → repository → service → controller.

### Code style (backend)
Prettier enforced: single quotes, trailing commas. ESLint extends `typescript-eslint` recommended with `@typescript-eslint/no-explicit-any` off.
