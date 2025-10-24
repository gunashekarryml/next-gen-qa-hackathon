// src/components/ConfidenceHeatmap.tsx
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Rec } from "../types";

interface ConfidenceHeatmapProps {
  data: Rec[];
}

const ConfidenceHeatmap: React.FC<ConfidenceHeatmapProps> = ({ data }) => {
  // Extract all unique categories from data
  const categories = Array.from(
    new Set(data.map((d) => d.predicted_category))
  );

  // Compute average confidence for each category
  const heatData = categories.map((cat) => {
    const values = data
      .filter((d) => d.predicted_category === cat)
      .map((d) => d.confidence)
      .filter((v): v is number => v !== undefined); // filter out undefined safely

    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { category: cat, confidence: avg };
  });

  return (
    <div className="bg-gray-900 rounded-2xl p-4 shadow-xl">
      <h3 className="text-white text-lg font-bold mb-4">🎯 Confidence Heatmap</h3>
      {heatData.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={heatData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis
              dataKey="category"
              stroke="#ddd"
              tick={{ fill: "#fff", fontSize: 12 }}
            />
            <YAxis
              stroke="#ddd"
              tick={{ fill: "#fff", fontSize: 12 }}
              domain={[0, 1]}
              tickFormatter={(val) => `${Math.round(val * 100)}%`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", borderRadius: 6 }}
              formatter={(value: number) => `${Math.round(value * 100)}%`}
            />
            <Bar dataKey="confidence" fill="#4f46e5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-400 text-sm">No data available</p>
      )}
    </div>
  );
};

export default ConfidenceHeatmap;
