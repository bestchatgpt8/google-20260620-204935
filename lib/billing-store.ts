import type { D1Database } from "./d1";

export type BillingStorageEnv = {
  GOOGLESQL_DB?: D1Database;
  DB?: D1Database;
};

export type BillingWebhookEnv = BillingStorageEnv & {
  STRIPE_WEBHOOK_SECRET?: string;
};

export type BillingSubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused"
  | "unknown";

export type BillingSubscriptionRecord = {
  id: string;
  userEmail: string;
  planId: string;
  planName: string;
  status: BillingSubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeCheckoutSessionId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  latestInvoiceId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BillingInvoiceRecord = {
  id: string;
  userEmail: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string;
  currency: string;
  amountPaid: number;
  amountDue: number;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BillingEventRecord = {
  id: string;
  type: string;
  livemode: boolean;
  summary: string;
  processedAt: string;
};

export type BillingLedger = {
  subscriptions: BillingSubscriptionRecord[];
  invoices: BillingInvoiceRecord[];
  events: BillingEventRecord[];
  persisted: boolean;
  storageBinding: "GOOGLESQL_DB" | "DB" | null;
};

export type BillingWebhookResult =
  | {
      ok: true;
      value: {
        eventId: string;
        type: string;
        summary: string;
        duplicate: boolean;
      };
    }
  | {
      ok: false;
      status: 400 | 409 | 500;
      code: string;
      message: string;
    };

type StripeEvent = {
  id: string;
  type: string;
  livemode?: boolean;
  data?: {
    object?: unknown;
  };
};

type BillingSubscriptionRow = {
  id: string;
  user_email: string;
  plan_id: string;
  plan_name: string;
  status: BillingSubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_checkout_session_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: number;
  latest_invoice_id: string | null;
  created_at: string;
  updated_at: string;
};

type BillingInvoiceRow = {
  id: string;
  user_email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  currency: string;
  amount_paid: number;
  amount_due: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  created_at: string;
  updated_at: string;
};

type BillingEventRow = {
  id: string;
  type: string;
  livemode: number;
  summary: string;
  processed_at: string;
};

const WEBHOOK_TOLERANCE_SECONDS = 300;
const encoder = new TextEncoder();

export function getBillingDb(env: BillingStorageEnv) {
  if (env.GOOGLESQL_DB) {
    return {
      db: env.GOOGLESQL_DB,
      binding: "GOOGLESQL_DB" as const
    };
  }

  if (env.DB) {
    return {
      db: env.DB,
      binding: "DB" as const
    };
  }

  return null;
}

export async function listBillingLedger(
  env: BillingStorageEnv
): Promise<BillingLedger> {
  const configured = getBillingDb(env);
  if (!configured) {
    return {
      subscriptions: [],
      invoices: [],
      events: [],
      persisted: false,
      storageBinding: null
    };
  }

  await ensureBillingSchema(configured.db);
  const [subscriptions, invoices, events] = await Promise.all([
    listBillingSubscriptions(configured.db),
    listBillingInvoices(configured.db),
    listBillingEvents(configured.db)
  ]);

  return {
    subscriptions,
    invoices,
    events,
    persisted: true,
    storageBinding: configured.binding
  };
}

export async function processStripeWebhook(
  env: BillingWebhookEnv,
  rawBody: string,
  signatureHeader: string | null,
  nowMs = Date.now()
): Promise<BillingWebhookResult> {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    return {
      ok: false,
      status: 409,
      code: "stripe_webhook_not_configured",
      message: "Stripe webhook signing secret is not configured."
    };
  }

  const verified = await verifyStripeWebhookSignature(
    rawBody,
    signatureHeader,
    env.STRIPE_WEBHOOK_SECRET,
    nowMs
  );
  if (!verified) {
    return {
      ok: false,
      status: 400,
      code: "invalid_stripe_signature",
      message: "Stripe webhook signature could not be verified."
    };
  }

  const event = parseStripeEvent(rawBody);
  if (!event) {
    return {
      ok: false,
      status: 400,
      code: "invalid_stripe_event",
      message: "Stripe webhook body is not a supported event object."
    };
  }

  const configured = getBillingDb(env);
  if (!configured) {
    return {
      ok: false,
      status: 409,
      code: "storage_not_configured",
      message: "Cloudflare D1 must be configured before billing webhooks can be stored."
    };
  }

  await ensureBillingSchema(configured.db);
  const existing = await getBillingEvent(configured.db, event.id);
  if (existing) {
    return {
      ok: true,
      value: {
        eventId: existing.id,
        type: existing.type,
        summary: existing.summary,
        duplicate: true
      }
    };
  }

  const summary = await applyStripeEvent(configured.db, event);
  await insertBillingEvent(configured.db, {
    id: event.id,
    type: event.type,
    livemode: event.livemode === true,
    summary,
    processedAt: new Date(nowMs).toISOString()
  });

  return {
    ok: true,
    value: {
      eventId: event.id,
      type: event.type,
      summary,
      duplicate: false
    }
  };
}

export async function ensureBillingSchema(db: D1Database) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS billing_subscriptions (
        id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        plan_id TEXT NOT NULL,
        plan_name TEXT NOT NULL,
        status TEXT NOT NULL,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT UNIQUE,
        stripe_checkout_session_id TEXT,
        current_period_end TEXT,
        cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
        latest_invoice_id TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS billing_invoices (
        id TEXT PRIMARY KEY,
        user_email TEXT NOT NULL,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        status TEXT NOT NULL,
        currency TEXT NOT NULL,
        amount_paid INTEGER NOT NULL,
        amount_due INTEGER NOT NULL,
        hosted_invoice_url TEXT,
        invoice_pdf TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS stripe_events (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        livemode INTEGER NOT NULL,
        summary TEXT NOT NULL,
        processed_at TEXT NOT NULL
      )`
    )
    .run();
}

async function applyStripeEvent(db: D1Database, event: StripeEvent) {
  const object = isRecord(event.data?.object) ? event.data.object : {};

  if (event.type === "checkout.session.completed") {
    const metadata = getRecord(object.metadata);
    const planId =
      getString(metadata.plan_id) ||
      getString(object.client_reference_id) ||
      "unknown";
    const userEmail =
      getString(metadata.user_email) ||
      getString(object.customer_email) ||
      getString(getRecord(object.customer_details).email) ||
      "unknown@stripe.local";
    const stripeSubscriptionId = getString(object.subscription);
    const subscriptionId = stripeSubscriptionId || `checkout:${event.id}`;
    const paymentStatus = getString(object.payment_status);

    await upsertBillingSubscription(db, {
      id: subscriptionId,
      userEmail,
      planId,
      planName: getString(metadata.plan_name) || planId,
      status: paymentStatus === "paid" ? "active" : "incomplete",
      stripeCustomerId: getString(object.customer) || null,
      stripeSubscriptionId: stripeSubscriptionId || null,
      stripeCheckoutSessionId: getString(object.id) || event.id,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      latestInvoiceId: getString(object.invoice) || null
    });

    return `Checkout completed for ${userEmail} on ${planId}.`;
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const metadata = getRecord(object.metadata);
    const stripeSubscriptionId = getString(object.id) || event.id;
    const existing = await getBillingSubscriptionByStripeId(
      db,
      stripeSubscriptionId
    );
    const status =
      event.type === "customer.subscription.deleted"
        ? "canceled"
        : normalizeSubscriptionStatus(getString(object.status));
    const userEmail =
      getString(metadata.user_email) ||
      existing?.userEmail ||
      "unknown@stripe.local";
    const planId = getString(metadata.plan_id) || existing?.planId || "unknown";

    await upsertBillingSubscription(db, {
      id: stripeSubscriptionId,
      userEmail,
      planId,
      planName: getString(metadata.plan_name) || existing?.planName || planId,
      status,
      stripeCustomerId:
        getString(object.customer) || existing?.stripeCustomerId || null,
      stripeSubscriptionId,
      stripeCheckoutSessionId: existing?.stripeCheckoutSessionId ?? null,
      currentPeriodEnd: timestampToIso(object.current_period_end),
      cancelAtPeriodEnd: object.cancel_at_period_end === true,
      latestInvoiceId:
        getString(object.latest_invoice) || existing?.latestInvoiceId || null
    });

    return `Subscription ${stripeSubscriptionId} is ${status}.`;
  }

  if (
    event.type === "invoice.payment_succeeded" ||
    event.type === "invoice.payment_failed" ||
    event.type === "invoice.finalized"
  ) {
    const stripeSubscriptionId = extractInvoiceSubscriptionId(object);
    const existing = stripeSubscriptionId
      ? await getBillingSubscriptionByStripeId(db, stripeSubscriptionId)
      : null;
    const invoiceId = getString(object.id) || event.id;
    const userEmail =
      getString(object.customer_email) ||
      existing?.userEmail ||
      "unknown@stripe.local";

    await upsertBillingInvoice(db, {
      id: invoiceId,
      userEmail,
      stripeCustomerId:
        getString(object.customer) || existing?.stripeCustomerId || null,
      stripeSubscriptionId: stripeSubscriptionId || null,
      status: getString(object.status) || "unknown",
      currency: normalizeCurrency(getString(object.currency)),
      amountPaid: getNumber(object.amount_paid),
      amountDue: getNumber(object.amount_due),
      hostedInvoiceUrl: getString(object.hosted_invoice_url) || null,
      invoicePdf: getString(object.invoice_pdf) || null
    });

    if (stripeSubscriptionId && existing) {
      await upsertBillingSubscription(db, {
        ...existing,
        latestInvoiceId: invoiceId,
        status:
          event.type === "invoice.payment_failed" ? "past_due" : existing.status
      });
    }

    return `Invoice ${invoiceId} stored for ${userEmail}.`;
  }

  return `Stripe event ${event.type} recorded without ledger mutation.`;
}

async function upsertBillingSubscription(
  db: D1Database,
  input: Omit<BillingSubscriptionRecord, "createdAt" | "updatedAt">
) {
  const existing = await getBillingSubscription(db, input.id);
  const now = new Date().toISOString();
  const createdAt = existing?.createdAt ?? now;

  await db
    .prepare(
      `INSERT INTO billing_subscriptions (
        id,
        user_email,
        plan_id,
        plan_name,
        status,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_checkout_session_id,
        current_period_end,
        cancel_at_period_end,
        latest_invoice_id,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        user_email = excluded.user_email,
        plan_id = excluded.plan_id,
        plan_name = excluded.plan_name,
        status = excluded.status,
        stripe_customer_id = excluded.stripe_customer_id,
        stripe_subscription_id = excluded.stripe_subscription_id,
        stripe_checkout_session_id = excluded.stripe_checkout_session_id,
        current_period_end = excluded.current_period_end,
        cancel_at_period_end = excluded.cancel_at_period_end,
        latest_invoice_id = excluded.latest_invoice_id,
        updated_at = excluded.updated_at`
    )
    .bind(
      input.id,
      input.userEmail.toLowerCase(),
      input.planId,
      input.planName,
      input.status,
      input.stripeCustomerId,
      input.stripeSubscriptionId,
      input.stripeCheckoutSessionId,
      input.currentPeriodEnd,
      input.cancelAtPeriodEnd ? 1 : 0,
      input.latestInvoiceId,
      createdAt,
      now
    )
    .run();
}

async function upsertBillingInvoice(
  db: D1Database,
  input: Omit<BillingInvoiceRecord, "createdAt" | "updatedAt">
) {
  const existing = await getBillingInvoice(db, input.id);
  const now = new Date().toISOString();
  const createdAt = existing?.createdAt ?? now;

  await db
    .prepare(
      `INSERT INTO billing_invoices (
        id,
        user_email,
        stripe_customer_id,
        stripe_subscription_id,
        status,
        currency,
        amount_paid,
        amount_due,
        hosted_invoice_url,
        invoice_pdf,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        user_email = excluded.user_email,
        stripe_customer_id = excluded.stripe_customer_id,
        stripe_subscription_id = excluded.stripe_subscription_id,
        status = excluded.status,
        currency = excluded.currency,
        amount_paid = excluded.amount_paid,
        amount_due = excluded.amount_due,
        hosted_invoice_url = excluded.hosted_invoice_url,
        invoice_pdf = excluded.invoice_pdf,
        updated_at = excluded.updated_at`
    )
    .bind(
      input.id,
      input.userEmail.toLowerCase(),
      input.stripeCustomerId,
      input.stripeSubscriptionId,
      input.status,
      input.currency,
      input.amountPaid,
      input.amountDue,
      input.hostedInvoiceUrl,
      input.invoicePdf,
      createdAt,
      now
    )
    .run();
}

async function listBillingSubscriptions(db: D1Database) {
  const response = await db
    .prepare(
      `SELECT
        id,
        user_email,
        plan_id,
        plan_name,
        status,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_checkout_session_id,
        current_period_end,
        cancel_at_period_end,
        latest_invoice_id,
        created_at,
        updated_at
      FROM billing_subscriptions
      ORDER BY updated_at DESC
      LIMIT 50`
    )
    .all<BillingSubscriptionRow>();

  return (response.results ?? []).map(mapBillingSubscriptionRow);
}

async function listBillingInvoices(db: D1Database) {
  const response = await db
    .prepare(
      `SELECT
        id,
        user_email,
        stripe_customer_id,
        stripe_subscription_id,
        status,
        currency,
        amount_paid,
        amount_due,
        hosted_invoice_url,
        invoice_pdf,
        created_at,
        updated_at
      FROM billing_invoices
      ORDER BY updated_at DESC
      LIMIT 50`
    )
    .all<BillingInvoiceRow>();

  return (response.results ?? []).map(mapBillingInvoiceRow);
}

async function listBillingEvents(db: D1Database) {
  const response = await db
    .prepare(
      `SELECT id, type, livemode, summary, processed_at
      FROM stripe_events
      ORDER BY processed_at DESC
      LIMIT 25`
    )
    .all<BillingEventRow>();

  return (response.results ?? []).map(mapBillingEventRow);
}

async function getBillingSubscription(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT
        id,
        user_email,
        plan_id,
        plan_name,
        status,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_checkout_session_id,
        current_period_end,
        cancel_at_period_end,
        latest_invoice_id,
        created_at,
        updated_at
      FROM billing_subscriptions
      WHERE id = ?`
    )
    .bind(id)
    .first<BillingSubscriptionRow>();

  return row ? mapBillingSubscriptionRow(row) : null;
}

async function getBillingSubscriptionByStripeId(
  db: D1Database,
  stripeSubscriptionId: string
) {
  const row = await db
    .prepare(
      `SELECT
        id,
        user_email,
        plan_id,
        plan_name,
        status,
        stripe_customer_id,
        stripe_subscription_id,
        stripe_checkout_session_id,
        current_period_end,
        cancel_at_period_end,
        latest_invoice_id,
        created_at,
        updated_at
      FROM billing_subscriptions
      WHERE stripe_subscription_id = ?`
    )
    .bind(stripeSubscriptionId)
    .first<BillingSubscriptionRow>();

  return row ? mapBillingSubscriptionRow(row) : null;
}

async function getBillingInvoice(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT
        id,
        user_email,
        stripe_customer_id,
        stripe_subscription_id,
        status,
        currency,
        amount_paid,
        amount_due,
        hosted_invoice_url,
        invoice_pdf,
        created_at,
        updated_at
      FROM billing_invoices
      WHERE id = ?`
    )
    .bind(id)
    .first<BillingInvoiceRow>();

  return row ? mapBillingInvoiceRow(row) : null;
}

async function getBillingEvent(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT id, type, livemode, summary, processed_at
      FROM stripe_events
      WHERE id = ?`
    )
    .bind(id)
    .first<BillingEventRow>();

  return row ? mapBillingEventRow(row) : null;
}

async function insertBillingEvent(db: D1Database, event: BillingEventRecord) {
  await db
    .prepare(
      `INSERT INTO stripe_events (
        id,
        type,
        livemode,
        summary,
        processed_at
      ) VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      event.id,
      event.type,
      event.livemode ? 1 : 0,
      event.summary,
      event.processedAt
    )
    .run();
}

async function verifyStripeWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  nowMs: number
) {
  if (!signatureHeader) {
    return false;
  }

  const parts = signatureHeader.split(",");
  const timestamp = Number(
    parts.find((part) => part.startsWith("t="))?.slice(2)
  );
  const signature = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3))
    .find(Boolean);

  if (!Number.isFinite(timestamp) || !signature) {
    return false;
  }

  const ageSeconds = Math.abs(Math.floor(nowMs / 1000) - timestamp);
  if (ageSeconds > WEBHOOK_TOLERANCE_SECONDS) {
    return false;
  }

  const expected = await createHmacHex(`${timestamp}.${rawBody}`, secret);
  return constantTimeEqual(expected, signature);
}

async function createHmacHex(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}

function parseStripeEvent(rawBody: string): StripeEvent | null {
  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (
      isRecord(parsed) &&
      typeof parsed.id === "string" &&
      typeof parsed.type === "string"
    ) {
      return parsed as StripeEvent;
    }
  } catch {
    return null;
  }

  return null;
}

function extractInvoiceSubscriptionId(object: Record<string, unknown>) {
  const parent = getRecord(object.parent);
  const subscriptionDetails = getRecord(parent.subscription_details);
  const lines = getRecord(object.lines);
  const lineData = Array.isArray(lines.data) ? lines.data : [];
  const firstLine = getRecord(lineData[0]);
  const firstLineParent = getRecord(firstLine.parent);
  const subscriptionItemDetails = getRecord(
    firstLineParent.subscription_item_details
  );

  return (
    getString(object.subscription) ||
    getString(subscriptionDetails.subscription) ||
    getString(subscriptionItemDetails.subscription)
  );
}

function mapBillingSubscriptionRow(
  row: BillingSubscriptionRow
): BillingSubscriptionRecord {
  return {
    id: row.id,
    userEmail: row.user_email,
    planId: row.plan_id,
    planName: row.plan_name,
    status: row.status,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end === 1,
    latestInvoiceId: row.latest_invoice_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapBillingInvoiceRow(row: BillingInvoiceRow): BillingInvoiceRecord {
  return {
    id: row.id,
    userEmail: row.user_email,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    status: row.status,
    currency: row.currency,
    amountPaid: row.amount_paid,
    amountDue: row.amount_due,
    hostedInvoiceUrl: row.hosted_invoice_url,
    invoicePdf: row.invoice_pdf,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapBillingEventRow(row: BillingEventRow): BillingEventRecord {
  return {
    id: row.id,
    type: row.type,
    livemode: row.livemode === 1,
    summary: row.summary,
    processedAt: row.processed_at
  };
}

function normalizeSubscriptionStatus(value: string): BillingSubscriptionStatus {
  if (
    value === "active" ||
    value === "trialing" ||
    value === "past_due" ||
    value === "canceled" ||
    value === "incomplete" ||
    value === "incomplete_expired" ||
    value === "unpaid" ||
    value === "paused"
  ) {
    return value;
  }

  return "unknown";
}

function normalizeCurrency(value: string) {
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : "USD";
}

function timestampToIso(value: unknown) {
  const timestamp = getNumber(value);
  if (!timestamp) {
    return null;
  }

  return new Date(timestamp * 1000).toISOString();
}

function getRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
