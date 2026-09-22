import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Wrench, 
  Heart, 
  DollarSign, 
  Clock, 
  Globe, 
  Building2, 
  Target, 
  Shield 
} from "lucide-react";

export const OnboardingView: React.FC = () => {
  const { founderProfile, updateFounderProfile, user, setUser, setCurrentView, addToast } = useApp();
  const [step, setStep] = useState(1);

  const totalSteps = 8;

  // Step 1: Skills options
  const SKILL_OPTIONS = [
    "Full-Stack Dev",
    "Frontend / UI",
    "Backend & APIs",
    "AI / Prompting",
    "Cold Outreach & Sales",
    "Growth & SEO",
    "Copywriting",
    "UI/UX Design",
    "Operations & Automation",
    "Financial Modeling",
    "No-Code Tools",
    "Community Building",
  ];

  // Step 2: Interests options
  const INTEREST_OPTIONS = [
    "B2B SaaS",
    "Workflow Automation",
    "AI Micro-Tools",
    "Agency Services",
    "Developer Tools",
    "Healthcare & Clinics",
    "Legal & Compliance",
    "Real Estate & Property",
    "E-commerce & Brands",
    "Finance & Accounting",
    "Local Service Trades",
    "Content & Media",
  ];

  // Step 3: Budget options
  const BUDGET_OPTIONS = [
    { label: "$0 - $500", desc: "Bootstrap strictly with organic sweat equity" },
    { label: "$500 - $2,500", desc: "Lean budget for domain, hosting, and outreach tooling" },
    { label: "$2,500 - $10,000", desc: "Comfortable budget for small paid tests & outsourced assets" },
    { label: "$10,000+", desc: "Full capital allocation ready to scale aggressively" },
  ];

  // Step 4: Time Commitment options
  const TIME_OPTIONS = [
    { label: "5 - 10 hrs / week", desc: "Weekend side-hustle alongside a full-time job" },
    { label: "15 - 25 hrs / week", desc: "Serious part-time focus with dedicated evenings" },
    { label: "40+ hrs / week", desc: "Full-time dedication and maximum sprint speed" },
  ];

  // Step 5: Target Market
  const MARKET_OPTIONS = [
    "Global English / Remote B2B",
    "North America (US & Canada)",
    "Europe & UK",
    "Latin America & Emerging Markets",
    "Hyper-Local (Your City / Region)",
  ];

  // Step 6: Business Type
  const BUSINESS_TYPES = [
    { label: "SaaS", desc: "High margin, recurring subscription software" },
    { label: "Service / Productized Agency", desc: "Fast cash flow, done-for-you workflows with high retainers" },
    { label: "AI Micro-Tool", desc: "Single-feature utility with ultra-fast development cycle" },
    { label: "Marketplace", desc: "Connecting buyers and sellers in a high-ticket niche" },
    { label: "E-commerce / D2C", desc: "Physical or digital goods with transactional revenue" },
    { label: "Local Business / Trades Tech", desc: "Tech-enabled service for physical operators" },
  ];

  // Step 7: Founder Goal
  const GOAL_OPTIONS = [
    { label: "Side income ($2k - $5k / mo)", desc: "Reliable cash flow with low maintenance" },
    { label: "Full-time business ($10k - $20k / mo)", desc: "Replace employment and achieve complete sovereignty" },
    { label: "High-growth startup ($1M+ ARR)", desc: "Venture-backable scalable software enterprise" },
    { label: "Freelance replacement", desc: "Productized packaging of personal skills" },
    { label: "Long-term holding company", desc: "Portfolio of niche, profitable micro-assets" },
  ];

  // Step 8: Risk Tolerance
  const RISK_OPTIONS: Array<{ label: 'Conservative' | 'Balanced' | 'Aggressive'; desc: string }> = [
    { label: "Conservative", desc: "Prioritize guaranteed fast cash flow, lowest risk, proven demand" },
    { label: "Balanced", desc: "Healthy blend of steady revenue and upside opportunity" },
    { label: "Aggressive", desc: "High-risk, category-defining moonshot with massive market upside" },
  ];

  const toggleArrayItem = (field: "skills" | "interests", value: string) => {
    const current = founderProfile[field] || [];
    if (current.includes(value)) {
      updateFounderProfile({ [field]: current.filter((x) => x !== value) });
    } else {
      updateFounderProfile({ [field]: [...current, value] });
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      // Complete onboarding
      if (user) {
        setUser({ ...user, hasCompletedOnboarding: true });
      }
      addToast({
        type: "success",
        title: "Profile Configured",
        message: "Your Founder Profile is ready. Let's find your opportunity.",
      });
      setCurrentView("discover");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      setCurrentView("landing");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] bg-grid-pattern pt-24 pb-16 px-4 md:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-[#131315] border border-[#27272A] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-6 md:p-10 relative">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-mono-code mb-2">
            <span className="font-bold text-[#EDEDED] uppercase tracking-wider">
              FOUNDER ONBOARDING — STEP {step} OF {totalSteps}
            </span>
            <span className="text-[#F59E0B] font-bold">
              {Math.round((step / totalSteps) * 100)}% COMPLETE
            </span>
          </div>
          <div className="w-full h-2 bg-[#18181B] rounded-full overflow-hidden p-0.5 border border-[#27272A]">
            <div
              className="h-full bg-[#F59E0B] rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[340px]">
          
          {/* STEP 1: Skills */}
          {step === 1 && (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-[#F59E0B] mb-1">
                <Wrench className="w-4 h-4 text-[#F59E0B]" />
                <span>STEP 01 / 08</span>
              </div>
              <h2 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase mb-2">
                WHAT ARE YOU GOOD AT?
              </h2>
              <p className="text-xs md:text-sm text-[#A1A1AA] mb-6">
                Select your core technical, sales, or design strengths. The AI uses this to maximize your founder execution fit.
              </p>

              <div className="flex flex-wrap gap-2.5">
                {SKILL_OPTIONS.map((skill) => {
                  const isSelected = founderProfile.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleArrayItem("skills", skill)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-[#18181B] text-[#F59E0B] border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                          : "bg-[#0F0F11] text-[#A1A1AA] border-[#27272A] hover:border-[#F59E0B]/40 hover:text-[#EDEDED]"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Interests */}
          {step === 2 && (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-[#F59E0B] mb-1">
                <Heart className="w-4 h-4 text-[#F59E0B]" />
                <span>STEP 02 / 08</span>
              </div>
              <h2 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase mb-2">
                WHAT ARE YOU INTERESTED IN?
              </h2>
              <p className="text-xs md:text-sm text-[#A1A1AA] mb-6">
                Choose the industries and problem spaces you actually enjoy thinking about.
              </p>

              <div className="flex flex-wrap gap-2.5">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = founderProfile.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => toggleArrayItem("interests", interest)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-[#18181B] text-[#F59E0B] border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                          : "bg-[#0F0F11] text-[#A1A1AA] border-[#27272A] hover:border-[#F59E0B]/40 hover:text-[#EDEDED]"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#F59E0B]" />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Budget */}
          {step === 3 && (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-[#F59E0B] mb-1">
                <DollarSign className="w-4 h-4 text-[#F59E0B]" />
                <span>STEP 03 / 08</span>
              </div>
              <h2 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase mb-2">
                HOW MUCH CAN YOU INVEST?
              </h2>
              <p className="text-xs md:text-sm text-[#A1A1AA] mb-6">
                Estimated upfront capital you can allocate for testing, domains, and tools.
              </p>

              <div className="space-y-3">
                {BUDGET_OPTIONS.map((opt) => {
                  const isSelected = founderProfile.budget === opt.label;
                  return (
                    <div
                      key={opt.label}
                      onClick={() => updateFounderProfile({ budget: opt.label })}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#18181B] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          : "bg-[#0F0F11] border-[#27272A] hover:border-[#F59E0B]/40"
                      }`}
                    >
                      <div>
                        <div className={`font-anton text-lg ${isSelected ? "text-[#F59E0B]" : "text-[#EDEDED]"}`}>{opt.label}</div>
                        <div className="text-xs text-[#A1A1AA]">{opt.desc}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#F59E0B] text-[#0A0A0B] flex items-center justify-center font-bold">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Time Commitment */}
          {step === 4 && (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-[#F59E0B] mb-1">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <span>STEP 04 / 08</span>
              </div>
              <h2 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase mb-2">
                HOW MUCH TIME CAN YOU COMMIT?
              </h2>
              <p className="text-xs md:text-sm text-[#A1A1AA] mb-6">
                Be honest with your weekly bandwidth so we don't suggest an idea that demands 60 hours.
              </p>

              <div className="space-y-3">
                {TIME_OPTIONS.map((opt) => {
                  const isSelected = founderProfile.timeCommitment.includes(opt.label.split(" ")[0]);
                  return (
                    <div
                      key={opt.label}
                      onClick={() => updateFounderProfile({ timeCommitment: opt.label })}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#18181B] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          : "bg-[#0F0F11] border-[#27272A] hover:border-[#F59E0B]/40"
                      }`}
                    >
                      <div>
                        <div className={`font-anton text-lg ${isSelected ? "text-[#F59E0B]" : "text-[#EDEDED]"}`}>{opt.label}</div>
                        <div className="text-xs text-[#A1A1AA]">{opt.desc}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#F59E0B] text-[#0A0A0B] flex items-center justify-center font-bold">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Target Market */}
          {step === 5 && (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-[#F59E0B] mb-1">
                <Globe className="w-4 h-4 text-[#F59E0B]" />
                <span>STEP 05 / 08</span>
              </div>
              <h2 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase mb-2">
                WHERE DO YOU WANT TO BUILD?
              </h2>
              <p className="text-xs md:text-sm text-[#A1A1AA] mb-6">
                Target geography or customer market focus.
              </p>

              <div className="space-y-2.5">
                {MARKET_OPTIONS.map((m) => {
                  const isSelected = founderProfile.targetMarket === m;
                  return (
                    <div
                      key={m}
                      onClick={() => updateFounderProfile({ targetMarket: m })}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#18181B] text-[#EDEDED] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          : "bg-[#0F0F11] text-[#A1A1AA] border-[#27272A] hover:border-[#F59E0B]/40 hover:text-[#EDEDED]"
                      }`}
                    >
                      <span className={`font-semibold text-sm ${isSelected ? "text-[#F59E0B]" : ""}`}>{m}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#F59E0B]" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Business Type */}
          {step === 6 && (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-[#F59E0B] mb-1">
                <Building2 className="w-4 h-4 text-[#F59E0B]" />
                <span>STEP 06 / 08</span>
              </div>
              <h2 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase mb-2">
                WHAT KIND OF BUSINESS DO YOU WANT?
              </h2>
              <p className="text-xs md:text-sm text-[#A1A1AA] mb-6">
                Preferred business model and delivery structure.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUSINESS_TYPES.map((b) => {
                  const isSelected = founderProfile.businessType === b.label;
                  return (
                    <div
                      key={b.label}
                      onClick={() => updateFounderProfile({ businessType: b.label })}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#18181B] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          : "bg-[#0F0F11] border-[#27272A] hover:border-[#F59E0B]/40"
                      }`}
                    >
                      <div className={`font-anton text-base mb-1 ${isSelected ? "text-[#F59E0B]" : "text-[#EDEDED]"}`}>{b.label}</div>
                      <div className="text-[11px] text-[#A1A1AA]">{b.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Goal */}
          {step === 7 && (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-[#F59E0B] mb-1">
                <Target className="w-4 h-4 text-[#F59E0B]" />
                <span>STEP 07 / 08</span>
              </div>
              <h2 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase mb-2">
                WHAT IS YOUR ULTIMATE GOAL?
              </h2>
              <p className="text-xs md:text-sm text-[#A1A1AA] mb-6">
                What does success look like for this venture?
              </p>

              <div className="space-y-2.5">
                {GOAL_OPTIONS.map((g) => {
                  const isSelected = founderProfile.founderGoal === g.label;
                  return (
                    <div
                      key={g.label}
                      onClick={() => updateFounderProfile({ founderGoal: g.label })}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#18181B] text-[#EDEDED] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          : "bg-[#0F0F11] text-[#A1A1AA] border-[#27272A] hover:border-[#F59E0B]/40 hover:text-[#EDEDED]"
                      }`}
                    >
                      <div>
                        <div className={`font-semibold text-sm ${isSelected ? "text-[#F59E0B]" : "text-[#EDEDED]"}`}>{g.label}</div>
                        <div className="text-[11px] text-[#A1A1AA]">{g.desc}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#F59E0B]" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 8: Risk Tolerance */}
          {step === 8 && (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-[#F59E0B] mb-1">
                <Shield className="w-4 h-4 text-[#F59E0B]" />
                <span>STEP 08 / 08</span>
              </div>
              <h2 className="font-anton text-3xl md:text-4xl text-[#EDEDED] uppercase mb-2">
                WHAT IS YOUR RISK TOLERANCE?
              </h2>
              <p className="text-xs md:text-sm text-[#A1A1AA] mb-6">
                This shapes how aggressive the AI's monetization and market assumptions will be.
              </p>

              <div className="space-y-3">
                {RISK_OPTIONS.map((r) => {
                  const isSelected = founderProfile.riskTolerance === r.label;
                  return (
                    <div
                      key={r.label}
                      onClick={() => updateFounderProfile({ riskTolerance: r.label })}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#18181B] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                          : "bg-[#0F0F11] border-[#27272A] hover:border-[#F59E0B]/40"
                      }`}
                    >
                      <div>
                        <div className={`font-anton text-lg ${isSelected ? "text-[#F59E0B]" : "text-[#EDEDED]"}`}>{r.label}</div>
                        <div className="text-xs text-[#A1A1AA]">{r.desc}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#F59E0B] text-[#0A0A0B] flex items-center justify-center font-bold">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-[#27272A] flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#71717A] hover:text-[#EDEDED] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{step === 1 ? "Back to Home" : "Previous"}</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-[#F59E0B] text-[#0A0A0B] font-anton text-sm tracking-wider uppercase rounded-full hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] group cursor-pointer"
          >
            <span>{step === totalSteps ? "COMPLETE & DISCOVER IDEAS" : "CONTINUE"}</span>
            <ArrowRight className="w-4 h-4 text-[#0A0A0B] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
};
