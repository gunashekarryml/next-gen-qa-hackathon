// src/components/CounterCard.tsx
import React from "react";
import { Rec } from "../types";

interface CounterCardProps {
  data: Rec[];
}

export default function CounterCards({ data }: CounterCardProps) {
  const totalTests = data.length;
  const highPriority = data.filter((d) => ["P1", "P2"].includes(d.triage_priority)).length;
  const assertionFails = data.filter((d) => d.predicted_category === "Assertion Failure").length;
  const timeouts = data.filter((d) => d.predicted_category === "Timeout").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-8">
      <div className="bg-gray-800 rounded-xl p-4 text-center">Total: {totalTests}</div>
      <div className="bg-red-800 rounded-xl p-4 text-center">High Priority: {highPriority}</div>
      <div className="bg-yellow-800 rounded-xl p-4 text-center">Assertion Fails: {assertionFails}</div>
      <div className="bg-indigo-800 rounded-xl p-4 text-center">Timeouts: {timeouts}</div>
    </div>
  );
}
