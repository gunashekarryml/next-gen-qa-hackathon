import { motion } from "framer-motion";
import { Rec } from "../types";

interface RecordTableProps {
  data: Rec[];
}

export default function RecordTable({ data }: RecordTableProps) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6 overflow-x-auto">
      <h3 className="text-xl font-bold mb-4 text-gray-700">📋 Records</h3>
      <table className="min-w-full border-collapse">
        <thead className="bg-indigo-100">
          <tr>
            {["Test ID", "Category", "Confidence", "Priority", "Reason"].map((h) => (
              <th key={h} className="text-left px-4 py-2 border-b">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, i) => (
            <motion.tr
              key={i}
              className={`hover:bg-indigo-50 transition duration-200 cursor-pointer`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <td className="px-4 py-2 border-b">{r.test_id}</td>
              <td className="px-4 py-2 border-b">{r.predicted_category}</td>
              <td className="px-4 py-2 border-b">{Math.round((r.confidence || 0) * 100)}%</td>
              <td className={`px-4 py-2 border-b font-bold ${r.triage_priority === "P1" ? "text-red-500" : "text-green-600"}`}>
                {r.triage_priority}
              </td>
              <td className="px-4 py-2 border-b">{r.reasoning_short}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
