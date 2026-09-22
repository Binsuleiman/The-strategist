import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { FounderProfile } from "../types";
import { 
  Sliders, 
  Save, 
  RefreshCw, 
  Trash2, 
  Check, 
  Sparkles, 
  Shield, 
  Cpu, 
  Database,
  ArrowLeft
} from "lucide-react";

export const SettingsView: React.FC = () => {
  const { founderProfile, updateFounderProfile, setCurrentView, addToast } = useApp();
  const [profile, setProfile] = useState<FounderProfile>(founderProfile);

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

  const toggleArrayItem = (field: "skills" | "interests", value: string) => {
    const current = profile[field] || [];
    if (current.includes(value)) {
      setProfile({ ...profile, [field]: current.filter((x) => x !== value) });
    } else {
      setProfile({ ...profile, [field]: [...current, value] });
    }
  };

  const handleSave = () => {
    updateFounderProfile(profile);
    addToast({
      type: "success",
      title: "Profile Updated",
      message: "Your founder configuration has been saved.",
    });
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all stored strategy data and reset to defaults?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#EDEDED] pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272A] pb-6">
          <div>
            <button
              onClick={() => setCurrentView("dashboard")}
              className="inline-flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase tracking-wider text-[#71717A] hover:text-[#EDEDED] mb-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="font-anton text-4xl sm:text-5xl text-[#EDEDED] uppercase tracking-tight">
              FOUNDER PROFILE & SETTINGS
            </h1>
            <p className="text-xs md:text-sm text-[#A1A1AA] mt-1 font-mono-code">
              Calibrate how the AI discovers and stress-tests your ventures.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-[#F59E0B] text-[#0A0A0B] font-anton text-sm tracking-wider uppercase rounded-xl hover:bg-[#FBBF24] active:scale-95 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>SAVE CHANGES</span>
          </button>
        </div>

        {/* Form Sections */}
        <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          
          {/* Skills */}
          <div>
            <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED] mb-2">
              CORE SKILLS & STRENGTHS
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => {
                const isSelected = profile.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleArrayItem("skills", skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#F59E0B] text-[#0A0A0B] border-[#F59E0B] font-bold"
                        : "bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:border-[#3F3F46] hover:text-[#EDEDED]"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED] mb-2">
              INTERESTS & INDUSTRY DOMAINS
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const isSelected = profile.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleArrayItem("interests", interest)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#F59E0B] text-[#0A0A0B] border-[#F59E0B] font-bold"
                        : "bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:border-[#3F3F46] hover:text-[#EDEDED]"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget & Time Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED] mb-2">
                CAPITAL BUDGET
              </label>
              <select
                value={profile.budget}
                onChange={(e) => setProfile({ ...profile, budget: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0F0F11] border border-[#27272A] rounded-xl text-xs font-mono-code text-[#EDEDED] focus:outline-none focus:border-[#F59E0B] cursor-pointer"
              >
                <option value="$0 - $500">$0 - $500 (Lean Bootstrap)</option>
                <option value="$500 - $2,500">$500 - $2,500 (Small Pilot)</option>
                <option value="$2,500 - $10,000">$2,500 - $10,000 (Growth Pilot)</option>
                <option value="$10,000+">$10,000+ (Aggressive Scale)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED] mb-2">
                TIME COMMITMENT
              </label>
              <select
                value={profile.timeCommitment}
                onChange={(e) => setProfile({ ...profile, timeCommitment: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0F0F11] border border-[#27272A] rounded-xl text-xs font-mono-code text-[#EDEDED] focus:outline-none focus:border-[#F59E0B] cursor-pointer"
              >
                <option value="5-10 hrs/week">5 - 10 hrs / week (Side-hustle)</option>
                <option value="15-25 hrs/week">15 - 25 hrs / week (Part-time sprint)</option>
                <option value="40+ hrs/week">40+ hrs / week (Full-time venture)</option>
              </select>
            </div>
          </div>

          {/* Business Type & Target Market */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED] mb-2">
                PREFERRED BUSINESS TYPE
              </label>
              <select
                value={profile.businessType}
                onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0F0F11] border border-[#27272A] rounded-xl text-xs font-mono-code text-[#EDEDED] focus:outline-none focus:border-[#F59E0B] cursor-pointer"
              >
                <option value="SaaS">SaaS / Recurring Software</option>
                <option value="Service / Productized Agency">Productized Agency / Service</option>
                <option value="AI Micro-Tool">AI Micro-Tool / Utility</option>
                <option value="Marketplace">Marketplace</option>
                <option value="E-commerce">E-commerce / D2C</option>
                <option value="Local Business">Local Business / Trades Tech</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED] mb-2">
                TARGET MARKET & REGION
              </label>
              <select
                value={profile.targetMarket}
                onChange={(e) => setProfile({ ...profile, targetMarket: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0F0F11] border border-[#27272A] rounded-xl text-xs font-mono-code text-[#EDEDED] focus:outline-none focus:border-[#F59E0B] cursor-pointer"
              >
                <option value="Global English / Remote B2B">Global English / Remote B2B</option>
                <option value="North America (US & Canada)">North America (US & Canada)</option>
                <option value="Europe & UK">Europe & UK</option>
                <option value="Latin America & Emerging Markets">Latin America & Emerging Markets</option>
                <option value="Hyper-Local (Your City / Region)">Hyper-Local (Your City / Region)</option>
              </select>
            </div>
          </div>

          {/* Goal & Risk */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED] mb-2">
                FOUNDER GOAL
              </label>
              <select
                value={profile.founderGoal}
                onChange={(e) => setProfile({ ...profile, founderGoal: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0F0F11] border border-[#27272A] rounded-xl text-xs font-mono-code text-[#EDEDED] focus:outline-none focus:border-[#F59E0B] cursor-pointer"
              >
                <option value="Side income ($2k - $5k / mo)">Side income ($2k - $5k / mo)</option>
                <option value="Full-time business ($10k - $20k / mo)">Full-time business ($10k - $20k / mo)</option>
                <option value="High-growth startup ($1M+ ARR)">High-growth startup ($1M+ ARR)</option>
                <option value="Freelance replacement">Freelance replacement</option>
                <option value="Long-term holding company">Long-term holding company</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono-code font-bold uppercase tracking-wider text-[#EDEDED] mb-2">
                RISK TOLERANCE
              </label>
              <select
                value={profile.riskTolerance}
                onChange={(e) => setProfile({ ...profile, riskTolerance: e.target.value as any })}
                className="w-full px-3.5 py-2.5 bg-[#0F0F11] border border-[#27272A] rounded-xl text-xs font-mono-code text-[#EDEDED] focus:outline-none focus:border-[#F59E0B] cursor-pointer"
              >
                <option value="Conservative">Conservative (Fast cash, lowest risk)</option>
                <option value="Balanced">Balanced (Sustainable growth & margins)</option>
                <option value="Aggressive">Aggressive (Category creation moonshot)</option>
              </select>
            </div>
          </div>

        </div>

        {/* AI & Infrastructure Health */}
        <div className="bg-[#131315] text-[#EDEDED] border border-[#27272A] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono-code font-bold uppercase text-[#F59E0B]">
            <Cpu className="w-4 h-4" />
            <span>AI ENGINE STATUS & DATA PERSISTENCE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code text-[#A1A1AA]">
            <div className="p-3 bg-[#0F0F11] rounded-xl border border-[#27272A]">
              <span className="text-[#EDEDED] font-bold block mb-1">Model Architecture:</span>
              <span>Gemini 3.7 Pro + Flash Hybrid</span>
            </div>
            <div className="p-3 bg-[#0F0F11] rounded-xl border border-[#27272A]">
              <span className="text-[#EDEDED] font-bold block mb-1">Storage Engine:</span>
              <span>Local Persistent State OS</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-anton text-xl text-rose-400 uppercase">
              RESET ALL WORKSPACE DATA
            </h4>
            <p className="text-xs text-rose-300/80">
              Permanently clears all saved opportunities, validation dossiers, and action checklists.
            </p>
          </div>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 text-[#0A0A0B] rounded-xl text-xs font-bold uppercase hover:bg-rose-500 transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Everything</span>
          </button>
        </div>

      </div>
    </div>
  );
};
