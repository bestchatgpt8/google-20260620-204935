import {
  SESSION_COOKIE,
  getPublicSession,
  readCookie,
  verifyAuthPayload,
  type AuthEnv,
  type AuthSession
} from "../../../lib/auth";

type SessionContext = {
  request: Request;
  env: AuthEnv;
};

export async function onRequestGet(context: SessionContext) {
  const secret = context.env.AUTH_COOKIE_SECRET;
  const headers = {
    "Cache-Control": "no-store",
    "Content-Type": "application/json"
  };

  if (!secret) {
    return new Response(
      JSON.stringify({ authenticated: false, configured: false }),
      { headers }
    );
  }

  const token = readCookie(
    context.request.headers.get("Cookie"),
    SESSION_COOKIE
  );
  const session = await verifyAuthPayload<AuthSession>(token, secret);

  return new Response(
    JSON.stringify({
      authenticated: Boolean(session),
      configured: true,
      user: session ? getPublicSession(session) : null
    }),
    { headers }
  );
}
