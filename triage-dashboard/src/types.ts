// src/types.ts

export interface Rec {
  test_id: string;
  predicted_category: string;
  triage_priority: string;
  confidence?: number;
  reasoning_short?: string;
  reasoning_long?: string;
  assignee?: string;
  failure_type?: string;
  impacted_layers?: string[];
  correlation_id?: string;
  logs?: string[];
  timestamp?: string;
  module: string;
  environment?: string;
  status?: "PASS" | "FAIL" | "SKIPPED" | "ERROR";
}

export interface TrendData {
  date: string;
  failures: number;
}

// ✅ Root Cause Cluster Types
export interface RootCauseCluster {
  reason: string;
  percentage: number;
  recommended_fix: string;
}

export interface FailureRec extends Rec {}
