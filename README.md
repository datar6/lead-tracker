# Lead Tracker

A full-stack CRM-style lead management app. Create and manage sales leads, filter and search them, track statuses, and add comments.

**Stack:** NestJS 11 · Next.js 16 · Drizzle ORM · PostgreSQL 17 · Tailwind CSS 4 · TypeScript

---

## 1. Running locally

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- [Docker](https://www.docker.com/) (for PostgreSQL)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start the database
docker compose up -d

# 3. Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Run migrations
pnpm --filter @lead-tracker/backend db:migrate

# 5. Start both servers (frontend :3000, backend :3001)
pnpm dev:all
```

Or start them separately:

```bash
pnpm dev           # Next.js frontend → http://localhost:3000
pnpm dev:backend   # NestJS backend  → http://localhost:3001
```

---

## 2. Environment variables

### `backend/.env.example`

| Variable       | Description                          | Example                                                    |
|----------------|--------------------------------------|------------------------------------------------------------|
| `PORT`         | Port the NestJS server listens on    | `3001`                                                     |
| `DATABASE_URL` | PostgreSQL connection string         | `postgresql://lead_tracker:lead_tracker@localhost:5432/lead_tracker` |

### `frontend/.env.example`

| Variable               | Description                        | Example                        |
|------------------------|------------------------------------|--------------------------------|
| `NEXT_PUBLIC_API_URL`  | Base URL of the NestJS backend     | `http://localhost:3001`        |

---

## 3. Verifying the API

Swagger UI is available at:

```
http://localhost:3001/api/docs
```

### Quick endpoint examples

**List leads** (with pagination, search, filter):
```bash
curl "http://localhost:3001/api/leads?page=1&limit=10&q=john&status=NEW"
```

**Create a lead:**
```bash
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","status":"NEW"}'
```

**Add a comment to a lead:**
```bash
curl -X POST http://localhost:3001/api/leads/<lead-id>/comments \
  -H "Content-Type: application/json" \
  -d '{"text":"Follow up scheduled for Friday."}'
```

**Get lead details:**
```bash
curl http://localhost:3001/api/leads/<lead-id>
```

**Update lead status:**
```bash
curl -X PATCH http://localhost:3001/api/leads/<lead-id> \
  -H "Content-Type: application/json" \
  -d '{"status":"CONTACTED"}'
```

---

## 4. Build & production

```bash
# Build both packages
pnpm build

# Start backend in production mode
pnpm --filter @lead-tracker/backend start:prod

# Start frontend in production mode
pnpm --filter @lead-tracker/frontend start
```

Or run everything via Docker Compose (includes the database):

```bash
docker compose up --build
```
