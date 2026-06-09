#!/bin/bash
# Elevate AI — Local Development Startup Script
# Usage: bash start_dev.sh

set -e
cd "$(dirname "$0")"

echo "🚀 Elevate AI — Dev Startup"
echo "=========================="

# 1. Check .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Copy .env.example to .env and fill in your keys."
    exit 1
fi
echo "✅ .env file found"

# 2. Check GEMINI_API_KEY
source .env 2>/dev/null || true
if [ -z "$GEMINI_API_KEY" ] || [ "$GEMINI_API_KEY" = "your-gemini-api-key" ] || [ "$GEMINI_API_KEY" = "your-gemini-api-key-here" ]; then
    echo "⚠️  GEMINI_API_KEY is not set or still a placeholder. AI features will use fallback responses."
else
    echo "✅ GEMINI_API_KEY is configured"
fi

# 3. Check MongoDB
echo "Checking MongoDB connection..."
python -c "
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio, os
from dotenv import load_dotenv
load_dotenv('.env')
async def check():
    try:
        client = AsyncIOMotorClient(os.environ.get('MONGO_URL','mongodb://localhost:27017'), serverSelectionTimeoutMS=3000)
        await client.admin.command('ping')
        print('✅ MongoDB is reachable')
        client.close()
    except Exception as e:
        print(f'❌ MongoDB not reachable: {e}')
        exit(1)
asyncio.run(check())
" || exit 1

# 4. Initialize demo data
echo "Initializing demo data..."
python init_demo_data.py

# 5. Start FastAPI
echo ""
echo "================================"
echo "🔥 Starting FastAPI server..."
echo "   Backend: http://localhost:8000"
echo "   API:     http://localhost:8000/api/"
echo "   Health:  http://localhost:8000/api/health"
echo "================================"
uvicorn server:app --reload
