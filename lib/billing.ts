import {
  getPricingPlan,
  type PricingPlan,
  type PricingStorageEnv
} from "./pricing";

export type BillingEnv = PricingStorageEnv & {
  STRIPE_SECRET_KEY?: string;
  STRIPE_API_VERSION?: string;
  STRIPE_SUCCESS_URL?: string;
  STRIPE_CANCEL_URL?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  SITE_URL?: string;
};

export type CheckoutResult =
  | {
      ok: true;
      checkoutUrl: string;
      paymentMode: PricingPlan["paymentMode"];
      paymentRequired: boolean;
    }
  | {
      ok: false;
      status: 400 | 404 | 409 | 502;
      code: string;
      message: string;
    };

const DEFAULT_STRIPE_API_VERSION = "2026-02-25.clover";

export async function createCheckoutSession(
  env: BillingEnv,
  request: Request,
  planId: string,
  options: { userEmail?: string } = {}
): Promise<CheckoutResult> {
  const plan = await getPricingPlan(env, planId);
  if (!plan || !plan.active) {
    return {
      ok: false,
      status: 404,
      code: "pricing_plan_not_found",
      message: "Pricing plan was not found."
    };
  }

  if (plan.priceCents === 0 || plan.paymentMode === "free") {
    return {
      ok: true,
      checkoutUrl: "/tools",
      paymentMode: "free",
      paymentRequired: false
    };
  }

  if (plan.paymentMode === "payment_link") {
    if (!plan.paymentLinkUrl) {
      return {
        ok: false,
        status: 409,
        code: "payment_link_not_configured",
        message: "This plan needs a payment link before checkout can start."
      };
    }

    return {
      ok: true,
      checkoutUrl: plan.paymentLinkUrl,
      paymentMode: "payment_link",
      paymentRequired: true
    };
  }

  if (!env.STRIPE_SECRET_KEY) {
    return {
      ok: false,
      status: 409,
      code: "payment_not_configured",
      message:
        "Stripe is not configured. Add STRIPE_SECRET_KEY or set a payment link for this plan."
    };
  }

  return createStripeHostedCheckout(env, request, plan, options);
}

async function createStripeHostedCheckout(
  env: BillingEnv,
  request: Request,
  plan: PricingPlan,
  options: { userEmail?: string }
): Promise<CheckoutResult> {
  const origin = getSiteOrigin(env, request);
  const params = new URLSearchParams({
    mode: "subscription",
    success_url:
      env.STRIPE_SUCCESS_URL ??
      `${origin}/pricing?checkout=success&plan=${encodeURIComponent(plan.id)}`,
    cancel_url:
      env.STRIPE_CANCEL_URL ??
      `${origin}/pricing?checkout=cancelled&plan=${encodeURIComponent(plan.id)}`,
    client_reference_id: plan.id
  });

  params.set("metadata[plan_id]", plan.id);
  params.set("metadata[plan_name]", plan.name);
  params.set("subscription_data[metadata][plan_id]", plan.id);
  params.set("subscription_data[metadata][plan_name]", plan.name);
  params.set("line_items[0][quantity]", "1");

  if (options.userEmail) {
    params.set("customer_email", options.userEmail);
    params.set("metadata[user_email]", options.userEmail);
    params.set("subscription_data[metadata][user_email]", options.userEmail);
  }

  if (plan.stripePriceId) {
    params.set("line_items[0][price]", plan.stripePriceId);
  } else {
    params.set("line_items[0][price_data][currency]", plan.currency.toLowerCase());
    params.set("line_items[0][price_data][unit_amount]", String(plan.priceCents));
    params.set(
      "line_items[0][price_data][recurring][interval]",
      plan.interval
    );
    params.set("line_items[0][price_data][product_data][name]", plan.name);
    params.set(
      "line_items[0][price_data][product_data][description]",
      plan.description
    );
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": env.STRIPE_API_VERSION ?? DEFAULT_STRIPE_API_VERSION
    },
    body: params.toString()
  });
  const body = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    return {
      ok: false,
      status: 502,
      code: "stripe_checkout_failed",
      message: getStripeErrorMessage(body)
    };
  }

  if (!isRecord(body) || typeof body.url !== "string") {
    return {
      ok: false,
      status: 502,
      code: "stripe_checkout_invalid_response",
      message: "Stripe did not return a checkout URL."
    };
  }

  return {
    ok: true,
    checkoutUrl: body.url,
    paymentMode: "stripe_checkout",
    paymentRequired: true
  };
}

function getSiteOrigin(env: BillingEnv, request: Request) {
  if (env.SITE_URL) {
    try {
      return new URL(env.SITE_URL).origin;
    } catch {
      // Fall back to the incoming request origin.
    }
  }

  return new URL(request.url).origin;
}

function getStripeErrorMessage(body: unknown) {
  if (
    isRecord(body) &&
    isRecord(body.error) &&
    typeof body.error.message === "string"
  ) {
    return body.error.message;
  }

  return "Stripe Checkout could not be started.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
