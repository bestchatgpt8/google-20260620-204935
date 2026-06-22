"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import type { PricingPlan } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type PricingLoadState =
  | { status: "loading" }
  | { status: "ready"; plans: PricingPlan[]; persisted: boolean }
  | { status: "error"; message: string };

type PricingResponse = {
  ok?: boolean;
  plans?: PricingPlan[];
  persisted?: boolean;
  message?: string;
};

type CheckoutResponse = {
  ok?: boolean;
  checkoutUrl?: string;
  message?: string;
};

export function PricingPlans({ seedPlans }: { seedPlans: PricingPlan[] }) {
  const [loadState, setLoadState] = useState<PricingLoadState>({
    status: "loading"
  });
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      try {
        const response = await fetch("/api/pricing", {
          cache: "no-store"
        });
        const data = (await response.json().catch(() => null)) as
          | PricingResponse
          | null;

        if (!response.ok || !Array.isArray(data?.plans)) {
          throw new Error(data?.message ?? "Pricing could not be loaded.");
        }

        if (!cancelled) {
          setLoadState({
            status: "ready",
            plans: data.plans,
            persisted: data.persisted ?? false
          });
        }
      } catch {
        if (!cancelled) {
          setLoadState({
            status: "ready",
            plans: seedPlans,
            persisted: false
          });
        }
      }
    }

    void loadPlans();

    return () => {
      cancelled = true;
    };
  }, [seedPlans]);

  const plans = useMemo(
    () =>
      (loadState.status === "ready" ? loadState.plans : seedPlans).filter(
        (plan) => plan.active
      ),
    [loadState, seedPlans]
  );

  async function startCheckout(plan: PricingPlan) {
    setNotice(null);

    if (plan.paymentMode === "free" || plan.priceCents === 0) {
      window.location.assign("/tools");
      return;
    }

    if (plan.paymentMode === "payment_link" && plan.paymentLinkUrl) {
      window.location.assign(plan.paymentLinkUrl);
      return;
    }

    setPendingPlanId(plan.id);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          planId: plan.id
        })
      });
      const data = (await response.json().catch(() => null)) as
        | CheckoutResponse
        | null;

      if (!response.ok || !data?.checkoutUrl) {
        const localPreviewMessage =
          response.status === 404
            ? "Checkout runs through the Cloudflare Worker deployment. Add a payment link or deploy the Worker to test payments."
            : null;
        throw new Error(
          localPreviewMessage ??
            data?.message ??
            "Checkout could not be started."
        );
      }

      window.location.assign(data.checkoutUrl);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Checkout could not be started."
      );
    } finally {
      setPendingPlanId(null);
    }
  }

  return (
    <>
      {notice ? (
        <p className="mt-8 rounded-lg border border-[#fbbc05]/20 bg-[#fbbc05]/10 px-4 py-3 text-sm leading-6 text-[#fde68a]">
          {notice}
        </p>
      ) : null}

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          const isPending = pendingPlanId === plan.id;

          return (
            <article
              key={plan.id}
              className={cn(
                "resource-card flex min-h-[360px] flex-col rounded-lg border p-6 shadow-[0_18px_44px_rgba(0,0,0,0.18)]",
                plan.highlighted
                  ? "border-[#4285f4]/35 bg-[#4285f4]/[0.09]"
                  : "border-white/10 bg-white/[0.035]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">
                    {plan.name}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {plan.description}
                  </p>
                </div>
                {plan.highlighted ? (
                  <span className="rounded border border-[#4285f4]/25 bg-[#4285f4]/15 px-2 py-1 text-[11px] font-semibold text-[#93c5fd]">
                    Popular
                  </span>
                ) : null}
              </div>

              <p className="mt-6 text-4xl font-semibold text-slate-50">
                {formatPrice(plan)}
                <span className="text-sm font-medium text-slate-500">
                  {" "}
                  / {plan.interval}
                </span>
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#34a853]" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isPending}
                onClick={() => void startCheckout(plan)}
                className={cn(
                  "focus-ring mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-70",
                  plan.highlighted
                    ? "bg-[#4285f4] text-white shadow-[0_0_24px_rgba(66,133,244,0.28)] hover:bg-blue-500"
                    : "border border-white/10 bg-white/[0.05] text-slate-100 hover:bg-white/[0.08]"
                )}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : plan.paymentMode === "payment_link" ? (
                  <ExternalLink className="h-4 w-4" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                {isPending ? "Opening checkout..." : plan.ctaLabel}
              </button>
            </article>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm leading-6 text-slate-500">
        Users pay from this page. Paid plans open Stripe Checkout or an
        admin-provided payment link; admins can change plan copy, price,
        features, and payment mode from the Admin console.
        {loadState.status === "loading" ? " Loading current pricing..." : null}
        {loadState.status === "ready" && !loadState.persisted
          ? " Showing preview pricing until D1 is available."
          : null}
      </div>
    </>
  );
}

function formatPrice(plan: PricingPlan) {
  if (plan.priceCents === 0) {
    return "$0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency,
    maximumFractionDigits: Number.isInteger(plan.priceCents / 100) ? 0 : 2
  }).format(plan.priceCents / 100);
}
