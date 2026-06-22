export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#070a12]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:px-8">
        <p>
          GoogleSQL.com is an independent product and is not affiliated with,
          endorsed by, or sponsored by Google.
        </p>
        <p>
          Admin release controls, dry-run gates, pricing management, and secure
          checkout are staged through the Worker deployment. Live database
          execution remains governed by BigQuery dry-run safety controls.
        </p>
      </div>
    </footer>
  );
}
