import { PieChart, Pie, Tooltip, Cell } from "recharts";
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

  const COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6"];

  return (
    <motion.div className="bg-white rounded-3xl shadow-2xl p-6" whileHover={{ scale: 1.05 }}>
      <h3 className="text-xl font-bold mb-4 text-gray-700">⚡ Priority Split</h3>
      <PieChart width={380} height={260}>
        <Pie dataKey="value" data={aggr} cx="50%" cy="50%" outerRadius={80} label>
          {aggr.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </motion.div>
  );
}
