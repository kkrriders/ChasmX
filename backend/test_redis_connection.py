"""
Quick script to test Redis connection.
Run this to verify Redis is working correctly.
"""
import asyncio
import os
from app.services.cache.redis_cache import RedisCache, CacheConfig


async def test_redis():
    """Test Redis connection"""
    print("Testing Redis connection...")

    # Get Redis configuration from environment
    redis_host = os.getenv('REDIS_HOST', 'localhost')
    redis_port = int(os.getenv('REDIS_PORT', '6379'))
    redis_db = int(os.getenv('REDIS_DB', '0'))
    redis_password = os.getenv('REDIS_PASSWORD', None)

    print(f"Connecting to Redis at {redis_host}:{redis_port} (db={redis_db})")

    # Create cache config
    config = CacheConfig(
        host=redis_host,
        port=redis_port,
        db=redis_db,
        password=redis_password
    )

    # Create Redis cache instance
    cache = RedisCache(config)

    try:
        # Connect
        await cache.connect()
        print("✓ Successfully connected to Redis")

        # Test set
        test_key = "test:connection"
        test_value = {"status": "working", "message": "Redis is connected!"}

        success = await cache.set(test_key, test_value, ttl=60)
        if success:
            print(f"✓ Successfully wrote test data to Redis")
        else:
            print("✗ Failed to write test data")
            return False

        # Test get
        retrieved = await cache.get(test_key)
        if retrieved == test_value:
            print(f"✓ Successfully read test data from Redis: {retrieved}")
        else:
            print(f"✗ Data mismatch. Expected: {test_value}, Got: {retrieved}")
            return False

        # Test delete
        deleted = await cache.delete(test_key)
        if deleted:
            print("✓ Successfully deleted test data")
        else:
            print("✗ Failed to delete test data")

        # Get stats
        stats = await cache.get_stats()
        print(f"\n✓ Redis Stats:")
        print(f"  - Connected: {stats.get('connected')}")
        print(f"  - Memory Used: {stats.get('used_memory')}")
        print(f"  - Total Keys: {stats.get('total_keys')}")
        print(f"  - Cache Hits: {stats.get('hits')}")
        print(f"  - Cache Misses: {stats.get('misses')}")

        # Disconnect
        await cache.disconnect()
        print("\n✓ All tests passed! Redis is working correctly.")
        return True

    except Exception as e:
        print(f"\n✗ Redis connection test failed: {e}")
        print("\nTroubleshooting steps:")
        print("1. Make sure Docker is running: docker ps")
        print("2. Check if Redis container is running: docker ps | grep redis")
        print("3. Check Redis logs: docker logs chasmx-redis")
        print("4. Restart containers: docker-compose restart")
        return False


if __name__ == "__main__":
    success = asyncio.run(test_redis())
    exit(0 if success else 1)
