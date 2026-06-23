import { describe, expect, it } from "vitest";
import worker from "../worker";

const secret = "test-secret-that-is-long-enough-for-hmac";

describe("worker admin gate", () => {
  it("keeps public health response free of deployment internals", async () => {
    const response = await worker.fetch(
      new Request("https://googlesql.com/api/health"),
      {
        AUTH_COOKIE_SECRET: secret,
        ASSETS: {
          fetch: async () => new Response("asset")
        }
      },
      {
        waitUntil: () => undefined
      }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      service: "googlesql-web"
    });
  });

  it("requires admin auth for detailed health metadata", async () => {
    const response = await worker.fetch(
      new Request("https://googlesql.com/api/admin/health"),
      {
        AUTH_COOKIE_SECRET: secret,
        ASSETS: {
          fetch: async () => new Response("asset")
        }
      },
      {
        waitUntil: () => undefined
      }
    );

    expect(response.status).toBe(401);
  });

  it.each(["/admin", "/admin.html", "/admin.txt"])(
    "redirects unauthenticated admin asset requests for %s",
    async (pathname) => {
      const response = await worker.fetch(
        new Request(`https://googlesql.com${pathname}`),
        {
          AUTH_COOKIE_SECRET: secret,
          ASSETS: {
            fetch: async () => new Response("asset")
          }
        },
        {
          waitUntil: () => undefined
        }
      );

      expect(response.status).toBe(302);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(response.headers.get("location")).toContain(
        "/login?returnTo=%2Fadmin"
      );
    }
  );
});
