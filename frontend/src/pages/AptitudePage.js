import { useState } from "react";
import { Brain, Play, CheckCircle2, XCircle, Loader2, ChevronRight, ArrowLeft, BookOpen, Calculator, BarChart3, Clock, Shuffle, Dices, Route, Percent, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { aptitudeTopics } from "@/data/aptitudeData";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useDevUser } from "@/hooks/useDevUser";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const iconMap = { Calculator, Brain, BookOpen, BarChart3, Clock, Shuffle, Dices, Route, Percent, Scale };

export default function AptitudePage() {
  const navigate = useNavigate();
  const { user } = useDevUser();
  const [view, setView] = useState("topics");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [activeQuizTopic, setActiveQuizTopic] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState([]);

  const selectTopic = (topic) => {
    setSelectedTopic(topic);
    setSelectedVideo(topic.videos[0]);
    setView("learn");
    setSubmitted(false);
    setAnswers({});
    setQuizResult(null);
  };

  const startQuiz = async (quizTopic) => {
    setLoading(true);
    setActiveQuizTopic(quizTopic);
    setView("quiz");
    setSubmitted(false);
    setAnswers({});
    setQuizResult(null);
    try {
      const res = await axios.get(`${API}/quiz/${encodeURIComponent(quizTopic)}`);
      let qs = res.data.questions;
      if (typeof qs === "string") {
        try {
          let cleaned = qs;
          const jsonBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i);
          if (jsonBlockMatch) cleaned = jsonBlockMatch[1];
          const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
          if (jsonMatch) cleaned = jsonMatch[0];
          qs = JSON.parse(cleaned.trim());
        } catch { qs = []; }
      }
      setParsedQuestions(Array.isArray(qs) ? qs : []);
    } catch {
      toast.error("Failed to generate quiz");
      setParsedQuestions([]);
    }
    setLoading(false);
  };

  const submitQuiz = async () => {
    let score = 0;
    parsedQuestions.forEach((q, i) => {
      if (answers[i] === q.correct) score++;
    });
    setSubmitted(true);
    try {
      const res = await axios.post(`${API}/quiz/submit`, {
        user_id: user?.id || "default",
        topic: activeQuizTopic || selectedTopic?.title || "General",
        answers: { ...answers, score: score }, // Changed 'earnedScore' to 'score' to match local variable
        total_questions: parsedQuestions.length // Changed 'selectedTopic?.questions?.length || 10' to 'parsedQuestions.length' to match local variable
      });
      setQuizResult(res.data);
      await axios.post(`${API}/progress/update`, { action: "quiz_complete", xp_earned: score * 10 });
      toast.success(`+${score * 10} XP earned!`);
    } catch {
      toast.error("Failed to submit quiz");
    }
  };

  const goBack = () => {
    if (view === "quiz") setView("learn");
    else { setView("topics"); setSelectedTopic(null); }
  };

  const renderAnalysis = (analysis) => {
    if (!analysis) return null;
    let data = analysis;
    if (typeof data === "string") {
      try {
        let cleaned = data;
        const jsonBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i);
        if (jsonBlockMatch) cleaned = jsonBlockMatch[1];
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) cleaned = jsonMatch[0];
        data = JSON.parse(cleaned.trim());
      } catch (err) {
        return <p className="text-sm text-zinc-300 whitespace-pre-wrap">{data}</p>;
      }
    }
    if (typeof data !== "object") return <p className="text-sm text-zinc-300">{String(data)}</p>;

    return (
      <div className="space-y-4">
        {data.readiness_score !== undefined && (
          <div className="text-center mb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Readiness Score</p>
            <p className="font-accent text-5xl font-bold text-[#00F0FF]">{data.readiness_score}</p>
            <p className="text-xs text-zinc-500">/100</p>
          </div>
        )}
        {data.practice_intensity && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Practice Intensity:</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${data.practice_intensity === "High" ? "bg-[#FF003C]/10 text-[#FF003C]" :
              data.practice_intensity === "Medium" ? "bg-[#FFD600]/10 text-[#FFD600]" :
                "bg-[#00FF94]/10 text-[#00FF94]"
              }`}>{data.practice_intensity}</span>
          </div>
        )}
        {data.weak_concepts?.length > 0 && (
          <div>
            <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Weak Areas</h4>
            <div className="flex flex-wrap gap-2">
              {data.weak_concepts.map((c, i) => (
                <span key={i} className="px-2 py-1 rounded-lg bg-[#FF003C]/10 border border-[#FF003C]/20 text-xs text-[#FF003C]">{c}</span>
              ))}
            </div>
          </div>
        )}
        {data.topics_to_revise?.length > 0 && (
          <div>
            <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Topics to Revise</h4>
            <ul className="space-y-1">
              {data.topics_to_revise.map((t, i) => (
                <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                  <span className="text-[#00F0FF]">-</span>{t}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.next_topic && (
          <div className="p-3 rounded-lg bg-[#00FF94]/5 border border-[#00FF94]/20">
            <p className="text-xs text-[#00FF94] uppercase tracking-wider mb-1">Next Suggested Topic</p>
            <p className="text-sm font-medium text-white">{data.next_topic}</p>
          </div>
        )}
      </div>
    );
  };

  // --- TOPICS VIEW ---
  if (view === "topics") {
    return (
      <div data-testid="aptitude-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <span className="text-xs font-accent font-semibold text-[#7000FF] tracking-widest uppercase">Module 2</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-1" style={{ fontFamily: 'Outfit' }}>Aptitude Gym</h1>
          <p className="text-zinc-400 mt-2">Master quantitative, logical, verbal reasoning and data interpretation</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {aptitudeTopics.map((topic, i) => {
            const Icon = iconMap[topic.icon] || Brain;
            return (
              <button
                key={topic.id}
                data-testid={`topic-${topic.id}`}
                onClick={() => selectTopic(topic)}
                className="section-card glass-card p-5 text-left group animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0" style={{ background: `${topic.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: topic.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold mb-1" style={{ fontFamily: 'Outfit' }}>{topic.title}</h3>
                    <p className="text-xs text-zinc-400 mb-2">{topic.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                      <span>{topic.videos.length} Videos</span>
                      <span>{topic.quizTopics.length} Quiz Topics</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- LEARN VIEW ---
  if (view === "learn") {
    return (
      <div data-testid="aptitude-learn" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button data-testid="back-btn" onClick={goBack} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Topics
        </button>
        <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Outfit', color: selectedTopic.color }}>{selectedTopic.title}</h2>

        {selectedVideo && (
          <div className="mb-8">
            <div className="video-embed mb-3" data-testid="video-player">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h3 className="text-base font-semibold">{selectedVideo.title}</h3>
            <p className="text-xs text-zinc-500">{selectedVideo.channel} - {selectedVideo.duration}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {selectedTopic.videos.map((vid, i) => (
            <button
              key={i}
              data-testid={`video-${i}`}
              onClick={() => setSelectedVideo(vid)}
              className={`glass-card p-3 text-left flex items-center gap-3 transition-all ${selectedVideo === vid ? "border-[#7000FF]/50 neon-purple" : "hover:border-white/20"
                }`}
            >
              <div className="w-9 h-9 rounded-lg bg-[#7000FF]/20 flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-[#7000FF]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{vid.title}</p>
                <p className="text-[10px] text-zinc-500">{vid.channel} - {vid.duration}</p>
              </div>
            </button>
          ))}
        </div>

        <h3 className="text-base font-semibold mb-3" style={{ fontFamily: 'Outfit' }}>Take a Quiz</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {selectedTopic.quizTopics.map((qt, i) => (
            <Button key={i} data-testid={`quiz-topic-${i}`} onClick={() => startQuiz(qt)} variant="outline" size="sm"
              className="border-white/10 text-zinc-300 hover:border-[#7000FF]/50 hover:bg-[#7000FF]/10 hover:text-white text-xs">
              {qt}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // --- QUIZ VIEW ---
  return (
    <div data-testid="aptitude-quiz" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button data-testid="quiz-back-btn" onClick={goBack} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Learning
      </button>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#7000FF] animate-spin mb-4" />
          <p className="text-zinc-400 text-sm">Generating quiz questions with AI...</p>
        </div>
      ) : parsedQuestions.length > 0 ? (
        <div>
          <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Outfit' }}>
            Quiz: {parsedQuestions.length} Questions
          </h2>
          <div className="space-y-5">
            {parsedQuestions.map((q, qi) => (
              <div key={qi} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${qi * 0.03}s` }}>
                <p className="text-sm font-medium mb-3">
                  <span className="font-accent text-[#00F0FF] mr-2">Q{qi + 1}.</span>
                  {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options?.map((opt, oi) => {
                    let cls = "quiz-option";
                    if (submitted) {
                      if (oi === q.correct) cls += " correct";
                      else if (answers[qi] === oi) cls += " wrong";
                    } else if (answers[qi] === oi) {
                      cls += " selected";
                    }
                    return (
                      <button key={oi} data-testid={`q${qi}-opt${oi}`}
                        onClick={() => !submitted && setAnswers(prev => ({ ...prev, [qi]: oi }))}
                        disabled={submitted}
                        className={`${cls} p-2.5 rounded-xl border border-white/10 text-xs text-left`}>
                        <span className="font-accent text-zinc-500 mr-1.5">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <p className="mt-2 text-[11px] text-zinc-400 border-t border-white/5 pt-2">
                    {answers[qi] === q.correct
                      ? <CheckCircle2 className="w-3 h-3 text-[#00FF94] inline mr-1" />
                      : <XCircle className="w-3 h-3 text-[#FF003C] inline mr-1" />
                    }
                    {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!submitted ? (
            <Button data-testid="submit-quiz-btn" onClick={submitQuiz}
              disabled={Object.keys(answers).length < parsedQuestions.length}
              className="mt-5 bg-[#7000FF] text-white font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] disabled:opacity-50 w-full sm:w-auto px-8">
              Submit Quiz
            </Button>
          ) : (
            <div className="mt-6 glass-card p-6" data-testid="quiz-result">
              <div className="flex items-center gap-4 mb-4">
                <div className="font-accent text-4xl font-bold text-[#00F0FF]">
                  {quizResult?.score ?? 0}/{quizResult?.total ?? parsedQuestions.length}
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ fontFamily: 'Outfit' }}>Quiz Complete</p>
                  <p className="text-xs text-zinc-400">
                    {((quizResult?.score / parsedQuestions.length) * 100).toFixed(0)}% accuracy
                  </p>
                </div>
              </div>
              {quizResult?.analysis && renderAnalysis(quizResult.analysis)}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button onClick={() => navigate('/analytics')} className="bg-[#00F0FF] text-black font-bold uppercase tracking-wider hover:bg-white w-full sm:w-auto px-8 transition-colors">
                  Save Progress
                </Button>
                <Button variant="outline" onClick={() => startQuiz(activeQuizTopic || selectedTopic?.quizTopics?.[0])} className="border-white/20 text-white w-full sm:w-auto px-8">
                  Retake Quiz
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">Generating questions... Please wait.</p>
          <Button onClick={() => startQuiz(selectedTopic?.quizTopics?.[0] || "General")} className="mt-4" variant="outline" size="sm">
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
