export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#070a12]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
        <p>
          GoogleSQL.com is an independent product and is not affiliated with,
          endorsed by, or sponsored by Google.
        </p>
        <p>
          Phase 2 adds admin release controls and dry-run gates. Live database
          execution, billing, and authenticated enterprise controls remain staged
          for later phases.
        </p>
      </div>
    </footer>
  );
}
