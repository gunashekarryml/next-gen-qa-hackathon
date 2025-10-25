import React, { useEffect, useState } from "react";
import { FailureRec, RootCauseCluster } from "../types";

interface AIRootCauseProps {
  failures: FailureRec[];
}

export default function AIRootCause({ failures }: AIRootCauseProps) {
  const [clusters, setClusters] = useState<RootCauseCluster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!failures.length) return;

    async function fetchData() {
      try {
        const res = await fetch("/api/ai/root-cause", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ failedTests: failures }),
        });
        const json = await res.json();
        setClusters(json?.clusters ?? []);
      } catch (err) {
        console.error("❌ Failed to fetch root cause clusters:", err);
        setClusters([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [failures]);

  if (loading) return <p>AI is thinking… 🤖</p>;
  if (!clusters.length) return <p>No root cause patterns detected.</p>;

  return (
    <div className="bg-gray-900 p-4 rounded-xl shadow-md text-white">
      <h3 className="font-bold mb-3">🧠 AI Root Cause Summary</h3>
      {clusters.map((c, i) => (
        <div
          key={i}
          className="p-3 rounded-lg mb-3 border-l-4"
          style={{ borderColor: c.percentage > 70 ? "#ef4444" : "#f59e0b" }}
        >
          <p className="text-lg font-semibold">
            {c.reason} <span className="text-sm ml-2">({c.percentage}%)</span>
          </p>
          <p className="text-sm opacity-75">Fix: {c.recommended_fix}</p>
        </div>
      ))}
    </div>
  );
}
