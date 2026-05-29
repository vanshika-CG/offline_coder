import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { LayoutDashboard, Library, BookMarked, User, Shield, LogOut, Award, Menu, X } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import LibraryPage from "./pages/Library";
import ProblemDetail from "./pages/ProblemDetail";
import Revisions from "./pages/Revisions";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import OfflineStatus from "./components/OfflineStatus";

function NavigationSidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user.role === "admin");
    }
  }, [location]);

  const handleLogout = () => {
    if (window.confirm("Do you want to sign out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/auth");
    }
  };

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { path: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/library", label: "Library", icon: <Library size={18} /> },
    { path: "/revisions", label: "Playlists", icon: <BookMarked size={18} /> },
    { path: "/profile", label: "Profile", icon: <User size={18} /> }
  ];

  if (location.pathname === "/auth") return null;

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-brand-border backdrop-blur-md sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-2">
          <Award className="text-brand-purple glow-purple" size={24} />
          <h1 className="text-xl font-black text-white tracking-tight">OfflineCoder</h1>
        </div>
        <div className="flex items-center gap-3">
          <OfflineStatus />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1 rounded bg-slate-900 border border-brand-border text-gray-400 hover:text-white transition cursor-pointer"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-brand-border bg-slate-950/90 flex flex-col justify-between py-6 px-4 transform transition-transform duration-300 md:translate-x-0 shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:relative"
        }`}
      >
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 border-b border-brand-border pb-4">
            <Award className="text-brand-purple glow-purple animate-pulse" size={28} />
            <div>
              <h1 className="text-xl font-black text-white tracking-tight leading-none">Offline Coder</h1>
              <span className="text-[10px] text-gray-500 font-bold">V1.0 (PWA Enabled)</span>
            </div>
          </div>

          {/* Navigation link sets */}
          <nav className="space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  isActive(link.path)
                    ? "bg-brand-purple/15 text-brand-purple border border-brand-purple/30 glow-purple"
                    : "text-gray-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  isActive("/admin")
                    ? "bg-brand-purple/15 text-brand-purple border border-brand-purple/30 glow-purple"
                    : "text-gray-400 hover:text-white hover:bg-slate-900/60"
                }`}
              >
                <Shield size={18} />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Footer actions and status */}
        <div className="space-y-4 pt-4 border-t border-brand-border">
          <div className="hidden md:block">
            <OfflineStatus />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-brand-red hover:bg-brand-red/10 transition border border-transparent hover:border-brand-red/20 cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// Session Guard
function AuthGuard({ children }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  // Fallback to local user session if offline
  if (!token && !storedUser) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-brand-bg relative overflow-x-hidden font-sans">
      <NavigationSidebar />
      <main className="flex-1 px-4 md:px-8 overflow-y-auto max-h-screen md:py-4">
        <Routes>
          <Route path="/" element={<AuthGuard><Dashboard /></AuthGuard>} />
          <Route path="/library" element={<AuthGuard><LibraryPage /></AuthGuard>} />
          <Route path="/problem/:id" element={<AuthGuard><ProblemDetail /></AuthGuard>} />
          <Route path="/revisions" element={<AuthGuard><Revisions /></AuthGuard>} />
          <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
          <Route path="/admin" element={<AuthGuard><Admin /></AuthGuard>} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}