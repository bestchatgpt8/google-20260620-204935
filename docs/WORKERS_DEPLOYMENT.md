# GoogleSQL Workers Deployment

This project keeps Cloudflare Pages as the current rollback target and deploys
a parallel Workers version for validation.

## Worker

- Worker name: `googlesql-worker-prod`
- Static assets: `out/`
- Worker entry: `worker/index.ts`
- D1 binding: `GOOGLESQL_DB`
- D1 database: `googlesql`

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
