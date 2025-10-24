import fs from 'fs';
import type { FailureRecord } from '../triage/classifier.js';

export function getTriageSummary() {
  const file = './test-data/TestData.enriched.jsonl';
  if (!fs.existsSync(file)) {
    console.warn('Enriched file missing');
    return null;
  }

  const lines: FailureRecord[] = fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(l => JSON.parse(l));

  const total = lines.length;
  const byCategory: Record<string, number> = {};
  const byPriority: Record<string, number> = {};

  for (const r of lines) {
    byCategory[r.predicted_category] = (byCategory[r.predicted_category] || 0) + 1;
    byPriority[r.triage_priority] = (byPriority[r.triage_priority] || 0) + 1;
  }

  console.log('Triage summary:', { total, byCategory, byPriority });
  return { total, byCategory, byPriority };
}
