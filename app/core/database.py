"""Database configuration and collections."""
from pymongo import MongoClient
from app.core.config import MONGODB_URL, DATABASE_NAME

# Initialize MongoDB client
client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db["users"]
workflows_collection = db["workflows"]
workflow_runs_collection = db["workflow_runs"]
