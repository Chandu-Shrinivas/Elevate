from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=True)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Groq API config
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
GROQ_MODEL = 'llama-3.1-8b-instant'

if not GROQ_API_KEY or GROQ_API_KEY in ('your-groq-api-key', 'your-groq-api-key-here'):
    logging.warning('GROQ_API_KEY is missing or placeholder. AI features will return fallback responses.')

app = FastAPI()
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# ---------- Models ----------

class CodeEvalRequest(BaseModel):
    user_id: str = "default"
    code: str
    language: str
    problem_statement: str = ""
    expected_behavior: str = ""

class CodeExecRequest(BaseModel):
    source_code: str
    language_id: int
    stdin: str = ""

class QuizSubmitRequest(BaseModel):
    user_id: str = "default"
    topic: str
    answers: dict  # {question_index: selected_option}
    total_questions: int

class InterviewEvalRequest(BaseModel):
    user_id: str = "default"
    question: str
    transcript: str
    filler_words: int = 0
    speech_speed: str = "normal"

class ChatRequest(BaseModel):
    message: str
    context: str
    history: List[dict]

class ProgressUpdate(BaseModel):
    action: str  # "quiz_complete", "interview_complete", "code_submit"
    xp_earned: int = 0
    details: dict = {}

# ---------- Helpers ----------

import json
import re

def extract_json(text: str) -> dict:
    match = re.search(r'```(?:json)?\s*\n?([\s\S]*?)\n?```', text, re.IGNORECASE)
    if match: text = match.group(1)
    match2 = re.search(r'\{[\s\S]*\}', text)
    if match2: text = match2.group(0)
    try: return json.loads(text)
    except: return {}

