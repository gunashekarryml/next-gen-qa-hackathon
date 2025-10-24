import React from "react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Rec } from "../types";

interface HeatMapChartProps {
  data: Rec[];
}

const HeatMapChart: React.FC<HeatMapChartProps> = ({ data }) => {
  const categories = Array.from(new Set(data.map((d) => d.predicted_category)));
  const priorities = Array.from(new Set(data.map((d) => d.triage_priority)));

  // Build matrix for scatter chart
  const matrix: { x: string; y: string; z: number }[] = [];
  categories.forEach((cat) => {
    priorities.forEach((pri) => {
      const count = data.filter((d) => d.predicted_category === cat && d.triage_priority === pri).length;
      matrix.push({ x: cat, y: pri, z: count });
    });
  });

  // Dynamic color function based on z value
  const getColor = (z: number) => {
    if (z === 0) return "#e0e0e0";
    if (z <= 2) return "#60a5fa";
    if (z <= 5) return "#34d399";
    if (z <= 10) return "#fbbf24";
    return "#f87171";
  };

  return (
    <div className="bg-white/90 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-2 text-indigo-700">🔥 Category vs Priority Heatmap</h3>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis type="category" dataKey="x" name="Category" />
          <YAxis type="category" dataKey="y" name="Priority" />
          <ZAxis type="number" dataKey="z" range={[50, 400]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={matrix}>
            {matrix.map((point, idx) => (
              <Cell key={idx} fill={getColor(point.z)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HeatMapChart;