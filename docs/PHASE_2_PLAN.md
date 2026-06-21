# GoogleSQL.com Phase 2 Plan

## Goal

Turn the Phase 1 demo into an operable product surface with admin controls,
dry-run execution gates, release visibility, and rollback readiness.

## Product Surface

- `/admin` operator console for release, rollout, review queue, workspace, and
  rollback state.
- Google and GitHub OAuth one-click sign-in through Cloudflare Pages Functions.
- Run button dry-runs generated SQL before any live execution path is enabled.
- Shared Phase 2 control model in `lib/phase2.ts` for tests, UI, and future API
  adapters.
- Health endpoint reports `phase-2` and the deployment operating model.

## Phase 2 Acceptance Criteria

- An operator can view dev, staging, canary, and production release tracks.
- A user can start Google or GitHub OAuth from `/login`.
- Feature flags can be adjusted locally in the admin UI without affecting
  production infrastructure.
- A visitor can click Run and receive a dry-run gate result with estimated cost,
  scanned bytes, and runtime.
- Destructive SQL is blocked before the run gate returns an approval.
- Unbounded read queries require admin approval.
- Automated tests cover dry-run blocking, approval routing, health metadata, and
  release control data.

## Deferred Until Phase 3

- Real BigQuery job execution.
- Persistent authenticated admin policy and role enforcement.
- Persistent workspaces and audit logs.
- Billing provider integration.
- Cloudflare API-backed rollout and rollback actions.
