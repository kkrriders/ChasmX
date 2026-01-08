import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  RealtimeMetricsResponse,
  ActiveWorkflowsResponse,
  NodePerformanceResponse,
  QualityMetricsResponse
} from '@/types/analytics';

interface UseAnalyticsOptions {
  refreshInterval?: number; // ms, default 30000
}

interface AnalyticsState {
  realtime: RealtimeMetricsResponse | null;
  activeWorkflows: ActiveWorkflowsResponse | null;
  nodePerformance: NodePerformanceResponse | null;
  quality: QualityMetricsResponse | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { refreshInterval = 30000 } = options;
  
  const [state, setState] = useState<AnalyticsState>({
    realtime: null,
    activeWorkflows: null,
    nodePerformance: null,
    quality: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchAnalytics = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const [
        realtimeRes,
        activeWorkflowsRes,
        nodePerformanceRes,
        qualityRes
      ] = await Promise.all([
        api.get<RealtimeMetricsResponse>('/analytics/metrics/realtime'),
        api.get<ActiveWorkflowsResponse>('/analytics/workflows/active'),
        api.get<NodePerformanceResponse>('/analytics/nodes/performance'),
        api.get<QualityMetricsResponse>('/analytics/quality')
      ]);

      setState({
        realtime: realtimeRes.data,
        activeWorkflows: activeWorkflowsRes.data,
        nodePerformance: nodePerformanceRes.data,
        quality: qualityRes.data,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err : new Error('Unknown error fetching analytics'),
      }));
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchAnalytics, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchAnalytics, refreshInterval]);

  return {
    ...state,
    refresh: fetchAnalytics,
  };
}
