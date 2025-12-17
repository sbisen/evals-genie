from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# MongoDB configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = "evalsgenie"

# Global database client
client: AsyncIOMotorClient = None
database = None

async def connect_to_mongo():
    """Connect to MongoDB"""
    global client, database
    try:
        client = AsyncIOMotorClient(MONGODB_URI)
        database = client[DATABASE_NAME]
        # Verify connection
        await client.admin.command('ping')
        print(f"✓ Connected to MongoDB at {MONGODB_URI}")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("✓ Closed MongoDB connection")

def get_database():
    """Get database instance"""
    return database

# Collection helpers
def get_collection(collection_name: str):
    """Get a specific collection from the database"""
    if database is None:
        raise Exception("Database not initialized. Call connect_to_mongo() first.")
    return database[collection_name]