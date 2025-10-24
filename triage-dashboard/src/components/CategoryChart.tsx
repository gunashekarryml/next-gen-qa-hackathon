import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Rec } from "../types";

interface CategoryChartProps {
  data: Rec[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const aggr = Object.values(
    data.reduce((acc: Record<string, { name: string; value: number }>, d) => {
      if (!acc[d.predicted_category]) acc[d.predicted_category] = { name: d.predicted_category, value: 0 };
      acc[d.predicted_category].value += 1;
      return acc;
    }, {})
  );

  return (
    <motion.div className="bg-white rounded-3xl shadow-2xl p-6" whileHover={{ scale: 1.05 }}>
      <h3 className="text-xl font-bold mb-4 text-gray-700">🔥 Failure Categories</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={aggr}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#6366F1" radius={[10, 10, 0, 0]} isAnimationActive />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
