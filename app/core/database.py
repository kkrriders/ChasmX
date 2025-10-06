from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)


db = client["chasmX_db"]

# Collections
users_collection = db["users"]
workflows_collection = db["workflows"]
