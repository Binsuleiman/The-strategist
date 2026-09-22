import React, { useState } from 'react';
import {
  Globe,
  Search,
  ExternalLink,
  ShieldAlert,
  Target,
  Sparkles,
  TrendingUp,
  RefreshCw,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  Building2,
  DollarSign,
  Copy,
  Check,
} from 'lucide-react';
import { Idea, Competitor, LiveMarketIntelligence } from '../types';

interface LiveCompetitorIntelligenceProps {
  idea: Idea;
  onUpdateIdea: (updated: Idea) => void;
  onRunSearch: (customQuery?: string) => Promise<void>;
  isLoading?: boolean;
}

export const LiveCompetitorIntelligence: React.FC<LiveCompetitorIntelligenceProps> = ({
  idea,
  onUpdateIdea,
  onRunSearch,
  isLoading = false,
}) => {
  const [activeView, setActiveView] = useState<'cards' | 'matrix'>('cards');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [copiedWedge, setCopiedWedge] = useState<number | null>(null);
  const [showPitchHelper, setShowPitchHelper] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  const competitors: Competitor[] = idea.competitors || [];
  const intel: LiveMarketIntelligence | undefined = idea.liveMarketIntelligence;

  const filteredCompetitors = competitors.filter((c) => {
    if (categoryFilter === 'all') return true;
    return c.marketCategory?.toLowerCase().includes(categoryFilter.toLowerCase());
  });

  const categories = [
    { id: 'all', label: `All Players (${competitors.length})` },
    { id: 'direct', label: 'Direct Competitors' },
    { id: 'incumbent', label: 'Legacy Incumbents' },
    { id: 'challenger', label: 'Emerging Challengers' },
    { id: 'adjacent', label: 'Adjacent Solutions' },
  ];

  const handleCustomSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchQuery.trim()) {
      onRunSearch();
    } else {
      onRunSearch(customSearchQuery.trim());
    }
  };

  const handleCopyWedge = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedWedge(idx);
    setTimeout(() => setCopiedWedge(null), 2000);
  };

  const generateCompetitivePitch = () => {
    const mainIncumbent = competitors[0]?.name || "legacy enterprise tools";
    return `While existing players like ${mainIncumbent} focus on bloated enterprise setups that take weeks to configure, ${idea.name} delivers ${idea.solution} directly to ${idea.targetCustomer} with zero onboarding friction and ${idea.businessModel}. We exploit their primary weakness—${competitors[0]?.weaknesses?.[0] || "slow complex workflows"}—to give founders 10x faster time-to-value.`;
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(generateCompetitivePitch());
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const threatBadgeColor = (threat?: string) => {
    switch (threat) {
      case 'LOW':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      case 'MEDIUM':
        return 'bg-amber-950/60 text-[#F59E0B] border-amber-800/60';
      case 'HIGH':
        return 'bg-rose-950/60 text-rose-300 border-rose-800/60';
      case 'EXTREME':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. LIVE SEARCH GROUNDING STATUS & ACTION BAR */}
      <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono-code font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                LIVE SEARCH GROUNDING VERIFIED
              </span>
              {intel?.verifiedAt && (
                <span className="text-[10px] font-mono-code text-[#71717A]">
                  • Verified: {new Date(intel.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <h3 className="font-anton text-2xl md:text-3xl text-[#EDEDED] uppercase tracking-tight">
              REAL MARKET SIGNAL & COMPETITIVE RADAR
            </h3>
            <p className="text-xs md:text-sm text-[#A1A1AA]">
              Real-time Google search-grounded market intelligence, incumbent vulnerabilities, and your asymmetric differentiation wedge.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="competitive-pitch-btn"
              onClick={() => setShowPitchHelper(!showPitchHelper)}
              className="px-4 py-2.5 bg-[#18181B] text-[#EDEDED] border border-[#27272A] hover:border-[#F59E0B]/60 font-anton text-xs tracking-wider uppercase rounded-xl active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              BATTLE-TESTED PITCH
            </button>
            <button
              id="live-reverify-btn"
              onClick={() => onRunSearch()}
              disabled={isLoading}
              className="px-4 py-2.5 bg-[#F59E0B] text-[#0A0A0B] font-anton text-xs tracking-wider uppercase rounded-xl hover:bg-[#FBBF24] active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'SEARCHING WEB...' : 'LIVE RE-SCAN'}
            </button>
          </div>
        </div>

        {/* Dynamic Pitch Helper Card (Collapsible) */}
        {showPitchHelper && (
          <div className="p-4 bg-[#18181B] border border-[#F59E0B]/40 rounded-xl space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-code font-bold uppercase text-[#F59E0B] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                "HOW ARE YOU DIFFERENT FROM THE COMPETITION?" (INVESTOR / BUYER ANSWER)
              </span>
              <button
                onClick={handleCopyPitch}
                className="flex items-center gap-1 text-[11px] font-mono-code text-[#A1A1AA] hover:text-[#EDEDED] cursor-pointer"
              >
                {copiedPitch ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Pitch</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs md:text-sm text-[#EDEDED] font-sans leading-relaxed italic bg-[#0F0F11] p-3 rounded-lg border border-[#27272A]">
              "{generateCompetitivePitch()}"
            </p>
          </div>
        )}

        {/* Live Search Bar for Deep Querying */}
        <form onSubmit={handleCustomSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="deep-market-search-input"
              value={customSearchQuery}
              onChange={(e) => setCustomSearchQuery(e.target.value)}
              placeholder="Deep Search Grounding (e.g. 'YC startups doing AI factoring' or 'Open source alternatives in Europe')..."
              className="w-full bg-[#0F0F11] border border-[#27272A] rounded-xl pl-10 pr-4 py-2.5 text-xs md:text-sm text-[#EDEDED] placeholder-[#71717A] focus:outline-none focus:border-[#F59E0B] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2.5 bg-[#18181B] text-[#EDEDED] border border-[#27272A] hover:border-[#EDEDED]/40 font-anton text-xs tracking-wider uppercase rounded-xl active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            SEARCH
          </button>
        </form>

        {/* Grounding Web Citations Sources Bar */}
        {intel?.searchGroundingSources && intel.searchGroundingSources.length > 0 && (
          <div className="pt-4 border-t border-[#27272A] space-y-2">
            <div className="text-[10px] font-mono-code uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              LIVE WEB SEARCH SOURCES & CITATIONS:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {intel.searchGroundingSources.map((source, sIdx) => (
                <a
                  key={sIdx}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  referrerPolicy="no-referrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0F0F11] hover:bg-[#18181B] border border-[#27272A] hover:border-[#A1A1AA] text-[#EDEDED] rounded-lg text-xs font-mono-code transition-all group cursor-pointer"
                >
                  <span className="truncate max-w-[220px]">{source.title}</span>
                  <ExternalLink className="w-3 h-3 text-[#71717A] group-hover:text-[#F59E0B]" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. MARKET INTELLIGENCE PULSE: MATURITY, THREAT & WHITESPACE */}
      {intel && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Market Maturity & Threat */}
          <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono-code font-bold uppercase text-[#71717A]">
                MARKET MATURITY
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-mono-code font-bold uppercase rounded border ${threatBadgeColor(intel.threatLevel)}`}>
                THREAT: {intel.threatLevel}
              </span>
            </div>
            <div className="font-anton text-2xl text-[#EDEDED] uppercase">
              {intel.overallMarketMaturity}
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Assessed from live search indexing of category incumbents, indie challengers, and funding density.
            </p>
          </div>

          {/* Whitespace Opportunity Void */}
          <div className="bg-[#131315] border border-[#27272A] rounded-2xl p-5 shadow-sm space-y-2 md:col-span-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-[10px] font-mono-code font-bold uppercase text-[#F59E0B] tracking-wider">
                PRIMARY UNTAPPED WHITESPACE VOID
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#EDEDED] font-sans leading-relaxed">
              {intel.whitespaceOpportunity}
            </p>
            {intel.recentTrends && intel.recentTrends.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono-code uppercase text-[#71717A] mr-1">Trending:</span>
                {intel.recentTrends.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-[#0F0F11] border border-[#27272A] text-[10px] font-mono-code text-[#A1A1AA] rounded"
                  >
                    • {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. FILTER AND VIEW CONTROLS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 text-xs font-mono-code uppercase rounded-xl transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#EDEDED] text-[#0A0A0B] font-bold shadow-sm'
                  : 'bg-[#131315] text-[#A1A1AA] hover:text-[#EDEDED] border border-[#27272A]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-[#131315] border border-[#27272A] rounded-xl p-1 shrink-0">
          <button
            id="view-cards-btn"
            onClick={() => setActiveView('cards')}
            className={`px-3 py-1 text-xs font-mono-code uppercase rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'cards'
                ? 'bg-[#18181B] text-[#EDEDED] font-bold border border-[#27272A]'
                : 'text-[#71717A] hover:text-[#EDEDED]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            id="view-matrix-btn"
            onClick={() => setActiveView('matrix')}
            className={`px-3 py-1 text-xs font-mono-code uppercase rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'matrix'
                ? 'bg-[#18181B] text-[#EDEDED] font-bold border border-[#27272A]'
                : 'text-[#71717A] hover:text-[#EDEDED]'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Matrix</span>
          </button>
        </div>
      </div>

      {/* 4. CONTENT VIEW (CARDS OR MATRIX) */}
      {activeView === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCompetitors.map((comp, idx) => (
            <div
              key={idx}
              className="bg-[#131315] border border-[#27272A] hover:border-[#3F3F46] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono-code font-bold uppercase text-[#71717A]">
                        PLAYER 0{idx + 1}
                      </span>
                      {comp.marketCategory && (
                        <span className="px-2 py-0.5 bg-[#18181B] text-[10px] font-mono-code uppercase text-[#EDEDED] rounded border border-[#27272A]">
                          {comp.marketCategory}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <h4 className="font-anton text-2xl text-[#EDEDED] uppercase">
                        {comp.name}
                      </h4>
                      {comp.websiteUrl && (
                        <a
                          href={comp.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          referrerPolicy="no-referrer"
                          className="text-[#71717A] hover:text-[#F59E0B] transition-colors p-1"
                          title="Visit live website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">{comp.whatTheyDo}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-1 bg-[#0F0F11] text-[11px] font-mono-code font-bold border border-[#27272A] text-[#EDEDED] rounded block">
                      {comp.pricing}
                    </span>
                    {comp.fundingOrScale && (
                      <span className="text-[9px] font-mono-code text-[#71717A] mt-1 block">
                        {comp.fundingOrScale}
                      </span>
                    )}
                  </div>
                </div>

                {/* Verified Live Signal */}
                {comp.verifiedLiveSignal && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono-code text-[#A1A1AA] bg-[#0F0F11] px-3 py-1.5 rounded-lg border border-[#27272A]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Live Signal: </span>
                    <strong className="text-[#EDEDED] truncate">{comp.verifiedLiveSignal}</strong>
                  </div>
                )}

                {/* Target Audience */}
                <div className="p-3 bg-[#0F0F11] rounded-xl border border-[#27272A] text-xs">
                  <span className="font-bold text-[#EDEDED]">Target Audience: </span>
                  <span className="text-[#A1A1AA]">{comp.targetAudience}</span>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#0F0F11] rounded-xl border border-[#27272A]/70">
                    <div className="font-mono-code font-bold uppercase text-emerald-400 mb-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> STRENGTHS
                    </div>
                    <ul className="space-y-1 list-disc list-inside text-[#A1A1AA] text-[11px]">
                      {comp.strengths?.map((s, sIdx) => (
                        <li key={sIdx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-[#0F0F11] rounded-xl border border-rose-950/40">
                    <div className="font-mono-code font-bold uppercase text-rose-400 mb-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> VULNERABILITIES
                    </div>
                    <ul className="space-y-1 list-disc list-inside text-rose-300 text-[11px]">
                      {comp.weaknesses?.map((w, wIdx) => (
                        <li key={wIdx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Differentiation Wedge */}
              <div className="p-3.5 bg-[#18181B] border border-[#F59E0B]/30 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono-code font-bold uppercase text-[#F59E0B] text-[11px] flex items-center gap-1">
                    <Zap className="w-3 h-3" /> YOUR ASYMMETRIC WEDGE
                  </span>
                  <button
                    onClick={() => handleCopyWedge(comp.differentiationAngle, idx)}
                    className="text-[10px] font-mono-code text-[#71717A] hover:text-[#EDEDED] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedWedge === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="font-sans text-[#EDEDED] leading-relaxed text-[12px]">
                  {comp.differentiationAngle}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* SIDE-BY-SIDE MATRIX VIEW */
        <div className="bg-[#131315] border border-[#27272A] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#18181B] border-b border-[#27272A]">
                  <th className="p-4 font-mono-code font-bold uppercase text-[#A1A1AA] w-48">
                    Competitor Name
                  </th>
                  <th className="p-4 font-mono-code font-bold uppercase text-[#A1A1AA] w-36">
                    Category
                  </th>
                  <th className="p-4 font-mono-code font-bold uppercase text-[#A1A1AA] w-32">
                    Pricing
                  </th>
                  <th className="p-4 font-mono-code font-bold uppercase text-[#A1A1AA] w-56">
                    Key Strength
                  </th>
                  <th className="p-4 font-mono-code font-bold uppercase text-rose-400 w-56">
                    Critical Vulnerability
                  </th>
                  <th className="p-4 font-mono-code font-bold uppercase text-[#F59E0B] w-64">
                    Your Winning Angle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]">
                {/* User's Idea Row */}
                <tr className="bg-[#18181B]/40 font-medium">
                  <td className="p-4">
                    <div className="font-anton text-base text-[#F59E0B] uppercase">
                      {idea.name} (YOU)
                    </div>
                    <span className="text-[10px] font-mono-code text-[#A1A1AA]">Proposed Solution</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-[#F59E0B]/20 text-[#F59E0B] font-mono-code text-[10px] uppercase rounded border border-[#F59E0B]/40">
                      New Category Wedge
                    </span>
                  </td>
                  <td className="p-4 font-mono-code text-[#EDEDED]">{idea.businessModel}</td>
                  <td className="p-4 text-emerald-400">10x faster time-to-value, zero complex onboarding</td>
                  <td className="p-4 text-[#71717A]">Initial cold-start awareness</td>
                  <td className="p-4 text-[#EDEDED] font-bold">Unfair focus on underserved beachhead niche</td>
                </tr>

                {/* Competitors Rows */}
                {filteredCompetitors.map((c, idx) => (
                  <tr key={idx} className="hover:bg-[#18181B]/20 transition-colors">
                    <td className="p-4">
                      <div className="font-anton text-sm text-[#EDEDED] uppercase">
                        {c.name}
                      </div>
                      {c.websiteUrl && (
                        <a
                          href={c.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          referrerPolicy="no-referrer"
                          className="text-[10px] font-mono-code text-[#71717A] hover:text-[#F59E0B] flex items-center gap-1 mt-0.5"
                        >
                          <span>{c.websiteUrl.replace(/^https?:\/\//, '').split('/')[0]}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </td>
                    <td className="p-4 font-mono-code text-[11px] text-[#A1A1AA]">
                      {c.marketCategory || 'Direct'}
                    </td>
                    <td className="p-4 font-mono-code text-[11px] text-[#EDEDED]">
                      {c.pricing}
                    </td>
                    <td className="p-4 text-[#A1A1AA]">
                      {c.strengths?.[0] || 'Broad market coverage'}
                    </td>
                    <td className="p-4 text-rose-300">
                      {c.weaknesses?.[0] || 'Slow complex setup'}
                    </td>
                    <td className="p-4 text-[#EDEDED] text-[11px]">
                      {c.differentiationAngle}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
