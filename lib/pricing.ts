import type { D1Database } from "./d1";

export type PricingInterval = "month" | "year";
export type PricingPaymentMode = "free" | "stripe_checkout" | "payment_link";

export type PricingPlan = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  interval: PricingInterval;
  features: string[];
  ctaLabel: string;
  paymentMode: PricingPaymentMode;
  stripePriceId: string;
  paymentLinkUrl: string;
  highlighted: boolean;
  active: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type PricingStorageEnv = {
  GOOGLESQL_DB?: D1Database;
  DB?: D1Database;
};

export type PricingPlanInput = Partial<
  Pick<
    PricingPlan,
    | "name"
    | "description"
    | "priceCents"
    | "currency"
    | "interval"
    | "features"
    | "ctaLabel"
    | "paymentMode"
    | "stripePriceId"
    | "paymentLinkUrl"
    | "highlighted"
    | "active"
    | "sortOrder"
  >
>;

export type PricingMutationResult =
  | {
      ok: true;
      value: PricingPlan;
    }
  | {
      ok: false;
      status: 400 | 404 | 409 | 500;
      code: string;
      message: string;
    };

type PricingPlanRow = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  interval: PricingInterval;
  features_json: string;
  cta_label: string;
  payment_mode: PricingPaymentMode;
  stripe_price_id: string | null;
  payment_link_url: string | null;
  highlighted: number;
  active: number;
  sort_order: number;
  updated_at: string;
};

export const seedPricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    description: "For learning GoogleSQL and trying the Copilot tools.",
    priceCents: 0,
    currency: "USD",
    interval: "month",
    features: [
      "20 questions per day",
      "1 datasource",
      "Tutorials and cheat sheets"
    ],
    ctaLabel: "Start free",
    paymentMode: "free",
    stripePriceId: "",
    paymentLinkUrl: "",
    highlighted: false,
    active: true,
    sortOrder: 10,
    updatedAt: "2026-06-22T00:00:00.000Z"
  },
  {
    id: "pro",
    name: "Pro",
    description: "For analysts who use BigQuery every week.",
    priceCents: 9900,
    currency: "USD",
    interval: "month",
    features: [
      "More questions",
      "Saved history",
      "Schema-aware SQL generation"
    ],
    ctaLabel: "Pay with Stripe",
    paymentMode: "stripe_checkout",
    stripePriceId: "",
    paymentLinkUrl: "",
    highlighted: true,
    active: true,
    sortOrder: 20,
    updatedAt: "2026-06-22T00:00:00.000Z"
  },
  {
    id: "team",
    name: "Team",
    description: "For teams that want shared data workflows.",
    priceCents: 29900,
    currency: "USD",
    interval: "month",
    features: [
      "Team workspace",
      "Shared datasource context",
      "Usage logs"
    ],
    ctaLabel: "Pay with Stripe",
    paymentMode: "stripe_checkout",
    stripePriceId: "",
    paymentLinkUrl: "",
    highlighted: false,
    active: true,
    sortOrder: 30,
    updatedAt: "2026-06-22T00:00:00.000Z"
  }
];

