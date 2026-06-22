import { jsonResponse } from "../../lib/auth-request";
import {
  listPricingPlans,
  type PricingStorageEnv
} from "../../lib/pricing";

type PricingContext = {
  request: Request;
  env: PricingStorageEnv;
};

export async function onRequestGet(context: PricingContext) {
  const result = await listPricingPlans(context.env);

  return jsonResponse({
    ok: true,
    plans: result.plans,
    persisted: result.persisted,
    storageBinding: result.storageBinding
  });
}
