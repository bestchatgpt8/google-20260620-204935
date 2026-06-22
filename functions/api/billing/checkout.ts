import { jsonResponse } from "../../../lib/auth-request";
import {
  createCheckoutSession,
  type BillingEnv
} from "../../../lib/billing";

type CheckoutContext = {
  request: Request;
  env: BillingEnv;
};

type CheckoutBody = {
  planId?: unknown;
};

export async function onRequestPost(context: CheckoutContext) {
  const body = await readJsonBody(context.request);
  if (!body.ok) {
    return jsonResponse(
      {
        ok: false,
        code: body.code,
        message: body.message
      },
      { status: 400 }
    );
  }

  const planId = getString(body.value.planId);
  if (!planId) {
    return jsonResponse(
      {
        ok: false,
        code: "plan_required",
        message: "Choose a plan before starting checkout."
      },
      { status: 400 }
    );
  }

  const result = await createCheckoutSession(
    context.env,
    context.request,
    planId
  );

  if (!result.ok) {
    return jsonResponse(
      {
        ok: false,
        code: result.code,
        message: result.message
      },
      { status: result.status }
    );
  }

  return jsonResponse({
    ok: true,
    checkoutUrl: result.checkoutUrl,
    paymentMode: result.paymentMode,
    paymentRequired: result.paymentRequired
  });
}

async function readJsonBody(
  request: Request
): Promise<
  | { ok: true; value: CheckoutBody }
  | { ok: false; code: string; message: string }
> {
  try {
    const value = (await request.json()) as unknown;
    if (!isRecord(value)) {
      return {
        ok: false,
        code: "invalid_json",
        message: "Request body must be a JSON object."
      };
    }

    return {
      ok: true,
      value
    };
  } catch {
    return {
      ok: false,
      code: "invalid_json",
      message: "Request body must be valid JSON."
    };
  }
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
