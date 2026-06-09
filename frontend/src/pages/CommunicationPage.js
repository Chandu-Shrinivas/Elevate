import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Send, Loader2, ArrowLeft, MessageCircle, Volume2, RefreshCw, Camera, CameraOff, ChevronRight, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FALLBACK_INTERVIEW_QUESTIONS } from "@/data/aptitudeData";
import axios from "axios";
import { toast } from "sonner";
import { useDevUser } from "@/hooks/useDevUser";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const FILLER_WORDS = ["um", "uh", "like", "you know", "actually", "basically", "so"];

export default function CommunicationPage() {
  const { user } = useDevUser();
  const [view, setView] = useState("menu");
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [fillerCount, setFillerCount] = useState(0);
  const [fillerDetails, setFillerDetails] = useState({});
  const [wpm, setWpm] = useState(0);
  const [tips, setTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);

  // Interview states
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [interviewTranscripts, setInterviewTranscripts] = useState({});
  const [interviewResults, setInterviewResults] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recordStartRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const accumulatedTranscriptRef = useRef("");

  // Camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      toast.error("Camera access denied");
    }
  }, []);

  // Assign stream to video element whenever camera turns on or ref changes
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOn]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  }, []);

  // Speech Recognition
  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech Recognition not supported. Use Chrome for best results.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = "en-US";

    recordStartRef.current = Date.now();
    accumulatedTranscriptRef.current = transcript ? transcript + " " : "";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscriptChunk = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const tr = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptChunk += tr + " ";
        } else {
          interimTranscript += tr;
        }
      }

      if (finalTranscriptChunk) {
        accumulatedTranscriptRef.current += finalTranscriptChunk;
      }

      const fullString = (accumulatedTranscriptRef.current + interimTranscript).trim();

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        setTranscript(fullString);
        analyzeFillers(fullString);

        const elapsed = (Date.now() - recordStartRef.current) / 60000;
        const words = fullString.split(/\s+/).filter(Boolean).length;
        if (elapsed > 0.05) setWpm(Math.round(words / elapsed));
      }, 500); // Debounce to process every 500ms
    };

    recognition.onerror = () => {
      // In continuous mode, some transient errors occur. Only stop on critical ones.
      // E.g., not ending the stream immediately on 'no-speech'
    };
    recognition.onend = () => {
      if (recognitionRef.current && recording) {
        try { recognition.start(); } catch { }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setRecording(true);
  }, [recording, transcript]);

  const stopRecording = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);
  }, []);

  const analyzeFillers = (text) => {
    const lower = text.toLowerCase();
    let count = 0;
    const details = {};
    FILLER_WORDS.forEach(fw => {
      const regex = new RegExp(`\\b${fw}\\b`, 'gi');
      const matches = lower.match(regex);
      if (matches) {
        count += matches.length;
        details[fw] = matches.length;
      }
    });
    setFillerCount(count);
    setFillerDetails(details);
  };

  const loadTips = async () => {
    setLoadingTips(true);
    try {
      const res = await axios.post(`${API}/communication/tips`);
      let data = res.data.tips;
      if (typeof data === "string") {
        try {
          const cleaned = data.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          data = JSON.parse(cleaned);
        } catch { }
      }
      setTips(data);
    } catch {
      toast.error("Failed to load tips");
    }
    setLoadingTips(false);
  };

  // Interview
  const startInterview = async () => {
    setLoadingQuestions(true);
    setView("interview");
    setCurrentQIndex(0);
    setInterviewTranscripts({});
    setInterviewResults(null);
    setTranscript("");
    setFillerCount(0);
    setWpm(0);

    try {
      const res = await axios.get(`${API}/interview/questions`);
      let qs = res.data.questions;
      if (typeof qs === "string") {
        try {
          const cleaned = qs.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          qs = JSON.parse(cleaned);
        } catch { qs = FALLBACK_INTERVIEW_QUESTIONS; }
      }
      const finalQs = Array.isArray(qs) && qs.length > 0 ? qs : FALLBACK_INTERVIEW_QUESTIONS;
      setInterviewQuestions(finalQs);
    } catch {
      setInterviewQuestions(FALLBACK_INTERVIEW_QUESTIONS);
    }
    setLoadingQuestions(false);
    // Request camera
    startCamera();
  };

  const saveTranscriptAndNext = () => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    stopRecording();
    setInterviewTranscripts(prev => ({ ...prev, [currentQIndex]: transcript }));
    setTranscript("");
    accumulatedTranscriptRef.current = "";
    setFillerCount(0);
    setWpm(0);
    if (currentQIndex < interviewQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const submitInterview = async () => {
    stopRecording();
    const allTranscripts = { ...interviewTranscripts, [currentQIndex]: transcript };
    setEvaluating(true);
    try {
      const results = [];
      for (let i = 0; i < interviewQuestions.length; i++) {
        const t = allTranscripts[i] || "";
        if (t.trim()) {
          const res = await axios.post(`${API}/interview/evaluate`, {
            user_id: user?.id || "default",
            question: interviewQuestions[i],
            transcript: t,
            filler_words: fillerCount,
            speech_speed: `${wpm} WPM`,
          });
          // Parse AI evaluation immediately so it's ready for display
          const rawEval = res.data.evaluation;
          const parsedEval = parseEval(rawEval);
          results.push({ question: interviewQuestions[i], evaluation: parsedEval || rawEval });
        }
      }
      setInterviewResults(results);
      stopCamera();
      await axios.post(`${API}/progress/update`, { action: "interview_complete", xp_earned: 50 });
      toast.success("+50 XP earned!");
    } catch (err) {
      console.error("Interview evaluation error:", err);
      toast.error("Failed to evaluate: " + (err.response?.data?.detail || err.message));
    }
    setEvaluating(false);
  };

  const parseEval = (evalData) => {
    if (!evalData) return null;
    if (typeof evalData === "object" && evalData.clarity_score !== undefined) return evalData;
    if (typeof evalData === "string") {
      try {
        // Strip markdown code fences and any leading/trailing text
        let cleaned = evalData;
        // Remove ```json ... ``` wrapping
        const jsonBlockMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (jsonBlockMatch) {
          cleaned = jsonBlockMatch[1];
        }
        // Try to extract JSON object from the string
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleaned = jsonMatch[0];
        }
        const parsed = JSON.parse(cleaned.trim());
        return typeof parsed === "object" ? parsed : null;
      } catch { return null; }
    }
    return typeof evalData === "object" ? evalData : null;
  };

  const renderTips = (data) => {
    if (!data) return null;
    if (typeof data === "string") return <p className="text-sm text-zinc-300 whitespace-pre-wrap">{data}</p>;
    if (typeof data !== "object") return <p className="text-sm text-zinc-300">{String(data)}</p>;

    // Handle both array and object formats
    if (Array.isArray(data)) {
      return (
        <div className="space-y-3">
          {data.map((tip, i) => (
            <div key={i} className="glass-card p-4">
              {typeof tip === "string" ? (
                <p className="text-sm text-zinc-300">{tip}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-white mb-1">{tip.title}</p>
                  <p className="text-xs text-zinc-400">{tip.description}</p>
                  {tip.practice && <p className="text-xs text-[#00FF94] mt-1">Practice: {tip.practice}</p>}
                </>
              )}
            </div>
          ))}
        </div>
      );
    }
    // Object with tips array
    if (data.tips) return renderTips(data.tips);
    return <pre className="text-xs text-zinc-300 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>;
  };

  // --- MENU ---
  if (view === "menu") {
    return (
      <div data-testid="communication-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <span className="text-xs font-accent font-semibold text-[#00FF94] tracking-widest uppercase">Module 3</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-1" style={{ fontFamily: 'Outfit' }}>Communication Studio</h1>
          <p className="text-zinc-400 mt-2">Practice professional speech, detect filler words, and ace AI mock interviews</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button data-testid="start-practice-btn" onClick={() => { setView("practice"); loadTips(); }} className="section-card glass-card p-8 text-left group">
            <div className="w-14 h-14 rounded-xl bg-[#00FF94]/10 flex items-center justify-center mb-4 border border-white/10">
              <Volume2 className="w-7 h-7 text-[#00FF94]" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Start Practice</h3>
            <p className="text-sm text-zinc-400">Real-time filler word detection, WPM tracking, and communication improvement tips.</p>
          </button>
          <button data-testid="start-interview-btn" onClick={startInterview} className="section-card glass-card p-8 text-left group">
            <div className="w-14 h-14 rounded-xl bg-[#00F0FF]/10 flex items-center justify-center mb-4 border border-white/10">
              <Video className="w-7 h-7 text-[#00F0FF]" />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>AI Mock Interview</h3>
            <p className="text-sm text-zinc-400">Camera + Mic powered interview. Get scored on clarity, confidence, and professionalism.</p>
          </button>
        </div>
      </div>
    );
  }

  // --- PRACTICE ---
  if (view === "practice") {
    return (
      <div data-testid="speech-practice" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button data-testid="practice-back-btn" onClick={() => { setView("menu"); stopRecording(); }} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Outfit' }}>Speech Practice</h2>

        <div className="glass-card p-8 text-center mb-6">
          <button data-testid="record-btn" onClick={recording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${recording ? "bg-[#FF003C]/20 border-2 border-[#FF003C] animate-pulse-glow" : "bg-[#00FF94]/10 border-2 border-[#00FF94] hover:bg-[#00FF94]/20"
              }`}>
            {recording ? <MicOff className="w-8 h-8 text-[#FF003C]" /> : <Mic className="w-8 h-8 text-[#00FF94]" />}
          </button>
          <p className="text-sm text-zinc-400">
            {recording ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF003C] recording-dot" />
                Recording... Click to stop
              </span>
            ) : transcript ? "Click to start again" : "Click to start practice"}
          </p>
          {recording && (
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(12)].map((_, i) => <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />)}
            </div>
          )}
          {/* Live Stats */}
          {(recording || transcript) && (
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="text-center">
                <p className="font-accent text-xl font-bold text-[#00F0FF]">{wpm}</p>
                <p className="text-[10px] text-zinc-500">WPM</p>
              </div>
              <div className="text-center">
                <p className="font-accent text-xl font-bold text-[#FFD600]">{fillerCount}</p>
                <p className="text-[10px] text-zinc-500">Fillers</p>
              </div>
              <div className="text-center">
                <p className="font-accent text-xl font-bold text-[#00FF94]">{transcript.trim().split(/\s+/).filter(Boolean).length}</p>
                <p className="text-[10px] text-zinc-500">Words</p>
              </div>
            </div>
          )}
        </div>

        {transcript && !recording && (
          <div className="flex justify-center mb-5">
            <Button
              data-testid="start-again-btn"
              onClick={() => {
                setTranscript("");
                accumulatedTranscriptRef.current = "";
                setFillerCount(0);
                setFillerDetails({});
                setWpm(0);
              }}
              className="bg-[#00FF94] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#00FF94]/90 hover:shadow-[0_0_15px_rgba(0,255,148,0.3)]"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Start Again
            </Button>
          </div>
        )}

        {transcript && (
          <div className="glass-card p-5 mb-5">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Your Speech</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{transcript}</p>
          </div>
        )}

        {fillerCount > 0 && (
          <div className="glass-card p-5 mb-5 border-[#FFD600]/20" data-testid="filler-analysis">
            <h3 className="text-xs font-semibold text-[#FFD600] uppercase tracking-wider mb-3">Filler Words Detected: {fillerCount}</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(fillerDetails).map(([word, count]) => (
                <span key={word} className="px-3 py-1 rounded-full bg-[#FFD600]/10 border border-[#FFD600]/30 text-[11px] text-[#FFD600] font-medium">
                  &quot;{word}&quot; x{count}
                </span>
              ))}
            </div>
          </div>
        )}

        {loadingTips ? (
          <div className="flex items-center gap-2 text-zinc-400 justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading tips...
          </div>
        ) : tips && (
          <div data-testid="comm-tips">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Communication Tips</h3>
            {renderTips(tips)}
          </div>
        )}
      </div>
    );
  }

  // --- INTERVIEW ---
  return (
    <div data-testid="interview-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button data-testid="interview-back-btn" onClick={() => { setView("menu"); stopRecording(); stopCamera(); }}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {loadingQuestions ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#00F0FF] animate-spin mb-4" />
          <p className="text-zinc-400">Preparing interview questions...</p>
        </div>
      ) : interviewResults ? (
        <div data-testid="interview-results">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Outfit' }}>Interview Results</h2>
          <div className="space-y-5">
            {interviewResults.map((r, i) => {
              // r.evaluation is already parsed in submitInterview, but handle both cases
              const evalData = (typeof r.evaluation === "object" && r.evaluation !== null) ? r.evaluation : parseEval(r.evaluation);
              return (
                <div key={i} className="glass-card p-5 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <p className="text-xs font-medium text-[#00F0FF] mb-3">Q{i + 1}: {r.question}</p>
                  {evalData && (evalData.clarity_score !== undefined || evalData.confidence_score !== undefined) ? (
                    <div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <ScoreCard label="Clarity" score={evalData.clarity_score} color="#00F0FF" />
                        <ScoreCard label="Confidence" score={evalData.confidence_score} color="#7000FF" />
                        <ScoreCard label="Professional" score={evalData.professionalism_score} color="#00FF94" />
                      </div>
                      {evalData.feedback && <p className="text-xs text-zinc-300 mb-2">{evalData.feedback}</p>}
                      {evalData.improvements?.length > 0 && (
                        <ul className="text-xs text-zinc-400 space-y-1 mb-3">
                          {evalData.improvements.map((imp, j) => <li key={j} className="flex items-start gap-1.5"><span className="text-[#00F0FF]">-</span>{imp}</li>)}
                        </ul>
                      )}
                      {evalData.sample_answer && (
                        <div className="p-3 rounded-lg bg-[#00FF94]/5 border border-[#00FF94]/20">
                          <p className="text-[10px] text-[#00FF94] uppercase tracking-wider mb-1 font-semibold">Improved Model Answer</p>
                          <p className="text-xs text-zinc-300 leading-relaxed">{evalData.sample_answer}</p>
                        </div>
                      )}
                      {evalData.filler_analysis && (
                        <div className="mt-3 p-3 rounded-lg bg-[#FFD600]/5 border border-[#FFD600]/20">
                          <p className="text-[10px] text-[#FFD600] uppercase tracking-wider mb-1 font-semibold">Filler Analysis</p>
                          <p className="text-xs text-zinc-300 leading-relaxed">{evalData.filler_analysis}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-300 whitespace-pre-wrap">{r.evaluation ? (typeof r.evaluation === "string" ? r.evaluation : JSON.stringify(r.evaluation, null, 2)) : "No evaluation"}</div>
                  )}
                </div>
              );
            })}
          </div>
          <Button data-testid="retry-interview-btn" onClick={startInterview} className="mt-6 bg-[#00F0FF] text-black font-bold uppercase tracking-wider">
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      ) : interviewQuestions.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>AI Mock Interview</h2>
            <span className="font-accent text-sm text-zinc-400">{currentQIndex + 1} / {interviewQuestions.length}</span>
          </div>

          <div className="flex gap-1 mb-5">
            {interviewQuestions.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i < currentQIndex ? "bg-[#00FF94]" : i === currentQIndex ? "bg-[#00F0FF]" : "bg-zinc-800"}`} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Camera */}
            <div className="lg:col-span-1">
              <div className="camera-preview aspect-video bg-zinc-900 relative">
                {cameraOn ? (
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <CameraOff className="w-8 h-8 text-zinc-600 mb-2" />
                    <p className="text-xs text-zinc-600">Camera off</p>
                  </div>
                )}
                <button
                  data-testid="toggle-camera-btn"
                  onClick={cameraOn ? stopCamera : startCamera}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 border border-white/10 text-xs"
                >
                  {cameraOn ? <CameraOff className="w-3.5 h-3.5 text-zinc-400" /> : <Camera className="w-3.5 h-3.5 text-zinc-400" />}
                </button>
              </div>
              {/* Live stats */}
              <div className="flex items-center justify-between mt-3 px-1">
                <div className="text-center">
                  <p className="font-accent text-base font-bold text-[#00F0FF]">{wpm}</p>
                  <p className="text-[9px] text-zinc-500">WPM</p>
                </div>
                <div className="text-center">
                  <p className="font-accent text-base font-bold text-[#FFD600]">{fillerCount}</p>
                  <p className="text-[9px] text-zinc-500">Fillers</p>
                </div>
                <div className="text-center">
                  <p className="font-accent text-base font-bold text-[#00FF94]">{transcript.trim().split(/\s+/).filter(Boolean).length}</p>
                  <p className="text-[9px] text-zinc-500">Words</p>
                </div>
              </div>
            </div>

            {/* Question + Response */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="glass-card p-5">
                <p className="text-[10px] text-[#00F0FF] uppercase tracking-wider mb-2 font-semibold">Question {currentQIndex + 1}</p>
                <p className="text-base font-medium">{interviewQuestions[currentQIndex]}</p>
              </div>

              <div className="glass-card p-5 text-center">
                <button data-testid="interview-record-btn" onClick={recording ? stopRecording : startRecording}
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2 transition-all ${recording ? "bg-[#FF003C]/20 border-2 border-[#FF003C] animate-pulse-glow" : "bg-[#00F0FF]/10 border-2 border-[#00F0FF] hover:bg-[#00F0FF]/20"
                    }`}>
                  {recording ? <MicOff className="w-5 h-5 text-[#FF003C]" /> : <Mic className="w-5 h-5 text-[#00F0FF]" />}
                </button>
                <p className="text-[10px] text-zinc-500">{recording ? "Recording... Tap to stop" : "Tap to speak"}</p>
                {recording && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[...Array(8)].map((_, i) => <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.12}s` }} />)}
                  </div>
                )}
              </div>

              {transcript && (
                <div className="glass-card p-4">
                  <p className="text-[10px] text-zinc-500 mb-1">Your Answer:</p>
                  <p className="text-xs text-zinc-300">{transcript}</p>
                </div>
              )}

              <div>
                <p className="text-[10px] text-zinc-500 mb-1.5">Or type your answer:</p>
                <Textarea data-testid="interview-text-input" value={transcript}
                  onChange={e => { setTranscript(e.target.value); analyzeFillers(e.target.value); }}
                  placeholder="Type your response..." className="bg-black/50 border-white/10 text-xs" rows={3} />
              </div>

              <div className="flex gap-3">
                {currentQIndex < interviewQuestions.length - 1 ? (
                  <Button data-testid="next-question-btn" onClick={saveTranscriptAndNext}
                    className="bg-[#00F0FF] text-black font-bold uppercase tracking-wider text-xs hover:bg-[#00F0FF]/90 hover:text-black opacity-100 hover:opacity-100 transition-none z-10 w-full md:w-auto relative" style={{ display: 'inline-flex', visibility: 'visible' }}>
                    Next Question <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button data-testid="finish-interview-btn" onClick={submitInterview} disabled={evaluating}
                    className="bg-[#00FF94] text-black font-bold uppercase tracking-wider text-xs hover:bg-[#00FF94]/90 hover:text-black opacity-100 transition-none z-10 w-full md:w-auto relative" style={{ display: 'inline-flex', visibility: 'visible' }}>
                    {evaluating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Submit Interview
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ScoreCard({ label, score, color }) {
  return (
    <div className="text-center p-2.5 rounded-xl bg-black/40 border border-white/5">
      <p className="font-accent text-xl font-bold" style={{ color }}>{score || "-"}</p>
      <p className="text-[9px] text-zinc-600">/10</p>
      <p className="text-[10px] text-zinc-500">{label}</p>
    </div>
  );
}
