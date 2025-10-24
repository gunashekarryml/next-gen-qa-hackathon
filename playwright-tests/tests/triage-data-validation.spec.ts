import { test, expect } from "@playwright/test";
import fs from "fs-extra";

type FailureRecord = {
  test_id: string;
  module: string;
  status: string;
  timestamp: string;
  error_message: string;
  environment: string;
  expected_behavior: string;
  actual_behavior: string;
  failure_type: string;
  impacted_layers: string[];
  correlation_id: string;
  failure_categorization_reasoning: string;
  logs: string[];
  predicted_category?: string;
  confidence?: number;
  reasoning_short?: string;
  reasoning_long?: string;
  triage_priority?: string;
  enriched_at?: string;
  explainability?: {
    matched: string[];
    weights: Record<string, number>;
  };
  classification?: string; // optional if used
  reasoning?: string;      // optional if used
  defectCorrelation?: {
    knownIssue: boolean;
    defectId?: string;
    lastSeen?: string;
  };
};

test.describe("🧩 Triage Enriched Data Validation", () => {
  let records: FailureRecord[] = [];

  test.beforeAll(async () => {
    const filePath = "./test-data/TestData.enriched.jsonl";

    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ Enriched data file not found: ${filePath}`);
    }

    const rawData = await fs.readFile(filePath, "utf-8");
    records = rawData
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as FailureRecord);

    console.log(`✅ Loaded ${records.length} enriched records from ${filePath}`);
  });

  test("✅ Validate enriched file has records", async () => {
    expect(records.length, "File should have at least one record").toBeGreaterThan(0);
  });

  test("🧾 Validate mandatory enriched fields for each record", async () => {
    for (const r of records) {
      expect.soft(r.test_id, "test_id is required").toBeTruthy();
      expect.soft(r.module, "module is required").toBeTruthy();
      expect.soft(r.status, "status is required").toBeTruthy();
      expect.soft(r.timestamp, "timestamp is required").toBeTruthy();
      expect.soft(r.error_message, "error_message is required").toBeTruthy();
      expect.soft(r.failure_categorization_reasoning, "failure_categorization_reasoning is required").toBeTruthy();
      expect.soft(r.predicted_category, "predicted_category is required").toBeTruthy();
      expect.soft(r.triage_priority, "triage_priority is required").toBeTruthy();
      expect.soft(r.reasoning_short, "reasoning_short is required").toBeTruthy();
      expect.soft(r.reasoning_long, "reasoning_long is required").toBeTruthy();
      expect.soft(r.enriched_at, "enriched_at timestamp is required").toBeTruthy();
      expect.soft(typeof r.explainability, "explainability object must exist").toBe("object");
    }
  });

  test("⚙️ Validate predicted_category values", async () => {
    const allowedCategories = ["Timeout", "Assertion Failure", "Config Error", "Infra", "Other"];
    const invalid = records.filter((r) => !allowedCategories.includes(r.predicted_category ?? ""));
    expect(invalid.length, `Invalid predicted_category for: ${invalid.map(r => r.test_id).join(", ")}`).toBe(0);
  });

  test("📅 Validate enriched_at timestamp format", async () => {
    for (const r of records) {
      const date = new Date(r.enriched_at ?? "");
      expect.soft(!isNaN(date.getTime()), `Invalid enriched_at timestamp for ${r.test_id}`).toBe(true);
    }
  });

  test("📊 Display summary metrics by triage_priority", async () => {
    const byPriority = records.reduce<Record<string, number>>((acc, r) => {
      acc[r.triage_priority ?? "Unknown"] = (acc[r.triage_priority ?? "Unknown"] || 0) + 1;
      return acc;
    }, {});

    console.log("\n--- Triage Summary by Priority ---");
    console.table(byPriority);

    expect(Object.keys(byPriority).length, "At least one priority expected").toBeGreaterThan(0);
  });
});
