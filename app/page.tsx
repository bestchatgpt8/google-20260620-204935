import { CheatSheetPreview } from "@/components/cheat-sheet-preview";
import { CopilotWorkbench } from "@/components/copilot-workbench";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TutorialPreview } from "@/components/tutorial-preview";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070a12] text-slate-100">
      <SiteHeader />
      <CopilotWorkbench />
      <section className="border-t border-white/10 bg-[#070a12]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <TutorialPreview />
          <CheatSheetPreview />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
