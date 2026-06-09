import { useState, useEffect } from "react";
import { Trophy, Flame, Target, TrendingUp, Code2, Brain, Mic, Clock, Award, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProfilePage() {
  const [progress, setProgress] = useState({ xp: 0, level: 1, streak: 0, quizzes_taken: 0, interviews_given: 0, codes_submitted: 0 });
  const [quizHistory, setQuizHistory] = useState([]);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [codeHistory, setCodeHistory] = useState([]);

  useEffect(() => {
    axios.get(`${API}/progress`).then(r => setProgress(r.data)).catch(() => { });
    axios.get(`${API}/history/quizzes`).then(r => setQuizHistory(r.data)).catch(() => { });
    axios.get(`${API}/history/interviews`).then(r => setInterviewHistory(r.data)).catch(() => { });
    axios.get(`${API}/history/code`).then(r => setCodeHistory(r.data)).catch(() => { });
  }, []);

  const xpInLevel = progress.xp % 500;
  const xpPercent = (xpInLevel / 500) * 100;
  const xpToNext = 500 - xpInLevel;

  return (
    <div data-testid="profile-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="glass-card p-8 mb-8 relative overflow-hidden animate-slide-up">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#7000FF]/10 to-transparent rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#7000FF] flex items-center justify-center text-3xl font-bold text-black font-accent">
            {progress.level}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Outfit' }}>Your Profile</h1>
            <p className="text-zinc-400 text-sm mt-1">Level {progress.level} Placement Warrior</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-500">{progress.xp} XP</span>
                  <span className="text-zinc-500">{xpToNext} XP to Level {progress.level + 1}</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full">
                  <div className="xp-bar h-full" style={{ width: `${xpPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <StatBlock icon={Flame} value={progress.streak} label="Day Streak" color="text-orange-400" />
            <StatBlock icon={Trophy} value={progress.xp} label="Total XP" color="text-[#FFD600]" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Code2} value={progress.codes_submitted} label="Code Submissions" color="#00F0FF" />
        <StatCard icon={Brain} value={progress.quizzes_taken} label="Quizzes Taken" color="#7000FF" />
        <StatCard icon={Mic} value={progress.interviews_given} label="Mock Interviews" color="#00FF94" />
        <StatCard icon={Award} value={progress.level} label="Current Level" color="#FFD600" />
      </div>

      {/* Readiness Overview */}
      <div className="glass-card p-6 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-base font-semibold mb-4" style={{ fontFamily: 'Outfit' }}>Placement Readiness</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReadinessBar label="Coding" value={Math.min(100, progress.codes_submitted * 15)} color="#00F0FF" />
          <ReadinessBar label="Aptitude" value={Math.min(100, progress.quizzes_taken * 12)} color="#7000FF" />
          <ReadinessBar label="Communication" value={Math.min(100, progress.interviews_given * 20)} color="#00FF94" />
        </div>
      </div>

      {/* History Tabs */}
      <Tabs defaultValue="quizzes" className="w-full">
        <TabsList className="bg-zinc-900/50 border border-white/5 p-1 mb-6" data-testid="history-tabs">
          <TabsTrigger value="quizzes" data-testid="tab-quizzes" className="data-[state=active]:bg-[#7000FF]/20 data-[state=active]:text-[#7000FF]">
            <Brain className="w-4 h-4 mr-2" /> Quizzes ({quizHistory.length})
          </TabsTrigger>
          <TabsTrigger value="interviews" data-testid="tab-interviews" className="data-[state=active]:bg-[#00FF94]/20 data-[state=active]:text-[#00FF94]">
            <Mic className="w-4 h-4 mr-2" /> Interviews ({interviewHistory.length})
          </TabsTrigger>
          <TabsTrigger value="code" data-testid="tab-code" className="data-[state=active]:bg-[#00F0FF]/20 data-[state=active]:text-[#00F0FF]">
            <Code2 className="w-4 h-4 mr-2" /> Code ({codeHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes">
          {quizHistory.length === 0 ? (
            <EmptyState text="No quiz attempts yet. Head to the Aptitude Gym!" />
          ) : (
            <div className="space-y-3">
              {quizHistory.map((q, i) => (
                <div key={i} className="glass-card p-4 flex items-center justify-between" data-testid={`quiz-history-${i}`}>
                  <div>
                    <p className="text-sm font-medium">{q.topic}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {new Date(q.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-accent text-lg font-bold text-[#7000FF]">{q.score}/{q.total}</p>
                    <p className="text-xs text-zinc-500">{q.total > 0 ? ((q.score / q.total) * 100).toFixed(0) : 0}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="interviews">
          {interviewHistory.length === 0 ? (
            <EmptyState text="No interviews yet. Try the AI Mock Interview!" />
          ) : (
            <div className="space-y-3">
              {interviewHistory.map((iv, i) => (
                <div key={i} className="glass-card p-4" data-testid={`interview-history-${i}`}>
                  <p className="text-sm font-medium text-[#00F0FF] mb-1">{iv.question}</p>
                  <p className="text-xs text-zinc-400 line-clamp-2">{iv.transcript?.slice(0, 100)}...</p>
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(iv.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="code">
          {codeHistory.length === 0 ? (
            <EmptyState text="No code submissions yet. Visit the Coding Arena!" />
          ) : (
            <div className="space-y-3">
              {codeHistory.map((c, i) => (
                <div key={i} className="glass-card p-4" data-testid={`code-history-${i}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{c.language} - {c.problem?.slice(0, 50) || "Code Submission"}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(c.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <pre className="text-xs text-zinc-400 font-mono line-clamp-3 bg-black/30 p-2 rounded">{c.code?.slice(0, 150)}</pre>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatBlock({ icon: Icon, value, label, color }) {
  return (
    <div className="text-center">
      <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
      <p className="font-accent text-xl font-bold">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="glass-card p-4 text-center animate-slide-up" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <Icon className="w-6 h-6 mx-auto mb-2" style={{ color }} />
      <p className="font-accent text-2xl font-bold">{value}</p>
      <p className="text-xs text-zinc-500 mt-1">{label}</p>
    </div>
  );
}

function ReadinessBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-zinc-400">{label}</span>
        <span className="font-accent font-semibold" style={{ color }}>{value}%</span>
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded-full">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="text-center py-12">
      <BarChart3 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
      <p className="text-sm text-zinc-500">{text}</p>
    </div>
  );
}
