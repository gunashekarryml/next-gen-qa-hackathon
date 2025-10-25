import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeFailures(query, testData) {
  const logsText = testData
    .map(t => `Name: ${t.name}\nStatus: ${t.status}\nDetails: ${t.details || "N/A"}`)
    .slice(-200)
    .join("\n\n");

  const prompt = `
You are a QA assistant.
Use the following test data:

${logsText}

Answer the user's question precisely:
${query}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  return response.choices[0].message.content;
}
