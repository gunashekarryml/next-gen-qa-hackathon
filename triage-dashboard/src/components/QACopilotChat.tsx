// src/components/QACopilotChat.tsx

import React, { useEffect, useRef, useState } from "react";
import copilotIcon from "../assets/copilot-icon.png";

export interface TestItem {
  id: string;
  name: string;
  status: "passed" | "failed" | "skipped";
  executedAt?: string;
  details?: string;
  // optional fields like duration, severity can be added later
}

interface QACopilotChatProps {
  testData: TestItem[];
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

const QACopilotChat: React.FC<QACopilotChatProps> = ({ testData }) => {
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 1350, y: 265 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [memoryOpen, setMemoryOpen] = useState(false);

  // Draggable physics refs
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Typed helper so TS knows role is literal
  const pushMessage = (msg: Message) => setMessages((prev) => [...prev, msg]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragging.current = true;
    offset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    lastPos.current = { x: e.clientX, y: e.clientY };
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    velocity.current = {
      x: e.clientX - lastPos.current.x,
      y: e.clientY - lastPos.current.y,
    };
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
        x: Math.min(window.innerWidth - 90, Math.max(0, pos.x + velocity.current.x)),
        y: Math.min(window.innerHeight - 90, Math.max(0, pos.y + velocity.current.y)),
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
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  // Clicking outside closes chat
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

  // --- Suggestion handlers (Option B: AI-style assistance) ---

  // 1) What failed recently?
  const handleWhatFailedRecently = async () => {
    // quick UX: show typing briefly
    setTyping(true);
    await new Promise((r) => setTimeout(r, 450));

    const failed = testData.filter((t) => t.status === "failed");
    if (failed.length === 0) {
      pushMessage({ role: "assistant", content: "Good news — no failed tests recently 🎉" });
    } else {
      const list = failed.slice(-8).reverse().map((t) => `• ${t.name}${t.executedAt ? ` (${new Date(t.executedAt).toLocaleString()})` : ""}`).join("\n");
      const content = `I found ${failed.length} failed test(s). Recent failures:\n${list}`;
      pushMessage({ role: "assistant", content });
    }

    setTyping(false);
    if (!open) setUnreadCount((u) => u + 1);
  };

  // 6) Quick test summary
  const handleQuickSummary = async () => {
    setTyping(true);
    await new Promise((r) => setTimeout(r, 420));

    const total = testData.length;
    const passed = testData.filter((t) => t.status === "passed").length;
    const failed = testData.filter((t) => t.status === "failed").length;
    const skipped = testData.filter((t) => t.status === "skipped").length;
    // get latest executedAt if present
    const executedDates = testData.map((t) => (t.executedAt ? new Date(t.executedAt).getTime() : 0)).filter(Boolean);
    const lastRun = executedDates.length ? new Date(Math.max(...executedDates)).toLocaleString() : "N/A";

    const summary = `Quick Test Summary:\nTotal: ${total}\nPassed: ${passed}\nFailed: ${failed}\nSkipped: ${skipped}\nLast run: ${lastRun}`;
    pushMessage({ role: "assistant", content: summary });

    setTyping(false);
    if (!open) setUnreadCount((u) => u + 1);
  };

  // 7) I need help debugging a failure (calls backend AI)
  const handleDebugHelp = async () => {
    // pick a failing test to include
    const failed = testData.filter((t) => t.status === "failed");
    if (failed.length === 0) {
      pushMessage({ role: "assistant", content: "There are no failed tests right now — nothing to debug! ✅" });
      return;
    }

    // choose the most recent failed test (by executedAt if present)
    const mostRecentFailed = failed.slice().sort((a, b) => {
      const ta = a.executedAt ? new Date(a.executedAt).getTime() : 0;
      const tb = b.executedAt ? new Date(b.executedAt).getTime() : 0;
      return tb - ta;
    })[0];

    setTyping(true);

    const prompt = `
You are a QA assistant asked to help debug a failing test. Here is the failing test's details:
${JSON.stringify(mostRecentFailed, null, 2)}

Provide:
1) Likely causes for the failure (3-5 bullet points)
2) Quick debugging steps to triage (3-6 steps)
3) One suggestion to reduce future flakiness for similar tests.

Be concise.
`;

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      });

      const data = await res.json();
      const reply = (data && typeof data.result === "string" && data.result.length > 0)
        ? data.result
        : "I couldn't get a debugging response right now — try again or check your AI endpoint.";

      pushMessage({ role: "assistant", content: reply });
    } catch (err) {
      console.error("Debug help error:", err);
      pushMessage({ role: "assistant", content: "Failed to reach the debugging assistant. Check the AI endpoint." });
    } finally {
      setTyping(false);
      if (!open) setUnreadCount((u) => u + 1);
    }
  };

  // Generic ask() that sends whatever is in input to backend (keeps legacy)
  async function ask() {
    const trimmed = input.trim();
    if (!trimmed) return;

    pushMessage({ role: "user", content: trimmed });
    setInput("");
    setTyping(true);

    const memoryPayload = JSON.stringify(testData.slice(-50));
    const prompt = `You are a QA assistant. Use the test memory below to inform your response:\n\n${memoryPayload}\n\nUser question: ${trimmed}`;

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt }),
      });
      const data = await res.json();
      const reply = typeof data?.result === "string" && data.result.length > 0
        ? data.result
        : "No result from AI.";

      pushMessage({ role: "assistant", content: reply });
    } catch (err) {
      console.error("ask() error:", err);
      pushMessage({ role: "assistant", content: "Error contacting AI endpoint." });
    } finally {
      setTyping(false);
      if (!open) setUnreadCount((u) => u + 1);
    }
  }

  const clearChat = () => {
    setMessages([]);
    setTyping(false);
  };

  // pre-built suggestion UI mapping
  const suggestionButtons = [
    {
      id: "what-failed",
      label: "What failed recently? ❌",
      onClick: handleWhatFailedRecently,
    },
    {
      id: "quick-summary",
      label: "Show me a quick test summary 📊",
      onClick: handleQuickSummary,
    },
    {
      id: "debug-help",
      label: "I need help debugging a failure 🛠️",
      onClick: handleDebugHelp,
    },
  ];

  // small helper: recent failure count
  const recentFailures = testData.filter((t) => t.status === "failed").length;

  return (
    <div
      ref={containerRef}
      className="fixed z-50"
      style={{ top: position.y, left: position.x, width: 340 }}
    >
      {/* Floating trigger / handle */}
      <div
        onMouseDown={handleMouseDown}
        onClick={() => setOpen((p) => !p)}
        role="button"
        aria-label="Toggle QA Copilot"
        className="relative cursor-grab flex items-center justify-center transition-all"
        style={{
          width: open ? 340 : 90,
          height: open ? 60 : 90,
          borderRadius: open ? "12px 12px 0 0" : "50%",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          background: open ? "linear-gradient(135deg, rgba(30,0,50,0.85), rgba(0,0,40,0.85))" : "linear-gradient(135deg,#6a00ff,#e600ff)",
          boxShadow: open ? "0 12px 30px rgba(80,0,120,0.45)" : "0 8px 18px rgba(0,0,0,0.4)",
          transition: "all 220ms ease",
        }}
      >
        {!open && copilotIcon && (
          <>
            <img
              src={copilotIcon}
              alt="QA Copilot"
              draggable={false}
              style={{ width: 56, height: 56, userSelect: "none", filter: "drop-shadow(0 0 12px rgba(157,75,255,0.85))", animation: "floatIcon 3s ease-in-out infinite" }}
            />
            {/* Greeting bubble when no messages yet */}
            {messages.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(99, 102, 241, 0.95)",
                  color: "#fff",
                  fontSize: 11,
                  padding: "6px 8px",
                  borderRadius: 8,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  animation: "pulse 2s infinite",
                }}
              >
                Ask me anything! ✨
              </div>
            )}
          </>
        )}

        {open && (
          <span style={{ color: "#fff", fontWeight: 700 }}>🚀 QA Copilot</span>
        )}

        {/* unread badge */}
        {!open && unreadCount > 0 && (
          <div style={{
            position: "absolute", top: -8, right: -8,
            width: 22, height: 22, borderRadius: 999,
            background: "#ef4444", color: "#fff", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700
          }}>{unreadCount}</div>
        )}
      </div>

      {/* Chat panel */}
      <div
        aria-hidden={!open}
        style={{
          width: 340,
          pointerEvents: open ? "auto" : "none",
          opacity: open ? 1 : 0,
          maxHeight: open ? 520 : 0,
          transition: "all 240ms ease",
          overflow: "hidden",
          borderRadius: 14,
          marginTop: 6,
        }}
      >
        {open && (
          <div style={{ background: "linear-gradient(180deg, rgba(8,7,12,0.9), rgba(16,6,30,0.92))", border: "1px solid rgba(124,58,237,0.12)", padding: 10, borderRadius: 12 }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ color: "#f3e8ff", fontWeight: 800 }}>QA Copilot</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 12, color: "#d8b4fe" }}>Failures: {recentFailures}</div>
                <button onClick={() => setMemoryOpen((s) => !s)} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.03)", color: "#ddd", padding: "4px 8px", borderRadius: 8, cursor: "pointer" }}>
                  Context
                </button>
                <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#bbb", cursor: "pointer" }}>
                  ✕
                </button>
              </div>
            </div>

            {/* Suggestion chips (Option B) - shown only when there are no messages yet */}
            {messages.length === 0 && !typing && (
              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                {suggestionButtons.map((s) => (
                  <button
                    key={s.id}
                    onClick={s.onClick}
                    style={{
                      background: "rgba(124,58,237,0.12)",
                      color: "#e9d5ff",
                      border: "1px solid rgba(124,58,237,0.18)",
                      padding: "6px 10px",
                      borderRadius: 999,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {/* Messages area */}
            <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, paddingRight: 6, marginBottom: 8 }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  alignSelf: m.role === "assistant" ? "flex-start" : "flex-end",
                  background: m.role === "assistant" ? "rgba(124,58,237,0.12)" : "rgba(6,182,212,0.08)",
                  color: m.role === "assistant" ? "#e6fff3" : "#dff6ff",
                  padding: "8px 10px",
                  borderRadius: 8,
                  maxWidth: "82%",
                  fontSize: 13,
                  whiteSpace: "pre-wrap",
                  boxShadow: m.role === "assistant" ? "0 6px 18px rgba(90,25,160,0.08)" : "0 6px 12px rgba(6,95,70,0.03)"
                }}>
                  {m.content}
                </div>
              ))}

              {typing && (
                <div style={{ color: "#c4b5fd", fontSize: 12, fontStyle: "italic" }}>
                  QA Copilot is typing…
                </div>
              )}
            </div>

            {/* Expandable memory panel */}
            {memoryOpen && (
              <div style={{ marginBottom: 8, padding: 8, background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ color: "#f3e8ff", fontWeight: 700 }}>Recent Test Context</div>
                  <div style={{ color: "#c4b5fd", fontSize: 12 }}>{testData.length} items</div>
                </div>
                <div style={{ maxHeight: 120, overflowY: "auto", display: "grid", gap: 6 }}>
                  {testData.slice(-12).reverse().map((t) => (
                    <div key={t.id} style={{ padding: 8, borderRadius: 6, background: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ color: "#eae6ff", fontWeight: 700, fontSize: 13 }}>{t.name}</div>
                      <div style={{ textAlign: "right", fontSize: 12 }}>
                        <div style={{ color: t.status === "failed" ? "#fecaca" : "#bbf7d0" }}>{t.status}</div>
                        {t.executedAt && <div style={{ color: "#94a3b8", fontSize: 11 }}>{new Date(t.executedAt).toLocaleString()}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask()}
                placeholder="Ask anything or click a suggestion above..."
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.02)", color: "#fff", outline: "none", fontSize: 13 }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button onClick={ask} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "linear-gradient(90deg,#7c3aed,#a78bfa)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>Ask</button>
                <button onClick={() => { clearChat(); setInput(""); }} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "rgba(220,38,38,0.85)", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>Clear</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* small pulse keyframes for greeting bubble (inline style fallback) */}
      <style>{`
  @keyframes pulse {
    0% { transform: translateY(0); opacity: 1; }
    50% { transform: translateY(-4px); opacity: 0.95; }
    100% { transform: translateY(0); opacity: 1; }
  }

  /* ✅ Floating animation for minimized icon */
  @keyframes floatIcon {
    0% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-6px) rotate(1deg); }
    100% { transform: translateY(0) rotate(0deg); }
  }
`}</style>

    </div>
  );
};

export default QACopilotChat;
