# Railway Setup (Step 2)

This project is configured for Railway with `railway.json`.

## Status from local validation

- `npm run build` succeeds (this is Railway's build path).
- `npm run check` currently reports TypeScript issues in `server/replit_integrations/*` and one storage typing mismatch. These do not block Railway deploy because Railway uses `npm run build` + `npm run start`.

## 1) Create the Railway Project

1. In Railway, click **New Project**.
2. Choose **Deploy from GitHub repo**.
3. Select this repository.

Railway will detect Node.js and use:
- Build command: `npm run build`
- Start command: `npm run start`

## 2) Add a PostgreSQL Service

1. In the same Railway project, click **New** -> **Database** -> **PostgreSQL**.
2. Open your app service, then go to **Variables**.
3. Ensure `DATABASE_URL` is available in the app service (from Postgres).

## 3) Configure App Variables

In app service -> **Variables**, set:

- `OPENAI_API_KEY`
- `SESSION_SECRET`
- `GELATO_API_KEY` (optional)
- `PORT` is optional on Railway (injected automatically)

## 4) First Deploy

1. Trigger a deploy (or push to your main branch).
2. Check build logs for:
- `npm run build`
- server start log: `serving on port ...`

## 5) Step 3: Go Live + Smoke Test

After Railway deploy finishes:

1. Open your service URL from Railway (for example: `https://<service>.up.railway.app`).
2. Run these checks from terminal:

```bash
curl -i https://<service>.up.railway.app/api/settings
curl -i https://<service>.up.railway.app/api/artworks
```

Expected: both return HTTP `200`.

3. In the app UI, trigger one pipeline run from Dashboard.
4. Confirm new data appears:
- `GET /api/pipeline-runs`
- `GET /api/pipeline-runs/:id/themes`
- `GET /api/pipeline-runs/:id/artworks`

## 6) Verify Production

After deploy, open your Railway domain and verify:

- Gallery loads (`/`)
- API responds (`/api/settings`)
- Pipeline can start (`POST /api/pipeline/run` from UI)
- Database writes succeed (new pipeline runs appear)

## Notes

- On startup, the server currently runs `drizzle-kit push --force` and seed logic.
- If you want stricter migration control for production, move schema push to CI/release flow later.
