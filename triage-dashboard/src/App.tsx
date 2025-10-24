import { useEffect, useState } from "react";
import { motion } from "framer-motion";
// import Confetti from "react-confetti";
import CategoryChart from "./components/CategoryChart";
import PriorityChart from "./components/PriorityChart";
import RecordTable from "./components/RecordTable";
import { Rec } from "./types";

export default function App() {
  const [data, setData] = useState<Rec[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetch("/TestData.enriched.jsonl")
      .then((r) => r.text())
      .then((t) =>
        t
          .split("\n")
          .filter(Boolean)
          .map((l) => JSON.parse(l))
      )
      .then((arr) => {
        setData(arr);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      })
      .catch(() => setData([]));
  }, []);

  // Quick stats
  const total = data.length;
  const highPriority = data.filter((d) => d.triage_priority === "P1" || d.triage_priority === "P2").length;
  const assertionFails = data.filter((d) => d.predicted_category === "Assertion Failure").length;
  const timeouts = data.filter((d) => d.predicted_category === "Timeout").length;

  return (
    <div className="relative min-h-screen font-sans text-gray-800 overflow-hidden bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500">
      {/* {showConfetti && <Confetti recycle={false} numberOfPieces={350} />} */}

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center py-8 text-white"
      >
        <h1 className="text-5xl font-extrabold drop-shadow-lg">
          🧠 Failure Triage Dashboard
        </h1>
        <p className="text-lg text-purple-200 mt-2">
          AI-powered insight into your QA suite health
        </p>
      </motion.header>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 mt-6">
        {[
          { label: "Total Tests", value: total },
          { label: "High Priority", value: highPriority },
          { label: "Assertion Failures", value: assertionFails },
          { label: "Timeouts", value: timeouts },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className="bg-white/90 rounded-2xl p-6 shadow-lg text-center backdrop-blur-sm"
          >
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-indigo-700 mt-1">
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 mt-10"
      >
        <CategoryChart data={data} />
        <PriorityChart data={data} />
      </motion.div>

      {/* Record Table */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="px-8 mt-10 mb-16"
      >
        <RecordTable data={data} />
      </motion.div>

      {/* Footer */}
      <footer className="text-center text-white/80 text-sm pb-6">
        Built with 💜 using React, Tailwind, Recharts & Framer Motion
      </footer>
    </div>
  );
}
