import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cheatSheets } from "@/lib/content";

export function CheatSheetPreview() {
  return (
    <section className="resource-card rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-50">
            Cheat Sheets
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Fast references for dates, JSON, arrays, and windows.
          </p>
        </div>
        <Link
          href="/cheat-sheets"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#60a5fa] transition hover:text-[#93c5fd]"
        >
          Open
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-5 space-y-4">
        {cheatSheets.slice(0, 2).map((sheet) => (
          <div
            key={sheet.title}
            className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0"
          >
            <h3 className="text-sm font-semibold text-slate-100">{sheet.title}</h3>
            <p className="sql-code mt-2 rounded border border-white/10 bg-[#05070d] px-3 py-2 text-slate-300">
              {sheet.items[0]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
