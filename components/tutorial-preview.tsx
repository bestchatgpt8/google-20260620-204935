import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { tutorials } from "@/lib/content";

export function TutorialPreview() {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-50">
            GoogleSQL Tutorials
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            SEO-friendly learning paths for BigQuery analysts and developers.
          </p>
        </div>
        <Link
          href="/tutorials"
          className="hidden items-center gap-2 text-sm font-semibold text-[#60a5fa] transition hover:text-[#93c5fd] sm:inline-flex"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {tutorials.slice(0, 3).map((tutorial) => (
          <article
            key={tutorial.title}
            className="resource-card rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)]"
          >
            <p className="text-xs font-semibold uppercase text-[#60a5fa]">
              {tutorial.level}
            </p>
            <h3 className="mt-3 text-base font-semibold text-slate-100">
              {tutorial.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {tutorial.summary}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
