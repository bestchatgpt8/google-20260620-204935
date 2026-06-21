import { describe, expect, it } from "vitest";
import { onRequestPost } from "../functions/api/query/dry-run";

const boundedSql =
  "SELECT order_id FROM `analytics.orders` WHERE order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY);";

describe("query dry-run API", () => {
  it("returns simulated dry-run data when BigQuery is not configured", async () => {
    const response = await onRequestPost({
      request: new Request("https://googlesql.com/api/query/dry-run", {
        method: "POST",
        body: JSON.stringify({
          sql: boundedSql,
          workspace: "analytics",
          queryType: "Revenue rollup"
        })
      }),
      env: {}
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      persisted: boolean;
      preview: {
        mode: string;
        configured: boolean;
        error?: {
          code: string;
        };
      };
    };

    expect(body.ok).toBe(true);
    expect(body.persisted).toBe(false);
    expect(body.preview.mode).toBe("simulated");
    expect(body.preview.configured).toBe(false);
    expect(body.preview.error?.code).toBe("bigquery_not_configured");
  });

  it("rejects empty SQL", async () => {
    const response = await onRequestPost({
      request: new Request("https://googlesql.com/api/query/dry-run", {
        method: "POST",
        body: JSON.stringify({
          sql: " "
        })
      }),
      env: {}
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "sql_required"
    });
  });
});
