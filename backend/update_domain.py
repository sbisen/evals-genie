"""
Script to update the domain name from 'maps' to 'Ads Insights'
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = "evalsgenie"

async def update_domain():
    """Update domain name and schema"""
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    print("🔄 Updating domain...")
    
    # Update the domain document
    domains_collection = db["domains"]
    
    result = await domains_collection.update_one(
        {"_id": "maps"},
        {"$set": {
            "alias": "Ads Insights",
            "schema_name": "ads.insights"
        }}
    )
    
    if result.modified_count > 0:
        print("✅ Domain updated successfully!")
        print("   - alias: 'Ads Insights'")
        print("   - schema_name: 'ads.insights'")
    else:
        print("⚠️  No domain found with id 'maps' or already up to date")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(update_domain())