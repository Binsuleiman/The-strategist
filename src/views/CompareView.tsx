import React from "react";
import { useApp } from "../context/AppContext";
import { ScoreRing } from "../components/ScoreRing";
import { 
  Scale, 
  ArrowLeft, 
  Trash2, 
  Flame, 
  ArrowRight, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from "lucide-react";

export const CompareView: React.FC = () => {
  const { 
    ideas, 
    savedIdeas, 
    selectedForComparison, 
    toggleComparisonSelect, 
    setCurrentView, 
    openIdea 
  } = useApp();

  const allAvailable = [...savedIdeas, ...ideas].filter(
    (v, i, a) => a.findIndex((t) => t.id === v.id) === i
  );

  const comparedIdeas = allAvailable.filter((i) =>
    selectedForComparison.includes(i.id)
  );

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EDEDED] pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
          <div>
            <button
              onClick={() => setCurrentView("discover")}
              className="inline-flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider text-[#71717A] hover:text-[#EDEDED] mb-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Opportunities</span>
            </button>
            <h1 className="font-anton text-4xl sm:text-5xl text-[#EDEDED] uppercase tracking-tight">
              COMPARE OPPORTUNITIES
            </h1>
            <p className="text-xs md:text-sm text-[#A1A1AA] mt-1 font-mono-code">
              Side-by-side multivariate analysis to pick your highest ROI venture.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code text-[#71717A]">
              {comparedIdeas.length} Selected (Max 4)
            </span>
          </div>
        </div>

        {comparedIdeas.length === 0 ? (
          <div className="bg-[#131315] border-2 border-dashed border-[#27272A] rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#18181B] border border-[#27272A] text-[#F59E0B] flex items-center justify-center font-bold mb-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <Scale className="w-7 h-7" />
            </div>
            <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase mb-2">
              NO OPPORTUNITIES SELECTED
            </h3>
            <p className="text-xs md:text-sm text-[#A1A1AA] max-w-md mb-6">
              Select 2 to 4 ideas from your Discover or Workspace page using the comparison scale icon.
            </p>
            <button
              onClick={() => setCurrentView("discover")}
              className="px-6 py-3 bg-[#F59E0B] text-[#0A0A0B] font-anton text-sm tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
            >
              BROWSE OPPORTUNITIES
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto pb-6">
            <div className="grid grid-flow-col auto-cols-[300px] md:auto-cols-[340px] gap-6 min-w-full">
              {comparedIdeas.map((idea) => {
                return (
                  <div
                    key={idea.id}
                    className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6"
                  >
                    
                    {/* Top title & score */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 bg-[#18181B] text-[#F59E0B] border border-[#27272A] font-mono-code font-bold text-[10px] uppercase rounded">
                          CANDIDATE
                        </span>
                        <button
                          onClick={() => toggleComparisonSelect(idea.id)}
                          className="text-[#71717A] hover:text-rose-400 transition-colors p-1 cursor-pointer"
                          title="Remove from comparison"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <h3 className="font-anton text-2xl text-[#EDEDED] uppercase leading-tight">
                          {idea.name}
                        </h3>
                        <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-2">
                          {idea.tagline}
                        </p>
                      </div>

                      {/* Score Ring */}
                      <div className="flex justify-center p-3 bg-[#0F0F11] rounded-xl border border-[#27272A]">
                        <ScoreRing score={idea.opportunityScore} size="md" label="Overall Score" />
                      </div>
                    </div>

                    {/* Breakdown Matrix */}
                    <div className="space-y-3 text-xs font-mono-code border-t border-b border-[#27272A] py-4">
                      <div className="flex justify-between">
                        <span className="text-[#71717A]">Market Demand:</span>
                        <strong className="text-[#EDEDED]">{idea.scoreBreakdown?.marketDemand || 80}/100</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#71717A]">Customer Pain:</span>
                        <strong className="text-[#EDEDED]">{idea.scoreBreakdown?.customerPain || 85}/100</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#71717A]">Monetization:</span>
                        <strong className="text-[#EDEDED]">{idea.scoreBreakdown?.monetization || 80}/100</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#71717A]">Founder Fit:</span>
                        <strong className="text-[#EDEDED]">{idea.scoreBreakdown?.founderFit || 85}/100</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#71717A]">Capital Needed:</span>
                        <strong className="text-[#EDEDED] uppercase">{idea.startupCost || "LOW"}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#71717A]">Execution:</span>
                        <strong className="text-[#EDEDED] uppercase">{idea.executionDifficulty || "MEDIUM"}</strong>
                      </div>
                    </div>

                    {/* Target customer & Pain */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-mono-code font-bold uppercase text-[10px] text-[#71717A] block">
                          TARGET AUDIENCE
                        </span>
                        <span className="font-medium text-[#EDEDED]">{idea.targetCustomer}</span>
                      </div>
                      <div>
                        <span className="font-mono-code font-bold uppercase text-[10px] text-[#71717A] block">
                          CORE SOLUTION
                        </span>
                        <span className="text-[#A1A1AA] line-clamp-3">{idea.solution}</span>
                      </div>
                    </div>

                    {/* Open strategy button */}
                    <button
                      onClick={() => openIdea(idea)}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#F59E0B] text-[#0A0A0B] font-anton text-xs tracking-wider uppercase rounded-xl hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
                    >
                      <span>OPEN FULL STRATEGY</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
