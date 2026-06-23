# GoogleSQL.com Phase 4 Plan

## Goal

Move GoogleSQL.com from query dry-run review into workspace-scoped schema
operations: D1-backed schema catalog, field-level policy controls, admin UI
management, and health checks that prove the schema management surface is
enabled in the Worker deployment.

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
- `/api/health` now reports Phase 4 checks:
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
- `/api/health` reports Phase 4B runtime checks:
  `schema-policy-dry-run`, `workspace-table-allowlist`, and
  `pii-dry-run-block`.

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

## Acceptance Criteria

- `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass.
- `/api/admin/state` returns `phase: "phase-4"` with `schemaCatalog` populated.
- `/api/admin/schema-fields/:id` rejects non-admin users.
- Schema policy PATCH requests without D1 return `storage_not_configured`.
- Schema policy PATCH requests with D1 update the field row and create an audit
  event.
- The Worker health response includes the Phase 4 schema checks.
- Policy-blocked dry-runs return `schema_policy_blocked` and do not request a
  live BigQuery dry-run.

## Remaining Phase 4 Candidate Scope

- Add schema import/sync from BigQuery `INFORMATION_SCHEMA`.
- Add field-level masking or blocking rules for approved execution paths.
- Add admin controls for workspace-specific table imports and refresh cadence.
