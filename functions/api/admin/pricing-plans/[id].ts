import {
  jsonResponse,
  requireAdminSession
} from "../../../../lib/auth-request";
import { type AuthEnv } from "../../../../lib/auth";
import {
  recordAuditEvent,
  type AdminStorageEnv
} from "../../../../lib/admin-store";
import {
  updatePricingPlan,
  type PricingPlanInput,
  type PricingStorageEnv
} from "../../../../lib/pricing";

type PricingPlanContext = {
  request: Request;
  env: AuthEnv & AdminStorageEnv & PricingStorageEnv;
  params: {
    id?: string;
  };
};

export async function onRequestPatch(context: PricingPlanContext) {
  const auth = await requireAdminSession(context.request, context.env);
  if (!auth.ok) {
    return auth.response;
  }

  const id = context.params.id;
  if (!id) {
    return jsonResponse(
      {
        ok: false,
        code: "missing_pricing_plan_id",
        message: "Pricing plan id is required."
      },
      { status: 400 }
    );
  }

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

  const result = await updatePricingPlan(context.env, id, body.value);
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

  await recordAuditEvent(context.env, {
    actorEmail: auth.session.email,
    action: "pricing_plan.updated",
    target: result.value.id,
    metadata: {
      priceCents: result.value.priceCents,
      currency: result.value.currency,
      paymentMode: result.value.paymentMode,
      active: result.value.active
    }
  });

  return jsonResponse({
    ok: true,
    plan: result.value
  });
}

async function readJsonBody(
  request: Request
): Promise<
  | { ok: true; value: PricingPlanInput }
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
      value: normalizeBody(value)
    };
  } catch {
    return {
      ok: false,
      code: "invalid_json",
      message: "Request body must be valid JSON."
    };
  }
}

function normalizeBody(value: Record<string, unknown>): PricingPlanInput {
  return {
    name: getString(value.name),
    description: getString(value.description),
    priceCents: getNumber(value.priceCents),
    currency: getString(value.currency),
    interval:
      value.interval === "year" || value.interval === "month"
        ? value.interval
        : undefined,
    features: Array.isArray(value.features)
      ? value.features.filter((item): item is string => typeof item === "string")
      : undefined,
    ctaLabel: getString(value.ctaLabel),
    paymentMode:
      value.paymentMode === "free" ||
      value.paymentMode === "stripe_checkout" ||
      value.paymentMode === "payment_link"
        ? value.paymentMode
        : undefined,
    stripePriceId: getString(value.stripePriceId),
    paymentLinkUrl: getString(value.paymentLinkUrl),
    highlighted: getBoolean(value.highlighted),
    active: getBoolean(value.active),
    sortOrder: getNumber(value.sortOrder)
  };
}

function getString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function getBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
