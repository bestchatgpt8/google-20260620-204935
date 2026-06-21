CREATE TABLE IF NOT EXISTS users (
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
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  environment TEXT NOT NULL,
  rollout INTEGER NOT NULL,
  owner TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workspaces (
  workspace TEXT PRIMARY KEY,
  owner TEXT NOT NULL,
  plan TEXT NOT NULL,
  run_access TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS run_reviews (
  id TEXT PRIMARY KEY,
  workspace TEXT NOT NULL,
  query_type TEXT NOT NULL,
  status TEXT NOT NULL,
  estimated_cost_usd REAL NOT NULL,
  scanned_bytes INTEGER NOT NULL,
  submitted_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  metadata_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO feature_flags
  (id, name, description, status, environment, rollout, owner, updated_at)
VALUES
  (
    'bigquery-run-gate',
    'BigQuery run gate',
    'Dry-run cost check before any live execution path is enabled.',
    'guarded',
    'canary',
    5,
    'Data Ops',
    '2026-06-20'
  ),
  (
    'schema-admin',
    'Schema admin',
    'Manage tables, fields, and workspace schema allowlists.',
    'enabled',
    'staging',
    100,
    'Product',
    '2026-06-20'
  ),
  (
    'release-console',
    'Release console',
    'Track checks, canary traffic, and rollback targets.',
    'enabled',
    'staging',
    100,
    'Release',
    '2026-06-20'
  ),
  (
    'team-billing',
    'Team billing',
    'Plan and usage controls before payment integration.',
    'paused',
    'dev',
    0,
    'Growth',
    '2026-06-20'
  );

INSERT OR IGNORE INTO workspaces
  (workspace, owner, plan, run_access, updated_at)
VALUES
  ('analytics', 'Data Team', 'Team', 'allowlisted', '2026-06-20T00:00:00.000Z'),
  ('marketing', 'Growth', 'Pro', 'review', '2026-06-20T00:00:00.000Z'),
  ('sandbox', 'Learning', 'Free', 'blocked', '2026-06-20T00:00:00.000Z');

INSERT OR IGNORE INTO run_reviews
  (id, workspace, query_type, status, estimated_cost_usd, scanned_bytes, submitted_at)
VALUES
  ('run-1027', 'analytics', 'Revenue rollup', 'approved', 0.02, 251658240, '2 min ago'),
  ('run-1026', 'marketing', 'Campaign sessions', 'needs_approval', 0.18, 1992294400, '9 min ago'),
  ('run-1025', 'sandbox', 'Unsafe DDL', 'blocked', 0, 0, '18 min ago');
