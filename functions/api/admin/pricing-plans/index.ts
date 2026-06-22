import {
  jsonResponse,
  requireAdminSession
} from "../../../../lib/auth-request";
import { type AuthEnv } from "../../../../lib/auth";
import {
  listPricingPlans,
  type PricingStorageEnv
} from "../../../../lib/pricing";

type PricingPlansContext = {
  request: Request;
  env: AuthEnv & PricingStorageEnv;
};

export async function onRequestGet(context: PricingPlansContext) {
  const auth = await requireAdminSession(context.request, context.env);
  if (!auth.ok) {
    return auth.response;
  }

  const result = await listPricingPlans(context.env, {
    includeInactive: true
  });

  return jsonResponse({
    ok: true,
    plans: result.plans,
    persisted: result.persisted,
    storageBinding: result.storageBinding
  });
}
