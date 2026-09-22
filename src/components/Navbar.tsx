import React from "react";
import { useApp } from "../context/AppContext";
import { 
  Compass, 
  LayoutDashboard, 
  FolderKanban, 
  Scale, 
  UserCircle2, 
  Sparkles,
  ArrowRight,
  LogOut,
  Sliders
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { currentView, setCurrentView, savedIdeas, user, setUser } = useApp();

  const handleStartBuilding = () => {
    if (!user?.hasCompletedOnboarding) {
      setCurrentView("onboarding");
    } else {
      setCurrentView("discover");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#0F0F11]/90 backdrop-blur-md z-40 border-b border-[#27272A] px-4 md:px-8">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        
        {/* Left: Brand Logo */}
        <button
          id="nav-brand-logo"
          onClick={() => setCurrentView("landing")}
          className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
        >
          <span className="font-anton text-2xl md:text-3xl tracking-wider text-[#EDEDED]">
            THE STRATEGIST<span className="text-[#F59E0B] text-3xl">.</span>
          </span>
          <span className="hidden sm:inline-block font-mono-code text-[10px] uppercase tracking-widest px-2 py-0.5 bg-[#18181B] text-[#F59E0B] border border-[#27272A] rounded">
            AI MVP
          </span>
        </button>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {currentView === "landing" ? (
            <>
              <a
                href="#how-it-works"
                className="px-3 py-1.5 text-sm font-semibold text-[#A1A1AA] hover:text-[#EDEDED] transition-colors"
              >
                How It Works
              </a>
              <a
                href="#features"
                className="px-3 py-1.5 text-sm font-semibold text-[#A1A1AA] hover:text-[#EDEDED] transition-colors"
              >
                Features
              </a>
              <button
                onClick={() => setCurrentView("discover")}
                className="px-3 py-1.5 text-sm font-semibold text-[#A1A1AA] hover:text-[#EDEDED] transition-colors cursor-pointer"
              >
                Explore Ideas
              </button>
            </>
          ) : (
            <>
              <button
                id="nav-dashboard-btn"
                onClick={() => setCurrentView("dashboard")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentView === "dashboard"
                    ? "bg-[#18181B] text-[#EDEDED] border border-[#27272A] shadow-inner"
                    : "text-[#A1A1AA] hover:bg-[#18181B]/60 hover:text-[#EDEDED]"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-[#F59E0B]" />
                <span>Dashboard</span>
              </button>

              <button
                id="nav-discover-btn"
                onClick={() => setCurrentView("discover")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentView === "discover"
                    ? "bg-[#18181B] text-[#EDEDED] border border-[#27272A] shadow-inner"
                    : "text-[#A1A1AA] hover:bg-[#18181B]/60 hover:text-[#EDEDED]"
                }`}
              >
                <Compass className="w-4 h-4 text-[#F59E0B]" />
                <span>Discover</span>
              </button>

              <button
                id="nav-workspace-btn"
                onClick={() => setCurrentView("saved")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentView === "saved"
                    ? "bg-[#18181B] text-[#EDEDED] border border-[#27272A] shadow-inner"
                    : "text-[#A1A1AA] hover:bg-[#18181B]/60 hover:text-[#EDEDED]"
                }`}
              >
                <FolderKanban className="w-4 h-4 text-[#F59E0B]" />
                <span>Workspace</span>
                {savedIdeas.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-[#F59E0B] text-[#0A0A0B] font-bold text-xs rounded-full">
                    {savedIdeas.length}
                  </span>
                )}
              </button>

              <button
                id="nav-compare-btn"
                onClick={() => setCurrentView("compare")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  currentView === "compare"
                    ? "bg-[#18181B] text-[#EDEDED] border border-[#27272A] shadow-inner"
                    : "text-[#A1A1AA] hover:bg-[#18181B]/60 hover:text-[#EDEDED]"
                }`}
              >
                <Scale className="w-4 h-4 text-[#F59E0B]" />
                <span>Compare</span>
              </button>
            </>
          )}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentView === "landing" ? (
            <>
              <button
                id="nav-login-btn"
                onClick={() => setCurrentView("dashboard")}
                className="px-4 py-2 text-sm font-bold text-[#A1A1AA] hover:text-[#EDEDED] hover:bg-[#18181B] rounded-full transition-colors cursor-pointer"
              >
                Enter App
              </button>

              <button
                id="nav-start-building-btn"
                onClick={handleStartBuilding}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#F59E0B] text-[#0A0A0B] text-sm font-bold rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] group cursor-pointer"
              >
                <span className="font-anton tracking-wide">START BUILDING</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-[#0A0A0B]" />
              </button>
            </>
          ) : (
            <>
              <button
                id="nav-settings-btn"
                onClick={() => setCurrentView("settings")}
                title="Founder Profile & Settings"
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  currentView === "settings"
                    ? "border-[#F59E0B] bg-[#F59E0B]/20 text-[#F59E0B]"
                    : "border-[#27272A] text-[#A1A1AA] hover:border-[#3F3F46] hover:text-[#EDEDED]"
                }`}
              >
                <Sliders className="w-4 h-4" />
              </button>

              <button
                id="nav-generator-cta"
                onClick={() => setCurrentView("discover")}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-[#0A0A0B] font-bold text-xs uppercase tracking-wider rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Idea</span>
              </button>

              <button
                onClick={() => setCurrentView("settings")}
                title="Account"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-[#27272A] bg-[#18181B] hover:border-[#3F3F46] transition-all text-xs font-semibold text-[#EDEDED] cursor-pointer"
              >
                <UserCircle2 className="w-5 h-5 text-[#F59E0B]" />
                <span className="hidden lg:inline-block max-w-[100px] truncate">
                  {user?.name || "Founder"}
                </span>
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
