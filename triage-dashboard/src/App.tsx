import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

import CategoryChart from "./components/CategoryChart";
import PriorityChart from "./components/PriorityChart";
import TrendChart from "./components/TrendChart";
import CICDTrendChart from "./components/CICDTrendChart";
import CounterCards from "./components/CounterCard";
import RecordTable from "./components/RecordTable";
import QACopilotChat, { TestItem } from "./components/QACopilotChat";
import AIRootCauseSummary from "./components/AIRootCauseSummary";

import { Rec } from "./types";
import logo from "./assets/logo.png";

interface CICDRun {
  run_number: number;
  status: "success" | "failure";
  duration: number;
  timestamp: string;
}

const App: React.FC = () => {
  const [data, setData] = useState<Rec[]>([]);

  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + "/TestData.enriched.jsonl")
      .then((r) => r.text())
      .then((t) =>
        t
          .split("\n")
          .filter(Boolean)
          .map((l) => {
            try {
              return JSON.parse(l) as Rec;
            } catch {
              return null;
            }
          })
          .filter(Boolean) as Rec[]
      )
      .then((arr) => setData(arr))
      .catch((err) => {
        console.error("❌ Failed to load data", err);
        setData([]);
      });
  }, []);

  const trendData = React.useMemo(() => {
    const counts: { [date: string]: number } = {};
    data.forEach((rec) => {
      if (!rec.timestamp) return;
      const d = new Date(rec.timestamp);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([a], [b]) => {
        const [da, ma] = a.split("/").map(Number);
        const [db, mb] = b.split("/").map(Number);
        return ma - mb || da - db;
      })
      .map(([date, failures]) => ({ date, failures }));
  }, [data]);

  const ciCdData: CICDRun[] = React.useMemo(() => {
    return data.slice(-30).map((rec, idx) => ({
      run_number: idx + 1,
      status: Math.random() > 0.2 ? "success" : "failure",
      duration: Math.floor(Math.random() * 10) + 1,
      timestamp: rec.timestamp || new Date().toISOString(),
    }));
  }, [data]);

  const passRate = React.useMemo(() => {
    const total = ciCdData.length;
    const passed = ciCdData.filter((r) => r.status === "success").length;
    return total > 0 ? (passed / total) * 100 : 0;
  }, [ciCdData]);

  const failedTests = data.filter((t) => t.status === "FAIL");

  // Map data for QA Copilot
  const testItems: TestItem[] = data.map((r) => ({
    id: r.test_id,
    name: r.failure_type || r.predicted_category || "Unknown Test",
    status: r.status === "PASS" ? "passed" : r.status === "FAIL" ? "failed" : "skipped",
    executedAt: r.timestamp,
    details: r.reasoning_short || r.reasoning_long || r.logs?.join("\n") || "No details available",
  }));

  return (
    <div className="relative min-h-screen font-sans text-white overflow-hidden bg-black">
      {/* Logo */}
      <img
        src={logo}
        alt="Logo"
        style={{ width: "180px", height: "180px", top: "-30px", left: "40px" }}
        className="absolute top-4 left-4 object-contain z-20
                   opacity-80 hover:opacity-100 transition-all duration-300
                   transform hover:scale-110 shadow-lg cursor-pointer"
      />

      {/* Particles */}
      <Particles id="tsparticles" className="absolute inset-0 -z-10" init={particlesInit} options={{}} />

      {/* Header */}
      <motion.header
        className="text-center py-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">Triage Dashboard</h1>
        <p className="text-purple-200 mt-2">Smarter Testing for Tomorrow</p>
      </motion.header>

      {/* Counters */}
      <CounterCards data={data} />

      {/* Charts */}
      <div className="px-8 mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendChart data={trendData} />
        <PriorityChart data={data} />
      </div>

      <div className="px-8 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CategoryChart data={data} />
        <CICDTrendChart data={ciCdData} />
      </div>

      {/* Table + Root Cause Section */}
      <div className="px-8 mt-8 mb-12">
        <RecordTable data={data} />
        <AIRootCauseSummary failedTests={failedTests} />
      </div>

      {/* QA Copilot */}
      <QACopilotChat testData={testItems} />

      <footer className="text-center text-white/80 text-sm pb-6">
        Built with 💜 React, Recharts, tsparticles & Tailwind
      </footer>
    </div>
  );
};

export default App;
