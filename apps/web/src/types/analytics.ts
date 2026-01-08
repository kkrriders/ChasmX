export interface RealtimeMetricsResponse {
  timestamp: string;
  active_users: number;
  workflows_running: number;
  api_calls_per_minute: number;
  total_requests_today: number;
  success_rate_percent: number;
  avg_response_time_ms: number;
  cache_hit_rate_percent: number;
  total_cost_today_usd: number;
  system_health: string;
}

export interface ActiveWorkflowItem {
  id: string;
  workflow_id: string;
  name: string;
  user_id: string;
  status: string;
  progress_percent: number;
  started_at: string;
  estimated_completion?: string;
  current_node?: string;
  total_nodes: number;
  completed_nodes: number;
}

export interface ActiveWorkflowsResponse {
  timestamp: string;
  total_active: number;
  workflows: ActiveWorkflowItem[];
}

export interface NodePerformanceItem {
  node_type: string;
  total_executions: number;
  avg_latency_ms: number;
  success_rate_percent: number;
  error_rate_percent: number;
  avg_cost_usd: number;
  p95_latency_ms: number;
  last_hour_executions: number;
  health_score: number;
}

export interface NodePerformanceResponse {
  timestamp: string;
  total_node_types: number;
  nodes: NodePerformanceItem[];
  overall_health: number;
}

export interface QualityMetricsResponse {
  timestamp: string;
  period_hours: number;
  block_rate_percent: number;
  pii_incidents: number;
  pii_incidents_blocked: number;
  hallucination_rate_percent: number;
  user_feedback_score: number;
  content_quality_score: number;
  response_coherence_score: number;
  response_relevance_score: number;
  safety_violations: Record<string, number>;
  quality_trends: Record<string, number>;
  overall_safety_score: number;
  overall_quality_score: number;
}
