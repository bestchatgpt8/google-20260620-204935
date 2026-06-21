"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  GitBranch,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
  Zap
} from "lucide-react";
import {
  formatBytes,
  formatCost,
  phase2FeatureFlags,
  releaseTracks,
  reviewQueue,
  workspaceAllowlist,
  type FeatureFlagStatus,
  type Phase2FeatureFlag,
  type QueryRunStatus,
  type ReleaseEnvironment,
  type ReleaseStatus
} from "@/lib/phase2";
import { cn } from "@/lib/utils";

const environments: ReleaseEnvironment[] = [
  "dev",
  "staging",
  "canary",
  "production"
];

export function AdminConsole() {
  const [activeEnvironment, setActiveEnvironment] =
    useState<ReleaseEnvironment>("canary");
  const [flags, setFlags] = useState<Phase2FeatureFlag[]>(phase2FeatureFlags);
  const [rollbackState, setRollbackState] = useState<"ready" | "requested">(
    "ready"
  );

  const activeFlags = useMemo(
    () => flags.filter((flag) => flag.environment === activeEnvironment),
    [activeEnvironment, flags]
  );
  const canaryTrack = releaseTracks.find(
    (track) => track.environment === "canary"
  );
  const activeQueueCount = reviewQueue.filter(
    (item) => item.status !== "approved"
  ).length;

  function updateRollout(id: string, rollout: number) {
    setFlags((current) =>
      current.map((flag) => {
        if (flag.id !== id) {
          return flag;
        }

        const status: FeatureFlagStatus =
          rollout === 0 ? "paused" : rollout < 100 ? "guarded" : "enabled";

        return {
          ...flag,
          rollout,
          status
        };
      })
    );
  }

  return (
    <section className="app-shell-bg min-h-[calc(100vh-56px)] py-6 lg:py-8">
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="min-w-0 space-y-5">
            <section className="glass-panel glow-border overflow-hidden rounded-lg">
              <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-[#34a853]" />
                    <h1 className="text-lg font-semibold text-slate-50">
                      Phase 2 Admin
                    </h1>
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Release gates, query dry-runs, workspace access, and rollback
                    readiness for GoogleSQL.com.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {environments.map((environment) => (
                    <button
                      key={environment}
                      type="button"
                      onClick={() => setActiveEnvironment(environment)}
                      className={cn(
                        "focus-ring rounded-md border px-3 py-2 text-xs font-semibold capitalize transition",
                        activeEnvironment === environment
                          ? "border-[#4285f4]/40 bg-[#4285f4]/15 text-[#60a5fa]"
                          : "border-white/10 bg-white/[0.035] text-slate-500 hover:text-slate-200"
                      )}
                    >
                      {environment}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 p-5 md:grid-cols-4">
                <SummaryMetric
                  icon={GitBranch}
                  label="Canary traffic"
                  value={`${canaryTrack?.trafficPercent ?? 0}%`}
                  tone="blue"
                />
                <SummaryMetric
                  icon={SlidersHorizontal}
                  label="Active flags"
                  value={String(flags.filter((flag) => flag.rollout > 0).length)}
                  tone="purple"
                />
                <SummaryMetric
                  icon={Clock3}
                  label="Review queue"
                  value={String(activeQueueCount)}
                  tone="yellow"
                />
                <SummaryMetric
                  icon={RotateCcw}
                  label="Rollback"
                  value={rollbackState === "requested" ? "Queued" : "Ready"}
                  tone={rollbackState === "requested" ? "yellow" : "green"}
                />
              </div>
            </section>

            <section className="glass-panel overflow-hidden rounded-lg">
              <SectionHeader
                icon={Activity}
                title="Release Pipeline"
                action="Immutable deployments"
              />
              <div className="grid gap-3 p-5 lg:grid-cols-4">
                {releaseTracks.map((track) => (
                  <article
                    key={track.environment}
                    className="rounded-lg border border-white/[0.08] bg-black/[0.14] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold capitalize text-slate-100">
                        {track.environment}
                      </p>
                      <StatusPill status={track.status} />
                    </div>
                    <p className="mt-3 min-h-10 text-xs leading-5 text-slate-500">
                      {track.label}
                    </p>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#4285f4] via-[#34a853] to-[#fbbc05]"
                        style={{ width: `${Math.max(track.trafficPercent, 8)}%` }}
                      />
                    </div>
                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                      <p>
                        <span className="text-slate-600">Build</span>{" "}
                        <span className="sql-code text-slate-300">
                          {track.buildId}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-600">Traffic</span>{" "}
                        <span className="font-semibold text-slate-300">
                          {track.trafficPercent}%
                        </span>
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="glass-panel overflow-hidden rounded-lg">
              <SectionHeader
                icon={Zap}
                title="Feature Rollout"
                action={`${activeEnvironment} controls`}
              />
              <div className="divide-y divide-white/[0.07]">
                {(activeFlags.length ? activeFlags : flags).map((flag) => (
                  <div
                    key={flag.id}
                    className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-slate-100">
                          {flag.name}
                        </h2>
                        <FlagPill status={flag.status} />
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {flag.description}
                      </p>
                      <p className="mt-2 text-[11px] font-medium text-slate-600">
                        Owner: {flag.owner} · Updated: {flag.updatedAt}
                      </p>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-500">Rollout</span>
                        <span className="font-semibold text-slate-200">
                          {flag.rollout}%
                        </span>
                      </div>
                      <input
                        aria-label={`${flag.name} rollout`}
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={flag.rollout}
                        onChange={(event) =>
                          updateRollout(flag.id, Number(event.target.value))
                        }
                        className="w-full accent-[#4285f4]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-5">
            <section className="glass-panel overflow-hidden rounded-lg">
              <SectionHeader
                icon={Database}
                title="Run Review"
                action="Dry-run queue"
              />
              <div className="divide-y divide-white/[0.07]">
                {reviewQueue.map((item) => (
                  <div key={item.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="sql-code text-sm font-semibold text-slate-100">
                          {item.id}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.workspace} · {item.queryType}
                        </p>
                      </div>
                      <RunStatusPill status={item.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <TinyMetric
                        label="Cost"
                        value={formatCost(item.estimatedCostUsd)}
                      />
                      <TinyMetric
                        label="Scan"
                        value={formatBytes(item.scannedBytes)}
                      />
                      <TinyMetric label="Age" value={item.submittedAt} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel overflow-hidden rounded-lg">
              <SectionHeader
                icon={UsersRound}
                title="Workspace Access"
                action="Allowlist"
              />
              <div className="divide-y divide-white/[0.07]">
                {workspaceAllowlist.map((workspace) => (
                  <div
                    key={workspace.workspace}
                    className="flex items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100">
                        {workspace.workspace}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {workspace.owner} · {workspace.plan}
                      </p>
                    </div>
                    <AccessPill access={workspace.runAccess} />
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel overflow-hidden rounded-lg">
              <SectionHeader
                icon={RotateCcw}
                title="Rollback Target"
                action="Last healthy"
              />
              <div className="p-5">
                <div className="rounded-lg border border-[#34a853]/15 bg-[#34a853]/[0.07] p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#34a853]" />
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        prod-20260620
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Git SHA phase1 · Health checks passed
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRollbackState("requested")}
                  className="focus-ring mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#ea4335] px-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(234,67,53,0.28)] transition hover:bg-red-500"
                >
                  <RotateCcw className="h-4 w-4" />
                  {rollbackState === "requested"
                    ? "Rollback queued"
                    : "Queue rollback"}
                </button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  action
}: {
  icon: typeof Activity;
  title: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-[#60a5fa]" />
        <h2 className="text-base font-semibold text-slate-50">{title}</h2>
      </div>
      <span className="text-xs font-semibold text-slate-500">{action}</span>
    </div>
  );
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  tone: "blue" | "green" | "purple" | "yellow";
}) {
  const toneClassName = {
    blue: "text-[#60a5fa] bg-[#4285f4]/10 border-[#4285f4]/20",
    green: "text-[#4ade80] bg-[#34a853]/10 border-[#34a853]/20",
    purple: "text-[#d8b4fe] bg-[#a855f7]/10 border-[#a855f7]/20",
    yellow: "text-[#facc15] bg-[#fbbc05]/10 border-[#fbbc05]/20"
  }[tone];

  return (
    <div className="rounded-lg border border-white/[0.08] bg-black/[0.14] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className={cn("rounded-md border p-2", toneClassName)}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-2xl font-semibold text-slate-50">{value}</span>
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

function TinyMetric({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2">
      <span className="block text-[11px] text-slate-600">{label}</span>
      <span className="mt-1 block font-semibold text-slate-200">{value}</span>
    </span>
  );
}

function StatusPill({ status }: { status: ReleaseStatus }) {
  const className = {
    healthy: "border-[#34a853]/25 bg-[#34a853]/10 text-[#4ade80]",
    watching: "border-[#fbbc05]/25 bg-[#fbbc05]/10 text-[#facc15]",
    paused: "border-[#ea4335]/25 bg-[#ea4335]/10 text-[#f87171]"
  }[status];

  return (
    <span className={cn("rounded px-2 py-1 text-[11px] font-semibold", className)}>
      {status}
    </span>
  );
}

function FlagPill({ status }: { status: FeatureFlagStatus }) {
  const className = {
    enabled: "border-[#34a853]/25 bg-[#34a853]/10 text-[#4ade80]",
    guarded: "border-[#4285f4]/25 bg-[#4285f4]/10 text-[#60a5fa]",
    paused: "border-[#ea4335]/25 bg-[#ea4335]/10 text-[#f87171]"
  }[status];

  return (
    <span className={cn("rounded px-2 py-1 text-[11px] font-semibold", className)}>
      {status}
    </span>
  );
}

function RunStatusPill({ status }: { status: QueryRunStatus }) {
  const icon = {
    approved: CheckCircle2,
    needs_approval: AlertTriangle,
    blocked: AlertTriangle
  }[status];
  const Icon = icon;
  const className = {
    approved: "border-[#34a853]/25 bg-[#34a853]/10 text-[#4ade80]",
    needs_approval: "border-[#fbbc05]/25 bg-[#fbbc05]/10 text-[#facc15]",
    blocked: "border-[#ea4335]/25 bg-[#ea4335]/10 text-[#f87171]"
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {status.replace("_", " ")}
    </span>
  );
}

function AccessPill({
  access
}: {
  access: "allowlisted" | "review" | "blocked";
}) {
  const className = {
    allowlisted: "border-[#34a853]/25 bg-[#34a853]/10 text-[#4ade80]",
    review: "border-[#fbbc05]/25 bg-[#fbbc05]/10 text-[#facc15]",
    blocked: "border-[#ea4335]/25 bg-[#ea4335]/10 text-[#f87171]"
  }[access];

  return (
    <span className={cn("rounded px-2 py-1 text-[11px] font-semibold", className)}>
      {access}
    </span>
  );
}
