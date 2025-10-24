import fs from 'fs';
import path from 'path';

export function loadTriageData() {
  const filePath = path.join(__dirname, '../../playwright-tests/test-data/TestData.enriched.jsonl');
  if (!fs.existsSync(filePath)) {
    console.warn('Enriched file missing');
    return [];
  }
  const lines = fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(l => JSON.parse(l));
  return lines;
}
