import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "elevate")]

async def reset():
    result = await db.progress.update_many({}, {"$set": {"streak": 0}})
    print(f"Streak reset to 0 for {result.modified_count} user entries")

asyncio.run(reset())
