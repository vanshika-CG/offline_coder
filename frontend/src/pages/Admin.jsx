import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Users, BookOpen, Upload, Trash2, Calendar, Award } from "lucide-react";
import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Retrieve profile
      const profRes = await axios.get(`${API_BASE_URL}/api/auth/profile`, { headers });
      const user = profRes.data.user;

      if (user.role !== "admin") {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Load analytics and users
      const analRes = await axios.get(`${API_BASE_URL}/api/admin/analytics`, { headers });
      setAnalytics(analRes.data.analytics);

      const usersRes = await axios.get(`${API_BASE_URL}/api/admin/users`, { headers });
      setUsersList(usersRes.data.users || []);

    } catch (err) {
      console.error("Admin dashboard load error:", err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (window.confirm("Are you sure you want to delete this question? This action will remove it permanently from MongoDB database for all users.")) {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        await axios.delete(`${API_BASE_URL}/api/admin/questions/${qId}`, { headers });
        alert("Question deleted successfully!");
        
        // Reload analytics
        const analRes = await axios.get(`${API_BASE_URL}/api/admin/analytics`, { headers });
        setAnalytics(analRes.data.analytics);
      } catch (err) {
        console.error("Delete question error:", err);
        alert(err.response?.data?.message || "Failed to delete question");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-brand-bg text-white">
        <div className="w-12 h-12 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Authenticating root privileges...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center bg-brand-bg text-white">
        <div className="p-4 bg-brand-red/10 border border-brand-red/30 rounded-2xl text-brand-red mb-4 glow-red animate-pulse">
          <ShieldAlert size={48} />
        </div>
        <h3 className="text-2xl font-bold">Unauthorized Root Access</h3>
        <p className="text-sm text-gray-400 mt-2 max-w-sm">
          You do not have administrative permissions to view this terminal panel.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-grow space-y-8 bg-brand-bg text-white py-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <ShieldCheck size={28} className="text-brand-green" />
          <span>Admin Control Station</span>
        </h2>
        <p className="text-sm text-gray-400">Monitor global system usage metrics, inspect code submissions, and manage platform resources.</p>
      </div>

      {/* Grid of Global Stats */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl glass-panel flex items-center gap-4">
            <div className="p-3 bg-brand-purple/10 border border-brand-purple/20 rounded-xl text-brand-purple glow-purple">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Global Users</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{analytics.totalUsers}</h3>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel flex items-center gap-4">
            <div className="p-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-brand-cyan glow-cyan">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Questions Ingested</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{analytics.totalQuestions}</h3>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel flex items-center gap-4">
            <div className="p-3 bg-brand-green/10 border border-brand-green/20 rounded-xl text-brand-green glow-green">
              <Upload size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Submissions Logged</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{analytics.totalSubmissions}</h3>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel flex items-center gap-4">
            <div className="p-3 bg-brand-amber/10 border border-brand-amber/20 rounded-xl text-brand-amber glow-amber">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Users (7d)</p>
              <h3 className="text-2xl font-bold mt-1 text-white">{analytics.activeUsers}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Registered Users */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Users size={18} className="text-brand-purple" />
            <span>Platform User Directory</span>
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {usersList.map((user) => (
              <div key={user._id} className="p-4 rounded-xl border border-brand-border bg-slate-950/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={user.avatar} className="w-10 h-10 rounded-xl bg-slate-900 border border-brand-border p-0.5 shrink-0" alt="avatar" />
                  <div>
                    <h5 className="font-bold text-sm text-white">{user.name}</h5>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-slate-900 border border-brand-border text-gray-400 uppercase tracking-wider">
                    {user.role}
                  </span>
                  <p className="text-[10px] text-gray-500 mt-1">Streak: {user.streak || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent submissions log & deletion helper */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Award size={18} className="text-brand-cyan" />
            <span>Submission Streams Log</span>
          </h3>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {analytics?.recentSubmissions?.length === 0 ? (
              <p className="text-xs text-gray-500 italic py-8 text-center">No runs logged yet.</p>
            ) : (
              analytics?.recentSubmissions?.map((sub) => (
                <div key={sub._id} className="p-4 rounded-xl border border-brand-border bg-slate-950/40 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white line-clamp-1 pr-2">
                      {sub.questionId?.title || "Deleted Question"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                        sub.status === "Accepted"
                          ? "bg-brand-green/10 text-brand-green"
                          : "bg-brand-red/10 text-brand-red"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 border-t border-brand-border/40 pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span>By: <strong className="text-gray-400">{sub.userId?.name || "Deleted User"}</strong></span>

                    {/* Question deletion key (for admin controls) */}
                    {sub.questionId && (
                      <button
                        onClick={() => handleDeleteQuestion(sub.questionId._id)}
                        className="p-1 rounded bg-slate-900 border border-brand-border hover:border-brand-red/40 text-gray-500 hover:text-brand-red cursor-pointer transition"
                        title="Delete Question Ingest"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
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
