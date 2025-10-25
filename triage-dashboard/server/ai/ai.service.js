import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ----------------- QA Copilot -----------------
export async function askQACopilot(query, testData = []) {
  try {
    const prompt = `
You are a QA assistant. Use the following recent test data:

${JSON.stringify(testData.slice(-50), null, 2)}

User question: ${query}
`;

    console.log("🚀 QA Copilot Prompt:\n", prompt.substring(0, 2000), "..."); // truncate for logs

    const resp = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const answer = resp.choices[0].message.content;
    console.log("✅ QA Copilot Answer:\n", answer);
    return answer;
  } catch (err) {
    console.error("❌ QA Copilot OpenAI Error:", err);
    throw err;
  }
}

// ----------------- Root Cause Analysis -----------------
export async function getRootCauseAnalysis(failedTests = []) {
  try {
    const logsText = failedTests
      .map(f => `Test: ${f.name}\nError: ${f.error || f.details}\nTrace: ${f.trace || "N/A"}`)
      .slice(0, 10)
      .join("\n\n====\n\n");

    const prompt = `
You are a QA root cause analyzer.
Group issues by common failure reasons and output JSON only:
{
  "clusters": [
    {
      "reason": "Example reason",
      "percentage": 80,
      "affected_tests": ["Test 1"],
      "recommended_fix": "Example fix"
    }
  ]
}
Logs:
${logsText}
`;

    console.log("🚀 Root Cause Prompt:\n", prompt.substring(0, 2000), "...");

    const result = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Expert test-flakiness analyst" },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    });

    const parsed = JSON.parse(result.choices[0].message.content);
    console.log("✅ Root Cause Clusters:\n", parsed);
    return parsed;
  } catch (err) {
    console.error("❌ Root Cause Analysis Error:", err);
    return { clusters: [] };
  }
}

// ----------------- Full Failure Analysis -----------------
export async function analyzeFailures(failedTests = []) {
  try {
    const prompt = `
Summarize failure root causes from the following logs:

${failedTests.map(t => `Name: ${t.name}\nError: ${t.error || t.details}\nStack: ${t.stack || "N/A"}`).join("\n\n")}

Output format:
{
  "summary": "...",
  "clusters": [
    { "reason": "...", "count": number }
  ],
  "recommendations": ["..."]
}
`;

    console.log("🚀 Full Analysis Prompt:\n", prompt.substring(0, 2000), "...");

    const response = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    console.log("✅ Full Analysis Result:\n", parsed);
    return parsed;
  } catch (err) {
    console.error("❌ Full Failure Analysis Error:", err);
    return { summary: "", clusters: [], recommendations: [] };
  }
}
