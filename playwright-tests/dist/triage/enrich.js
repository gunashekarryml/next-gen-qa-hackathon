// playwright-tests/src/triage/enrich.ts
import fs from "fs-extra";
import path from "path";
import { classify } from "./classifier.js";
import { generateReasoning } from "./reasoning.js";
const inputFile = path.resolve("./test-data/TestData.jsonl");
const outputFile = path.resolve("./test-data/TestData.enriched.jsonl");
export async function enrichFile(input, output) {
    console.log(`🚀 Starting triage enrichment: ${input} -> ${output}`);
    if (!fs.existsSync(input)) {
        throw new Error(`❌ Input file does not exist: ${input}`);
    }
    const rawData = await fs.readFile(input, "utf-8");
    const records = rawData
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line));
    const enriched = records.map((r) => {
        const classification = classify(r);
        const predicted_category = classification.category;
        const reasoning = generateReasoning(r, classification);
        const triage_priority = assignPriority(r, predicted_category);
        return {
            ...r,
            predicted_category,
            confidence: classification.confidence,
            reasoning_short: `${predicted_category} → ${triage_priority}`,
            reasoning_long: `${reasoning.long} | Assigned ${triage_priority} due to ${predicted_category} (${classification.confidence * 100}% confidence).`,
            explainability: classification.explain,
            triage_priority,
            enriched_at: new Date().toISOString(),
            classification: predicted_category,
            reasoning: reasoning.short,
            defectCorrelation: r.defectCorrelation || { knownIssue: false },
        };
    });
    await fs.writeFile(output, enriched.map((r) => JSON.stringify(r)).join("\n"));
    console.log(`✅ Enrichment complete — wrote ${enriched.length} records to ${output}`);
    return enriched;
}
/** Enhanced Priority Assignment */
function assignPriority(record, category) {
    const failureType = record.failure_type?.toLowerCase() || "";
    const impacted = record.impacted_layers?.length || 0;
    // 🔴 P1 — Critical issues / infra / widespread failures
    if (category.includes("Infra") ||
        failureType.includes("critical") ||
        category.includes("Backend") && impacted >= 3 ||
        category.includes("Authentication") ||
        category.includes("External Dependency Failure") && impacted >= 2) {
        return "P1";
    }
    // 🟠 P2 — Functional / config / test assertion issues
    if (category.includes("Assertion") ||
        category.includes("Config") ||
        category.includes("Locator") ||
        category.includes("Backend") && impacted < 3) {
        return "P2";
    }
    // 🟡 P3 — Minor / transient / isolated issues
    if (category.includes("Timeout") ||
        category.includes("Other") ||
        category.includes("Driver") ||
        category.includes("Stale")) {
        return "P3";
    }
    return "P3";
}
// Execute directly
if (process.argv[1].includes("enrich.ts") || process.argv[1].includes("enrich.js")) {
    enrichFile(inputFile, outputFile).catch((err) => {
        console.error("❌ Error during enrichment:", err);
        process.exit(1);
    });
}
