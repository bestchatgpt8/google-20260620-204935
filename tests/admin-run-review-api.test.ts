import { describe, expect, it } from "vitest";
import { onRequestPatch } from "../functions/api/admin/run-reviews/[id]";
import {
  createSessionCookie,
  signAuthPayload,
  type AuthSession
} from "../lib/auth";

const secret = "test-secret-that-is-long-enough-for-hmac";

describe("admin run review API", () => {
  it("requires an admin session", async () => {
    const response = await onRequestPatch({
      request: new Request("https://googlesql.com/api/admin/run-reviews/run-1", {
        method: "PATCH",
        body: JSON.stringify({ status: "approved" })
      }),
      env: {
        AUTH_COOKIE_SECRET: secret
      },
      params: {
        id: "run-1"
      }
    });

    expect(response.status).toBe(401);
  });

  it("rejects invalid status values", async () => {
    const response = await onRequestPatch({
      request: await createAdminRequest({ status: "needs_approval" }),
      env: {
        AUTH_COOKIE_SECRET: secret
      },
      params: {
        id: "run-1"
      }
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "invalid_run_status"
    });
  });

  it("returns storage_not_configured without D1", async () => {
    const response = await onRequestPatch({
      request: await createAdminRequest({ status: "approved" }),
      env: {
        AUTH_COOKIE_SECRET: secret
      },
      params: {
        id: "run-1"
      }
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      code: "storage_not_configured"
    });
  });
});

async function createAdminRequest(body: Record<string, unknown>) {
  const cookie = await createCookie({
    provider: "google",
    providerId: "123",
    email: "owner@example.com",
    name: "Owner",
    role: "admin",
    expiresAt: Date.now() + 60_000
  });

  return new Request("https://googlesql.com/api/admin/run-reviews/run-1", {
    method: "PATCH",
    headers: {
      Cookie: cookie
    },
    body: JSON.stringify(body)
  });
}

async function createCookie(session: AuthSession) {
  const token = await signAuthPayload(session, secret);
  return createSessionCookie(token, true);
}
