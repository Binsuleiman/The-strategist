import React from "react";
import { Idea } from "../types";
import { useApp } from "../context/AppContext";
import { 
  Bookmark, 
  BookmarkCheck, 
  ArrowUpRight, 
  ShieldAlert, 
  Flame, 
  DollarSign, 
  Zap,
  CheckCircle2,
  Scale
} from "lucide-react";

interface IdeaCardProps {
  idea: Idea;
  onSelect?: () => void;
  showComparisonToggle?: boolean;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  onSelect,
  showComparisonToggle = true,
}) => {
  const { 
    savedIdeas, 
    saveIdea, 
    unsaveIdea, 
    openIdea, 
    selectedForComparison, 
    toggleComparisonSelect 
  } = useApp();

  const isSaved = savedIdeas.some((i) => i.id === idea.id) || Boolean(idea.isSaved);
  const isCompared = selectedForComparison.includes(idea.id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      unsaveIdea(idea.id);
    } else {
      saveIdea(idea);
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect();
    } else {
      openIdea(idea);
    }
  };

  const costColor = {
    LOW: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
    MEDIUM: "bg-amber-950/60 text-amber-300 border-amber-800/60",
    HIGH: "bg-rose-950/60 text-rose-300 border-rose-800/60",
  }[idea.startupCost || "LOW"];

  const difficultyColor = {
    LOW: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
    MEDIUM: "bg-amber-950/60 text-amber-300 border-amber-800/60",
    HIGH: "bg-rose-950/60 text-rose-300 border-rose-800/60",
  }[idea.executionDifficulty || "MEDIUM"];

  return (
    <div
      id={`idea-card-${idea.id}`}
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between bg-[#131315] border border-[#27272A] rounded-xl p-5 md:p-6 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-1 hover:border-[#F59E0B]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)] ${
        isCompared ? "ring-2 ring-[#F59E0B] border-[#F59E0B]" : ""
      }`}
    >
      {/* Top row: Score + Badges + Bookmark */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          
          {/* Opportunity Score Pill */}
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 bg-[#1C1C1F] text-[#F59E0B] border border-[#27272A] rounded-lg font-anton tracking-wider text-base md:text-lg flex items-center gap-1.5 shadow-sm">
              <Flame className="w-4 h-4 text-[#F59E0B]" />
              <span>{idea.opportunityScore}</span>
              <span className="text-[10px] font-mono-code font-normal text-[#A1A1AA]">/100</span>
            </div>

            {idea.validationReport && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Validated
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {showComparisonToggle && (
              <button
                id={`compare-toggle-${idea.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComparisonSelect(idea.id);
                }}
                title={isCompared ? "Remove from comparison" : "Add to comparison"}
                className={`p-2 rounded-lg border transition-all cursor-pointer ${
                  isCompared
                    ? "bg-[#F59E0B] text-[#0A0A0B] border-[#F59E0B]"
                    : "bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:border-[#3F3F46] hover:text-[#EDEDED]"
                }`}
              >
                <Scale className="w-4 h-4" />
              </button>
            )}

            <button
              id={`save-btn-${idea.id}`}
              onClick={handleBookmark}
              title={isSaved ? "Saved in Workspace" : "Save to Workspace"}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isSaved
                  ? "bg-[#F59E0B] text-[#0A0A0B] border-[#F59E0B]"
                  : "bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:border-[#3F3F46] hover:text-[#EDEDED]"
              }`}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-[#0A0A0B]" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="mb-4">
          <h3 className="font-anton text-xl md:text-2xl text-[#EDEDED] uppercase tracking-wide group-hover:text-[#F59E0B] transition-colors leading-tight">
            {idea.name}
          </h3>
          <p className="text-xs md:text-sm font-medium text-[#A1A1AA] mt-1 line-clamp-2">
            {idea.tagline}
          </p>
        </div>

        {/* Target Customer Box */}
        <div className="bg-[#18181B] rounded-lg p-3 border border-[#27272A] mb-3 text-xs">
          <div className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#71717A] mb-0.5">
            Target Customer
          </div>
          <div className="font-medium text-[#EDEDED] line-clamp-2">
            {idea.targetCustomer}
          </div>
        </div>

        {/* Problem & Solution Mini Extract */}
        <div className="space-y-1.5 text-xs text-[#A1A1AA] mb-4">
          <div className="line-clamp-2">
            <strong className="text-[#EDEDED] font-bold">Pain: </strong>
            {idea.problem}
          </div>
        </div>
      </div>

      {/* Footer Details: Startup Cost, Execution Difficulty & Open CTA */}
      <div className="pt-3 border-t border-[#27272A]">
        <div className="flex items-center justify-between gap-2 mb-3 text-[11px] font-mono-code">
          <div className="flex items-center gap-1.5">
            <span className="text-[#71717A]">COST:</span>
            <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase ${costColor}`}>
              {idea.startupCost || "LOW"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#71717A]">EXECUTION:</span>
            <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase ${difficultyColor}`}>
              {idea.executionDifficulty || "MEDIUM"}
            </span>
          </div>
        </div>

        <button
          id={`explore-btn-${idea.id}`}
          onClick={(e) => {
            e.stopPropagation();
            openIdea(idea);
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#18181B] border border-[#27272A] text-[#EDEDED] text-xs font-bold uppercase tracking-wider rounded-lg group-hover:bg-[#F59E0B] group-hover:text-[#0A0A0B] group-hover:border-[#F59E0B] active:scale-95 transition-all cursor-pointer"
        >
          <span>Explore Strategy</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#F59E0B] group-hover:text-[#0A0A0B] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
