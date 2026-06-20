import type { Metadata } from "next";
import { Check } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For learning GoogleSQL and trying the Copilot tools.",
    features: ["20 questions per day", "1 datasource", "Tutorials and cheat sheets"]
  },
  {
    name: "Pro",
    price: "$99",
    description: "For analysts who use BigQuery every week.",
    features: ["More questions", "Saved history", "Schema-aware SQL generation"]
  },
  {
    name: "Team",
    price: "$299",
    description: "For teams that want shared data workflows.",
    features: ["Team workspace", "Shared datasource context", "Usage logs"]
  }
];

export const metadata: Metadata = {
  title: "Pricing",
  description: "GoogleSQL Copilot pricing for free, pro, and team usage."
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#070a12] text-slate-100">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-50">
            Simple plans for Phase 1
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-500">
            Start with free GoogleSQL tools. Upgrade when you need saved
            workspace context, datasource history, and team usage controls.
          </p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="resource-card rounded-lg border border-white/10 bg-white/[0.035] p-6 shadow-[0_18px_44px_rgba(0,0,0,0.18)]"
            >
              <h2 className="text-xl font-semibold text-slate-100">{plan.name}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {plan.description}
              </p>
              <p className="mt-6 text-4xl font-semibold text-slate-50">
                {plan.price}
                <span className="text-sm font-medium text-slate-500"> / month</span>
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-slate-300">
                    <Check className="mt-0.5 h-4 w-4 text-[#34a853]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
