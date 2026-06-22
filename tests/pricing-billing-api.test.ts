import { describe, expect, it } from "vitest";
import { onRequestPost as onCheckoutPost } from "../functions/api/billing/checkout";
import { onRequestGet as onPricingGet } from "../functions/api/pricing";
import { onRequestPatch as onAdminPricingPlanPatch } from "../functions/api/admin/pricing-plans/[id]";
import { updatePricingPlan } from "../lib/pricing";

describe("pricing and billing API", () => {
  it("returns seed pricing when D1 is not configured", async () => {
    const response = await onPricingGet({
      request: new Request("https://googlesql.com/api/pricing"),
      env: {}
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      persisted: false,
      plans: expect.arrayContaining([
        expect.objectContaining({
          id: "pro",
          priceCents: 9900,
          paymentMode: "stripe_checkout"
        })
      ])
    });
  });

  it("routes the free plan to the tools page without payment", async () => {
    const response = await onCheckoutPost({
      request: new Request("https://googlesql.com/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({
          planId: "free"
        })
      }),
      env: {}
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      checkoutUrl: "/tools",
      paymentRequired: false
    });
  });

  it("explains paid checkout setup when Stripe is not configured", async () => {
    const response = await onCheckoutPost({
      request: new Request("https://googlesql.com/api/billing/checkout", {
        method: "POST",
        body: JSON.stringify({
          planId: "pro"
        })
      }),
      env: {}
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      code: "payment_not_configured"
    });
  });

  it("requires D1 persistence to update pricing plans", async () => {
    const result = await updatePricingPlan(
      {},
      "pro",
      {
        priceCents: 12900
      }
    );

    expect(result).toMatchObject({
      ok: false,
      code: "storage_not_configured"
    });
  });

  it("requires an admin session for plan updates", async () => {
    const response = await onAdminPricingPlanPatch({
      request: new Request("https://googlesql.com/api/admin/pricing-plans/pro", {
        method: "PATCH",
        body: JSON.stringify({
          priceCents: 12900
        })
      }),
      env: {},
      params: {
        id: "pro"
      }
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: "auth_not_configured"
    });
  });
});
