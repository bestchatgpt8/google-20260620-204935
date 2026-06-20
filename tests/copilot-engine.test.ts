import { describe, expect, it } from "vitest";
import {
  generateGoogleSql,
  optimizeGoogleSql,
  validateGoogleSql
} from "../lib/copilot-engine";

describe("copilot engine", () => {
  it("generates read-only GoogleSQL with a bounded date filter", () => {
    const result = generateGoogleSql("weekly revenue by acquisition channel");

    expect(result.sql).toContain("SELECT");
    expect(result.sql).toContain("DATE_SUB");
    expect(result.sql).not.toMatch(/\b(DELETE|UPDATE|DROP|TRUNCATE)\b/i);
  });

  it("warns when destructive SQL is pasted", () => {
    const checks = validateGoogleSql("DROP TABLE analytics.orders;");

    expect(checks[0]).toMatchObject({
      label: "No destructive operations",
      status: "warn"
    });
  });

  it("adds a cost guard when optimizing an unbounded query", () => {
    const result = optimizeGoogleSql("SELECT * FROM `analytics.orders`;");

    expect(result.sql).toContain("order_date >=");
    expect(result.sql).not.toContain("SELECT *");
  });
});
