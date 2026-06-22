# GoogleSQL.com Phase 3 Plan

## Goal

Move admin controls from static Phase 2 state into a protected Cloudflare
runtime path: signed OAuth sessions, administrator RBAC, D1 persistence, audit
logging, and API-backed rollout controls.

## Phase 3A Scope

- OAuth callback assigns `admin` or `member` using `ADMIN_EMAILS`.
- `/api/auth/session` returns the user's public role.
- `/admin` is locked behind `/api/admin/state`; unauthenticated users receive
  `401`, signed-in non-admin users receive `403`.
- Cloudflare D1 binding `GOOGLESQL_DB` stores users, feature flags, workspaces,
  run review queue entries, and audit events.
- `/api/admin/feature-flags/:id` persists rollout updates and writes an audit
  event.
- `/api/admin/rollback` records rollback requests in the audit log.
- If D1 is not bound, `/admin` clearly enters seed preview mode and mutations
  return `storage_not_configured`.

## Phase 3B Scope

- `/api/query/dry-run` accepts generated GoogleSQL and performs a backend
  execution gate check before any live execution path exists.
- When BigQuery service-account credentials are configured, the API calls the
  BigQuery jobs dry-run endpoint and returns live scanned bytes, estimated cost,
  runtime estimate, referenced tables, and safety checks.
- When BigQuery credentials are missing, the API returns an explicitly marked
  `simulated` dry-run so the public demo remains usable without pretending to
  have contacted BigQuery.
- D1 now stores every dry-run in `query_runs` and mirrors it into
  `run_reviews` so admin review queues can see approved, approval-required, and
  blocked runs.
- Dry-run audit events record actor, workspace, query type, status, mode,
  scanned bytes, and estimated cost.
- The frontend `Run` button now calls the backend API and displays whether the
  result came from a live BigQuery dry-run or simulated fallback.

## Phase 3C Scope

- `/api/admin/run-reviews/:id` lets admins approve or block queued dry-runs.
- Approval updates both `run_reviews` and the matching `query_runs` audit row
  when D1 is bound.
- Approval and block actions write explicit audit events.
- The admin console exposes Approve and Block controls for
  `needs_approval` runs.
- Unauthenticated admin page loads now redirect to `/login` from the client
  even when a static shell is served from cache.

## Phase 3D Scope

- The Worker config now declares the `googlesql.com` and `www.googlesql.com`
  custom-domain routes so Wrangler deploys match the production Worker routes.
- Authenticated `/admin` static responses are returned with `private,
  no-store` cache headers after the Worker admin gate succeeds.
- `/api/admin/run-reviews/:id` supports `GET` for admin-only run detail reads,
  including SQL text, mode, cost, scan bytes, referenced tables, safety checks,
  and stored dry-run errors.
- The admin console adds a run detail panel and a BigQuery dry-run
  configuration status card.
- Seeded review queue rows also seed matching `query_runs` detail rows so a new
  D1 binding has inspectable review data before the first real dry-run.

## Deployment Setup

Create the database and apply the schema:

```bash
npx wrangler d1 create googlesql
npx wrangler d1 execute googlesql --file db/schema.sql --remote
```

Bind the database to the Cloudflare Pages project as `GOOGLESQL_DB`, then set:

```text
AUTH_COOKIE_SECRET=<long random value>
ADMIN_EMAILS=owner@example.com,admin@example.com
GOOGLE_CLIENT_ID=<google oauth client>
GOOGLE_CLIENT_SECRET=<google oauth secret>
GITHUB_CLIENT_ID=<github oauth client>
GITHUB_CLIENT_SECRET=<github oauth secret>
BIGQUERY_PROJECT_ID=<gcp project id>
BIGQUERY_CLIENT_EMAIL=<service account email>
BIGQUERY_PRIVATE_KEY=<service account PKCS#8 private key>
BIGQUERY_LOCATION=US
BIGQUERY_MAX_BYTES_BILLED=<optional byte limit>
```

The BigQuery service account needs permission to create jobs in the project and
read metadata/data for the datasets that GoogleSQL.com should validate.

## Acceptance Criteria

- Admin access succeeds only for an OAuth session whose email is listed in
  `ADMIN_EMAILS`.
- A member session can sign in but cannot read `/api/admin/state`.
- Feature rollout mutations persist in D1 and appear after refresh.
- Rollout and rollback actions produce audit log rows.
- D1-free preview deployments remain readable but cannot persist admin actions.
- The public run gate returns live BigQuery dry-run data when credentials are
  configured and explicit simulated data when they are not.
- `/api/admin/run-reviews/:id` returns detail data only for admin sessions and
  reports `storage_not_configured` when D1 is missing.
- The deployed Worker health response includes Phase 3D checks:
  `admin-route-hardening`, `run-review-detail`, and `bigquery-config-status`.
- `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass
  before gray release.

## Next Phase

The next phase should add workspace-scoped schema management and a separate
guarded path for real query execution after dry-run approval.
