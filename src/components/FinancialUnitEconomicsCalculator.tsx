import React, { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  PieChart as PieChartIcon,
  Calculator,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  Sliders,
  Scale,
  Zap,
  Info,
  Layers,
} from "lucide-react";
import { Idea, FinancialModel } from "../types";
import { generateFinancialsApi } from "../services/api";
import { useApp } from "../context/AppContext";

interface FinancialUnitEconomicsCalculatorProps {
  idea: Idea;
  onUpdateIdea: (updated: Idea) => void;
}

export const FinancialUnitEconomicsCalculator: React.FC<
  FinancialUnitEconomicsCalculatorProps
> = ({ idea, onUpdateIdea }) => {
  const { addToast } = useApp();
  const [model, setModel] = useState<FinancialModel | null>(
    idea.financialModel || null
  );
  const [isLoading, setIsLoading] = useState(false);

  // Interactive Live Override States
  const [monthlyPrice, setMonthlyPrice] = useState<number>(
    idea.financialModel?.unitEconomics.monthlyPrice || 99
  );
  const [grossMarginPercent, setGrossMarginPercent] = useState<number>(
    idea.financialModel?.unitEconomics.grossMarginPercent || 85
  );
  const [estimatedCac, setEstimatedCac] = useState<number>(
    idea.financialModel?.unitEconomics.estimatedCac || 220
  );
  const [monthlyChurnPercent, setMonthlyChurnPercent] = useState<number>(
    idea.financialModel?.unitEconomics.monthlyChurnPercent || 3.5
  );
  const [monthlyFixedCosts, setMonthlyFixedCosts] = useState<number>(
    idea.financialModel?.breakeven.monthlyFixedCosts || 3500
  );

  // Market Sizing Overrides
  const [tamUnits, setTamUnits] = useState<number>(
    idea.financialModel?.tam.totalUnits || 500000
  );
  const [samPercent, setSamPercent] = useState<number>(
    idea.financialModel?.sam.segmentPercentage || 25
  );
  const [somPercent, setSomPercent] = useState<number>(
    idea.financialModel?.som.targetSharePercentage || 1.5
  );

  // Load or generate initial model
  useEffect(() => {
    if (!idea.financialModel) {
      loadFinancialModel();
    } else {
      syncStatesFromModel(idea.financialModel);
    }
  }, [idea.id]);

  const syncStatesFromModel = (m: FinancialModel) => {
    setModel(m);
    setMonthlyPrice(m.unitEconomics.monthlyPrice);
    setGrossMarginPercent(m.unitEconomics.grossMarginPercent);
    setEstimatedCac(m.unitEconomics.estimatedCac);
    setMonthlyChurnPercent(m.unitEconomics.monthlyChurnPercent);
    setMonthlyFixedCosts(m.breakeven.monthlyFixedCosts);
    setTamUnits(m.tam.totalUnits);
    setSamPercent(m.sam.segmentPercentage);
    setSomPercent(m.som.targetSharePercentage);
  };

  const loadFinancialModel = async () => {
    setIsLoading(true);
    try {
      const res = await generateFinancialsApi(idea);
      syncStatesFromModel(res.financialModel);
      const updatedIdea: Idea = {
        ...idea,
        financialModel: res.financialModel,
      };
      onUpdateIdea(updatedIdea);
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Financial Model Generation Failed",
        message: err.message || "Failed to generate financial analysis.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reactive Real-Time Mathematical Calculations
  const calculatedMetrics = useMemo(() => {
    const annualPrice = monthlyPrice * 12;
    const tamTotalUsd = tamUnits * annualPrice;
    const samUnits = Math.round(tamUnits * (samPercent / 100));
    const samTotalUsd = samUnits * annualPrice;
    const somUnits = Math.round(samUnits * (somPercent / 100));
    const somTotalUsd = somUnits * annualPrice;

    // Unit Economics
    const safeChurn = Math.max(0.5, monthlyChurnPercent);
    const lifetimeMonths = Math.round(100 / safeChurn);
    const marginRatio = grossMarginPercent / 100;
    const monthlyGrossMarginPerUser = monthlyPrice * marginRatio;
    const estimatedLtv = Math.round(monthlyGrossMarginPerUser * lifetimeMonths);
    const safeCac = Math.max(1, estimatedCac);
    const ltvCacRatio = Number((estimatedLtv / safeCac).toFixed(1));
    const cacPaybackMonths = Number(
      (safeCac / Math.max(1, monthlyGrossMarginPerUser)).toFixed(1)
    );

    // Breakeven
    const customersNeeded = Math.ceil(
      monthlyFixedCosts / Math.max(1, monthlyGrossMarginPerUser)
    );
    const mrrNeeded = customersNeeded * monthlyPrice;
    const arrNeeded = mrrNeeded * 12;

    // Viability Score
    let score = 50;
    if (ltvCacRatio >= 5) score += 20;
    else if (ltvCacRatio >= 3) score += 10;
    else if (ltvCacRatio < 1.5) score -= 20;

    if (cacPaybackMonths <= 3) score += 15;
    else if (cacPaybackMonths <= 6) score += 10;
    else if (cacPaybackMonths > 12) score -= 15;

    if (grossMarginPercent >= 80) score += 15;
    else if (grossMarginPercent >= 60) score += 5;

    const clampedScore = Math.min(98, Math.max(25, score));

    return {
      annualPrice,
      tamTotalUsd,
      samUnits,
      samTotalUsd,
      somUnits,
      somTotalUsd,
      lifetimeMonths,
      estimatedLtv,
      ltvCacRatio,
      cacPaybackMonths,
      customersNeeded,
      mrrNeeded,
      arrNeeded,
      viabilityScore: clampedScore,
    };
  }, [
    monthlyPrice,
    grossMarginPercent,
    estimatedCac,
    monthlyChurnPercent,
    monthlyFixedCosts,
    tamUnits,
    samPercent,
    somPercent,
  ]);

  const handleSaveToIdea = () => {
    if (!model) return;

    const updatedModel: FinancialModel = {
      ...model,
      tam: {
        ...model.tam,
        totalUnits: tamUnits,
        annualPricePerUnit: calculatedMetrics.annualPrice,
        totalValueUsd: calculatedMetrics.tamTotalUsd,
      },
      sam: {
        ...model.sam,
        segmentPercentage: samPercent,
        totalUnits: calculatedMetrics.samUnits,
        totalValueUsd: calculatedMetrics.samTotalUsd,
      },
      som: {
        ...model.som,
        targetSharePercentage: somPercent,
        totalUnits: calculatedMetrics.somUnits,
        totalValueUsd: calculatedMetrics.somTotalUsd,
      },
      unitEconomics: {
        ...model.unitEconomics,
        monthlyPrice,
        grossMarginPercent,
        estimatedCac,
        monthlyChurnPercent,
        lifetimeMonths: calculatedMetrics.lifetimeMonths,
        estimatedLtv: calculatedMetrics.estimatedLtv,
        ltvCacRatio: calculatedMetrics.ltvCacRatio,
        cacPaybackMonths: calculatedMetrics.cacPaybackMonths,
      },
      breakeven: {
        ...model.breakeven,
        monthlyFixedCosts,
        customersNeeded: calculatedMetrics.customersNeeded,
        mrrNeeded: calculatedMetrics.mrrNeeded,
      },
      ventureVerdict: {
        ...model.ventureVerdict,
        viabilityScore: calculatedMetrics.viabilityScore,
      },
    };

    const updatedIdea: Idea = {
      ...idea,
      financialModel: updatedModel,
    };

    onUpdateIdea(updatedIdea);
    addToast({
      type: "success",
      title: "Financial Model Saved",
      message: "Your customized unit economics and TAM targets are recorded.",
    });
  };

  const formatCurrency = (val: number) => {
    if (val >= 1_000_000_000) {
      return `$${(val / 1_000_000_000).toFixed(2)}B`;
    }
    if (val >= 1_000_000) {
      return `$${(val / 1_000_000).toFixed(1)}M`;
    }
    if (val >= 1_000) {
      return `$${(val / 1_000).toFixed(0)}k`;
    }
    return `$${val.toLocaleString()}`;
  };

  return (
    <div id="financial-unit-economics-section" className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono-code font-bold uppercase tracking-wider bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5" />
                FINANCIAL MODEL & UNIT ECONOMICS
              </span>
              <span className="text-xs font-mono-code text-[#71717A]">
                TAM / SAM / SOM + Breakeven Sandbox
              </span>
            </div>
            <h2 className="text-2xl font-bold font-sans text-[#EDEDED] tracking-tight">
              Unit Economics & Market Sizing Sandbox
            </h2>
            <p className="text-sm font-sans text-[#A1A1AA] mt-1 max-w-3xl">
              Model your pricing tiers, acquisition costs, customer lifetime
              value, and breakeven horizons with real-time reactive calculations
              for <span className="text-[#F59E0B] font-semibold">{idea.name}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="recalculate-ai-financials-btn"
              onClick={loadFinancialModel}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#18181B] hover:bg-[#27272A] text-[#EDEDED] border border-[#3F3F46] rounded-xl text-xs font-mono-code transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isLoading ? "animate-spin text-[#10B981]" : ""
                }`}
              />
              Auto-Calibrate with AI
            </button>
            <button
              id="save-financial-model-btn"
              onClick={handleSaveToIdea}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0B] font-bold rounded-xl text-xs font-mono-code transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.25)]"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Save Model
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-12 text-center">
          <RefreshCw className="w-8 h-8 text-[#10B981] animate-spin mx-auto mb-4" />
          <h3 className="text-base font-bold font-sans text-[#EDEDED]">
            Calculating Market Size & Unit Economics...
          </h3>
          <p className="text-xs font-mono-code text-[#71717A] mt-1">
            Synthesizing ACV benchmarks, CAC payback horizons, and gross margin
            cost structures
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Executive KPI Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#121215] border border-[#27272A] rounded-xl p-4">
              <span className="text-[10px] font-mono-code uppercase text-[#71717A] block">
                LTV : CAC Ratio
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-2xl font-bold font-mono-code ${
                    calculatedMetrics.ltvCacRatio >= 3
                      ? "text-[#10B981]"
                      : calculatedMetrics.ltvCacRatio >= 1.5
                      ? "text-[#F59E0B]"
                      : "text-[#EF4444]"
                  }`}
                >
                  {calculatedMetrics.ltvCacRatio}x
                </span>
                <span className="text-[11px] font-mono-code text-[#A1A1AA]">
                  {calculatedMetrics.ltvCacRatio >= 3
                    ? "Healthy (Target >3x)"
                    : "Low Margin Buffer"}
                </span>
              </div>
            </div>

            <div className="bg-[#121215] border border-[#27272A] rounded-xl p-4">
              <span className="text-[10px] font-mono-code uppercase text-[#71717A] block">
                CAC Payback Period
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono-code text-[#EDEDED]">
                  {calculatedMetrics.cacPaybackMonths} mo
                </span>
                <span className="text-[11px] font-mono-code text-[#A1A1AA]">
                  {calculatedMetrics.cacPaybackMonths <= 6
                    ? "Fast Reinvestment"
                    : "Moderate Cash Lag"}
                </span>
              </div>
            </div>

            <div className="bg-[#121215] border border-[#27272A] rounded-xl p-4">
              <span className="text-[10px] font-mono-code uppercase text-[#71717A] block">
                Breakeven MRR
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono-code text-[#F59E0B]">
                  ${calculatedMetrics.mrrNeeded.toLocaleString()}
                </span>
                <span className="text-[11px] font-mono-code text-[#A1A1AA]">
                  ({calculatedMetrics.customersNeeded} clients)
                </span>
              </div>
            </div>

            <div className="bg-[#121215] border border-[#27272A] rounded-xl p-4">
              <span className="text-[10px] font-mono-code uppercase text-[#71717A] block">
                Year 1-2 SOM Potential
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono-code text-[#3B82F6]">
                  {formatCurrency(calculatedMetrics.somTotalUsd)}
                </span>
                <span className="text-[11px] font-mono-code text-[#A1A1AA]">
                  ({calculatedMetrics.somUnits.toLocaleString()} users)
                </span>
              </div>
            </div>
          </div>

          {/* Market Sizing: TAM / SAM / SOM Visual Hierarchy */}
          <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-[#3B82F6]" />
                <h3 className="text-base font-bold font-sans text-[#EDEDED]">
                  TAM / SAM / SOM Market Sizing Architecture
                </h3>
              </div>
              <span className="text-xs font-mono-code text-[#71717A]">
                Bottom-Up Addressable Sizing Model
              </span>
            </div>

            {/* Visual Nesting Graphic */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* TAM Card */}
              <div className="bg-[#0A0A0B] border border-[#3F3F46] rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-code uppercase font-bold bg-[#3F3F46]/40 text-[#EDEDED]">
                      TAM (Total Demand)
                    </span>
                    <span className="text-xs font-mono-code text-[#71717A]">
                      100% Macro
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold font-mono-code text-[#EDEDED]">
                    {formatCurrency(calculatedMetrics.tamTotalUsd)}
                  </h4>
                  <p className="text-xs font-sans text-[#A1A1AA]">
                    {tamUnits.toLocaleString()}{" "}
                    {model?.tam.unitLabel || "target accounts"} × $
                    {calculatedMetrics.annualPrice.toLocaleString()}/yr ACV
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#27272A] text-[11px] font-sans text-[#71717A] italic">
                  {model?.tam.rationale ||
                    "Total market size if 100% of global potential buyers converted."}
                </div>
              </div>

              {/* SAM Card */}
              <div className="bg-[#0F172A] border border-[#3B82F6]/50 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-code uppercase font-bold bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30">
                      SAM (Serviceable)
                    </span>
                    <span className="text-xs font-mono-code text-[#3B82F6]">
                      {samPercent}% of TAM
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold font-mono-code text-[#3B82F6]">
                    {formatCurrency(calculatedMetrics.samTotalUsd)}
                  </h4>
                  <p className="text-xs font-sans text-[#93C5FD]">
                    {calculatedMetrics.samUnits.toLocaleString()} reachable
                    accounts in core geos & verticals
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1E293B] text-[11px] font-sans text-[#93C5FD]/70 italic">
                  {model?.sam.rationale ||
                    "Directly reachable market segment based on language and tech stack fit."}
                </div>
              </div>

              {/* SOM Card */}
              <div className="bg-[#064E3B]/20 border border-[#10B981]/50 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-code uppercase font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                      SOM (Year 1-2 Obtainable)
                    </span>
                    <span className="text-xs font-mono-code text-[#10B981]">
                      {somPercent}% of SAM
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold font-mono-code text-[#10B981]">
                    {formatCurrency(calculatedMetrics.somTotalUsd)}
                  </h4>
                  <p className="text-xs font-sans text-[#6EE7B7]">
                    {calculatedMetrics.somUnits.toLocaleString()} targeted
                    paying customers captured
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#064E3B]/60 text-[11px] font-sans text-[#6EE7B7]/70 italic">
                  {model?.som.rationale ||
                    "Realistic target conversion capture based on go-to-market execution bandwidth."}
                </div>
              </div>
            </div>

            {/* Interactive Sliders for TAM/SAM/SOM */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-mono-code">
              <div className="space-y-2">
                <div className="flex justify-between text-[#EDEDED]">
                  <span>Total Addressable Accounts:</span>
                  <span className="text-[#F59E0B]">
                    {tamUnits.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={2000000}
                  step={10000}
                  value={tamUnits}
                  onChange={(e) => setTamUnits(Number(e.target.value))}
                  className="w-full accent-[#F59E0B] cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[#EDEDED]">
                  <span>SAM Reachable Share:</span>
                  <span className="text-[#3B82F6]">{samPercent}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={70}
                  step={1}
                  value={samPercent}
                  onChange={(e) => setSamPercent(Number(e.target.value))}
                  className="w-full accent-[#3B82F6] cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[#EDEDED]">
                  <span>SOM Target Share (Yr 1-2):</span>
                  <span className="text-[#10B981]">{somPercent}%</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={10}
                  step={0.1}
                  value={somPercent}
                  onChange={(e) => setSomPercent(Number(e.target.value))}
                  className="w-full accent-[#10B981] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Interactive Unit Economics & Breakeven Sandbox (2-Column Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Interactive Levers & Sliders (Col 6) */}
            <div className="lg:col-span-6 bg-[#121215] border border-[#27272A] rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="text-sm font-bold font-sans text-[#EDEDED]">
                    Unit Economics Simulation Levers
                  </h3>
                </div>
                <span className="text-[10px] font-mono-code uppercase text-[#71717A]">
                  Real-time Recalculation
                </span>
              </div>

              <div className="space-y-4 text-xs font-mono-code">
                {/* Monthly Pricing Lever */}
                <div className="space-y-1.5 bg-[#18181B] p-3.5 rounded-xl border border-[#27272A]">
                  <div className="flex justify-between items-center text-[#EDEDED]">
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#10B981]" />
                      Monthly Subscription Price (ARPU):
                    </span>
                    <span className="text-sm font-bold text-[#10B981]">
                      ${monthlyPrice} / mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min={19}
                    max={999}
                    step={10}
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    className="w-full accent-[#10B981] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#71717A]">
                    <span>$19/mo (Micro-SaaS)</span>
                    <span>$999/mo (Enterprise Tier)</span>
                  </div>
                </div>

                {/* Blended CAC Lever */}
                <div className="space-y-1.5 bg-[#18181B] p-3.5 rounded-xl border border-[#27272A]">
                  <div className="flex justify-between items-center text-[#EDEDED]">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />
                      Customer Acquisition Cost (CAC):
                    </span>
                    <span className="text-sm font-bold text-[#F59E0B]">
                      ${estimatedCac}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={1200}
                    step={10}
                    value={estimatedCac}
                    onChange={(e) => setEstimatedCac(Number(e.target.value))}
                    className="w-full accent-[#F59E0B] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#71717A]">
                    <span>$20 (Organic/Viral)</span>
                    <span>$1,200 (Outbound Sales)</span>
                  </div>
                </div>

                {/* Gross Margin % */}
                <div className="space-y-1.5 bg-[#18181B] p-3.5 rounded-xl border border-[#27272A]">
                  <div className="flex justify-between items-center text-[#EDEDED]">
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-[#3B82F6]" />
                      Gross Margin:
                    </span>
                    <span className="text-sm font-bold text-[#3B82F6]">
                      {grossMarginPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={95}
                    step={1}
                    value={grossMarginPercent}
                    onChange={(e) =>
                      setGrossMarginPercent(Number(e.target.value))
                    }
                    className="w-full accent-[#3B82F6] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#71717A]">
                    <span>40% (High Human Ops)</span>
                    <span>95% (Pure Software/API)</span>
                  </div>
                </div>

                {/* Churn Rate % */}
                <div className="space-y-1.5 bg-[#18181B] p-3.5 rounded-xl border border-[#27272A]">
                  <div className="flex justify-between items-center text-[#EDEDED]">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
                      Monthly Customer Churn:
                    </span>
                    <span className="text-sm font-bold text-[#EF4444]">
                      {monthlyChurnPercent}% / mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={12}
                    step={0.5}
                    value={monthlyChurnPercent}
                    onChange={(e) =>
                      setMonthlyChurnPercent(Number(e.target.value))
                    }
                    className="w-full accent-[#EF4444] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#71717A]">
                    <span>1% (Enterprise Retention)</span>
                    <span>12% (High SMB Attrition)</span>
                  </div>
                </div>

                {/* Fixed Monthly Burn */}
                <div className="space-y-1.5 bg-[#18181B] p-3.5 rounded-xl border border-[#27272A]">
                  <div className="flex justify-between items-center text-[#EDEDED]">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#A1A1AA]" />
                      Monthly Fixed Operational Overhead:
                    </span>
                    <span className="text-sm font-bold text-[#EDEDED]">
                      ${monthlyFixedCosts.toLocaleString()} / mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={15000}
                    step={250}
                    value={monthlyFixedCosts}
                    onChange={(e) =>
                      setMonthlyFixedCosts(Number(e.target.value))
                    }
                    className="w-full accent-[#EDEDED] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Breakeven & Unit Economics Report (Col 6) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Unit Economics Output Card */}
              <div className="bg-[#121215] border border-[#27272A] rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#10B981]" />
                    <h3 className="text-sm font-bold font-sans text-[#EDEDED]">
                      Unit Economics Output Analysis
                    </h3>
                  </div>
                  <span className="text-xs font-mono-code text-[#10B981]">
                    Score: {calculatedMetrics.viabilityScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono-code">
                  <div className="bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
                    <span className="text-[10px] uppercase text-[#71717A] block">
                      Customer Lifetime:
                    </span>
                    <span className="text-base font-bold text-[#EDEDED]">
                      {calculatedMetrics.lifetimeMonths} Months
                    </span>
                  </div>

                  <div className="bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
                    <span className="text-[10px] uppercase text-[#71717A] block">
                      Lifetime Value (LTV):
                    </span>
                    <span className="text-base font-bold text-[#10B981]">
                      ${calculatedMetrics.estimatedLtv.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
                    <span className="text-[10px] uppercase text-[#71717A] block">
                      LTV to CAC Multiple:
                    </span>
                    <span className="text-base font-bold text-[#F59E0B]">
                      {calculatedMetrics.ltvCacRatio}x
                    </span>
                  </div>

                  <div className="bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
                    <span className="text-[10px] uppercase text-[#71717A] block">
                      Cost to Deliver Service:
                    </span>
                    <span className="text-base font-bold text-[#A1A1AA]">
                      $
                      {Math.round(
                        monthlyPrice * (1 - grossMarginPercent / 100)
                      )}{" "}
                      /mo
                    </span>
                  </div>
                </div>

                {/* Breakeven Threshold Visualizer */}
                <div className="bg-[#0A0A0B] border border-[#27272A] p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono-code">
                    <span className="text-[#A1A1AA] uppercase">
                      Cash-Flow Breakeven Goal:
                    </span>
                    <span className="font-bold text-[#F59E0B]">
                      {calculatedMetrics.customersNeeded} Active Subscriptions
                    </span>
                  </div>

                  {/* Progress / Runway Gauge */}
                  <div className="w-full bg-[#18181B] h-3 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#EF4444] h-full"
                      style={{ width: "35%" }}
                      title="Fixed Monthly Overhead Burn"
                    />
                    <div
                      className="bg-[#F59E0B] h-full"
                      style={{ width: "25%" }}
                      title="CAC Amortization"
                    />
                    <div
                      className="bg-[#10B981] h-full flex-1"
                      title="Net Operating Cash Margin"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono-code text-[#71717A]">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                      Overhead (${monthlyFixedCosts}/mo)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                      Acquisition Lag
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                      Profit Horizon
                    </span>
                  </div>
                </div>

                {/* 24-Month Milestone Roadmap */}
                <div className="space-y-2 pt-2 border-t border-[#27272A]">
                  <span className="text-[10px] font-mono-code uppercase text-[#71717A] block">
                    24-Month Revenue Trajectory
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono-code">
                    <div className="bg-[#18181B] p-2.5 rounded-lg border border-[#27272A]">
                      <div className="text-[10px] text-[#71717A]">Month 6</div>
                      <div className="font-bold text-[#EDEDED] mt-0.5">
                        ${(
                          Math.round(calculatedMetrics.customersNeeded * 0.6) *
                          monthlyPrice
                        ).toLocaleString()}
                        /mo
                      </div>
                      <div className="text-[10px] text-[#A1A1AA]">
                        {Math.round(calculatedMetrics.customersNeeded * 0.6)}{" "}
                        users
                      </div>
                    </div>

                    <div className="bg-[#18181B] p-2.5 rounded-lg border border-[#27272A]">
                      <div className="text-[10px] text-[#10B981]">Month 12</div>
                      <div className="font-bold text-[#10B981] mt-0.5">
                        ${(
                          Math.round(calculatedMetrics.customersNeeded * 1.8) *
                          monthlyPrice
                        ).toLocaleString()}
                        /mo
                      </div>
                      <div className="text-[10px] text-[#A1A1AA]">
                        {Math.round(calculatedMetrics.customersNeeded * 1.8)}{" "}
                        users
                      </div>
                    </div>

                    <div className="bg-[#18181B] p-2.5 rounded-lg border border-[#27272A]">
                      <div className="text-[10px] text-[#3B82F6]">Month 24</div>
                      <div className="font-bold text-[#3B82F6] mt-0.5">
                        ${(
                          Math.round(calculatedMetrics.customersNeeded * 5.5) *
                          monthlyPrice
                        ).toLocaleString()}
                        /mo
                      </div>
                      <div className="text-[10px] text-[#A1A1AA]">
                        {Math.round(calculatedMetrics.customersNeeded * 5.5)}{" "}
                        users
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Pricing & Margin Verdict */}
              {model?.ventureVerdict && (
                <div className="bg-[#0F0F11] border border-[#27272A] rounded-xl p-4 space-y-2.5 text-xs font-sans">
                  <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold uppercase text-[#F59E0B]">
                    <Sparkles className="w-3.5 h-3.5" />
                    Venture Pricing Recommendation
                  </div>
                  <p className="text-[#EDEDED] leading-relaxed">
                    {model.ventureVerdict.pricingRecommendation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
