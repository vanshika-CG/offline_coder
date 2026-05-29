import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ListTodo, Plus, Calendar, Star, ChevronRight, BookOpen, Trash2, CheckCircle2, RotateCw } from "lucide-react";
import { getRevisions, createRevisionList, updateRevisionList, getQuestions } from "../utils/api";
import axios from "axios";

export default function Revisions() {
  const [revisions, setRevisions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [selectedQIds, setSelectedQIds] = useState([]);

  // Selected playlist state
  const [activeList, setActiveList] = useState(null);

  useEffect(() => {
    loadRevisionsData();
  }, []);

  const loadRevisionsData = async () => {
    try {
      setLoading(true);
      const revRes = await getRevisions();
      const qRes = await getQuestions();
      setRevisions(revRes.data.revisions || []);
      setQuestions(qRes.data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;

    try {
      const data = { name, description, topic, questions: selectedQIds };
      const res = await createRevisionList(data);
      if (res.data.success) {
        setRevisions((prev) => [...prev, res.data.revision || { _id: `temp_${Date.now()}`, ...data }]);
        setShowModal(false);
        resetForm();
      }
    } catch (err) {
      console.error("Create revision list error:", err);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setTopic("");
    setSelectedQIds([]);
  };

  const handleReviseCount = async (id) => {
    try {
      // Offline local update
      setRevisions(prev => prev.map(r => {
        if (r._id === id) {
          return {
            ...r,
            lastRevised: new Date().toISOString(),
            revisionCount: (r.revisionCount || 0) + 1
          };
        }
        return r;
      }));

      // Queue network sync
      const API_BASE_URL = "http://localhost:3001";
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      if (navigator.onLine) {
        await axios.put(`${API_BASE_URL}/api/revisions/${id}/revise`, {}, { headers });
      } else {
        const db = (await import("../utils/db")).default;
        await db.addToSyncQueue("PUT", `/api/revisions/${id}/revise`, {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQCheckboxChange = (qId) => {
    setSelectedQIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-brand-bg text-white">
        <div className="w-12 h-12 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Syncing your DSA revision vaults...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow space-y-8 bg-brand-bg text-white py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight">Revision Playlists</h2>
          <p className="text-sm text-gray-400">Group coding questions, schedule periodic review sprints, and map success metrics.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purple/80 text-sm font-semibold transition glow-purple flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Grid: playlists on left, details on right if active */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Playlists checklist columns */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ListTodo size={18} className="text-brand-purple" />
            <span>My Playlists ({revisions.length})</span>
          </h3>

          {revisions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl glass-panel text-gray-500">
              No playlists found. Click "New Playlist" to get started!
            </div>
          ) : (
            <div className="space-y-3">
              {revisions.map((rev) => (
                <div
                  key={rev._id}
                  onClick={() => setActiveList(rev)}
                  className={`p-5 rounded-xl glass-panel hover:border-brand-purple/40 hover:bg-slate-900/60 cursor-pointer transition flex flex-col justify-between h-40 ${
                    activeList?._id === rev._id ? "border-brand-purple/50 bg-brand-purple/5" : ""
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded bg-brand-border text-[9px] text-brand-cyan font-bold uppercase tracking-wider">
                        {rev.topic || "General"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {rev.questions?.length || 0} Problems
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-base mt-2 line-clamp-1">{rev.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-1">{rev.description}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-brand-border pt-2 text-[10px] text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{rev.revisionCount || 0} revisions</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReviseCount(rev._id);
                      }}
                      className="flex items-center gap-1 text-[10px] bg-slate-950/60 border border-brand-border hover:border-brand-purple/40 hover:text-brand-purple px-2 py-0.5 rounded transition cursor-pointer"
                    >
                      <RotateCw size={10} />
                      <span>Revise</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Playlist Active Details Panel */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <BookOpen size={18} className="text-brand-cyan" />
            <span>Playlist Contents</span>
          </h3>

          {!activeList ? (
            <div className="p-12 text-center rounded-2xl glass-panel text-gray-500 h-64 flex items-center justify-center border border-dashed border-brand-border">
              Select a revision playlist from the left column to view its questions.
            </div>
          ) : (
            <div className="p-6 rounded-2xl glass-panel space-y-6">
              <div className="space-y-2 border-b border-brand-border pb-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-white">{activeList.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-purple/20 text-brand-purple">
                    {activeList.topic || "General"}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{activeList.description}</p>
                {activeList.lastRevised && (
                  <p className="text-xs text-gray-500">
                    Last Revised: {new Date(activeList.lastRevised).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Solved Question items in playlist */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Questions List</h4>
                {(!activeList.questions || activeList.questions.length === 0) ? (
                  <p className="text-xs text-gray-500 italic">No questions added to this playlist yet.</p>
                ) : (
                  <div className="space-y-2">
                    {activeList.questions.map((qIdOrObj) => {
                      const q = typeof qIdOrObj === "string" ? questions.find((item) => item._id === qIdOrObj) : qIdOrObj;
                      if (!q) return null;

                      return (
                        <Link
                          key={q._id}
                          to={`/problem/${q._id}`}
                          className="flex items-center justify-between p-3.5 bg-slate-950/40 hover:bg-slate-950/80 border border-brand-border hover:border-brand-purple/40 rounded-xl transition group"
                        >
                          <div className="flex items-center gap-3 pr-4">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                q.isSolved ? "bg-brand-green glow-green" : "bg-gray-700"
                              }`}
                            ></span>
                            <span className="font-bold text-sm text-white group-hover:text-brand-purple transition line-clamp-1">
                              {q.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-bold ${
                                q.difficulty === "Easy"
                                  ? "text-brand-green"
                                  : q.difficulty === "Medium"
                                  ? "text-brand-amber"
                                  : "text-brand-red"
                              }`}
                            >
                              {q.difficulty}
                            </span>
                            <ChevronRight size={14} className="text-gray-600 group-hover:text-brand-purple transition" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel glow-purple space-y-5">
            <h3 className="text-xl font-bold text-white">Create Revision Playlist</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Playlist Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 glass-input text-sm"
                  placeholder="DP Revision Sprints"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Topic/Tag
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-4 py-2.5 glass-input text-sm"
                    placeholder="Dynamic Programming"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input text-sm h-20 resize-none"
                  placeholder="Review crucial recurrence relation problems before tech interview."
                />
              </div>

              {/* Question list checklist inside modal */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Select questions to include ({selectedQIds.length})
                </label>
                <div className="max-h-40 overflow-y-auto border border-brand-border rounded-xl p-2.5 space-y-1 bg-slate-950/60">
                  {questions.map((q) => (
                    <label
                      key={q._id}
                      className="flex items-center gap-2 text-xs text-gray-300 p-1.5 hover:bg-slate-900 rounded cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={selectedQIds.includes(q._id)}
                        onChange={() => handleQCheckboxChange(q._id)}
                        className="rounded accent-brand-purple cursor-pointer"
                      />
                      <span className="line-clamp-1">{q.title}</span>
                    </label>
                  ))}
                  {questions.length === 0 && (
                    <p className="text-xs text-gray-500 italic p-2">Save some questions from extension first!</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-brand-border text-gray-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 text-xs font-bold rounded-lg bg-brand-purple hover:bg-brand-purple/80 text-white cursor-pointer glow-purple"
                >
                  Create Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
