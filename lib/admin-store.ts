import type { AuthProvider, AuthSession } from "./auth";
import { getSessionRole, type AuthRole } from "./auth";
import type { D1Database } from "./d1";
import {
  phase2FeatureFlags,
  releaseTracks,
  reviewQueue,
  workspaceAllowlist,
  type FeatureFlagStatus,
  type Phase2FeatureFlag,
  type QueryRunPreview,
  type QueryRunStatus,
  type ReleaseEnvironment,
  type ReviewQueueItem,
  type WorkspaceAccess
} from "./phase2";

export type AdminStorageEnv = {
  GOOGLESQL_DB?: D1Database;
  DB?: D1Database;
};

export type StorageMode = "d1" | "seed";

export type AuditEvent = {
  id: string;
  actorEmail: string;
  action: string;
  target: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AdminState = {
  phase: "phase-3";
  generatedAt: string;
  storage: {
    configured: boolean;
    binding: "GOOGLESQL_DB" | "DB" | null;
    mode: StorageMode;
    message: string;
  };
  releaseTracks: typeof releaseTracks;
  featureFlags: Phase2FeatureFlag[];
  reviewQueue: ReviewQueueItem[];
  workspaceAllowlist: WorkspaceAccess[];
  auditEvents: AuditEvent[];
};

export type UserUpsertResult = {
  persisted: boolean;
  storageBinding: "GOOGLESQL_DB" | "DB" | null;
};

export type QueryRunRecordResult = {
  id: string;
  persisted: boolean;
  storageBinding: "GOOGLESQL_DB" | "DB" | null;
};

export type StoreMutationResult<T> =
  | { ok: true; value: T }
  | {
      ok: false;
      status: 400 | 404 | 409 | 500;
      code: string;
      message: string;
    };

type FeatureFlagRow = {
  id: string;
  name: string;
  description: string;
  status: FeatureFlagStatus;
  environment: ReleaseEnvironment;
  rollout: number;
  owner: string;
  updated_at: string;
};

type WorkspaceRow = {
  workspace: string;
  owner: string;
  plan: WorkspaceAccess["plan"];
  run_access: WorkspaceAccess["runAccess"];
};

type ReviewQueueRow = {
  id: string;
  workspace: string;
  query_type: string;
  status: ReviewQueueItem["status"];
  estimated_cost_usd: number;
  scanned_bytes: number;
  submitted_at: string;
};

type AuditEventRow = {
  id: string;
  actor_email: string;
  action: string;
  target: string;
  metadata_json: string;
  created_at: string;
};

const fallbackAuditEvents: AuditEvent[] = [
  {
    id: "seed-phase3",
    actorEmail: "system@googlesql.com",
    action: "phase3.seed_state",
    target: "admin-console",
    metadata: {
      reason: "D1 binding is not configured"
    },
    createdAt: "2026-06-20T00:00:00.000Z"
  }
];

export function getAdminDb(env: AdminStorageEnv) {
  if (env.GOOGLESQL_DB) {
    return {
      db: env.GOOGLESQL_DB,
      binding: "GOOGLESQL_DB" as const
    };
  }

  if (env.DB) {
    return {
      db: env.DB,
      binding: "DB" as const
    };
  }

  return null;
}

export async function getAdminState(env: AdminStorageEnv): Promise<AdminState> {
  const configured = getAdminDb(env);
  if (!configured) {
    return createFallbackAdminState();
  }

  await ensureAdminSchema(configured.db);
  const [featureFlags, workspaces, runs, auditEvents] = await Promise.all([
    listFeatureFlags(configured.db),
    listWorkspaces(configured.db),
    listReviewQueue(configured.db),
    listAuditEvents(configured.db)
  ]);

  return {
    phase: "phase-3",
    generatedAt: new Date().toISOString(),
    storage: {
      configured: true,
      binding: configured.binding,
      mode: "d1",
      message: `Persisted in Cloudflare D1 binding ${configured.binding}.`
    },
    releaseTracks,
    featureFlags,
    reviewQueue: runs,
    workspaceAllowlist: workspaces,
    auditEvents
  };
}

export async function upsertAuthenticatedUser(
  env: AdminStorageEnv,
  session: AuthSession
): Promise<UserUpsertResult> {
  const configured = getAdminDb(env);
  if (!configured) {
    return {
      persisted: false,
      storageBinding: null
    };
  }

  await ensureAdminSchema(configured.db);
  const role = getSessionRole(session);
  const now = new Date().toISOString();

  await configured.db
    .prepare(
      `INSERT INTO users (
        id,
        provider,
        provider_id,
        email,
        name,
        avatar_url,
        role,
        last_login_at,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        provider = excluded.provider,
        provider_id = excluded.provider_id,
        name = excluded.name,
        avatar_url = excluded.avatar_url,
        role = excluded.role,
        last_login_at = excluded.last_login_at,
        updated_at = excluded.updated_at`
    )
    .bind(
      createUserId(session.provider, session.providerId),
      session.provider,
      session.providerId,
      session.email.toLowerCase(),
      session.name,
      session.avatarUrl ?? null,
      role,
      now,
      now,
      now
    )
    .run();

  await recordAuditEvent(env, {
    actorEmail: session.email,
    action: "auth.login",
    target: session.provider,
    metadata: {
      role,
      providerId: session.providerId
    }
  });

  return {
    persisted: true,
    storageBinding: configured.binding
  };
}

export async function updateFeatureRollout(
  env: AdminStorageEnv,
  id: string,
  rollout: number,
  actorEmail: string
): Promise<StoreMutationResult<Phase2FeatureFlag>> {
  if (!Number.isInteger(rollout) || rollout < 0 || rollout > 100) {
    return {
      ok: false,
      status: 400,
      code: "invalid_rollout",
      message: "Rollout must be an integer between 0 and 100."
    };
  }

  const configured = getAdminDb(env);
  if (!configured) {
    return storageNotConfigured();
  }

  await ensureAdminSchema(configured.db);
  const existing = await getFeatureFlag(configured.db, id);
  if (!existing) {
    return {
      ok: false,
      status: 404,
      code: "feature_flag_not_found",
      message: "Feature flag not found."
    };
  }

  const updatedFlag = {
    ...existing,
    rollout,
    status: getFlagStatus(rollout),
    updatedAt: new Date().toISOString()
  } satisfies Phase2FeatureFlag;

  await configured.db
    .prepare(
      `UPDATE feature_flags
      SET rollout = ?, status = ?, updated_at = ?
      WHERE id = ?`
    )
    .bind(
      updatedFlag.rollout,
      updatedFlag.status,
      updatedFlag.updatedAt,
      updatedFlag.id
    )
    .run();

  await recordAuditEvent(env, {
    actorEmail,
    action: "feature_flag.rollout_updated",
    target: id,
    metadata: {
      rollout,
      status: updatedFlag.status
    }
  });

  return {
    ok: true,
    value: updatedFlag
  };
}

export async function queueRollback(
  env: AdminStorageEnv,
  actorEmail: string
): Promise<StoreMutationResult<{ queuedAt: string; target: string }>> {
  const configured = getAdminDb(env);
  if (!configured) {
    return storageNotConfigured();
  }

  const queuedAt = new Date().toISOString();
  await recordAuditEvent(env, {
    actorEmail,
    action: "rollback.queued",
    target: "prod-20260620",
    metadata: {
      rollbackTarget: "prod-20260620",
      queuedAt
    }
  });

  return {
    ok: true,
    value: {
      queuedAt,
      target: "prod-20260620"
    }
  };
}

export async function updateRunReviewStatus(
  env: AdminStorageEnv,
  id: string,
  status: QueryRunStatus,
  actorEmail: string
): Promise<StoreMutationResult<ReviewQueueItem>> {
  if (status !== "approved" && status !== "blocked") {
    return {
      ok: false,
      status: 400,
      code: "invalid_run_status",
      message: "Run reviews can only be approved or blocked."
    };
  }

  const configured = getAdminDb(env);
  if (!configured) {
    return storageNotConfigured();
  }

  await ensureAdminSchema(configured.db);
  const existing = await getRunReview(configured.db, id);
  if (!existing) {
    return {
      ok: false,
      status: 404,
      code: "run_review_not_found",
      message: "Run review not found."
    };
  }

  const updated = {
    ...existing,
    status,
    submittedAt: new Date().toISOString()
  } satisfies ReviewQueueItem;

  await configured.db
    .prepare(
      `UPDATE run_reviews
      SET status = ?, submitted_at = ?
      WHERE id = ?`
    )
    .bind(updated.status, updated.submittedAt, updated.id)
    .run();

  await configured.db
    .prepare(
      `UPDATE query_runs
      SET status = ?, updated_at = ?
      WHERE id = ?`
    )
    .bind(updated.status, updated.submittedAt, updated.id)
    .run();

  await recordAuditEvent(env, {
    actorEmail,
    action:
      status === "approved" ? "query.approved" : "query.blocked",
    target: id,
    metadata: {
      workspace: updated.workspace,
      queryType: updated.queryType,
      status
    }
  });

  return {
    ok: true,
    value: updated
  };
}

export async function recordQueryDryRun(
  env: AdminStorageEnv,
  input: {
    workspace: string;
    queryType: string;
    actorEmail?: string;
    sql: string;
    preview: QueryRunPreview;
  }
): Promise<QueryRunRecordResult> {
  const id = createRunId();
  const configured = getAdminDb(env);
  if (!configured) {
    return {
      id,
      persisted: false,
      storageBinding: null
    };
  }

  await ensureAdminSchema(configured.db);
  const now = new Date().toISOString();
  const actorEmail = input.actorEmail?.toLowerCase() ?? null;
  const workspace = normalizeWorkspace(input.workspace);
  const queryType = input.queryType.trim() || "GoogleSQL dry run";

  await configured.db
    .prepare(
      `INSERT INTO query_runs (
        id,
        workspace,
        actor_email,
        sql,
        status,
        mode,
        estimated_cost_usd,
        scanned_bytes,
        expected_runtime_ms,
        referenced_tables_json,
        checks_json,
        error_json,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      workspace,
      actorEmail,
      input.sql,
      input.preview.status,
      input.preview.mode ?? "simulated",
      input.preview.estimatedCostUsd,
      input.preview.scannedBytes,
      input.preview.expectedRuntimeMs,
      JSON.stringify(input.preview.referencedTables),
      JSON.stringify(input.preview.checks),
      input.preview.error ? JSON.stringify(input.preview.error) : null,
      now,
      now
    )
    .run();

  await configured.db
    .prepare(
      `INSERT OR REPLACE INTO run_reviews (
        id,
        workspace,
        query_type,
        status,
        estimated_cost_usd,
        scanned_bytes,
        submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      workspace,
      queryType,
      input.preview.status,
      input.preview.estimatedCostUsd,
      input.preview.scannedBytes,
      now
    )
    .run();

  await recordAuditEvent(env, {
    actorEmail: actorEmail ?? "anonymous@googlesql.com",
    action: "query.dry_run",
    target: id,
    metadata: {
      workspace,
      queryType,
      status: input.preview.status,
      mode: input.preview.mode ?? "simulated",
      scannedBytes: input.preview.scannedBytes,
      estimatedCostUsd: input.preview.estimatedCostUsd
    }
  });

  return {
    id,
    persisted: true,
    storageBinding: configured.binding
  };
}

export async function recordAuditEvent(
  env: AdminStorageEnv,
  event: {
    actorEmail: string;
    action: string;
    target: string;
    metadata?: Record<string, unknown>;
  }
) {
  const configured = getAdminDb(env);
  if (!configured) {
    return null;
  }

  await ensureAdminSchema(configured.db);
  const auditEvent = {
    id: crypto.randomUUID(),
    actorEmail: event.actorEmail.toLowerCase(),
    action: event.action,
    target: event.target,
    metadata: event.metadata ?? {},
    createdAt: new Date().toISOString()
  } satisfies AuditEvent;

  await configured.db
    .prepare(
      `INSERT INTO audit_events (
        id,
        actor_email,
        action,
        target,
        metadata_json,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      auditEvent.id,
      auditEvent.actorEmail,
      auditEvent.action,
      auditEvent.target,
      JSON.stringify(auditEvent.metadata),
      auditEvent.createdAt
    )
    .run();

  return auditEvent;
}

export async function ensureAdminSchema(db: D1Database) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        avatar_url TEXT,
        role TEXT NOT NULL DEFAULT 'member',
        last_login_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS feature_flags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        environment TEXT NOT NULL,
        rollout INTEGER NOT NULL,
        owner TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS workspaces (
        workspace TEXT PRIMARY KEY,
        owner TEXT NOT NULL,
        plan TEXT NOT NULL,
        run_access TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS run_reviews (
        id TEXT PRIMARY KEY,
        workspace TEXT NOT NULL,
        query_type TEXT NOT NULL,
        status TEXT NOT NULL,
        estimated_cost_usd REAL NOT NULL,
        scanned_bytes INTEGER NOT NULL,
        submitted_at TEXT NOT NULL
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS query_runs (
        id TEXT PRIMARY KEY,
        workspace TEXT NOT NULL,
        actor_email TEXT,
        sql TEXT NOT NULL,
        status TEXT NOT NULL,
        mode TEXT NOT NULL,
        estimated_cost_usd REAL NOT NULL,
        scanned_bytes INTEGER NOT NULL,
        expected_runtime_ms INTEGER NOT NULL,
        referenced_tables_json TEXT NOT NULL,
        checks_json TEXT NOT NULL,
        error_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS audit_events (
        id TEXT PRIMARY KEY,
        actor_email TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        metadata_json TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`
    )
    .run();

  await seedAdminDefaults(db);
}

function createFallbackAdminState(): AdminState {
  return {
    phase: "phase-3",
    generatedAt: new Date().toISOString(),
    storage: {
      configured: false,
      binding: null,
      mode: "seed",
      message:
        "Cloudflare D1 binding GOOGLESQL_DB is not configured; showing seed data only."
    },
    releaseTracks,
    featureFlags: phase2FeatureFlags,
    reviewQueue,
    workspaceAllowlist,
    auditEvents: fallbackAuditEvents
  };
}

async function seedAdminDefaults(db: D1Database) {
  await Promise.all(
    phase2FeatureFlags.map((flag) =>
      db
        .prepare(
          `INSERT OR IGNORE INTO feature_flags (
            id,
            name,
            description,
            status,
            environment,
            rollout,
            owner,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          flag.id,
          flag.name,
          flag.description,
          flag.status,
          flag.environment,
          flag.rollout,
          flag.owner,
          flag.updatedAt
        )
        .run()
    )
  );

  await Promise.all(
    workspaceAllowlist.map((workspace) =>
      db
        .prepare(
          `INSERT OR IGNORE INTO workspaces (
            workspace,
            owner,
            plan,
            run_access,
            updated_at
          ) VALUES (?, ?, ?, ?, ?)`
        )
        .bind(
          workspace.workspace,
          workspace.owner,
          workspace.plan,
          workspace.runAccess,
          "2026-06-20T00:00:00.000Z"
        )
        .run()
    )
  );

  await Promise.all(
    reviewQueue.map((item) =>
      db
        .prepare(
          `INSERT OR IGNORE INTO run_reviews (
            id,
            workspace,
            query_type,
            status,
            estimated_cost_usd,
            scanned_bytes,
            submitted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          item.id,
          item.workspace,
          item.queryType,
          item.status,
          item.estimatedCostUsd,
          item.scannedBytes,
          item.submittedAt
        )
        .run()
    )
  );
}

async function listFeatureFlags(db: D1Database) {
  const response = await db
    .prepare(
      `SELECT id, name, description, status, environment, rollout, owner, updated_at
      FROM feature_flags
      ORDER BY environment, name`
    )
    .all<FeatureFlagRow>();

  return (response.results ?? []).map(mapFeatureFlagRow);
}

async function getFeatureFlag(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT id, name, description, status, environment, rollout, owner, updated_at
      FROM feature_flags
      WHERE id = ?`
    )
    .bind(id)
    .first<FeatureFlagRow>();

  return row ? mapFeatureFlagRow(row) : null;
}

async function listWorkspaces(db: D1Database) {
  const response = await db
    .prepare(
      `SELECT workspace, owner, plan, run_access
      FROM workspaces
      ORDER BY workspace`
    )
    .all<WorkspaceRow>();

  return (response.results ?? []).map((row) => ({
    workspace: row.workspace,
    owner: row.owner,
    plan: row.plan,
    runAccess: row.run_access
  }));
}

async function listReviewQueue(db: D1Database) {
  const response = await db
    .prepare(
      `SELECT id, workspace, query_type, status, estimated_cost_usd, scanned_bytes, submitted_at
      FROM run_reviews
      ORDER BY id DESC`
    )
    .all<ReviewQueueRow>();

  return (response.results ?? []).map((row) => ({
    id: row.id,
    workspace: row.workspace,
    queryType: row.query_type,
    status: row.status,
    estimatedCostUsd: row.estimated_cost_usd,
    scannedBytes: row.scanned_bytes,
    submittedAt: row.submitted_at
  }));
}

async function getRunReview(db: D1Database, id: string) {
  const row = await db
    .prepare(
      `SELECT id, workspace, query_type, status, estimated_cost_usd, scanned_bytes, submitted_at
      FROM run_reviews
      WHERE id = ?`
    )
    .bind(id)
    .first<ReviewQueueRow>();

  return row
    ? {
        id: row.id,
        workspace: row.workspace,
        queryType: row.query_type,
        status: row.status,
        estimatedCostUsd: row.estimated_cost_usd,
        scannedBytes: row.scanned_bytes,
        submittedAt: row.submitted_at
      }
    : null;
}

async function listAuditEvents(db: D1Database) {
  const response = await db
    .prepare(
      `SELECT id, actor_email, action, target, metadata_json, created_at
      FROM audit_events
      ORDER BY created_at DESC
      LIMIT 20`
    )
    .all<AuditEventRow>();

  return (response.results ?? []).map((row) => ({
    id: row.id,
    actorEmail: row.actor_email,
    action: row.action,
    target: row.target,
    metadata: parseMetadata(row.metadata_json),
    createdAt: row.created_at
  }));
}

function mapFeatureFlagRow(row: FeatureFlagRow): Phase2FeatureFlag {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    environment: row.environment,
    rollout: row.rollout,
    owner: row.owner,
    updatedAt: row.updated_at
  };
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

function storageNotConfigured(): StoreMutationResult<never> {
  return {
    ok: false,
    status: 409,
    code: "storage_not_configured",
    message: "Cloudflare D1 binding GOOGLESQL_DB is required for this action."
  };
}

function createUserId(provider: AuthProvider, providerId: string) {
  return `${provider}:${providerId}`;
}

function createRunId() {
  const timestamp = new Date()
    .toISOString()
    .replace(/\D/g, "")
    .slice(0, 14);

  return `run-${timestamp}-${crypto.randomUUID().slice(0, 8)}`;
}

function normalizeWorkspace(value: string) {
  const trimmed = value.trim().toLowerCase();
  return trimmed || "analytics";
}

function parseMetadata(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getRoleLabel(role: AuthRole) {
  return role === "admin" ? "Administrator" : "Member";
}
