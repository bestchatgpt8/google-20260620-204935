import { describe, expect, it } from "vitest";
import {
  estimateDryRun,
  getPhase2Health,
  phase2FeatureFlags,
  releaseTracks
} from "../lib/phase2";

describe("phase 2 release controls", () => {
  it("blocks destructive SQL before execution", () => {
    const preview = estimateDryRun("DROP TABLE `analytics.orders`;");

    expect(preview.status).toBe("blocked");
    expect(preview.scannedBytes).toBe(0);
    expect(preview.gateLabel).toBe("Blocked by safety policy");
  });

  it("requires approval for unbounded read queries", () => {
    const preview = estimateDryRun("SELECT order_id FROM `analytics.orders`;");

    expect(preview.status).toBe("needs_approval");
    expect(preview.scannedBytes).toBeGreaterThan(1024 * 1024 * 1024);
  });

  it("approves bounded read queries for canary dry-run", () => {
    const preview = estimateDryRun(
      "SELECT order_id FROM `analytics.orders` WHERE order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY);"
    );

    expect(preview.status).toBe("approved");
    expect(preview.estimatedCostUsd).toBeGreaterThanOrEqual(0);
    expect(preview.referencedTables).toEqual(["analytics.orders"]);
  });

  it("exposes the deployment model in health data", () => {
    const health = getPhase2Health();

    expect(health.phase).toBe("phase-2");
    expect(health.deployment.model).toContain("gray-release");
    expect(health.checks).toContain("admin-console");
  });

  it("ships canary and rollback controls as configured data", () => {
    expect(releaseTracks.some((track) => track.environment === "canary")).toBe(
      true
    );
    expect(
      phase2FeatureFlags.some((flag) => flag.id === "bigquery-run-gate")
    ).toBe(true);
  });
});
