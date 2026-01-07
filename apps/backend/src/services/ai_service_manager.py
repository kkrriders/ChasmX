
from typing import Optional, Dict, Any, List, Callable, Awaitable
from loguru import logger
import asyncio
import json
import time

from .llm.base import ModelConfig, ModelRole
from .llm.openrouter_provider import OpenRouterProvider
from .llm.cached_llm_service import CachedLLMService
from .cache.redis_cache import RedisCache, CacheConfig
from .cache.semantic_cache import SemanticCache, SemanticCacheConfig
from .agents.acp import AgentContextProtocol, ContextStore
from .agents.aap import AgentMessageBus, AgentMessage, MessageType
from .agents.orchestrator import AgentOrchestrator
from ..core.config import ai_settings


class InMemoryCache:
    """In-memory cache implementation for local development without Redis"""
    
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.config = CacheConfig()
        logger.warning("Using InMemoryCache - Data will be lost on restart")

    async def connect(self):
        logger.info("Connected to InMemoryCache")

    async def disconnect(self):
        self._cache.clear()
        logger.info("Disconnected from InMemoryCache")
        
    async def get(self, key: str) -> Optional[Any]:
        if key not in self._cache:
            return None
        
        entry = self._cache[key]
        if entry["expires"] and entry["expires"] < time.time():
            del self._cache[key]
            return None
            
        return entry["value"]
        
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        expires = time.time() + ttl if ttl else None
        self._cache[key] = {
            "value": value,
            "expires": expires
        }
        return True
        
    async def delete(self, key: str) -> bool:
        if key in self._cache:
            del self._cache[key]
            return True
        return False
        
    async def exists(self, key: str) -> bool:
        if key not in self._cache:
            return False
        entry = self._cache[key]
        if entry["expires"] and entry["expires"] < time.time():
            del self._cache[key]
            return False
        return True

    async def get_stats(self) -> Dict[str, Any]:
        return {
            "type": "in-memory",
            "keys": len(self._cache),
            "connected": True
        }
        
    async def get_llm_response(
        self,
        model_id: str,
        messages: list,
        parameters: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        # Simple key generation for in-memory
        key = f"llm:response:{model_id}:{hash(str(messages))}"
        return await self.get(key)

    async def set_llm_response(
        self,
        model_id: str,
        messages: list,
        response: Dict[str, Any],
        parameters: Optional[Dict[str, Any]] = None,
        ttl: Optional[int] = None
    ) -> bool:
        key = f"llm:response:{model_id}:{hash(str(messages))}"
        return await self.set(key, response, ttl)


class MockAgentMessageBus:
    """Mock message bus for local development without Redis"""
    
    def __init__(self):
        self.handlers: Dict[MessageType, Callable] = {}
        self.running = False
        
    async def connect(self):
        logger.info("Connected to MockAgentMessageBus")
        
    async def disconnect(self):
        self.running = False
        logger.info("Disconnected from MockAgentMessageBus")
        
    def register_handler(self, message_type: MessageType, handler: Callable):
        self.handlers[message_type] = handler
        
    async def subscribe(self, agent_id: str):
        pass
        
    async def unsubscribe(self, agent_id: str):
        pass
        
    async def start_listening(self):
        self.running = True
        logger.info("Started MockAgentMessageBus listener")
        
    async def stop_listening(self):
        self.running = False
        
    async def publish(self, message: AgentMessage) -> bool:
        # In mock mode, we just log it or maybe route it directly if simple
        logger.debug(f"MockBus published: {message.type} - {message.subject}")
        return True
        
    async def send_task_request(self, *args, **kwargs):
        logger.warning("MockAgentMessageBus cannot route real tasks")
        return "mock-message-id"


class AIServiceManager:
    """Centralized manager for all AI services"""

    def __init__(self):
        """Initialize service manager"""
        self.redis_cache: Optional[RedisCache] = None
        self.semantic_cache: Optional[SemanticCache] = None
        self.llm_provider: Optional[OpenRouterProvider] = None
        self.llm_service: Optional[CachedLLMService] = None
        self.context_store: Optional[ContextStore] = None
        self.context_protocol: Optional[AgentContextProtocol] = None
        self.message_bus: Optional[AgentMessageBus] = None
        self.orchestrator: Optional[AgentOrchestrator] = None
        self._initialized = False

    async def initialize(self):
        """Initialize all AI services"""
        if self._initialized:
            logger.warning("AI services already initialized")
            return

        try:
            logger.info("Initializing AI services...")

            # Initialize Redis Cache (or fallback to InMemory)
            await self._init_redis_cache()

            # Initialize LLM Provider
            await self._init_llm_provider()

            # Initialize Semantic Cache (only if real Redis)
            if isinstance(self.redis_cache, RedisCache):
                await self._init_semantic_cache()
            else:
                logger.warning("Semantic Cache disabled (requires real Redis)")
                self.semantic_cache = None

            # Initialize LLM Service with caching
            self.llm_service = CachedLLMService(
                provider=self.llm_provider,
                cache=self.redis_cache if ai_settings.CACHE_ENABLED else None
            )
            logger.info("Initialized LLM Service")

            # Initialize Context Protocol
            await self._init_context_protocol()

            # Initialize Message Bus
            await self._init_message_bus()

            # Initialize Orchestrator
            # We pass whatever message bus we have (real or mock)
            self.orchestrator = AgentOrchestrator(
                llm_service=self.llm_service,
                context_protocol=self.context_protocol,
                message_bus=self.message_bus
            )
            logger.info("Initialized Agent Orchestrator")

            self._initialized = True
            logger.info("All AI services initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize AI services: {e}")
            # Don't raise, allow partial initialization for local dev
            if ai_settings.ENV == "development":
                logger.warning("Continuing with partial initialization due to error in development mode")
            else:
                raise

    async def _init_redis_cache(self):
        """Initialize Redis cache or fallback to In-Memory"""
        import os
        redis_host = os.getenv('REDIS_HOST', ai_settings.REDIS_HOST)

        if not ai_settings.CACHE_ENABLED:
            logger.info("Cache disabled by config, using InMemoryCache")
            self.redis_cache = InMemoryCache()
            await self.redis_cache.connect()
            return

        try:
            cache_config = CacheConfig(
                host=redis_host,
                port=ai_settings.REDIS_PORT,
                db=ai_settings.REDIS_DB,
                password=ai_settings.REDIS_PASSWORD,
                default_ttl=ai_settings.CACHE_DEFAULT_TTL
            )

            self.redis_cache = RedisCache(cache_config)
            await self.redis_cache.connect()
            logger.info(f"Initialized Redis Cache at {redis_host}:{ai_settings.REDIS_PORT}")
            
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}")
            if ai_settings.ENV == "development" or redis_host in ["localhost", "127.0.0.1", "::1"]:
                logger.warning("Falling back to InMemoryCache for local development")
                self.redis_cache = InMemoryCache()
                await self.redis_cache.connect()
            else:
                raise

    async def _init_llm_provider(self):
        """Initialize LLM provider with model configurations"""
        self.llm_provider = OpenRouterProvider(
            api_key=ai_settings.OPENROUTER_API_KEY,
            timeout=ai_settings.LLM_TIMEOUT,
            max_retries=ai_settings.LLM_MAX_RETRIES
        )
        logger.info("Initialized OpenRouter Provider with 4 models")

    async def _init_semantic_cache(self):
        """Initialize semantic cache with embeddings"""
        semantic_config = SemanticCacheConfig(
            similarity_threshold=0.95,  # 95% similarity required for cache hit
            max_search_results=10,
            embedding_model="openai/text-embedding-3-small",
            cache_embeddings=True
        )

        self.semantic_cache = SemanticCache(
            redis_cache=self.redis_cache,
            config=semantic_config,
            openrouter_provider=self.llm_provider
        )
        logger.info("Initialized Semantic Cache with embedding-based similarity matching")

    async def _init_context_protocol(self):
        """Initialize Agent Context Protocol"""
        self.context_store = ContextStore(cache=self.redis_cache)
        self.context_protocol = AgentContextProtocol(store=self.context_store)
        logger.info("Initialized Agent Context Protocol")

    async def _init_message_bus(self):
        """Initialize Agent Message Bus"""
        if isinstance(self.redis_cache, InMemoryCache):
            logger.info("Using MockAgentMessageBus (No Redis)")
            self.message_bus = MockAgentMessageBus()
        else:
            self.message_bus = AgentMessageBus(
                redis_url=ai_settings.redis_connection_url
            )
        
        await self.message_bus.connect()
        await self.message_bus.start_listening()
        logger.info("Initialized Agent Message Bus")

    async def shutdown(self):
        """Shutdown all AI services"""
        if not self._initialized:
            return

        try:
            logger.info("Shutting down AI services...")

            # Stop message bus
            if self.message_bus:
                await self.message_bus.stop_listening()
                await self.message_bus.disconnect()

            # Close LLM provider
            if self.llm_provider:
                await self.llm_provider.close()

            # Close Redis cache
            if self.redis_cache:
                await self.redis_cache.disconnect()

            self._initialized = False
            logger.info("All AI services shut down successfully")

        except Exception as e:
            logger.error(f"Error during AI services shutdown: {e}")

    def get_llm_service(self) -> CachedLLMService:
        """Get LLM service instance"""
        if not self._initialized:
            raise RuntimeError("AI services not initialized")
        return self.llm_service

    def get_orchestrator(self) -> AgentOrchestrator:
        """Get agent orchestrator instance"""
        if not self._initialized:
            raise RuntimeError("AI services not initialized")
        return self.orchestrator

    def get_message_bus(self) -> AgentMessageBus:
        """Get message bus instance"""
        if not self._initialized:
            raise RuntimeError("AI services not initialized")
        return self.message_bus

    def get_context_protocol(self) -> AgentContextProtocol:
        """Get context protocol instance"""
        if not self._initialized:
            raise RuntimeError("AI services not initialized")
        return self.context_protocol

    def get_semantic_cache(self) -> SemanticCache:
        """Get semantic cache instance"""
        if not self._initialized:
            raise RuntimeError("AI services not initialized")
        return self.semantic_cache

    async def get_stats(self) -> dict:
        """Get statistics from all services"""
        if not self._initialized:
            return {"error": "Services not initialized"}

        stats = {}

        # Cache stats
        if self.redis_cache:
            stats["cache"] = await self.redis_cache.get_stats()

        # Semantic cache stats
        if self.semantic_cache:
            stats["semantic_cache"] = await self.semantic_cache.get_cache_stats()

        # Orchestrator stats
        if self.orchestrator:
            stats["orchestrator"] = await self.orchestrator.get_orchestrator_stats()

        return stats


# Global service manager instance
ai_service_manager = AIServiceManager()
