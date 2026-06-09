import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Code2, Brain, Mic, Zap, ChevronRight, AlertCircle, ArrowRight } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COMPANIES = ["Google", "Amazon", "Microsoft", "Apple", "Meta", "Netflix", "Adobe", "TCS", "Infosys"];

const sections = [
  {
    id: "coding",
    title: "Coding Arena",
    description: "Write, compile, and get AI-powered feedback on your code. Practice DSA problems with real-time evaluation.",
    icon: Code2,
    color: "#00F0FF",
    path: "/coding",
    stats: "codes_submitted",
    gradient: "from-cyan-500/20 to-cyan-500/5",
  },
  {
    id: "aptitude",
    title: "Aptitude Gym",
    description: "Learn from curated video lessons and test yourself with AI-generated quizzes. Track weak areas and improve.",
    icon: Brain,
    color: "#7000FF",
    path: "/aptitude",
    stats: "quizzes_taken",
    gradient: "from-purple-500/20 to-purple-500/5",
  },
  {
    id: "communication",
    title: "Comm Studio",
    description: "Practice professional communication with speech analysis. Take AI mock interviews and get scored.",
    icon: Mic,
    color: "#00FF94",
    path: "/communication",
    stats: "interviews_given",
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
];

export default function Dashboard() {
  const [progress, setProgress] = useState({ xp: 0, level: 1, streak: 0, quizzes_taken: 0, interviews_given: 0, codes_submitted: 0 });

  useEffect(() => {
    axios.get(`${API}/progress`).then(r => setProgress(r.data)).catch(() => { });
  }, []);

  return (
    <div data-testid="dashboard-page" className="relative min-h-[calc(100vh-80px)]">
      {/* Floating company names background */}
      <div className="floating-companies">
        {COMPANIES.map((company, i) => (
          <span key={i} className="floating-company">{company}</span>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - NO STATS */}
        <div className="glass-card p-8 sm:p-12 mb-10 relative overflow-hidden animate-slide-up">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#00F0FF]/8 to-transparent rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#7000FF]/6 to-transparent rounded-full blur-3xl -ml-10 -mb-10" />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 mb-6">
              <Zap className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="text-xs font-accent font-semibold text-[#00F0FF] tracking-widest uppercase">Placement Ready</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4" style={{ fontFamily: 'Outfit' }}>
              Level Up Your{" "}
              <span className="bg-gradient-to-r from-[#00F0FF] to-[#7000FF] bg-clip-text text-transparent">Career Skills</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400 mb-8 max-w-lg mx-auto">
              Code. Think. Speak. Three pillars of placement success. Master them all and land your dream job.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/coding"
                data-testid="start-coding-btn"
                className="px-6 py-2.5 bg-[#00F0FF] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300"
              >
                Start Coding
              </Link>
              <Link
                to="/aptitude"
                data-testid="take-quiz-btn"
                className="px-6 py-2.5 border border-white/20 text-white font-medium text-sm rounded-lg hover:bg-white/5 transition-all"
              >
                Take a Quiz
              </Link>
            </div>
          </div>
        </div>

        {/* Section Cards */}
        <h2 className="text-lg font-semibold text-zinc-400 mb-5 uppercase tracking-wider" style={{ fontFamily: 'Outfit' }}>
          Training Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section, i) => (
            <Link
              key={section.id}
              to={section.path}
              data-testid={`section-${section.id}`}
              className="section-card glass-card p-6 group animate-slide-up"
              style={{ animationDelay: `${0.2 + i * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-5 border border-white/10 group-hover:scale-110 transition-transform`}>
                <section.icon className="w-6 h-6" style={{ color: section.color }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>{section.title}</h3>
              <p className="text-sm text-zinc-400 mb-5 leading-relaxed">{section.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-accent text-sm font-semibold" style={{ color: section.color }}>
                  {progress[section.stats] || 0} completed
                </span>
                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
        {/* Recommendation Cards */}
        <RecommendationCards />
      </div>
    </div>
  );
}

function RecommendationCards() {
  const [recs, setRecs] = useState([]);
  useEffect(() => {
    axios.get(`${API}/recommendations`).then(r => {
      setRecs(r.data.recommendations || []);
    }).catch(() => { });
  }, []);

  if (recs.length === 0) return null;

  const priorityColors = {
    High: { border: "border-[#FF003C]/30", bg: "bg-[#FF003C]/5", text: "text-[#FF003C]" },
    Medium: { border: "border-[#FFD600]/30", bg: "bg-[#FFD600]/5", text: "text-[#FFD600]" },
    Low: { border: "border-[#00FF94]/30", bg: "bg-[#00FF94]/5", text: "text-[#00FF94]" },
  };

  const moduleLinks = {
    coding: "/coding",
    aptitude: "/aptitude",
    communication: "/communication",
    dashboard: "/",
  };

  return (
    <div className="mt-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
      <h2 className="text-lg font-semibold text-zinc-400 mb-4 uppercase tracking-wider" style={{ fontFamily: 'Outfit' }}>
        AI Recommendations
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recs.slice(0, 3).map((rec, i) => {
          const colors = priorityColors[rec.priority] || priorityColors.Low;
          return (
            <Link
              key={i}
              to={moduleLinks[rec.module] || "/"}
              data-testid={`recommendation-${i}`}
              className={`glass-card p-5 border ${colors.border} group hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <AlertCircle className={`w-4 h-4 ${colors.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold truncate">{rec.title}</h4>
                    <span className={`text-[9px] font-accent font-bold px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{rec.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
