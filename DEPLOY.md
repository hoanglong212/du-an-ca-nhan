# Render deployment checklist

The root `render.yaml` defines two services:

- `hoanglong-api`: Node/Express web service rooted at `server/`
- `hoanglong-web`: React static site rooted at `client/`

## Required environment variables

API service:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `ADMIN_TOKEN_SECRET`
- `CORS_ORIGIN` — exact public frontend origin, without a trailing slash

Static site:

- `VITE_API_BASE_URL` — full public API origin, without a trailing slash

Do not copy a local `.env` file into Render or commit credentials to the repository. Use Render environment variables and rotate any credential that has previously appeared in Git history.

## Verification after deploy

1. Confirm `/api/health` returns `status: ok`.
2. Confirm `/api/categories` and `/api/properties?limit=1` return database-backed JSON.
3. Open the static site and verify it calls the public API rather than `localhost`.
4. Verify public property listing/detail pages and one non-sensitive contact submission.
5. Verify admin login, one reversible listing edit, image management, and enquiry status update.
6. Re-run the build, lint, backend check, and password tests from the root README.

Database schema changes are not applied automatically by the Blueprint. Apply reviewed SQL migrations separately and back up any non-demo database before a destructive migration.
