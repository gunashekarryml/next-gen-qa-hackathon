// src/components/RecordTable.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rec } from "../types";

/**
 * RecordTable (final)
 *
 * - Adds a read-only Status column (random initial value: To-do, In-progress, Needs Feedback)
 * - Replaces assignee dropdown with read-only avatar chips (circle placeholders with initials)
 * - Removes dropdowns for Status & Assignee (they are display-only)
 * - Keeps filtering, sorting, pagination, expansion, CSV export, hover/selection highlights and soft animations
 * - Filters bar is sticky at top of the table area
 */

interface RecordTableProps {
  data: Rec[];
}

const ASSIGNEES = ["Guna", "Nidhi", "Naimisha", "Pratibha", "Mounika", "Nirupama"];
const STATUS_LIST = ["To-do", "In-progress", "Needs Feedback"];

interface TableRow {
  defectId: string;
  assignee: string;
  status: string;
  record: Rec;
}

export default function RecordTable({ data }: RecordTableProps) {
  // core state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [allRows, setAllRows] = useState<TableRow[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // ui / filters / sort / paging
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [exportAll, setExportAll] = useState<boolean>(false);

  const [qTestId, setQTestId] = useState<string>("");
  const [qCategory, setQCategory] = useState<string>("");
  const [qPriority, setQPriority] = useState<string>("");
  const [qAssignee, setQAssignee] = useState<string>("");

  const [sortBy, setSortBy] = useState<"none" | "priority" | "category" | "test_id">("none");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // build rows from incoming data and assign random status / assignee (initial only)
  useEffect(() => {
    const rows: TableRow[] = data.map((record, index) => ({
      defectId: `D-${String(index % 10000).padStart(4, "0")}`,
      assignee: ASSIGNEES[index % ASSIGNEES.length],
      status: STATUS_LIST[Math.floor(Math.random() * STATUS_LIST.length)],
      record,
    }));
    setAllRows(rows);
    setCurrentPage(1);
    setExpandedId(null);
    setSelectedId(null);
  }, [data]);

  // filtering + sorting
  const filteredRows = useMemo(() => {
    let rows = allRows.slice();

    if (qTestId.trim()) {
      const s = qTestId.trim().toLowerCase();
      rows = rows.filter((r) => {
        return (
          r.defectId.toLowerCase().includes(s) ||
          String(r.record.test_id || "").toLowerCase().includes(s) ||
          String(r.record.predicted_category || "").toLowerCase().includes(s) ||
          String(r.record.triage_priority || "").toLowerCase().includes(s) ||
          String(r.assignee || "").toLowerCase().includes(s) ||
          String(r.record.reasoning_short || "").toLowerCase().includes(s)
        );
      });
    }
    
    if (qCategory.trim()) {
      rows = rows.filter((r) =>
        String(r.record.predicted_category || "")
          .toLowerCase()
          .includes(qCategory.trim().toLowerCase())
      );
    }
    if (qPriority.trim()) {
      rows = rows.filter(
        (r) =>
          String(r.record.triage_priority || "").toLowerCase() === qPriority.trim().toLowerCase()
      );
    }
    if (qAssignee.trim()) {
      rows = rows.filter((r) =>
        String(r.assignee || "").toLowerCase().includes(qAssignee.trim().toLowerCase())
      );
    }

    if (sortBy !== "none") {
      rows.sort((a, b) => {
        let av: string | number = "";
        let bv: string | number = "";

        if (sortBy === "priority") {
          const map = (p?: string) => (p === "P1" ? 1 : p === "P2" ? 2 : p === "P3" ? 3 : 99);
          av = map(a.record.triage_priority);
          bv = map(b.record.triage_priority);
        } else if (sortBy === "category") {
          av = a.record.predicted_category || "";
          bv = b.record.predicted_category || "";
        } else if (sortBy === "test_id") {
          av = String(a.record.test_id || "");
          bv = String(b.record.test_id || "");
        }

        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [allRows, qTestId, qCategory, qPriority, qAssignee, sortBy, sortDir]);

  // pagination bookkeeping
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const startIdx = (currentPage - 1) * rowsPerPage;
  const currentRows = filteredRows.slice(startIdx, startIdx + rowsPerPage);

  // helpers
  const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "P1":
        return "text-red-400 font-bold";
      case "P2":
        return "text-yellow-300 font-semibold";
      case "P3":
        return "text-green-300 font-semibold";
      default:
        return "text-gray-200";
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setExpandedId(null);
    setSelectedId(null);
    setCurrentPage(newPage);
    // scroll table into view for UX
    const el = document.getElementById("records-table-container");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // CSV export (includes status & assignee)
  const downloadCSV = () => {
    const rows = exportAll ? filteredRows : currentRows;
    const headers = [
      "defectId",
      "status",
      "test_id",
      "predicted_category",
      "assignee",
      "triage_priority",
      "reasoning_short",
    ];
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        [
          `"${r.defectId}"`,
          `"${r.status}"`,
          `"${String(r.record.test_id || "")}"`,
          `"${String(r.record.predicted_category || "")}"`,
          `"${r.assignee}"`,
          `"${r.record.triage_priority || ""}"`,
          `"${String(r.record.reasoning_short || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "records.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Avatar helper: initials + background color based on name
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const avatarColor = (name: string) => {
    // deterministic color per name
    const colors = [
      "bg-rose-500",
      "bg-indigo-500",
      "bg-emerald-500",
      "bg-yellow-500",
      "bg-sky-500",
      "bg-violet-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const idx = Math.abs(hash) % colors.length;
    return colors[idx];
  };

  return (
    <div className="rounded-3xl p-6 bg-gray-900 overflow-x-auto">
      {/* Title */}
      <div className="mb-3">
        <h3 className="text-xl font-bold text-white">📋 Records</h3>
        <p className="text-sm text-gray-300">Click a row to expand — filters below are sticky.</p>
      </div>

      {/* Sticky Filters Bar */}
      <div className="sticky top-6 z-40 mb-4">
        <div className="flex flex-wrap gap-2 items-center bg-gray-900/95 p-3 rounded-lg border border-gray-800">
          <input
            placeholder="Search anything..."
            value={qTestId}
            onChange={(e) => {
              setQTestId(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded bg-gray-800 text-white text-sm"
          />

          <input
            placeholder="Category"
            value={qCategory}
            onChange={(e) => {
              setQCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded bg-gray-800 text-white text-sm"
          />

          <select
            value={qPriority}
            onChange={(e) => {
              setQPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded bg-gray-800 text-white text-sm"
          >
            <option value="">Priority (all)</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
          </select>

          <input
            placeholder="Assignee"
            value={qAssignee}
            onChange={(e) => {
              setQAssignee(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded bg-gray-800 text-white text-sm"
          />

          <div className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={exportAll}
                onChange={(e) => setExportAll(e.target.checked)}
                className="accent-rose-400"
              />
              Export all
            </label>

            <button
              onClick={downloadCSV}
              className="px-3 py-2 rounded bg-rose-500 text-white text-sm"
              title="Export CSV"
            >
              ⤓ CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table container */}
      <div id="records-table-container" className="relative w-full min-h-[380px] rounded-xl">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-800 text-sm text-white sticky top-24 z-30">
            <tr>
              {["", "Defect ID", "Status", "Test ID", "Category", "Assignee", "Priority", "Reason"].map(
                (h) => (
                  <th key={h} className="text-left px-4 py-3 border-b border-gray-700">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  No records match your filters.
                </td>
              </tr>
            )}

            {currentRows.map(({ defectId, assignee, status, record }) => {
              const isExpanded = expandedId === defectId;
              const isSelected = selectedId === defectId;

              return (
                <React.Fragment key={defectId}>
                  <motion.tr
                    layout
                    onMouseEnter={() => setHoveredRow(defectId)}
                    onMouseLeave={() => setHoveredRow((prev) => (prev === defectId ? null : prev))}
                    initial={false}
                    animate={{
                      background:
                        hoveredRow === defectId || isSelected ? "#0b1220" : "transparent",
                      boxShadow: isSelected ? "0 6px 20px rgba(0,0,0,0.3)" : "none",
                    }}
                    transition={{ duration: 0.12 }}
                    className="hover:bg-gray-700/30"
                    onClick={() => setSelectedId((prev) => (prev === defectId ? null : defectId))}
                  >
                    {/* expand chevron */}
                    <td className="px-3 py-2 border-b">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(defectId);
                        }}
                        className="p-1 rounded hover:bg-white/5"
                      >
                        <motion.span
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 22 }}
                          className="inline-block text-rose-400"
                        >
                          ▶
                        </motion.span>
                      </button>
                    </td>

                    {/* defect id */}
                    <td className="px-4 py-2 border-b font-semibold text-sm">
                      <span className="font-mono text-xs text-rose-300">{defectId}</span>
                    </td>

                    {/* status (read-only label) */}
                    <td className="px-4 py-2 border-b">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          status === "To-do"
                            ? "bg-gray-700 text-gray-200"
                            : status === "In-progress"
                            ? "bg-yellow-600 text-black"
                            : "bg-violet-600 text-white"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    {/* test id */}
                    <td className="px-4 py-2 border-b text-sm">{record.test_id}</td>

                    {/* category */}
                    <td className="px-4 py-2 border-b text-sm">{record.predicted_category}</td>

                    {/* assignee (read-only avatar chip) */}
                    <td className="px-4 py-2 border-b">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${avatarColor(
                            assignee
                          )}`}
                          title={assignee}
                        >
                          {getInitials(assignee)}
                        </div>
                        <div className="text-sm text-gray-200">{assignee}</div>
                      </div>
                    </td>

                    {/* priority */}
                    <td className={`px-4 py-2 border-b text-sm ${getPriorityColor(record.triage_priority)}`}>
                      {record.triage_priority}
                    </td>

                    {/* reason short */}
                    <td className="px-4 py-2 border-b max-w-xs truncate text-sm">
                      {record.reasoning_short}
                    </td>
                  </motion.tr>

                  {/* expanded details */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.tr
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="bg-gray-800"
                      >
                        <td colSpan={8} className="p-4 text-white space-y-3 border-b border-gray-700">
                          <div className="flex justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <p>
                                <strong>Long Reasoning:</strong> {record.reasoning_long}
                              </p>
                              <p>
                                <strong>Failure Type:</strong> {record.failure_type}
                              </p>
                              <p>
                                <strong>Impacted Layers:</strong> {record.impacted_layers?.join(", ")}
                              </p>
                              <p>
                                <strong>Correlation ID:</strong> {record.correlation_id}
                              </p>
                            </div>
                          </div>

                          <div>
                            <strong>Logs:</strong>
                            <ul className="list-disc ml-5 mt-2 max-h-48 overflow-y-auto text-xs font-mono text-gray-200">
                              {record.logs && record.logs.length > 0 ? (
                                record.logs.map((l, i) => (
                                  <li key={i} className="py-0.5">
                                    {l}
                                  </li>
                                ))
                              ) : (
                                <li className="text-gray-400">No logs available</li>
                              )}
                            </ul>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 pt-4 flex flex-wrap items-center justify-between gap-3 bg-gray-900/80 text-white border border-gray-800 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="bg-gray-700 px-4 py-2 rounded-lg disabled:opacity-40"
          >
            ◀ Prev
          </button>

          <div className="text-sm">
            Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="bg-gray-700 px-4 py-2 rounded-lg disabled:opacity-40"
          >
            Next ▶
          </button>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-gray-800 px-2 py-1 rounded text-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={exportAll}
              onChange={(e) => setExportAll(e.target.checked)}
              className="accent-rose-400"
            />
            <span>all</span>
          </label>
        </div>
      </div>
    </div>
  );
}
