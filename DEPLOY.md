# Render deployment checklist

The root `render.yaml` defines two services:

- `hoanglong-api`: Node/Express web service rooted at `server/`
- `hoanglong-web`: React static site rooted at `client/`

## Required environment variables

API service database inputs:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

The Blueprint generates `ADMIN_TOKEN_SECRET` and configures `CORS_ORIGIN` and
`VITE_API_BASE_URL` for the expected Render service URLs.

Do not copy a local `.env` file into Render or commit credentials to the repository. Supply freshly
rotated database credentials through Render's secret-variable prompt. Any password that previously
appeared in Git history must be treated as compromised.

## Verification after deploy

1. Confirm `/api/health` returns `status: ok`.
2. Confirm `/api/categories` and `/api/properties?limit=1` return database-backed JSON.
3. Open the static site and verify it calls the public API rather than `localhost`.
4. Verify public property listing/detail pages and one non-sensitive contact submission.
5. Verify admin login, one reversible listing edit, image management, and enquiry status update.
6. Re-run the build, lint, backend check, and password tests from the root README.

Database schema changes are not applied automatically by the Blueprint. Apply reviewed SQL
migrations separately and back up any non-demo database before a destructive migration.
