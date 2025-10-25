// src/components/QACopilotChat.tsx
import React, { useState } from "react";

export interface TestItem {
  id: string;
  name: string;
  status: "passed" | "failed" | "skipped";
  executedAt?: string;
  details?: string;
}

interface QACopilotChatProps {
  testData: TestItem[];
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

const QACopilotChat: React.FC<QACopilotChatProps> = ({ testData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  async function ask() {
    if (!input.trim()) return;

    // Build prompt with last 200 test items
    const prompt = `
You are a QA assistant. Use the test data below:

${JSON.stringify(testData.slice(-200)).substring(0, 6000)}

User query: ${input}
`;

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      });

      const data = await res.json();
      const reply = data.result || "No response";

      setMessages((prev) => [
        ...prev,
        { role: "user", content: input },
        { role: "assistant", content: reply },
      ]);
      setInput("");
    } catch (err) {
      console.error("❌ QA Copilot error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "user", content: input },
        { role: "assistant", content: "Failed to get response" },
      ]);
      setInput("");
    }
  }

  return (
    <div className="fixed right-4 bottom-4 bg-black/70 p-4 w-80 rounded-xl border border-purple-700 shadow-2xl">
      <h3 className="text-purple-300 font-bold">🧩 QA Copilot</h3>

      <div className="h-48 overflow-y-auto text-sm mt-2 bg-black/30 p-2 rounded-md">
        {messages.map((m, i) => (
          <p
            key={i}
            className={m.role === "assistant" ? "text-green-300" : "text-blue-300"}
          >
            {m.content}
          </p>
        ))}
      </div>

      <input
        className="bg-black/40 text-white border border-purple-600 rounded-md w-full mt-2 p-1 text-sm"
        placeholder="Ask about test results…"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && ask()}
      />

      <button
        onClick={ask}
        className="bg-purple-600 hover:bg-purple-800 text-white rounded-md mt-2 px-3 py-1 text-xs w-full"
      >
        Ask
      </button>
    </div>
  );
};

export default QACopilotChat;
