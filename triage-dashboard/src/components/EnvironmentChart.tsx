import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Rec } from "../types";

// Color palette for environments
const ENV_COLORS = [
  "#7B5AE0", // Purply
  "#FFAA4C", // Sunny Orange
  "#4CC9F0", // Aqua Pop
  "#59E890", // Green Mint
  "#FF6B6B", // Spicy Red
  "#A084DC", // Soft Violet
  "#F8C537", // Warm Gold
];

export default function EnvironmentChart({ data }: { data: Rec[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const envCounts = data.reduce((acc, item) => {
    acc[item.environment || "Unknown"] =
      (acc[item.environment || "Unknown"] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(envCounts).map((environment, i) => ({
    environment,
    count: envCounts[environment],
    color: ENV_COLORS[i % ENV_COLORS.length],
  }));

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
      <h3 className="text-gray-900 font-bold text-2xl mb-5 flex gap-2 items-center">
        🌍 Environment Insights
      </h3>

      <ResponsiveContainer width="100%" height={330}>
        <BarChart data={chartData} onMouseLeave={() => setActiveIndex(null)}>
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="rgba(0,0,0,0.07)"
          />

          <XAxis
            dataKey="environment"
            tick={{ fill: "#333", fontWeight: 600 }}
            tickMargin={10}
            axisLine={{ stroke: "rgba(0,0,0,0.15)" }}
          />

          <YAxis
            tick={{ fill: "#444" }}
            axisLine={{ stroke: "rgba(0,0,0,0.15)" }}
            tickLine={{ stroke: "rgba(0,0,0,0.15)" }}
          />

          <Tooltip
            contentStyle={{
              background: "#1c1c1c",
              borderRadius: 12,
              padding: "10px 14px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            itemStyle={{ color: "#fff", fontWeight: 600 }}
            labelStyle={{ color: "#fff", fontWeight: 700 }}
            formatter={(v: any, _, p: any) => [
              `${v} tests`,
              `Env: ${p.payload.environment}`,
            ]}
          />

          <Bar dataKey="count" radius={[12, 12, 0, 0]}>
            {chartData.map((entry, index) => {
              const isActive = activeIndex === index;
              const isDim = activeIndex !== null && !isActive;

              return (
                <Cell
                  key={index}
                  cursor="pointer"
                  fill={entry.color}
                  onMouseEnter={() => setActiveIndex(index)}
                  style={{
                    transition: "all 0.3s ease-in-out",
                    opacity: isDim ? 0.4 : 1,
                    filter: isActive
                      ? `drop-shadow(0 0 12px ${entry.color}99)`
                      : "none",
                    transformOrigin: "bottom center",
                    transform: isActive ? "scaleY(1.12)" : "scaleY(1)",
                  }}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
