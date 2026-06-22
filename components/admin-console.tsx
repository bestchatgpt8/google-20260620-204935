"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  GitBranch,
  LockKeyhole,
  RefreshCcw,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
  Zap
} from "lucide-react";
import type { AdminState, QueryRunDetail } from "@/lib/admin-store";
import {
  formatBytes,
  formatCost,
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

type AdminUser = {
  provider: "google" | "github";
  email: string;
  name: string;
  avatarUrl?: string;
  role: "admin" | "member";
};

type AdminLoadState =
  | { status: "loading" }
  | { status: "ready"; state: AdminState; user: AdminUser }
  | {
      status: "locked";
      code: string;
      message: string;
      loginUrl?: string;
    }
  | { status: "error"; message: string };

type RunDetailState =
  | { status: "idle" }
  | { status: "loading"; id: string }
  | { status: "ready"; run: QueryRunDetail }
  | { status: "error"; id: string; message: string };

type RunDetailResponse = {
  ok?: boolean;
  run?: QueryRunDetail;
  code?: string;
  message?: string;
};

type SchemaCatalogField =
  AdminState["schemaCatalog"][number]["fields"][number];

export function AdminConsole() {
  const [loadState, setLoadState] = useState<AdminLoadState>({
    status: "loading"
  });
  const [activeEnvironment, setActiveEnvironment] =
    useState<ReleaseEnvironment>("canary");
  const [rollbackState, setRollbackState] = useState<"ready" | "requested">(
    "ready"
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingFlagId, setPendingFlagId] = useState<string | null>(null);
  const [pendingReviewId, setPendingReviewId] = useState<string | null>(null);
  const [pendingSchemaFieldId, setPendingSchemaFieldId] = useState<
    string | null
  >(null);
  const [runDetail, setRunDetail] = useState<RunDetailState>({
    status: "idle"
  });

  const refreshAdminState = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/state", {
        cache: "no-store",
        credentials: "include"
      });
      const data = (await response.json().catch(() => null)) as unknown;

      if (response.status === 401 || response.status === 403) {
        const error = isApiError(data)
          ? data
          : {
              code: "admin_locked",
              message: "Admin access is locked."
            };
        setLoadState({
          status: "locked",
          code: error.code,
          message: error.message,
          loginUrl: error.loginUrl
        });
        return;
      }

      if (!response.ok || !isAdminStateResponse(data)) {
        throw new Error(
          isApiError(data) ? data.message : "Admin state could not be loaded."
        );
      }

      setLoadState({
        status: "ready",
        state: data.state,
        user: data.user
      });
      setNotice(null);
    } catch (error) {
      setLoadState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Admin state could not be loaded."
      });
    }
  }, []);

  useEffect(() => {
    void refreshAdminState();
  }, [refreshAdminState]);

  useEffect(() => {
    if (
      loadState.status === "locked" &&
      loadState.code !== "admin_required" &&
      loadState.loginUrl
    ) {
      window.location.replace(loadState.loginUrl);
    }
  }, [loadState]);

  const readyState = loadState.status === "ready" ? loadState : null;
  const state = readyState?.state;
  const featureFlags = state?.featureFlags;
  const flags = useMemo(() => featureFlags ?? [], [featureFlags]);
  const activeFlags = useMemo(
    () => flags.filter((flag) => flag.environment === activeEnvironment),
    [activeEnvironment, flags]
  );
  const canaryTrack = state?.releaseTracks.find(
    (track) => track.environment === "canary"
  );
  const activeQueueCount =
    state?.reviewQueue.filter((item) => item.status !== "approved").length ?? 0;
  const schemaFieldCount =
    state?.schemaCatalog.reduce(
      (count, table) => count + table.fields.length,
      0
    ) ?? 0;
  const queryableFieldCount =
    state?.schemaCatalog.reduce(
      (count, table) =>
        count + table.fields.filter((field) => field.queryable).length,
      0
    ) ?? 0;

  function previewRollout(id: string, rollout: number) {
    setLoadState((current) => {
      if (current.status !== "ready") {
        return current;
      }

      return {
        ...current,
        state: {
          ...current.state,
          featureFlags: current.state.featureFlags.map((flag) =>
            flag.id === id
              ? {
                  ...flag,
                  rollout,
                  status: getFlagStatus(rollout)
                }
              : flag
          )
        }
      };
    });
  }

  async function commitRollout(id: string, rollout: number) {
    setPendingFlagId(id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/feature-flags/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ rollout })
      });
      const data = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        if (isApiError(data) && data.code === "storage_not_configured") {
          setNotice(
            "D1 is not bound; this rollout change remains a local preview."
          );
          return;
        }

        throw new Error(
          isApiError(data) ? data.message : "Rollout update failed."
        );
      }

      if (!isFeatureFlagResponse(data)) {
        throw new Error("Rollout update returned an unexpected response.");
      }

      replaceFeatureFlag(data.featureFlag);
      setNotice("Rollout saved to D1 and recorded in the audit log.");
      void refreshAdminState();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Rollout update failed."
      );
    } finally {
      setPendingFlagId(null);
    }
  }

  async function requestRollback() {
    setRollbackState("requested");
    setNotice(null);

    try {
      const response = await fetch("/api/admin/rollback", {
        method: "POST",
        credentials: "include"
      });
      const data = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        if (isApiError(data) && data.code === "storage_not_configured") {
          setNotice(
            "D1 is not bound; rollback stays in local queued preview mode."
          );
          return;
        }

        throw new Error(
          isApiError(data) ? data.message : "Rollback request failed."
        );
      }

      setNotice("Rollback request saved to the D1 audit log.");
      void refreshAdminState();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Rollback request failed."
      );
    }
  }

  async function updateReviewStatus(id: string, status: QueryRunStatus) {
    setPendingReviewId(id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/run-reviews/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });
      const data = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        throw new Error(
          isApiError(data) ? data.message : "Run review update failed."
        );
      }

      if (!isRunReviewResponse(data)) {
        throw new Error("Run review update returned an unexpected response.");
      }

      replaceRunReview(data.review);
      setRunDetail((current) =>
        current.status === "ready" && current.run.id === data.review.id
          ? {
              status: "ready",
              run: {
                ...current.run,
                status: data.review.status,
                updatedAt: data.review.submittedAt
              }
            }
          : current
      );
      setNotice(
        status === "approved"
          ? "Run review approved and recorded in the audit log."
          : "Run review blocked and recorded in the audit log."
      );
      void refreshAdminState();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Run review update failed."
      );
    } finally {
      setPendingReviewId(null);
    }
  }

  async function updateSchemaFieldPolicy(
    field: SchemaCatalogField,
    patch: Pick<Partial<SchemaCatalogField>, "queryable" | "pii">
  ) {
    const preview = {
      ...field,
      ...patch
    };
    setPendingSchemaFieldId(field.id);
    setNotice(null);
    replaceSchemaField(preview);

    try {
      const response = await fetch(`/api/admin/schema-fields/${field.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(patch)
      });
      const data = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        if (isApiError(data) && data.code === "storage_not_configured") {
          setNotice(
            "D1 is not bound; schema policy remains a local preview."
          );
          return;
        }

        throw new Error(
          isApiError(data)
            ? data.message
            : "Schema field policy update failed."
        );
      }

      if (!isSchemaFieldResponse(data)) {
        throw new Error(
          "Schema field policy update returned an unexpected response."
        );
      }

      replaceSchemaField(data.schemaField);
      setNotice("Schema field policy saved to D1 and recorded in the audit log.");
      void refreshAdminState();
    } catch (error) {
      replaceSchemaField(field);
      setNotice(
        error instanceof Error
          ? error.message
          : "Schema field policy update failed."
      );
    } finally {
      setPendingSchemaFieldId(null);
    }
  }

  async function openRunDetail(id: string) {
    setRunDetail({
      status: "loading",
      id
    });

    try {
      const response = await fetch(`/api/admin/run-reviews/${id}`, {
        credentials: "include",
        cache: "no-store"
      });
      const data = (await response
        .json()
        .catch(() => null)) as RunDetailResponse | null;

      if (!response.ok || !data?.run) {
        throw new Error(
          data?.message ?? "Run detail could not be loaded."
        );
      }

      setRunDetail({
        status: "ready",
        run: data.run
      });
    } catch (error) {
      setRunDetail({
        status: "error",
        id,
        message:
          error instanceof Error
            ? error.message
            : "Run detail could not be loaded."
      });
    }
  }

  function replaceFeatureFlag(featureFlag: Phase2FeatureFlag) {
    setLoadState((current) => {
      if (current.status !== "ready") {
        return current;
      }

      return {
        ...current,
        state: {
          ...current.state,
          featureFlags: current.state.featureFlags.map((flag) =>
            flag.id === featureFlag.id ? featureFlag : flag
          )
        }
      };
    });
  }

  function replaceRunReview(review: AdminState["reviewQueue"][number]) {
    setLoadState((current) => {
      if (current.status !== "ready") {
        return current;
      }

      return {
        ...current,
        state: {
          ...current.state,
          reviewQueue: current.state.reviewQueue.map((item) =>
            item.id === review.id ? review : item
          )
        }
      };
    });
  }

  function replaceSchemaField(field: SchemaCatalogField) {
    setLoadState((current) => {
      if (current.status !== "ready") {
        return current;
      }

      return {
        ...current,
        state: {
          ...current.state,
          schemaCatalog: current.state.schemaCatalog.map((table) => ({
            ...table,
            fields: table.fields.map((item) =>
              item.id === field.id ? field : item
            )
          }))
        }
      };
    });
  }

  if (loadState.status === "loading") {
    return (
      <AdminShell>
        <StatusPanel
          icon={RefreshCcw}
          title="Loading admin state"
          message="Connecting to the Cloudflare Pages admin API."
        />
      </AdminShell>
    );
  }

  if (loadState.status === "locked") {
    return (
      <AdminShell>
        <StatusPanel
          icon={LockKeyhole}
          title={
            loadState.code === "admin_required"
              ? "Administrator required"
              : "Sign in required"
          }
          message={loadState.message}
        >
          <Link
            href={loadState.loginUrl ?? "/login?returnTo=%2Fadmin"}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-lg bg-[#4285f4] px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Sign in
          </Link>
        </StatusPanel>
      </AdminShell>
    );
  }

  if (loadState.status === "error") {
    return (
      <AdminShell>
        <StatusPanel
          icon={AlertTriangle}
          title="Admin API unavailable"
          message={loadState.message}
        >
          <button
            type="button"
            onClick={() => void refreshAdminState()}
            className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </button>
        </StatusPanel>
      </AdminShell>
    );
  }

  if (!readyState || !state) {
    return null;
  }

  return (
    <AdminShell>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 space-y-5">
          <section className="glass-panel glow-border overflow-hidden rounded-lg">
            <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#34a853]" />
                  <h1 className="text-lg font-semibold text-slate-50">
                    Phase 4 Admin
                  </h1>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  Signed in as {readyState.user.email} with{" "}
                  <span className="font-semibold text-slate-300">
                    {readyState.user.role}
                  </span>{" "}
                  access.
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

            <div className="border-b border-white/10 px-5 py-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <div
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between",
                    state.storage.configured
                      ? "border-[#34a853]/20 bg-[#34a853]/[0.06]"
                      : "border-[#fbbc05]/20 bg-[#fbbc05]/[0.06]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Database
                      className={cn(
                        "mt-0.5 h-5 w-5",
                        state.storage.configured
                          ? "text-[#34a853]"
                          : "text-[#fbbc05]"
                      )}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {state.storage.mode === "d1"
                          ? `D1 ${state.storage.binding}`
                          : "Seed preview mode"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {state.storage.message}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void refreshAdminState()}
                    className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
                  >
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Refresh
                  </button>
                </div>

                <div
                  className={cn(
                    "rounded-lg border p-4",
                    state.bigQuery.configured
                      ? "border-[#4285f4]/20 bg-[#4285f4]/[0.07]"
                      : "border-[#a855f7]/20 bg-[#a855f7]/[0.07]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Zap
                      className={cn(
                        "mt-0.5 h-5 w-5",
                        state.bigQuery.configured
                          ? "text-[#60a5fa]"
                          : "text-[#d8b4fe]"
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-100">
                        BigQuery{" "}
                        {state.bigQuery.mode === "live"
                          ? "live dry-run"
                          : "simulated dry-run"}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {state.bigQuery.message}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <ConfigMetric
                      label="Project"
                      value={state.bigQuery.projectId ?? "Not set"}
                    />
                    <ConfigMetric
                      label="Location"
                      value={state.bigQuery.location ?? "Default"}
                    />
                    <ConfigMetric
                      label="Max bytes"
                      value={
                        state.bigQuery.maxBytesBilled === null
                          ? "Not set"
                          : formatBytes(state.bigQuery.maxBytesBilled)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {notice ? (
              <div className="border-b border-white/10 px-5 py-3">
                <p className="rounded-lg border border-[#4285f4]/20 bg-[#4285f4]/[0.07] px-3 py-2 text-xs font-medium text-[#93c5fd]">
                  {notice}
                </p>
              </div>
            ) : null}

            <div className="grid gap-3 p-5 md:grid-cols-5">
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
                icon={Database}
                label="Queryable fields"
                value={`${queryableFieldCount}/${schemaFieldCount}`}
                tone="green"
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
              {state.releaseTracks.map((track) => (
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
                      Owner: {flag.owner} / Updated: {flag.updatedAt}
                    </p>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-500">Rollout</span>
                      <span className="font-semibold text-slate-200">
                        {pendingFlagId === flag.id ? "Saving..." : `${flag.rollout}%`}
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
                        previewRollout(flag.id, Number(event.currentTarget.value))
                      }
                      onBlur={(event) =>
                        void commitRollout(
                          flag.id,
                          Number(event.currentTarget.value)
                        )
                      }
                      onPointerUp={(event) =>
                        void commitRollout(
                          flag.id,
                          Number(event.currentTarget.value)
                        )
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
              {state.reviewQueue.map((item) => (
                <div key={item.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="sql-code text-sm font-semibold text-slate-100">
                        {item.id}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.workspace} / {item.queryType}
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
                  <div
                    className={cn(
                      "mt-4 grid gap-2",
                      item.status === "needs_approval"
                        ? "grid-cols-3"
                        : "grid-cols-1"
                    )}
                  >
                    <button
                      type="button"
                      disabled={
                        runDetail.status === "loading" &&
                        runDetail.id === item.id
                      }
                      onClick={() => void openRunDetail(item.id)}
                      className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#4285f4]/25 bg-[#4285f4]/10 px-3 text-xs font-semibold text-[#93c5fd] transition hover:bg-[#4285f4]/15 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Activity className="h-3.5 w-3.5" />
                      Details
                    </button>
                    {item.status === "needs_approval" ? (
                      <>
                      <button
                        type="button"
                        disabled={pendingReviewId === item.id}
                        onClick={() =>
                          void updateReviewStatus(item.id, "approved")
                        }
                        className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#34a853]/25 bg-[#34a853]/10 px-3 text-xs font-semibold text-[#4ade80] transition hover:bg-[#34a853]/15 disabled:cursor-wait disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={pendingReviewId === item.id}
                        onClick={() =>
                          void updateReviewStatus(item.id, "blocked")
                        }
                        className="focus-ring inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#ea4335]/25 bg-[#ea4335]/10 px-3 text-xs font-semibold text-[#f87171] transition hover:bg-[#ea4335]/15 disabled:cursor-wait disabled:opacity-60"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Block
                      </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <RunDetailPanel
            state={runDetail}
            onClose={() =>
              setRunDetail({
                status: "idle"
              })
            }
          />

          <SchemaCatalogPanel
            tables={state.schemaCatalog}
            pendingFieldId={pendingSchemaFieldId}
            onPolicyChange={(field, patch) =>
              void updateSchemaFieldPolicy(field, patch)
            }
          />

          <section className="glass-panel overflow-hidden rounded-lg">
            <SectionHeader
              icon={UsersRound}
              title="Workspace Access"
              action="Allowlist"
            />
            <div className="divide-y divide-white/[0.07]">
              {state.workspaceAllowlist.map((workspace) => (
                <div
                  key={workspace.workspace}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-100">
                      {workspace.workspace}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {workspace.owner} / {workspace.plan}
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
                      Git SHA phase1 / Health checks passed
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void requestRollback()}
                className="focus-ring mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#ea4335] px-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(234,67,53,0.28)] transition hover:bg-red-500"
              >
                <RotateCcw className="h-4 w-4" />
                {rollbackState === "requested"
                  ? "Rollback queued"
                  : "Queue rollback"}
              </button>
            </div>
          </section>

          <section className="glass-panel overflow-hidden rounded-lg">
            <SectionHeader
              icon={ShieldCheck}
              title="Audit Log"
              action="Recent events"
            />
            <div className="divide-y divide-white/[0.07]">
              {state.auditEvents.map((event) => (
                <div key={event.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-100">
                        {event.action}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {event.actorEmail} / {event.target}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-slate-600">
                      {formatAuditTime(event.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <section className="app-shell-bg min-h-[calc(100vh-56px)] py-6 lg:py-8">
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

function StatusPanel({
  icon: Icon,
  title,
  message,
  children
}: {
  icon: typeof Activity;
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <section className="glass-panel glow-border mx-auto max-w-2xl overflow-hidden rounded-lg p-6">
      <div className="flex items-start gap-4">
        <span className="rounded-lg border border-[#4285f4]/20 bg-[#4285f4]/10 p-3 text-[#60a5fa]">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-slate-50">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
          {children ? <div className="mt-5">{children}</div> : null}
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

function ConfigMetric({ label, value }: { label: string; value: string }) {
  return (
    <span className="min-w-0 rounded-lg border border-white/[0.08] bg-black/[0.16] px-3 py-2">
      <span className="block text-[11px] text-slate-600">{label}</span>
      <span className="mt-1 block break-words text-xs font-semibold text-slate-200">
        {value}
      </span>
    </span>
  );
}

function RunDetailPanel({
  state,
  onClose
}: {
  state: RunDetailState;
  onClose: () => void;
}) {
  let body: ReactNode;
  let action = "Select run";

  if (state.status === "loading") {
    action = state.id;
    body = (
      <div className="flex items-center gap-3 p-5 text-sm text-slate-500">
        <RefreshCcw className="h-4 w-4 animate-spin text-[#60a5fa]" />
        Loading run detail...
      </div>
    );
  } else if (state.status === "error") {
    action = state.id;
    body = (
      <div className="space-y-4 p-5">
        <div className="rounded-lg border border-[#ea4335]/20 bg-[#ea4335]/[0.08] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-[#f87171]" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-100">
                Detail unavailable
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {state.message}
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
        >
          Close
        </button>
      </div>
    );
  } else if (state.status === "ready") {
    const { run } = state;
    action = run.mode === "live" ? "Live dry-run" : "Simulated";

    body = (
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="sql-code break-all text-sm font-semibold text-slate-100">
              {run.id}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {run.workspace} / {run.actorEmail ?? "anonymous"} /{" "}
              {formatDateTime(run.updatedAt)}
            </p>
          </div>
          <RunStatusPill status={run.status} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <TinyMetric label="Cost" value={formatCost(run.estimatedCostUsd)} />
          <TinyMetric label="Scan" value={formatBytes(run.scannedBytes)} />
          <TinyMetric label="Time" value={formatRuntime(run.expectedRuntimeMs)} />
        </div>

        <pre className="sql-code max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-white/[0.08] bg-black/[0.28] p-3 text-xs leading-6 text-slate-200">
          {run.sql}
        </pre>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
            Referenced tables
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {run.referencedTables.length ? (
              run.referencedTables.map((table) => (
                <span
                  key={table}
                  className="sql-code rounded border border-[#4285f4]/20 bg-[#4285f4]/10 px-2 py-1 text-[11px] font-semibold text-[#93c5fd]"
                >
                  {table}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-600">None detected</span>
            )}
          </div>
        </div>

        <div className="divide-y divide-white/[0.07] rounded-lg border border-white/[0.08] bg-black/[0.16]">
          {run.checks.map((check) => {
            const Icon = check.status === "pass" ? CheckCircle2 : AlertTriangle;

            return (
              <div key={check.label} className="flex items-start gap-3 p-3">
                <Icon
                  className={cn(
                    "mt-0.5 h-4 w-4",
                    check.status === "pass"
                      ? "text-[#4ade80]"
                      : "text-[#facc15]"
                  )}
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-100">
                    {check.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {check.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {run.error ? (
          <div className="rounded-lg border border-[#ea4335]/20 bg-[#ea4335]/[0.08] p-3">
            <p className="text-xs font-semibold text-[#f87171]">
              {run.error.code}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {run.error.message}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08]"
        >
          Close
        </button>
      </div>
    );
  } else {
    body = (
      <div className="p-5">
        <div className="rounded-lg border border-white/[0.08] bg-black/[0.14] p-4">
          <p className="text-sm font-semibold text-slate-100">
            No run selected
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Open a Run Review item to inspect its SQL and safety checks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="glass-panel overflow-hidden rounded-lg">
      <SectionHeader icon={ShieldCheck} title="Run Detail" action={action} />
      {body}
    </section>
  );
}

function SchemaCatalogPanel({
  tables,
  pendingFieldId,
  onPolicyChange
}: {
  tables: AdminState["schemaCatalog"];
  pendingFieldId: string | null;
  onPolicyChange: (
    field: SchemaCatalogField,
    patch: Pick<Partial<SchemaCatalogField>, "queryable" | "pii">
  ) => void;
}) {
  return (
    <section className="glass-panel overflow-hidden rounded-lg">
      <SectionHeader
        icon={Database}
        title="Schema Catalog"
        action={`${tables.length} tables`}
      />
      {tables.length ? (
        <div className="divide-y divide-white/[0.07]">
          {tables.map((table) => {
            const piiCount = table.fields.filter((field) => field.pii).length;
            const queryableCount = table.fields.filter(
              (field) => field.queryable
            ).length;

            return (
              <div key={table.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="sql-code break-all text-sm font-semibold text-slate-100">
                      {table.name}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {table.description}
                    </p>
                  </div>
                  <span className="shrink-0 rounded border border-[#4285f4]/20 bg-[#4285f4]/10 px-2 py-1 text-[11px] font-semibold text-[#93c5fd]">
                    {table.workspace}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <TinyMetric
                    label="Rows"
                    value={formatCompactNumber(table.rowCount)}
                  />
                  <TinyMetric
                    label="Queryable"
                    value={`${queryableCount}/${table.fields.length}`}
                  />
                  <TinyMetric label="PII" value={String(piiCount)} />
                </div>

                <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-white/[0.08] bg-black/[0.16]">
                  <div className="divide-y divide-white/[0.07]">
                    {table.fields.map((field) => {
                      const isPending = pendingFieldId === field.id;

                      return (
                        <div
                          key={field.id}
                          className={cn(
                            "grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_146px]",
                            !field.queryable && "opacity-60"
                          )}
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="sql-code break-all text-xs font-semibold text-slate-100">
                                {field.name}
                              </p>
                              <span className="rounded border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                {field.type}
                              </span>
                              {field.usedInExamples ? (
                                <span className="rounded border border-[#4285f4]/20 bg-[#4285f4]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#93c5fd]">
                                  used
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-[11px] leading-5 text-slate-600">
                              {field.description}
                            </p>
                          </div>

                          <div className="grid content-start gap-2">
                            <label className="inline-flex h-8 items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.035] px-2 text-[11px] font-semibold text-slate-300 transition focus-within:border-[#4285f4]/40">
                              <input
                                type="checkbox"
                                checked={field.queryable}
                                disabled={isPending}
                                onChange={(event) =>
                                  onPolicyChange(field, {
                                    queryable: event.currentTarget.checked
                                  })
                                }
                                className="h-3.5 w-3.5 accent-[#4285f4]"
                              />
                              Queryable
                            </label>
                            <label className="inline-flex h-8 items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.035] px-2 text-[11px] font-semibold text-slate-300 transition focus-within:border-[#ea4335]/40">
                              <input
                                type="checkbox"
                                checked={field.pii}
                                disabled={isPending}
                                onChange={(event) =>
                                  onPolicyChange(field, {
                                    pii: event.currentTarget.checked
                                  })
                                }
                                className="h-3.5 w-3.5 accent-[#ea4335]"
                              />
                              PII
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-5">
          <div className="rounded-lg border border-white/[0.08] bg-black/[0.14] p-4">
            <p className="text-sm font-semibold text-slate-100">
              No schema tables
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Bind Cloudflare D1 to persist schema catalog state.
            </p>
          </div>
        </div>
      )}
    </section>
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

function getFlagStatus(rollout: number): FeatureFlagStatus {
  if (rollout === 0) {
    return "paused";
  }

  if (rollout < 100) {
    return "guarded";
  }

  return "enabled";
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function formatAuditTime(value: string) {
  if (!value.includes("T")) {
    return value;
  }

  return value.slice(0, 16).replace("T", " ");
}

function formatDateTime(value: string) {
  if (!value.includes("T")) {
    return value;
  }

  return value.slice(0, 16).replace("T", " ");
}

function formatRuntime(value: number) {
  if (value <= 0) {
    return "0s";
  }

  if (value < 1000) {
    return `${value}ms`;
  }

  return `${(value / 1000).toFixed(1)}s`;
}

function isAdminStateResponse(value: unknown): value is {
  ok: true;
  user: AdminUser;
  state: AdminState;
} {
  if (!isRecord(value) || value.ok !== true) {
    return false;
  }

  return isAdminUser(value.user) && isRecord(value.state);
}

function isFeatureFlagResponse(value: unknown): value is {
  ok: true;
  featureFlag: Phase2FeatureFlag;
} {
  return isRecord(value) && value.ok === true && isRecord(value.featureFlag);
}

function isRunReviewResponse(value: unknown): value is {
  ok: true;
  review: AdminState["reviewQueue"][number];
} {
  return isRecord(value) && value.ok === true && isRecord(value.review);
}

function isSchemaFieldResponse(value: unknown): value is {
  ok: true;
  schemaField: SchemaCatalogField;
} {
  return (
    isRecord(value) &&
    value.ok === true &&
    isRecord(value.schemaField) &&
    typeof value.schemaField.id === "string"
  );
}

function isAdminUser(value: unknown): value is AdminUser {
  if (!isRecord(value)) {
    return false;
  }

  return (
    (value.provider === "google" || value.provider === "github") &&
    typeof value.email === "string" &&
    typeof value.name === "string" &&
    (value.role === "admin" || value.role === "member")
  );
}

function isApiError(value: unknown): value is {
  code: string;
  message: string;
  loginUrl?: string;
} {
  return (
    isRecord(value) &&
    typeof value.code === "string" &&
    typeof value.message === "string" &&
    (typeof value.loginUrl === "string" || typeof value.loginUrl === "undefined")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
