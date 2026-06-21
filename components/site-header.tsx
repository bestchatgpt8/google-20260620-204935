import Link from "next/link";
import { Bell, Database, DatabaseZap } from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { cn } from "@/lib/utils";

type NavKey = "ai" | "query" | "history" | "saved" | "settings" | "admin";

const navItems = [
  { href: "/tools", label: "AI", key: "ai", compact: true },
  { href: "/", label: "Query", key: "query" },
  { href: "/tutorials", label: "History", key: "history" },
  { href: "/cheat-sheets", label: "Saved", key: "saved" },
  { href: "/pricing", label: "Settings", key: "settings" },
  { href: "/admin", label: "Admin", key: "admin" }
] satisfies Array<{
  href: string;
  label: string;
  key: NavKey;
  compact?: boolean;
}>;

export function SiteHeader({ active = "query" }: { active?: NavKey }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070a12]/[0.86] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-5">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-slate-50">
            <span className="glow-border flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#4285f4] via-[#a855f7] to-[#34a853] text-white shadow-[0_0_24px_rgba(66,133,244,0.28)]">
              <DatabaseZap className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-base font-semibold tracking-normal">
              <span className="text-slate-100">GoogleSQL</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition",
                  item.compact ? "px-2 text-xs" : "",
                  active === item.key
                    ? "bg-[#4285f4]/[0.15] text-[#60a5fa] shadow-[0_0_18px_rgba(66,133,244,0.12)]"
                    : item.compact
                      ? "bg-[#4285f4]/10 text-[#60a5fa]"
                      : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center rounded-lg border border-white/10 bg-white/[0.035] p-1 text-xs text-slate-500 shadow-[0_14px_30px_rgba(0,0,0,0.18)] sm:flex">
            <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1">
              <Database className="h-3.5 w-3.5" />
              analytics
            </span>
            <span className="rounded-md bg-white/[0.06] px-2 py-1 font-medium text-slate-300">
              production
            </span>
          </div>
          <button
            type="button"
            title="Notifications"
            aria-label="Notifications"
            className="focus-ring hidden rounded-md p-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200 sm:inline-flex"
          >
            <Bell className="h-4 w-4" />
          </button>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
