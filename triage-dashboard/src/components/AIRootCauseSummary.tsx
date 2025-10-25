// src/components/AIRootCauseSummary.tsx
import React, { useEffect, useState } from "react";

interface FailureCluster {
  reason: string;
  count: number;
}

interface AnalysisResult {
  summary: string;
  clusters: FailureCluster[];
  recommendations: string[];
}

interface Props {
  failedTests: any[];
}

const AIRootCauseSummary: React.FC<Props> = ({ failedTests }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (!failedTests?.length) return;

    fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ failedTests })
    })
      .then(r => r.json())
      .then(setAnalysis)
      .catch(err => console.error("AI Summary Error:", err));
  }, [failedTests]);

  if (!analysis) return null;

  return (
    <div className="bg-black/50 p-6 rounded-xl mt-6 shadow-lg border border-purple-500">
      <h2 className="text-xl font-bold text-purple-300 mb-2">🤖 AI Root Cause Summary</h2>
      <p className="text-white mb-4">{analysis.summary}</p>

      <ul className="mb-4">
        {analysis.clusters.map(c => (
          <li key={c.reason} className="text-pink-400 text-sm">
            {c.reason} → {c.count} failures
          </li>
        ))}
      </ul>

      <h3 className="text-sm font-bold text-purple-200 mb-1">Suggested Actions</h3>
      <ul className="text-green-300 text-sm">
        {analysis.recommendations.map(r => <li key={r}>{r}</li>)}
      </ul>
    </div>
  );
};

export default AIRootCauseSummary;
