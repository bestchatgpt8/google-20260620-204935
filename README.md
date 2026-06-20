# GoogleSQL.com

Phase 1 builds **GoogleSQL Copilot**: free tools and SEO content for BigQuery
users.

## Phase 1 Scope

- Text to GoogleSQL
- SQL Explain
- SQL Optimize
- GoogleSQL tutorials
- Cheat sheets
- Health endpoint for deployment checks
- CI pipeline for lint, typecheck, unit tests, and build

## Commands

```bash
npm install
npm run dev
npm run ci
```

## Deployment Principle

The project follows this release system:

- Develop anytime with short branches and preview deployments.
- Test automatically before merging.
- Release gradually with staging and canary traffic.
- Roll back quickly to the last healthy immutable deployment.

GoogleSQL.com is independent and is not affiliated with, endorsed by, or
sponsored by Google.

