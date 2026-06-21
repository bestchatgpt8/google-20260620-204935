import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { cheatSheets } from "@/lib/content";

export const metadata: Metadata = {
  title: "GoogleSQL Cheat Sheets",
  description:
    "Quick GoogleSQL references for BigQuery functions, arrays, JSON, dates, and window functions."
};

export default function CheatSheetsPage() {
  return (
    <main className="min-h-screen bg-[#070a12] text-slate-100">
      <SiteHeader active="saved" />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-50">
            GoogleSQL Cheat Sheets
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-500">
            Compact references for common BigQuery work: dates, arrays, JSON,
            aggregations, and window functions.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {cheatSheets.map((sheet) => (
            <article
              key={sheet.title}
              className="resource-card rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)]"
            >
              <h2 className="text-lg font-semibold text-slate-100">{sheet.title}</h2>
              <ul className="mt-4 space-y-3">
                {sheet.items.map((item) => (
                  <li
                    key={item}
                    className="sql-code rounded border border-white/10 bg-[#05070d] px-3 py-2 text-slate-300"
                  >
                    {item}
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
