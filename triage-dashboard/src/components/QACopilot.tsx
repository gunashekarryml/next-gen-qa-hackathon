import React, { useState } from "react";

type QACopilotProps = {
  context: string; // adjust type if needed
};

type ChatItem = {
  q: string;
  a: string; // or 'any' if the response is not strictly string
};

export default function QACopilot({ context }: QACopilotProps) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<ChatItem[]>([]);

  async function send() {
    const res = await fetch("/api/ai/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: msg, context }),
    });
    const answer: { result: string } = await res.json();

    setChat([...chat, { q: msg, a: answer.result }]);
    setMsg("");
  }

  return (
    <div className="bg-gray-800 p-4 rounded-xl text-white w-80 fixed right-3 top-20">
      <h3 className="font-bold mb-3">🤖 QA Copilot</h3>
      <div className="max-h-80 overflow-y-auto space-y-2 mb-3">
        {chat.map((c, i) => (
          <div key={i}>
            <p className="text-blue-300 font-semibold">You: {c.q}</p>
            <p className="text-green-300">AI: {c.a}</p>
          </div>
        ))}
      </div>
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className="w-full p-2 rounded bg-gray-700 mb-2"
        placeholder="Ask me…"
      />
      <button onClick={send} className="w-full bg-blue-600 p-2 rounded-lg">
        Send ▶
      </button>
    </div>
  );
}
