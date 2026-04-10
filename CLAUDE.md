# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Express + Vite HMR) on port 5000
npm run build      # Bundle client (Vite) + server (esbuild) into dist/
npm run start      # Run production build
npm run check      # TypeScript type checking
npm run db:push    # Push Drizzle schema changes to PostgreSQL
```

## Architecture

This is a **news-to-abstract-art pipeline** app. A background async pipeline transforms RSS news into AI-generated abstract artwork, stored and displayed in a gallery. Artworks can optionally be published to a **Gelato** print-on-demand store as T-shirt product listings.

### Layer Overview

```
client/          React + Wouter SPA (gallery, dashboard, settings)
server/          Express REST API + pipeline orchestration
server/pipeline/ Step-by-step AI processing pipeline
shared/          Drizzle schema + Zod types shared by both sides
```

### Client (React)

- Entry: `client/src/main.tsx` → `client/src/App.tsx`
- Router: Wouter with 4 routes: `/` (gallery), `/artwork/:id`, `/dashboard`, `/settings`
- Server state: TanStack Query — all API calls go through query hooks
- UI: Shadcn/UI (Radix primitives) + Tailwind CSS

### Server (Express)

- Entry: `server/index.ts` — registers routes, pushes DB schema on startup, serves Vite in dev
- Routes: `server/routes.ts` — all REST endpoints under `/api/*`
- Pipeline trigger: `POST /api/pipeline/run` — starts pipeline async, returns `runId` immediately
- `server/storage.ts` — all database CRUD operations
- `server/gelato.ts` — Gelato API client
- `server/seed.ts` — seed data for demo

### API Endpoints

```
GET  /api/artworks                      # All published artworks (imageData excluded)
GET  /api/artworks/:id                  # Single artwork with theme and news (imageData excluded)
GET  /api/artwork-image/:id             # Serve artwork image as PNG (with caching headers)
GET  /api/pipeline-runs                 # All pipeline runs
GET  /api/pipeline-runs/:id/themes      # Themes for a run
GET  /api/pipeline-runs/:id/artworks    # Artworks for a run (imageData excluded)
GET  /api/pipeline-runs/:id/news        # News items for a run
POST /api/pipeline/run                  # Trigger new pipeline run
GET  /api/settings                      # Style configuration
PUT  /api/settings                      # Update style configuration
POST /api/gelato/create-product         # Create a product listing in Gelato from an artwork
```

### Pipeline (`server/pipeline/`)

Coordinated by `server/pipeline/orchestrator.ts`. Steps run sequentially, updating `pipelineRun.status` as they go:

1. **ingestion.ts** — Fetches RSS feeds, stores `NewsItem` records (`ingesting`)
2. **analysis.ts** — OpenAI extracts 5 abstract themes from headlines, 3 retries with 3s delay (`analyzing`)
3. Selection — picks the highest-scoring safe theme, marks it in DB
4. **artist.ts** — Generates image via `generateImageBuffer()` from `replit_integrations` (`generating`)
5. **publisher.ts** — OpenAI generates caption, rationale, hashtags (`publishing`)
6. Completion — marks artwork published, run status → `completed`

On any failure: status → `failed`, error stored on the run.

### Database (PostgreSQL + Drizzle ORM)

Schema defined in `shared/schema.ts`. Key tables:

- `pipelineRuns` — one record per pipeline execution, tracks status + timestamps
- `newsItems` → `pipelineRuns` (many-to-one)
- `themes` → `pipelineRuns` (many-to-one); one theme gets `selected = true`
- `artworks` → `pipelineRuns` + `themes`; stores base64 image data + caption

### Image Storage

- Images stored as base64 in the `image_data` column of the `artworks` table
- Served via `GET /api/artwork-image/:id` as PNG with caching headers
- `imageData` is stripped from all JSON API responses to keep payloads small
- Legacy seed artworks use static files in `client/public/artworks/seed/`

### Gelato Integration

Artworks can be sent to a Gelato store as T-shirt product listings.
- Requires `GELATO_API_KEY` + `gelatoStoreId` / `gelatoTemplateId` in Settings
- Image URL passed to Gelato is constructed from the request host (works on deployed app)
- "Send to Gelato" button appears on the gallery hero, archive cards, and artwork detail page
- Server-side client: `server/gelato.ts`

### Settings

Style/pipeline config is persisted to `data/style_config.json` (not the DB). Fields include `rssSources`, `artistName`, `negativePrompt`, `compositionMotifs`, `allowedColors`, `bannedColors`, `gelatoStoreId`, `gelatoTemplateId`.

## Environment Variables

```env
DATABASE_URL=postgresql://...          # Required
OPENAI_API_KEY=sk-...                  # Standard key (preferred locally)
# OR on Replit:
# AI_INTEGRATIONS_OPENAI_API_KEY=...
# AI_INTEGRATIONS_OPENAI_BASE_URL=...
GELATO_API_KEY=...                     # Optional, for product creation
SESSION_SECRET=...                     # Session security
PORT=5000                              # Optional, defaults to 5000
```

## Replit Integration

The `server/replit_integrations/` and `client/replit_integrations/` directories contain Replit-managed modules for image generation, chat, audio, and batch processing. These use Replit-specific env vars (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`). When running locally, replace these with a standard `OPENAI_API_KEY` and remove the `baseURL` override.
