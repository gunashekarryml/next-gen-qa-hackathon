// src/components/AIRootCauseUnified.tsx
import React, { useEffect, useState } from "react";
import { Rec } from "../types";

interface FailureCluster {
  reason: string;
  count: number;
  percentage: number;
  recommended_fix: string;
}

interface AnalysisResult {
  summary: string;
  clusters: FailureCluster[];
  recommendations: string[];
}

interface Props {
  failedTests: Rec[];
}

const AIRootCauseUnified: React.FC<Props> = ({ failedTests }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!failedTests?.length) {
      setLoading(false);
      return;
    }

    async function fetchAnalysis() {
      try {
        const res = await fetch("/api/ai/root-cause", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ failedTests }),
        });
        const json = await res.json();
        setAnalysis(json ?? null);
      } catch (err) {
        console.error("❌ Failed to fetch AI analysis:", err);
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [failedTests]);

  if (loading) return <p className="text-white/70">AI is analyzing… 🤖</p>;
  if (!analysis) return <p className="text-white/50">No root cause patterns detected.</p>;

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-md text-white border border-purple-500 mt-6">
      <h2 className="text-xl font-bold text-purple-300 mb-3">🧠 AI Root Cause Analysis</h2>

      {/* Summary */}
      {analysis.summary && <p className="text-white mb-4">{analysis.summary}</p>}

      {/* Clusters */}
      <div className="mb-4">
        {analysis.clusters.map((c) => (
          <div
            key={c.reason}
            className="p-3 rounded-lg mb-3 border-l-4"
            style={{ borderColor: c.percentage > 70 ? "#ef4444" : "#f59e0b" }}
          >
            <p className="text-lg font-semibold">
              {c.reason} <span className="text-sm ml-2">({c.percentage}%)</span>
            </p>
            <p className="text-sm opacity-75">Fix: {c.recommended_fix}</p>
            <p className="text-xs text-purple-300 mt-1">{c.count} failures</p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {analysis.recommendations?.length > 0 && (
        <>
          <h3 className="text-sm font-bold text-purple-200 mb-1">Suggested Actions</h3>
          <ul className="text-green-300 text-sm list-disc list-inside">
            {analysis.recommendations.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default AIRootCauseUnified;
