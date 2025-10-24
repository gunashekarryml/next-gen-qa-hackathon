import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
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

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const handleMouseEnter = (_: any, index: number) => setActiveIndex(index);
  const handleMouseLeave = () => setActiveIndex(null);

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, payload, percent } = props;
    return (
      <g>
        <defs>
          <linearGradient id={`grad-${payload.name}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS[payload.name]} />
            <stop offset="100%" stopColor={COLORS[payload.name]} stopOpacity={0.7} />
          </linearGradient>
        </defs>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 15}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={`url(#grad-${payload.name})`}
          stroke="#fff"
          strokeWidth={2}
          style={{ filter: "drop-shadow(0 0 15px rgba(0,0,0,0.25))" }}
        />
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333" fontWeight={600}>
          {(percent * 100).toFixed(0)}%
        </text>
      </g>
    );
  };

  return (
    <motion.div className="bg-white rounded-3xl p-6 shadow-xl flex flex-col gap-4" whileHover={{ scale: 1.01 }}>
      <h3 className="text-gray-900 font-bold text-2xl mb-4">⚡ Priority Split</h3>

      <div className="flex gap-6 items-center">
        {/* Shifted Pie Chart Left */}
        <div className="w-3/5 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={aggr}
                dataKey="value"
                nameKey="name"
                cx="40%"   // <-- shifted slightly left from 45% to 40%
                cy="50%"
                innerRadius={60}
                outerRadius={110}
                paddingAngle={5}
                activeIndex={activeIndex ?? undefined}
                activeShape={renderActiveShape}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {aggr.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name] || "#8884d8"}
                    cursor="pointer"
                    stroke="#fff"
                    strokeWidth={activeIndex === index ? 4 : 1}
                    style={{
                      transition: "all 0.3s ease-in-out",
                      filter:
                        activeIndex === index
                          ? "drop-shadow(0 0 20px rgba(0,0,0,0.3))"
                          : "none",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value} tests`, `Priority ${name}`]}
                contentStyle={{
                  backgroundColor: "#111",
                  border: "none",
                  borderRadius: 8,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
                }}
                itemStyle={{ color: "#fff", fontWeight: 500 }}
                labelStyle={{ color: "#fff", fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Side Stats */}
        <div className="flex flex-col gap-1 w-2/5">
          {aggr.map((entry, index) => (
            <div
              key={entry.name}
              className="flex justify-between items-center bg-gray-50 rounded-xl px-5 py-3 hover:bg-gray-100 transition shadow-md"
            >
              <div className="flex items-center gap-1">
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: COLORS[entry.name] || "#8884d8" }}
                />
                <span className="font-semibold text-gray-800 text-lg">{`Priority ${entry.name}`}</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">{entry.value} tests</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

