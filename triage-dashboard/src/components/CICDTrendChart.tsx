// src/components/charts/CICDTrendChart.tsx
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface CICDRun {
  run_number: number;
  status: "success" | "failure";
  duration: number; // in minutes
  timestamp: string;
}

interface CICDTrendChartProps {
  data: CICDRun[];
}

const CICDTrendChart: React.FC<CICDTrendChartProps> = ({ data }) => {
  // Color based on status
  const getColor = (entry: CICDRun) => (entry.status === "success" ? "#34d399" : "#f87171");

  return (
    <div className="bg-white/95 rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-indigo-700">🚀 CI/CD Recent Runs</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
          <XAxis
            dataKey="run_number"
            label={{ value: "Run #", position: "insideBottom", offset: -5 }}
            tick={{ fill: "#4b5563", fontSize: 12 }}
          />
          <YAxis
            label={{ value: "Duration (min)", angle: -90, position: "insideLeft", fill: "#4b5563" }}
            tick={{ fill: "#4b5563", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#111827", border: "none", borderRadius: 6 }}
            itemStyle={{ color: "#fff" }}
            formatter={(value: number, name: string, props: any) => {
              const payload: CICDRun = props.payload;
              return [`${value} min`, `Run #${payload.run_number} (${payload.status})`];
            }}
          />
          <Bar dataKey="duration" maxBarSize={28}>
            {data.map((entry) => (
              <Cell key={entry.run_number} fill={getColor(entry)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CICDTrendChart;
