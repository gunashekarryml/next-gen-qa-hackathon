import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
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

  const COLORS = ["#6366F1", "#EC4899", "#FBBF24", "#10B981", "#3B82F6", "#EF4444"];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <motion.div
      className="bg-white rounded-3xl shadow-xl p-6 flex flex-col"
      whileHover={{ scale: 1.02, boxShadow: "0px 6px 18px rgba(99, 102, 241, 0.25)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* ✅ Unified header style */}
      <h3 className="text-gray-900 font-bold text-2xl mb-4 flex items-center gap-2">
        🔥 Failure Categories
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={aggr} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
          <XAxis
            dataKey="name"
            tick={{ fill: "#1F2937", fontSize: 14, fontWeight: 600 }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#1F2937", fontSize: 14, fontWeight: 500 }}
            axisLine={{ stroke: "#E5E7EB" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111",
              borderRadius: 12,
              padding: "10px 15px",
              border: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
            itemStyle={{ color: "#fff", fontWeight: 500 }}
            labelStyle={{ color: "#fff", fontWeight: 600 }}
          />
          <Bar dataKey="value" radius={[12, 12, 0, 0]} isAnimationActive animationDuration={800}>
            {aggr.map((entry, index) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[index % COLORS.length]}
                cursor="pointer"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                style={{
                  transition: "all 0.3s ease-in-out",
                  transform: activeIndex === index ? "scale(1.08)" : "scale(1)",
                  filter:
                    activeIndex === index ? "drop-shadow(0 0 12px rgba(0,0,0,0.25))" : "none",
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        {aggr.map((entry, index) => (
          <motion.div
            key={entry.name}
            className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl shadow-sm transition-all"
            animate={{
              scale: activeIndex === index ? 1.05 : 1,
              boxShadow:
                activeIndex === index
                  ? "0 6px 18px rgba(0,0,0,0.25)"
                  : "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="font-semibold text-gray-800">{entry.name}</span>
            <span className="font-bold text-gray-900">{entry.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
