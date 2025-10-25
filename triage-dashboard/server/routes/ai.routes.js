import express from "express";
import { getRootCauseAnalysis, analyzeFailures, askQACopilot } from "../ai/ai.service.js";

const router = express.Router();

// Root Cause Analysis
router.post("/root-cause", async (req, res) => {
  try {
    const analysis = await getRootCauseAnalysis(req.body.failedTests || []);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: "Failed to analyze root causes" });
  }
});

// Full Failure Analysis
router.post("/analyze", async (req, res) => {
  try {
    const analysis = await analyzeFailures(req.body.failedTests || []);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: "Failed to analyze failures" });
  }
});

// QA Copilot
router.post("/ask", async (req, res) => {
  try {
    const answer = await askQACopilot(req.body.query || "", req.body.testData || []);
    res.json({ result: answer });
  } catch (err) {
    res.status(500).json({ result: "Failed to get response" });
  }
});

export default router;
