"use client";

import type { ComponentType, ReactNode } from "react";
import { useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  Code2,
  Copy,
  Database,
  Edit3,
  Eraser,
  Gauge,
  History,
  KeyRound,
  LoaderCircle,
  Mic2,
  Paperclip,
  Play,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
  TableProperties,
  WandSparkles,
  X
} from "lucide-react";
import { generateGoogleSql, validateGoogleSql } from "@/lib/copilot-engine";
import { schemaTables } from "@/lib/content";
import {
  estimateDryRun,
  formatBytes,
  formatCost,
  type QueryRunPreview
} from "@/lib/phase2";
import { cn } from "@/lib/utils";

type SqlTokenType =
  | "keyword"
  | "function"
  | "string"
  | "number"
  | "table"
  | "comment"
  | "plain";

const sampleQuestion =
  "Show weekly revenue and order count for the last 8 weeks, grouped by acquisition channel";

const sampleSql = `SELECT DATE_TRUNC(order_date, WEEK) AS week_start, acquisition_channel, SUM(revenue) AS weekly_revenue,
COUNT(*) AS order_count FROM \`analytics.orders\` WHERE order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 8
WEEK) AND order_date < CURRENT_DATE() AND status = 'completed' GROUP BY DATE_TRUNC(order_date, WEEK),
acquisition_channel ORDER BY week_start DESC, weekly_revenue DESC;`;

const sqlKeywords = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "GROUP",
  "BY",
  "ORDER",
  "AS",
  "DESC",
  "ASC",
  "JOIN",
  "ON",
  "AND",
  "OR",
  "LIMIT",
  "INTERVAL",
  "CURRENT",
  "PARTITION",
  "OVER",
  "DISTINCT"
]);

const sqlFunctions = new Set([
  "DATE_TRUNC",
  "WEEK",
  "COUNT",
  "SUM",
  "DATE_SUB",
  "CURRENT_DATE",
  "CURRENT_TIMESTAMP",
  "TIMESTAMP_SUB",
  "DATE"
]);

const typeBadgeClassName = {
  INT64: "bg-[#fbbc05]/[0.12] text-[#fbbc05] ring-[#fbbc05]/[0.15]",
  DATE: "bg-[#4285f4]/[0.12] text-[#60a5fa] ring-[#4285f4]/[0.18]",
  STRING: "bg-[#34a853]/[0.12] text-[#4ade80] ring-[#34a853]/[0.18]",
  FLOAT64: "bg-[#a855f7]/[0.14] text-[#d8b4fe] ring-[#a855f7]/20",
  TIMESTAMP: "bg-[#22d3ee]/[0.12] text-[#67e8f9] ring-[#22d3ee]/[0.18]"
};