export function getPricingDb(env: PricingStorageEnv) {
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

export async function listPricingPlans(
  env: PricingStorageEnv,
  options: { includeInactive?: boolean } = {}
): Promise<{
  plans: PricingPlan[];
  persisted: boolean;
  storageBinding: "GOOGLESQL_DB" | "DB" | null;
}> {
  const configured = getPricingDb(env);
  if (!configured) {
    return {
      plans: filterPlans(seedPricingPlans, options.includeInactive),
      persisted: false,
      storageBinding: null
    };
  }

  await ensurePricingSchema(configured.db);
  const response = await configured.db
    .prepare(
      `SELECT
        id,
        name,
        description,
        price_cents,
        currency,
        interval,
        features_json,
        cta_label,
        payment_mode,
        stripe_price_id,
        payment_link_url,
        highlighted,
        active,
        sort_order,
        updated_at
      FROM pricing_plans
      ${options.includeInactive ? "" : "WHERE active = 1"}
      ORDER BY sort_order, price_cents`
    )
    .all<PricingPlanRow>();

  const plans = (response.results ?? []).map(mapPricingPlanRow);

  return {
    plans: plans.length
      ? plans
      : filterPlans(seedPricingPlans, options.includeInactive),
    persisted: true,
    storageBinding: configured.binding
  };
}

export async function getPricingPlan(
  env: PricingStorageEnv,
  id: string
): Promise<PricingPlan | null> {
  const normalizedId = normalizeId(id);
  const configured = getPricingDb(env);
  if (!configured) {
    return seedPricingPlans.find((plan) => plan.id === normalizedId) ?? null;
  }

  await ensurePricingSchema(configured.db);
  const row = await configured.db
    .prepare(
      `SELECT
        id,
        name,
        description,
        price_cents,
        currency,
        interval,
        features_json,
        cta_label,
        payment_mode,
        stripe_price_id,
        payment_link_url,
        highlighted,
        active,
        sort_order,
        updated_at
      FROM pricing_plans
      WHERE id = ?`
    )
    .bind(normalizedId)
    .first<PricingPlanRow>();

  return row ? mapPricingPlanRow(row) : null;
}

export async function updatePricingPlan(
  env: PricingStorageEnv,
  id: string,
  input: PricingPlanInput
): Promise<PricingMutationResult> {
  const normalizedId = normalizeId(id);
  const configured = getPricingDb(env);
  if (!configured) {
    return storageNotConfigured();
  }

  await ensurePricingSchema(configured.db);
  const existing = await getPricingPlan(env, normalizedId);
  if (!existing) {
    return {
      ok: false,
      status: 404,
      code: "pricing_plan_not_found",
      message: "Pricing plan was not found."
    };
  }

  const validation = validatePricingPlanInput(existing, input);
  if (!validation.ok) {
    return validation;
  }

  const updated = validation.value;
  await configured.db
    .prepare(
      `UPDATE pricing_plans
      SET
        name = ?,
        description = ?,
        price_cents = ?,
        currency = ?,
        interval = ?,
        features_json = ?,
        cta_label = ?,
        payment_mode = ?,
        stripe_price_id = ?,
        payment_link_url = ?,
        highlighted = ?,
        active = ?,
        sort_order = ?,
        updated_at = ?
      WHERE id = ?`
    )
    .bind(
      updated.name,
      updated.description,
      updated.priceCents,
      updated.currency,
      updated.interval,
      JSON.stringify(updated.features),
      updated.ctaLabel,
      updated.paymentMode,
      updated.stripePriceId || null,
      updated.paymentLinkUrl || null,
      updated.highlighted ? 1 : 0,
      updated.active ? 1 : 0,
      updated.sortOrder,
      updated.updatedAt,
      updated.id
    )
    .run();

  return {
    ok: true,
    value: updated
  };
}

export async function ensurePricingSchema(db: D1Database) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS pricing_plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price_cents INTEGER NOT NULL,
        currency TEXT NOT NULL,
        interval TEXT NOT NULL,
        features_json TEXT NOT NULL,
        cta_label TEXT NOT NULL,
        payment_mode TEXT NOT NULL,
        stripe_price_id TEXT,
        payment_link_url TEXT,
        highlighted INTEGER NOT NULL,
        active INTEGER NOT NULL,
        sort_order INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      )`
    )
    .run();

  await Promise.all(
    seedPricingPlans.map((plan) =>
      db
        .prepare(
          `INSERT OR IGNORE INTO pricing_plans (
            id,
            name,
            description,
            price_cents,
            currency,
            interval,
            features_json,
            cta_label,
            payment_mode,
            stripe_price_id,
            payment_link_url,
            highlighted,
            active,
            sort_order,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          plan.id,
          plan.name,
          plan.description,
          plan.priceCents,
          plan.currency,
          plan.interval,
          JSON.stringify(plan.features),
          plan.ctaLabel,
          plan.paymentMode,
          plan.stripePriceId || null,
          plan.paymentLinkUrl || null,
          plan.highlighted ? 1 : 0,
          plan.active ? 1 : 0,
          plan.sortOrder,
          plan.updatedAt
        )
        .run()
    )
  );
}

