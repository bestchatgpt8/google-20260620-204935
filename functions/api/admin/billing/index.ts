import {
  jsonResponse,
  requireAdminSession
} from "../../../../lib/auth-request";
import { type AuthEnv } from "../../../../lib/auth";
import {
  listBillingLedger,
  type BillingStorageEnv
} from "../../../../lib/billing-store";

type AdminBillingContext = {
  request: Request;
  env: AuthEnv & BillingStorageEnv;
};

export async function onRequestGet(context: AdminBillingContext) {
  const auth = await requireAdminSession(context.request, context.env);
  if (!auth.ok) {
    return auth.response;
  }

  const ledger = await listBillingLedger(context.env);

  return jsonResponse({
    ok: true,
    ...ledger
  });
}
