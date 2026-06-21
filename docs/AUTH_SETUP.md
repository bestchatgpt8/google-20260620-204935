# GoogleSQL OAuth Setup

GoogleSQL uses Cloudflare Pages Functions for OAuth callbacks and HttpOnly
session cookies. Provider access tokens are exchanged on the server and are not
stored in the browser.

## Redirect URLs

Register these callback URLs with each OAuth app:

- Google: `https://googlesql.com/api/auth/callback/google`
- GitHub: `https://googlesql.com/api/auth/callback/github`

For preview deployments, add the matching Pages preview URL with the same path.

## Cloudflare Pages Variables

Set these as encrypted production and preview variables:

- `AUTH_COOKIE_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

Use a long random value for `AUTH_COOKIE_SECRET`.

## Local Development

Copy `.dev.vars.example` to `.dev.vars`, fill in real credentials, and run the
static build through Cloudflare Pages development tooling so the `functions/`
directory is active.

```bash
npm run build
npx wrangler pages dev out
```
