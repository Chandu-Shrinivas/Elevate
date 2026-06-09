import { useState, useEffect, useMemo } from "react";
import { Activity, Flame, Trophy, Info } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WEEKS = 52;
const DAYS_PER_WEEK = 7;

export default function ContributionHeatmap({ userId }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        axios.get(`${API}/analytics/heatmap/${userId}?module=${filter}`)
            .then(r => setData(r.data))
            .catch(e => console.error("Heatmap Error:", e))
            .finally(() => setLoading(false));
    }, [userId, filter]);

    // Generate grid mapping past 365 days
    const grid = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to local midnight

        const days = [];
        for (let i = 365; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);

            // Format as YYYY-MM-DD local time, avoiding UTC skew
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const localDateStr = `${year}-${month}-${day}`;

            // direct array search to completely avoid Map discrepancies
            const foundDay = data?.dailyActivity?.find(val => val.date === localDateStr);
            const verifiedCount = foundDay ? Number(foundDay.count) : 0;

            days.push({
                date: localDateStr,
                count: verifiedCount,
                dayOfWeek: d.getDay(), // 0 = Sunday, 1 = Monday
            });
        }

        // Pad beginning so grid aligns correctly with weekday columns
        const firstDayOfWeek = days[0].dayOfWeek;
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.unshift(null);
        }

        return days;
    }, [data]);

    const getColor = (count) => {
        if (!count || count === 0) return "bg-white/5";
        if (count <= 2) return "bg-[#00FF94]/30";
        if (count <= 5) return "bg-[#00FF94]/60";
        return "bg-[#00FF94]";
    };

    const getMonthLabels = () => {
        const labels = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let lastMonth = -1;

        grid.forEach((day, idx) => {
            if (!day) return;
            const month = parseInt(day.date.split('-')[1], 10) - 1;
            if (month !== lastMonth && idx % 7 === 0) { // Only place label at start of week column
                labels.push({ text: monthNames[month], colIndex: Math.floor(idx / 7) });
                lastMonth = month;
            }
        });
        return labels;
    };

    return (
        <div className="glass-card p-6 animate-slide-up" data-testid="contribution-heatmap">

            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold font-accent flex items-center gap-2">
                        <span className="text-[#00FF94]">{data?.totalSubmissions || 0}</span> Submissions
                    </h3>
                    <p className="text-sm text-zinc-400">in the past year</p>
                </div>

                <div className="flex items-center gap-4 text-sm bg-black/30 rounded-lg p-2 border border-white/5">
                    <div className="flex items-center gap-1.5 px-3 border-r border-white/10">
                        <span className="text-zinc-500">Active Days</span>
                        <span className="font-bold text-white">{data?.activeDays || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 border-r border-white/10">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-zinc-500">Streak</span>
                        <span className="font-bold text-white">{data?.currentStreak || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3">
                        <Trophy className="w-4 h-4 text-[#FFD600]" />
                        <span className="text-zinc-500">Max</span>
                        <span className="font-bold text-white">{data?.maxStreak || 0}</span>
                    </div>
                </div>

                <select
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    className="bg-[#111] border border-white/10 text-sm rounded-lg px-3 py-1.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#00FF94] cursor-pointer"
                >
                    <option value="all">All Modules</option>
                    <option value="coding">Coding Only</option>
                    <option value="aptitude">Aptitude Only</option>
                    <option value="communication">Interviews Only</option>
                </select>
            </div>

            {loading ? (
                <div className="h-40 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-[#00FF94] animate-spin" />
                </div>
            ) : (
                <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {/* DEBUG JSON PAYLOAD LOG */}
                    <div className="text-[10px] text-zinc-500 font-mono mb-2 break-all max-w-[700px]">
                        DEBUG: {JSON.stringify(data?.dailyActivity)}
                    </div>
                    <div className="min-w-[700px]">

                        {/* Heatmap Grid */}
                        <div
                            className="grid gap-[3px]"
                            style={{ gridTemplateRows: `repeat(${DAYS_PER_WEEK}, minmax(0, 1fr))`, gridAutoFlow: 'column', gridAutoColumns: '12px' }}
                        >
                            {grid.map((day, i) => (
                                <div key={i} className="relative group/cell">
                                    {day === null ? (
                                        <div className="w-3 h-3 rounded-[2px]" />
                                    ) : (
                                        <div
                                            className={`w-3 h-3 rounded-[2px] transition-colors cursor-pointer hover:ring-1 hover:ring-white border border-black/20 ${getColor(day.count)}`}
                                        />
                                    )}

                                    {/* Tooltip */}
                                    {day && (
                                        <div className="absolute opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 whitespace-nowrap bg-black border border-white/10 text-xs px-2 py-1.5 rounded shadow-xl font-medium">
                                            <span className="text-white">{day.count} submissions</span>
                                            <span className="text-zinc-500 ml-2">on {new Date(day.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            {/* Tooltip caret */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-black" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Month Labels */}
                        <div className="flex text-xs text-zinc-500 mt-2 ml-4">
                            {getMonthLabels().map((lbl, i) => (
                                <div key={i} className="absolute" style={{ transform: `translateX(${lbl.colIndex * 15}px)` }}>
                                    {lbl.text}
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-end gap-2 mt-6 text-xs text-zinc-500">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-[2px] bg-white/5" />
                                <div className="w-3 h-3 rounded-[2px] bg-[#00FF94]/30" />
                                <div className="w-3 h-3 rounded-[2px] bg-[#00FF94]/60" />
                                <div className="w-3 h-3 rounded-[2px] bg-[#00FF94]" />
                            </div>
                            <span>More</span>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
