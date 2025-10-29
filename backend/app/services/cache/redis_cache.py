"""
Redis Cache Service for LLM response caching.
Implements intelligent caching to reduce costs and improve performance.
"""
import json
import hashlib
from typing import Optional, Any, Dict
from pydantic import BaseModel, Field
from loguru import logger
import redis.asyncio as redis


class CacheConfig(BaseModel):
    """Configuration for Redis cache"""
    host: str = Field(default="localhost", description="Redis host")
    port: int = Field(default=6379, description="Redis port")
    db: int = Field(default=0, description="Redis database number")
    password: Optional[str] = Field(default=None, description="Redis password")
    default_ttl: int = Field(default=3600, description="Default TTL in seconds")
    max_connections: int = Field(default=50, description="Max connection pool size")
    socket_timeout: int = Field(default=5, description="Socket timeout in seconds")
    decode_responses: bool = Field(default=True, description="Decode responses to strings")


class RedisCache:
    """Redis-based caching service for LLM responses"""

    def __init__(self, config: CacheConfig):
        """
        Initialize Redis cache.

        Args:
            config: Cache configuration
        """
        self.config = config
        self.client: Optional[redis.Redis] = None
        self._connection_pool: Optional[redis.ConnectionPool] = None

    async def connect(self):
        """Establish connection to Redis"""
        try:
            self._connection_pool = redis.ConnectionPool(
                host=self.config.host,
                port=self.config.port,
                db=self.config.db,
                password=self.config.password,
                max_connections=self.config.max_connections,
                socket_timeout=self.config.socket_timeout,
                decode_responses=self.config.decode_responses
            )

            self.client = redis.Redis(connection_pool=self._connection_pool)

            # Test connection
            await self.client.ping()
            logger.info(
                f"Connected to Redis at {self.config.host}:{self.config.port}, "
                f"db={self.config.db}"
            )
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise

    async def disconnect(self):
        """Close Redis connection"""
        if self.client:
            await self.client.close()
            logger.info("Disconnected from Redis")

    def _generate_cache_key(self, prefix: str, data: Dict[str, Any]) -> str:
        """
        Generate a unique cache key from data.

        Args:
            prefix: Key prefix (e.g., "llm:response")
            data: Data to hash for key generation

        Returns:
            Cache key string
        """
        # Create deterministic hash from data
        data_str = json.dumps(data, sort_keys=True)
        hash_digest = hashlib.sha256(data_str.encode()).hexdigest()
        return f"{prefix}:{hash_digest}"

    async def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found
        """
        if not self.client:
            logger.warning("Redis client not connected")
            return None

        try:
            value = await self.client.get(key)
            if value:
                logger.debug(f"Cache hit: {key}")
                return json.loads(value) if isinstance(value, str) else value
            logger.debug(f"Cache miss: {key}")
            return None
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            return None

    async def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None
    ) -> bool:
        """
        Set value in cache.

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time-to-live in seconds (uses default if not specified)

        Returns:
            True if successful, False otherwise
        """
        if not self.client:
            logger.warning("Redis client not connected")
            return False

        try:
            ttl = ttl or self.config.default_ttl
            value_str = json.dumps(value) if not isinstance(value, str) else value

            await self.client.setex(key, ttl, value_str)
            logger.debug(f"Cache set: {key}, ttl={ttl}s")
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """
        Delete key from cache.

        Args:
            key: Cache key

        Returns:
            True if deleted, False otherwise
        """
        if not self.client:
            logger.warning("Redis client not connected")
            return False

        try:
            result = await self.client.delete(key)
            logger.debug(f"Cache delete: {key}, deleted={result}")
            return bool(result)
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False

    async def exists(self, key: str) -> bool:
        """
        Check if key exists in cache.

        Args:
            key: Cache key

        Returns:
            True if exists, False otherwise
        """
        if not self.client:
            return False

        try:
            return bool(await self.client.exists(key))
        except Exception as e:
            logger.error(f"Cache exists error for key {key}: {e}")
            return False

    async def get_llm_response(
        self,
        model_id: str,
        messages: list,
        parameters: Optional[Dict[str, Any]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get cached LLM response.

        Args:
            model_id: Model identifier
            messages: Conversation messages
            parameters: Additional parameters (temperature, max_tokens, etc.)

        Returns:
            Cached response or None
        """
        cache_data = {
            "model_id": model_id,
            "messages": messages,
            "parameters": parameters or {}
        }
        key = self._generate_cache_key("llm:response", cache_data)
        return await self.get(key)

    async def set_llm_response(
        self,
        model_id: str,
        messages: list,
        response: Dict[str, Any],
        parameters: Optional[Dict[str, Any]] = None,
        ttl: Optional[int] = None
    ) -> bool:
        """
        Cache LLM response.

        Args:
            model_id: Model identifier
            messages: Conversation messages
            response: LLM response to cache
            parameters: Additional parameters
            ttl: Time-to-live in seconds

        Returns:
            True if successful
        """
        cache_data = {
            "model_id": model_id,
            "messages": messages,
            "parameters": parameters or {}
        }
        key = self._generate_cache_key("llm:response", cache_data)
        return await self.set(key, response, ttl)

    async def clear_pattern(self, pattern: str) -> int:
        """
        Clear all keys matching a pattern.

        Args:
            pattern: Redis key pattern (e.g., "llm:*")

        Returns:
            Number of keys deleted
        """
        if not self.client:
            return 0

        try:
            cursor = 0
            deleted = 0

            while True:
                cursor, keys = await self.client.scan(cursor, match=pattern, count=100)
                if keys:
                    deleted += await self.client.delete(*keys)
                if cursor == 0:
                    break

            logger.info(f"Cleared {deleted} keys matching pattern: {pattern}")
            return deleted
        except Exception as e:
            logger.error(f"Clear pattern error for {pattern}: {e}")
            return 0

    async def get_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.

        Returns:
            Dictionary with cache stats
        """
        if not self.client:
            return {}

        try:
            info = await self.client.info()
            return {
                "connected": True,
                "used_memory": info.get("used_memory_human"),
                "total_keys": await self.client.dbsize(),
                "hits": info.get("keyspace_hits", 0),
                "misses": info.get("keyspace_misses", 0),
                "evicted_keys": info.get("evicted_keys", 0)
            }
        except Exception as e:
            logger.error(f"Failed to get cache stats: {e}")
            return {"connected": False, "error": str(e)}
