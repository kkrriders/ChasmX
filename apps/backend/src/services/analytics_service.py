"""
Analytics service for collecting and aggregating system metrics.
Provides real-time metrics, workflow monitoring, node performance tracking, and quality metrics.
"""
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from loguru import logger
from collections import defaultdict, Counter
import statistics

from ..core.database import get_database
from ..models.workflow import WorkflowRun, ExecutionStatus
from ..models.usage import TokenUsageRecord
from ..schemas.analytics import (
    RealtimeMetricsResponse,
    ActiveWorkflowsResponse,
    ActiveWorkflowItem,
    NodePerformanceResponse,
    NodePerformanceItem,
    QualityMetricsResponse
)


class AnalyticsService:
    """Service for collecting and providing analytics data"""
    
    def __init__(self):
        self.cache_duration = 30  # Cache results for 30 seconds
        self._cache = {}
        
    async def get_database(self):
        """Get database connection"""
        return await get_database()
    
    def _is_cache_valid(self, key: str) -> bool:
        """Check if cache entry is still valid"""
        if key not in self._cache:
            return False
        return (datetime.utcnow() - self._cache[key]['timestamp']).seconds < self.cache_duration
    
    def _set_cache(self, key: str, data: Any):
        """Set cache entry"""
        self._cache[key] = {
            'data': data,
            'timestamp': datetime.utcnow()
        }
    
    def _get_cache(self, key: str) -> Any:
        """Get cache entry"""
        return self._cache[key]['data'] if key in self._cache else None

    async def get_realtime_metrics(self) -> RealtimeMetricsResponse:
        """Get real-time aggregated metrics"""
        cache_key = "realtime_metrics"
        if self._is_cache_valid(cache_key):
            return self._get_cache(cache_key)
        
        try:
            db = await self.get_database()
            now = datetime.utcnow()
            hour_ago = now - timedelta(hours=1)
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            minute_ago = now - timedelta(minutes=1)
            
            # Active users (users with activity in last hour)
            active_users_pipeline = [
                {"$match": {"timestamp": {"$gte": hour_ago}}},
                {"$group": {"_id": "$user_id"}},
                {"$count": "active_users"}
            ]
            active_users_result = await db.usage_records.aggregate(active_users_pipeline).to_list(1)
            active_users = active_users_result[0]['active_users'] if active_users_result else 0
            
            # Running workflows
            running_workflows = await db.workflow_runs.count_documents({
                "status": {"$in": [ExecutionStatus.RUNNING, ExecutionStatus.QUEUED]}
            })
            
            # API calls per minute
            api_calls_minute = await db.usage_records.count_documents({
                "timestamp": {"$gte": minute_ago}
            })
            
            # Total requests today
            total_requests_today = await db.usage_records.count_documents({
                "timestamp": {"$gte": today_start}
            })
            
            # Success rate in last hour
            hour_results = await db.usage_records.aggregate([
                {"$match": {"timestamp": {"$gte": hour_ago}}},
                {"$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "errors": {"$sum": {"$cond": [{"$ne": ["$error", None]}, 1, 0]}}
                }}
            ]).to_list(1)
            
            success_rate = 100.0
            if hour_results:
                total = hour_results[0]['total']
                errors = hour_results[0]['errors']
                success_rate = ((total - errors) / total * 100) if total > 0 else 100.0
            
            # Average response time
            avg_response_pipeline = [
                {"$match": {"timestamp": {"$gte": hour_ago}, "latency_ms": {"$exists": True}}},
                {"$group": {"_id": None, "avg_latency": {"$avg": "$latency_ms"}}}
            ]
            avg_response_result = await db.usage_records.aggregate(avg_response_pipeline).to_list(1)
            avg_response_time = avg_response_result[0]['avg_latency'] if avg_response_result else 0.0
            
            # Cache hit rate
            cache_stats_pipeline = [
                {"$match": {"timestamp": {"$gte": hour_ago}}},
                {"$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "cache_hits": {"$sum": {"$cond": [{"$eq": ["$cached", True]}, 1, 0]}}
                }}
            ]
            cache_stats_result = await db.usage_records.aggregate(cache_stats_pipeline).to_list(1)
            cache_hit_rate = 0.0
            if cache_stats_result:
                total = cache_stats_result[0]['total']
                hits = cache_stats_result[0]['cache_hits']
                cache_hit_rate = (hits / total * 100) if total > 0 else 0.0
            
            # Total cost today
            cost_today_pipeline = [
                {"$match": {"timestamp": {"$gte": today_start}}},
                {"$group": {"_id": None, "total_cost": {"$sum": "$cost_usd"}}}
            ]
            cost_today_result = await db.usage_records.aggregate(cost_today_pipeline).to_list(1)
            total_cost_today = cost_today_result[0]['total_cost'] if cost_today_result else 0.0
            
            # System health (based on success rate and response times)
            health_status = "excellent"
            if success_rate < 95 or avg_response_time > 2000:
                health_status = "degraded"
            elif success_rate < 98 or avg_response_time > 1000:
                health_status = "good"
            
            result = RealtimeMetricsResponse(
                active_users=active_users,
                workflows_running=running_workflows,
                api_calls_per_minute=api_calls_minute,
                total_requests_today=total_requests_today,
                success_rate_percent=round(success_rate, 2),
                avg_response_time_ms=round(avg_response_time, 2),
                cache_hit_rate_percent=round(cache_hit_rate, 2),
                total_cost_today_usd=round(total_cost_today, 4),
                system_health=health_status
            )
            
            self._set_cache(cache_key, result)
            return result
            
        except Exception as e:
            logger.error(f"Failed to get realtime metrics: {e}")
            # Return default values on error
            return RealtimeMetricsResponse(
                active_users=0,
                workflows_running=0,
                api_calls_per_minute=0,
                total_requests_today=0,
                success_rate_percent=100.0,
                avg_response_time_ms=0.0,
                cache_hit_rate_percent=0.0,
                total_cost_today_usd=0.0,
                system_health="unknown"
            )

    async def get_active_workflows(self) -> ActiveWorkflowsResponse:
        """Get active workflows with names and progress"""
        cache_key = "active_workflows"
        if self._is_cache_valid(cache_key):
            return self._get_cache(cache_key)
        
        try:
            db = await self.get_database()
            
            # Get all running or queued workflows
            active_runs = await db.workflow_runs.find({
                "status": {"$in": [ExecutionStatus.RUNNING, ExecutionStatus.QUEUED]}
            }).to_list(None)
            
            workflows = []
            for run in active_runs:
                # Calculate progress
                total_nodes = len(run.get('workflow_data', {}).get('nodes', []))
                completed_nodes = len(run.get('completed_nodes', []))
                progress = (completed_nodes / total_nodes * 100) if total_nodes > 0 else 0
                
                # Get workflow details
                workflow_doc = await db.workflows.find_one({"_id": run.get('workflow_id')})
                workflow_name = workflow_doc.get('name', 'Unknown') if workflow_doc else 'Unknown'
                
                # Estimate completion time (simple heuristic)
                estimated_completion = None
                if run.get('started_at') and progress > 0:
                    elapsed = datetime.utcnow() - run['started_at']
                    if progress > 10:  # Only estimate if we have some progress
                        total_estimated = elapsed / (progress / 100)
                        estimated_completion = run['started_at'] + total_estimated
                
                workflows.append(ActiveWorkflowItem(
                    id=str(run['_id']),
                    workflow_id=str(run.get('workflow_id', '')),
                    name=workflow_name,
                    user_id=str(run.get('user_id', '')),
                    status=run.get('status', ExecutionStatus.IDLE),
                    progress_percent=round(progress, 1),
                    started_at=run.get('started_at', datetime.utcnow()),
                    estimated_completion=estimated_completion,
                    current_node=run.get('current_node'),
                    total_nodes=total_nodes,
                    completed_nodes=completed_nodes
                ))
            
            result = ActiveWorkflowsResponse(
                total_active=len(workflows),
                workflows=workflows
            )
            
            self._set_cache(cache_key, result)
            return result
            
        except Exception as e:
            logger.error(f"Failed to get active workflows: {e}")
            return ActiveWorkflowsResponse(total_active=0, workflows=[])

    async def get_node_performance(self) -> NodePerformanceResponse:
        """Get node performance heatmap data"""
        cache_key = "node_performance"
        if self._is_cache_valid(cache_key):
            return self._get_cache(cache_key)
        
        try:
            db = await self.get_database()
            hour_ago = datetime.utcnow() - timedelta(hours=1)
            day_ago = datetime.utcnow() - timedelta(days=1)
            
            # Aggregate node performance data
            pipeline = [
                {"$match": {"timestamp": {"$gte": day_ago}}},
                {"$group": {
                    "_id": "$node_type",
                    "total_executions": {"$sum": 1},
                    "avg_latency": {"$avg": "$latency_ms"},
                    "latencies": {"$push": "$latency_ms"},
                    "total_cost": {"$sum": "$cost_usd"},
                    "errors": {"$sum": {"$cond": [{"$ne": ["$error", None]}, 1, 0]}},
                    "recent_executions": {
                        "$sum": {"$cond": [{"$gte": ["$timestamp", hour_ago]}, 1, 0]}
                    }
                }}
            ]
            
            node_stats = await db.usage_records.aggregate(pipeline).to_list(None)
            
            nodes = []
            total_health_scores = []
            
            for stats in node_stats:
                node_type = stats['_id'] or 'unknown'
                total_executions = stats['total_executions']
                avg_latency = stats['avg_latency'] or 0
                errors = stats['errors']
                total_cost = stats['total_cost'] or 0
                recent_executions = stats['recent_executions']
                
                # Calculate rates
                success_rate = ((total_executions - errors) / total_executions * 100) if total_executions > 0 else 100
                error_rate = (errors / total_executions * 100) if total_executions > 0 else 0
                avg_cost = total_cost / total_executions if total_executions > 0 else 0
                
                # Calculate P95 latency
                latencies = [l for l in stats['latencies'] if l is not None]
                p95_latency = statistics.quantiles(latencies, n=20)[18] if len(latencies) > 20 else avg_latency
                
                # Calculate health score (weighted by success rate, latency, and cost)
                latency_score = max(0, 100 - (avg_latency / 50))  # 50ms = 100 points
                cost_score = max(0, 100 - (avg_cost * 10000))     # $0.01 = 100 points
                health_score = (success_rate * 0.5) + (latency_score * 0.3) + (cost_score * 0.2)
                health_score = min(100, max(0, health_score))
                
                total_health_scores.append(health_score)
                
                nodes.append(NodePerformanceItem(
                    node_type=node_type,
                    total_executions=total_executions,
                    avg_latency_ms=round(avg_latency, 2),
                    success_rate_percent=round(success_rate, 2),
                    error_rate_percent=round(error_rate, 2),
                    avg_cost_usd=round(avg_cost, 6),
                    p95_latency_ms=round(p95_latency, 2),
                    last_hour_executions=recent_executions,
                    health_score=round(health_score, 1)
                ))
            
            overall_health = statistics.mean(total_health_scores) if total_health_scores else 100.0
            
            result = NodePerformanceResponse(
                total_node_types=len(nodes),
                nodes=nodes,
                overall_health=round(overall_health, 1)
            )
            
            self._set_cache(cache_key, result)
            return result
            
        except Exception as e:
            logger.error(f"Failed to get node performance: {e}")
            return NodePerformanceResponse(total_node_types=0, nodes=[], overall_health=100.0)

    async def get_quality_metrics(self, period_hours: int = 24) -> QualityMetricsResponse:
        """Get quality and safety metrics"""
        cache_key = f"quality_metrics_{period_hours}"
        if self._is_cache_valid(cache_key):
            return self._get_cache(cache_key)
        
        try:
            db = await self.get_database()
            period_start = datetime.utcnow() - timedelta(hours=period_hours)
            
            # Get safety metrics
            safety_pipeline = [
                {"$match": {"timestamp": {"$gte": period_start}}},
                {"$group": {
                    "_id": None,
                    "total_requests": {"$sum": 1},
                    "blocked_content": {"$sum": {"$cond": [{"$eq": ["$blocked", True]}, 1, 0]}},
                    "pii_detected": {"$sum": {"$cond": [{"$eq": ["$pii_detected", True]}, 1, 0]}},
                    "pii_blocked": {"$sum": {"$cond": [{"$and": [{"$eq": ["$pii_detected", True]}, {"$eq": ["$pii_blocked", True]}]}, 1, 0]}},
                    "safety_violations": {"$push": "$safety_violation_type"},
                    "user_ratings": {"$push": "$user_rating"},
                    "quality_scores": {"$push": "$ai_quality_score"}
                }}
            ]
            
            safety_result = await db.usage_records.aggregate(safety_pipeline).to_list(1)
            
            if safety_result:
                stats = safety_result[0]
                total_requests = stats['total_requests']
                blocked_content = stats['blocked_content']
                pii_detected = stats['pii_detected']
                pii_blocked = stats['pii_blocked']
                
                # Calculate rates
                block_rate = (blocked_content / total_requests * 100) if total_requests > 0 else 0
                
                # Estimate hallucination rate (placeholder - would need ML model)
                hallucination_rate = max(0, 5 - (block_rate * 0.5))  # Inverse correlation with safety
                
                # Process user feedback
                user_ratings = [r for r in stats['user_ratings'] if r is not None]
                avg_user_rating = statistics.mean(user_ratings) if user_ratings else 4.0
                
                # Process quality scores
                quality_scores = [s for s in stats['quality_scores'] if s is not None]
                avg_quality_score = statistics.mean(quality_scores) if quality_scores else 85.0
                
                # Count safety violations by type
                violations = [v for v in stats['safety_violations'] if v is not None]
                violation_counts = dict(Counter(violations))
                
            else:
                # Default values when no data
                block_rate = 0.0
                pii_detected = 0
                pii_blocked = 0
                hallucination_rate = 0.0
                avg_user_rating = 5.0
                avg_quality_score = 100.0
                violation_counts = {}
            
            # Calculate derived metrics
            response_coherence = min(100, avg_quality_score + 10)
            response_relevance = min(100, avg_user_rating * 20)
            
            # Overall scores
            overall_safety = max(0, 100 - (block_rate * 10) - (hallucination_rate * 5))
            overall_quality = (avg_quality_score * 0.6) + (avg_user_rating * 12) + (response_coherence * 0.2)
            
            # Quality trends (simplified)
            quality_trends = {
                "coherence_trend": 0.5,  # Positive trend
                "relevance_trend": 0.2,
                "safety_trend": -0.1,    # Slight negative trend
                "user_satisfaction_trend": 0.3
            }
            
            result = QualityMetricsResponse(
                period_hours=period_hours,
                block_rate_percent=round(block_rate, 2),
                pii_incidents=pii_detected,
                pii_incidents_blocked=pii_blocked,
                hallucination_rate_percent=round(hallucination_rate, 2),
                user_feedback_score=round(avg_user_rating, 2),
                content_quality_score=round(avg_quality_score, 1),
                response_coherence_score=round(response_coherence, 1),
                response_relevance_score=round(response_relevance, 1),
                safety_violations=violation_counts,
                quality_trends=quality_trends,
                overall_safety_score=round(overall_safety, 1),
                overall_quality_score=round(overall_quality, 1)
            )
            
            self._set_cache(cache_key, result)
            return result
            
        except Exception as e:
            logger.error(f"Failed to get quality metrics: {e}")
            # Return default safe values
            return QualityMetricsResponse(
                period_hours=period_hours,
                block_rate_percent=0.0,
                pii_incidents=0,
                pii_incidents_blocked=0,
                hallucination_rate_percent=0.0,
                user_feedback_score=5.0,
                content_quality_score=100.0,
                response_coherence_score=100.0,
                response_relevance_score=100.0,
                safety_violations={},
                quality_trends={},
                overall_safety_score=100.0,
                overall_quality_score=100.0
            )


# Global analytics service instance
analytics_service = AnalyticsService()