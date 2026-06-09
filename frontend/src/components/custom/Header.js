import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Code2, Brain, Mic, Zap, Flame, Trophy, User, Menu, X } from "lucide-react";
import axios from "axios";
import { isDevMode } from "@/utils/devMode";
// Static import — same webpack module instance as ClerkProvider in index.js
// Safe to import even in dev mode; only <UserButton /> is conditionally rendered.
import { UserButton } from "@clerk/clerk-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const navItems = [
  { path: "/", label: "Dashboard", icon: Zap },
  { path: "/coding", label: "Coding", icon: Code2 },
  { path: "/aptitude", label: "Aptitude", icon: Brain },
  { path: "/communication", label: "Communication", icon: Mic },
];

export default function Header() {
  const location = useLocation();
  const [progress, setProgress] = useState({ xp: 0, level: 1, streak: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    axios.get(`${API}/progress`).then(r => setProgress(r.data)).catch(() => { });
  }, [location.pathname]);

  const xpInLevel = progress.xp % 500;
  const xpPercent = (xpInLevel / 500) * 100;

  return (
    <header
      data-testid="main-header"
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5"
      style={{ borderRadius: 0 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00F0FF] to-[#7000FF] flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Outfit' }}>
            ELEVATE
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
                  ? "text-[#00F0FF] bg-[#00F0FF]/10 nav-tab-active"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Stats + Profile */}
        <div className="flex items-center gap-4">
          {/* Streak */}
          <div data-testid="streak-counter" className="hidden sm:flex items-center gap-1.5 text-sm">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="font-accent font-semibold text-orange-400">{progress.streak}</span>
          </div>

          {/* XP */}
          <div data-testid="xp-display" className="hidden sm:flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FFD600]" />
            <div className="flex flex-col">
              <span className="text-xs text-zinc-500 leading-none">LVL {progress.level}</span>
              <div className="w-16 h-1.5 bg-zinc-800 rounded-full mt-0.5">
                <div className="xp-bar h-full" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
            <span className="font-accent text-sm font-semibold text-[#00F0FF]">{progress.xp} XP</span>
          </div>

          {/* Profile — static import, conditional render based on isDevMode */}
          <div className="flex items-center justify-center">
            {isDevMode ? (
              /* Dev mode: gradient avatar linking to profile */
              <Link
                to="/profile"
                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#7000FF] flex items-center justify-center text-black font-bold text-sm border border-white/10 hover:border-[#00F0FF]/50 transition-colors"
              >
                D
              </Link>
            ) : (
              /* Production: real Clerk UserButton — safe because ClerkProvider wraps everything */
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 border border-white/10 hover:border-[#00F0FF]/50 transition-colors"
                  }
                }}
                afterSignOutUrl="/sign-in"
              >
                <UserButton.MenuItems>
                  <UserButton.Link label="Profile & Analytics" labelIcon={<User className="w-4 h-4" />} href="/profile" />
                </UserButton.MenuItems>
              </UserButton>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button 
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-t border-white/10 p-4 absolute top-16 left-0 right-0 z-40 bg-black/95">
          <nav className="flex flex-col gap-2">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active 
                      ? "text-[#00F0FF] bg-[#00F0FF]/10" 
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
