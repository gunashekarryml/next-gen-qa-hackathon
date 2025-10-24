import fs from 'fs-extra';
import type { FailureRecord } from './classifier.js';

export function readJsonl(path: string): FailureRecord[] {
  if (!fs.existsSync(path)) return [];
  const raw = fs.readFileSync(path, 'utf8');
  return raw.split('\n').filter(Boolean).map(l => JSON.parse(l));
}

export function writeJsonl(path: string, data: FailureRecord[]) {
  const out = data.map(d => JSON.stringify(d)).join('\n') + '\n';
  fs.outputFileSync(path, out, 'utf8');
}
