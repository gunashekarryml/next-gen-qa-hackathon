// playwright-tests/src/triage/index.ts
import path from "path";
import { fileURLToPath } from "url";
import { enrichFile } from "./enrich.js"; // <-- use 'enrichFile', not 'enrichData'

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basedir = path.join(__dirname, "..", "..", "test-data");
const input = path.join(basedir, "TestData.jsonl");
const output = path.join(basedir, "TestData.enriched.jsonl");

(async () => {
  console.log("Starting triage enrichment:", input, "->", output);

  try {
    const enriched = await enrichFile(input, output);
    console.log(`Enriched ${enriched.length} records. Wrote: ${output}`);
  } catch (err) {
    console.error("❌ Error during enrichment:", err);
    process.exit(1);
  }
})();
