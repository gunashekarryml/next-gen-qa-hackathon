import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import { Rec } from "../types";

interface CategoryChartProps {
  data: Rec[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const COLORS = [
    "#6366F1", "#EC4899", "#FBBF24", "#10B981", "#3B82F6", "#EF4444",
    "#8B5CF6", "#06B6D4", "#84CC16", "#F97316", "#14B8A6", "#E11D48",
  ];

  // Aggregate category counts
  const aggr = Object.values(
    data.reduce((acc: Record<string, { name: string; value: number }>, d) => {
      const key = d.predicted_category || "Unknown";
      if (!acc[key]) acc[key] = { name: key, value: 0 };
      acc[key].value += 1;
      return acc;
    }, {})
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Compact adaptive logic
  const maxVisible = 12;
  const isOverflow = aggr.length > maxVisible;
  const visibleData = isOverflow ? aggr.slice(0, maxVisible) : aggr;

  // ✅ Helper: Truncate long labels and show full on hover
  const truncateLabel = (label: string, max = 10) =>
    label.length > max ? `${label.substring(0, max)}…` : label;

  return (
    <motion.div
      className="bg-white rounded-3xl shadow-xl p-6 flex flex-col"
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
    >
      <h3 className="text-gray-900 font-bold text-2xl mb-5 flex items-center gap-2">
        🔥 Failure Categories
      </h3>

      <div className="w-full h-[340px] overflow-x-auto">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={visibleData}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              interval={0}
              height={60}
              tick={({ x, y, payload }) => (
                <g transform={`translate(${x},${y})`}>
                  <title>{payload.value}</title>
                  <text
                    x={0}
                    y={0}
                    dy={12}
                    textAnchor="end"
                    transform="rotate(-35)"
                    fill="#374151"
                    fontSize={12}
                    fontWeight={600}
                  >
                    {truncateLabel(payload.value, 12)}
                  </text>
                </g>
              )}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#4B5563", fontSize: 13 }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                borderRadius: 10,
                border: "none",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
              }}
              itemStyle={{ color: "#fff", fontWeight: 500 }}
              labelStyle={{ color: "#fff", fontWeight: 600 }}
            />
            <Bar dataKey="value" radius={[10, 10, 0, 0]} animationDuration={500}>
              {visibleData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[index % COLORS.length]}
                  cursor="pointer"
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  style={{
                    transition: "filter 0.25s ease-in-out, transform 0.25s ease-in-out",
                    transform: activeIndex === index ? "scale(1.04)" : "scale(1)",
                    filter:
                      activeIndex === index
                        ? "drop-shadow(0 0 6px rgba(0,0,0,0.2))"
                        : "none",
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Compact Legend */}
      <div className="mt-5 flex flex-wrap gap-3 justify-center text-sm">
        {visibleData.map((entry, index) => (
          <motion.div
            key={entry.name}
            className="flex items-center gap-2 bg-gray-50 px-2.5 py-1.5 rounded-lg shadow-sm"
            animate={{
              scale: activeIndex === index ? 1.05 : 1,
            }}
          >
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="font-semibold text-gray-700">{truncateLabel(entry.name, 15)}</span>
            <span className="font-bold text-gray-900">{entry.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Overflow hint */}
      {isOverflow && (
        <p className="text-center text-gray-500 text-xs mt-3">
          Showing top {maxVisible} of {aggr.length} categories
        </p>
      )}
    </motion.div>
  );
}
