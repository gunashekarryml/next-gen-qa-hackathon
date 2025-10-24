// src/App.tsx
import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

import CategoryChart from "./components/CategoryChart";
import PriorityChart from "./components/PriorityChart";
import TrendChart from "./components/TrendChart";
import HeatMapChart from "./components/ConfidenceHeatmap";
import CounterCards from "./components/CounterCard";
import RecordTable from "./components/RecordTable";

import { Rec } from "./types";

const App: React.FC = () => {
  const [data, setData] = useState<Rec[]>([]);

  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  // Load enriched data
  useEffect(() => {
    const jsonPath = `${process.env.PUBLIC_URL}/TestData.enriched.jsonl`; // ✅ fixed path for GH Pages
    fetch(jsonPath)
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

  // Trend data dynamically based on timestamp
  const trendData = React.useMemo(() => {
    const counts: { [date: string]: number } = {};
    data.forEach((rec) => {
      const ts = rec.timestamp;
      if (!ts) return;
      const d = new Date(ts);
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

  const totalTests = data.length;
  const highPriority = data.filter((d) => ["P1", "P2"].includes(d.triage_priority)).length;
  const assertionFails = data.filter((d) => d.predicted_category === "Assertion Failure").length;
  const timeouts = data.filter((d) => d.predicted_category === "Timeout").length;

  return (
    <div className="relative min-h-screen font-sans text-white overflow-hidden bg-gray-900">
      {/* Particle Background */}
      <Particles
        id="tsparticles"
        className="absolute inset-0 -z-10"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          interactivity: {
            events: { onHover: { enable: true, mode: "repulse" } },
            modes: { repulse: { distance: 120, duration: 0.4 } },
          },
          particles: {
            color: { value: ["#ffffff", "#ff99cc", "#00ffff"] },
            links: { color: "#fff", distance: 140, enable: true, opacity: 0.2, width: 1 },
            move: { enable: true, speed: 1.4, outModes: "out" },
            number: { value: 70, density: { enable: true, area: 800 } },
            opacity: { value: 0.5 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 4 } },
          },
          detectRetina: true,
        }}
      />

      {/* Header */}
      <motion.header
        className="text-center py-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">Triage Dashboard</h1>
        <p className="text-purple-200 mt-2">AI-powered insights for your test suite</p>
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
        <HeatMapChart data={data} />
      </div>

      {/* Table */}
      <div className="px-8 mt-8 mb-12">
        <RecordTable data={data} />
      </div>

      <footer className="text-center text-white/80 text-sm pb-6">
        Built with 💜 React, Recharts, tsparticles & Tailwind
      </footer>
    </div>
  );
};

export default App;