export function CopilotWorkbench({ compact = false }: { compact?: boolean }) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [question, setQuestion] = useState(sampleQuestion);
  const [result, setResult] = useState(generateGoogleSql(sampleQuestion));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [runPreview, setRunPreview] = useState<QueryRunPreview | null>(null);
  const [showHint, setShowHint] = useState(true);

  const outputSql = result.sql || sampleSql;
  const defaultRunEstimate = useMemo(() => estimateDryRun(outputSql), [outputSql]);
  const safetyChecks = useMemo(() => validateGoogleSql(outputSql), [outputSql]);
  const usedFields = useMemo(() => extractUsedFields(outputSql), [outputSql]);
  const allChecksPassed = safetyChecks.every((check) => check.status === "pass");

  function runTool() {
    setIsGenerating(true);
    window.setTimeout(() => {
      setResult(generateGoogleSql(question));
      setRunPreview(null);
      setIsGenerating(false);
      notify("Generated optimized GoogleSQL");
    }, 720);
  }

  function dryRunQuery() {
    setIsDryRunning(true);
    window.setTimeout(() => {
      const preview = estimateDryRun(outputSql);
      setRunPreview(preview);
      setIsDryRunning(false);
      notify(
        preview.status === "blocked"
          ? "Run blocked by safety policy"
          : preview.status === "needs_approval"
            ? "Run queued for admin approval"
            : "Dry run approved for canary"
      );
    }, 620);
  }

  function copySql() {
    notify("SQL copied to clipboard");
    void copyTextToClipboard(outputSql);
  }

  async function copyTextToClipboard(text: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
    } catch {
      fallbackCopy(text);
    }
  }

  function notify(message: string) {
    showToast(message);
  }

  return (
    <section className={cn("app-shell-bg", compact ? "py-6" : "py-6 lg:py-8")}>
      <div className="relative mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-8">
        {showHint ? (
          <div className="mb-5 flex min-h-12 items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#0a0f1c]/[0.78] px-4 text-sm text-slate-400 shadow-[0_18px_48px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="flex min-w-0 items-center gap-3">
              <Sparkles className="h-4 w-4 shrink-0 text-[#4285f4]" />
              <span className="truncate">
                Describe your business question in plain English. AI will
                generate an optimized BigQuery SQL with proper schema awareness
                and safety validation.
              </span>
            </div>
            <button
              type="button"
              title="Dismiss"
              aria-label="Dismiss hint"
              onClick={() => setShowHint(false)}
              className="focus-ring rounded-md p-1 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-5">
            <section className="glass-panel glow-border min-w-0 overflow-hidden rounded-lg">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <WandSparkles className="h-5 w-5 text-[#4285f4]" />
                  <h1 className="text-base font-semibold text-slate-50">
                    Text to GoogleSQL
                  </h1>
                </div>
                <div className="flex items-center gap-5 text-xs font-medium text-slate-500">
                  <button
                    type="button"
                    className="focus-ring inline-flex items-center gap-1.5 rounded-md px-1 py-1 transition hover:text-slate-200"
                  >
                    <History className="h-3.5 w-3.5" />
                    Recent
                  </button>
                  <button
                    type="button"
                    className="focus-ring inline-flex items-center gap-1.5 rounded-md px-1 py-1 transition hover:text-slate-200"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Templates
                  </button>
                </div>
              </div>

              <div className="p-5">
                <textarea
                  ref={inputRef}
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  className="focus-ring min-h-[112px] w-full resize-y rounded-lg border border-white/10 bg-[#05070d] px-4 py-4 text-sm font-semibold leading-7 text-slate-100 shadow-[0_0_26px_rgba(0,0,0,0.25)] transition hover:border-[#4285f4]/[0.35] sm:min-h-[84px]"
                  aria-label="Business question"
                />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <IconButton title="Attach schema note">
                      <Paperclip className="h-4 w-4" />
                    </IconButton>
                    <IconButton title="Voice prompt">
                      <Mic2 className="h-4 w-4" />
                    </IconButton>
                    <IconButton title="Clear prompt" onClick={() => setQuestion("")}>
                      <Eraser className="h-4 w-4" />
                    </IconButton>
                  </div>
                  <button
                    type="button"
                    onClick={runTool}
                    disabled={isGenerating || !question.trim()}
                    className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#4285f4] px-5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(66,133,244,0.38)] transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
                  >
                    {isGenerating ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <WandSparkles className="h-4 w-4" aria-hidden="true" />
                    )}
                    {isGenerating ? "Generating..." : "Generate SQL"}
                  </button>
                </div>
              </div>
            </section>

            <section className="glass-panel min-w-0 overflow-hidden rounded-lg">
              <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Code2 className="h-5 w-5 text-[#a855f7]" />
                  <h2 className="text-base font-semibold text-slate-50">
                    Generated Query
                  </h2>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#34a853]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#34a853] shadow-[0_0_12px_rgba(52,168,83,0.9)]" />
                    Valid
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1 text-xs font-medium text-slate-500">
                  <button
                    type="button"
                    title="Copy SQL"
                    onClick={copySql}
                    className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                  <button
                    type="button"
                    title="Run query"
                    onClick={dryRunQuery}
                    disabled={isDryRunning}
                    className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200"
                  >
                    {isDryRunning ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    {isDryRunning ? "Dry run" : "Run"}
                  </button>
                  <button
                    type="button"
                    title="Edit prompt"
                    onClick={() => inputRef.current?.focus()}
                    className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    title="Share query"
                    onClick={() => notify("Share link copied")}
                    className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-200"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </button>
                </div>
              </div>

              <SqlEditor sql={outputSql} />
              <RunGatePreview preview={runPreview} />

              <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <InlineMetric
                    icon={Gauge}
                    label="Est. cost"
                    value={formatCost(
                      runPreview?.estimatedCostUsd ??
                        defaultRunEstimate.estimatedCostUsd
                    )}
                  />
                  <InlineMetric
                    icon={Database}
                    label=""
                    value={`${formatBytes(
                      runPreview?.scannedBytes ?? defaultRunEstimate.scannedBytes
                    )} scanned`}
                  />
                  <InlineMetric
                    icon={Clock3}
                    label=""
                    value={`${(
                      (runPreview?.expectedRuntimeMs ??
                        defaultRunEstimate.expectedRuntimeMs) / 1000
                    ).toFixed(1)}s`}
                  />
                </div>
                <span>BigQuery Standard SQL</span>
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-5">
            <SchemaContext usedFields={usedFields} />
            <section className="glass-panel overflow-hidden rounded-lg">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#34a853]" />
                  <h2 className="text-base font-semibold text-slate-50">
                    Safety Checks
                  </h2>
                </div>
                <span className="text-xs font-semibold text-[#34a853]">
                  {allChecksPassed ? "All Passed" : "Review"}
                </span>
              </div>
              <ul className="space-y-3 p-4">
                {safetyChecks.map((check) => (
                  <li
                    key={check.label}
                    className={cn(
                      "rounded-lg border px-4 py-3",
                      check.status === "pass"
                        ? "border-[#34a853]/[0.12] bg-[#34a853]/[0.08]"
                        : "border-[#fbbc05]/[0.18] bg-[#fbbc05]/[0.08]"
                    )}
                  >
                    <div className="flex gap-3">
                      <span
                        className={cn(
                          "pulse-ring mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                          check.status === "pass"
                            ? "border-[#34a853]/[0.45] bg-[#34a853]/10 text-[#34a853]"
                            : "border-[#fbbc05]/[0.45] bg-[#fbbc05]/10 text-[#fbbc05]"
                        )}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-100">
                          {check.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {check.detail}
                        </span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}

function RunGatePreview({ preview }: { preview: QueryRunPreview | null }) {
  if (!preview) {
    return null;
  }

  const statusClassName = {
    approved: "border-[#34a853]/25 bg-[#34a853]/[0.08] text-[#4ade80]",
    needs_approval: "border-[#fbbc05]/25 bg-[#fbbc05]/[0.08] text-[#facc15]",
    blocked: "border-[#ea4335]/25 bg-[#ea4335]/[0.08] text-[#f87171]"
  }[preview.status];

  return (
    <div className="border-t border-white/10 bg-[#070b13] px-5 py-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={cn(
              "pulse-ring mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
              statusClassName
            )}
          >
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-100">
                Execution Gate
              </p>
              <span
                className={cn(
                  "rounded-md border px-2 py-1 text-xs font-semibold",
                  statusClassName
                )}
              >
                {preview.gateLabel}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {preview.referencedTables.join(", ") || "No table detected"} ·{" "}
              {preview.projectedColumns || "unknown"} projected columns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs sm:min-w-[360px]">
          <RunMetric label="Cost" value={formatCost(preview.estimatedCostUsd)} />
          <RunMetric label="Scan" value={formatBytes(preview.scannedBytes)} />
          <RunMetric
            label="Runtime"
            value={`${(preview.expectedRuntimeMs / 1000).toFixed(1)}s`}
          />
        </div>
      </div>
    </div>
  );
}

function RunMetric({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2">
      <span className="block text-[11px] font-medium text-slate-600">
        {label}
      </span>
      <span className="mt-1 block font-semibold text-slate-200">{value}</span>
    </span>
  );
}

function SchemaContext({ usedFields }: { usedFields: Set<string> }) {
  const table = schemaTables[0];

  return (
    <section className="glass-panel overflow-hidden rounded-lg">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <TableProperties className="h-5 w-5 text-[#22d3ee]" />
          <h2 className="text-base font-semibold text-slate-50">
            Schema Context
          </h2>
        </div>
        <button
          type="button"
          className="focus-ring inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-xs font-medium text-slate-500 transition hover:text-slate-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Table
        </button>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[#4285f4]" />
            <p className="sql-code font-semibold text-[#60a5fa]">{table.name}</p>
          </div>
          <span className="rounded-md bg-white/[0.04] px-2 py-1 text-xs text-slate-500">
            {table.columnCount} cols
          </span>
        </div>

        <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-black/[0.15]">
          {table.fields.map((field) => {
            const used = usedFields.has(field.name);

            return (
              <div
                key={field.name}
                className={cn(
                  "group flex items-center justify-between gap-3 border-b border-white/[0.06] px-3 py-3 text-sm transition last:border-b-0 hover:bg-[#4285f4]/10",
                  used ? "text-slate-100" : "text-slate-600"
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full transition group-hover:bg-[#4285f4]",
                      used
                        ? "bg-[#4285f4] shadow-[0_0_10px_rgba(66,133,244,0.9)]"
                        : field.key
                          ? "bg-[#fbbc05]/[0.7]"
                          : "bg-slate-700"
                    )}
                  />
                  <span className="sql-code truncate">{field.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span
                    className={cn(
                      "rounded px-2 py-1 text-[11px] font-semibold ring-1",
                      typeBadgeClassName[field.type]
                    )}
                  >
                    {field.type}
                  </span>
                  {field.key ? <KeyRound className="h-3.5 w-3.5 text-[#fbbc05]/75" /> : null}
                </span>
              </div>
            );
          })}
          <button
            type="button"
            className="focus-ring flex w-full items-center justify-center gap-2 px-3 py-3 text-xs text-slate-600 transition hover:bg-white/[0.04] hover:text-slate-300"
          >
            Show 6 more columns
          </button>
        </div>
      </div>
    </section>
  );
}

function SqlEditor({ sql }: { sql: string }) {
  const lines = sql.split("\n");
  const displayLines = [
    ...lines,
    ...Array.from({ length: Math.max(0, 16 - lines.length) }, () => "")
  ];

  return (
    <div className="min-h-[420px] overflow-hidden bg-[#090c14]">
      <pre className="sql-code h-[420px] w-full overflow-auto p-0 text-slate-200">
        {displayLines.map((line, index) => (
          <span
            key={`${line}-${index}`}
            className="flex w-max min-w-full border-b border-white/[0.025] last:border-0"
          >
            <span className="w-12 shrink-0 select-none px-3 py-1.5 text-right text-slate-700">
              {index + 1}
            </span>
            <code className="px-3 py-1.5">{highlightSql(line)}</code>
          </span>
        ))}
      </pre>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  title
}: {
  children: ReactNode;
  onClick?: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="focus-ring rounded-md p-2 text-slate-600 transition hover:bg-white/[0.06] hover:text-slate-200"
    >
      {children}
    </button>
  );
}

function InlineMetric({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-slate-600" />
      {label ? <span>{label}</span> : null}
      <span>{value}</span>
    </span>
  );
}

function highlightSql(line: string) {
  const tokenRegex =
    /(`[^`]+`|'[^']*'|--.*|\b\d+(?:\.\d+)?\b|\b[A-Z_][A-Z0-9_]*\b|\s+|[^\s]+)/gi;
  const tokens = line.match(tokenRegex) ?? [line];

  return tokens.map((token, index) => {
    const type = classifySqlToken(token);
    return (
      <span key={`${token}-${index}`} className={tokenClassName(type)}>
        {token}
      </span>
    );
  });
}

function classifySqlToken(token: string): SqlTokenType {
  const upper = token.toUpperCase();
  if (/^--/.test(token)) return "comment";
  if (/^`.*`$/.test(token)) return "table";
  if (/^'.*'$/.test(token)) return "string";
  if (/^\d/.test(token)) return "number";
  if (sqlFunctions.has(upper)) return "function";
  if (sqlKeywords.has(upper)) return "keyword";
  return "plain";
}

function tokenClassName(type: SqlTokenType) {
  return {
    keyword: "sql-keyword font-semibold",
    function: "sql-function",
    string: "sql-string",
    number: "sql-number",
    table: "sql-table",
    comment: "sql-comment",
    plain: "text-slate-200"
  }[type];
}

function extractUsedFields(sql: string) {
  const normalized = sql.toLowerCase();
  const fields = new Set<string>();

  schemaTables.forEach((table) => {
    table.fields.forEach((field) => {
      if (normalized.includes(field.name.toLowerCase())) {
        fields.add(field.name);
      }
    });
  });

  return fields;
}

function showToast(message: string) {
  const existing = document.getElementById("googlesql-toast");
  existing?.remove();

  const toast = document.createElement("div");
  toast.id = "googlesql-toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message;
  Object.assign(toast.style, {
    position: "fixed",
    top: "80px",
    right: "16px",
    zIndex: "9999",
    border: "1px solid rgba(52, 168, 83, 0.35)",
    borderRadius: "8px",
    background: "rgba(8, 19, 34, 0.96)",
    boxShadow: "0 0 30px rgba(52, 168, 83, 0.25)",
    color: "#f8fafc",
    fontSize: "14px",
    fontWeight: "700",
    padding: "12px 16px",
    backdropFilter: "blur(14px)"
  });

  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 1800);
}

function fallbackCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
