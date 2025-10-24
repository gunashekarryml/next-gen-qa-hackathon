export function generateReasoning(rec, c) {
    const parts = [];
    if (c.explain.matched.length)
        parts.push(`Matched: ${c.explain.matched.join(', ')}`);
    if (rec.error_type)
        parts.push(`ErrorType: ${rec.error_type}`);
    if (rec.test_id)
        parts.push(`Test: ${rec.test_id}`);
    const short = `${c.category} — ${recommendShort(c.category)}`;
    const long = `${parts.join(' | ')}. Recommendation: ${recommendLong(c.category)}`;
    return { short, long };
}
function recommendShort(category) {
    switch (category) {
        case 'Timeout': return 'Increase wait / investigate infra';
        case 'Assertion Failure': return 'Verify assertion / UI change';
        case 'Locator/Selector Issue': return 'Check selectors / update locators';
        case 'Environment/Build Error': return 'Check build & deps';
        case 'Driver/Automation Framework': return 'Check drivers & agents';
        default: return 'Manual triage required';
    }
}
function recommendLong(category) {
    switch (category) {
        case 'Timeout': return 'Investigate async waits, add retries or increase timeout. Check infra/slowness.';
        case 'Assertion Failure': return 'Check test assertion vs current UI. Attach screenshot and DOM snapshot.';
        case 'Locator/Selector Issue': return 'Review selector stability; use data-* attrs or more robust locators.';
        case 'Environment/Build Error': return 'Inspect CI logs, dependency versions and environment setup.';
        case 'Driver/Automation Framework': return 'Ensure browser/driver versions match; restart agents.';
        default: return 'Collect full logs and run locally for debug.';
    }
}
