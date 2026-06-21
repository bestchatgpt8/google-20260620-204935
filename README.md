# GoogleSQL.com

Phase 2 builds on **GoogleSQL Copilot** with admin release controls, dry-run
execution gates, and rollback readiness for BigQuery workflows.

## Current Scope

- Text to GoogleSQL
- SQL Explain
- SQL Optimize
- GoogleSQL tutorials
- Cheat sheets
- Admin release console
- Google and GitHub one-click login
- Dry-run execution gate
- Workspace allowlist preview
- Health endpoint for deployment checks
- CI pipeline for lint, typecheck, unit tests, and build

## Commands

```bash
npm install
npm run dev
npm run ci
```

OAuth setup is documented in `docs/AUTH_SETUP.md`.

## Deployment Principle

The project follows this release system:

- Develop anytime with short branches and preview deployments.
- Test automatically before merging.
- Release gradually with staging and canary traffic.
- Roll back quickly to the last healthy immutable deployment.

GoogleSQL.com is independent and is not affiliated with, endorsed by, or
sponsored by Google.
