import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, ShieldAlert, Award } from "lucide-react";
import { loginUser, registerUser } from "../utils/api";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser(email, password);
        if (res.data.success) {
          navigate("/");
        }
      } else {
        const res = await registerUser(name, email, password);
        if (res.data.success) {
          navigate("/");
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-4 py-12 relative overflow-hidden bg-brand-bg">
      {/* Background Decorative Neon Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-brand-cyan/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 rounded-2xl glass-panel glow-purple relative z-10 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-brand-purple/10 border border-brand-purple/30 rounded-2xl mb-4 text-brand-purple glow-purple">
            <Award size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-white text-center">
            {isLogin ? "Welcome Back" : "Start Solving Offline"}
          </h2>
          <p className="text-sm text-gray-400 mt-2 text-center">
            {isLogin ? "Access your offline DSA questions and notes" : "Save questions from LeetCode and solve completely offline"}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-6 p-4 rounded-lg bg-brand-red/10 border border-brand-red/30 text-brand-red text-sm">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 glass-input text-sm"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 glass-input text-sm"
              placeholder="you@domain.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 glass-input text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 mt-2 flex items-center justify-center gap-2 rounded-xl text-white font-semibold transition bg-brand-purple hover:bg-brand-purple/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed glow-purple"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : isLogin ? (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-brand-cyan hover:underline bg-transparent border-none cursor-pointer"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
