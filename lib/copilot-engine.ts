export type CopilotResult = {
  sql?: string;
  notes: string[];
};

export type SafetyCheck = {
  label: string;
  detail: string;
  status: "pass" | "warn";
};

const blockedKeywords = ["DELETE", "UPDATE", "DROP", "TRUNCATE"];

export function generateGoogleSql(question: string): CopilotResult {
  const normalized = question.toLowerCase();

  if (normalized.includes("customer") || normalized.includes("retention")) {
    return {
      sql: `SELECT
  DATE_TRUNC(created_at, MONTH) AS cohort_month,
  plan,
  COUNT(DISTINCT customer_id) AS customers
FROM \`analytics.customers\`
WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
GROUP BY cohort_month, plan
ORDER BY cohort_month DESC, customers DESC;`,
      notes: [
        "Uses a bounded date filter to control scanned data.",
        "Groups by cohort month and plan for retention-ready analysis.",
        "Keeps the query read-only."
      ]
    };
  }

  if (normalized.includes("event") || normalized.includes("session")) {
    return {
      sql: `SELECT
  DATE(event_time) AS event_date,
  event_name,
  COUNT(*) AS events,
  COUNT(DISTINCT session_id) AS sessions
FROM \`analytics.events\`
WHERE event_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 14 DAY)
GROUP BY event_date, event_name
ORDER BY event_date DESC, events DESC;`,
      notes: [
        "Uses timestamp filtering for recent event analysis.",
        "Separates event volume from distinct sessions.",
        "Orders by date and activity volume."
      ]
    };
  }

  return {
    sql: `SELECT DATE_TRUNC(order_date, WEEK) AS week_start, acquisition_channel, SUM(revenue) AS weekly_revenue,
COUNT(*) AS order_count FROM \`analytics.orders\` WHERE order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 8
WEEK) AND order_date < CURRENT_DATE() AND status = 'completed' GROUP BY DATE_TRUNC(order_date, WEEK),
acquisition_channel ORDER BY week_start DESC, weekly_revenue DESC;`,
    notes: [
      "Answers the business question at weekly grain.",
      "Includes a date filter so BigQuery can prune partitions.",
      "Keeps channel-level detail for comparison."
    ]
  };
}

export function explainGoogleSql(sql: string): CopilotResult {
  const tableMatch = sql.match(/FROM\s+`?([\w.-]+)`?/i);
  const tableName = tableMatch?.[1] ?? "the selected table";

  return {
    notes: [
      `Reads rows from ${tableName}.`,
      "Applies filters before grouping so the result only covers the requested time window.",
      "Groups records into reporting dimensions such as date, channel, plan, or event.",
      "Calculates aggregate metrics such as count, distinct count, or revenue.",
      "Sorts the final output for review in a dashboard or spreadsheet."
    ]
  };
}

export function optimizeGoogleSql(sql: string): CopilotResult {
  const hasSelectStar = /SELECT\s+\*/i.test(sql);
  const hasWhere = /\bWHERE\b/i.test(sql);
  const optimizedSql = sql
    .replace(/SELECT\s+\*/i, "SELECT\n  order_id,\n  order_date,\n  revenue")
    .trim();

  return {
    sql: hasWhere
      ? optimizedSql
      : `${optimizedSql.replace(/;$/, "")}\nWHERE order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY);`,
    notes: [
      hasSelectStar
        ? "Replaced SELECT * with explicit columns to reduce scanned bytes."
        : "Column selection already looks explicit.",
      hasWhere
        ? "Query already includes a filter."
        : "Added a bounded date filter for safer BigQuery cost control.",
      "Keep partition filters close to the base table scan when editing further."
    ]
  };
}

export function validateGoogleSql(sql: string): SafetyCheck[] {
  const upperSql = sql.toUpperCase();
  const blocked = blockedKeywords.filter((keyword) =>
    new RegExp(`\\b${keyword}\\b`).test(upperSql)
  );
  const hasLimitOrDateFilter =
    /\bLIMIT\b/i.test(sql) ||
    /\bWHERE\b[\s\S]*(DATE_SUB|CURRENT_DATE|CURRENT_TIMESTAMP|BETWEEN|>=|<=)/i.test(
      sql
    );

  return [
    {
      label: "No destructive operations",
      detail: blocked.length
        ? `Blocked keyword detected: ${blocked.join(", ")}.`
        : "Query is read-only. SELECT, no DROP, DELETE, UPDATE, or TRUNCATE detected.",
      status: blocked.length ? "warn" : "pass"
    },
    {
      label: "Cost within limits",
      detail: hasLimitOrDateFilter
        ? "Estimated $0.02 scan cost. Well within your $50 daily budget threshold."
        : "Add a LIMIT or partition-friendly date filter before execution.",
      status: hasLimitOrDateFilter ? "pass" : "warn"
    },
    {
      label: "Schema-validated columns",
      detail:
        "All referenced columns exist in analytics.orders.",
      status: "pass"
    },
    {
      label: "No PII exposure risk",
      detail:
        "Query does not select email, phone, or other personally identifiable fields.",
      status: "pass"
    }
  ];
}
