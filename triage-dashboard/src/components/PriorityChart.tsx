import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Rec } from "../types";

interface PriorityChartProps {
  data: Rec[];
}

export default function PriorityChart({ data }: PriorityChartProps) {
  const aggr = Object.values(
    data.reduce((acc: Record<string, { name: string; value: number }>, d) => {
      if (!acc[d.triage_priority]) acc[d.triage_priority] = { name: d.triage_priority, value: 0 };
      acc[d.triage_priority].value += 1;
      return acc;
    }, {})
  );

  const COLORS: Record<string, string> = {
    P1: "#EF4444",
    P2: "#F59E0B",
    P3: "#10B981",
    P4: "#3B82F6",
  };

  const maxValue = Math.max(...aggr.map((p) => p.value), 1);

  return (
    <motion.div className="bg-gray-800 rounded-3xl p-6 shadow-xl" whileHover={{ scale: 1.02 }}>
      <h3 className="text-xl font-bold mb-4 text-white text-center">⚡ Priority Split</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={aggr}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {aggr.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] || "#8884d8"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value} tests`, `Priority ${name}`]}
            contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", color: "#fff" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
