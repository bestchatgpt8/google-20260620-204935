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
```

## Acceptance Criteria

- Admin access succeeds only for an OAuth session whose email is listed in
  `ADMIN_EMAILS`.
- A member session can sign in but cannot read `/api/admin/state`.
- Feature rollout mutations persist in D1 and appear after refresh.
- Rollout and rollback actions produce audit log rows.
- D1-free preview deployments remain readable but cannot persist admin actions.
- `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass
  before gray release.

## Next Phase

Phase 3B should connect the run gate to real BigQuery dry-run/job APIs, add
workspace-scoped schema management, and introduce explicit approval actions for
queued query runs.
