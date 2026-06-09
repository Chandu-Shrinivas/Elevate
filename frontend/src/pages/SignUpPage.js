import { SignUp } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import {
    Zap, Brain, BookOpen, Mic, BarChart2, Sparkles, ArrowRight
} from "lucide-react";
import { isDevMode } from "@/utils/devMode";

const benefits = [
    {
        icon: Brain,
        title: "AI Coding Evaluation",
        desc: "Submit code and get instant AI feedback with hints.",
        color: "#00F0FF",
        glow: "rgba(0, 240, 255, 0.15)",
    },
    {
        icon: BookOpen,
        title: "Aptitude Practice",
        desc: "Adaptive quizzes tailored to your weak areas.",
        color: "#7000FF",
        glow: "rgba(112, 0, 255, 0.15)",
    },
    {
        icon: Mic,
        title: "Mock Interviews",
        desc: "Practice speaking with AI-powered speech analysis.",
        color: "#00FF94",
        glow: "rgba(0, 255, 148, 0.15)",
    },
    {
        icon: BarChart2,
        title: "Analytics Dashboard",
        desc: "Track all your progress in one beautiful dashboard.",
        color: "#FFD600",
        glow: "rgba(255, 214, 0, 0.15)",
    },
];

export default function SignUpPage() {
    return (
        <div
            className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden"
            style={{ background: "#050505" }}
        >
            {/* ── Demo Mode Banner ── */}
            {isDevMode && (
                <div
                    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-2 text-sm font-semibold"
                    style={{
                        background: "linear-gradient(90deg, #FFD600 0%, #FF8C00 100%)",
                        color: "#0A0A0A",
                    }}
                >
                    <Zap className="w-4 h-4" />
                    Running in Demo Mode — Clerk key not configured. Authentication is disabled.
                </div>
            )}

            {/* ── Global Background FX ── */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(112,0,255,0.18) 0%, transparent 70%)",
                        filter: "blur(80px)",
                    }}
                />
                <div
                    className="absolute -bottom-32 -left-24 w-[500px] h-[500px] rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(0,240,255,0.15) 0%, transparent 70%)",
                        filter: "blur(80px)",
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }}
                />
            </div>

            {/* ════════════════════════════════════════
                LEFT — AUTH SECTION
            ════════════════════════════════════════ */}
            <div
                className={`relative z-10 flex flex-col items-center justify-center
                    w-full lg:w-1/2 xl:w-[45%] px-6 py-12 lg:min-h-screen
                    order-2 lg:order-1 lg:border-r border-white/[0.04]`}
            >
                <div className="animate-fade-left animate-delay-200 w-full max-w-[420px] relative">
                    {/* Glow ring */}
                    <div
                        className="absolute -inset-1 rounded-2xl opacity-40 blur-xl pointer-events-none"
                        style={{
                            background: "linear-gradient(135deg, rgba(112,0,255,0.2), rgba(0,240,255,0.2))",
                        }}
                    />

                    {/* Card */}
                    <div
                        className="relative rounded-2xl overflow-hidden"
                        style={{
                            background: "rgba(8, 8, 8, 0.85)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
                        }}
                    >
                        {/* Top gradient bar */}
                        <div
                            className="h-[2px] w-full"
                            style={{ background: "linear-gradient(90deg, #7000FF, #00F0FF, #00FF94)" }}
                        />

                        <div className="px-6 pt-6 pb-2">
                            <p className="text-center text-[13px] text-zinc-400 flex items-center justify-center gap-1.5 mb-1">
                                <ArrowRight className="w-3.5 h-3.5 text-[#7000FF]" />
                                Create your free account and start your journey.
                            </p>
                        </div>

                        {/* Clerk SignUp — hash routing avoids React Router conflicts */}
                        <SignUp
                            routing="hash"
                            signInUrl="/sign-in"
                            forceRedirectUrl="/"
                            appearance={{
                                baseTheme: dark,
                                variables: {
                                    colorPrimary: "#7000FF",
                                    colorBackground: "rgba(8, 8, 8, 0)",
                                    colorText: "#ffffff",
                                    colorInputBackground: "rgba(255, 255, 255, 0.04)",
                                    colorInputText: "#ffffff",
                                    colorDanger: "#FF003C",
                                    colorSuccess: "#00FF94",
                                    fontFamily: "Manrope, sans-serif",
                                    borderRadius: "0.875rem",
                                },
                                elements: {
                                    card: "bg-transparent shadow-none border-none",
                                    cardBox: "shadow-none border-none",
                                    formButtonPrimary: "font-semibold text-white transition-all hover:opacity-90 hover:scale-[1.01]",
                                    footerActionLink: "text-[#00F0FF] hover:opacity-80",
                                    headerTitle: "font-bold text-xl tracking-tight",
                                    headerSubtitle: "text-zinc-400 text-sm",
                                    socialButtonsBlockButton: "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white transition-all",
                                    dividerText: "text-zinc-600",
                                    dividerLine: "bg-white/10",
                                    formFieldInput: "bg-white/[0.04] border-white/10 focus:border-[#7000FF]/50 focus:ring-1 focus:ring-[#7000FF]/30 text-white",
                                    formFieldLabel: "text-zinc-300 text-sm",
                                },
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="animate-fade-left animate-delay-400 mt-6 flex items-center gap-2">
                    <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#00FF94", boxShadow: "0 0 6px #00FF94" }}
                    />
                    <p className="text-[11px] text-zinc-600">
                        Secured by <span className="text-zinc-400 font-medium">Clerk</span> · End-to-end encrypted
                    </p>
                </div>
            </div>

            {/* ════════════════════════════════════════
                RIGHT — HERO SECTION
            ════════════════════════════════════════ */}
            <div
                className={`relative z-10 flex flex-col justify-center px-8 py-12 lg:px-16 lg:py-0
                    w-full lg:w-1/2 xl:w-[55%] lg:min-h-screen
                    order-1 lg:order-2
                    ${isDevMode ? "mt-10 lg:mt-0" : ""}`}
            >
                {/* Logo */}
                <div className="animate-fade-right animate-delay-100 flex items-center gap-3 mb-10">
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                            background: "linear-gradient(135deg, #7000FF, #00F0FF)",
                            boxShadow: "0 0 24px rgba(112,0,255,0.4)",
                        }}
                    >
                        <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                        <span className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                            Elevate <span className="gradient-text">AI</span>
                        </span>
                        <p className="text-[11px] text-zinc-500 -mt-0.5 tracking-wide">
                            Train smarter. Crack placements faster.
                        </p>
                    </div>
                </div>

                {/* Headline */}
                <div className="animate-fade-right animate-delay-200 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-[#FFD600]" />
                        <span className="text-xs font-semibold text-zinc-400 tracking-widest uppercase">Join for free</span>
                    </div>
                    <h1
                        className="text-4xl xl:text-5xl font-bold leading-tight text-white mb-4"
                        style={{ fontFamily: "Outfit, sans-serif", letterSpacing: "-0.025em" }}
                    >
                        Start Your
                        <br />
                        <span className="shimmer-text">Placement Journey</span>
                        <br />
                        Today
                    </h1>
                    <p className="text-zinc-400 text-base xl:text-lg leading-relaxed max-w-md">
                        Join thousands of students using AI-powered tools to ace technical interviews
                        and get placed at top companies.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="animate-fade-right animate-delay-300 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mb-8">
                    {benefits.map((b) => {
                        const Icon = b.icon;
                        return (
                            <div
                                key={b.title}
                                className="feature-card flex items-start gap-3 p-4 rounded-xl border border-white/[0.06]"
                                style={{ background: "rgba(255,255,255,0.02)" }}
                            >
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: b.glow, border: `1px solid ${b.color}30` }}
                                >
                                    <Icon className="w-4 h-4" style={{ color: b.color }} strokeWidth={2} />
                                </div>
                                <div>
                                    <div className="text-[13px] font-semibold text-white mb-0.5">{b.title}</div>
                                    <div className="text-[11px] text-zinc-500 leading-relaxed">{b.desc}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Free plan CTA */}
                <div
                    className="animate-fade-right animate-delay-400 flex items-center gap-3 p-4 rounded-xl border border-white/[0.06]"
                    style={{ background: "rgba(0,255,148,0.03)" }}
                >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(0,255,148,0.12)" }}>
                        <Sparkles className="w-4 h-4 text-[#00FF94]" />
                    </div>
                    <p className="text-[12px] text-zinc-400">
                        <span className="text-white font-semibold">Free forever plan</span> — get started
                        instantly with no credit card required.
                    </p>
                </div>
            </div>

            {/* ── Floating particles ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full animate-float"
                        style={{
                            width: `${2 + i * 1.5}px`, height: `${2 + i * 1.5}px`,
                            background: i % 3 === 0 ? "#7000FF" : i % 3 === 1 ? "#00F0FF" : "#00FF94",
                            opacity: 0.2,
                            left: `${8 + i * 11}%`, top: `${15 + (i % 4) * 20}%`,
                            animationDelay: `${i * 0.6}s`, animationDuration: `${4 + i * 0.5}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
