// src/components/CIQualityPersonaWidget.tsx
import React from "react";
import { motion } from "framer-motion";

interface CIQualityPersonaProps {
  passRate: number; // between 0-100
}

const getPersonaDetails = (passRate: number) => {
  if (passRate >= 90) {
    return {
      mood: "Confident",
      emoji: "😎",
      color: "#22c55e",
      message: "Everything is shipshape. Test gods are smiling!"
    };
  }
  if (passRate >= 70) {
    return {
      mood: "Nervous",
      emoji: "😬",
      color: "#facc15",
      message: "A few gremlins lurking. Keep a watchful eye!"
    };
  }
  return {
    mood: "Stressed",
    emoji: "😱",
    color: "#ef4444",
    message: "Crisis mode. Deploy extra caffeine immediately!"
  };
};

const CIQualityPersonaWidget: React.FC<CIQualityPersonaProps> = ({ passRate }) => {
  const details = getPersonaDetails(passRate);

  return (
    <motion.div
      className="rounded-2xl shadow-lg p-4 flex flex-col items-center gap-2"
      style={{
        background: details.color + "20",
        border: `2px solid ${details.color}`,
        minWidth: "200px",
        maxWidth: "260px"
      }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        style={{ fontSize: "3.2rem" }}
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
      >
        {details.emoji}
      </motion.div>

      <h3
        style={{
          fontWeight: 700,
          fontSize: "1.1rem",
          textTransform: "uppercase",
          color: details.color
        }}
      >
        {details.mood}
      </h3>

      <p
        style={{
          fontSize: "0.9rem",
          textAlign: "center",
          color: "#333",
          margin: 0
        }}
      >
        {details.message}
      </p>

      <motion.div
        style={{ marginTop: "6px", fontSize: "0.85rem", opacity: 0.8 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Pass Rate: {passRate.toFixed(1)}%
      </motion.div>
    </motion.div>
  );
};

export default CIQualityPersonaWidget;
