// components/SmartQABrain.tsx
import React from "react";
import { RadialBarChart, RadialBar, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Rec } from "../types";

interface SmartQABrainProps {
  data: Rec[];
}

export default function SmartQABrain({ data }: SmartQABrainProps) {
  // Aggregate data by priority
  const aggr = Object.values(
    data.reduce((acc: Record<string, { name: string; value: number }>, d) => {
      if (!acc[d.triage_priority])
        acc[d.triage_priority] = { name: d.triage_priority, value: 0 };
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

  const total = aggr.reduce((sum, p) => sum + p.value, 0);
  const dataForChart = aggr.map((p) => ({ ...p, fill: COLORS[p.name] || "#8884d8" }));

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 w-full h-full flex flex-col items-center justify-center"
      whileHover={{ scale: 1.03 }}
    >
      <h3 className="text-xl font-bold mb-6 text-gray-700 text-center">
        🧠 Smart QA Brain
      </h3>

      <ResponsiveContainer width="100%" height={250}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={20}
          data={dataForChart}
        >
          <RadialBar
            dataKey="value"
            background={{ fill: "#f0f0f0" }}
            cornerRadius={10}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${value} tests`, `Priority ${name}`]}
            contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", color: "#fff" }}
          />
          <Legend
            iconType="circle"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: 12, color: "#555", marginTop: 10 }}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {aggr.map((p) => {
          const percent = ((p.value / total) * 100).toFixed(0);
          return (
            <div
              key={p.name}
              className="flex flex-col items-center bg-white/30 rounded-xl px-3 py-2 shadow-sm"
            >
              <span
                className="w-6 h-6 rounded-full mb-1"
                style={{ backgroundColor: COLORS[p.name] }}
              ></span>
              <span className="font-semibold text-gray-700">{p.name}</span>
              <span className="text-sm text-gray-600">
                {p.value} tests ({percent}%)
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
