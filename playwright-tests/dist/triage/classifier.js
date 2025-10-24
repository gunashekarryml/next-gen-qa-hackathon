const RULES = [
    { name: "timeout", pattern: /timeout|timed out|waited for/, category: "Timeout", conf: 0.99 },
    { name: "assertion", pattern: /\bassert\b|expected\b|but found|should be|!=|==/, category: "Assertion Failure", conf: 0.95 },
    { name: "no-such-element", pattern: /no such element|element not found|cannot find element|nosuchelementexception/, category: "Locator/Selector Issue", conf: 0.95 },
    { name: "stale-element", pattern: /stale element|staleelementreference/, category: "Stale Element", conf: 0.9 },
    { name: "selenium", pattern: /selenium|webdriver|chromedriver/, category: "Driver/Automation Framework", conf: 0.9 },
    { name: "env", pattern: /build failed|dependency|module not found|npm ERR|yarn error|importerror/, category: "Environment/Build Error", conf: 0.98 },
];
const KEYWORDS = {
    timeout: { category: "Timeout", weight: 1.0 },
    timedout: { category: "Timeout", weight: 0.9 },
    assertion: { category: "Assertion Failure", weight: 1.0 },
    expected: { category: "Assertion Failure", weight: 0.9 },
    "element not found": { category: "Locator/Selector Issue", weight: 1.0 },
    selector: { category: "Locator/Selector Issue", weight: 0.8 },
    stale: { category: "Stale Element", weight: 0.8 },
    selenium: { category: "Driver/Automation Framework", weight: 0.9 },
    chromedriver: { category: "Driver/Automation Framework", weight: 0.9 },
    "module not found": { category: "Environment/Build Error", weight: 1.0 },
    importerror: { category: "Environment/Build Error", weight: 0.9 },
};
function textForRecord(r) {
    return [r.error_message, r.stacktrace, r.logs, r.test_id, r.error_type]
        .filter(Boolean)
        .join(" --- ")
        .toLowerCase();
}
export function classify(record) {
    const txt = textForRecord(record);
    for (const rule of RULES) {
        if (rule.pattern.test(txt)) {
            return {
                category: rule.category,
                confidence: rule.conf,
                explain: { matched: [rule.name], weights: { [rule.name]: rule.conf } },
            };
        }
    }
    const scores = {};
    const matched = [];
    for (const [kw, meta] of Object.entries(KEYWORDS)) {
        if (txt.includes(kw)) {
            scores[meta.category] = (scores[meta.category] || 0) + meta.weight;
            matched.push(kw);
        }
    }
    if (matched.length) {
        const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
        const [bestCat, bestScore] = sorted[0];
        const maxPossible = Math.max(...Object.values(KEYWORDS).map((k) => k.weight)) * 4;
        const confidence = Math.min(0.95, 0.6 + (bestScore / (maxPossible || 1)));
        const weights = {};
        for (const k of matched)
            weights[k] = KEYWORDS[k].weight;
        return {
            category: bestCat,
            confidence: Number(confidence.toFixed(3)),
            explain: { matched, weights },
        };
    }
    return { category: "Unknown", confidence: 0.55, explain: { matched: [], weights: {} } };
}
