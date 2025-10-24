import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rec } from "../types";

interface RecordTableProps {
  data: Rec[];
}

const assignees = ["Guna", "Nidhi", "Naimisha", "Pratibha", "Mounika", "Nirupama"];

interface TableRow {
  defectId: string;
  assignee: string;
  record: Rec;
}

export default function RecordTable({ data }: RecordTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [direction, setDirection] = useState<1 | -1>(1); // 1: next, -1: prev
  const [allRows, setAllRows] = useState<TableRow[]>([]);
  const rowsPerPage = 10;

  // Initialize defect IDs and assignees once
  useEffect(() => {
    const rows: TableRow[] = data.map((record, index) => ({
      defectId: `D-${Math.floor(1000 + Math.random() * 9000)}`,
      assignee: index < assignees.length
        ? assignees[index]
        : assignees[Math.floor(Math.random() * assignees.length)],
      record,
    }));
    setAllRows(rows);
  }, [data]);

  const totalPages = Math.ceil(allRows.length / rowsPerPage);
  const currentRows = allRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleExpand = (id: string) => setExpandedId(prev => (prev === id ? null : id));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P1": return "text-red-500 font-bold";
      case "P2": return "text-yellow-400 font-semibold";
      case "P3": return "text-green-400 font-semibold";
      default: return "text-gray-200";
    }
  };

  const handlePageChange = (newPage: number) => {
    setDirection(newPage > currentPage ? 1 : -1);
    setCurrentPage(newPage);
    setExpandedId(null); // collapse all rows on page change
  };

  return (
    <div className="bg-gray-900 rounded-3xl shadow-xl p-6 overflow-x-auto">
      <h3 className="text-xl font-bold mb-4 text-white">📋 Records</h3>
      <table className="min-w-full table-auto">
        <thead className="bg-gray-800 text-white text-sm">
          <tr>
            {["Defect ID", "Test ID", "Category", "Assignee", "Priority", "Reason"].map(h => (
              <th key={h} className="text-left px-6 py-3 border-b border-gray-700">{h}</th>
            ))}
          </tr>
        </thead>

        {/* Table Body with page slide animation */}
        <tbody>
          <tr>
            <td colSpan={6} className="p-0">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentPage}
                  custom={direction}
                  initial={{ x: direction * 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -direction * 300, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <table className="min-w-full table-auto">
                    <tbody>
                      {currentRows.map(({ defectId, assignee, record }) => {
                        const isExpanded = expandedId === defectId;
                        return (
                          <React.Fragment key={defectId}>
                            <tr className="hover:bg-gray-700/40 transition duration-150">
                              <td
                                className="px-6 py-2 border-b font-semibold text-yellow-300 cursor-pointer"
                                onClick={() => toggleExpand(defectId)}
                              >
                                {defectId}
                              </td>
                              <td className="px-6 py-2 border-b">{record.test_id}</td>
                              <td className="px-6 py-2 border-b">{record.predicted_category}</td>
                              <td className="px-6 py-2 border-b">{assignee}</td>
                              <td className={`px-6 py-2 border-b ${getPriorityColor(record.triage_priority)}`}>
                                {record.triage_priority}
                              </td>
                              <td className="px-6 py-2 border-b">{record.reasoning_short}</td>
                            </tr>

                            {isExpanded && (
                              <tr className="bg-gray-800">
                                <td colSpan={6} className="p-4 text-white space-y-2 border-b border-gray-700">
                                  <p><strong>Long Reasoning:</strong> {record.reasoning_long}</p>
                                  <p><strong>Failure Type:</strong> {record.failure_type}</p>
                                  <p><strong>Impacted Layers:</strong> {record.impacted_layers?.join(", ")}</p>
                                  <p><strong>Correlation ID:</strong> {record.correlation_id}</p>
                                  <p><strong>Logs:</strong></p>
                                  <ul className="list-disc ml-5 max-h-48 overflow-y-auto text-sm font-mono">
                                    {record.logs?.map((log, idx) => <li key={idx}>{log}</li>)}
                                  </ul>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </motion.div>
              </AnimatePresence>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 text-white">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="bg-gray-700 px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ◀ Prev
          </button>
          <span>Page {currentPage} / {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="bg-gray-700 px-4 py-2 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}
