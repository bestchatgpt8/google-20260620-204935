import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { tutorials } from "@/lib/content";

export const metadata: Metadata = {
  title: "GoogleSQL Tutorials",
  description:
    "Learn GoogleSQL for BigQuery with practical tutorials for analysts and developers."
};

export default function TutorialsPage() {
  return (
    <main className="min-h-screen bg-[#070a12] text-slate-100">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-normal text-slate-50">
            GoogleSQL Tutorials
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-500">
            Practical lessons for writing safer, faster, and easier-to-review
            BigQuery queries.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tutorials.map((tutorial) => (
            <article
              key={tutorial.title}
              className="resource-card rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)]"
            >
              <p className="text-sm font-medium text-[#60a5fa]">
                {tutorial.level}
              </p>
              <h2 className="mt-3 text-lg font-semibold text-slate-100">
                {tutorial.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {tutorial.summary}
              </p>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
