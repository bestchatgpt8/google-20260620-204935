import { describe, expect, it } from "vitest";
import { onRequestGet as onAdminBillingGet } from "../functions/api/admin/billing";
import { onRequestPost as onBillingWebhookPost } from "../functions/api/billing/webhook";
import {
  createSessionCookie,
  signAuthPayload,
  type AuthSession
} from "../lib/auth";
import { listBillingLedger } from "../lib/billing-store";

const authSecret = "test-secret-that-is-long-enough-for-hmac";
const webhookSecret = "whsec_test_secret";

describe("billing webhook and ledger API", () => {
  it("keeps billing ledger empty without D1 persistence", async () => {
    await expect(listBillingLedger({})).resolves.toMatchObject({
      persisted: false,
      subscriptions: [],
      invoices: [],
      events: []
    });
  });

  it("requires a configured Stripe webhook signing secret", async () => {
    const response = await onBillingWebhookPost({
      request: new Request("https://googlesql.com/api/billing/webhook", {
        method: "POST",
        body: JSON.stringify(createCheckoutEvent())
      }),
      env: {}
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      code: "stripe_webhook_not_configured"
    });
  });

  it("rejects an invalid Stripe webhook signature", async () => {
    const response = await onBillingWebhookPost({
      request: new Request("https://googlesql.com/api/billing/webhook", {
        method: "POST",
        headers: {
          "Stripe-Signature": `t=${Math.floor(Date.now() / 1000)},v1=bad`
        },
        body: JSON.stringify(createCheckoutEvent())
      }),
      env: {
        STRIPE_WEBHOOK_SECRET: webhookSecret
      }
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "invalid_stripe_signature"
    });
  });

  it("requires D1 before storing a verified Stripe event", async () => {
    const body = JSON.stringify(createCheckoutEvent());
    const response = await onBillingWebhookPost({
      request: new Request("https://googlesql.com/api/billing/webhook", {
        method: "POST",
        headers: {
          "Stripe-Signature": await createStripeSignature(body)
        },
        body
      }),
      env: {
        STRIPE_WEBHOOK_SECRET: webhookSecret
      }
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      code: "storage_not_configured"
    });
  });

  it("requires admin auth for the billing ledger", async () => {
    const response = await onAdminBillingGet({
      request: new Request("https://googlesql.com/api/admin/billing"),
      env: {}
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: "auth_not_configured"
    });
  });

  it("returns an empty preview ledger to admins without D1", async () => {
    const response = await onAdminBillingGet({
      request: await createAdminRequest(),
      env: {
        AUTH_COOKIE_SECRET: authSecret
      }
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      persisted: false,
      subscriptions: [],
      invoices: [],
      events: []
    });
  });
});

function createCheckoutEvent() {
  return {
    id: "evt_checkout_completed",
    type: "checkout.session.completed",
    livemode: false,
    data: {
      object: {
        id: "cs_test_123",
        customer: "cus_123",
        subscription: "sub_123",
        payment_status: "paid",
        customer_details: {
          email: "buyer@example.com"
        },
        metadata: {
          plan_id: "pro",
          plan_name: "Pro",
          user_email: "buyer@example.com"
        }
      }
    }
  };
}

async function createStripeSignature(body: string) {
  const webhookTimestamp = Math.floor(Date.now() / 1000);
  const payload = `${webhookTimestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  const hex = Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `t=${webhookTimestamp},v1=${hex}`;
}

async function createAdminRequest() {
  const cookie = await createCookie({
    provider: "google",
    providerId: "123",
    email: "owner@example.com",
    name: "Owner",
    role: "admin",
    expiresAt: Date.now() + 60_000
  });

  return new Request("https://googlesql.com/api/admin/billing", {
    headers: {
      Cookie: cookie
    }
  });
}

async function createCookie(session: AuthSession) {
  const token = await signAuthPayload(session, authSecret);
  return createSessionCookie(token, true);
}
