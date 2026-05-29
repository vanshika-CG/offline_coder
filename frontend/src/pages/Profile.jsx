import React, { useEffect, useState } from "react";
import { User, Mail, Flame, Award, ShieldAlert, LogOut, RefreshCw, Trash2, Cpu } from "lucide-react";
import { getProfile } from "../utils/api";
import dbInstance from "../utils/db";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    loadProfileData();
    calculateCacheSize();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      setProfile(res.data.user);
    } catch (err) {
      console.error("Failed to load profile stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCacheSize = async () => {
    try {
      const questions = await dbInstance.getAllQuestions();
      const subs = await dbInstance.getAllSubmissions();
      const totalCount = questions.length + subs.length;
      setCacheSize(totalCount);
    } catch (err) {
      setCacheSize(0);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    // Simulate sync trigger (handled in OfflineStatus as well)
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSyncing(false);
    loadProfileData();
  };

  const handleClearCache = async () => {
    if (window.confirm("Are you sure you want to clear the local cached questions and submissions? This will require an active internet connection to reload problems.")) {
      try {
        const db = await dbInstance.ensureDB();
        const t1 = db.transaction("questions", "readwrite");
        t1.objectStore("questions").clear();
        const t2 = db.transaction("submissions", "readwrite");
        t2.objectStore("submissions").clear();
        alert("Local cache cleared successfully.");
        calculateCacheSize();
        loadProfileData();
      } catch (err) {
        console.error("Failed to clear IndexedDB cache:", err);
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("Do you want to log out of Offline Coder?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/auth";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] bg-brand-bg text-white">
        <div className="w-12 h-12 border-4 border-brand-purple/30 border-t-brand-purple rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading your profile achievements...</p>
      </div>
    );
  }

  const successRate = profile.totalSubmissions > 0 
    ? Math.round((profile.successfulSubmissions / profile.totalSubmissions) * 100)
    : 0;

  return (
    <div className="flex-grow space-y-8 bg-brand-bg text-white py-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold tracking-tight font-sans">User Settings</h2>
        <p className="text-sm text-gray-400">Manage account information, sync configurations, and view comprehensive platform accomplishments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card Summary */}
        <div className="lg:col-span-1 p-6 rounded-2xl glass-panel flex flex-col items-center text-center space-y-4 h-fit relative overflow-hidden glow-purple">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-purple/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <img
            src={profile.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=offlinecoder"}
            alt="Avatar"
            className="w-24 h-24 rounded-2xl border-2 border-brand-purple/30 glow-purple bg-slate-900 p-1"
          />

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">{profile.name}</h3>
            <p className="text-xs text-gray-400 flex items-center gap-1 justify-center">
              <Mail size={12} />
              <span>{profile.email}</span>
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-purple/10 text-brand-purple border border-brand-purple/20 uppercase tracking-wider">
            {profile.role || "Standard User"}
          </span>

          <div className="w-full pt-4 border-t border-brand-border flex flex-col gap-2.5">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-brand-red border border-brand-red/30 hover:border-brand-red/50 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Stats and cache management settings column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analytics grid */}
          <div className="p-6 rounded-2xl glass-panel space-y-5">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Award size={18} className="text-brand-purple" />
              <span>Success Metrics</span>
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-brand-border bg-slate-950/40 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Total Solved</p>
                <h5 className="text-2xl font-black text-brand-green mt-1">
                  {profile.solvedQuestions?.length || 0}
                </h5>
              </div>

              <div className="p-4 rounded-xl border border-brand-border bg-slate-950/40 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Submissions</p>
                <h5 className="text-2xl font-black text-brand-cyan mt-1">
                  {profile.totalSubmissions || 0}
                </h5>
              </div>

              <div className="p-4 rounded-xl border border-brand-border bg-slate-950/40 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Success Rate</p>
                <h5 className="text-2xl font-black text-brand-amber mt-1">
                  {successRate}%
                </h5>
              </div>

              <div className="p-4 rounded-xl border border-brand-border bg-slate-950/40 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Practice Streak</p>
                <h5 className="text-2xl font-black text-brand-purple mt-1 flex items-center justify-center gap-1">
                  <Flame size={20} className="text-brand-amber shrink-0 animate-pulse" />
                  <span>{profile.streak || 0}</span>
                </h5>
              </div>
            </div>
          </div>

          {/* Offline Sync Cache configurations */}
          <div className="p-6 rounded-2xl glass-panel space-y-5">
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu size={18} className="text-brand-cyan" />
              <span>Offline Database Cache Configurations</span>
            </h4>

            <div className="p-4 bg-slate-950/40 rounded-xl border border-brand-border space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-white">Local Cache size</p>
                  <p className="text-xs text-gray-400">Number of problems, solutions, and playlists currently saved in your offline IndexedDB database.</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-slate-900 border border-brand-border text-brand-cyan rounded-lg shrink-0">
                  {cacheSize} items cached
                </span>
              </div>

              <div className="pt-4 border-t border-brand-border flex flex-col md:flex-row gap-3">
                <button
                  onClick={handleManualSync}
                  disabled={syncing}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/80 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
                  <span>{syncing ? "Syncing..." : "Sync Database Now"}</span>
                </button>

                <button
                  onClick={handleClearCache}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-brand-red border border-brand-red/30 hover:border-brand-red/50 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Clear Cache Database</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
