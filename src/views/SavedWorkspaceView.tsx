import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { IdeaCard } from "../components/IdeaCard";
import { Idea } from "../types";
import { 
  FolderKanban, 
  Search, 
  Download, 
  SlidersHorizontal, 
  ArrowRight, 
  Sparkles, 
  Plus 
} from "lucide-react";

export const SavedWorkspaceView: React.FC = () => {
  const { savedIdeas, setCurrentView, addToast } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "cost" | "name">("score");

  // Filtering
  const filtered = savedIdeas.filter((idea) => {
    const matchesStatus =
      filterStatus === "ALL" || (idea.status || "EXPLORING") === filterStatus;
    const matchesSearch =
      idea.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.targetCustomer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "score") {
      return (b.opportunityScore || 0) - (a.opportunityScore || 0);
    }
    if (sortBy === "cost") {
      const order = { LOW: 1, MEDIUM: 2, HIGH: 3 };
      return (order[a.startupCost || "LOW"] || 1) - (order[b.startupCost || "LOW"] || 1);
    }
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const exportAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedIdeas, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `strategist-workspace-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      type: "success",
      title: "Workspace Exported",
      message: "Exported workspace data to JSON file.",
    });
  };

  const exportAsMarkdown = () => {
    let md = `# STRATEGIST.AI — SAVED VENTURE WORKSPACE\nExport Date: ${new Date().toLocaleDateString()}\n\n`;
    savedIdeas.forEach((idea, idx) => {
      md += `## ${idx + 1}. ${idea.name} (Opportunity Score: ${idea.opportunityScore}/100)\n`;
      md += `**Tagline:** ${idea.tagline}\n`;
      md += `**Target Customer:** ${idea.targetCustomer}\n`;
      md += `**Problem:** ${idea.problem}\n`;
      md += `**Solution:** ${idea.solution}\n`;
      md += `**Business Model:** ${idea.businessModel}\n`;
      md += `**Startup Cost:** ${idea.startupCost} | **Difficulty:** ${idea.executionDifficulty}\n\n`;
      if (idea.validationReport) {
        md += `### Validation Verdict: ${idea.validationReport.recommendation}\n`;
        md += `${idea.validationReport.executiveSummary}\n\n`;
      }
      if (idea.stressTest) {
        md += `### Devil's Advocate Diagnosis\n`;
        md += `**Headline:** ${idea.stressTest.headline}\n`;
        md += `**Verdict:** ${idea.stressTest.overallVerdict}\n\n`;
      }
      md += `---\n\n`;
    });

    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `strategist-workspace-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      type: "success",
      title: "Workspace Exported",
      message: "Exported workspace report to Markdown.",
    });
  };

  const STATUSES = ["ALL", "EXPLORING", "VALIDATING", "BUILDING", "LAUNCHED"];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EDEDED] pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
          <div>
            <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B] mb-1 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#F59E0B]" />
              <span>SAVED VENTURE DOSSIERS</span>
            </div>
            <h1 className="font-anton text-4xl sm:text-5xl text-[#EDEDED] uppercase tracking-tight">
              YOUR WORKSPACE
            </h1>
            <p className="text-xs md:text-sm text-[#A1A1AA] mt-1 font-mono-code">
              {savedIdeas.length} Saved Opportunities in active pipeline.
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportAsMarkdown}
              disabled={savedIdeas.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#131315] border border-[#27272A] rounded-xl text-xs font-mono-code font-bold uppercase text-[#EDEDED] hover:bg-[#18181B] disabled:opacity-40 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </button>

            <button
              onClick={exportAsJSON}
              disabled={savedIdeas.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#131315] border border-[#27272A] rounded-xl text-xs font-mono-code font-bold uppercase text-[#EDEDED] hover:bg-[#18181B] disabled:opacity-40 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .JSON</span>
            </button>

            <button
              onClick={() => setCurrentView("discover")}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#F59E0B] text-[#0A0A0B] rounded-xl text-xs font-anton tracking-wider uppercase hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NEW IDEA</span>
            </button>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {STATUSES.map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === st
                    ? "bg-[#F59E0B] text-[#0A0A0B]"
                    : "bg-[#18181B] border border-[#27272A] text-[#71717A] hover:text-[#EDEDED]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search dossiers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#0F0F11] border border-[#27272A] rounded-xl text-xs font-sans text-[#EDEDED] focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#0F0F11] border border-[#27272A] rounded-xl text-xs font-mono-code font-bold uppercase text-[#EDEDED] focus:outline-none focus:border-[#F59E0B] cursor-pointer"
            >
              <option value="score">Sort: Highest Score</option>
              <option value="cost">Sort: Lowest Cost</option>
              <option value="name">Sort: Alphabetical</option>
            </select>
          </div>

        </div>

        {/* Saved Ideas Grid */}
        {sorted.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        ) : (
          <div className="bg-[#131315] border-2 border-dashed border-[#27272A] rounded-2xl p-12 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-[#18181B] border border-[#27272A] text-[#F59E0B] flex items-center justify-center font-bold mb-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <FolderKanban className="w-7 h-7" />
            </div>
            <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase mb-2">
              NO DOSSIERS MATCH YOUR FILTER
            </h3>
            <p className="text-xs md:text-sm text-[#A1A1AA] max-w-md mb-6">
              {savedIdeas.length === 0
                ? "You haven't bookmarked any opportunities to your workspace yet. Discover and save your top candidates."
                : "No saved ideas match your current search or status filter."}
            </p>
            <button
              onClick={() => setCurrentView("discover")}
              className="px-6 py-3 bg-[#F59E0B] text-[#0A0A0B] font-anton text-sm tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
            >
              EXPLORE OPPORTUNITIES
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
