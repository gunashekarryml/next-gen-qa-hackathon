import React, { useState } from "react";
import { Treemap, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Rec } from "../types";

export interface ModuleTreemapChartProps {
  data: Rec[];
}

const colors = [
  "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
  "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ab"
];

function truncateText(text: any, maxLength: number) {
  if (!text || typeof text !== "string") return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "…" : text;
}

function ModuleCell(props: any) {
  const {
    x, y, width, height,
    name = "", index,
    activeIndex,
    setActiveIndex
  } = props;

  const showText = width > 70 && height > 28;
  const clippedText = truncateText(name, Math.floor(width / 7));

  const isActive = activeIndex === index;
  const isDimmed = activeIndex !== null && !isActive;

  return (
    <g
      onMouseEnter={() => setActiveIndex(index)}
      onMouseLeave={() => setActiveIndex(null)}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={colors[index % colors.length]}
        stroke="#fff"
        style={{
          opacity: isDimmed ? 0.4 : 1,
          transition: "all 0.25s ease",
          filter: isActive ? "drop-shadow(0 0 16px rgba(0,0,0,0.25))" : "none",
          transformOrigin: `${x + width / 2}px ${y + height / 2}px`,
          transform: isActive ? "scale(1.05)" : "scale(1)"
        }}
      />

      {showText && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          fill="#111"
          fontSize={11}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {clippedText}
        </text>
      )}
    </g>
  );
}

export default function ModuleTreemapChart({ data }: ModuleTreemapChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const moduleCounts = data.reduce((acc: any, item) => {
    const moduleName = item.module || "Unknown";
    acc[moduleName] = (acc[moduleName] || 0) + 1;
    return acc;
  }, {});

  const treemapData = Object.entries(moduleCounts).map(([name, size], i) => ({
    name,
    size,
    index: i,
    activeIndex,
    setActiveIndex
  }));

  return (
    <motion.div
      className="bg-white rounded-3xl p-6 shadow-xl"
      whileHover={{
        scale: 1.02,
        boxShadow: "0px 6px 18px rgba(99, 102, 241, 0.25)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <h3 className="text-gray-900 font-bold text-xl mb-4 flex items-center gap-2">
        📦 Module Treemap
      </h3>

      <ResponsiveContainer width="100%" height={330}>
        <Treemap
          data={treemapData}
          dataKey="size"
          content={<ModuleCell />}
        >
          <Tooltip
            formatter={(v: any, _: any, p: any) => [`${v} tests`, p?.payload?.name]}
            contentStyle={{
              backgroundColor: "#111827",
              border: "none",
              borderRadius: 8,
              boxShadow: "0 2px 10px rgba(0,0,0,0.25)"
            }}
            itemStyle={{ color: "#fff" }}
          />
        </Treemap>
      </ResponsiveContainer>
    </motion.div>
  );
}
