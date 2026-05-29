import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, SlidersHorizontal, CheckCircle, Star, Bookmark, Calendar, ArrowUpDown } from "lucide-react";
import { getQuestions, toggleBookmarkQuestion, markQuestionSolved } from "../utils/api";

export default function Library() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  
  // Tag cache
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    loadQuestions();
  }, [search, difficulty, selectedTag, sortBy]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        difficulty: difficulty !== "All" ? difficulty : undefined,
        sort: sortBy
      };
      
      const res = await getQuestions(params);
      let list = res.data.questions || [];

      // Extract unique tags for filtering dropdown
      const tagsSet = new Set();
      list.forEach(q => q.tags?.forEach(t => tagsSet.add(t)));
      setAvailableTags(["All", ...Array.from(tagsSet)]);

      // Offline/Local Tag filtering fallback
      if (selectedTag !== "All") {
        list = list.filter(q => q.tags?.includes(selectedTag));
      }

      setQuestions(list);
    } catch (err) {
      console.error("Failed to load questions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleBookmarkQuestion(id);
      // Toggle state locally for instant UI update
      setQuestions(prev => prev.map(q => q._id === id ? { ...q, isBookmarked: !q.isBookmarked } : q));
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  };

  const handleMarkSolved = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await markQuestionSolved(id);
      setQuestions(prev => prev.map(q => q._id === id ? { ...q, isSolved: true } : q));
    } catch (err) {
      console.error("Solve toggle failed:", err);
    }
  };

  return (
    <div className="flex-1 space-y-6 bg-brand-bg text-white py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Question Library</h2>
          <p className="text-sm text-gray-400">Search and solve your saved LeetCode problems completely offline.</p>
        </div>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="p-4 rounded-xl glass-panel grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
            placeholder="Search problems by title, tags..."
          />
        </div>

        {/* Filter Difficulty */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500 shrink-0" />
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full p-2.5 glass-input text-sm cursor-pointer"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Filter Tag */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-gray-500 shrink-0" />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full p-2.5 glass-input text-sm cursor-pointer"
          >
            <option value="All">All Topics</option>
            {availableTags.filter(t => t !== "All").map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sorter bar */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <span>Found {questions.length} problems</span>
        <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
          <ArrowUpDown size={12} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-none text-xs text-gray-400 hover:text-white font-semibold cursor-pointer outline-none"
          >
            <option value="newest" className="bg-slate-950">Sort: Newest Saved</option>
            <option value="oldest" className="bg-slate-950">Sort: Oldest Saved</option>
            <option value="difficulty" className="bg-slate-950">Sort: Difficulty</option>
          </select>
        </div>
      </div>

      {/* Questions list container */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">Searching code vault...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-panel text-gray-500">
          No questions matched your search criteria. Try a different query or save another question via extension!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => (
            <Link
              key={q._id}
              to={`/problem/${q._id}`}
              className="p-5 rounded-xl glass-panel glass-panel-hover flex flex-col justify-between h-48 group relative overflow-hidden"
            >
              {/* Top solve and bookmark handlers */}
              <div className="flex items-start justify-between z-10">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    q.difficulty === "Easy"
                      ? "bg-brand-green/10 text-brand-green border border-brand-green/20 glow-green"
                      : q.difficulty === "Medium"
                      ? "bg-brand-amber/10 text-brand-amber border border-brand-amber/20 glow-amber"
                      : "bg-brand-red/10 text-brand-red border border-brand-red/20 glow-red"
                  }`}
                >
                  {q.difficulty}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleMarkSolved(e, q._id)}
                    disabled={q.isSolved}
                    className={`p-1.5 rounded-lg border transition ${
                      q.isSolved
                        ? "bg-brand-green/10 border-brand-green/30 text-brand-green cursor-default"
                        : "bg-slate-900 border-brand-border text-gray-500 hover:text-brand-green hover:border-brand-green/40 cursor-pointer"
                    }`}
                    title={q.isSolved ? "Solved" : "Mark as Solved"}
                  >
                    <CheckCircle size={15} />
                  </button>

                  <button
                    onClick={(e) => handleBookmark(e, q._id)}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      q.isBookmarked
                        ? "bg-brand-purple/10 border-brand-purple/30 text-brand-purple glow-purple"
                        : "bg-slate-900 border-brand-border text-gray-500 hover:text-brand-purple hover:border-brand-purple/40"
                    }`}
                    title={q.isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
                  >
                    <Bookmark size={15} fill={q.isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              {/* Title & Tags */}
              <div className="space-y-2 z-10 mt-3">
                <h3 className="font-bold text-lg text-white group-hover:text-brand-purple transition leading-tight line-clamp-1">
                  {q.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {q.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-brand-border text-[10px] text-gray-400 font-semibold uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                  {q.tags.length > 3 && (
                    <span className="px-2 py-0.5 rounded bg-brand-border text-[10px] text-gray-400 font-semibold">
                      +{q.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Saved Date info */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-3 border-t border-brand-border z-10 mt-3">
                <Calendar size={13} />
                <span>Saved on {new Date(q.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
