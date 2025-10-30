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
import ModuleTreemapChart from "./components/ModuleTreemapChart";
import EnvironmentChart from "./components/EnvironmentChart";
import QACopilotChat, { TestItem } from "./components/QACopilotChat";
import AIRootCauseSummary from "./components/AIRootCauseSummary";

import { Rec } from "./types";
import logo from "./assets/logo.png";
import teamLogo from "./assets/team-logo.png"; // ✅ fixed image import

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
          .map((l) => JSON.parse(l) as Rec)
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

  const failedTests = data.filter((t) => t.status === "FAIL");

  const testItems: TestItem[] = data.map((r) => ({
    id: r.test_id,
    name: r.failure_type || r.predicted_category || "Unknown Test",
    status:
      r.status === "PASS"
        ? "passed"
        : r.status === "FAIL"
        ? "failed"
        : "skipped",
    executedAt: r.timestamp,
    details:
      r.reasoning_short ||
      r.reasoning_long ||
      r.logs?.join("\n") ||
      "No details",
  }));

  return (
    <div className="relative min-h-screen font-sans text-white overflow-hidden bg-black">
      {/* Left Company Logo (unchanged) */}
      <img
        src={logo}
        alt="Logo"
        style={{ width: "180px", height: "180px", top: "-30px", left: "40px" }}
        className="absolute top-4 left-4 object-contain z-20 opacity-80 hover:opacity-100 transition-all duration-300 transform hover:scale-110 shadow-lg cursor-pointer"
      />

      {/* ✅ Right Team Logo: Smaller + Clickable + Rotation Effect */}
      <a
        href="https://github.com/gunashekarryml/next-gen-qa-hackathon" // ✅ update to your real link
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={teamLogo}
          alt="Team Logo"
          style={{ width: "110px", height: "110px", top: "05px", right: "40px" }}
          className="absolute top-4 right-4 object-contain z-20 opacity-90 hover:opacity-100 transition-all duration-300 transform hover:scale-110 shadow-lg cursor-pointer"
        />
      </a>

      {/* Particles */}
      <Particles
        id="tsparticles"
        className="absolute inset-0 -z-10"
        init={particlesInit}
        options={{}}
      />

      {/* Header */}
      <motion.header
        className="text-center py-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
          Triage Dashboard
        </h1>
      </motion.header>

      {/* Counters */}
      <CounterCards data={data} />

      {/* Row 1 */}
      <div className="px-8 mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendChart data={trendData} />
        <PriorityChart data={data} />
      </div>

      {/* Row 2 */}
      <div className="px-8 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CategoryChart data={data} />
        <CICDTrendChart data={ciCdData} />
      </div>

      {/* ✅ Row 3 */}
      <div className="px-8 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ModuleTreemapChart data={data} />
        <EnvironmentChart data={data} />
      </div>

      {/* Table + Summary */}
      <div className="px-8 mt-8 mb-12">
        <RecordTable data={data} />
        <AIRootCauseSummary failedTests={failedTests} />
      </div>

      {/* ✅ QA Copilot Chat remains untouched */}
      <QACopilotChat testData={testItems} />

      <footer className="text-center text-sm pb-6 text-white/70">
        <div className="font-semibold text-white/90 hover:text-purple-300 transition duration-300">
          💜 Built with passion by <span className="text-purple-400 font-bold">Team Next-Gen QA</span>
        </div>
        <div className="mt-1 text-[13px] italic text-purple-300 animate-pulse">
          🚀 Quality-Driven Minds — Innovating the Future of Testing
        </div>
      </footer>
    </div>
  );
};

export default App;
