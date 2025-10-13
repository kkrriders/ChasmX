"""Database connection and configuration"""

from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from beanie import init_beanie
from fastapi import Depends
from loguru import logger
from app.core.config import settings

# Global MongoDB client instance
client: Optional[AsyncIOMotorClient] = None

async def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    global client
    if not client:
        await connect_to_mongo()
    if not client:
        raise RuntimeError("Failed to connect to MongoDB")
    return client[settings.DATABASE_NAME]

async def connect_to_mongo():
    """Create database connection and initialize Beanie ODM"""
    global client
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,  # 5 second timeout
            connectTimeoutMS=5000,
            socketTimeoutMS=5000,
            maxPoolSize=10,
            minPoolSize=1,
            retryWrites=True,
            retryReads=True
        )
        # Test connection
        await client.admin.command('ping')

        # Initialize Beanie with document models
        from app.models.workflow import Workflow, WorkflowRun

        database = client[settings.DATABASE_NAME]
        await init_beanie(
            database=database,
            document_models=[Workflow, WorkflowRun]
        )
        logger.info("Beanie initialized with collections: Workflow, WorkflowRun")

    except Exception as e:
        # Log error and raise - don't start app without database
        logger.error(f"MongoDB connection failed: {str(e)}")
        if client:
            client.close()
        client = None
        raise RuntimeError(f"Failed to connect to MongoDB: {str(e)}")

async def close_mongo_connection():
    """Close database connection"""
    global client
    if client:
        client.close()
        client = None
