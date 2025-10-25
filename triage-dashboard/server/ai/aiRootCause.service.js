import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function getRootCauseAnalysis(failedTests) {
  const logsText = failedTests
    .map(f => `Test: ${f.name}\nError: ${f.details || "N/A"}\nStatus: ${f.status}`)
    .slice(0, 10)
    .join("\n\n====\n\n");

  const prompt = `
You are a QA root cause analyzer.
Group issues by common failure reasons and output JSON only:
{
  "clusters": [
    {
      "reason": "Login timeout due to API latency",
      "percentage": 72,
      "affected_tests": ["Login - Slow", "Auth redirect fail"],
      "recommended_fix": "Increase timeout or retry"
    }
  ]
}
`;

  const result = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Expert test-flakiness analyst" },
      { role: "user", content: `${prompt}\n\nLogs:\n${logsText}` }
    ],
    temperature: 0.2
  });

  try {
    return JSON.parse(result.choices[0].message.content);
  } catch {
    return { clusters: [] };
  }
}
