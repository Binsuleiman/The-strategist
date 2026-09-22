import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { generateIdeasApi, evaluateCustomIdeaApi } from "../services/api";
import { IdeaCard } from "../components/IdeaCard";
import { LoadingOverlay } from "../components/LoadingOverlay";
import { GenerationMode, Idea } from "../types";
import { 
  Sparkles, 
  User, 
  Wrench, 
  AlertCircle, 
  Dice5, 
  Sliders, 
  ArrowRight, 
  RefreshCw,
  Lightbulb,
  Compass,
  CheckCircle2,
  Zap,
  HelpCircle
} from "lucide-react";

export const DiscoverView: React.FC = () => {
  const { 
    founderProfile, 
    ideas, 
    setIdeas, 
    setCurrentView, 
    addToast,
    openIdea,
    saveIdea
  } = useApp();

  // Top view tab: "discover" (AI generator) vs "custom" (Type my own idea)
  const [activeTab, setActiveTab] = useState<"discover" | "custom">("custom");

  // Custom Idea Form State
  const [customIdeaName, setCustomIdeaName] = useState("");
  const [customIdeaDescription, setCustomIdeaDescription] = useState("");
  const [customTargetAudience, setCustomTargetAudience] = useState("");
  const [customMonetization, setCustomMonetization] = useState("");
  const [isEvaluatingCustom, setIsEvaluatingCustom] = useState(false);

  // Discovery Generator State
  const [mode, setMode] = useState<GenerationMode>("personalized");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const MODES: Array<{ id: GenerationMode; title: string; desc: string; icon: any }> = [
    {
      id: "personalized",
      title: "Personalized",
      desc: "Calibrated to your exact profile, budget, and time availability",
      icon: User,
    },
    {
      id: "skills",
      title: "Skill Monetization",
      desc: "Direct productization of your top technical & sales strengths",
      icon: Wrench,
    },
    {
      id: "problem",
      title: "High-Pain Wedge",
      desc: "Hyper-focused on severe B2B operational bottlenecks and compliance leaks",
      icon: AlertCircle,
    },
    {
      id: "surprise",
      title: "Unconventional",
      desc: "Novel business models, niche micro-SaaS, and untapped markets",
      icon: Dice5,
    },
  ];

  // Quick preset templates for custom idea evaluation
  const CUSTOM_TEMPLATES = [
    {
      name: "AI Invoice Dispute & Chargeback Recovery",
      desc: "An automated assistant for Stripe and Shopify merchants that gathers shipment tracking, delivery proof, and IP logs to fight fraudulent chargebacks and win disputes.",
      target: "E-commerce brands and SaaS founders doing over $15k/mo",
      monetization: "$49/mo base + 12% fee on recovered funds",
    },
    {
      name: "Clinic Ambient Audio Charting",
      desc: "Hands-free ambient scribe app on iPad for physical therapy and dental clinics that listens to consultations and converts them into compliant medical EHR notes.",
      target: "Independent physical therapists and dental specialists",
      monetization: "$149/mo per practitioner seat",
    },
    {
      name: "Local Municipal Permit Alert Radar",
      desc: "Scrapes city building permits daily to notify roofing, plumbing, and HVAC contractors 30 days before renovation projects begin.",
      target: "Commercial trade subcontractors and facility managers",
      monetization: "$199/mo per exclusive zip code territory",
    },
    {
      name: "Loom Video to Engineering User Stories",
      desc: "Converts messy screen recordings and Slack discussions into structured Gherkin-syntax Jira user stories with acceptance criteria.",
      target: "Solo founders and lead engineers managing offshore teams",
      monetization: "$39/mo per engineer seat",
    },
  ];

  // Handle typing & evaluating user's own business idea
  const handleEvaluateCustomIdea = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!customIdeaName.trim() && !customIdeaDescription.trim()) {
      addToast({
        type: "warning",
        title: "Idea Description Needed",
        message: "Please enter your business idea name or describe what problem it solves.",
      });
      return;
    }

    setIsEvaluatingCustom(true);
    try {
      const explicitName = customIdeaName.trim();
      const combinedIdeaInput = {
        name: explicitName || undefined,
        description: customIdeaDescription.trim(),
        problem: customIdeaDescription.trim(),
        targetCustomer: customTargetAudience.trim() || undefined,
        monetization: customMonetization.trim() || undefined,
      };

      const res = await evaluateCustomIdeaApi(combinedIdeaInput, founderProfile);
      if (res.idea) {
        const enriched: Idea = {
          ...res.idea,
          name: explicitName ? explicitName : (res.idea.name || "Venture Opportunity"),
          isSaved: true,
        };

        // Add to ideas list and workspace
        setIdeas((prev) => [enriched, ...prev.filter((i) => i.id !== enriched.id)]);
        saveIdea(enriched);

        addToast({
          type: "success",
          title: "Idea Evaluated & Scored!",
          message: `"${enriched.name}" achieved an Opportunity Score of ${enriched.opportunityScore}/100.`,
        });

        // Open detailed strategy view immediately
        openIdea(enriched, "overview");
      }
    } catch (err: any) {
      console.error("Error evaluating custom idea:", err);
      addToast({
        type: "error",
        title: "Evaluation Error",
        message: "Could not evaluate idea right now. Please try again.",
      });
    } finally {
      setIsEvaluatingCustom(false);
    }
  };

  // Handle generating fresh 5 ideas
  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await generateIdeasApi(founderProfile, mode, customPrompt);
      if (res.ideas && res.ideas.length > 0) {
        setIdeas(res.ideas);
        addToast({
          type: "success",
          title: "Fresh Opportunities Generated",
          message: `Generated 5 unique business candidates.`,
        });
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      addToast({
        type: "error",
        title: "Generation Error",
        message: "Failed to generate ideas. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EDEDED] pt-24 pb-16 px-4 md:px-8">
      <LoadingOverlay
        isOpen={isLoading || isEvaluatingCustom}
        title={isEvaluatingCustom ? "EVALUATING YOUR BUSINESS IDEA..." : "GENERATING NOVEL BUSINESS IDEAS..."}
        steps={
          isEvaluatingCustom
            ? [
                "Deconstructing your value proposition & market wedge",
                "Analyzing customer willingness-to-pay & ICP pain points",
                "Evaluating competition defensibility & moat",
                "Synthesizing multivariate viability scores",
                "Preparing institutional validation blueprint",
              ]
            : [
                "Analyzing founder skills & time commitment",
                "Scanning high-margin B2B & micro-SaaS opportunities",
                "Evaluating customer willingness-to-pay",
                "Calculating multivariate opportunity scores",
                "Structuring 5 distinct business candidates",
              ]
        }
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Founder Profile Summary */}
        <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B] mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>VENTURE ARCHITECTURE WORKSPACE</span>
              </div>
              <h1 className="font-anton text-4xl sm:text-5xl md:text-6xl text-[#EDEDED] uppercase tracking-tight leading-none mb-3">
                BUILD OR DISCOVER YOUR BUSINESS.
              </h1>
              <p className="text-xs md:text-sm text-[#A1A1AA] max-w-2xl leading-relaxed">
                Type your own business idea for instant venture scoring and strategic diligence, or use our AI engine to discover high-margin opportunities tailored to your skills.
              </p>
            </div>

            {/* Founder Profile Snapshot Card */}
            <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-4 shrink-0 lg:max-w-sm w-full">
              <div className="flex items-center justify-between text-xs font-mono-code font-bold mb-2">
                <span className="text-[#71717A] uppercase">ACTIVE PROFILE</span>
                <button
                  onClick={() => setCurrentView("settings")}
                  className="text-[#F59E0B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  Edit
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono-code mb-2">
                {founderProfile.skills.slice(0, 3).map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-[#27272A] text-[#F59E0B] rounded font-semibold border border-[#27272A]">
                    {s}
                  </span>
                ))}
                <span className="px-2 py-0.5 bg-[#18181B] text-[#EDEDED] border border-[#27272A] rounded">
                  {founderProfile.budget}
                </span>
                <span className="px-2 py-0.5 bg-[#18181B] text-[#EDEDED] border border-[#27272A] rounded">
                  {founderProfile.businessType}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-[#27272A] pb-3">
          <button
            id="tab-custom-idea-btn"
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-anton text-sm sm:text-base tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "custom"
                ? "bg-[#F59E0B] text-[#0A0A0B] shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                : "bg-[#131315] text-[#A1A1AA] border border-[#27272A] hover:text-[#EDEDED] hover:border-[#F59E0B]/40"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>TYPE & EVALUATE MY OWN IDEA</span>
          </button>

          <button
            id="tab-discover-ideas-btn"
            onClick={() => setActiveTab("discover")}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-anton text-sm sm:text-base tracking-wider uppercase transition-all cursor-pointer ${
              activeTab === "discover"
                ? "bg-[#F59E0B] text-[#0A0A0B] shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                : "bg-[#131315] text-[#A1A1AA] border border-[#27272A] hover:text-[#EDEDED] hover:border-[#F59E0B]/40"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>DISCOVER NEW AI IDEAS</span>
          </button>
        </div>

        {/* TAB 1: TYPE & EVALUATE MY OWN IDEA */}
        {activeTab === "custom" && (
          <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272A] pb-4">
              <div>
                <h2 className="font-anton text-2xl sm:text-3xl text-[#EDEDED] uppercase tracking-wide flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-[#F59E0B]" />
                  <span>ANALYZE YOUR SPECIFIC BUSINESS IDEA</span>
                </h2>
                <p className="text-xs md:text-sm text-[#A1A1AA] mt-1">
                  Type your business concept, target customer, or the pain point you want to solve. Our strategic engine will score its viability and construct a complete venture validation blueprint.
                </p>
              </div>
              <span className="text-[11px] font-mono-code text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full shrink-0 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Strategic AI
              </span>
            </div>

            <form onSubmit={handleEvaluateCustomIdea} className="space-y-5">
              
              {/* Business Name or Title */}
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED] mb-2">
                  IDEA NAME OR WORKING TITLE (OPTIONAL)
                </label>
                <input
                  id="custom-idea-name-input"
                  type="text"
                  value={customIdeaName}
                  onChange={(e) => setCustomIdeaName(e.target.value)}
                  placeholder="e.g. ChargebackGuard AI, LocalPermitRadar, or leave blank for AI to name it..."
                  className="w-full px-4 py-3 bg-[#0F0F11] border border-[#27272A] rounded-xl text-sm font-sans text-[#EDEDED] placeholder:text-[#71717A] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>

              {/* What does the business do? What problem does it solve? */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED]">
                    WHAT DOES THE BUSINESS DO? WHAT PROBLEM DOES IT SOLVE? *
                  </label>
                  <span className="text-[11px] font-mono-code text-[#F59E0B]">
                    Required
                  </span>
                </div>
                <textarea
                  id="custom-idea-description-input"
                  rows={4}
                  value={customIdeaDescription}
                  onChange={(e) => setCustomIdeaDescription(e.target.value)}
                  placeholder="Describe your idea in your own words. For example: An AI tool for physical therapy clinics that records patient consultations on iPad and turns them into insurance-compliant EHR notes so therapists don't spend 2 hours typing at night..."
                  className="w-full px-4 py-3 bg-[#0F0F11] border border-[#27272A] rounded-xl text-sm font-sans text-[#EDEDED] placeholder:text-[#71717A] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] resize-y"
                  required
                />
              </div>

              {/* Optional Audience & Monetization grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED] mb-2">
                    TARGET CUSTOMER (ICP)
                  </label>
                  <input
                    id="custom-target-audience-input"
                    type="text"
                    value={customTargetAudience}
                    onChange={(e) => setCustomTargetAudience(e.target.value)}
                    placeholder="e.g. Independent dental clinics, Shopify merchants doing $20k+ MRR..."
                    className="w-full px-4 py-3 bg-[#0F0F11] border border-[#27272A] rounded-xl text-sm font-sans text-[#EDEDED] placeholder:text-[#71717A] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED] mb-2">
                    MONETIZATION / PRICING ANGLE (OPTIONAL)
                  </label>
                  <input
                    id="custom-monetization-input"
                    type="text"
                    value={customMonetization}
                    onChange={(e) => setCustomMonetization(e.target.value)}
                    placeholder="e.g. $99/month SaaS subscription, or $500 upfront + rev-share..."
                    className="w-full px-4 py-3 bg-[#0F0F11] border border-[#27272A] rounded-xl text-sm font-sans text-[#EDEDED] placeholder:text-[#71717A] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                  />
                </div>
              </div>

              {/* Preset Examples to try with 1 click */}
              <div className="pt-2">
                <div className="text-[11px] font-mono-code uppercase text-[#71717A] mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Click to test an example concept:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CUSTOM_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCustomIdeaName(tmpl.name);
                        setCustomIdeaDescription(tmpl.desc);
                        setCustomTargetAudience(tmpl.target);
                        setCustomMonetization(tmpl.monetization);
                      }}
                      className="text-left p-3 rounded-xl bg-[#0F0F11] border border-[#27272A] hover:border-[#F59E0B]/50 hover:bg-[#18181B] transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-semibold text-[#EDEDED] group-hover:text-[#F59E0B] transition-colors">
                        {tmpl.name}
                      </div>
                      <div className="text-[11px] text-[#71717A] line-clamp-1 mt-0.5">
                        {tmpl.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#27272A]">
                <div className="text-xs font-mono-code text-[#71717A] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant 0-100 opportunity scoring & full venture breakdown</span>
                </div>

                <button
                  id="submit-custom-idea-btn"
                  type="submit"
                  disabled={isEvaluatingCustom || (!customIdeaName.trim() && !customIdeaDescription.trim())}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#F59E0B] text-[#0A0A0B] font-anton text-base tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer"
                >
                  {isEvaluatingCustom ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#0A0A0B]" />
                      <span>ANALYZING YOUR IDEA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#0A0A0B]" />
                      <span>ANALYZE & SCORE MY IDEA</span>
                      <ArrowRight className="w-4 h-4 text-[#0A0A0B]" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 2: AI IDEA DISCOVERY GENERATOR */}
        {activeTab === "discover" && (
          <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            
            {/* Mode Selector */}
            <div>
              <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED] mb-3">
                1. SELECT DISCOVERY ANGLE
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const isSelected = mode === m.id;
                  return (
                    <div
                      key={m.id}
                      id={`mode-${m.id}`}
                      onClick={() => setMode(m.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#18181B] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          : "bg-[#0F0F11] border-[#27272A] hover:border-[#F59E0B]/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-[#F59E0B]" : "text-[#A1A1AA]"}`} />
                          <span className={`font-anton text-base uppercase ${isSelected ? "text-[#F59E0B]" : "text-[#EDEDED]"}`}>
                            {m.title}
                          </span>
                        </div>
                        <p className="text-xs text-[#A1A1AA] leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Optional Prompt Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED]">
                  2. SPECIFIC INDUSTRY, TOPIC, OR PROMPT (OPTIONAL)
                </label>
                <span className="text-[11px] font-mono-code text-[#F59E0B]">
                  🎲 Anti-repetition seed active
                </span>
              </div>
              <div className="relative mb-3">
                <input
                  id="custom-prompt-input"
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Focus on e-commerce logistics, real estate wholesaling, dental clinics, or B2B developer tools..."
                  className="w-full px-4 py-3.5 bg-[#0F0F11] border border-[#27272A] rounded-xl text-sm font-sans text-[#EDEDED] placeholder:text-[#71717A] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]"
                />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono-code uppercase text-[#71717A] tracking-wider">
                  Quick Topics:
                </span>
                {[
                  "B2B AI Copilots & Workflows",
                  "High-Margin Niche Micro-SaaS",
                  "E-Commerce Dispute & Logistics Automation",
                  "Local Trade Contractor Tools",
                  "Legal & Vendor Compliance Scanners",
                  "Real Estate Deal Intelligence",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setCustomPrompt(suggestion)}
                    className={`text-[11px] font-mono-code px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      customPrompt === suggestion
                        ? "bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]"
                        : "bg-[#0F0F11] text-[#A1A1AA] border-[#27272A] hover:text-[#EDEDED] hover:border-[#F59E0B]/50"
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#27272A]">
              <div className="text-xs font-mono-code text-[#71717A]">
                Generates 5 distinct, high-margin opportunities with multivariate scores.
              </div>

              <button
                id="generate-ideas-btn"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#F59E0B] text-[#0A0A0B] font-anton text-base tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#0A0A0B]" />
                    <span>GENERATING FRESH IDEAS...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#0A0A0B]" />
                    <span>GENERATE 5 BUSINESS IDEAS</span>
                    <ArrowRight className="w-4 h-4 text-[#0A0A0B]" />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {/* Results Section */}
        {ideas.length > 0 ? (
          <div className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase tracking-wide flex items-center gap-2">
                  <span>ACTIVE BUSINESS OPPORTUNITIES</span>
                  <span className="text-xs font-mono-code px-2.5 py-0.5 rounded-full bg-[#18181B] text-[#F59E0B] border border-[#27272A]">
                    {ideas.length} candidates
                  </span>
                </h3>
                <p className="text-xs text-[#71717A] font-mono-code">
                  Ranked by multivariate opportunity score. Click any card to launch deep diligence, live competitor intelligence, stress testing, and MVP roadmap.
                </p>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold font-mono-code uppercase tracking-wider text-[#EDEDED] bg-[#131315] border border-[#27272A] rounded-lg hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>🎲 Reroll Fresh Batch</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          </div>
        ) : (
          !isLoading && activeTab === "discover" && (
            <div className="bg-[#131315] border-2 border-dashed border-[#27272A] rounded-2xl p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#18181B] text-[#F59E0B] border border-[#27272A] flex items-center justify-center font-bold mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase mb-2">
                READY TO DISCOVER YOUR NEXT VENTURE?
              </h3>
              <p className="text-xs md:text-sm text-[#A1A1AA] max-w-md mb-6">
                Click the button above to generate 5 tailored business opportunities, or switch to the &quot;Type & Evaluate My Own Idea&quot; tab to score your personal concept.
              </p>
              <button
                onClick={handleGenerate}
                className="px-6 py-3 bg-[#F59E0B] text-[#0A0A0B] font-anton text-sm tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer"
              >
                GENERATE FIRST BATCH
              </button>
            </div>
          )
        )}

      </div>
    </div>
  );
};
