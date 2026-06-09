#!/usr/bin/env python3
"""
Backend API Testing Suite for Elevate AI Platform
Tests all API endpoints for functionality and integration
"""

import requests
import sys
import json
from datetime import datetime

class ElevateAITester:
    def __init__(self, base_url="http://localhost:8000"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
    def log_test(self, name, success, response_data=None, error_msg=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {error_msg}")
            self.failed_tests.append({"test": name, "error": error_msg, "response": response_data})
    
    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_base}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=30)
            
            success = response.status_code == expected_status
            response_data = None
            try:
                response_data = response.json()
            except:
                response_data = response.text
            
            self.log_test(name, success, response_data, 
                         f"Expected {expected_status}, got {response.status_code}" if not success else None)
            
            return success, response_data
            
        except requests.exceptions.Timeout:
            self.log_test(name, False, None, "Request timeout")
            return False, None
        except requests.exceptions.ConnectionError:
            self.log_test(name, False, None, "Connection error")
            return False, None
        except Exception as e:
            self.log_test(name, False, None, str(e))
            return False, None
    
    def test_basic_endpoints(self):
        """Test basic API endpoints"""
        print("\n🔧 Testing Basic API Endpoints...")
        
        # Test API root
        success, data = self.run_test("API Root", "GET", "", 200)
        if success and isinstance(data, dict):
            if data.get("message") == "Elevate AI API":
                print("   ✓ API message correct")
            else:
                print(f"   ⚠️  Unexpected API message: {data.get('message')}")
    
    def test_progress_system(self):
        """Test progress tracking system"""
        print("\n📊 Testing Progress System...")
        
        # Get initial progress
        success, progress_data = self.run_test("Get Progress", "GET", "progress", 200)
        if success and isinstance(progress_data, dict):
            required_fields = ['xp', 'level', 'streak', 'quizzes_taken', 'interviews_given', 'codes_submitted']
            for field in required_fields:
                if field in progress_data:
                    print(f"   ✓ Progress field '{field}': {progress_data[field]}")
                else:
                    print(f"   ❌ Missing progress field: {field}")
        
        # Test progress update
        update_data = {
            "action": "code_submit",
            "xp_earned": 25,
            "details": {"language": "python", "problem": "test"}
        }
        success, updated_progress = self.run_test("Update Progress", "POST", "progress/update", 200, update_data)
        if success and isinstance(updated_progress, dict):
            print(f"   ✓ Updated XP: {updated_progress.get('xp', 'N/A')}")
    
    def test_code_system(self):
        """Test coding system endpoints"""
        print("\n💻 Testing Code System...")
        
        # Test code execution
        code_exec_data = {
            "source_code": "print('Hello World')",
            "language_id": 71,  # Python
            "stdin": ""
        }
        success, exec_result = self.run_test("Code Execution", "POST", "code/execute", 200, code_exec_data)
        if success and isinstance(exec_result, dict):
            if exec_result.get("simulated"):
                print("   ℹ️  Code execution simulated by AI (no Judge0 key)")
            print(f"   ✓ Execution result received")
        
        # Test code evaluation
        code_eval_data = {
            "code": "def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]",
            "language": "Python",
            "problem_statement": "Find two numbers that add up to target",
            "expected_behavior": "Return indices of the two numbers"
        }
        success, eval_result = self.run_test("Code Evaluation", "POST", "code/evaluate", 200, code_eval_data)
        if success and isinstance(eval_result, dict):
            evaluation = eval_result.get("evaluation")
            if evaluation:
                print("   ✓ AI evaluation received")
                # Try to parse JSON evaluation
                try:
                    if isinstance(evaluation, str):
                        eval_json = json.loads(evaluation.replace('```json', '').replace('```', '').strip())
                        if "scores" in eval_json:
                            print(f"   ✓ Evaluation scores found")
                except:
                    print("   ⚠️  Evaluation format may need parsing")
    
    def test_quiz_system(self):
        """Test quiz generation and submission"""
        print("\n🧠 Testing Quiz System...")
        
        # Test quiz generation
        quiz_topic = "Basic Programming"
        success, quiz_data = self.run_test("Generate Quiz", "GET", f"quiz/{quiz_topic}", 200)
        if success and isinstance(quiz_data, dict):
            questions = quiz_data.get("questions")
            if questions:
                print(f"   ✓ Quiz generated for topic: {quiz_data.get('topic')}")
                # Try to parse questions if string
                if isinstance(questions, str):
                    try:
                        questions_parsed = json.loads(questions.replace('```json', '').replace('```', '').strip())
                        if isinstance(questions_parsed, list) and len(questions_parsed) > 0:
                            print(f"   ✓ Found {len(questions_parsed)} questions")
                        else:
                            print("   ⚠️  Quiz questions format unexpected")
                    except:
                        print("   ⚠️  Could not parse quiz questions")
                elif isinstance(questions, list):
                    print(f"   ✓ Found {len(questions)} questions")
        
        # Test quiz submission
        submit_data = {
            "topic": quiz_topic,
            "answers": {"score": 7},
            "total_questions": 10
        }
        success, submit_result = self.run_test("Submit Quiz", "POST", "quiz/submit", 200, submit_data)
        if success and isinstance(submit_result, dict):
            score = submit_result.get("score")
            analysis = submit_result.get("analysis")
            print(f"   ✓ Quiz submitted, score: {score}")
            if analysis:
                print("   ✓ AI analysis received")
    
    def test_interview_system(self):
        """Test interview system"""
        print("\n🎤 Testing Interview System...")
        
        # Test get interview questions
        success, questions_data = self.run_test("Get Interview Questions", "GET", "interview/questions", 200)
        if success and isinstance(questions_data, dict):
            questions = questions_data.get("questions")
            if questions:
                print("   ✓ Interview questions generated")
                if isinstance(questions, str):
                    try:
                        questions_parsed = json.loads(questions.replace('```json', '').replace('```', '').strip())
                        if isinstance(questions_parsed, list):
                            print(f"   ✓ Found {len(questions_parsed)} interview questions")
                    except:
                        print("   ⚠️  Could not parse interview questions")
                elif isinstance(questions, list):
                    print(f"   ✓ Found {len(questions)} interview questions")
        
        # Test interview evaluation
        eval_data = {
            "question": "Tell me about yourself",
            "transcript": "I am a passionate software developer with experience in Python and web development. I enjoy solving challenging problems and learning new technologies.",
            "filler_words": 2,
            "speech_speed": "120 WPM"
        }
        success, eval_result = self.run_test("Evaluate Interview", "POST", "interview/evaluate", 200, eval_data)
        if success and isinstance(eval_result, dict):
            evaluation = eval_result.get("evaluation")
            if evaluation:
                print("   ✓ Interview evaluation received")
    
    def test_history_endpoints(self):
        """Test history tracking endpoints"""
        print("\n📚 Testing History Endpoints...")
        
        endpoints = [
            ("Quiz History", "history/quizzes"),
            ("Interview History", "history/interviews"), 
            ("Code History", "history/code")
        ]
        
        for name, endpoint in endpoints:
            success, data = self.run_test(name, "GET", endpoint, 200)
            if success and isinstance(data, list):
                print(f"   ✓ {name}: {len(data)} records")
    
    def test_communication_tips(self):
        """Test communication tips endpoint"""
        print("\n💬 Testing Communication Tips...")
        
        success, tips_data = self.run_test("Get Communication Tips", "POST", "communication/tips", 200)
        if success and isinstance(tips_data, dict):
            tips = tips_data.get("tips")
            if tips:
                print("   ✓ Communication tips received")
    
    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting Elevate AI Backend API Testing...")
        print(f"📍 Testing against: {self.base_url}")
        
        self.test_basic_endpoints()
        self.test_progress_system()
        self.test_code_system()
        self.test_quiz_system()
        self.test_interview_system()
        self.test_history_endpoints()
        self.test_communication_tips()
        
        # Print summary
        print(f"\n📋 Test Summary:")
        print(f"   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Tests Failed: {len(self.failed_tests)}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "   Success Rate: 0%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests Details:")
            for test in self.failed_tests:
                print(f"   • {test['test']}: {test['error']}")
        
        return len(self.failed_tests) == 0

def main():
    tester = ElevateAITester()
    all_passed = tester.run_all_tests()
    
    if all_passed:
        print("\n🎉 All tests passed! Backend API is functioning correctly.")
        return 0
    else:
        print(f"\n⚠️  {len(tester.failed_tests)} test(s) failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())