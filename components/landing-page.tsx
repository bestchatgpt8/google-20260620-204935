"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  DatabaseZap,
  FileText,
  Globe2,
  Layers3,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Workflow,
  type LucideIcon
} from "lucide-react";
import {
  landingCopy,
  landingLanguages,
  type LandingCopy,
  type LandingLocale
} from "@/lib/landing-copy";
import { cn } from "@/lib/utils";

const engines = ["BigQuery", "Cloud Spanner", "Dataflow", "Looker"];

const featureIcons: LucideIcon[] = [
  Sparkles,
  Layers3,
  BarChart3,
  ShieldCheck
];

const trustIcons: LucideIcon[] = [
  LockKeyhole,
  FileText,
  RotateCcw,
  Activity
];

export function LandingPage() {
  const [locale, setLocale] = useState<LandingLocale>("en");
  const [syntaxTab, setSyntaxTab] = useState<"nested" | "window">("nested");
  const language = useMemo(
    () =>
      landingLanguages.find((item) => item.code === locale) ??
      landingLanguages[0],
    [locale]
  );
  const copy = landingCopy[locale];

  return (
    <main
      dir={language.dir}
      className="min-h-screen bg-[#090d17] text-[#edeae1]"
    >
      <LandingHeader copy={copy} locale={locale} onLocaleChange={setLocale} />

      <section className="relative overflow-hidden border-b border-[#edeae1]/10 bg-[linear-gradient(180deg,#090d17_0%,#111a2e_58%,#090d17_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(237,234,225,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(237,234,225,0.04)_1px,transparent_1px)] bg-[size:76px_76px] opacity-40" />
        <div className="relative mx-auto max-w-[1180px] px-5 py-8 sm:px-8 sm:py-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1fr)] lg:items-center">
            <div className="min-w-0">
              <p className="font-[var(--font-mono)] text-xs font-medium uppercase text-[#c9a35a]">
                {copy.hero.eyebrow}
              </p>
              <h1 className="mt-3 max-w-3xl font-[var(--font-display)] text-3xl font-semibold leading-tight text-[#edeae1] sm:mt-4 sm:text-5xl lg:text-5xl">
                {copy.hero.titleStart}{" "}
                <em className="font-normal not-italic text-[#e4c887]">
                  {copy.hero.titleEmphasis}
                </em>{" "}
                {copy.hero.titleEnd}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-[#9aa2b7] sm:mt-5 sm:text-lg">
                {copy.hero.lead}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 sm:mt-7">
                <Link
                  href="/tools"
                  className="focus-ring inline-flex h-11 items-center justify-center rounded-md bg-[#c9a35a] px-5 text-sm font-semibold text-[#090d17] transition hover:bg-[#e4c887]"
                >
                  {copy.hero.primary}
                </Link>
                <a
                  href="#syntax"
                  className="focus-ring inline-flex h-11 items-center justify-center rounded-md border border-[#2b3654] px-5 text-sm font-semibold text-[#edeae1] transition hover:border-[#9aa2b7]"
                >
                  {copy.hero.secondary}
                </a>
              </div>
            </div>

            <HeroConsole copy={copy} />
          </div>

          <div className="mt-6 hidden flex-wrap items-center gap-x-7 gap-y-3 text-sm text-[#9aa2b7] sm:flex">
            <span className="font-[var(--font-mono)] text-xs text-[#6e7690]">
              {copy.hero.enginesCaption}
            </span>
            {engines.map((engine) => (
              <span key={engine} className="font-[var(--font-mono)] text-xs">
                {engine}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#edeae1]/10 bg-[#090d17]">
        <div className="mx-auto grid max-w-[1180px] gap-px border-x border-[#edeae1]/10 bg-[#edeae1]/10 px-0 sm:grid-cols-2 lg:grid-cols-4">
          {copy.stats.map((stat) => (
            <div key={stat.value} className="bg-[#090d17] px-6 py-8">
              <p className="font-[var(--font-display)] text-3xl font-semibold text-[#edeae1]">
                {stat.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#9aa2b7]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-[#090d17] py-20 lg:py-24">
        <LandingSectionHead eyebrow={copy.features.eyebrow} title={copy.features.title} />
        <div className="mx-auto mt-10 grid max-w-[1180px] gap-px overflow-hidden rounded-lg border border-[#edeae1]/10 bg-[#edeae1]/10 px-0 sm:grid-cols-2">
          {copy.features.items.map((item, index) => {
            const Icon = featureIcons[index] ?? Workflow;
            return (
              <article key={item.title} className="bg-[#090d17] p-6 sm:p-8">
                <Icon className="h-8 w-8 text-[#7fa6ff]" />
                <h2 className="mt-6 text-lg font-semibold text-[#edeae1]">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#9aa2b7]">
                  {item.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        id="syntax"
        className="border-y border-[#edeae1]/10 bg-[#111a2e] py-20 lg:py-24"
      >
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <p className="font-[var(--font-mono)] text-xs font-medium uppercase text-[#c9a35a]">
              {copy.showcase.eyebrow}
            </p>
            <h2 className="mt-5 font-[var(--font-display)] text-3xl font-semibold leading-tight text-[#edeae1] lg:text-4xl">
              {copy.showcase.title}
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#9aa2b7] sm:text-base">
              {copy.showcase.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <SyntaxButton
                active={syntaxTab === "nested"}
                onClick={() => setSyntaxTab("nested")}
              >
                {copy.showcase.nestedTab}
              </SyntaxButton>
              <SyntaxButton
                active={syntaxTab === "window"}
                onClick={() => setSyntaxTab("window")}
              >
                {copy.showcase.windowTab}
              </SyntaxButton>
            </div>
          </div>

          <SyntaxPanel copy={copy} tab={syntaxTab} />
        </div>
      </section>

      <section id="cases" className="bg-[#090d17] py-20 lg:py-24">
        <LandingSectionHead eyebrow={copy.cases.eyebrow} title={copy.cases.title} />
        <div className="mx-auto mt-10 grid max-w-[1180px] gap-5 px-5 sm:px-8 lg:grid-cols-3">
          {copy.cases.items.map((item) => (
            <article
              key={item.title}
              className="resource-card rounded-lg border border-[#2b3654] bg-white/[0.015] p-6"
            >
              <p className="font-[var(--font-mono)] text-xs text-[#7fa6ff]">{item.tag}</p>
              <h2 className="mt-4 text-lg font-semibold text-[#edeae1]">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#9aa2b7]">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="trust"
        className="border-y border-[#edeae1]/10 bg-[#111a2e] py-20 lg:py-24"
      >
        <LandingSectionHead eyebrow={copy.trust.eyebrow} title={copy.trust.title} />
        <div className="mx-auto mt-10 grid max-w-[1180px] gap-6 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {copy.trust.items.map((item, index) => {
            const Icon = trustIcons[index] ?? CheckCircle2;
            return (
              <article key={item.title} className="flex gap-4">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-[#c9a35a]" />
                <div>
                  <h2 className="text-sm font-semibold text-[#edeae1]">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#9aa2b7]">
                    {item.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-[#090d17] py-20 text-center lg:py-24">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <p className="font-[var(--font-mono)] text-xs font-medium uppercase text-[#c9a35a]">
            {copy.cta.eyebrow}
          </p>
          <h2 className="mt-5 font-[var(--font-display)] text-3xl font-semibold leading-tight text-[#edeae1] sm:text-4xl">
            {copy.cta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#9aa2b7] sm:text-base">
            {copy.cta.body}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/tools"
              className="focus-ring inline-flex h-11 items-center justify-center rounded-md bg-[#c9a35a] px-5 text-sm font-semibold text-[#090d17] transition hover:bg-[#e4c887]"
            >
              {copy.cta.primary}
            </Link>
            <Link
              href="/tutorials"
              className="focus-ring inline-flex h-11 items-center justify-center rounded-md border border-[#2b3654] px-5 text-sm font-semibold text-[#edeae1] transition hover:border-[#9aa2b7]"
            >
              {copy.cta.secondary}
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter copy={copy} />
    </main>
  );
}

function LandingHeader({
  copy,
  locale,
  onLocaleChange
}: {
  copy: LandingCopy;
  locale: LandingLocale;
  onLocaleChange: (locale: LandingLocale) => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#edeae1]/10 bg-[#090d17]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-[#edeae1]">
          <span className="glow-border flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4285f4] via-[#a855f7] to-[#34a853] text-white shadow-[0_0_24px_rgba(66,133,244,0.28)]">
            <DatabaseZap className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-base font-semibold">GoogleSQL</span>
        </Link>

        <nav
          className="hidden items-center gap-6 text-sm text-[#9aa2b7] lg:flex"
          aria-label="Primary"
        >
          <a className="transition hover:text-[#edeae1]" href="#features">
            {copy.nav.features}
          </a>
          <a className="transition hover:text-[#edeae1]" href="#syntax">
            {copy.nav.syntax}
          </a>
          <a className="transition hover:text-[#edeae1]" href="#cases">
            {copy.nav.useCases}
          </a>
          <a className="transition hover:text-[#edeae1]" href="#trust">
            {copy.nav.trust}
          </a>
        </nav>

        <div className="flex min-w-0 items-center gap-2">
          <label className="flex items-center gap-2 rounded-md border border-[#2b3654] bg-white/[0.03] px-2 py-1.5 text-xs text-[#9aa2b7]">
            <Globe2 className="h-3.5 w-3.5 shrink-0" />
            <span className="sr-only">{copy.languageLabel}</span>
            <select
              value={locale}
              onChange={(event) =>
                onLocaleChange(event.currentTarget.value as LandingLocale)
              }
              className="max-w-[82px] bg-transparent text-xs font-medium text-[#edeae1] outline-none sm:max-w-[150px]"
              aria-label={copy.languageLabel}
            >
              {landingLanguages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.nativeName}
                </option>
              ))}
            </select>
          </label>
          <Link
            href="/docs"
            className="focus-ring hidden h-9 items-center justify-center rounded-md border border-[#2b3654] px-3 text-xs font-semibold text-[#edeae1] transition hover:border-[#9aa2b7] md:inline-flex"
          >
            {copy.nav.docs}
          </Link>
          <Link
            href="/tools"
            className="focus-ring inline-flex h-9 items-center justify-center rounded-md bg-[#c9a35a] px-3 text-xs font-semibold text-[#090d17] transition hover:bg-[#e4c887]"
          >
            {copy.nav.start}
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroConsole({ copy }: { copy: LandingCopy }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#2b3654] bg-[linear-gradient(180deg,#151f37,#111a2e)] shadow-[0_40px_90px_-46px_rgba(0,0,0,0.75)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edeae1]/10 px-4 py-3 sm:gap-3">
        <span className="rounded-md border border-[#2b3654] bg-[#c9a35a]/[0.06] px-3 py-1.5 font-[var(--font-mono)] text-xs text-[#e4c887]">
          {copy.hero.consoleTab}
        </span>
        <span className="font-[var(--font-mono)] text-xs text-[#6e7690]">
          {copy.hero.consoleLabel}
        </span>
      </div>
      <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
        <pre className="sql-code max-h-[150px] overflow-auto border-b border-[#edeae1]/10 p-4 text-[12px] leading-6 text-[#edeae1] sm:min-h-[260px] sm:max-h-none sm:p-5 lg:border-b-0 lg:border-e lg:border-[#edeae1]/10">
          <code>
            <Line number="01">
              <span className="sql-keyword">SELECT</span>
            </Line>
            <Line number="02">  region,</Line>
            <Line number="03">
              {"  "}
              <span className="sql-function">ARRAY_AGG</span>
              {"(STRUCT(product, revenue) "}
            </Line>
            <Line number="04">
              {"  "}
              <span className="sql-keyword">ORDER BY</span>
              {" revenue "}
              <span className="sql-keyword">DESC LIMIT</span>
              {" "}
              <span className="sql-number">3</span>
              {") "}
              <span className="sql-keyword">AS</span>
              {" top_products,"}
            </Line>
            <Line number="05">
              {"  "}
              <span className="sql-function">SUM</span>
              {"(revenue) "}
              <span className="sql-keyword">OVER</span>
              {" (PARTITION BY region) "}
            </Line>
            <Line number="06">
              {"  "}
              <span className="sql-keyword">AS</span>
              {" region_total"}
            </Line>
            <Line number="07">
              <span className="sql-keyword">FROM</span>
              {" "}
              <span className="sql-table">sales.transactions</span>
            </Line>
            <Line number="08">
              <span className="sql-keyword">WHERE</span>
              {" txn_date >= "}
              <span className="sql-string">{"'2026-01-01'"}</span>
            </Line>
            <Line number="09">
              <span className="sql-keyword">GROUP BY</span>
              {" region;"}
            </Line>
          </code>
        </pre>
        <div className="hidden p-5 font-[var(--font-mono)] text-xs sm:block">
          <p className="mb-4 text-[#6e7690]">{copy.hero.resultLabel}</p>
          <div className="overflow-hidden rounded-md border border-[#edeae1]/10">
            <table className="w-full border-collapse">
              <thead className="bg-white/[0.03] text-[#6e7690]">
                <tr>
                  <th className="px-3 py-2 text-start font-medium">region</th>
                  <th className="px-3 py-2 text-start font-medium">
                    top_products
                  </th>
                  <th className="px-3 py-2 text-start font-medium">total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edeae1]/10 text-[#edeae1]">
                <ResultRow region="EMEA" products="Atlas, Helix" value="4.8M" />
                <ResultRow region="APAC" products="Nova, Quartz" value="3.9M" />
                <ResultRow region="AMER" products="Helix, Pulse" value="6.1M" />
              </tbody>
            </table>
          </div>
          <div className="mt-5 rounded-md border border-[#34a853]/20 bg-[#34a853]/[0.06] p-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#4ade80]" />
              <div className="min-w-0">
                <p className="font-sans text-sm font-semibold text-[#edeae1]">
                  Dry-run passed
                </p>
                <p className="mt-1 font-sans text-xs leading-5 text-[#9aa2b7]">
                  240 MB scanned / estimated cost below review threshold
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Line({
  number,
  children
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <span className="block whitespace-pre">
      <span className="inline-block w-7 select-none text-[#6e7690]">
        {number}
      </span>
      {children}
    </span>
  );
}

function ResultRow({
  region,
  products,
  value
}: {
  region: string;
  products: string;
  value: string;
}) {
  return (
    <tr>
      <td className="px-3 py-2">{region}</td>
      <td className="px-3 py-2 text-[#9aa2b7]">{products}</td>
      <td className="px-3 py-2 text-[#e4c887]">{value}</td>
    </tr>
  );
}

function LandingSectionHead({
  eyebrow,
  title
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
      <div className="max-w-2xl">
        <p className="font-[var(--font-mono)] text-xs font-medium uppercase text-[#c9a35a]">
          {eyebrow}
        </p>
        <h2 className="mt-5 font-[var(--font-display)] text-3xl font-semibold leading-tight text-[#edeae1] sm:text-4xl">
          {title}
        </h2>
      </div>
    </div>
  );
}

function SyntaxButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "focus-ring h-10 rounded-md border px-4 text-sm font-semibold transition",
        active
          ? "border-[#c9a35a] bg-[#c9a35a] text-[#090d17]"
          : "border-[#2b3654] bg-transparent text-[#9aa2b7] hover:border-[#9aa2b7] hover:text-[#edeae1]"
      )}
    >
      {children}
    </button>
  );
}

function SyntaxPanel({
  copy,
  tab
}: {
  copy: LandingCopy;
  tab: "nested" | "window";
}) {
  const isNested = tab === "nested";

  return (
    <div className="overflow-hidden rounded-lg border border-[#2b3654] bg-[#151f37] p-5 shadow-[0_24px_64px_rgba(0,0,0,0.26)]">
      <p className="mb-4 font-[var(--font-mono)] text-xs text-[#6e7690]">
        {isNested ? copy.showcase.nestedCaption : copy.showcase.windowCaption}
      </p>
      <pre className="sql-code overflow-auto whitespace-pre-wrap text-[13px] leading-7 text-[#edeae1]">
        {isNested ? (
          <code>
            <span className="sql-keyword">SELECT</span>
            {"\n  customer_id,\n  "}
            <span className="sql-function">ARRAY_AGG</span>
            {"("}
            <span className="sql-keyword">STRUCT</span>
            {"(order_id, amount, status)) "}
            <span className="sql-keyword">AS</span>
            {" orders,\n  "}
            <span className="sql-function">COUNT</span>
            {"(*) "}
            <span className="sql-keyword">AS</span>
            {" order_count\n"}
            <span className="sql-keyword">FROM</span>
            {" "}
            <span className="sql-table">commerce.orders</span>
            {"\n"}
            <span className="sql-keyword">GROUP BY</span>
            {" customer_id;"}
          </code>
        ) : (
          <code>
            <span className="sql-keyword">SELECT</span>
            {"\n  order_date,\n  daily_revenue,\n  "}
            <span className="sql-function">AVG</span>
            {"(daily_revenue) "}
            <span className="sql-keyword">OVER</span>
            {" (\n    "}
            <span className="sql-keyword">ORDER BY</span>
            {" order_date\n    "}
            <span className="sql-keyword">ROWS BETWEEN</span>
            {" "}
            <span className="sql-number">6</span>
            {" "}
            <span className="sql-keyword">PRECEDING AND CURRENT ROW</span>
            {"\n  ) "}
            <span className="sql-keyword">AS</span>
            {" rolling_7d_avg\n"}
            <span className="sql-keyword">FROM</span>
            {" "}
            <span className="sql-table">analytics.daily_revenue</span>
            {"\n"}
            <span className="sql-keyword">ORDER BY</span>
            {" order_date;"}
          </code>
        )}
      </pre>
    </div>
  );
}

function LandingFooter({ copy }: { copy: LandingCopy }) {
  const footerColumns = [
    {
      title: copy.footer.product,
      links: [
        { label: copy.nav.features, href: "#features" },
        { label: copy.nav.syntax, href: "#syntax" },
        { label: copy.nav.docs, href: "/docs" },
        { label: copy.nav.start, href: "/tools" }
      ]
    },
    {
      title: copy.footer.solutions,
      links: copy.cases.items.map((item) => ({
        label: item.title,
        href: "#cases"
      }))
    },
    {
      title: copy.footer.resources,
      links: [
        { label: copy.cta.secondary, href: "/tutorials" },
        { label: copy.nav.docs, href: "/docs" },
        { label: copy.cta.primary, href: "/tools" },
        { label: copy.trust.eyebrow, href: "#trust" }
      ]
    }
  ];

  return (
    <footer className="border-t border-[#edeae1]/10 bg-[#090d17]">
      <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2 text-[#edeae1]">
              <span className="glow-border flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4285f4] via-[#a855f7] to-[#34a853] text-white shadow-[0_0_24px_rgba(66,133,244,0.28)]">
                <DatabaseZap className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-base font-semibold">GoogleSQL</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[#9aa2b7]">
              {copy.footer.body}
            </p>
          </div>
          {footerColumns.map((column) => (
            <FooterColumn
              key={column.title}
              title={column.title}
              links={column.links}
            />
          ))}
        </div>
        <div className="mt-10 border-t border-[#edeae1]/10 pt-6 text-xs leading-6 text-[#6e7690]">
          <p>{copy.footer.legal}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h2 className="font-[var(--font-mono)] text-xs font-medium uppercase text-[#6e7690]">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-sm text-[#9aa2b7] transition hover:text-[#edeae1]"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
