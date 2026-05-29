import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle, Flame, Star, Award, Zap, ChevronRight, Activity } from "lucide-react";
import { getQuestions, getProfile } from "../utils/api";

// Custom SVG Area Chart Component (100% Bulletproof React 19 / Vite 8 Offline Friendly)
function PerformanceChart({ data }) {
  const [width, setWidth] = useState(500);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setWidth(entry.contentRect.width || 500);
        }
      });
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const height = 220;
  const paddingLeft = 32;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map(d => d.solved), 1) + 1;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.solved / maxVal) * chartHeight;
    return { x, y, name: d.name, solved: d.solved };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : "";

  return (
    <div ref={containerRef} className="w-full relative select-none pb-4" style={{ height: `${height}px` }}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#a855f7" stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines and Y Axis values */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingTop + ratio * chartHeight;
          const val = Math.round(maxVal - ratio * maxVal);
          return (
            <g key={idx} className="opacity-70">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                fill="#9ca3af"
                fontSize="10"
                fontWeight="600"
                textAnchor="end"
                className="font-mono"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {areaD && <path d={areaD} fill="url(#chartGradient)" className="transition-all duration-300" />}

        {/* Line path */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#a855f7"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx} className="group/dot cursor-pointer">
            {/* Hover shadow ring */}
            <circle
              cx={p.x}
              cy={p.y}
              r="9"
              fill="rgba(168, 85, 247, 0.2)"
              className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200"
            />
            {/* Core dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#a855f7"
              stroke="#030712"
              strokeWidth="2.5"
              className="transition-all duration-200"
            />
            {/* Floating tooltip labels */}
            <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200">
              <rect
                x={p.x - 22}
                y={p.y - 30}
                width="44"
                height="20"
                rx="4"
                fill="#111827"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
              <text
                x={p.x}
                y={p.y - 16}
                fill="#fff"
                fontSize="9"
                fontWeight="800"
                textAnchor="middle"
                className="font-mono"
              >
                {p.solved} Qs
              </text>
            </g>
            {/* X Axis Labels */}
            <text
              x={p.x}
              y={height - 6}
              fill="#9ca3af"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
            >
              {p.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSaved: 0,
    solved: 0,
    bookmarked: 0,
    streak: 0,
    easy: { total: 0, solved: 0 },
    medium: { total: 0, solved: 0 },
    hard: { total: 0, solved: 0 }
  });
  const [chartData, setChartData] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const qRes = await getQuestions();
      const pRes = await getProfile();

      const questions = qRes.data.questions || [];
      const user = pRes.data.user || {};

      const solvedList = questions.filter((q) => q.isSolved);
      const bookmarkedList = questions.filter((q) => q.isBookmarked);

      const easyQs = questions.filter((q) => q.difficulty === "Easy");
      const mediumQs = questions.filter((q) => q.difficulty === "Medium");
      const hardQs = questions.filter((q) => q.difficulty === "Hard");

      setStats({
        totalSaved: questions.length,
        solved: solvedList.length,
        bookmarked: bookmarkedList.length,
        streak: user.streak || 0,
        easy: { total: easyQs.length, solved: easyQs.filter((q) => q.isSolved).length },
        medium: { total: mediumQs.length, solved: mediumQs.filter((q) => q.isSolved).length },
        hard: { total: hardQs.length, solved: hardQs.filter((q) => q.isSolved).length }
      });

      // Populate recent saved questions (max 4)
      setRecentQuestions(questions.slice(-4).reverse());

      // Prepare Recharts chart mock progress data
      const dataPoints = [
        { name: "Mon", solved: Math.min(Math.floor(solvedList.length * 0.2), solvedList.length) },
        { name: "Tue", solved: Math.min(Math.floor(solvedList.length * 0.4), solvedList.length) },
        { name: "Wed", solved: Math.min(Math.floor(solvedList.length * 0.6), solvedList.length) },
        { name: "Thu", solved: Math.min(Math.floor(solvedList.length * 0.8), solvedList.length) },
        { name: "Fri", solved: solvedList.length }
      ];
      setChartData(dataPoints);

    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-brand-bg text-white">
        <div className="w-12 h-12 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading your DSA insights...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 bg-brand-bg text-white py-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel relative overflow-hidden glow-purple animate-fade-in">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-brand-purple/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 z-10">
          <h2 className="text-3xl font-extrabold tracking-tight">Your DSA Workspace</h2>
          <p className="text-sm text-gray-400">Review solved, practice offline, and track your coding consistency.</p>
        </div>
        <div className="flex gap-3 z-10">
          <Link
            to="/library"
            className="px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple/80 text-sm font-semibold transition glow-purple flex items-center gap-2 cursor-pointer"
          >
            <Zap size={16} />
            <span>Start Practice</span>
          </Link>
        </div>
      </div>

      {/* Grid of Glowing Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Questions Card */}
        <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex items-center gap-4">
          <div className="p-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-brand-cyan glow-cyan">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Saved</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{stats.totalSaved}</h3>
          </div>
        </div>

        {/* Questions Solved Card */}
        <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex items-center gap-4">
          <div className="p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green glow-green">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Solved</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{stats.solved}</h3>
          </div>
        </div>

        {/* Streak Card */}
        <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex items-center gap-4">
          <div className="p-3 bg-brand-amber/10 border border-brand-amber/20 rounded-xl text-brand-amber glow-amber">
            <Flame size={24} className="animate-pulse animate-bounce" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Streak Counter</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{stats.streak} Days</h3>
          </div>
        </div>

        {/* Bookmarked Card */}
        <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex items-center gap-4">
          <div className="p-3 bg-brand-purple/10 border border-brand-purple/20 rounded-xl text-brand-purple glow-purple">
            <Star size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bookmarked</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{stats.bookmarked}</h3>
          </div>
        </div>
      </div>

      {/* Main Split Content: Analytics and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Progress Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-brand-purple animate-pulse" />
                <span>Performance Progression</span>
              </h3>
              <p className="text-xs text-gray-400">Plotting question solving analytics over the past few days.</p>
            </div>
          </div>
          <div className="w-full flex justify-center items-center">
            <PerformanceChart data={chartData} />
          </div>
        </div>

        {/* Right Column: Difficulty Breakdown */}
        <div className="p-6 rounded-2xl glass-panel flex flex-col justify-between">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Award size={18} className="text-brand-cyan" />
            <span>Difficulty Breakdown</span>
          </h3>
          <div className="space-y-6">
            {/* Easy Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-green font-semibold">Easy</span>
                <span className="text-gray-400">{stats.easy.solved} / {stats.easy.total} solved</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-brand-border">
                <div
                  className="bg-brand-green h-full rounded-full transition-all duration-500 glow-green"
                  style={{ width: `${stats.easy.total > 0 ? (stats.easy.solved / stats.easy.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Medium Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-amber font-semibold">Medium</span>
                <span className="text-gray-400">{stats.medium.solved} / {stats.medium.total} solved</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-brand-border">
                <div
                  className="bg-brand-amber h-full rounded-full transition-all duration-500 glow-amber"
                  style={{ width: `${stats.medium.total > 0 ? (stats.medium.solved / stats.medium.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Hard Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-brand-red font-semibold">Hard</span>
                <span className="text-gray-400">{stats.hard.solved} / {stats.hard.total} solved</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-brand-border">
                <div
                  className="bg-brand-red h-full rounded-full transition-all duration-500 glow-red"
                  style={{ width: `${stats.hard.total > 0 ? (stats.hard.solved / stats.hard.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="p-6 rounded-2xl glass-panel">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity size={18} className="text-brand-purple" />
            <span>Recently Saved Questions</span>
          </h3>
          <Link to="/library" className="text-xs text-brand-cyan hover:underline flex items-center gap-1 font-semibold">
            <span>View All</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {recentQuestions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No questions saved yet. Use the browser extension to add questions from LeetCode!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentQuestions.map((q) => (
              <Link
                key={q._id}
                to={`/problem/${q._id}`}
                className="p-4 rounded-xl border border-brand-border bg-slate-950/40 hover:border-brand-purple/40 hover:bg-slate-950/80 transition flex items-center justify-between group"
              >
                <div className="space-y-1.5 pr-4">
                  <h4 className="font-bold text-white group-hover:text-brand-purple transition leading-snug">{q.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`font-semibold ${
                        q.difficulty === "Easy"
                          ? "text-brand-green"
                          : q.difficulty === "Medium"
                          ? "text-brand-amber"
                          : "text-brand-red"
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">
                      {q.tags.slice(0, 2).join(", ")}
                    </span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-500 group-hover:text-brand-purple transition shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
