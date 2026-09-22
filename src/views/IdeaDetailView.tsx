import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Idea, IdeaDetailTab } from "../types";
import { ScoreRing } from "../components/ScoreRing";
import { ScoreBreakdownBar } from "../components/ScoreBreakdownBar";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { PersonaInterviewSimulator } from "../components/PersonaInterviewSimulator";
import { FinancialUnitEconomicsCalculator } from "../components/FinancialUnitEconomicsCalculator";
import { LaunchKitGenerator } from "../components/LaunchKitGenerator";
import { LiveCompetitorIntelligence } from "../components/LiveCompetitorIntelligence";
import confetti from "canvas-confetti";
import {
  validateIdeaApi,
  analyzeCompetitorsApi,
  stressTestIdeaApi,
  improveIdeaApi,
  generateBusinessModelApi,
  generateMVPApi,
  generateActionPlanApi,
} from "../services/api";
import {
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldAlert,
  BarChart3,
  Layers,
  Zap,
  Calendar,
  Sparkles,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Wrench,
  Check,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Target,
  Calculator,
  Rocket,
  Globe,
  Edit2,
  X,
} from "lucide-react";

export const IdeaDetailView: React.FC = () => {
  const {
    currentIdea,
    setCurrentIdea,
    currentIdeaTab,
    setCurrentIdeaTab,
    updateIdea,
    savedIdeas,
    saveIdea,
    unsaveIdea,
    setCurrentView,
    founderProfile,
    updateIdeaStatus,
    toggleActionTask,
    addToast,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingTitle, setLoadingTitle] = useState("ANALYZING OPPORTUNITY...");
  const [loadingSteps, setLoadingSteps] = useState<string[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(currentIdea?.name || "");

  const handleSaveTitle = () => {
    if (!currentIdea) return;
    const cleanTitle = editedTitle.trim();
    if (!cleanTitle) {
      addToast({ type: "warning", title: "Empty Name", message: "Idea name cannot be empty." });
      return;
    }
    const updated: Idea = { ...currentIdea, name: cleanTitle };
    updateIdea(updated);
    setCurrentIdea(updated);
    setIsEditingTitle(false);
    addToast({ type: "success", title: "Idea Renamed", message: `Updated name to "${cleanTitle}".` });
  };

  if (!currentIdea) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] pt-28 text-center p-8">
        <h2 className="font-anton text-2xl uppercase mb-4 text-[#EDEDED]">No Opportunity Selected</h2>
        <button
          onClick={() => setCurrentView("discover")}
          className="px-6 py-3 bg-[#F59E0B] text-[#0A0A0B] font-anton rounded-full hover:bg-[#FBBF24] transition-colors cursor-pointer"
        >
          Back to Discover
        </button>
      </div>
    );
  }

  const isSaved = savedIdeas.some((i) => i.id === currentIdea.id) || Boolean(currentIdea.isSaved);

  const handleBookmarkToggle = () => {
    if (isSaved) {
      unsaveIdea(currentIdea.id);
    } else {
      saveIdea(currentIdea);
    }
  };

  // --- AI Workflow Triggers ---

  // 1. Validation
  const handleRunValidation = async () => {
    setIsLoading(true);
    setLoadingTitle("RUNNING VENTURE VALIDATION...");
    setLoadingSteps([
      "Evaluating customer willingness-to-pay",
      "Calculating TAM / SAM / SOM market metrics",
      "Analyzing organic & paid acquisition channels",
      "Synthesizing 48-hour smoke testing experiments",
      "Formulating institutional PURSUE / AVOID verdict",
    ]);
    try {
      const res = await validateIdeaApi(currentIdea, founderProfile);
      const updated: Idea = { ...currentIdea, validationReport: res.report };
      updateIdea(updated);
      setCurrentIdea(updated);
      addToast({
        type: "success",
        title: "Validation Complete",
        message: `Recommendation: ${res.report.recommendation}`,
      });
    } catch (e: any) {
      addToast({ type: "error", title: "Validation Error", message: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Competitors & Real Market Signal (Live Search Grounding)
  const handleRunCompetitors = async (customQuery?: string) => {
    setIsLoading(true);
    setLoadingTitle(
      customQuery
        ? `SEARCH GROUNDING: "${customQuery.slice(0, 32)}..."`
        : "SEARCH GROUNDING: SCANNING LIVE MARKET & REAL INCUMBENTS..."
    );
    setLoadingSteps([
      "Querying Google Search for real active startups & category incumbents",
      "Extracting live website URLs, verified pricing, and funding status",
      "Analyzing user grievances, churn complaints, and negative reviews",
      "Synthesizing your asymmetric differentiation wedge & live citations",
    ]);
    try {
      const res = await analyzeCompetitorsApi(currentIdea, customQuery);
      const updated: Idea = {
        ...currentIdea,
        competitors: res.competitors,
        liveMarketIntelligence: res.liveMarketIntelligence,
      };
      updateIdea(updated);
      setCurrentIdea(updated);
      addToast({
        type: "success",
        title: "Live Market Verified",
        message: `Identified ${res.competitors.length} active players with Google Search Grounding.`,
      });
    } catch (e: any) {
      addToast({ type: "error", title: "Market Search Error", message: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Stress Test (Devil's Advocate)
  const handleRunStressTest = async () => {
    setIsLoading(true);
    setLoadingTitle("DEVIL'S ADVOCATE: ATTEMPTING TO BREAK BUSINESS...");
    setLoadingSteps([
      "Identifying hidden churn risks and distribution traps",
      "Simulating CAC / LTV unit economic death spirals",
      "Auditing platform dependency & copycat vulnerability",
      "Crafting mandatory founder mitigation countermeasures",
    ]);
    try {
      const res = await stressTestIdeaApi(currentIdea, founderProfile);
      const updated: Idea = { ...currentIdea, stressTest: res.stressTest };
      updateIdea(updated);
      setCurrentIdea(updated);
      addToast({
        type: "warning",
        title: "Stress Test Completed",
        message: `Identified ${res.stressTest.failureReasons.length} lethal failure vectors.`,
      });
    } catch (e: any) {
      addToast({ type: "error", title: "Stress Test Error", message: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Improve Idea
  const handleRunImprovement = async () => {
    setIsLoading(true);
    setLoadingTitle("HARDENING & SHARPENING IDEA (V2.0)...");
    setLoadingSteps([
      "Pivoting target customer to high-budget sub-niche",
      "Reframing value proposition into guaranteed outcome",
      "Restructuring pricing to ensure immediate cash flow",
      "Constructing defensible workflow switching moat",
    ]);
    try {
      const res = await improveIdeaApi(currentIdea, currentIdea.stressTest);
      const updated: Idea = { ...currentIdea, improvedVersion: res.improvedVersion };
      updateIdea(updated);
      setCurrentIdea(updated);
      addToast({
        type: "success",
        title: "Idea Hardened to 2.0",
        message: `Adjusted Opportunity Score: ${res.improvedVersion.adjustedOpportunityScore}/100`,
      });
    } catch (e: any) {
      addToast({ type: "error", title: "Improvement Error", message: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Business Model
  const handleRunBusinessModel = async () => {
    setIsLoading(true);
    setLoadingTitle("GENERATING BUSINESS MODEL CANVAS...");
    setLoadingSteps([
      "Structuring customer segments & value pillars",
      "Calculating recurring MRR & setup fee revenue streams",
      "Mapping distribution channels & key activities",
      "Estimating cloud and operational cost baseline",
    ]);
    try {
      const res = await generateBusinessModelApi(currentIdea);
      const updated: Idea = { ...currentIdea, businessModelCanvas: res.businessModelCanvas };
      updateIdea(updated);
      setCurrentIdea(updated);
      addToast({
        type: "success",
        title: "Business Model Ready",
        message: "Full 8-part canvas generated.",
      });
    } catch (e: any) {
      addToast({ type: "error", title: "Canvas Error", message: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 6. MVP Blueprint
  const handleRunMVP = async () => {
    setIsLoading(true);
    setLoadingTitle("BUILDING LEAN MVP BLUEPRINT...");
    setLoadingSteps([
      "Triaging absolute must-have core features (BUILD FIRST)",
      "Deferring secondary features to v1.1 (BUILD LATER)",
      "Flagging feature bloat traps to avoid (DON'T BUILD YET)",
      "Mapping end-to-end 3-step user transformation flow",
    ]);
    try {
      const res = await generateMVPApi(currentIdea);
      const updated: Idea = { ...currentIdea, mvpBlueprint: res.mvpBlueprint };
      updateIdea(updated);
      setCurrentIdea(updated);
      addToast({
        type: "success",
        title: "MVP Blueprint Ready",
        message: `Estimated build time: ${res.mvpBlueprint.estimatedBuildTimeWeeks} weeks.`,
      });
    } catch (e: any) {
      addToast({ type: "error", title: "MVP Error", message: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Action Plan
  const handleRunActionPlan = async () => {
    setIsLoading(true);
    setLoadingTitle("GENERATING 7-DAY ACTION SPRINT...");
    setLoadingSteps([
      "Day 1-3: Offer crafting, discovery calls & pre-sales",
      "Day 4-6: Outbound outreach, concierge beta delivery",
      "Day 7: Final Go/No-Go Decision Council",
      "Calibrating clear build, pivot & abandon signals",
    ]);
    try {
      const res = await generateActionPlanApi(currentIdea, currentIdea.mvpBlueprint);
      const updated: Idea = { ...currentIdea, actionPlan: res.actionPlan };
      updateIdea(updated);
      setCurrentIdea(updated);
      addToast({
        type: "success",
        title: "7-Day Action Plan Generated",
        message: "Your step-by-step roadmap is live.",
      });
    } catch (e: any) {
      addToast({ type: "error", title: "Action Plan Error", message: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Check action plan completion for celebratory confetti
  const handleTaskToggle = (dayNum: number, taskId: string) => {
    toggleActionTask(currentIdea.id, dayNum, taskId);
    // Trigger confetti if last task or high progress
    if (Math.random() > 0.6) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const TABS: Array<{ id: IdeaDetailTab; label: string; icon: any; isReady: boolean }> = [
    { id: "overview", label: "Overview", icon: Target, isReady: true },
    { id: "validation", label: "Validation", icon: BarChart3, isReady: Boolean(currentIdea.validationReport) },
    { id: "financials", label: "Financials & Breakeven", icon: Calculator, isReady: Boolean(currentIdea.financialModel) },
    { id: "launch-kit", label: "Launch Kit (GTM)", icon: Rocket, isReady: Boolean(currentIdea.launchKit) },
    { id: "personas", label: "Customer Personas", icon: Users, isReady: Boolean(currentIdea.interviewSessions?.length) },
    { id: "competitors", label: "Market Radar (Live Search)", icon: Globe, isReady: Boolean(currentIdea.competitors) },
    { id: "stress-test", label: "Devil's Advocate", icon: ShieldAlert, isReady: Boolean(currentIdea.stressTest) },
    { id: "improve", label: "Improve (v2.0)", icon: Sparkles, isReady: Boolean(currentIdea.improvedVersion) },
    { id: "business-model", label: "Business Model", icon: DollarSign, isReady: Boolean(currentIdea.businessModelCanvas) },
    { id: "mvp", label: "MVP Blueprint", icon: Zap, isReady: Boolean(currentIdea.mvpBlueprint) },
    { id: "action-plan", label: "7-Day Plan", icon: Calendar, isReady: Boolean(currentIdea.actionPlan) },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EDEDED] pt-24 pb-20 px-4 md:px-8">
      <LoadingOverlay isOpen={isLoading} title={loadingTitle} steps={loadingSteps} />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Back navigation & Quick controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentView("discover")}
            className="inline-flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider text-[#71717A] hover:text-[#EDEDED] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Opportunities</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Status dropdown selector */}
            <select
              value={currentIdea.status || "EXPLORING"}
              onChange={(e) => updateIdeaStatus(currentIdea.id, e.target.value as Idea["status"])}
              className="px-3 py-1.5 bg-[#131315] border border-[#27272A] rounded-lg text-xs font-mono-code font-bold uppercase text-[#EDEDED] focus:outline-none focus:border-[#F59E0B] cursor-pointer"
            >
              <option value="EXPLORING">Status: Exploring</option>
              <option value="VALIDATING">Status: Validating</option>
              <option value="BUILDING">Status: Building</option>
              <option value="LAUNCHED">Status: Launched</option>
            </select>

            {/* Save Bookmark button */}
            <button
              onClick={handleBookmarkToggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono-code font-bold uppercase transition-all cursor-pointer ${
                isSaved
                  ? "bg-[#18181B] text-[#F59E0B] border-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                  : "bg-[#131315] text-[#A1A1AA] border-[#27272A] hover:border-[#F59E0B]/40 hover:text-[#EDEDED]"
              }`}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Master Opportunity Banner */}
        <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 bg-[#27272A] text-[#F59E0B] font-mono-code text-[11px] font-bold uppercase tracking-wider rounded border border-[#27272A]">
                  OPPORTUNITY FILE
                </span>
                <span className="px-2.5 py-0.5 bg-[#18181B] text-[#EDEDED] font-mono-code text-[11px] rounded border border-[#27272A]">
                  Cost: {currentIdea.startupCost || "LOW"}
                </span>
                <span className="px-2.5 py-0.5 bg-[#18181B] text-[#EDEDED] font-mono-code text-[11px] rounded border border-[#27272A]">
                  Difficulty: {currentIdea.executionDifficulty || "MEDIUM"}
                </span>
              </div>

              {isEditingTitle ? (
                <div className="flex items-center gap-2 pt-1 pb-1">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="font-anton text-2xl sm:text-3xl text-[#EDEDED] uppercase tracking-tight bg-[#0F0F11] border border-[#F59E0B] px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F59E0B] w-full max-w-xl"
                    placeholder="Enter Idea Name..."
                    autoFocus
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="px-4 py-2 bg-[#F59E0B] text-[#0A0A0B] text-xs font-mono-code font-bold uppercase rounded-lg hover:bg-[#FBBF24] transition-colors cursor-pointer shrink-0"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditedTitle(currentIdea.name);
                      setIsEditingTitle(false);
                    }}
                    className="p-2 bg-[#18181B] text-[#A1A1AA] hover:text-[#EDEDED] border border-[#27272A] rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                  <h1 className="font-anton text-4xl sm:text-5xl text-[#EDEDED] uppercase tracking-tight leading-tight">
                    {currentIdea.name}
                  </h1>
                  <button
                    onClick={() => {
                      setEditedTitle(currentIdea.name);
                      setIsEditingTitle(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-[#F59E0B] hover:border-[#F59E0B]/50 transition-all cursor-pointer"
                    title="Edit Name"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="text-sm md:text-base text-[#A1A1AA] max-w-3xl leading-relaxed">
                {currentIdea.tagline}
              </p>
            </div>

            {/* Score Ring Component */}
            <div className="shrink-0 flex items-center justify-center bg-[#0F0F11] p-4 rounded-xl border border-[#27272A]">
              <ScoreRing score={currentIdea.opportunityScore} size="lg" label="Opportunity Fit" />
            </div>

          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#27272A]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentIdeaTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentIdeaTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono-code text-xs uppercase font-bold tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#18181B] text-[#F59E0B] border border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                    : "bg-[#131315] text-[#A1A1AA] hover:bg-[#18181B] hover:text-[#EDEDED] border border-[#27272A]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#F59E0B]" : "text-[#71717A]"}`} />
                <span>{tab.label}</span>
                {tab.isReady && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* --- TAB CONTENT PANELS --- */}

        {/* 1. OVERVIEW TAB */}
        {currentIdeaTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Grid 1: Problem & Solution Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-rose-400 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>THE ACUTE CUSTOMER PAIN</span>
                </div>
                <h3 className="font-anton text-2xl text-[#EDEDED] uppercase mb-3">
                  PROBLEM BREAKDOWN
                </h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4">
                  {currentIdea.problem}
                </p>
                <div className="p-3 bg-[#0F0F11] rounded-xl border border-[#27272A] text-xs">
                  <strong className="text-[#EDEDED]">Target ICP: </strong>
                  <span className="text-[#A1A1AA]">{currentIdea.targetCustomer}</span>
                </div>
              </div>

              <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-emerald-400 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>THE UNFAIR SOLUTION MECHANISM</span>
                </div>
                <h3 className="font-anton text-2xl text-[#EDEDED] uppercase mb-3">
                  CORE VALUE PROPOSITION
                </h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed mb-4">
                  {currentIdea.solution}
                </p>
                <div className="p-3 bg-[#0F0F11] rounded-xl border border-[#27272A] text-xs">
                  <strong className="text-[#EDEDED]">Business Model: </strong>
                  <span className="text-[#A1A1AA]">{currentIdea.businessModel}</span>
                </div>
              </div>

            </div>

            {/* Grid 2: Score Breakdown & Market Dynamics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-6 bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm">
                <h3 className="font-anton text-2xl text-[#EDEDED] uppercase mb-4 flex items-center justify-between">
                  <span>OPPORTUNITY SCORE BREAKDOWN</span>
                  <span className="text-xs font-mono-code font-bold text-[#F59E0B]">AI ESTIMATE</span>
                </h3>
                <ScoreBreakdownBar breakdown={currentIdea.scoreBreakdown} />
              </div>

              <div className="lg:col-span-6 space-y-4">
                
                {/* Why Now */}
                <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-5 shadow-sm">
                  <div className="text-xs font-mono-code font-bold uppercase text-[#71717A] mb-1">
                    WHY NOW? (MARKET TIMING)
                  </div>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                    {currentIdea.whyNow}
                  </p>
                </div>

                {/* Primary Risk */}
                <div className="bg-[#0F0F11] text-[#EDEDED] border border-[#27272A] rounded-2xl p-5 shadow-sm">
                  <div className="text-xs font-mono-code font-bold uppercase text-[#F59E0B] mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>PRIMARY RISK VECTOR</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
                    {currentIdea.primaryRisk}
                  </p>
                </div>

                {/* 48-Hour Validation Step */}
                <div className="bg-[#18181B] border border-[#F59E0B]/50 rounded-2xl p-5 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-[#EDEDED]">
                  <div className="text-xs font-mono-code font-bold uppercase text-[#F59E0B] mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>FIRST 48-HOUR TEST</span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#EDEDED] leading-relaxed">
                    {currentIdea.firstValidationStep}
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom Next Step Call-To-Action */}
            <div className="bg-[#131315] border border-[#27272A] text-[#EDEDED] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-anton text-2xl uppercase text-[#EDEDED]">
                  READY TO TEST THIS WITH BUYERS?
                </h4>
                <p className="text-xs text-[#A1A1AA]">
                  Interview 4 synthetic customer personas or run deep institutional venture validation.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="overview-launch-kit-btn"
                  onClick={() => setCurrentIdeaTab("launch-kit")}
                  className="px-4 py-3.5 bg-[#18181B] text-[#EC4899] border border-[#EC4899]/40 hover:bg-[#27272A] font-anton text-sm tracking-wider uppercase rounded-xl active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  LAUNCH KIT
                </button>
                <button
                  id="overview-competitors-btn"
                  onClick={() => setCurrentIdeaTab("competitors")}
                  className="px-4 py-3.5 bg-[#18181B] text-emerald-400 border border-emerald-500/40 hover:bg-[#27272A] font-anton text-sm tracking-wider uppercase rounded-xl active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  MARKET RADAR (LIVE)
                </button>
                <button
                  id="overview-financials-btn"
                  onClick={() => setCurrentIdeaTab("financials")}
                  className="px-4 py-3.5 bg-[#18181B] text-[#10B981] border border-[#10B981]/40 hover:bg-[#27272A] font-anton text-sm tracking-wider uppercase rounded-xl active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  FINANCIAL MODEL
                </button>
                <button
                  id="overview-persona-chat-btn"
                  onClick={() => setCurrentIdeaTab("personas")}
                  className="px-4 py-3.5 bg-[#18181B] text-[#F59E0B] border border-[#F59E0B]/40 hover:bg-[#27272A] font-anton text-sm tracking-wider uppercase rounded-xl active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  SIMULATE INTERVIEWS
                </button>
                <button
                  onClick={() => {
                    setCurrentIdeaTab("validation");
                    if (!currentIdea.validationReport) {
                      handleRunValidation();
                    }
                  }}
                  className="px-5 py-3.5 bg-[#F59E0B] text-[#0A0A0B] font-anton text-sm tracking-wider uppercase rounded-xl hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0 cursor-pointer"
                >
                  {currentIdea.validationReport ? "VIEW FULL REPORT" : "VALIDATE THIS IDEA"}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 2. VALIDATION TAB */}
        {currentIdeaTab === "validation" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {currentIdea.validationReport ? (
              <div className="space-y-6">
                
                {/* Executive Recommendation Banner */}
                <div className={`rounded-2xl p-6 md:p-8 border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
                  currentIdea.validationReport.recommendation === "PURSUE"
                    ? "bg-emerald-950/80 text-[#EDEDED] border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : currentIdea.validationReport.recommendation === "CONSIDER"
                    ? "bg-amber-950/80 text-[#EDEDED] border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                    : "bg-rose-950/80 text-[#EDEDED] border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                }`}>
                  <div>
                    <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B] mb-1">
                      INSTITUTIONAL DILIGENCE VERDICT
                    </div>
                    <div className="font-anton text-4xl sm:text-5xl uppercase tracking-tight text-[#EDEDED]">
                      RECOMMENDATION: {currentIdea.validationReport.recommendation}
                    </div>
                    <p className="text-xs md:text-sm text-[#A1A1AA] mt-2 max-w-2xl leading-relaxed">
                      {currentIdea.validationReport.recommendationRationale}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col items-center p-3 bg-[#0F0F11]/80 rounded-xl border border-[#27272A] text-center">
                    <span className="text-[10px] font-mono-code uppercase text-[#71717A]">CONFIDENCE LEVEL</span>
                    <span className="font-anton text-2xl text-[#F59E0B] uppercase">
                      {currentIdea.validationReport.confidenceLevel || "HIGH"}
                    </span>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm">
                  <h3 className="font-anton text-2xl text-[#EDEDED] uppercase mb-3">
                    EXECUTIVE SUMMARY
                  </h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">
                    {currentIdea.validationReport.executiveSummary}
                  </p>
                </div>

                {/* Market Sizing TAM / SAM / SOM */}
                <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm">
                  <h3 className="font-anton text-2xl text-[#EDEDED] uppercase mb-4">
                    MARKET OPPORTUNITY & TAILWINDS
                  </h3>
                  <div className="p-4 bg-[#0F0F11] text-[#F59E0B] border border-[#27272A] rounded-xl font-mono-code text-xs md:text-sm font-bold mb-4">
                    {currentIdea.validationReport.marketOpportunity?.tamSamSom || "TAM: $2.4B | SAM: $450M | SOM: $8.5M"}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-[#0F0F11] rounded-xl border border-[#27272A]">
                      <div className="font-mono-code font-bold uppercase text-[#71717A] mb-2">
                        INDUSTRY TAILWINDS
                      </div>
                      <ul className="space-y-1.5 list-disc list-inside text-[#EDEDED]">
                        {currentIdea.validationReport.marketOpportunity?.tailwinds?.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-[#0F0F11] rounded-xl border border-[#27272A]">
                      <div className="font-mono-code font-bold uppercase text-[#71717A] mb-2">
                        VERIFIED DEMAND SIGNALS
                      </div>
                      <ul className="space-y-1.5 list-disc list-inside text-[#EDEDED]">
                        {currentIdea.validationReport.marketOpportunity?.demandSignals?.map((d, idx) => (
                          <li key={idx}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Pricing & Monetization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm">
                    <h3 className="font-anton text-2xl text-[#EDEDED] uppercase mb-3">
                      PRICING MODEL & TIERS
                    </h3>
                    <div className="space-y-3 text-xs font-mono-code">
                      <div className="p-3 bg-[#0F0F11] rounded-lg border border-[#27272A]">
                        <span className="text-[#71717A]">ENTRY TIER: </span>
                        <strong className="text-[#EDEDED]">{currentIdea.validationReport.pricingModel?.tier1}</strong>
                      </div>
                      <div className="p-3 bg-[#0F0F11] rounded-lg border border-[#27272A]">
                        <span className="text-[#71717A]">CORE/PRO TIER: </span>
                        <strong className="text-[#EDEDED]">{currentIdea.validationReport.pricingModel?.tier2}</strong>
                      </div>
                      <div className="text-[#A1A1AA] font-sans mt-2">
                        <strong className="text-[#EDEDED]">Rationale: </strong>{currentIdea.validationReport.pricingModel?.rationale}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm">
                    <h3 className="font-anton text-2xl text-[#EDEDED] uppercase mb-3">
                      ACQUISITION CHANNELS
                    </h3>
                    <ul className="space-y-2 text-xs text-[#EDEDED]">
                      {currentIdea.validationReport.customerAcquisition?.map((c, idx) => (
                        <li key={idx} className="flex items-start gap-2 p-2 bg-[#0F0F11] rounded border border-[#27272A]">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-[#EDEDED]">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Validation Experiments */}
                <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm">
                  <h3 className="font-anton text-2xl text-[#EDEDED] uppercase mb-4">
                    48-HOUR & 7-DAY VALIDATION EXPERIMENTS
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentIdea.validationReport.validationExperiments?.map((exp, idx) => (
                      <div key={idx} className="p-4 bg-[#0F0F11] border border-[#27272A] rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between font-mono-code font-bold">
                          <span className="px-2 py-0.5 bg-[#18181B] text-[#F59E0B] border border-[#27272A] rounded text-[10px]">
                            EXPERIMENT {idx + 1}
                          </span>
                          <span className="text-[#71717A]">{exp.timeframe}</span>
                        </div>
                        <div className="font-semibold text-sm text-[#EDEDED]">{exp.experiment}</div>
                        <div className="text-[#A1A1AA]">
                          <strong className="text-[#EDEDED]">Success Metric: </strong>
                          <span className="text-emerald-400 font-medium">{exp.successMetric}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Re-run button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleRunValidation}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-mono-code font-bold uppercase text-[#A1A1AA] hover:text-[#EDEDED] hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-run Validation Diligence</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-[#131315] border-2 border-dashed border-[#27272A] rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#18181B] border border-[#27272A] text-[#F59E0B] flex items-center justify-center font-bold mb-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h3 className="font-anton text-3xl text-[#EDEDED] uppercase mb-2">
                  RUN VENTURE DILIGENCE REPORT
                </h3>
                <p className="text-xs md:text-sm text-[#A1A1AA] max-w-md mb-6">
                  Generate an institutional-grade validation report: TAM/SAM/SOM market sizing, customer acquisition channels, pricing models, and 48-hour smoke tests.
                </p>
                <button
                  id="trigger-validation-btn"
                  onClick={handleRunValidation}
                  className="px-8 py-4 bg-[#F59E0B] text-[#0A0A0B] font-anton text-base tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
                >
                  VALIDATE THIS IDEA NOW
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2.2 FINANCIALS & BREAKEVEN CALCULATOR TAB */}
        {currentIdeaTab === "financials" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <FinancialUnitEconomicsCalculator
              idea={currentIdea}
              onUpdateIdea={(updated) => {
                updateIdea(updated);
                setCurrentIdea(updated);
              }}
            />
          </div>
        )}

        {/* 2.3 LAUNCH KIT (GTM & OUTBOUND) TAB */}
        {currentIdeaTab === "launch-kit" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <LaunchKitGenerator
              idea={currentIdea}
              onUpdateIdea={(updated) => {
                updateIdea(updated);
                setCurrentIdea(updated);
              }}
            />
          </div>
        )}

        {/* 2.5 CUSTOMER PERSONAS & INTERVIEW SIMULATOR TAB */}
        {currentIdeaTab === "personas" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <PersonaInterviewSimulator
              idea={currentIdea}
              onUpdateIdea={(updated) => {
                updateIdea(updated);
                setCurrentIdea(updated);
              }}
            />
          </div>
        )}

        {/* 3. COMPETITORS & REAL MARKET SIGNAL (LIVE SEARCH GROUNDING) TAB */}
        {currentIdeaTab === "competitors" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {currentIdea.competitors && currentIdea.competitors.length > 0 ? (
              <LiveCompetitorIntelligence
                idea={currentIdea}
                onUpdateIdea={(updated) => {
                  updateIdea(updated);
                  setCurrentIdea(updated);
                }}
                onRunSearch={(customQuery) => handleRunCompetitors(customQuery)}
                isLoading={isLoading}
              />
            ) : (
              <div className="bg-[#131315] border-2 border-dashed border-[#27272A] rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#18181B] border border-[#27272A] text-emerald-400 flex items-center justify-center font-bold mb-4 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Globe className="w-7 h-7" />
                </div>
                <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-emerald-400 mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  GOOGLE SEARCH GROUNDING ACTIVE
                </div>
                <h3 className="font-anton text-3xl text-[#EDEDED] uppercase mb-2">
                  AUDIT REAL LIVE COMPETITORS & MARKET SIGNALS
                </h3>
                <p className="text-xs md:text-sm text-[#A1A1AA] max-w-md mb-6 leading-relaxed">
                  Perform real-time Google search verification of live competitors, pricing models, verified review complaints, and your asymmetric differentiation wedge.
                </p>
                <button
                  id="trigger-competitors-btn"
                  onClick={() => handleRunCompetitors()}
                  className="px-8 py-4 bg-[#F59E0B] text-[#0A0A0B] font-anton text-base tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  SCAN REAL MARKET WITH SEARCH GROUNDING
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. DEVIL'S ADVOCATE / STRESS TEST TAB */}
        {currentIdeaTab === "stress-test" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {currentIdea.stressTest ? (
              <div className="space-y-6">
                
                {/* Header Verdict Card */}
                <div className="bg-[#131315] text-[#EDEDED] border-2 border-[#F59E0B] rounded-2xl p-6 md:p-8 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B]">
                        AI DEVIL'S ADVOCATE AUDIT
                      </div>
                      <h3 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase tracking-tight">
                        {currentIdea.stressTest.headline}
                      </h3>
                    </div>

                    <div className="shrink-0 px-4 py-2 bg-[#0F0F11] border border-[#27272A] rounded-xl text-center">
                      <div className="text-[9px] font-mono-code uppercase text-[#71717A]">STRESS RESULT</div>
                      <div className={`font-anton text-2xl uppercase ${
                        currentIdea.stressTest.stressTestResult === "STRONG"
                          ? "text-emerald-400"
                          : currentIdea.stressTest.stressTestResult === "MODERATE"
                          ? "text-[#F59E0B]"
                          : "text-rose-400"
                      }`}>
                        {currentIdea.stressTest.stressTestResult}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-[#A1A1AA] leading-relaxed border-t border-[#27272A] pt-4">
                    <strong className="text-[#EDEDED]">Unfiltered Verdict: </strong>{currentIdea.stressTest.overallVerdict}
                  </p>
                </div>

                {/* 5 Lethal Failure Reasons */}
                <div className="space-y-4">
                  <h4 className="font-anton text-2xl text-[#EDEDED] uppercase">
                    CRITICAL FAILURE POINTS & MANDATORY MITIGATIONS
                  </h4>

                  {currentIdea.stressTest.failureReasons?.map((reason, idx) => (
                    <div key={idx} className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-rose-500 text-[#0A0A0B] font-anton text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <h5 className="font-anton text-xl text-[#EDEDED] uppercase">
                            {reason.title}
                          </h5>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-mono-code font-bold uppercase rounded border ${
                          reason.severity === "CRITICAL"
                            ? "bg-rose-950/60 text-rose-300 border-rose-800/60"
                            : reason.severity === "HIGH"
                            ? "bg-amber-950/60 text-amber-300 border-amber-800/60"
                            : "bg-zinc-800 text-zinc-300 border-zinc-700"
                        }`}>
                          {reason.severity}
                        </span>
                      </div>

                      <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-900/40 text-xs">
                        <strong className="text-rose-400">Why this could kill the business: </strong>
                        <span className="text-rose-200">{reason.whyItMatters}</span>
                      </div>

                      <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-900/40 text-xs">
                        <strong className="text-emerald-400 font-bold">How to Mitigate It: </strong>
                        <span className="text-emerald-200 font-medium">{reason.howToMitigate}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Improve CTA */}
                <div className="bg-[#18181B] text-[#EDEDED] border border-[#F59E0B]/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <div>
                    <h4 className="font-anton text-2xl uppercase text-[#EDEDED]">
                      READY TO HARDEN AND PIVOT THIS IDEA?
                    </h4>
                    <p className="text-xs text-[#A1A1AA] font-medium">
                      Reconstruct this business into a hardened 2.0 version that eliminates these failure points.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentIdeaTab("improve");
                      if (!currentIdea.improvedVersion) {
                        handleRunImprovement();
                      }
                    }}
                    className="px-6 py-3.5 bg-[#F59E0B] text-[#0A0A0B] font-anton text-sm tracking-wider uppercase rounded-xl hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0 cursor-pointer"
                  >
                    IMPROVE THIS IDEA (V2.0)
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-[#131315] text-[#EDEDED] border-2 border-dashed border-[#27272A] rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#18181B] border border-[#27272A] text-[#F59E0B] flex items-center justify-center font-bold mb-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <h3 className="font-anton text-3xl text-[#EDEDED] uppercase mb-2">
                  LET'S TRY TO BREAK IT.
                </h3>
                <p className="text-xs md:text-sm text-[#A1A1AA] max-w-md mb-6">
                  The AI Devil's Advocate actively challenges assumptions, attacks unit economics, and searches for lethal distribution and retention traps.
                </p>
                <button
                  id="trigger-stress-test-btn"
                  onClick={handleRunStressTest}
                  className="px-8 py-4 bg-[#F59E0B] text-[#0A0A0B] font-anton text-base tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
                >
                  STRESS TEST THIS IDEA
                </button>
              </div>
            )}
          </div>
        )}

        {/* 5. IMPROVE IDEA (V2.0) TAB */}
        {currentIdeaTab === "improve" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {currentIdea.improvedVersion ? (
              <div className="space-y-6">
                
                {/* 2.0 Summary Banner */}
                <div className="bg-[#131315] text-[#EDEDED] border-2 border-[#F59E0B] rounded-2xl p-6 md:p-8 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B]">
                        HARDENED STRATEGY 2.0
                      </div>
                      <h3 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase">
                        {currentIdea.improvedVersion.improvedValueProposition}
                      </h3>
                    </div>

                    <div className="shrink-0 px-4 py-2 bg-[#0F0F11] border border-[#F59E0B]/50 rounded-xl text-center">
                      <div className="text-[9px] font-mono-code uppercase text-[#71717A]">ADJUSTED SCORE</div>
                      <div className="font-anton text-3xl text-[#F59E0B]">
                        {currentIdea.improvedVersion.adjustedOpportunityScore} / 100
                      </div>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-[#A1A1AA] leading-relaxed border-t border-[#27272A] pt-4">
                    {currentIdea.improvedVersion.beforeAfterSummary}
                  </p>
                </div>

                {/* Before vs After Matrix */}
                <div className="space-y-4">
                  <h4 className="font-anton text-2xl text-[#EDEDED] uppercase">
                    BEFORE VS AFTER PIVOT BREAKDOWN
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentIdea.improvedVersion.changes?.map((c, idx) => (
                      <div key={idx} className="bg-[#131315] border border-[#27272A] rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="text-xs font-mono-code font-bold uppercase text-[#F59E0B] border-b border-[#27272A] pb-1">
                          {c.field}
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="p-2.5 bg-rose-950/30 border border-rose-900/40 rounded-lg">
                            <span className="text-rose-400 font-bold uppercase text-[10px] block">BEFORE (FRAGILE):</span>
                            <span className="text-rose-200">{c.before}</span>
                          </div>

                          <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/40 rounded-lg">
                            <span className="text-emerald-400 font-bold uppercase text-[10px] block">AFTER (HARDENED 2.0):</span>
                            <span className="text-emerald-200 font-bold">{c.after}</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-[#A1A1AA] font-sans italic">
                          <strong className="text-[#EDEDED]">Why: </strong>{c.rationale}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Niche & Defensibility Moat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm">
                    <div className="text-xs font-mono-code font-bold uppercase text-[#71717A] mb-1">
                      HYPER-TARGETED BEACHHEAD NICHE
                    </div>
                    <p className="text-sm font-semibold text-[#EDEDED]">
                      {currentIdea.improvedVersion.nicheFocus}
                    </p>
                  </div>

                  <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm">
                    <div className="text-xs font-mono-code font-bold uppercase text-[#71717A] mb-1">
                      DEFENSIBILITY & SWITCHING MOAT
                    </div>
                    <p className="text-sm font-semibold text-[#EDEDED]">
                      {currentIdea.improvedVersion.defensibilityMoat}
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-[#131315] border-2 border-dashed border-[#27272A] rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#18181B] border border-[#27272A] text-[#F59E0B] flex items-center justify-center font-bold mb-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="font-anton text-3xl text-[#EDEDED] uppercase mb-2">
                  PIVOT & HARDEN TO VERSION 2.0
                </h3>
                <p className="text-xs md:text-sm text-[#A1A1AA] max-w-md mb-6">
                  Transform fragile assumptions into high-ticket B2B guarantees, narrow the wedge, and increase willingness to pay.
                </p>
                <button
                  id="trigger-improve-btn"
                  onClick={handleRunImprovement}
                  className="px-8 py-4 bg-[#F59E0B] text-[#0A0A0B] font-anton text-base tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
                >
                  IMPROVE & SHARPEN IDEA
                </button>
              </div>
            )}
          </div>
        )}

        {/* 6. BUSINESS MODEL CANVAS TAB */}
        {currentIdeaTab === "business-model" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {currentIdea.businessModelCanvas ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-anton text-3xl text-[#EDEDED] uppercase">
                      COMPLETE BUSINESS MODEL CANVAS
                    </h3>
                    <p className="text-xs font-mono-code text-[#71717A]">
                      Unit economics, distribution channels, and operating structure.
                    </p>
                  </div>

                  <button
                    onClick={handleRunBusinessModel}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono-code font-bold uppercase text-[#A1A1AA] hover:text-[#EDEDED] hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="text-[10px] font-mono-code font-bold uppercase text-[#71717A]">
                      CUSTOMER SEGMENTS
                    </div>
                    <ul className="text-xs space-y-1.5 list-disc list-inside text-[#EDEDED]">
                      {currentIdea.businessModelCanvas.customerSegments?.map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>

                  <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="text-[10px] font-mono-code font-bold uppercase text-[#71717A]">
                      VALUE PROPOSITIONS
                    </div>
                    <ul className="text-xs space-y-1.5 list-disc list-inside text-[#EDEDED]">
                      {currentIdea.businessModelCanvas.valuePropositions?.map((v, idx) => <li key={idx}>{v}</li>)}
                    </ul>
                  </div>

                  <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="text-[10px] font-mono-code font-bold uppercase text-[#71717A]">
                      REVENUE STREAMS
                    </div>
                    <ul className="text-xs space-y-1.5 list-disc list-inside text-[#EDEDED]">
                      {currentIdea.businessModelCanvas.revenueStreams?.map((r, idx) => <li key={idx}>{r}</li>)}
                    </ul>
                  </div>

                  <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="text-[10px] font-mono-code font-bold uppercase text-[#71717A]">
                      DISTRIBUTION CHANNELS
                    </div>
                    <ul className="text-xs space-y-1.5 list-disc list-inside text-[#EDEDED]">
                      {currentIdea.businessModelCanvas.distributionChannels?.map((d, idx) => <li key={idx}>{d}</li>)}
                    </ul>
                  </div>

                  <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="text-[10px] font-mono-code font-bold uppercase text-[#71717A]">
                      KEY ACTIVITIES
                    </div>
                    <ul className="text-xs space-y-1.5 list-disc list-inside text-[#EDEDED]">
                      {currentIdea.businessModelCanvas.keyActivities?.map((a, idx) => <li key={idx}>{a}</li>)}
                    </ul>
                  </div>

                  <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="text-[10px] font-mono-code font-bold uppercase text-[#71717A]">
                      KEY RESOURCES
                    </div>
                    <ul className="text-xs space-y-1.5 list-disc list-inside text-[#EDEDED]">
                      {currentIdea.businessModelCanvas.keyResources?.map((res, idx) => <li key={idx}>{res}</li>)}
                    </ul>
                  </div>

                  <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="text-[10px] font-mono-code font-bold uppercase text-[#71717A]">
                      COST STRUCTURE
                    </div>
                    <ul className="text-xs space-y-1.5 list-disc list-inside text-[#EDEDED]">
                      {currentIdea.businessModelCanvas.costStructure?.map((c, idx) => <li key={idx}>{c}</li>)}
                    </ul>
                  </div>

                  <div className="bg-[#18181B] text-[#EDEDED] border border-[#27272A] rounded-2xl p-5 shadow-sm space-y-2">
                    <div className="text-[10px] font-mono-code font-bold uppercase text-[#F59E0B]">
                      UNFAIR ADVANTAGE
                    </div>
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      {currentIdea.businessModelCanvas.unfairAdvantage}
                    </p>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-[#131315] border-2 border-dashed border-[#27272A] rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#18181B] border border-[#27272A] text-[#F59E0B] flex items-center justify-center font-bold mb-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="font-anton text-3xl text-[#EDEDED] uppercase mb-2">
                  GENERATE BUSINESS MODEL CANVAS
                </h3>
                <p className="text-xs md:text-sm text-[#A1A1AA] max-w-md mb-6">
                  Map out customer segments, recurring MRR mechanics, distribution channels, and operating cost structure.
                </p>
                <button
                  id="trigger-business-model-btn"
                  onClick={handleRunBusinessModel}
                  className="px-8 py-4 bg-[#F59E0B] text-[#0A0A0B] font-anton text-base tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
                >
                  CREATE BUSINESS MODEL
                </button>
              </div>
            )}
          </div>
        )}

        {/* 7. MVP BLUEPRINT TAB */}
        {currentIdeaTab === "mvp" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {currentIdea.mvpBlueprint ? (
              <div className="space-y-6">
                
                {/* Header Metrics */}
                <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono-code font-bold uppercase text-[#71717A] mb-1">
                      NORTH STAR MVP METRIC
                    </div>
                    <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase">
                      {currentIdea.mvpBlueprint.mvpSuccessMetric}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-[#0F0F11] text-[#F59E0B] border border-[#27272A] rounded-xl font-mono-code text-xs font-bold text-center">
                      <span className="text-[#71717A]">BUILD TIME: </span>
                      <strong className="text-[#EDEDED]">{currentIdea.mvpBlueprint.estimatedBuildTimeWeeks} WEEKS</strong>
                    </div>
                  </div>
                </div>

                {/* 3-Column Feature Triage */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* BUILD FIRST */}
                  <div className="bg-[#131315] border-2 border-emerald-500/60 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-mono-code text-xs font-bold uppercase">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>BUILD FIRST (CORE MVP)</span>
                    </div>
                    <p className="text-xs text-[#A1A1AA]">
                      The absolute minimum required to deliver value and collect cash.
                    </p>
                    <div className="space-y-3">
                      {currentIdea.mvpBlueprint.buildFirst?.map((item, idx) => (
                        <div key={idx} className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl text-xs">
                          <strong className="text-emerald-300 block mb-1">{item.feature}</strong>
                          <span className="text-emerald-400/90 text-[11px]">{item.whyCrucial}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* BUILD LATER */}
                  <div className="bg-[#131315] border-2 border-amber-500/60 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-amber-400 font-mono-code text-xs font-bold uppercase">
                      <Clock className="w-4 h-4" />
                      <span>BUILD LATER (V1.1)</span>
                    </div>
                    <p className="text-xs text-[#A1A1AA]">
                      Valuable additions after you reach 5 paying customers.
                    </p>
                    <div className="space-y-3">
                      {currentIdea.mvpBlueprint.buildLater?.map((item, idx) => (
                        <div key={idx} className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-xl text-xs">
                          <strong className="text-amber-300 block mb-1">{item.feature}</strong>
                          <span className="text-amber-400/90 text-[11px]">{item.whenToBuild}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* DON'T BUILD YET */}
                  <div className="bg-[#131315] border-2 border-rose-500/60 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-rose-400 font-mono-code text-xs font-bold uppercase">
                      <AlertTriangle className="w-4 h-4" />
                      <span>DON'T BUILD YET (BLOAT)</span>
                    </div>
                    <p className="text-xs text-[#A1A1AA]">
                      Common traps that waste 6 weeks without driving revenue.
                    </p>
                    <div className="space-y-3">
                      {currentIdea.mvpBlueprint.dontBuildYet?.map((item, idx) => (
                        <div key={idx} className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-xl text-xs">
                          <strong className="text-rose-300 block mb-1">{item.trap}</strong>
                          <span className="text-rose-400/90 text-[11px]">{item.whyToAvoid}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Core User Flow */}
                <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm">
                  <h4 className="font-anton text-2xl text-[#EDEDED] uppercase mb-4">
                    CORE 3-STEP USER JOURNEY
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono-code">
                    {currentIdea.mvpBlueprint.coreUserFlow?.map((step, idx) => (
                      <div key={idx} className="p-4 bg-[#18181B] border border-[#27272A] rounded-xl">
                        <div className="px-2 py-0.5 bg-[#0F0F11] text-[#F59E0B] border border-[#27272A] rounded text-[10px] inline-block mb-2 font-bold">
                          STEP 0{idx + 1}
                        </div>
                        <div className="text-[#EDEDED] font-sans text-sm font-medium">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Plan Trigger Banner */}
                <div className="bg-[#18181B] text-[#EDEDED] border border-[#F59E0B]/40 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <div>
                    <h4 className="font-anton text-2xl uppercase text-[#EDEDED]">
                      READY FOR YOUR 7-DAY ACTION PLAN?
                    </h4>
                    <p className="text-xs text-[#A1A1AA]">
                      Day-by-day roadmap with discovery interviews, landing page setup, and pre-sales.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentIdeaTab("action-plan");
                      if (!currentIdea.actionPlan) {
                        handleRunActionPlan();
                      }
                    }}
                    className="px-6 py-3.5 bg-[#F59E0B] text-[#0A0A0B] font-anton text-sm tracking-wider uppercase rounded-xl hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0 cursor-pointer"
                  >
                    GET 7-DAY ACTION PLAN
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-[#131315] border-2 border-dashed border-[#27272A] rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#18181B] border border-[#27272A] text-[#F59E0B] flex items-center justify-center font-bold mb-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="font-anton text-3xl text-[#EDEDED] uppercase mb-2">
                  GENERATE LEAN MVP BLUEPRINT
                </h3>
                <p className="text-xs md:text-sm text-[#A1A1AA] max-w-md mb-6">
                  Triage features strictly into BUILD FIRST, BUILD LATER, and DON'T BUILD YET to avoid scope-creep and launch in 2 weeks.
                </p>
                <button
                  id="trigger-mvp-btn"
                  onClick={handleRunMVP}
                  className="px-8 py-4 bg-[#F59E0B] text-[#0A0A0B] font-anton text-base tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
                >
                  BUILD MY MVP BLUEPRINT
                </button>
              </div>
            )}
          </div>
        )}

        {/* 8. 7-DAY ACTION PLAN TAB */}
        {currentIdeaTab === "action-plan" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {currentIdea.actionPlan ? (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-anton text-3xl text-[#EDEDED] uppercase">
                      7-DAY ACTION SPRINT
                    </h3>
                    <p className="text-xs font-mono-code text-[#71717A]">
                      Check off daily tasks as you execute. Finish by Day 7 with paying customers or clear pivot data.
                    </p>
                  </div>

                  <button
                    onClick={handleRunActionPlan}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono-code font-bold uppercase text-[#A1A1AA] hover:text-[#EDEDED] hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate Plan</span>
                  </button>
                </div>

                {/* Days Accordion / Cards */}
                <div className="space-y-4">
                  {currentIdea.actionPlan.days?.map((day) => {
                    const completedTasks = day.tasks.filter((t) => t.done).length;
                    const isAllDone = completedTasks === day.tasks.length && day.tasks.length > 0;

                    return (
                      <div
                        key={day.day}
                        className={`bg-[#131315] border rounded-2xl p-6 transition-all shadow-sm ${
                          isAllDone
                            ? "border-emerald-500/60 bg-emerald-950/20"
                            : "border-[#27272A]"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg font-anton text-sm uppercase ${
                              isAllDone ? "bg-emerald-600 text-[#0A0A0B] font-bold" : "bg-[#18181B] text-[#F59E0B] border border-[#27272A]"
                            }`}>
                              DAY 0{day.day}
                            </span>
                            <h4 className="font-anton text-xl sm:text-2xl text-[#EDEDED] uppercase">
                              {day.title}
                            </h4>
                          </div>

                          <div className="text-xs font-mono-code font-bold text-[#71717A]">
                            {completedTasks} / {day.tasks.length} Done
                          </div>
                        </div>

                        <p className="text-xs md:text-sm text-[#A1A1AA] mb-4">
                          <strong className="text-[#EDEDED]">Objective: </strong>{day.objective}
                        </p>

                        {/* Checklist Tasks */}
                        <div className="space-y-2 mb-4">
                          {day.tasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => handleTaskToggle(day.day, task.id)}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                task.done
                                  ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-200"
                                  : "bg-[#18181B] border-[#27272A] text-[#EDEDED] hover:border-[#3F3F46]"
                              }`}
                            >
                              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                                task.done
                                  ? "bg-emerald-500 border-emerald-500 text-[#0A0A0B]"
                                  : "border-[#3F3F46] bg-[#0F0F11]"
                              }`}>
                                {task.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span className={`text-xs md:text-sm ${task.done ? "line-through opacity-75 font-medium text-emerald-300" : "font-medium"}`}>
                                {task.text}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Deliverable & Pro Tip */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-[#27272A] font-mono-code">
                          <div className="p-2.5 bg-[#0F0F11] border border-[#27272A] rounded-lg">
                            <span className="text-[#71717A] block font-bold text-[10px]">DELIVERABLE:</span>
                            <span className="font-sans font-medium text-[#EDEDED]">{day.deliverable}</span>
                          </div>
                          <div className="p-2.5 bg-[#18181B] border border-[#F59E0B]/30 rounded-lg">
                            <span className="text-[#F59E0B] block font-bold text-[10px]">PRO TIP:</span>
                            <span className="font-sans text-[#EDEDED]">{day.proTip}</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Final Decision Council Criteria */}
                {currentIdea.actionPlan.finalDecisionCriteria && (
                  <div className="bg-[#131315] text-[#EDEDED] border-2 border-[#F59E0B] rounded-2xl p-6 md:p-8 shadow-[0_0_20px_rgba(245,158,11,0.15)] space-y-4">
                    <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B]">
                      DAY 7 STRATEGY COUNCIL
                    </div>
                    <h4 className="font-anton text-2xl sm:text-3xl text-[#EDEDED] uppercase">
                      FINAL DECISION CRITERIA (BUILD / ITERATE / PIVOT / ABANDON)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code pt-2">
                      <div className="p-3 bg-emerald-950/40 border border-emerald-600/50 rounded-xl">
                        <span className="text-emerald-400 font-bold uppercase block mb-1">● GREEN LIGHT (BUILD SPRINT):</span>
                        <span className="text-emerald-200 font-sans">{currentIdea.actionPlan.finalDecisionCriteria.buildSignal}</span>
                      </div>

                      <div className="p-3 bg-amber-950/40 border border-amber-600/50 rounded-xl">
                        <span className="text-amber-400 font-bold uppercase block mb-1">● YELLOW LIGHT (ITERATE / TWEAK):</span>
                        <span className="text-amber-200 font-sans">{currentIdea.actionPlan.finalDecisionCriteria.iterateSignal}</span>
                      </div>

                      <div className="p-3 bg-blue-950/40 border border-blue-600/50 rounded-xl">
                        <span className="text-blue-400 font-bold uppercase block mb-1">● BLUE LIGHT (PIVOT ICP):</span>
                        <span className="text-blue-200 font-sans">{currentIdea.actionPlan.finalDecisionCriteria.pivotSignal}</span>
                      </div>

                      <div className="p-3 bg-rose-950/40 border border-rose-600/50 rounded-xl">
                        <span className="text-rose-400 font-bold uppercase block mb-1">● RED LIGHT (KILL / ABANDON):</span>
                        <span className="text-rose-200 font-sans">{currentIdea.actionPlan.finalDecisionCriteria.abandonSignal}</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-[#131315] border-2 border-dashed border-[#27272A] rounded-2xl p-12 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-[#18181B] border border-[#27272A] text-[#F59E0B] flex items-center justify-center font-bold mb-4 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="font-anton text-3xl text-[#EDEDED] uppercase mb-2">
                  GENERATE 7-DAY ACTION PLAN
                </h3>
                <p className="text-xs md:text-sm text-[#A1A1AA] max-w-md mb-6">
                  Turn this opportunity into a tactical day-by-day launch sprint with interview templates, pre-sales targets, and final decision criteria.
                </p>
                <button
                  id="trigger-action-plan-btn"
                  onClick={handleRunActionPlan}
                  className="px-8 py-4 bg-[#F59E0B] text-[#0A0A0B] font-anton text-base tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
                >
                  GENERATE 7-DAY ACTION PLAN
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
