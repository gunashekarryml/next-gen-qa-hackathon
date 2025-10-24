// src/components/charts/ModernCICDChart.tsx
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

interface CICDRun {
  run_number: number;
  status: "success" | "failure";
  duration: number;
  timestamp: string;
}

interface ModernCICDChartProps {
  data: CICDRun[];
}

const ModernCICDChart: React.FC<ModernCICDChartProps> = ({ data }) => {
  const successCount = data.filter(r => r.status === "success").length;
  const failureCount = data.filter(r => r.status === "failure").length;

  const pieData = [
    { name: "Success", value: successCount },
    { name: "Failure", value: failureCount },
  ];

  const COLORS = ["#34d399", "#f87171"];

  return (
    <div className="bg-gray-800 rounded-2xl p-6 shadow-md text-white">
      <h3 className="text-lg font-semibold mb-4">🚀 CI/CD Recent Runs</h3>

      {/* Timeline dots */}
      <div className="flex space-x-1 overflow-x-auto pb-2">
        {data.map(run => (
          <motion.div
            key={run.run_number}
            className={`w-4 h-4 rounded-full flex-shrink-0 ${
              run.status === "success" ? "bg-green-500" : "bg-red-500"
            }`}
            title={`Run #${run.run_number}: ${run.status}`}
            whileHover={{ scale: 1.5 }}
          />
        ))}
      </div>

      {/* Donut chart */}
      <div className="mt-6 w-full h-40">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={5}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: 6 }}
              itemStyle={{ color: "#fff" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ModernCICDChart;
