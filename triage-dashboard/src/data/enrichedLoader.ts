export type FailureRecord = {
    predicted_category: string;
    triage_priority: string;
    confidence: number;
    reasoning_short: string;
    reasoning_long: string;
    enriched_at: string;
  };
  
  export async function loadEnrichedData(): Promise<FailureRecord[]> {
    const res = await fetch('/TestData.enriched.jsonl');
    const text = await res.text();
    const lines = text.split('\n').filter(Boolean);
    return lines.map(line => JSON.parse(line));
  }
  