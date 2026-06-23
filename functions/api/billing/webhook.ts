import { jsonResponse } from "../../../lib/auth-request";
import {
  processStripeWebhook,
  type BillingWebhookEnv
} from "../../../lib/billing-store";

type BillingWebhookContext = {
  request: Request;
  env: BillingWebhookEnv;
};

const MAX_WEBHOOK_BYTES = 256 * 1024;

export async function onRequestPost(context: BillingWebhookContext) {
  const rawBody = await readBoundedBody(context.request, MAX_WEBHOOK_BYTES);
  if (!rawBody.ok) {
    return jsonResponse(
      {
        ok: false,
        code: rawBody.code,
        message: rawBody.message
      },
      { status: 413 }
    );
  }

  const result = await processStripeWebhook(
    context.env,
    rawBody.value,
    context.request.headers.get("Stripe-Signature")
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
    eventId: result.value.eventId,
    type: result.value.type,
    duplicate: result.value.duplicate
  });
}

async function readBoundedBody(
  request: Request,
  maxBytes: number
): Promise<
  | { ok: true; value: string }
  | { ok: false; code: string; message: string }
> {
  const contentLength = Number(request.headers.get("Content-Length") ?? "0");
  if (contentLength > maxBytes) {
    return {
      ok: false,
      code: "webhook_body_too_large",
      message: "Stripe webhook body is too large."
    };
  }

  if (!request.body) {
    return {
      ok: true,
      value: ""
    };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      return {
        ok: false,
        code: "webhook_body_too_large",
        message: "Stripe webhook body is too large."
      };
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return {
    ok: true,
    value: new TextDecoder().decode(body)
  };
}
