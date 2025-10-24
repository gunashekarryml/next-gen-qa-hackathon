import React from "react";
import { motion } from "framer-motion";
import { Rec } from "../types";

interface HeatMapChartProps {
  data: Rec[];
}

const HeatMapChart: React.FC<HeatMapChartProps> = ({ data }) => {
  const categories = Array.from(new Set(data.map((d) => d.predicted_category)));
  const priorities = Array.from(new Set(data.map((d) => d.triage_priority)));

  // Build heatmap matrix
  const heatmap: { x: string; y: string; value: number }[] = [];
  categories.forEach((cat) => {
    priorities.forEach((pri) => {
      const count = data.filter(
        (d) => d.predicted_category === cat && d.triage_priority === pri
      ).length;
      heatmap.push({ x: cat, y: pri, value: count });
    });
  });

  const values = heatmap.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Gradient color mapping (blue → green → yellow → red)
  const getColor = (val: number) => {
    if (val === 0) return "#f5f5f5";
    const ratio = (val - min) / (max - min || 1);
    if (ratio < 0.33) {
      return `rgb(96, ${Math.round(250 * ratio * 3)}, 250)`; // blue → cyan
    } else if (ratio < 0.66) {
      return `rgb(${Math.round(96 + 159 * (ratio - 0.33) * 3)}, 250, 96)`; // cyan → green
    } else {
      return `rgb(250, ${Math.round(250 * (1 - (ratio - 0.66) * 3))}, 96)`; // green → yellow/red
    }
  };

  // Custom tooltip
  const CustomTooltip: React.FC<{ cell: { x: string; y: string; value: number } }> = ({
    cell,
  }) => (
    <div className="bg-white p-2 rounded shadow border text-sm">
      <p className="font-semibold">{cell.x}</p>
      <p>Priority: {cell.y}</p>
      <p>Count: {cell.value}</p>
    </div>
  );

  const cellSize = 100; // Bigger cells for visibility

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg relative overflow-auto">
      <h3 className="text-xl font-semibold mb-6 text-indigo-700">
        🔥 Category vs Priority Heatwave
      </h3>

      {/* Grid Heatmap */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${categories.length}, ${cellSize}px)`,
          gridAutoRows: `${cellSize}px`,
          gap: "6px",
          justifyContent: "center",
          overflowX: "auto",
          paddingBottom: "10px",
        }}
      >
        {heatmap.map((cell, idx) => (
          <motion.div
            key={idx}
            animate={pulseAnimation}
            whileHover={{
              scale: 1.1,
              boxShadow: "0 6px 15px rgba(0,0,0,0.25)",
            }}
            className="flex items-center justify-center rounded-lg cursor-pointer"
            style={{ backgroundColor: getColor(cell.value) }}
            title={`Category: ${cell.x}\nPriority: ${cell.y}\nCount: ${cell.value}`}
          >
            {cell.value > 0 && (
              <span className="text-lg font-bold text-white">{cell.value}</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <span className="text-xs text-gray-500">Low</span>
        <div className="w-64 h-4 rounded bg-gradient-to-r from-blue-400 via-green-400 to-red-400"></div>
        <span className="text-xs text-gray-500">High</span>
      </div>

      {/* X-axis labels */}
      <div
        className="flex justify-center mt-4 gap-6 flex-wrap"
        style={{ width: categories.length * cellSize }}
      >
        {categories.map((cat, idx) => (
          <span
            key={idx}
            className="text-sm font-semibold text-gray-600"
            style={{ width: cellSize, textAlign: "center" }}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Y-axis labels */}
      <div
        className="absolute left-6 top-[120px] flex flex-col justify-start gap-6"
        style={{ height: priorities.length * cellSize }}
      >
        {priorities.map((pri, idx) => (
          <span
            key={idx}
            className="text-sm font-semibold text-gray-600"
            style={{
              height: cellSize,
              display: "flex",
              alignItems: "center",
            }}
          >
            {pri}
          </span>
        ))}
      </div>
    </div>
  );
};

export default HeatMapChart;
