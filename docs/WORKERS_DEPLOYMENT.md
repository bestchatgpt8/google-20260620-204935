# GoogleSQL Workers Deployment

This project keeps Cloudflare Pages as the current rollback target and deploys
a parallel Workers version for validation.

## Worker

- Worker name: `googlesql-worker-prod`
- Static assets: `out/`
- Worker entry: `worker/index.ts`
- D1 binding: `GOOGLESQL_DB`
- D1 database: `googlesql`
- Custom domains in `wrangler.worker.jsonc`:
  - `googlesql.com`
  - `www.googlesql.com`

## Deploy

```bash
npm run build
npm run worker:dry-run
npm run worker:deploy
```

`AUTH_COOKIE_SECRET` must be stored as a Worker secret. `ADMIN_EMAILS` is a
plain variable in `wrangler.worker.jsonc`. Google and GitHub OAuth credentials
must be added as Worker secrets before real login works:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
```

The Worker should be validated on `*.workers.dev` before any `googlesql.com`
route is moved away from the Pages deployment.

`googlesql.com` is now served by the Worker, so keep the custom-domain routes
in `wrangler.worker.jsonc`. Removing them can make a later deploy drift away
from the currently active Cloudflare route configuration.

The `assets.run_worker_first` list must include `/admin*` and `/api/*`. Without
that setting, Cloudflare can serve `/admin.html` directly from static assets
before the Worker has a chance to enforce OAuth admin access.

## Phase 3B BigQuery Dry Run

The `Run` button calls `/api/query/dry-run`. In production this endpoint should
use a Google service account to perform a BigQuery dry-run only; it does not
execute result-producing jobs yet.

Store these as Worker secrets or environment variables:

```text
BIGQUERY_PROJECT_ID
BIGQUERY_CLIENT_EMAIL
BIGQUERY_PRIVATE_KEY
BIGQUERY_LOCATION
BIGQUERY_MAX_BYTES_BILLED
```

`BIGQUERY_PRIVATE_KEY` should be the PKCS#8 private key from the service account
JSON. Escaped `\n` line breaks are supported. If the BigQuery values are not
configured, the endpoint returns `mode: "simulated"` and keeps the public demo
available while clearly labeling that no live BigQuery call was made.

Recommended service-account permissions:

- BigQuery Job User on the billing/project where jobs are created.
- Read permissions for datasets that should be available to GoogleSQL.com.

After changing D1 schema or Worker secrets, validate:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run worker:dry-run
npm run worker:deploy
```