function validatePricingPlanInput(
  existing: PricingPlan,
  input: PricingPlanInput
): PricingMutationResult {
  const priceCents =
    typeof input.priceCents === "number"
      ? Math.round(input.priceCents)
      : existing.priceCents;
  const currency = normalizeCurrency(input.currency ?? existing.currency);
  const interval = input.interval ?? existing.interval;
  const paymentMode = input.paymentMode ?? existing.paymentMode;
  const features = Array.isArray(input.features)
    ? input.features.map((feature) => normalizeText(feature, 120)).filter(Boolean)
    : existing.features;
  const paymentLinkUrl = normalizeUrl(
    input.paymentLinkUrl ?? existing.paymentLinkUrl
  );

  if (!Number.isInteger(priceCents) || priceCents < 0 || priceCents > 99999900) {
    return {
      ok: false,
      status: 400,
      code: "invalid_plan_price",
      message: "Plan price must be a non-negative cent amount."
    };
  }

  if (interval !== "month" && interval !== "year") {
    return {
      ok: false,
      status: 400,
      code: "invalid_plan_interval",
      message: "Plan interval must be month or year."
    };
  }

  if (
    paymentMode !== "free" &&
    paymentMode !== "stripe_checkout" &&
    paymentMode !== "payment_link"
  ) {
    return {
      ok: false,
      status: 400,
      code: "invalid_payment_mode",
      message: "Payment mode must be free, stripe_checkout, or payment_link."
    };
  }

  if (!currency) {
    return {
      ok: false,
      status: 400,
      code: "invalid_plan_currency",
      message: "Currency must be a 3-letter ISO code."
    };
  }

  if (!features.length) {
    return {
      ok: false,
      status: 400,
      code: "plan_features_required",
      message: "At least one plan feature is required."
    };
  }

  if (
    paymentMode === "payment_link" &&
    !paymentLinkUrl
  ) {
    return {
      ok: false,
      status: 400,
      code: "payment_link_required",
      message: "Payment link mode requires a valid HTTPS payment link."
    };
  }

  return {
    ok: true,
    value: {
      ...existing,
      name: normalizeText(input.name ?? existing.name, 80) || existing.name,
      description:
        normalizeText(input.description ?? existing.description, 220) ||
        existing.description,
      priceCents,
      currency,
      interval,
      features,
      ctaLabel:
        normalizeText(input.ctaLabel ?? existing.ctaLabel, 60) ||
        existing.ctaLabel,
      paymentMode,
      stripePriceId: normalizeText(
        input.stripePriceId ?? existing.stripePriceId,
        120
      ),
      paymentLinkUrl,
      highlighted:
        typeof input.highlighted === "boolean"
          ? input.highlighted
          : existing.highlighted,
      active: typeof input.active === "boolean" ? input.active : existing.active,
      sortOrder:
        typeof input.sortOrder === "number" && Number.isFinite(input.sortOrder)
          ? Math.round(input.sortOrder)
          : existing.sortOrder,
      updatedAt: new Date().toISOString()
    }
  };
}

function filterPlans(plans: PricingPlan[], includeInactive?: boolean) {
  return plans
    .filter((plan) => includeInactive || plan.active)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function mapPricingPlanRow(row: PricingPlanRow): PricingPlan {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    priceCents: row.price_cents,
    currency: row.currency,
    interval: row.interval,
    features: parseFeatures(row.features_json),
    ctaLabel: row.cta_label,
    paymentMode: row.payment_mode,
    stripePriceId: row.stripe_price_id ?? "",
    paymentLinkUrl: row.payment_link_url ?? "",
    highlighted: row.highlighted === 1,
    active: row.active === 1,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at
  };
}

function parseFeatures(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => normalizeText(item, 120))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeId(value: string) {
  return value.trim().toLowerCase().slice(0, 80);
}

function normalizeText(value: string, maxLength: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function normalizeCurrency(value: string) {
  const currency = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(currency) ? currency : "";
}

function normalizeUrl(value: string) {
  const trimmed = value.trim().slice(0, 500);
  if (!trimmed) {
    return "";
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function storageNotConfigured(): PricingMutationResult {
  return {
    ok: false,
    status: 409,
    code: "storage_not_configured",
    message: "Cloudflare D1 binding GOOGLESQL_DB is required for this action."
  };
}
