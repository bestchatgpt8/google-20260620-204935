# GoogleSQL.com Phase 4 Plan

## Goal

Move GoogleSQL.com from query dry-run review into workspace-scoped schema
operations: D1-backed schema catalog, field-level policy controls, admin UI
management, and admin-only health checks that prove the schema management
surface is enabled in the Worker deployment without exposing deployment
internals publicly.

## Phase 4A Scope

- `AdminState` now reports `phase-4` and includes `schemaCatalog`.
- Cloudflare D1 stores schema tables in `schema_tables` and field policies in
  `schema_fields`.
- Initial schema catalog rows are seeded from the existing public
  `schemaTables` content so new D1 bindings have usable data immediately.
- Schema field policies track:
  - `queryable`
  - `pii`
  - `usedInExamples`
  - `mode`
  - `description`
- `/api/admin/schema-fields/:id` lets admins update `queryable` and `pii`.
- Every schema policy change writes an audit event.
- The admin console exposes a Schema Catalog panel with table row counts,
  queryable field counts, PII counts, and field-level policy toggles.
- Internal health metadata now reports Phase 4 checks:
  `schema-catalog`, `schema-field-policy`, and `workspace-schema-admin`.

## Phase 4B Runtime Policy Scope

- `/api/query/dry-run` now loads the workspace schema catalog before BigQuery
  dry-run.
- D1-backed schema policy is used when `GOOGLESQL_DB` or `DB` is bound; seed
  schema policy remains the fallback for preview deployments.
- Workspace table allowlists block dry-runs that reference tables outside the
  selected workspace.
- Field policy blocks dry-runs that reference fields marked `queryable: false`.
- Selected fields marked `pii: true` block dry-run approval before live BigQuery
  dry-run can be requested.
- Internal health metadata reports Phase 4B runtime checks:
  `schema-policy-dry-run`, `workspace-table-allowlist`, and
  `pii-dry-run-block`.

## Phase 4C BigQuery Schema Import Scope

- `/api/admin/schema-import` lets admins import schema metadata from BigQuery
  `INFORMATION_SCHEMA.TABLES` and `INFORMATION_SCHEMA.COLUMNS`.
- The admin console exposes workspace, dataset, project override, table prefix,
  and table limit controls for schema import.
- Imported tables and fields are upserted into Cloudflare D1.
- Existing field-level `queryable` and `pii` policy toggles are preserved when a
  later import refreshes the same table and column.
- BigQuery policy-tagged columns default to `pii: true` and `queryable: false`
  on first import.
- Internal health metadata reports Phase 4C checks:
  `bigquery-schema-import` and `information-schema-sync`.

## Phase 4D Admin Operations Scope

- `/api/admin/state` now reports admin OAuth readiness, billing readiness, and
  persisted user accounts.
- The admin console includes a System Settings panel for OAuth provider status,
  `ADMIN_EMAILS`, Stripe Checkout configuration, site URLs, and BigQuery
  dry-run mode.
- D1-backed login records are surfaced in a User Management panel with provider,
  email, role, and last-login metadata.
- `/api/admin/users/:id` lets admins update a user's stored role.
- Manually promoted users keep their stored role on later sign-ins unless the
  signed session is already an `ADMIN_EMAILS` administrator.
- Admins cannot demote the currently signed-in account from the console.
- User role changes write `user.role_updated` audit events.
- Internal health metadata reports Phase 4D checks:
  `admin-user-management`, `billing-config-status`, and
  `admin-settings-console`.

## Phase 4E Billing Ledger Scope

- `/api/billing/webhook` verifies Stripe webhook signatures with
  `STRIPE_WEBHOOK_SECRET`.
- Stripe Checkout Sessions attach signed-in user email and plan metadata so
  subscription events can be mapped back to GoogleSQL users.
- Cloudflare D1 stores billing subscriptions, invoices, and processed Stripe
  event ids for idempotency.
- `/api/admin/billing` exposes the D1 billing ledger to administrators only.
- The admin console includes a Billing Ledger panel with subscription counts,
  paid invoice counts, recent invoices, and recent webhook events.
- Internal health metadata reports Phase 4E checks:
  `stripe-webhook`, `subscription-ledger`, and `billing-admin-ledger`.

## Safety Model

- The schema catalog API requires the same signed OAuth admin session as the
  rest of `/api/admin/*`.
- D1-free deployments remain readable in seed preview mode, but schema policy
  mutations return `storage_not_configured`.
- Seeded PII defaults are conservative for user, customer, and session
  identifiers.
- Runtime query validation keeps the existing static safety checks for
  destructive operations and cost hints, then overlays Phase 4B catalog policy
  for workspace table allowlists, field queryability, and PII exposure.
- Schema import requires both D1 persistence and configured BigQuery service
  account credentials. Import requests are admin-only and record an audit event.
- User role updates require the same signed OAuth admin session as the rest of
  `/api/admin/*`, require D1 persistence, and are audited.
- Public `/api/health` returns only the minimal service status. Detailed
  deployment and check metadata is available through admin-only routes.
- Stripe webhook ingestion rejects missing or invalid signatures before reading
  or mutating D1 billing state.
- Stripe event ids are stored to prevent duplicate webhook replay mutations.

## Acceptance Criteria

- `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass.
- `/api/admin/state` returns `phase: "phase-4"` with `schemaCatalog` populated.
- `/api/admin/schema-fields/:id` rejects non-admin users.
- Schema policy PATCH requests without D1 return `storage_not_configured`.
- Schema policy PATCH requests with D1 update the field row and create an audit
  event.
- Public `/api/health` does not expose deployment, rollback, or check metadata.
- Admin-only health metadata includes the Phase 4 schema checks.
- Policy-blocked dry-runs return `schema_policy_blocked` and do not request a
  live BigQuery dry-run.
- Admin schema imports without D1 return `storage_not_configured` before any
  BigQuery request is made.
- Imported BigQuery policy-tagged columns are blocked by default until an admin
  explicitly changes their field policy.
- `/api/admin/state` returns `auth`, `billing`, and `users` so admins can see
  whether login, Stripe Checkout, and account storage are configured.
- `/api/admin/users/:id` rejects unauthenticated requests and returns
  `storage_not_configured` without D1 persistence.
- `/api/billing/webhook` rejects invalid Stripe signatures and returns
  `storage_not_configured` when D1 is unavailable.
- `/api/admin/billing` rejects unauthenticated requests and returns an empty
  preview ledger without D1 persistence.

## Remaining Phase 4 Candidate Scope

- Add field-level masking or blocking rules for approved execution paths.
- Add scheduled schema refresh cadence and import history.
- Add Stripe Customer Portal for self-service cancellations and payment method
  changes.
- Add refunds and manual entitlement overrides in the admin billing panel.
