import { motion } from "framer-motion";

interface CounterCardProps {
  label: string;
  value: number;
  color: "indigo" | "red" | "pink" | "yellow";
}

export default function CounterCard({ label, value, color }: CounterCardProps) {
  return (
    <motion.div
      className={`bg-white rounded-3xl shadow-2xl p-6 text-center transform transition hover:scale-105`}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <p className="text-gray-700 font-semibold">{label}</p>
      <motion.p
        className={`text-4xl font-extrabold mt-2 text-${color}-500`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
      >
        {value}
      </motion.p>
    </motion.div>
  );
}