async def get_ai_response(system_msg: str, user_msg: str) -> str:
    if not GROQ_API_KEY or GROQ_API_KEY in ('your-groq-api-key', 'your-groq-api-key-here'):
        logger.warning('No GROQ_API_KEY configured — returning fallback response')
        return '{"error": "AI service not configured. Please set GROQ_API_KEY in .env"}'
    try:
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.post(
                GROQ_API_URL,
                headers={
                    'Authorization': f'Bearer {GROQ_API_KEY}',
                    'Content-Type': 'application/json',
                },
                json={
                    'model': GROQ_MODEL,
                    'messages': [
                        {'role': 'system', 'content': system_msg},
                        {'role': 'user', 'content': user_msg},
                    ],
                    'temperature': 0.7,
                    'max_tokens': 2048,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data['choices'][0]['message']['content']
    except httpx.TimeoutException:
        logger.error('Groq API timeout')
        return '{"error": "AI request timed out. Please try again."}'
    except Exception as e:
        logger.error(f'AI Error: {e}')
        return '{"error": "AI feedback temporarily unavailable. Showing basic guidance."}'

async def get_or_create_progress():
    progress = await db.progress.find_one({"user": "default"}, {"_id": 0})
    if not progress:
        progress = {
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
        await db.progress.insert_one({**progress})
    return progress

# ---------- Routes ----------

@api_router.get("/")
async def root():
    return {"message": "Elevate AI API"}

# --- Health Check ---
@api_router.get("/health")
async def health_check():
    # Check MongoDB
    db_status = "connected"
    try:
        await client.admin.command('ping')
    except Exception:
        db_status = "disconnected"

    # Check AI (Groq key configured)
    ai_status = "available" if GROQ_API_KEY and GROQ_API_KEY not in ('your-groq-api-key', 'your-groq-api-key-here') else "no_api_key"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "database": db_status,
        "ai": ai_status
    }

# --- Progress ---
@api_router.get("/progress")
async def get_progress():
    return await get_or_create_progress()

@api_router.post("/progress/update")
async def update_progress(req: ProgressUpdate):
    progress = await get_or_create_progress()
    xp = progress["xp"] + req.xp_earned
    level = 1 + xp // 500
    updates = {
        "xp": xp,
        "level": level,
        "last_active": datetime.now(timezone.utc).isoformat(),
    }
    if req.action == "quiz_complete":
        updates["quizzes_taken"] = progress["quizzes_taken"] + 1
    elif req.action == "interview_complete":
        updates["interviews_given"] = progress["interviews_given"] + 1
    elif req.action == "code_submit":
        updates["codes_submitted"] = progress["codes_submitted"] + 1

    # Streak logic
    last_dt = datetime.fromisoformat(progress["last_active"])
    now_dt = datetime.now(timezone.utc)
    last_date = last_dt.date()
    now_date = now_dt.date()

    updates["streak"] = progress.get("streak", 0)
    if now_date > last_date:
        if (now_date - last_date).days == 1:
            updates["streak"] += 1
        else:
            updates["streak"] = 1
    elif updates["streak"] == 0:
        updates["streak"] = 1

    await db.progress.update_one({"user": "default"}, {"$set": updates})
    updated = await db.progress.find_one({"user": "default"}, {"_id": 0})
    return updated

# --- User Profile & Analytics ---

@api_router.get("/user/profile/{user_id}")
async def get_user_profile(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        # Mock payload for currently non-synced clerk users
        user = {"name": "Guest User", "email": "guest@elevate.com", "createdAt": datetime.now(timezone.utc).isoformat()}
    
    coding_count = await db.code_submissions.count_documents({"userId": user_id})
    aptitude_count = await db.quiz_attempts.count_documents({"userId": user_id})
    interview_count = await db.interviews.count_documents({"userId": user_id})
    
    # Calculate overall skill score (simple avg of all tests)
    coding_cursor = db.code_submissions.find({"userId": user_id}).sort("timestamp", -1).limit(5)
    coding_scores = [doc.get("score", 0) for doc in await coding_cursor.to_list(length=5)]
    avg_coding = sum(coding_scores) / len(coding_scores) if coding_scores else 0

    apt_cursor = db.quiz_attempts.find({"userId": user_id}).sort("timestamp", -1).limit(5)
    apt_scores = [doc.get("score", 0) for doc in await apt_cursor.to_list(length=5)]
    avg_apt = sum(apt_scores) / len(apt_scores) if apt_scores else 0

    int_cursor = db.interviews.find({"userId": user_id}).sort("timestamp", -1).limit(5)
    int_docs = await int_cursor.to_list(length=5)
    int_scores = [((d.get("clarityScore", 0) + d.get("confidenceScore", 0)) / 2) for d in int_docs]
    avg_int = sum(int_scores) / len(int_scores) if int_scores else 0

    overall = (avg_coding + avg_apt + avg_int) / 3 if (avg_coding or avg_apt or avg_int) else 0

    return {
        "name": user.get("name", "Guest User"),
        "email": user.get("email", ""),
        "joinedAt": user.get("createdAt", datetime.now(timezone.utc).isoformat()),
        "totalCodingAttempts": coding_count,
        "totalAptitudeAttempts": aptitude_count,
        "totalInterviewAttempts": interview_count,
        "overallSkillScore": round(overall, 1)
    }

class SkillEngine:
    @staticmethod
    def detect_weakest_skill(coding: float, aptitude: float, communication: float):
        scores = {"coding": coding, "aptitude": aptitude, "communication": communication}
        weakest = min(scores, key=scores.get)
        
        recommendations = {
            "coding": "Your coding scores are lagging. Practice Data Structures and Algorithms in the Coding Arena.",
            "aptitude": "Your aptitude logic could use a brush-up. Take more quizzes to improve pattern recognition.",
            "communication": "Your interview scores are lower than average. Practice mock interviews to boost confidence."
        }
        
        return weakest, recommendations[weakest]

@api_router.get("/analytics/{user_id}")
async def get_analytics(user_id: str):
    coding_cursor = db.code_submissions.find({"userId": user_id}).sort("timestamp", -1).limit(5)
    coding_docs = await coding_cursor.to_list(length=5)
    coding_scores = [doc.get("score", 0) for doc in coding_docs]
    avg_coding = sum(coding_scores) / len(coding_scores) if coding_scores else 0

    apt_cursor = db.quiz_attempts.find({"userId": user_id}).sort("timestamp", -1).limit(5)
    apt_docs = await apt_cursor.to_list(length=5)
    apt_scores = [doc.get("score", 0) for doc in apt_docs]
    avg_apt = sum(apt_scores) / len(apt_scores) if apt_scores else 0

    int_cursor = db.interviews.find({"userId": user_id}).sort("timestamp", -1).limit(5)
    int_docs = await int_cursor.to_list(length=5)
    int_scores = [((d.get("clarityScore", 0) + d.get("confidenceScore", 0)) / 2) for d in int_docs]
    avg_int = sum(int_scores) / len(int_scores) if int_scores else 0
    
    weakest_skill, recommendation = SkillEngine.detect_weakest_skill(avg_coding, avg_apt, avg_int)

    all_recent = []
    for d in coding_docs: all_recent.append({"module": "coding", "score": d.get("score", 0), "date": d.get("timestamp")})
    for d in apt_docs: all_recent.append({"module": "aptitude", "score": d.get("score", 0), "date": d.get("timestamp")})
    for d in int_docs: all_recent.append({"module": "communication", "score": ((d.get("clarityScore", 0) + d.get("confidenceScore", 0)) / 2), "date": d.get("timestamp")})
        
    all_recent.sort(key=lambda x: x["date"])

    return {
        "codingAverage": round(avg_coding, 1),
        "aptitudeAverage": round(avg_apt, 1),
        "communicationAverage": round(avg_int, 1),
        "weakestSkill": weakest_skill,
        "recommendation": recommendation,
        "recentPerformance": all_recent[-10:]
    }

@api_router.get("/analytics/heatmap/{user_id}")
async def get_analytics_heatmap(user_id: str, module: str = "all"):
    from collections import defaultdict
    from datetime import timedelta
    
    activity_map = defaultdict(int)
    one_year_ago = datetime.now(timezone.utc) - timedelta(days=365)
    query = {"userId": user_id, "timestamp": {"$gte": one_year_ago.isoformat()}}

    # Fetch data based on module filter
    if module in ["all", "coding"]:
        async for doc in db.code_submissions.find(query):
            dt = datetime.fromisoformat(doc["timestamp"]).date().isoformat()
            activity_map[dt] += 1
            
    if module in ["all", "aptitude"]:
        async for doc in db.quiz_attempts.find(query):
            dt = datetime.fromisoformat(doc["timestamp"]).date().isoformat()
            activity_map[dt] += 1
            
    if module in ["all", "communication"]:
        async for doc in db.interviews.find(query):
            dt = datetime.fromisoformat(doc["timestamp"]).date().isoformat()
            activity_map[dt] += 1
            
    active_dates = sorted(activity_map.keys())
    
    # Calculate Streaks
    current_streak = 0
    max_streak = 0
    
    if active_dates:
        # Evaluate Max Streak
        temp_streak = 1
        for i in range(1, len(active_dates)):
            d1 = datetime.fromisoformat(active_dates[i-1]).date()
            d2 = datetime.fromisoformat(active_dates[i]).date()
            if (d2 - d1).days == 1:
                temp_streak += 1
            else:
                max_streak = max(max_streak, temp_streak)
                temp_streak = 1
        max_streak = max(max_streak, temp_streak)
        
        # Evaluate Current Streak
        today = datetime.now(timezone.utc).date()
        yesterday = today - timedelta(days=1)
        
        last_active = datetime.fromisoformat(active_dates[-1]).date()
        if last_active == today or last_active == yesterday:
            current_streak = 1
            curr_d = last_active
            for j in range(len(active_dates)-2, -1, -1):
                prev_d = datetime.fromisoformat(active_dates[j]).date()
                if (curr_d - prev_d).days == 1:
                    current_streak += 1
                    curr_d = prev_d
                else:
                    break

    daily_activity = [{"date": k, "count": v} for k, v in activity_map.items()]

    return {
        "totalSubmissions": sum(activity_map.values()),
        "activeDays": len(active_dates),
        "currentStreak": current_streak,
        "maxStreak": max_streak,
        "dailyActivity": daily_activity
    }

# --- Code Evaluation ---
FALLBACK_CODE_EVAL = json.dumps({
    "correctness": "Code runs successfully but may have edge cases. (Simulated AI Analysis)",
    "time_complexity": "O(N) - Linear time complexity",
    "space_complexity": "O(1) - Constant space complexity",
    "edge_cases": ["Empty input arrays", "Null references", "Maximum integer values"],
    "improvements": ["Consider adding input validation", "Extract logic into helper functions for readability", "Add descriptive comments"],
    "scores": {"logic": 8, "optimization": 7, "code_quality": 8},
    "roadmap": "Practice more array manipulation and two-pointer techniques to master edge cases."
})

@api_router.post("/code/evaluate")
async def evaluate_code(req: CodeEvalRequest):
    system_msg = """You are Elevate AI — a coding evaluator for placement readiness.
Be direct, analytical. Avoid motivational fluff.
When given code, you must:
1. Analyze correctness
2. Evaluate time & space complexity
3. Identify edge cases
4. Suggest improvements
5. Give scores out of 10: Logic, Optimization, Code Quality
6. Provide a short improvement roadmap
Respond in structured JSON format:
{
  "correctness": "...",
  "time_complexity": "...",
  "space_complexity": "...",
  "edge_cases": ["..."],
  "improvements": ["..."],
  "scores": {"logic": X, "optimization": X, "code_quality": X},
  "roadmap": "..."
}"""
    user_msg = f"Problem: {req.problem_statement}\nExpected: {req.expected_behavior}\nLanguage: {req.language}\nCode:\n```\n{req.code}\n```"
    result = await get_ai_response(system_msg, user_msg)
    parsed = extract_json(result)
    
    # Check if AI returned an error fallback
    if parsed.get('error'):
        logger.warning(f'Code Eval AI failed, using fallback evaluation')
        result = FALLBACK_CODE_EVAL
        parsed = extract_json(result)

    score = parsed.get("scores", {}).get("logic", 0)

    await db.code_submissions.insert_one({
        "id": str(uuid.uuid4()),
        "userId": req.user_id,
        "score": score,
        "code": req.code,
        "language": req.language,
        "problem": req.problem_statement,
        "evaluation": result,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    return {"evaluation": result}

# --- Chatbot API ---
@api_router.post("/chat")
async def process_chat(req: ChatRequest):
    system_msg = """You are Elevate AI, an expert coding assistant.
You are helping the user write, debug, and optimize their code. 
Be concise, helpful, and provide code examples when relevant.
Whenever you provide advice, format it nicely."""
    
    # Build up the context string based on what the user has currently inputted
    user_msg = f"Current Context:\n{req.context}\n\nUser Question:\n{req.message}"
    
    # Simple direct generation (Optionally can map req.history if complex multi-turn needed, 
    # but passing concatenated context + question string is sufficient for a basic bot)
    result = await get_ai_response(system_msg, user_msg)
    return {"reply": result}

# --- Code Execution (Judge0 proxy) ---
@api_router.post("/code/execute")
async def execute_code(req: CodeExecRequest):
    # Use Judge0 CE public instance
    judge0_url = "https://judge0-ce.p.rapidapi.com/submissions"
    headers = {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": os.environ.get("JUDGE0_API_KEY", ""),
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
    }
    payload = {
        "source_code": req.source_code,
        "language_id": req.language_id,
        "stdin": req.stdin
    }

    # If no Judge0 key, simulate with AI
    if not os.environ.get("JUDGE0_API_KEY"):
        system_msg = """You are a code execution simulator. Execute the given code mentally and return the output.
Respond ONLY in JSON: {"stdout": "...", "stderr": "", "status": {"description": "Accepted"}, "time": "0.01", "memory": 256}
If there's an error, put it in stderr and set status description to "Runtime Error" or "Compilation Error"."""
        user_msg = f"Language ID: {req.language_id}\nStdin: {req.stdin}\nCode:\n```\n{req.source_code}\n```"
        result = await get_ai_response(system_msg, user_msg)
        return {"result": result, "simulated": True}

    try:
        async with httpx.AsyncClient(timeout=30) as http:
            resp = await http.post(f"{judge0_url}?base64_encoded=false&wait=true", json=payload, headers=headers)
            return {"result": resp.json(), "simulated": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Fallback quiz questions ---
FALLBACK_QUIZ = json.dumps([
    {"question": "What is the time complexity of binary search?", "options": ["O(n)", "O(log n)", "O(n^2)", "O(1)"], "correct": 1, "explanation": "Binary search divides the search space in half each step."},
    {"question": "Which data structure uses LIFO order?", "options": ["Queue", "Array", "Stack", "Linked List"], "correct": 2, "explanation": "Stack follows Last-In-First-Out ordering."},
    {"question": "What does SQL stand for?", "options": ["Structured Query Language", "Simple Query Logic", "Standard Query Language", "System Query Language"], "correct": 0, "explanation": "SQL stands for Structured Query Language."},
    {"question": "Which sorting algorithm has O(n log n) average case?", "options": ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"], "correct": 2, "explanation": "Merge sort consistently achieves O(n log n) via divide-and-conquer."},
    {"question": "What is a deadlock in operating systems?", "options": ["A fast process", "A situation where processes wait indefinitely for resources", "A type of scheduling", "A memory allocation technique"], "correct": 1, "explanation": "Deadlock occurs when processes are stuck waiting for resources held by each other."},
    {"question": "Which of these is NOT a principle of OOP?", "options": ["Encapsulation", "Polymorphism", "Compilation", "Inheritance"], "correct": 2, "explanation": "Compilation is a process that translates code into machine language, not a core principle of Object-Oriented Programming."},
    {"question": "What is the primary function of a primary key in a database?", "options": ["To speed up searches", "To uniquely identify a record", "To link two tables together", "To encrypt the data"], "correct": 1, "explanation": "A primary key is essential for uniquely establishing the identity of a record in a relational database table."},
    {"question": "What does HTTP stand for?", "options": ["HyperText Transfer Protocol", "High Transfer Text Protocol", "Hyper Transfer Text Protocol", "HighText Transfer Protocol"], "correct": 0, "explanation": "HTTP is the foundation of data communication for the World Wide Web."},
    {"question": "What type of join returns all rows from both tables?", "options": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"], "correct": 3, "explanation": "A FULL OUTER JOIN combines the results of both left and right outer joins."},
    {"question": "Which layer of the OSI model does a router operate at?", "options": ["Physical", "Data Link", "Network", "Transport"], "correct": 2, "explanation": "Routers operate at the Network layer (Layer 3) to forward data packets across networks."}
])

# --- Quiz ---
@api_router.get("/quiz/{topic}")
async def get_quiz(topic: str):
    system_msg = """You are an aptitude quiz generator for placement readiness.
Generate exactly 10 multiple-choice questions about the given topic. Each question must include 4 options and the correct answer.
Respond ONLY with a JSON array, no extra text:
[{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]
where correct is the 0-based index of the correct option.
Questions should be placement-level difficulty."""
    result = await get_ai_response(system_msg, f"Generate 10 MCQ questions on: {topic}")
    # Check if AI returned an error fallback
    parsed = extract_json(result)
    if parsed.get('error'):
        logger.warning(f'Quiz AI failed, using fallback questions for {topic}')
        return {"topic": topic, "questions": FALLBACK_QUIZ, "fallback": True}
    return {"topic": topic, "questions": result}

@api_router.post("/quiz/submit")
async def submit_quiz(req: QuizSubmitRequest):
    score = req.answers.get("score", 0)
    total = req.total_questions

    system_msg = """You are Elevate AI — an aptitude performance analyzer.
When given quiz results, you must:
1. Identify weak concepts
2. Suggest specific topics to revise
3. Recommend practice intensity (Low/Medium/High)
4. Provide a readiness score out of 100
5. Suggest next logical topic
Respond in JSON:
{"weak_concepts": [...], "topics_to_revise": [...], "practice_intensity": "...", "readiness_score": X, "next_topic": "..."}"""

    user_msg = f"Topic: {req.topic}\nScore: {score}/{total}\nWeak areas: User got {total - score} wrong"
    analysis = await get_ai_response(system_msg, user_msg)
    # Scale score to 10-100 logically for database matching
    mapped_score = (score / total) * 100 if total > 0 else 0

    record = {
        "id": str(uuid.uuid4()),
        "userId": req.user_id,
        "topic": req.topic,
        "score": mapped_score,
        "total": total,
        "analysis": analysis,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.quiz_attempts.insert_one({**record})

    return {"score": score, "total": total, "analysis": analysis}

# --- Interview Evaluation ---
FALLBACK_INTERVIEW_EVAL = json.dumps({
    "clarity_score": 8,
    "confidence_score": 7,
    "professionalism_score": 8,
    "feedback": "Good response overall, but try to structure your answer using the STAR method. (Simulated AI Analysis)",
    "filler_analysis": "You used some filler words like 'um' and 'like'. Pausing silently is better than filling the gap.",
    "improvements": ["Structure your answer with Situation, Task, Action, Result", "Speak slightly slower for better clarity", "Maintain consistent eye contact"],
    "sample_answer": "A more structured answer would begin by clearly stating the context, followed by the specific actions taken, and concluding with the positive business impact."
})

@api_router.post("/interview/evaluate")
async def evaluate_interview(req: InterviewEvalRequest):
    system_msg = """You are Elevate AI — a communication & interview coach.
When given an interview response, you must:
1. Evaluate clarity, confidence, structure
2. Detect overused filler words
3. Suggest improvements
4. Give scores: Clarity (/10), Confidence (/10), Professionalism (/10)
5. Provide a refined improved sample answer
Respond in JSON:
{"clarity_score": X, "confidence_score": X, "professionalism_score": X, "feedback": "...", "filler_analysis": "...", "improvements": [...], "sample_answer": "..."}"""

    user_msg = f"Question: {req.question}\nTranscript: {req.transcript}\nFiller words detected: {req.filler_words}\nSpeech speed: {req.speech_speed}"
    result = await get_ai_response(system_msg, user_msg)
    parsed = extract_json(result)
    
    # Check if AI returned an error fallback
    if parsed.get('error'):
        logger.warning(f'Interview Eval AI failed, using fallback evaluation')
        result = FALLBACK_INTERVIEW_EVAL
        parsed = extract_json(result)

    record = {
        "id": str(uuid.uuid4()),
        "userId": req.user_id,
        "question": req.question,
        "transcript": req.transcript,
        "grammarScore": getattr(parsed, "grammar_score", 0), # Optional tracking if added to prompt
        "clarityScore": parsed.get("clarity_score", 0) * 10, # Convert /10 to /100
        "confidenceScore": parsed.get("confidence_score", 0) * 10, # Convert /10 to /100
        "evaluation": result,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await db.interviews.insert_one({**record})

    return {"evaluation": result}

# Video feed endpoint removed — requires OpenCV and local camera hardware.

# --- Speech Analysis ---
FILLER_WORDS = ["um", "uh", "like", "you know", "so", "actually", "basically", "well", "i mean", "kind of", "sort of"]

class SpeechAnalysisRequest(BaseModel):
    transcript: str
    duration_seconds: float = 60.0  # default 1 minute if not provided

@api_router.post("/speech/analyze")
async def analyze_speech(req: SpeechAnalysisRequest):
    text_lower = req.transcript.lower()
    words = text_lower.split()
    total_words = len(words)

    filler_count = 0
    filler_details = {}
    for filler in FILLER_WORDS:
        if ' ' in filler:
            count = text_lower.count(filler)
        else:
            count = words.count(filler)
        if count > 0:
            filler_details[filler] = count
            filler_count += count

    wpm = round((total_words / max(req.duration_seconds, 1)) * 60)

    return {
        "words": total_words,
        "fillers": filler_count,
        "filler_details": filler_details,
        "wpm": wpm,
        "clarity_score": max(0, round(100 - (filler_count / max(total_words, 1)) * 100)),
    }

# --- Interview Questions ---
FALLBACK_INTERVIEW_QUESTIONS = json.dumps([
    "Tell me about yourself and your background.",
    "What is the difference between a process and a thread?",
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "Explain the concept of Object-Oriented Programming.",
    "Where do you see yourself in 5 years?"
])

@api_router.get("/interview/questions")
async def get_interview_questions():
    system_msg = "You are an interview question generator. Generate 5 common placement interview questions. Respond as JSON array of strings."
    result = await get_ai_response(system_msg, "Generate 5 common placement interview questions covering HR, technical, and behavioral topics")
    parsed = extract_json(result)
    if parsed.get('error'):
        return {"questions": FALLBACK_INTERVIEW_QUESTIONS, "fallback": True}
    return {"questions": result}

# --- History ---
@api_router.get("/history/quizzes")
async def get_quiz_history():
    records = await db.quiz_attempts.find({}, {"_id": 0}).sort("timestamp", -1).to_list(50)
    return records

@api_router.get("/history/interviews")
async def get_interview_history():
    records = await db.interviews.find({}, {"_id": 0}).sort("timestamp", -1).to_list(50)
    return records

@api_router.get("/history/code")
async def get_code_history():
    records = await db.code_submissions.find({}, {"_id": 0}).sort("timestamp", -1).to_list(50)
    return records

# --- Communication Tips ---
@api_router.post("/communication/tips")
async def get_communication_tips():
    system_msg = """You are a professional communication coach. Provide structured communication tips for interview success.
Respond in JSON:
{"tips": [{"title": "...", "description": "...", "practice": "..."}], "filler_words_to_avoid": [...], "body_language_tips": [...]}"""
    result = await get_ai_response(system_msg, "Give me 5 key communication tips for placement interviews")
    return {"tips": result}

# --- Recommendation Engine ---
@api_router.get("/recommendations")
async def get_recommendations():
    progress = await get_or_create_progress()
    quizzes = await db.quiz_attempts.find({}, {"_id": 0}).sort("timestamp", -1).to_list(10)

    recommendations = []

    # 1. Detect weakest skill
    coding_score = min(100, progress.get("codes_submitted", 0) * 15)
    aptitude_score = min(100, progress.get("quizzes_taken", 0) * 12)
    comm_score = min(100, progress.get("interviews_given", 0) * 20)

    scores = {"Coding": coding_score, "Aptitude": aptitude_score, "Communication": comm_score}
    weakest = min(scores, key=scores.get)

    if scores[weakest] < 50:
        action_map = {
            "Coding": "Solve 2 DSA problems in the Coding Arena today",
            "Aptitude": "Complete a Quantitative Aptitude quiz in Aptitude Gym",
            "Communication": "Take an AI Mock Interview in Comm Studio",
        }
        recommendations.append({
            "title": f"{weakest} Needs Attention",
            "description": action_map[weakest],
            "priority": "High",
            "module": weakest.lower(),
        })

    # 2. Quiz topic weakness
    if quizzes:
        low_scores = [q for q in quizzes if q.get("total", 1) > 0 and (q.get("score", 0) / q.get("total", 1)) < 0.6]
        if low_scores:
            weak_topic = low_scores[0].get("topic", "General")
            recommendations.append({
                "title": "Aptitude Accuracy Dropped",
                "description": f"Attempt {weak_topic} (Medium) Quiz Today",
                "priority": "High",
                "module": "aptitude",
            })

    # 3. Inactivity check
    from datetime import timedelta
    last_active = datetime.fromisoformat(progress.get("last_active", datetime.now(timezone.utc).isoformat()))
    days_inactive = (datetime.now(timezone.utc) - last_active).days
    if days_inactive >= 3:
        recommendations.append({
            "title": "You've Been Away",
            "description": "You haven't practiced in " + str(days_inactive) + " days. Start with a quick quiz to get back on track.",
            "priority": "High",
            "module": "aptitude",
        })

    # 4. Interview performance gap
    if progress.get("interviews_given", 0) == 0 and progress.get("quizzes_taken", 0) >= 2:
        recommendations.append({
            "title": "Try a Mock Interview",
            "description": "You've been doing quizzes. Time to test your communication skills with an AI interview.",
            "priority": "Medium",
            "module": "communication",
        })

    # 5. Coding streak
    if progress.get("codes_submitted", 0) > 0 and progress.get("codes_submitted", 0) < 5:
        recommendations.append({
            "title": "Build Coding Consistency",
            "description": "Solve at least 1 DSA problem daily to maintain your streak and improve pattern recognition.",
            "priority": "Medium",
            "module": "coding",
        })

    # 6. Level up encouragement
    xp_to_next = 500 - (progress.get("xp", 0) % 500)
    if xp_to_next <= 100:
        recommendations.append({
            "title": f"Almost Level {progress.get('level', 1) + 1}!",
            "description": f"Only {xp_to_next} XP away. Complete one more activity to level up.",
            "priority": "Low",
            "module": "dashboard",
        })

    # If no specific recommendations, give a general one
    if not recommendations:
        recommendations.append({
            "title": "Keep Going!",
            "description": "Try a coding challenge or take a quiz to earn XP and level up.",
            "priority": "Low",
            "module": "dashboard",
        })

    return {"recommendations": recommendations, "scores": scores}

app.include_router(api_router)

# Build allowed origins: always include the Vercel deployment URL + any from env var
_cors_env = os.environ.get('CORS_ORIGINS', '')
_default_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://elevate-ai.yop6.vercel.app",
    "https://elevate-ai-git-main-shubh9632s-projects.vercel.app",
]
if _cors_env and _cors_env != '*':
    _env_origins = [o.strip() for o in _cors_env.split(',') if o.strip()]
    _allowed_origins = list(set(_default_origins + _env_origins))
else:
    # No env var set OR explicitly wildcard → allow all (dev/staging)
    _allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=_allowed_origins != ["*"],
    allow_origins=_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
