// playwright-tests/src/triage/enrich.ts
import fs from "fs-extra";
import path from "path";
import { classify, Classification, FailureRecord as ClassifierRecord } from "./classifier.js";
import { generateReasoning } from "./reasoning.js";

export type FailureRecord = {
  test_id: string;
  module: string;
  status: string;
  timestamp: string;
  error_message: string;
  environment: string;
  expected_behavior: string;
  actual_behavior: string;
  failure_type?: string;
  impacted_layers?: string[];
  correlation_id?: string;
  failure_categorization_reasoning?: string;
  logs?: string[];
  predicted_category?: string;
  confidence?: number;
  reasoning_short?: string;
  reasoning_long?: string;
  explainability?: Record<string, any>;
  triage_priority?: string;
  enriched_at?: string;
  classification?: string;
  reasoning?: string;
  defectCorrelation?: {
    knownIssue: boolean;
    defectId?: string;
    lastSeen?: string;
  };
};

const inputFile = path.resolve("./test-data/TestData.jsonl");
const outputFile = path.resolve("./test-data/TestData.enriched.jsonl");

export async function enrichFile(input: string, output: string): Promise<FailureRecord[]> {
  console.log(`Starting triage enrichment: ${input} -> ${output}`);

  if (!fs.existsSync(input)) {
    throw new Error(`Input file does not exist: ${input}`);
  }

  const rawData = await fs.readFile(input, "utf-8");
  const records: FailureRecord[] = rawData
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as FailureRecord);

  const allowedCategories = ["Timeout", "Assertion Failure", "Config Error", "Infra", "Other"];

  const enriched = records.map((r) => {
    // Classification
    const classification: Classification = classify(r);
    let predicted_category = classification.category;

    if (!allowedCategories.includes(predicted_category)) {
      predicted_category = "Other";
    }

    // Reasoning
    const reasoning = generateReasoning(r, classification);

    // Assign triage priority based on category + severity
    const triage_priority = assignPriority({
      ...r,
      predicted_category,
      failure_type: r.failure_type,
    });

    return {
      ...r,
      predicted_category,
      confidence: classification.confidence,
      reasoning_short: reasoning.short,
      reasoning_long: reasoning.long,
      explainability: classification.explain,
      triage_priority,
      enriched_at: new Date().toISOString(),
      classification: r.classification || "Unknown",
      reasoning: reasoning.short,
      defectCorrelation: r.defectCorrelation || { knownIssue: false },
    };
  });

  // Write enriched data
  const lines = enriched.map((r) => JSON.stringify(r));
  await fs.writeFile(output, lines.join("\n"));

  console.log(`Enrichment complete, wrote ${enriched.length} records to: ${output}`);
  return enriched;
}

function assignPriority(record: FailureRecord): string {
  const category = record.predicted_category || "Other";
  const failureType = record.failure_type?.toLowerCase() || "";

  // P1: Critical / infra / environment blocking
  if (category === "Infra" || failureType.includes("critical") || category === "Environment/Build Error") {
    return "P1";
  }

  // P2: Major / important features
  if (category === "Assertion Failure" || category === "Config Error" || category === "Locator/Selector Issue") {
    return "P2";
  }

  // P3: Minor / low impact / transient
  if (category === "Timeout" || category === "Driver/Automation Framework" || category === "Other") {
    return "P3";
  }

  // Default fallback
  return "P3";
}

// If called directly
if (process.argv[1].includes("enrich.ts") || process.argv[1].includes("enrich.js")) {
  enrichFile(inputFile, outputFile).catch((err) => {
    console.error("❌ Error during enrichment:", err);
    process.exit(1);
  });
}
