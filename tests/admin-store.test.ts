import { describe, expect, it } from "vitest";
import {
  getAdminState,
  getAdminDb,
  queueRollback,
  recordQueryDryRun,
  updateFeatureRollout
} from "../lib/admin-store";
import { estimateDryRun } from "../lib/phase2";

describe("phase 3 admin store", () => {
  it("returns seed preview state when D1 is not bound", async () => {
    const state = await getAdminState({});

    expect(state.phase).toBe("phase-3");
    expect(state.storage.configured).toBe(false);
    expect(state.storage.mode).toBe("seed");
    expect(state.featureFlags.some((flag) => flag.id === "bigquery-run-gate"))
      .toBe(true);
  });

  it("detects the preferred D1 binding name", () => {
    const db = {
      prepare: () => {
        throw new Error("not used");
      }
    };

    expect(getAdminDb({ GOOGLESQL_DB: db })?.binding).toBe("GOOGLESQL_DB");
  });

  it("rejects rollout mutations without D1 persistence", async () => {
    const result = await updateFeatureRollout(
      {},
      "bigquery-run-gate",
      25,
      "owner@example.com"
    );

    expect(result).toMatchObject({
      ok: false,
      code: "storage_not_configured"
    });
  });

  it("rejects rollback mutations without D1 persistence", async () => {
    const result = await queueRollback({}, "owner@example.com");

    expect(result).toMatchObject({
      ok: false,
      code: "storage_not_configured"
    });
  });

  it("returns an unpersisted query run id when D1 is not bound", async () => {
    const result = await recordQueryDryRun(
      {},
      {
        workspace: "analytics",
        queryType: "Revenue rollup",
        sql: "SELECT order_id FROM `analytics.orders`;",
        preview: estimateDryRun("SELECT order_id FROM `analytics.orders`;")
      }
    );

    expect(result.id).toMatch(/^run-/);
    expect(result.persisted).toBe(false);
    expect(result.storageBinding).toBeNull();
  });
});
