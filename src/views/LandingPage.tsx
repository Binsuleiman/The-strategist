import React from "react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { 
  Compass, 
  ShieldAlert, 
  Flame, 
  ArrowRight, 
  Check, 
  X, 
  Sparkles, 
  BarChart3, 
  Workflow, 
  Layers, 
  Calendar, 
  TrendingUp, 
  Target,
  Zap,
  Terminal,
  Clock,
  Briefcase,
  Search,
  Activity
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { setCurrentView, user } = useApp();

  const handleStart = () => {
    if (!user?.hasCompletedOnboarding) {
      setCurrentView("onboarding");
    } else {
      setCurrentView("discover");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EDEDED] pt-20 overflow-x-hidden">
      
      {/* 1. HERO SECTION WITH MOTION ANIMATIONS */}
      <section className="relative py-16 md:py-24 px-4 md:px-8 bg-grid-pattern overflow-hidden border-b border-[#27272A]">
        {/* Ambient Glowing Background Lights */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: [0.12, 0.22, 0.12], 
            scale: [1, 1.08, 1] 
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] md:w-[750px] h-[350px] md:h-[450px] bg-gradient-to-tr from-[#F59E0B]/20 via-[#D97706]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-0"
        />

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          
          {/* Floating Live Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#131315]/90 backdrop-blur-md text-[#F59E0B] border border-[#F59E0B]/30 text-xs font-mono-code font-bold tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F59E0B]"></span>
            </span>
            <span>● AI BUSINESS STRATEGY & MVP RADAR</span>
          </motion.div>

          {/* Hero Headline with Staggered Entrance */}
          <motion.h1 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="font-anton text-5xl sm:text-7xl md:text-8xl tracking-tight text-[#EDEDED] uppercase leading-[0.9] mb-6"
          >
            STOP GUESSING.<br />
            <motion.span 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="highlight-yellow-skew inline-block"
            >
              START BUILDING.
            </motion.span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="max-w-2xl text-base sm:text-lg md:text-xl font-normal text-[#A1A1AA] leading-relaxed mb-10"
          >
            Discover personalized business opportunities, stress-test your ideas with an AI Devil's Advocate, and turn the strongest one into an actionable MVP blueprint.
          </motion.p>

          {/* CTAs with Interactive Animation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md"
          >
            <motion.button
              id="hero-primary-cta"
              onClick={handleStart}
              whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(245,158,11,0.4)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-[#F59E0B] text-[#0A0A0B] font-anton text-lg tracking-wider rounded-full hover:bg-[#FBBF24] transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] group cursor-pointer"
            >
              <span>DISCOVER MY BUSINESS</span>
              <ArrowRight className="w-5 h-5 text-[#0A0A0B] group-hover:translate-x-1.5 transition-transform" />
            </motion.button>

            <motion.a
              href="#how-it-works"
              whileHover={{ scale: 1.02, backgroundColor: "#1c1c20" }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-4 bg-[#131315] text-[#EDEDED] border border-[#27272A] hover:border-[#3F3F46] font-bold text-sm uppercase tracking-wider rounded-full transition-all"
            >
              SEE HOW IT WORKS
            </motion.a>
          </motion.div>

          {/* Floating Live Strategy Signals (Interactive Dynamic Chips) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl"
          >
            <motion.div 
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#131315]/80 border border-[#27272A] text-xs font-mono-code text-[#D4D4D8]"
            >
              <Activity className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>0-100 Viability Scoring</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, delay: 1.3, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#131315]/80 border border-[#27272A] text-xs font-mono-code text-[#D4D4D8]"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Market Grounding</span>
            </motion.div>

            <motion.div 
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, delay: 2.6, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#131315]/80 border border-[#27272A] text-xs font-mono-code text-[#D4D4D8]"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Devil's Advocate Audit</span>
            </motion.div>
          </motion.div>

          {/* Subtext Pipeline Roadmap */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 flex items-center gap-2 text-xs font-mono-code text-[#71717A]"
          >
            <span>DISCOVER</span>
            <span className="text-[#F59E0B]">→</span>
            <span>VALIDATE</span>
            <span className="text-[#F59E0B]">→</span>
            <span>STRESS TEST</span>
            <span className="text-[#F59E0B]">→</span>
            <span>BUILD</span>
          </motion.div>

        </div>
      </section>

      {/* 2. TRUST / POSITIONING STATEMENT */}
      <section className="py-8 bg-[#0F0F11] text-[#EDEDED] border-b border-[#27272A] px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs sm:text-sm font-mono-code text-[#A1A1AA]">
          <div className="flex items-center gap-2">
            <span className="text-[#F59E0B] font-bold">BUILT FOR ASPIRING FOUNDERS</span>
            <span>—</span>
            <span>Zero generic motivational fluff. Pure institutional diligence.</span>
          </div>
          <div className="flex items-center gap-6 text-[#71717A]">
            <span>● 5-MINUTE DISCOVERY</span>
            <span>● DEVIL'S ADVOCATE AUDIT</span>
            <span>● 7-DAY ACTION SPRINT</span>
          </div>
        </div>
      </section>

      {/* 3. PROBLEM / SOLUTION CONTRAST SECTION */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* LEFT — THE OLD WAY */}
          <div className="bg-[#131315] text-[#EDEDED] rounded-2xl p-8 md:p-10 border border-[#27272A] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 font-anton text-9xl text-white/5 select-none pointer-events-none">
              OLD
            </div>
            <div>
              <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-rose-400 mb-3">
                THE TRADITIONAL GRIND
              </div>
              <h3 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase tracking-wide mb-6">
                THE OLD WAY
              </h3>
              <ul className="space-y-4">
                {[
                  "Random AI ideas without commercial viability",
                  "Generic advice with zero founder fit",
                  "No real validation or willingness-to-pay check",
                  "Endless research and scope-creep",
                  "Analysis paralysis lasting 6+ months",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-[#A1A1AA]">
                    <span className="w-5 h-5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/50 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ✕
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-[#27272A] text-xs font-mono-code text-[#71717A]">
              Result: 95% of ideas die before launch.
            </div>
          </div>

          {/* RIGHT — THE STRATEGIST WAY */}
          <div className="bg-[#18181B] text-[#EDEDED] rounded-2xl p-8 md:p-10 border-2 border-[#F59E0B] relative overflow-hidden flex flex-col justify-between shadow-[0_0_30px_rgba(245,158,11,0.12)]">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 font-anton text-9xl text-[#F59E0B]/5 select-none pointer-events-none">
              NEW
            </div>
            <div>
              <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B] mb-3">
                THE INSTITUTIONAL METHOD
              </div>
              <h3 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase tracking-wide mb-6">
                THE STRATEGIST WAY
              </h3>
              <ul className="space-y-4">
                {[
                  "Personalized opportunities matched to your exact skills & budget",
                  "Structured venture validation with TAM/SAM/SOM estimates",
                  "Competitor analysis exposing incumbent weaknesses",
                  "AI Devil's Advocate actively trying to break your business",
                  "Actionable 7-day MVP blueprint with zero code bloat",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm md:text-base text-[#EDEDED]">
                    <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-[#0A0A0B] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-[#27272A] text-xs font-mono-code text-[#F59E0B]">
              Result: Clear decision within 7 days.
            </div>
          </div>

        </div>
      </section>

      {/* 4. BENTO FEATURE GRID */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-8 bg-[#0A0A0B] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B] mb-2">
              COMPLETE STRATEGY SUITE
            </div>
            <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl text-[#EDEDED] uppercase tracking-tight">
              EVERYTHING YOU NEED TO GO FROM ZERO TO LAUNCH
            </h2>
          </div>

          {/* 3-Column Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Personalized Ideas (Span 2 cols) */}
            <div className="md:col-span-2 bg-[#131315] border border-[#27272A] rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-[#F59E0B]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#71717A]">
                    FEATURE 01
                  </span>
                  <Compass className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase mb-2">
                  PERSONALIZED IDEAS
                </h3>
                <p className="text-sm text-[#A1A1AA] mb-6">
                  Generate tailored business opportunities calibrated to your exact background, budget, technical abilities, and risk tolerance.
                </p>
              </div>
              <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 flex flex-wrap gap-2 text-xs font-mono-code">
                <span className="px-2.5 py-1 bg-[#27272A] text-[#EDEDED] rounded">Skills Profile</span>
                <span className="px-2.5 py-1 bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 font-bold rounded">Budget Calibration</span>
                <span className="px-2.5 py-1 bg-[#27272A] text-[#EDEDED] rounded">Time Constraints</span>
                <span className="px-2.5 py-1 bg-[#27272A] text-[#EDEDED] rounded">Niche Wedges</span>
              </div>
            </div>

            {/* Card 2: Opportunity Score */}
            <div className="bg-[#131315] text-[#EDEDED] border border-[#27272A] rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-[#F59E0B]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
                    FEATURE 02
                  </span>
                  <Flame className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase mb-2">
                  OPPORTUNITY SCORE
                </h3>
                <p className="text-sm text-[#A1A1AA] mb-6">
                  Multivariate scoring across Market Demand, Customer Pain, Monetization, and Founder Fit.
                </p>
              </div>
              <div className="flex items-center justify-center p-4 bg-[#18181B] rounded-xl border border-[#27272A]">
                <div className="text-center">
                  <div className="font-anton text-4xl text-[#F59E0B]">88 / 100</div>
                  <div className="text-[10px] font-mono-code text-[#A1A1AA] uppercase">HIGH FIT VERDICT</div>
                </div>
              </div>
            </div>

            {/* Card 3: Validate */}
            <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-[#F59E0B]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#71717A]">
                    FEATURE 03
                  </span>
                  <BarChart3 className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase mb-2">
                  VENTURE VALIDATION
                </h3>
                <p className="text-sm text-[#A1A1AA] mb-6">
                  Deep TAM/SAM/SOM modeling, acquisition channels, and 48-hour smoke testing protocols.
                </p>
              </div>
              <div className="space-y-2 text-xs font-mono-code">
                <div className="flex justify-between p-2 bg-[#18181B] rounded border border-[#27272A]">
                  <span className="text-[#A1A1AA]">Recommendation:</span>
                  <strong className="text-emerald-400">PURSUE</strong>
                </div>
                <div className="flex justify-between p-2 bg-[#18181B] rounded border border-[#27272A]">
                  <span className="text-[#A1A1AA]">Validation Timeframe:</span>
                  <strong className="text-[#EDEDED]">48 Hours</strong>
                </div>
              </div>
            </div>

            {/* Card 4: Devil's Advocate (Span 2 cols) */}
            <div className="md:col-span-2 bg-[#18181B] text-[#EDEDED] border-2 border-[#F59E0B] rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-code text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
                    FEATURE 04 — DEVIL'S ADVOCATE
                  </span>
                  <ShieldAlert className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase mb-2">
                  AI STRESS TESTING: "LET'S TRY TO BREAK IT."
                </h3>
                <p className="text-sm text-[#A1A1AA] mb-6">
                  An uncompromising AI adversary that challenges assumptions, uncovers churn risks, and forces you to inoculate the business before writing code.
                </p>
              </div>
              <div className="bg-[#131315] rounded-xl p-4 border border-[#27272A] text-xs font-mono-code text-[#EDEDED]">
                <span className="text-rose-400 font-bold">● FAILURE RISK IDENTIFIED: </span>
                <span className="text-[#A1A1AA]">Cold-start CAC will exceed LTV unless you anchor pricing to a quantifiable B2B pain point.</span>
              </div>
            </div>

            {/* Card 5: Business Model */}
            <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-[#F59E0B]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#71717A]">
                    FEATURE 05
                  </span>
                  <Layers className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase mb-2">
                  BUSINESS MODEL
                </h3>
                <p className="text-sm text-[#A1A1AA] mb-6">
                  Complete canvas including pricing tiers, unit economics, distribution channels, and defensible moats.
                </p>
              </div>
              <div className="p-3 bg-[#18181B] border border-[#27272A] rounded-lg text-xs font-mono-code text-center font-bold text-[#EDEDED]">
                Tier 1 ($49/mo) & Tier 2 ($149/mo)
              </div>
            </div>

            {/* Card 6: MVP Builder */}
            <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-[#F59E0B]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-code text-xs font-bold uppercase tracking-wider text-[#71717A]">
                    FEATURE 06
                  </span>
                  <Zap className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase mb-2">
                  MVP BUILDER
                </h3>
                <p className="text-sm text-[#A1A1AA] mb-4">
                  Strict triage of features to avoid scope creep:
                </p>
              </div>
              <div className="space-y-1.5 text-xs font-mono-code">
                <div className="p-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 rounded font-bold">
                  ✓ BUILD FIRST (3 Core Features)
                </div>
                <div className="p-1.5 bg-amber-950/60 text-amber-300 border border-amber-800/60 rounded">
                  ⏳ BUILD LATER (v1.1)
                </div>
                <div className="p-1.5 bg-rose-950/60 text-rose-300 border border-rose-800/60 rounded">
                  ✕ DON'T BUILD YET (Bloat Traps)
                </div>
              </div>
            </div>

            {/* Card 7: 7-Day Action Plan (Span 2 cols) */}
            <div className="md:col-span-2 bg-[#18181B] text-[#EDEDED] border border-[#F59E0B]/50 rounded-2xl p-6 md:p-8 flex flex-col justify-between hover:border-[#F59E0B] hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-code text-xs font-bold uppercase tracking-widest text-[#F59E0B]">
                    FEATURE 07 — EXECUTION ENGINE
                  </span>
                  <Calendar className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase mb-2">
                  7-DAY ACTION PLAN WITH DECISION CRITERIA
                </h3>
                <p className="text-sm text-[#A1A1AA] mb-6">
                  Day-by-day tactical sprint from offer creation to customer interviews, pre-sales, and the Day 7 Pivot-or-Build decision council.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-code text-[#EDEDED]">
                <div className="bg-[#131315] p-2 rounded border border-[#27272A] font-bold">Day 1: Offer</div>
                <div className="bg-[#131315] p-2 rounded border border-[#27272A] font-bold">Day 3: Pre-Sell</div>
                <div className="bg-[#131315] p-2 rounded border border-[#27272A] font-bold">Day 5: Concierge</div>
                <div className="bg-[#F59E0B] text-[#0A0A0B] p-2 rounded font-bold">Day 7: Decision</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-28 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B] mb-3">
              THE WORKFLOW
            </div>
            <h2 className="font-anton text-5xl sm:text-6xl md:text-7xl text-[#EDEDED] uppercase leading-[0.9] mb-6">
              FROM IDEA<br />
              TO ACTION.
            </h2>
            <p className="text-base text-[#A1A1AA] mb-8 max-w-md leading-relaxed">
              No endless loops. A linear, rigorous framework that takes you from blank canvas to verified opportunity in minutes.
            </p>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F59E0B] text-[#0A0A0B] font-anton text-base tracking-wider rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
            >
              <span>TRY IT NOW</span>
              <ArrowRight className="w-4 h-4 text-[#0A0A0B]" />
            </button>
          </div>

          {/* Right Column: 01, 02, 03 */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Step 01 */}
            <div className="group bg-[#131315] border border-[#27272A] rounded-2xl p-8 transition-all hover:border-[#F59E0B]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-2 right-4 font-anton text-8xl md:text-9xl text-[#F59E0B]/10 group-hover:text-[#F59E0B]/20 transition-colors pointer-events-none select-none">
                01
              </div>
              <div className="relative z-10">
                <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B] mb-2">
                  PHASE 1
                </div>
                <h3 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase mb-3">
                  DISCOVER
                </h3>
                <p className="text-sm md:text-base text-[#A1A1AA] leading-relaxed max-w-lg">
                  Tell the AI about yourself — your technical skills, passions, capital, and goals. It generates 5 tailored business opportunities with multidimensional opportunity scores.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="group bg-[#131315] border border-[#27272A] rounded-2xl p-8 transition-all hover:border-[#F59E0B]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-2 right-4 font-anton text-8xl md:text-9xl text-[#F59E0B]/10 group-hover:text-[#F59E0B]/20 transition-colors pointer-events-none select-none">
                02
              </div>
              <div className="relative z-10">
                <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B] mb-2">
                  PHASE 2
                </div>
                <h3 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase mb-3">
                  STRESS TEST
                </h3>
                <p className="text-sm md:text-base text-[#A1A1AA] leading-relaxed max-w-lg">
                  The AI Devil's Advocate analyzes your chosen idea and actively searches for reasons it could fail: customer churn, incumbent defensibility, or distribution bottlenecks. Then, it pivots and hardens the model.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="group bg-[#131315] border border-[#27272A] rounded-2xl p-8 transition-all hover:border-[#F59E0B]/50 hover:shadow-[0_8px_25px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-2 right-4 font-anton text-8xl md:text-9xl text-[#F59E0B]/10 group-hover:text-[#F59E0B]/20 transition-colors pointer-events-none select-none">
                03
              </div>
              <div className="relative z-10">
                <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B] mb-2">
                  PHASE 3
                </div>
                <h3 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase mb-3">
                  BUILD
                </h3>
                <p className="text-sm md:text-base text-[#A1A1AA] leading-relaxed max-w-lg">
                  Turn the strongest opportunity into a trimmed MVP blueprint and a tactical 7-day action plan with measurable milestones and go/no-go decision criteria.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. PRODUCT MOCKUP SECTION */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-[#0F0F11] text-[#EDEDED] border-y border-[#27272A]">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#F59E0B] mb-2">
              INTERACTIVE INTERFACE
            </div>
            <h2 className="font-anton text-4xl sm:text-5xl text-[#EDEDED] uppercase tracking-tight">
              BUILT FOR STRATEGIC CLARITY
            </h2>
          </div>

          {/* Browser Window Mockup */}
          <div className="bg-[#131315] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Window Header */}
            <div className="h-10 bg-[#0F0F11] border-b border-[#27272A] px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="text-[11px] font-mono-code text-[#71717A] bg-[#18181B] px-4 py-0.5 rounded-full border border-[#27272A]">
                https://strategist.ai/ideas/revflow-ai
              </div>
              <div className="w-12" />
            </div>

            {/* Window Interior */}
            <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#27272A]">
              
              {/* Mock Sidebar */}
              <div className="md:col-span-3 p-4 space-y-2 bg-[#0F0F11] text-xs font-mono-code">
                <div className="text-[10px] text-[#71717A] uppercase tracking-wider mb-2">STRATEGY SUITE</div>
                <div className="p-2 rounded bg-[#18181B] text-[#F59E0B] font-bold border border-[#27272A]">● Overview</div>
                <div className="p-2 rounded text-[#A1A1AA] hover:bg-[#18181B]">● Validation</div>
                <div className="p-2 rounded text-[#A1A1AA] hover:bg-[#18181B]">● Stress Test</div>
                <div className="p-2 rounded text-[#A1A1AA] hover:bg-[#18181B]">● Business Model</div>
                <div className="p-2 rounded text-[#A1A1AA] hover:bg-[#18181B]">● MVP Blueprint</div>
                <div className="p-2 rounded text-[#A1A1AA] hover:bg-[#18181B]">● 7-Day Plan</div>
              </div>

              {/* Mock Main Area */}
              <div className="md:col-span-9 p-6 md:p-8 bg-[#131315]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="text-xs font-mono-code uppercase text-[#F59E0B] mb-1">OPPORTUNITY CANDIDATE</div>
                    <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase">REVFLOW AI</h3>
                    <p className="text-xs text-[#A1A1AA]">Autonomous B2B invoice collection & payment dispute resolver</p>
                  </div>
                  <div className="px-4 py-2 bg-[#18181B] border border-[#F59E0B] text-[#F59E0B] rounded-xl text-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <div className="font-anton text-2xl leading-none">88 / 100</div>
                    <div className="text-[9px] font-mono-code font-bold uppercase">OVERALL FIT</div>
                  </div>
                </div>

                {/* Score breakdown metrics in mockup */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                    <div className="text-[10px] font-mono-code text-[#71717A]">MARKET DEMAND</div>
                    <div className="text-lg font-bold text-[#EDEDED]">91 / 100</div>
                  </div>
                  <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                    <div className="text-[10px] font-mono-code text-[#71717A]">CUSTOMER PAIN</div>
                    <div className="text-lg font-bold text-[#EDEDED]">94 / 100</div>
                  </div>
                  <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A]">
                    <div className="text-[10px] font-mono-code text-[#71717A]">FOUNDER FIT</div>
                    <div className="text-lg font-bold text-[#F59E0B]">92 / 100</div>
                  </div>
                </div>

                {/* Action buttons inside mockup */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleStart}
                    className="px-4 py-2 bg-[#F59E0B] text-[#0A0A0B] text-xs font-anton tracking-wider uppercase rounded-lg hover:bg-[#FBBF24] transition-colors cursor-pointer"
                  >
                    VALIDATE IDEA
                  </button>
                  <button
                    onClick={handleStart}
                    className="px-4 py-2 bg-[#18181B] text-[#EDEDED] border border-[#27272A] text-xs font-anton tracking-wider uppercase rounded-lg hover:border-[#F59E0B] hover:text-[#F59E0B] transition-colors cursor-pointer"
                  >
                    STRESS TEST (DEVIL'S ADVOCATE)
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 7. FINAL CTA BANNER */}
      <section className="py-20 md:py-28 px-4 md:px-8 bg-gradient-to-b from-[#131315] to-[#0F0F11] text-[#EDEDED] border-t border-[#27272A]">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          <h2 className="font-anton text-5xl sm:text-6xl md:text-7xl text-[#EDEDED] uppercase leading-[0.9] mb-6">
            YOUR NEXT BUSINESS<br />
            <span className="text-[#F59E0B]">STARTS HERE.</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl font-medium text-[#A1A1AA] max-w-xl mb-10">
            Find an opportunity that fits you, test whether it can actually work, and turn it into a concrete launch plan.
          </p>

          <button
            id="final-cta-btn"
            onClick={handleStart}
            className="flex items-center gap-3 px-10 py-5 bg-[#F59E0B] text-[#0A0A0B] font-anton text-xl tracking-wider rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] group cursor-pointer"
          >
            <span>START BUILDING</span>
            <ArrowRight className="w-5 h-5 text-[#0A0A0B] group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="mt-6 text-xs font-mono-code text-[#71717A]">
            No credit card required. Free instant exploration.
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#0A0A0B] text-[#71717A] text-xs font-mono-code px-4 border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            THE STRATEGIST. AI Business Strategy MVP
          </div>
          <div>
            Discover → Validate → Stress-Test → Build
          </div>
        </div>
      </footer>

    </div>
  );
};
