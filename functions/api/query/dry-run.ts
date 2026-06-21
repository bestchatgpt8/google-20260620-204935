import {
  getSessionFromRequest,
  jsonResponse
} from "../../../lib/auth-request";
import { type AuthEnv } from "../../../lib/auth";
import {
  recordQueryDryRun,
  type AdminStorageEnv
} from "../../../lib/admin-store";
import {
  runBigQueryDryRun,
  type BigQueryEnv
} from "../../../lib/bigquery";

type QueryDryRunContext = {
  request: Request;
  env: AuthEnv & AdminStorageEnv & BigQueryEnv;
};

type QueryDryRunBody = {
  sql?: unknown;
  workspace?: unknown;
  queryType?: unknown;
};

const MAX_SQL_LENGTH = 20_000;

export async function onRequestPost(context: QueryDryRunContext) {
  const body = await readJsonBody(context.request);
  if (!body.ok) {
    return jsonResponse(
      {
        ok: false,
        code: body.code,
        message: body.message
      },
      { status: 400 }
    );
  }

  const sql = getString(body.value.sql).trim();
  if (!sql) {
    return jsonResponse(
      {
        ok: false,
        code: "sql_required",
        message: "SQL is required for dry-run."
      },
      { status: 400 }
    );
  }

  if (sql.length > MAX_SQL_LENGTH) {
    return jsonResponse(
      {
        ok: false,
        code: "sql_too_large",
        message: `SQL must be ${MAX_SQL_LENGTH} characters or less.`
      },
      { status: 400 }
    );
  }

  const workspace = getString(body.value.workspace) || inferWorkspace(sql);
  const queryType = getString(body.value.queryType) || "Generated Query";
  const session = await getSessionFromRequest(context.request, context.env);
  const preview = await runBigQueryDryRun(sql, context.env);
  const record = await recordQueryDryRun(context.env, {
    workspace,
    queryType,
    actorEmail: session?.email,
    sql,
    preview
  });
  const enrichedPreview = {
    ...preview,
    runId: record.id,
    persisted: record.persisted
  };

  return jsonResponse({
    ok: true,
    preview: enrichedPreview,
    runId: record.id,
    persisted: record.persisted,
    storageBinding: record.storageBinding,
    user: session
      ? {
          email: session.email,
          name: session.name,
          role: session.role ?? "member"
        }
      : null
  });
}

async function readJsonBody(
  request: Request
): Promise<
  | { ok: true; value: QueryDryRunBody }
  | { ok: false; code: string; message: string }
> {
  try {
    const value = (await request.json()) as unknown;
    if (!isRecord(value)) {
      return {
        ok: false,
        code: "invalid_json",
        message: "Request body must be a JSON object."
      };
    }

    return {
      ok: true,
      value
    };
  } catch {
    return {
      ok: false,
      code: "invalid_json",
      message: "Request body must be valid JSON."
    };
  }
}

function inferWorkspace(sql: string) {
  const match = sql.match(/\b(?:FROM|JOIN)\s+`?([\w.-]+)`?/i);
  const tableName = match?.[1];
  if (!tableName) {
    return "analytics";
  }

  const parts = tableName.split(".");
  return (parts.length > 1 ? parts.at(-2) : parts[0])?.toLowerCase() ?? "analytics";
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
