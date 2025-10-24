import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rec } from "../types";

interface RecordTableProps {
  data: Rec[];
}

const assignees = ["Alice", "Bob", "Charlie", "David", "Eva", "Frank", "Grace", "Helen"];

export default function RecordTable({ data }: RecordTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

  const defectIds = useMemo(() => data.map(() => `D-${Math.floor(1000 + Math.random() * 9000)}`), [data]);
  const assigneeList = useMemo(() => data.map(() => assignees[Math.floor(Math.random() * assignees.length)]), [data]);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRecords = data.slice(startIndex, startIndex + rowsPerPage);
  const currentDefectIds = defectIds.slice(startIndex, startIndex + rowsPerPage);
  const currentAssignees = assigneeList.slice(startIndex, startIndex + rowsPerPage);

  const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P1": return "text-red-500 font-bold";
      case "P2": return "text-yellow-400 font-semibold";
      case "P3": return "text-green-400 font-semibold";
      default: return "text-gray-200";
    }
  };

  return (
    <div className="bg-gray-900 rounded-3xl shadow-xl p-6 overflow-x-auto">
      <h3 className="text-xl font-bold mb-4 text-white">📋 Records</h3>
      <table className="min-w-full table-auto">
        <thead className="bg-gray-800 text-white text-sm">
          <tr>
            {["Defect ID", "Test ID", "Category", "Assignee", "Priority", "Reason"].map((h) => (
              <th key={h} className="text-left px-6 py-3 border-b border-gray-700">{h}</th>
            ))}
          </tr>
        </thead>
        <AnimatePresence>
          <motion.tbody
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {currentRecords.map((r, i) => {
              const defectId = currentDefectIds[i];
              const isExpanded = expandedId === defectId;
              const assignee = currentAssignees[i];

              return (
                <React.Fragment key={defectId}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-700/40 transition duration-150"
                  >
                    <td className="px-6 py-2 border-b font-semibold text-yellow-300 cursor-pointer" onClick={() => toggleExpand(defectId)}>{defectId}</td>
                    <td className="px-6 py-2 border-b">{r.test_id}</td>
                    <td className="px-6 py-2 border-b">{r.predicted_category}</td>
                    <td className="px-6 py-2 border-b">{assignee}</td>
                    <td className={`px-6 py-2 border-b ${getPriorityColor(r.triage_priority)}`}>{r.triage_priority}</td>
                    <td className="px-6 py-2 border-b">{r.reasoning_short}</td>
                  </motion.tr>

                  {isExpanded && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-800"
                    >
                      <td colSpan={6} className="p-4 text-white space-y-2 border-b border-gray-700">
                        <p><strong>Long Reasoning:</strong> {r.reasoning_long}</p>
                        <p><strong>Failure Type:</strong> {r.failure_type}</p>
                        <p><strong>Impacted Layers:</strong> {r.impacted_layers?.join(", ")}</p>
                        <p><strong>Correlation ID:</strong> {r.correlation_id}</p>
                        <p><strong>Logs:</strong></p>
                        <ul className="list-disc ml-5 max-h-48 overflow-y-auto text-sm font-mono">
                          {r.logs?.map((log, idx) => <li key={idx}>{log}</li>)}
                        </ul>
                      </td>
                    </motion.tr>
                  )}
                </React.Fragment>
              );
            })}
          </motion.tbody>
        </AnimatePresence>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 text-white">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="bg-gray-700 px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed">◀ Prev</button>
          <span>Page {currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="bg-gray-700 px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed">Next ▶</button>
        </div>
      )}
    </div>
  );
}
