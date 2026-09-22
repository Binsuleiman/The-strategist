import React, { useState, useEffect } from "react";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface LoadingOverlayProps {
  title?: string;
  steps?: string[];
  isOpen: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  title = "ANALYZING OPPORTUNITY...",
  steps = [
    "Understanding customer pain & intent",
    "Evaluating market tailwinds & search signals",
    "Analyzing competitor weaknesses",
    "Assessing unit economics & monetization",
    "Synthesizing actionable strategy",
  ],
  isOpen,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen, steps.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0B]/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#131315] text-[#EDEDED] border border-[#F59E0B]/40 rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-grid-pattern-dark opacity-30 pointer-events-none" />

        {/* Top header */}
        <div className="relative z-10 flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#F59E0B] text-[#0A0A0B] rounded-xl font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <div className="text-[10px] font-mono-code font-bold uppercase tracking-widest text-[#F59E0B]">
              AI Strategic Engine
            </div>
            <h3 className="font-anton text-xl md:text-2xl text-[#EDEDED] uppercase tracking-wide">
              {title}
            </h3>
          </div>
        </div>

        {/* Dynamic step checklist */}
        <div className="relative z-10 space-y-3 mb-6">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 text-xs md:text-sm transition-all duration-300 ${
                  isCompleted
                    ? "text-[#EDEDED]/90"
                    : isCurrent
                    ? "text-[#F59E0B] font-bold translate-x-1"
                    : "text-[#71717A]"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0" />
                ) : isCurrent ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[#F59E0B] border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-[#27272A] shrink-0" />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-4 border-t border-[#27272A] flex items-center justify-between text-[11px] font-mono-code text-[#71717A]">
          <span>AI STRATEGY CORE</span>
          <span className="flex items-center gap-1 text-[#F59E0B]">
            <Sparkles className="w-3 h-3" />
            SYNTHESIZING
          </span>
        </div>

      </div>
    </div>
  );
};
