import React from "react";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  showBreakdownLabel?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = "md",
  label = "Opportunity",
  showBreakdownLabel = true,
}) => {
  const normalized = Math.min(100, Math.max(0, Math.round(score)));

  // Determine color and verdict
  let verdict = "MODERATE";
  let bgTint = "bg-[#18181B] border-[#27272A] text-[#EDEDED]";

  if (normalized >= 85) {
    verdict = "HIGH FIT";
    bgTint = "bg-[#F59E0B]/20 border-[#F59E0B]/50 text-[#F59E0B]";
  } else if (normalized >= 70) {
    verdict = "PROMISING";
    bgTint = "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#FBBF24]";
  } else {
    verdict = "CHALLENGING";
    bgTint = "bg-rose-950/60 border-rose-800/60 text-rose-300";
  }

  const sizes = {
    sm: { width: 64, stroke: 6, fontSize: "text-base", subSize: "text-[9px]" },
    md: { width: 88, stroke: 8, fontSize: "text-2xl", subSize: "text-[10px]" },
    lg: { width: 120, stroke: 10, fontSize: "text-3xl", subSize: "text-xs" },
    xl: { width: 160, stroke: 12, fontSize: "text-5xl", subSize: "text-sm" },
  };

  const { width, stroke, fontSize, subSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width, height: width }}>
        <svg className="transform -rotate-90" width={width} height={width}>
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke="#27272A"
            strokeWidth={stroke}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke="#F59E0B"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`font-anton font-bold ${fontSize} text-[#EDEDED] leading-none`}>
            {normalized}
          </span>
          <span className={`font-mono-code font-bold uppercase ${subSize} text-[#71717A] leading-tight mt-0.5`}>
            /100
          </span>
        </div>
      </div>

      {showBreakdownLabel && (
        <div className="mt-2 flex flex-col items-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A1A1AA]">
            {label}
          </span>
          <span className={`mt-0.5 px-2 py-0.5 text-[10px] font-mono-code font-bold uppercase tracking-wider rounded border ${bgTint}`}>
            {verdict}
          </span>
        </div>
      )}
    </div>
  );
};
