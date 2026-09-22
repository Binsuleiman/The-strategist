import React from "react";
import { ScoreBreakdown } from "../types";

interface ScoreBreakdownBarProps {
  breakdown: ScoreBreakdown;
  compact?: boolean;
}

export const ScoreBreakdownBar: React.FC<ScoreBreakdownBarProps> = ({
  breakdown,
  compact = false,
}) => {
  const metrics = [
    { key: "marketDemand", label: "Market Demand", value: breakdown.marketDemand, desc: "High search & industry spend velocity" },
    { key: "customerPain", label: "Customer Pain", value: breakdown.customerPain, desc: "Hair-on-fire operational friction" },
    { key: "monetization", label: "Monetization", value: breakdown.monetization, desc: "Fast time-to-first-dollar & margins" },
    { key: "competition", label: "Competition Gap", value: breakdown.competition, desc: "Fragmented or outdated incumbents" },
    { key: "differentiation", label: "Differentiation", value: breakdown.differentiation, desc: "Defensible wedge / proprietary advantage" },
    { key: "execution", label: "Execution Speed", value: breakdown.execution, desc: "Feasible in <2 weeks without heavy ops" },
    { key: "founderFit", label: "Founder Fit", value: breakdown.founderFit, desc: "Direct alignment with your background" },
  ];

  return (
    <div className={`space-y-${compact ? "2" : "3.5"} w-full`}>
      {metrics.map((m) => {
        const isHigh = m.value >= 80;
        return (
          <div key={m.key} className="group">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-[#EDEDED] flex items-center gap-1.5">
                {m.label}
                {!compact && (
                  <span className="hidden md:inline-block font-normal text-[10px] text-[#71717A]">
                    — {m.desc}
                  </span>
                )}
              </span>
              <span className="font-mono-code font-bold text-[#EDEDED]">
                {m.value}<span className="text-[#71717A] font-normal">/100</span>
              </span>
            </div>

            {/* Bar */}
            <div className="w-full h-2 bg-[#27272A] rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isHigh
                    ? "bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    : "bg-[#71717A] group-hover:bg-[#F59E0B]/80"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, m.value))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
