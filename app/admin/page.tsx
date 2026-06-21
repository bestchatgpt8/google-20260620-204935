import type { Metadata } from "next";
import { AdminConsole } from "@/components/admin-console";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Admin",
  description:
    "GoogleSQL Phase 2 admin console for release gates, dry-runs, and rollback readiness.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#070a12] text-slate-100">
      <SiteHeader active="admin" />
      <AdminConsole />
      <SiteFooter />
    </main>
  );
}
