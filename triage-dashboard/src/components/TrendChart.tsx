import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  DotProps,
} from "recharts";

interface TrendData {
  date: string;
  failures: number;
}

interface TrendChartProps {
  data: TrendData[];
}

const CustomDot = (props: DotProps) => {
  const { cx, cy, stroke } = props;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      stroke={stroke}
      strokeWidth={2}
      fill="#ff6347"
      style={{
        transition: "all 0.3s ease-in-out",
        cursor: "pointer",
        filter: "drop-shadow(0 0 0px #ff6347)"
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        target.setAttribute("r", "9");
        target.setAttribute("fill", "#ffa07a");
        target.style.filter = "drop-shadow(0 0 6px #ff6347)";
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget;
        target.setAttribute("r", "5");
        target.setAttribute("fill", "#ff6347");
        target.style.filter = "drop-shadow(0 0 0px #ff6347)";
      }}
    />
  );
};

export default function TrendChart({ data }: TrendChartProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className="bg-white rounded-xl p-6 shadow-lg transition-all duration-300"
      style={{
        transform: hover ? "scale(1.02)" : "scale(1)",
        boxShadow: hover
          ? "0px 6px 18px rgba(255, 99, 71, 0.3)"
          : "0px 4px 12px rgba(0, 0, 0, 0.08)",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Header */}
      <h3 className="text-gray-900 font-bold text-2xl flex items-center gap-2 mb-4">
        📈 Test Data Failure Trend
      </h3>

      {/* Chart Wrapper with hover tracking */}
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid stroke="#ddd" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#555" />
            <YAxis stroke="#555" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fefefe",
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
              labelStyle={{ color: "#333", fontWeight: "bold" }}
              itemStyle={{ color: "#ff6347" }}
            />

            <Line
              type="monotone"
              dataKey="failures"
              stroke="#ff6347"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 9, fill: "#ffa07a", strokeWidth: 2, stroke: "#ff6347" }}
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
