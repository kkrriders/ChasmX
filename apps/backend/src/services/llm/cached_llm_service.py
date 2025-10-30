"""
Cached LLM Service that integrates caching with LLM providers.
Reduces costs and improves performance by caching responses.
"""
from typing import Optional
from loguru import logger

from .base import LLMProvider, LLMRequest, LLMResponse
from ..cache.redis_cache import RedisCache


class CachedLLMService:
    """LLM service with integrated caching"""

    def __init__(self, provider: LLMProvider, cache: Optional[RedisCache] = None):
        """
        Initialize cached LLM service.

        Args:
            provider: LLM provider instance
            cache: Redis cache instance (optional)
        """
        self.provider = provider
        self.cache = cache

    async def complete(self, request: LLMRequest) -> LLMResponse:
        """
        Generate completion with caching support.

        Args:
            request: LLM request

        Returns:
            LLM response (from cache or fresh)
        """
        # Check cache if enabled
        if self.cache and request.use_cache:
            cached_response = await self._get_cached_response(request)
            if cached_response:
                logger.info(f"Using cached response for model {request.model_id}")
                return cached_response

        # Generate fresh response
        response = await self.provider.complete(request)

        # Cache the response if enabled
        if self.cache and request.use_cache and response.finish_reason == "stop":
            await self._cache_response(request, response)

        return response

    async def stream_complete(self, request: LLMRequest):
        """
        Stream completion (caching not supported for streaming).

        Args:
            request: LLM request

        Yields:
            Content chunks
        """
        async for chunk in self.provider.stream_complete(request):
            yield chunk

    async def _get_cached_response(self, request: LLMRequest) -> Optional[LLMResponse]:
        """Get cached response if available"""
        try:
            messages_dict = [msg.model_dump() for msg in request.messages]
            parameters = {
                "temperature": request.temperature,
                "max_tokens": request.max_tokens,
                "top_p": request.top_p,
                "frequency_penalty": request.frequency_penalty,
                "presence_penalty": request.presence_penalty,
            }

            cached_data = await self.cache.get_llm_response(
                model_id=request.model_id,
                messages=messages_dict,
                parameters=parameters
            )

            if cached_data:
                # Mark response as cached
                cached_data["cached"] = True
                return LLMResponse(**cached_data)

            return None
        except Exception as e:
            logger.error(f"Error retrieving cached response: {e}")
            return None

    async def _cache_response(self, request: LLMRequest, response: LLMResponse):
        """Cache the response"""
        try:
            messages_dict = [msg.model_dump() for msg in request.messages]
            parameters = {
                "temperature": request.temperature,
                "max_tokens": request.max_tokens,
                "top_p": request.top_p,
                "frequency_penalty": request.frequency_penalty,
                "presence_penalty": request.presence_penalty,
            }

            response_dict = response.model_dump()
            response_dict["cached"] = False  # Store as fresh

            await self.cache.set_llm_response(
                model_id=request.model_id,
                messages=messages_dict,
                response=response_dict,
                parameters=parameters,
                ttl=request.cache_ttl
            )
            logger.debug(f"Cached response for model {request.model_id}")
        except Exception as e:
            logger.error(f"Error caching response: {e}")
