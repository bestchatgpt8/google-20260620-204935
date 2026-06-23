# GoogleSQL.com

Phase 4 builds on **GoogleSQL Copilot** with admin release controls, BigQuery
dry-run gates, schema governance, multilingual product pages, docs/community
workflows, pricing controls, and admin user management.

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
- D1-backed schema catalog and field policy controls
- BigQuery `INFORMATION_SCHEMA` import for schema context
- Admin user and billing configuration visibility
- Pricing plan editing and hosted checkout/payment-link routing
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
