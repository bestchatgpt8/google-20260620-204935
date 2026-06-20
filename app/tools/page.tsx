import type { Metadata } from "next";
import { CopilotWorkbench } from "@/components/copilot-workbench";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "GoogleSQL Tools",
  description:
    "Free GoogleSQL tools for BigQuery: text to SQL, SQL explain, and query optimization."
};

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-[#070a12] text-slate-100">
      <SiteHeader />
      <CopilotWorkbench compact />
      <SiteFooter />
    </main>
  );
}
