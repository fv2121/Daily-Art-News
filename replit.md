# Daily AI Artist

## Overview
An automated daily pipeline that transforms news headlines into unique abstract artwork using AI. The system fetches RSS news, extracts abstract themes via OpenAI, generates artwork using gpt-image-1, and publishes to a web gallery.

## Tech Stack
- **Frontend**: React + TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion, Wouter routing, TanStack Query
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI (gpt-5-mini for theme extraction & captions, gpt-image-1 for art generation) via Replit AI Integrations
- **News**: RSS Parser for feed ingestion

## Project Structure
```
client/src/
  pages/gallery.tsx         - Public gallery with hero + archive grid (images link to detail)
  pages/artwork-detail.tsx  - Artwork detail page (full image, rationale, theme, news)
  pages/dashboard.tsx       - Pipeline dashboard (run, view themes, artworks)
  pages/settings.tsx        - Configure RSS sources, art style, safety rules
  components/app-sidebar.tsx - Navigation sidebar
  components/theme-toggle.tsx - Dark/light mode toggle
  lib/theme-provider.tsx    - Theme context provider

server/
  index.ts                  - Express server entry point
  routes.ts                 - API routes
  storage.ts                - Database CRUD operations
  db.ts                     - PostgreSQL connection via Drizzle
  seed.ts                   - Seed data for demo
  settings.ts               - Style config persistence (JSON file)
  pipeline/
    orchestrator.ts         - Main pipeline runner
    ingestion.ts            - RSS feed fetching
    analysis.ts             - OpenAI theme extraction
    artist.ts               - Art generation via gpt-image-1
    publisher.ts            - Caption generation

shared/schema.ts            - Drizzle schema (users, pipelineRuns, newsItems, themes, artworks)
data/style_config.json      - Persisted settings
```

## Key API Endpoints
- `GET /api/artworks` - All published artworks
- `GET /api/artworks/:id` - Single artwork with theme and news
- `GET /api/pipeline-runs` - All pipeline runs
- `GET /api/pipeline-runs/:id/themes` - Themes for a run
- `GET /api/pipeline-runs/:id/artworks` - Artworks for a run
- `GET /api/pipeline-runs/:id/news` - News items for a run
- `POST /api/pipeline/run` - Trigger new pipeline run
- `GET/PUT /api/settings` - Style configuration

## Pipeline Flow
1. **Ingest** - Fetch headlines from configured RSS feeds
2. **Analyze** - Extract 5 abstract themes via OpenAI
3. **Select** - Pick top-scoring safe theme
4. **Generate** - Create artwork via gpt-image-1
5. **Publish** - Generate caption + hashtags, mark as published

## Running
- `npm run dev` starts both frontend and backend
- Frontend on port 5000
- Database schema managed via `npm run db:push`
