#!/usr/bin/env python3
"""
Demo Data Initialization Script
Connects to MongoDB and ensures default collections and documents exist.
Usage: python init_demo_data.py
"""

import asyncio
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=True)


async def init_demo_data():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'elevate_ai')

    print(f"Connecting to MongoDB: {mongo_url}")
    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    db = client[db_name]

    # Verify connection
    try:
        await client.admin.command('ping')
        print("[OK] MongoDB connection successful")
    except Exception as e:
        print(f"[FAIL] MongoDB connection failed: {e}")
        client.close()
        return

    # Ensure collections exist
    existing = await db.list_collection_names()
    required_collections = ['progress', 'code_submissions', 'quiz_attempts', 'interviews', 'users']

    for coll in required_collections:
        if coll not in existing:
            await db.create_collection(coll)
            print(f"  [CREATED] Collection: {coll}")
        else:
            print(f"  [EXISTS]  Collection: {coll}")

    # Insert default progress document if missing
    progress = await db.progress.find_one({"user": "default"})
    if not progress:
        default_progress = {
            "user": "default",
            "xp": 0,
            "level": 1,
            "streak": 0,
            "last_active": datetime.now(timezone.utc).isoformat(),
            "quizzes_taken": 0,
            "interviews_given": 0,
            "codes_submitted": 0,
            "total_score": 0,
            "badges": [],
        }
        await db.progress.insert_one(default_progress)
        print("  [CREATED] Default progress document")
    else:
        print("  [EXISTS]  Default progress document")

    print("\nDemo data initialization complete!")
    client.close()


if __name__ == "__main__":
    asyncio.run(init_demo_data())
