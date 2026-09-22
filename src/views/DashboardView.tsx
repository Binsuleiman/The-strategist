import React from "react";
import { useApp } from "../context/AppContext";
import { IdeaCard } from "../components/IdeaCard";
import { 
  Sparkles, 
  FolderKanban, 
  Scale, 
  ArrowRight, 
  Flame, 
  Layers, 
  CheckCircle2, 
  Hammer, 
  TrendingUp,
  Compass
} from "lucide-react";

export const DashboardView: React.FC = () => {
  const { 
    user, 
    savedIdeas, 
    ideas, 
    setCurrentView, 
    openIdea, 
    founderProfile 
  } = useApp();

  const allAvailableIdeas = savedIdeas.length > 0 ? savedIdeas : ideas;

  // Real metric calculations based on actual user data
  const totalIdeasCount = savedIdeas.length > 0 ? savedIdeas.length : ideas.length;
  const validatedCount = allAvailableIdeas.filter((i) => Boolean(i.validationReport)).length;
  const strongOpportunitiesCount = allAvailableIdeas.filter((i) => (i.opportunityScore || 0) >= 85).length;
  const buildingCount = allAvailableIdeas.filter((i) => i.status === "BUILDING").length;

  // Best recommended opportunity
  const recommendedIdea = allAvailableIdeas.length > 0
    ? [...allAvailableIdeas].sort((a, b) => b.opportunityScore - a.opportunityScore)[0]
    : null;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EDEDED] pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#27272A] pb-6">
          <div>
            <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B] mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>FOUNDER STRATEGY OS</span>
            </div>
            <h1 className="font-anton text-4xl sm:text-5xl md:text-6xl text-[#EDEDED] uppercase tracking-tight leading-none">
              WELCOME BACK, {user?.name ? user.name.toUpperCase() : "FOUNDER"}.
            </h1>
            <p className="text-xs md:text-sm text-[#A1A1AA] mt-2">
              Profile: <span className="font-semibold text-[#EDEDED]">{founderProfile.businessType}</span> · Focus: <span className="font-semibold text-[#EDEDED]">{founderProfile.targetMarket}</span> · Risk: <span className="font-semibold text-[#EDEDED]">{founderProfile.riskTolerance}</span>
            </p>
          </div>

          {/* Quick Action CTA */}
          <button
            id="dash-new-generation-btn"
            onClick={() => setCurrentView("discover")}
            className="flex items-center gap-2 px-6 py-3.5 bg-[#F59E0B] text-[#0A0A0B] font-anton text-sm tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0 group cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#0A0A0B]" />
            <span>DISCOVER NEW BUSINESS</span>
            <ArrowRight className="w-4 h-4 text-[#0A0A0B] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Real User Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-[#131315] border border-[#27272A] rounded-xl p-5 shadow-sm hover:border-[#F59E0B]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all">
            <div className="text-xs font-mono-code font-bold uppercase text-[#71717A] mb-1">
              IDEAS
            </div>
            <div className="font-anton text-4xl text-[#EDEDED]">
              {totalIdeasCount}
            </div>
            <div className="text-[11px] text-[#71717A] mt-1 font-mono-code">
              {savedIdeas.length} in Workspace
            </div>
          </div>

          <div className="bg-[#131315] border border-[#27272A] rounded-xl p-5 shadow-sm hover:border-[#F59E0B]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all">
            <div className="text-xs font-mono-code font-bold uppercase text-[#71717A] mb-1">
              VALIDATED
            </div>
            <div className="font-anton text-4xl text-[#EDEDED]">
              {validatedCount}
            </div>
            <div className="text-[11px] text-[#71717A] mt-1 font-mono-code">
              Full diligence reports
            </div>
          </div>

          <div className="bg-[#131315] border border-[#27272A] rounded-xl p-5 shadow-sm hover:border-[#F59E0B]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all">
            <div className="text-xs font-mono-code font-bold uppercase text-[#71717A] mb-1">
              STRONG OPPORTUNITIES
            </div>
            <div className="font-anton text-4xl text-[#EDEDED]">
              {strongOpportunitiesCount}
            </div>
            <div className="text-[11px] text-[#71717A] mt-1 font-mono-code">
              Score ≥ 85 / 100
            </div>
          </div>

          <div className="bg-[#131315] border border-[#27272A] rounded-xl p-5 shadow-sm hover:border-[#F59E0B]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all">
            <div className="text-xs font-mono-code font-bold uppercase text-[#71717A] mb-1">
              BUILDING
            </div>
            <div className="font-anton text-4xl text-[#EDEDED]">
              {buildingCount}
            </div>
            <div className="text-[11px] text-[#71717A] mt-1 font-mono-code">
              Active MVP sprints
            </div>
          </div>

        </div>

        {/* Highlight Recommendation Card */}
        {recommendedIdea ? (
          <div className="bg-[#18181B] text-[#EDEDED] border-2 border-[#F59E0B] rounded-2xl p-6 md:p-8 shadow-[0_0_30px_rgba(245,158,11,0.12)] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F59E0B] text-[#0A0A0B] font-mono-code font-bold text-[10px] uppercase tracking-wider rounded mb-3">
                <Flame className="w-3.5 h-3.5" />
                RECOMMENDED OPPORTUNITY
              </div>
              <h2 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase tracking-wide mb-2">
                {recommendedIdea.name}
              </h2>
              <p className="text-sm md:text-base text-[#A1A1AA] mb-4">
                {recommendedIdea.tagline}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono-code text-[#A1A1AA]">
                <span className="px-2.5 py-1 bg-[#131315] rounded border border-[#27272A]">
                  Target: {recommendedIdea.targetCustomer}
                </span>
                <span className="px-2.5 py-1 bg-[#131315] rounded border border-[#27272A]">
                  Model: {recommendedIdea.businessModel}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 relative z-10 w-full md:w-auto">
              <div className="px-5 py-3 bg-[#131315] border border-[#27272A] rounded-xl text-center w-full sm:w-auto">
                <div className="font-anton text-3xl text-[#F59E0B] leading-none">
                  {recommendedIdea.opportunityScore}
                </div>
                <div className="text-[9px] font-mono-code font-bold text-[#71717A] uppercase mt-1">
                  OPPORTUNITY SCORE
                </div>
              </div>

              <button
                id="dash-view-recommended-btn"
                onClick={() => openIdea(recommendedIdea)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-[#F59E0B] text-[#0A0A0B] font-anton text-sm tracking-wider uppercase rounded-xl hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer"
              >
                <span>VIEW OPPORTUNITY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#131315] border-2 border-dashed border-[#27272A] rounded-2xl p-8 md:p-12 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#18181B] text-[#F59E0B] border border-[#27272A] flex items-center justify-center font-bold mb-4">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase mb-2">
              READY TO DISCOVER YOUR NEXT BUSINESS?
            </h3>
            <p className="text-xs md:text-sm text-[#A1A1AA] max-w-md mb-6">
              Generate 5 personalized opportunities calibrated to your profile, validate market demand, and build a 7-day action plan.
            </p>
            <button
              onClick={() => setCurrentView("discover")}
              className="flex items-center gap-2 px-8 py-3.5 bg-[#F59E0B] text-[#0A0A0B] font-anton text-sm tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#0A0A0B]" />
              <span>GENERATE IDEAS NOW</span>
            </button>
          </div>
        )}

        {/* Recent / Active Opportunities Section */}
        {allAvailableIdeas.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase tracking-wide">
                  YOUR OPPORTUNITIES
                </h3>
                <p className="text-xs text-[#71717A] font-mono-code">
                  Click any card to access validation, devil's advocate, business model, and 7-day plan.
                </p>
              </div>

              <button
                onClick={() => setCurrentView("saved")}
                className="text-xs font-bold font-mono-code uppercase tracking-wider text-[#F59E0B] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allAvailableIdeas.slice(0, 6).map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
