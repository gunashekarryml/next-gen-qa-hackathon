// playwright-tests/src/triage/classifier.ts
export type FailureRecord = { [key: string]: any };
export type Classification = {
  category: string;
  confidence: number;
  explain: { matched: string[]; weights: Record<string, number> };
};

// Expanded classifier with real-world failure detection
const RULES: Array<{ name: string; pattern: RegExp; category: string; conf: number }> = [
  { name: "backend-failure", pattern: /backend|service bug|api error|500|503|database|db|internal server/i, category: "Backend Failure", conf: 0.96 },
  { name: "auth-failure", pattern: /unauthorized|forbidden|auth|token|oauth|expired/i, category: "Authentication Failure", conf: 0.95 },
  { name: "config-error", pattern: /feature flag|config|misconfigured|env var|settings|parameter|configuration/i, category: "Config Error", conf: 0.93 },
  { name: "third-party", pattern: /third.?party|external provider|api gateway|sms|email|provider downtime|stripe|external dependency/i, category: "External Dependency Failure", conf: 0.9 },
  { name: "timeout", pattern: /timeout|timed out|waited for|promise not resolved/i, category: "Timeout", conf: 0.99 },
  { name: "assertion", pattern: /\bassert\b|expected\b|should be|!=|==|but found/i, category: "Assertion Failure", conf: 0.95 },
  { name: "infra", pattern: /build failed|infra|deployment|network|connection refused|dns|server down/i, category: "Infra", conf: 0.97 },
  { name: "locator-issue", pattern: /no such element|element not found|selector|xpath/i, category: "Locator/Selector Issue", conf: 0.94 },
  { name: "driver", pattern: /selenium|webdriver|chromedriver|playwright|browser context/i, category: "Driver/Automation Framework", conf: 0.9 },
];

const KEYWORDS: Record<string, { category: string; weight: number }> = {
  timeout: { category: "Timeout", weight: 1.0 },
  assertion: { category: "Assertion Failure", weight: 0.9 },
  "feature flag": { category: "Config Error", weight: 1.0 },
  misconfigured: { category: "Config Error", weight: 0.8 },
  "auth": { category: "Authentication Failure", weight: 1.0 },
  unauthorized: { category: "Authentication Failure", weight: 0.9 },
  backend: { category: "Backend Failure", weight: 1.0 },
  database: { category: "Backend Failure", weight: 0.8 },
  thirdparty: { category: "External Dependency Failure", weight: 0.8 },
  "provider downtime": { category: "External Dependency Failure", weight: 1.0 },
  infra: { category: "Infra", weight: 0.8 },
  network: { category: "Infra", weight: 0.9 },
  "element not found": { category: "Locator/Selector Issue", weight: 1.0 },
};

function textForRecord(r: FailureRecord) {
  return [r.error_message, r.stacktrace, r.logs, r.failure_type, r.module]
    .filter(Boolean)
    .join(" --- ")
    .toLowerCase();
}

export function classify(record: FailureRecord): Classification {
  const txt = textForRecord(record);

  // Rule-based quick match
  for (const rule of RULES) {
    if (rule.pattern.test(txt)) {
      return {
        category: rule.category,
        confidence: rule.conf,
        explain: { matched: [rule.name], weights: { [rule.name]: rule.conf } },
      };
    }
  }

  // Keyword-based weighted scoring
  const scores: Record<string, number> = {};
  const matched: string[] = [];

  for (const [kw, meta] of Object.entries(KEYWORDS)) {
    if (txt.includes(kw)) {
      scores[meta.category] = (scores[meta.category] || 0) + meta.weight;
      matched.push(kw);
    }
  }

  if (matched.length) {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [bestCat, bestScore] = sorted[0];
    const confidence = Math.min(0.98, 0.6 + bestScore / 4);
    const weights: Record<string, number> = {};
    for (const k of matched) weights[k] = KEYWORDS[k].weight;
    return {
      category: bestCat,
      confidence: Number(confidence.toFixed(3)),
      explain: { matched, weights },
    };
  }

  return { category: "Other", confidence: 0.6, explain: { matched: [], weights: {} } };
}
