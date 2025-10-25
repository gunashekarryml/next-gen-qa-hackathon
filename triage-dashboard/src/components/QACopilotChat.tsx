// src/components/QACopilotChat.tsx
import React, { useState, useRef, useEffect } from "react";

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
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [unreadCount, setUnreadCount] = useState(0);

  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drag with inertia
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragging.current = true;
    offset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    lastPos.current = { x: e.clientX, y: e.clientY };
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    velocity.current = { x: e.clientX - lastPos.current.x, y: e.clientY - lastPos.current.y };
    setPosition({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    dragging.current = false;
    const decay = 0.9;
    const animate = () => {
      velocity.current.x *= decay;
      velocity.current.y *= decay;
      setPosition((pos) => ({
        x: Math.min(window.innerWidth - 80, Math.max(0, pos.x + velocity.current.x)),
        y: Math.min(window.innerHeight - 80, Math.max(0, pos.y + velocity.current.y)),
      }));
      if (Math.abs(velocity.current.x) > 0.5 || Math.abs(velocity.current.y) > 0.5) {
        animFrame.current = requestAnimationFrame(animate);
      }
    };
    animFrame.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // Click outside closes chat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) setUnreadCount(0);
  }, [open]);

  async function ask() {
    if (!input.trim()) return;

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

      setMessages((prev) => [...prev, { role: "user", content: input }, { role: "assistant", content: reply }]);
      setInput("");
      if (!open) setUnreadCount((prev) => prev + 1);
    } catch (err) {
      console.error("❌ QA Copilot error:", err);
      setMessages((prev) => [...prev, { role: "user", content: input }, { role: "assistant", content: "Failed to get response" }]);
      setInput("");
      if (!open) setUnreadCount((prev) => prev + 1);
    }
  }

  return (
    <div ref={containerRef} className="fixed z-50" style={{ top: position.y, left: position.x }}>
      {/* Icon */}
      <div
        onMouseDown={handleMouseDown}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center justify-center cursor-pointer rounded-full
          ${open
            ? "bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 w-80 h-14 rounded-t-xl transition-all duration-500 ease-out"
            : "bg-gradient-to-br from-purple-500 via-pink-400 to-indigo-500 w-24 h-24 shadow-2xl animate-idle hover:scale-110 transition-transform duration-500 ease-in-out"}
          text-white relative`}
      >
        <span
          className={`absolute inset-0 flex items-center justify-center text-xl font-bold transition-opacity duration-500 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          🧩 QA Copilot
        </span>
        {!open && (
          <>
            <span className="text-6xl">🤖</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </div>

      {/* Chat Window */}
      <div
        className={`overflow-hidden flex flex-col bg-black/90 p-3 rounded-b-xl shadow-2xl transition-all duration-500 ease-out origin-top
        ${open ? "max-h-96 w-80 opacity-100 scale-100" : "max-h-0 w-80 opacity-0 scale-95 pointer-events-none"}`}
      >
        {open && (
          <>
            <div className="flex-1 overflow-y-auto mb-2 text-sm bg-black/30 p-2 rounded-md">
              {messages.map((m, i) => (
                <p key={i} className={m.role === "assistant" ? "text-green-300" : "text-blue-300"}>
                  {m.content}
                </p>
              ))}
            </div>

            <input
              className="bg-black/40 text-white border border-purple-600 rounded-md w-full p-1 text-sm mb-1"
              placeholder="Ask about test results…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
            />

            <button
              onClick={ask}
              className="bg-purple-600 hover:bg-purple-800 text-white rounded-md px-3 py-1 text-xs w-full"
            >
              Ask
            </button>
          </>
        )}
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes idle-animate {
            0%, 100% { transform: rotate(0deg) scale(1); }
            20% { transform: rotate(-5deg) scale(1.08); }
            40% { transform: rotate(5deg) scale(1.08); }
            60% { transform: rotate(-3deg) scale(1.05); }
            80% { transform: rotate(3deg) scale(1.06); }
          }
          .animate-idle {
            animation: idle-animate 4s infinite ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

export default QACopilotChat;
