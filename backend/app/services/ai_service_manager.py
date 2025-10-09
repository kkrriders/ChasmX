
from typing import Optional
from loguru import logger

from .llm.base import ModelConfig, ModelRole
from .llm.openrouter_provider import OpenRouterProvider
from .llm.cached_llm_service import CachedLLMService
from .cache.redis_cache import RedisCache, CacheConfig
from .agents.acp import AgentContextProtocol, ContextStore
from .agents.aap import AgentMessageBus
from .agents.orchestrator import AgentOrchestrator
from ..core.config import ai_settings


class AIServiceManager:
    """Centralized manager for all AI services"""

    def __init__(self):
        """Initialize service manager"""
        self.redis_cache: Optional[RedisCache] = None
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

            # Initialize Redis Cache
            await self._init_redis_cache()

            # Initialize LLM Provider
            await self._init_llm_provider()

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
            raise

    async def _init_redis_cache(self):
        """Initialize Redis cache"""
        # Use REDIS_URL if provided (for Docker), otherwise use individual settings
        import os
        redis_host = os.getenv('REDIS_HOST', ai_settings.REDIS_HOST)

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

    async def _init_llm_provider(self):
        """Initialize LLM provider with model configurations"""
        self.llm_provider = OpenRouterProvider(
            api_key=ai_settings.OPENROUTER_API_KEY,
            timeout=ai_settings.LLM_TIMEOUT,
            max_retries=ai_settings.LLM_MAX_RETRIES
        )
        logger.info("Initialized OpenRouter Provider with 4 models")

    async def _init_context_protocol(self):
        """Initialize Agent Context Protocol"""
        self.context_store = ContextStore(cache=self.redis_cache)
        self.context_protocol = AgentContextProtocol(store=self.context_store)
        logger.info("Initialized Agent Context Protocol")

    async def _init_message_bus(self):
        """Initialize Agent Message Bus"""
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

    async def get_stats(self) -> dict:
        """Get statistics from all services"""
        if not self._initialized:
            return {"error": "Services not initialized"}

        stats = {}

        # Cache stats
        if self.redis_cache:
            stats["cache"] = await self.redis_cache.get_stats()

        # Orchestrator stats
        if self.orchestrator:
            stats["orchestrator"] = await self.orchestrator.get_orchestrator_stats()

        return stats


# Global service manager instance
ai_service_manager = AIServiceManager()
