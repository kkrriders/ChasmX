"""
MongoDB client configuration for No-Code AI Backend using Motor and PyMongo.
Provides async database connectivity with connection pooling and error handling.
"""
import os
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from pymongo.errors import ConnectionFailure, ConfigurationError
from dotenv import load_dotenv
from loguru import logger

# Load environment variables
load_dotenv()

# Initialize global client as None (will be set in connect_to_mongo)
client: Optional[AsyncIOMotorClient] = None

# Constants
DATABASE_NAME = "no_code_ai_db"
USERS_COLLECTION = "users"

async def connect_to_mongo() -> None:
    """
    Initialize async MongoDB connection with Motor.
    Uses environment MONGO_URI with fallback to localhost.
    Validates connection with ping and proper error handling.
    """
    global client

    # Get MongoDB URI from environment with fallback
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017")

    try:
        # Create Motor client with connection pooling
        client = AsyncIOMotorClient(
            mongo_uri,
            maxPoolSize=10,  # Adjust based on expected concurrent connections
            minPoolSize=1,
            serverSelectionTimeoutMS=5000,  # 5 seconds timeout for server selection
            connectTimeoutMS=10000,  # 10 seconds timeout for initial connection
        )

        # Verify connection with ping
        await client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")

    except ConnectionFailure as e:
        logger.error(f"Could not connect to MongoDB: {e}")
        raise
    except ConfigurationError as e:
        logger.error(f"MongoDB configuration error: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error while connecting to MongoDB: {e}")
        raise

async def close_mongo_connection() -> None:
    """
    Properly close MongoDB connection.
    Should be called on application shutdown.
    """
    global client
    if client:
        client.close()
        client = None
        logger.info("MongoDB connection closed")

def get_database() -> AsyncIOMotorDatabase:
    """
    Get database instance for no_code_ai_db.
    Returns AsyncIOMotorDatabase instance for async operations.
    
    Raises:
        RuntimeError: If called before connection is established
    """
    if not client:
        raise RuntimeError("MongoDB client not initialized. Call connect_to_mongo() first.")
    return client[DATABASE_NAME]

def get_users_collection() -> AsyncIOMotorCollection:
    """
    Get users collection instance.
    Returns AsyncIOMotorCollection for user operations.
    
    Raises:
        RuntimeError: If called before connection is established
    """
    db = get_database()
    return db[USERS_COLLECTION]