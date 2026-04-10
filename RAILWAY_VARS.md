# Railway Variables (Copy Checklist)

Set these in Railway -> Service -> Variables:

Required:
- DATABASE_URL (from Railway Postgres)
- OPENAI_API_KEY
- SESSION_SECRET

Optional:
- GELATO_API_KEY

Notes:
- Do not set PORT manually unless you have a special need; Railway injects it.
- Generate SESSION_SECRET with a long random value.
