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

  // test("⚙️ Validate predicted_category values", async () => {
  //   const allowedCategories = ["Timeout", "Assertion Failure", "Config Error", "Infra", "Other"];
  //   const invalid = records.filter((r) => !allowedCategories.includes(r.predicted_category ?? ""));
  //   expect(invalid.length, `Invalid predicted_category for: ${invalid.map(r => r.test_id).join(", ")}`).toBe(0);
  // });

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

  test("🔍 Validate confidence score range", async () => {
    for (const r of records) {
      if (r.confidence !== undefined) {
        expect.soft(r.confidence).toBeGreaterThanOrEqual(0);
        expect.soft(r.confidence).toBeLessThanOrEqual(1);
      }
    }
  });

  test("🧠 Validate explainability object structure", async () => {
    for (const r of records) {
      expect.soft(Array.isArray(r.explainability?.matched), `explainability.matched missing for ${r.test_id}`).toBe(true);
      expect.soft(typeof r.explainability?.weights === "object", `explainability.weights missing for ${r.test_id}`).toBe(true);
    }
  });

  test("🏷️ Validate triage_priority allowed values", async () => {
    const allowed = ["P0", "P1", "P2", "P3", "P4", "Unknown"];

    const invalidPriorities = records.filter(
      (r) => !allowed.includes(r.triage_priority ?? "Unknown")
    );

    expect.soft(
      invalidPriorities.length,
      `Invalid triage_priority for: ${invalidPriorities.map(r => r.test_id).join(", ")}`
    ).toBe(0);
  });

  test("🧩 Validate defectCorrelation structure", async () => {
    for (const r of records) {
      if (r.defectCorrelation) {
        expect.soft(typeof r.defectCorrelation.knownIssue).toBe("boolean");
        if (r.defectCorrelation.knownIssue) {
          expect.soft(r.defectCorrelation.defectId, `Missing defectId when knownIssue=true for ${r.test_id}`).toBeTruthy();
        }
      }
    }
  });

  test("🔁 Validate error message or actual_behavior must exist when FAIL", async () => {
    for (const r of records) {
      if (r.status === "FAIL") {
        const hasFailureData = Boolean(r.error_message || r.actual_behavior);
        expect.soft(hasFailureData, `FAIL record missing error data: ${r.test_id}`).toBe(true);
      }
    }
  });

  test("🪵 Validate logs existence and must include correlation_id", async () => {
    for (const r of records) {
      expect.soft(r.logs.length > 0, `Logs missing for ${r.test_id}`).toBe(true);
      const correlationFound = r.logs.some((l) => l.includes(r.correlation_id));
      expect.soft(correlationFound, `Correlation Id not referenced in logs for ${r.test_id}`).toBe(true);
    }
  });

  test("📦 Validate impacted layers if failure_type exists", async () => {
    for (const r of records) {
      if (r.failure_type) {
        expect.soft(
          Array.isArray(r.impacted_layers) && r.impacted_layers.length > 0,
          `impacted_layers missing for ${r.test_id}`
        ).toBe(true);
      }
    }
  });

});
