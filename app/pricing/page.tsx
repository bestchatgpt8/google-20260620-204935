import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PricingPlans } from "@/components/pricing-plans";
import { seedPricingPlans } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "GoogleSQL Copilot pricing for free, pro, and team usage."
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#070a12] text-slate-100">
      <SiteHeader active="settings" />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-50">
            Simple plans with secure checkout
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-500">
            Start with free GoogleSQL tools. Upgrade from this page when you
            need saved workspace context, datasource history, and team usage
            controls.
          </p>
        </div>
        <PricingPlans seedPlans={seedPricingPlans} />
      </section>
      <SiteFooter />
    </main>
  );
}
