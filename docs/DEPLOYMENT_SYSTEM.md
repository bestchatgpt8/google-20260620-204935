# Deployment System

GoogleSQL.com uses a release model built around four operating principles:

## Develop Anytime

- Keep changes small and merge frequently.
- Every pull request should create a preview deployment.
- Use feature flags for unfinished tools, prompt changes, and paid features.
- Store prompts as versioned files when AI backends are introduced.

## Test Automatically

Required checks before merge:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- Health endpoint smoke check after deployment

Future Phase 2 checks:

- SQL validator regression tests
- Prompt regression tests
- BigQuery dry-run cost checks
- API contract tests

## Release Gradually

Recommended environments:

- `dev`: local and branch previews
- `staging`: production-like validation
- `canary`: small production audience
- `production`: stable public traffic

Canary controls:

- Workspace allowlist
- User allowlist
- Percentage rollout
- Feature flag by tool

## Roll Back Quickly

- Keep every production deployment immutable.
- Track build ID, git SHA, environment, and release owner.
- Prefer backward-compatible database migrations.
- Roll back traffic to the last healthy deployment before debugging.
- Roll back prompts and agent configs independently from app code.

