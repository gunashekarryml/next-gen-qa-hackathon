import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Rec } from "../types";

export default function TrendChart({ data }: { data: Rec[] }) {
  const aggr: Record<string, number> = {};
  data.forEach((d) => {
    const key = d.predicted_category;
    aggr[key] = (aggr[key] || 0) + 1;
  });
  const trendData = Object.entries(aggr).map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white/90 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
      <h3 className="text-lg font-semibold mb-2 text-indigo-700">📊 Category Trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
