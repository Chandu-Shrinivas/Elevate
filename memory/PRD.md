# Elevate AI - PRD

## Original Problem Statement
Build "Elevate AI" - an intelligent placement readiness platform with 3 modules:
1. Coding Arena (DSA problems, code editor, AI compiler, AI evaluation)
2. Aptitude Gym (YouTube video learning, AI quizzes, score tracking)
3. Communication Studio (speech practice, filler detection, AI mock interviews)

## Architecture
- **Frontend**: React 19, Tailwind CSS, shadcn/ui, Monaco Editor, WebSpeech API
- **Backend**: FastAPI, MongoDB (Motor async), Google Generative AI (Gemini 2.5 Flash)
- **Design**: Cyberpunk Neon theme, dark mode, gamified XP system

## What's Been Implemented (Feb 27, 2026)
- [x] Dashboard with floating company names background (Google, Amazon, Microsoft, etc.)
- [x] AI Recommendation Engine with personalized priority cards
- [x] Coding Arena: 20 DSA topics, 3-panel layout (sidebar|question|compiler+terminal), Playground Mode
- [x] Terminal-style code output (Running Code... Input: Output: Status:)
- [x] AI code evaluation with Logic/Optimization/Quality scores (/10)
- [x] Aptitude Gym: 10 topics with real YouTube video embeds, AI-generated MCQ quizzes
- [x] Communication Studio: Speech practice with WPM tracking, filler word detection
- [x] AI Mock Interview with camera+mic access, Clarity/Confidence/Professionalism scores
- [x] Start Practice / Start Again button flow
- [x] Profile page: XP/Level system, streak tracking, quiz/interview/code history tabs
- [x] Gamified XP system across all modules
- [x] Hover behaviors: buttons never disappear, max scale 1.05

## User Personas
- College students preparing for campus placements
- Job seekers practicing coding, aptitude, and communication

## Core Requirements (Static)
- 3 training modules (Coding, Aptitude, Communication)
- AI-powered evaluation and feedback
- Progress tracking with XP/levels
- Terminal-style code output
- Real YouTube educational videos

## Prioritized Backlog
### P0 (Critical)
- [x] All 3 modules functional
- [x] AI integration working
- [x] Progress tracking

### P1 (Important)
- [ ] Clerk authentication integration
- [ ] Judge0 API integration (real code compilation)
- [ ] More DSA questions per topic

### P2 (Nice to Have)
- [ ] Leaderboard system
- [ ] Badge/achievement system
- [ ] Social sharing of results
- [ ] Daily coding challenges
- [ ] Performance analytics dashboard

## Next Tasks
1. Integrate Clerk for authentication
2. Add Judge0 API key for real code compilation
3. Add more questions per DSA topic
4. Add leaderboard and social features
