import { useState, useEffect } from "react";
import { User, Mail, Calendar, Target, Activity, Code2, Brain, Mic, Trophy, AlertTriangle } from "lucide-react";
import axios from "axios";
import { useDevUser } from "@/hooks/useDevUser"; // Dev-safe user hook
import ContributionHeatmap from "@/components/custom/ContributionHeatmap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProfileAnalyticsPage() {
    const { user, isLoaded } = useDevUser();
    const [profile, setProfile] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [graphFilter, setGraphFilter] = useState("all");

    useEffect(() => {
        if (!isLoaded || !user) return; // Wait until clerk user is fully loaded

        // For now, mapping Clerk User ID to backend. If no Clerk, fallback to "default".
        const userId = user.id || "default";

        Promise.all([
            axios.get(`${API}/user/profile/${userId}`),
            axios.get(`${API}/analytics/${userId}`)
        ])
            .then(([profileRes, analyticsRes]) => {
                // Hydrate missing user metadata onto the backend response profile using Clerk data
                const enrichedProfile = {
                    ...profileRes.data,
                    name: user.fullName || profileRes.data.name,
                    email: user.primaryEmailAddress?.emailAddress || profileRes.data.email,
                    joinedAt: user.createdAt ? new Date(user.createdAt).toISOString() : profileRes.data.joinedAt
                };
                setProfile(enrichedProfile);
                setAnalytics(analyticsRes.data);
            })
            .catch(err => console.error("Error fetching analytics:", err))
            .finally(() => setLoading(false));

    }, [isLoaded, user]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                <Activity className="w-8 h-8 text-[#00F0FF] animate-spin" />
            </div>
        );
    }

    return (
        <div data-testid="profile-analytics-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* HEADER SECTION: User Profile overview */}
            <div className="glass-card p-6 relative overflow-hidden animate-slide-up">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#00F0FF]/10 to-transparent rounded-full blur-3xl -mr-10 -mt-10" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#7000FF] flex items-center justify-center shadow-lg">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h1 className="text-3xl font-bold font-accent text-white">{profile?.name || "Anonymous User"}</h1>
                        <div className="flex items-center gap-4 text-sm text-zinc-400">
                            <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {profile?.email || "No Email Provided"}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined: {new Date(profile?.joinedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4 text-center">
                        <p className="text-sm text-zinc-400 font-semibold mb-1 uppercase tracking-wider">Overall Skill Score</p>
                        <p className="text-3xl font-accent font-bold text-[#00FF94]">{profile?.overallSkillScore}<span className="text-lg text-zinc-500">/100</span></p>
                    </div>
                </div>

                {/* Activity Counters */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/5">
                    <StatBox icon={Code2} label="Coding Attempts" value={profile?.totalCodingAttempts} color="#00F0FF" />
                    <StatBox icon={Brain} label="Aptitude Attempts" value={profile?.totalAptitudeAttempts} color="#7000FF" />
                    <StatBox icon={Mic} label="Interview Attempts" value={profile?.totalInterviewAttempts} color="#00FF94" />
                </div>
            </div>

            {/* HEATMAP SECTION */}
            <ContributionHeatmap userId={user?.id || "default"} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Skill Gap Engine & Analytics Dashboard */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Skill Gap Detection Engine Banner */}
                    {analytics?.weakestSkill && (
                        <div className="bg-gradient-to-r from-[#FF003C]/10 to-[#FFD600]/10 border border-[#FF003C]/20 rounded-xl p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#FF003C]/20 rounded-lg shrink-0">
                                    <AlertTriangle className="w-6 h-6 text-[#FF003C]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                                        Skill Gap Detected: <span className="text-[#FFD600] capitalize">{analytics.weakestSkill}</span>
                                    </h3>
                                    <p className="text-sm text-zinc-300 leading-relaxed">
                                        {analytics.recommendation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Unified Analytics Dashboard Visualization */}
                    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-lg font-bold font-accent mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-[#00F0FF]" /> Module Averages
                        </h3>

                        <div className="space-y-6">
                            <ProgressBar label="Coding Average" value={analytics?.codingAverage} color="#00F0FF" />
                            <ProgressBar label="Aptitude Average" value={analytics?.aptitudeAverage} color="#7000FF" />
                            <ProgressBar label="Communication Average" value={analytics?.communicationAverage} color="#00FF94" />
                        </div>

                        {/* Performance Trend Graph */}
                        {analytics?.recentPerformance?.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold font-accent text-zinc-400 uppercase tracking-wider">Performance Trend</h4>
                                    <select
                                        value={graphFilter}
                                        onChange={e => setGraphFilter(e.target.value)}
                                        className="bg-[#111] border border-white/10 text-xs rounded-lg px-2 py-1 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#00F0FF] cursor-pointer"
                                    >
                                        <option value="all">All Modules</option>
                                        <option value="coding">Coding</option>
                                        <option value="aptitude">Aptitude</option>
                                        <option value="communication">Interviews</option>
                                    </select>
                                </div>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analytics.recentPerformance
                                            .filter(d => graphFilter === "all" || d.module === graphFilter)
                                            .map((d, i) => ({
                                                name: `A${i + 1}`,
                                                score: Math.round(d.score),
                                                module: d.module,
                                                date: new Date(d.date).toLocaleDateString([], { month: 'short', day: 'numeric' })
                                            }))}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#000000dd', borderColor: '#ffffff20', borderRadius: '8px', fontSize: '12px' }}
                                                itemStyle={{ color: '#00F0FF', fontWeight: 'bold' }}
                                                labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                                                formatter={(value, name, props) => [`${value}%`, `Score (${props.payload.module})`]}
                                                labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="score"
                                                stroke="#00F0FF"
                                                strokeWidth={3}
                                                dot={{ r: 4, fill: '#000', stroke: '#00F0FF', strokeWidth: 2 }}
                                                activeDot={{ r: 6, fill: '#00F0FF', stroke: '#fff' }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* RIGHT COLUMN: Recent Performance Trend */}
                <div className="glass-card p-6 animate-slide-up lg:col-span-1" style={{ animationDelay: '0.3s' }}>
                    <h3 className="text-lg font-bold font-accent mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#FFD600]" /> Recent Activity
                    </h3>

                    <div className="space-y-4">
                        {analytics?.recentPerformance?.length === 0 ? (
                            <p className="text-sm text-zinc-500 text-center py-8 bg-black/20 rounded-lg">No recent activity detected.</p>
                        ) : (
                            analytics?.recentPerformance?.slice().reverse().map((activity, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg">
                                    <div>
                                        <p className="text-sm font-bold capitalize text-white flex items-center gap-2">
                                            {activity.module === 'coding' && <Code2 className="w-3 h-3 text-[#00F0FF]" />}
                                            {activity.module === 'aptitude' && <Brain className="w-3 h-3 text-[#7000FF]" />}
                                            {activity.module === 'communication' && <Mic className="w-3 h-3 text-[#00FF94]" />}
                                            {activity.module}
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-1">{new Date(activity.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold font-accent" style={{
                                            color: activity.module === 'coding' ? '#00F0FF' : activity.module === 'aptitude' ? '#7000FF' : '#00FF94'
                                        }}>
                                            {Math.round(activity.score)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

function StatBox({ icon: Icon, label, value, color }) {
    return (
        <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
            <div className="p-3 rounded-lg bg-white/5" style={{ color }}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-2xl font-bold font-accent text-white">{value || 0}</p>
                <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">{label}</p>
            </div>
        </div>
    );
}

function ProgressBar({ label, value, color }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-2">
                <span className="text-white font-medium">{label}</span>
                <span className="font-accent font-bold" style={{ color }}>{value}%</span>
            </div>
            <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                <div className="h-full rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${value}%`, backgroundColor: color }}>
                    <div className="absolute inset-0 bg-white/20 w-full h-full" />
                </div>
            </div>
        </div>
    );
}
