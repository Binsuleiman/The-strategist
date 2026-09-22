import React, { useState } from "react";
import {
  Rocket,
  Mail,
  Layout,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  Download,
  Share2,
  ExternalLink,
  HelpCircle,
  Megaphone,
  Layers,
  ArrowRight,
  RefreshCw,
  Eye,
  Send,
  Zap,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { Idea, LaunchKit } from "../types";
import { generateLaunchKitApi } from "../services/api";
import { useApp } from "../context/AppContext";

interface LaunchKitGeneratorProps {
  idea: Idea;
  onUpdateIdea: (updated: Idea) => void;
}

type KitSubTab = "landing-page" | "cold-emails" | "social-dms" | "ad-hooks";

export const LaunchKitGenerator: React.FC<LaunchKitGeneratorProps> = ({
  idea,
  onUpdateIdea,
}) => {
  const { addToast } = useApp();
  const [kit, setKit] = useState<LaunchKit | null>(idea.launchKit || null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<KitSubTab>("landing-page");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Customization variables for cold emails
  const [customFirstName, setCustomFirstName] = useState("Alex");
  const [customCompany, setCustomCompany] = useState("Acme Digital");

  const handleCopy = (text: string, key: string, label: string = "Content") => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast(`${label} copied to clipboard!`, "success");
    setTimeout(() => {
      setCopiedKey((prev) => (prev === key ? null : prev));
    }, 2000);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await generateLaunchKitApi(idea);
      setKit(res.launchKit);
      const updatedIdea: Idea = {
        ...idea,
        launchKit: res.launchKit,
      };
      onUpdateIdea(updatedIdea);
      addToast(
        res.isFallback
          ? "Launch kit generated using strategic baseline templates!"
          : "AI Launch Kit generated successfully!",
        "success"
      );
    } catch (err: any) {
      console.error(err);
      addToast("Failed to generate launch kit. Please retry.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!kit) return;
    const md = `# Launch Kit for ${idea.name}
**Tagline:** ${idea.tagline}
**Target Audience:** ${idea.targetCustomer}

---

## 1. Landing Page Copy

### Hero Section
- **Headline:** ${kit.heroSection.headline}
- **Subheadline:** ${kit.heroSection.subheadline}
- **Primary CTA:** ${kit.heroSection.primaryCtaText}
- **Secondary CTA:** ${kit.heroSection.secondaryCtaText}
- **Social Proof:** ${kit.heroSection.socialProofBadge}

### Value Pillars
${kit.valuePillars
  .map(
    (p, i) =>
      `### ${i + 1}. ${p.title} (${p.highlightMetric})\n${p.description}\n`
  )
  .join("\n")}

### Key Feature Breakdown
${kit.featureCards
  .map((f, i) => `**${f.title}** - *${f.benefit}*\n${f.detail}\n`)
  .join("\n")}

### Frequently Asked Questions
${kit.objectionFaqs
  .map((faq) => `**Q: ${faq.question}**\nA: ${faq.answer}\n`)
  .join("\n")}

---

## 2. 3-Step Cold Email Outbound Sequence

${kit.coldEmailSequence
  .map(
    (e) => `### Step ${e.step}: ${e.name} (${e.timing})
**Subject:** ${e.subjectLine}
**Preview:** ${e.previewText}

${e.bodyText}

**Call to Action:** ${e.callToAction}
`
  )
  .join("\n---\n\n")}

---

## 3. Social & Direct Outreach DMs

${kit.socialOutreachDms
  .map(
    (dm) => `### ${dm.platform} (${dm.targetRecipient})
${dm.messageText}
`
  )
  .join("\n\n")}

---

## 4. Paid Ad Copy & Search Hooks

${kit.adHooks
  .map(
    (ad) => `### ${ad.platform}
**Headline:** ${ad.headline}
**Primary Copy:** ${ad.primaryText}
**Targeting:** ${ad.targetAudience}
`
  )
  .join("\n\n")}
`;

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${idea.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-launch-kit.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Markdown launch kit downloaded!", "success");
  };

  const replaceVariables = (text: string) => {
    return text
      .replace(/\{\{FirstName\}\}/g, customFirstName || "Alex")
      .replace(/\{\{Company\}\}/g, customCompany || "Acme Digital");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Launch Kit Action Bar */}
      <div className="bg-[#18181B] border border-[#27272A] p-6 lg:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EC4899]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EC4899]/10 border border-[#EC4899]/30 flex items-center justify-center text-[#EC4899]">
                <Rocket className="w-5 h-5" />
              </div>
              <h2 className="font-anton text-2xl tracking-wide uppercase text-[#FAFAFA]">
                LAUNCH KIT & GO-TO-MARKET ASSETS
              </h2>
            </div>
            <p className="text-[#A1A1AA] text-sm max-w-2xl leading-relaxed">
              High-converting landing page copy, 3-step cold email sequences,
              direct founder DMs, and paid ad hooks engineered specifically for{" "}
              <strong className="text-[#FAFAFA]">{idea.name}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {kit && (
              <button
                id="export-launch-kit-md-btn"
                onClick={handleExportMarkdown}
                className="px-4 py-2.5 bg-[#27272A] text-[#FAFAFA] border border-[#3F3F46] rounded-xl hover:bg-[#3F3F46] text-xs font-anton tracking-wider uppercase flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#EC4899]" />
                EXPORT MARKDOWN
              </button>
            )}
            <button
              id="generate-launch-kit-btn"
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#EC4899] text-[#0A0A0B] font-anton text-xs tracking-wider uppercase rounded-xl hover:bg-[#F472B6] active:scale-95 transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] shrink-0 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  CRAFTING LAUNCH KIT...
                </>
              ) : kit ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  REGENERATE LAUNCH KIT
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  GENERATE LAUNCH KIT WITH AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {!kit && !isLoading && (
        <div className="bg-[#18181B] border border-[#27272A] p-12 rounded-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#EC4899]/10 border border-[#EC4899]/30 flex items-center justify-center mx-auto text-[#EC4899]">
            <Rocket className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-anton text-xl text-[#FAFAFA] tracking-wide uppercase">
              NO LAUNCH KIT GENERATED YET
            </h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Generate a conversion-optimized landing page blueprint, cold email
              outreach sequence to land your first 10 beta users, and multi-channel
              ad angles.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            className="px-6 py-3 bg-[#EC4899] text-[#0A0A0B] font-anton text-sm tracking-wider uppercase rounded-xl hover:bg-[#F472B6] active:scale-95 transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            GENERATE COMPLETE LAUNCH KIT
          </button>
        </div>
      )}

      {kit && (
        <div className="space-y-6">
          {/* Sub-Tabs Bar */}
          <div className="flex border-b border-[#27272A] overflow-x-auto no-scrollbar gap-2">
            <button
              id="tab-landing-page"
              onClick={() => setActiveTab("landing-page")}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-anton text-xs tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "landing-page"
                  ? "border-[#EC4899] text-[#EC4899] bg-[#EC4899]/5"
                  : "border-transparent text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              <Layout className="w-4 h-4" />
              1. LANDING PAGE WIREFRAME
            </button>
            <button
              id="tab-cold-emails"
              onClick={() => setActiveTab("cold-emails")}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-anton text-xs tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "cold-emails"
                  ? "border-[#EC4899] text-[#EC4899] bg-[#EC4899]/5"
                  : "border-transparent text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              <Mail className="w-4 h-4" />
              2. 3-STEP COLD OUTBOUND SEQUENCE
            </button>
            <button
              id="tab-social-dms"
              onClick={() => setActiveTab("social-dms")}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-anton text-xs tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "social-dms"
                  ? "border-[#EC4899] text-[#EC4899] bg-[#EC4899]/5"
                  : "border-transparent text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              3. DIRECT SOCIAL DMS
            </button>
            <button
              id="tab-ad-hooks"
              onClick={() => setActiveTab("ad-hooks")}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-anton text-xs tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "ad-hooks"
                  ? "border-[#EC4899] text-[#EC4899] bg-[#EC4899]/5"
                  : "border-transparent text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              4. PAID ADS & SEARCH HOOKS
            </button>
          </div>

          {/* TAB 1: LANDING PAGE WIREFRAME */}
          {activeTab === "landing-page" && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Interactive Landing Page Hero Preview */}
              <div className="bg-[#0A0A0B] border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl">
                {/* Browser Mockup Bar */}
                <div className="bg-[#18181B] px-4 py-3 border-b border-[#27272A] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]/60" />
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]/60" />
                    <div className="w-3 h-3 rounded-full bg-[#10B981]/60" />
                    <span className="ml-3 text-xs font-mono text-[#71717A]">
                      https://{idea.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        `${kit.heroSection.headline}\n\n${kit.heroSection.subheadline}\n\nPrimary CTA: ${kit.heroSection.primaryCtaText}\nSecondary CTA: ${kit.heroSection.secondaryCtaText}\nBadge: ${kit.heroSection.socialProofBadge}`,
                        "hero-copy",
                        "Hero Section Copy"
                      )
                    }
                    className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#FAFAFA] cursor-pointer"
                  >
                    {copiedKey === "hero-copy" ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    Copy Hero Copy
                  </button>
                </div>

                {/* Hero Viewport */}
                <div className="p-8 lg:p-14 text-center max-w-4xl mx-auto space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#27272A] border border-[#3F3F46] text-xs text-[#FAFAFA]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{kit.heroSection.socialProofBadge}</span>
                  </div>

                  <h1 className="font-anton text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#FAFAFA] leading-tight">
                    {kit.heroSection.headline}
                  </h1>

                  <p className="text-[#A1A1AA] text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
                    {kit.heroSection.subheadline}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                    <button className="px-6 py-3.5 bg-[#EC4899] text-[#0A0A0B] font-anton text-sm tracking-wider uppercase rounded-xl hover:bg-[#F472B6] active:scale-95 transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                      {kit.heroSection.primaryCtaText}
                    </button>
                    <button className="px-6 py-3.5 bg-[#18181B] text-[#FAFAFA] border border-[#27272A] font-anton text-sm tracking-wider uppercase rounded-xl hover:bg-[#27272A] active:scale-95 transition-all">
                      {kit.heroSection.secondaryCtaText}
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Core Value Pillars */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-anton text-lg text-[#FAFAFA] tracking-wide uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#F59E0B]" />
                    CORE VALUE PILLARS
                  </h3>
                  <button
                    onClick={() =>
                      handleCopy(
                        kit.valuePillars
                          .map(
                            (p, i) =>
                              `${i + 1}. ${p.title} (${p.highlightMetric})\n${p.description}`
                          )
                          .join("\n\n"),
                        "pillars-copy",
                        "Value Pillars"
                      )
                    }
                    className="text-xs text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === "pillars-copy" ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    Copy Pillars
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {kit.valuePillars.map((pillar, i) => (
                    <div
                      key={i}
                      className="bg-[#18181B] border border-[#27272A] p-5 rounded-xl space-y-3 relative group hover:border-[#EC4899]/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#27272A] text-[#EC4899] font-semibold">
                          {pillar.highlightMetric}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              `${pillar.title}: ${pillar.description} (${pillar.highlightMetric})`,
                              `pillar-${i}`,
                              `Pillar ${i + 1}`
                            )
                          }
                          className="opacity-0 group-hover:opacity-100 text-[#71717A] hover:text-[#FAFAFA] transition-opacity cursor-pointer"
                        >
                          {copiedKey === `pillar-${i}` ? (
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <h4 className="font-anton text-base text-[#FAFAFA] tracking-wide uppercase">
                        {pillar.title}
                      </h4>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Feature Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-anton text-lg text-[#FAFAFA] tracking-wide uppercase flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#6366F1]" />
                    FEATURE BENEFIT CARDS
                  </h3>
                  <button
                    onClick={() =>
                      handleCopy(
                        kit.featureCards
                          .map(
                            (f) =>
                              `**${f.title}** (${f.benefit})\n${f.detail}`
                          )
                          .join("\n\n"),
                        "features-copy",
                        "Features"
                      )
                    }
                    className="text-xs text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === "features-copy" ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    Copy Features
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kit.featureCards.map((feat, i) => (
                    <div
                      key={i}
                      className="bg-[#18181B] border border-[#27272A] p-5 rounded-xl space-y-2 hover:border-[#6366F1]/40 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#6366F1] font-semibold tracking-wide">
                          {feat.benefit}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              `${feat.title} - ${feat.benefit}\n${feat.detail}`,
                              `feat-${i}`,
                              feat.title
                            )
                          }
                          className="opacity-0 group-hover:opacity-100 text-[#71717A] hover:text-[#FAFAFA] transition-opacity cursor-pointer"
                        >
                          {copiedKey === `feat-${i}` ? (
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <h4 className="font-anton text-sm text-[#FAFAFA] tracking-wide uppercase">
                        {feat.title}
                      </h4>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed">
                        {feat.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4 Objection-Busting FAQs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-anton text-lg text-[#FAFAFA] tracking-wide uppercase flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#10B981]" />
                    OBJECTION-BUSTING FAQ SECTION
                  </h3>
                  <button
                    onClick={() =>
                      handleCopy(
                        kit.objectionFaqs
                          .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
                          .join("\n\n"),
                        "faqs-copy",
                        "FAQs"
                      )
                    }
                    className="text-xs text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === "faqs-copy" ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    Copy FAQs
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {kit.objectionFaqs.map((faq, i) => (
                    <div
                      key={i}
                      className="bg-[#18181B] border border-[#27272A] p-5 rounded-xl space-y-2 hover:border-[#10B981]/40 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-xs text-[#FAFAFA] leading-snug">
                          {faq.question}
                        </h4>
                        <button
                          onClick={() =>
                            handleCopy(
                              `Q: ${faq.question}\nA: ${faq.answer}`,
                              `faq-${i}`,
                              "FAQ"
                            )
                          }
                          className="opacity-0 group-hover:opacity-100 text-[#71717A] hover:text-[#FAFAFA] transition-opacity cursor-pointer shrink-0"
                        >
                          {copiedKey === `faq-${i}` ? (
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 3-STEP COLD OUTBOUND SEQUENCE */}
          {activeTab === "cold-emails" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Dynamic Recipient Customizer */}
              <div className="bg-[#18181B] border border-[#27272A] p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-anton tracking-wider text-[#EC4899] uppercase">
                    DYNAMIC VARIABLES PREVIEW
                  </span>
                  <p className="text-xs text-[#A1A1AA]">
                    Customize the recipient tags to preview how emails look to real prospects.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#0A0A0B] px-3 py-1.5 rounded-lg border border-[#27272A]">
                    <span className="text-xs font-mono text-[#71717A]">
                      {"{{FirstName}}"}
                    </span>
                    <input
                      type="text"
                      value={customFirstName}
                      onChange={(e) => setCustomFirstName(e.target.value)}
                      className="bg-transparent text-xs text-[#FAFAFA] focus:outline-none w-20"
                      placeholder="Alex"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-[#0A0A0B] px-3 py-1.5 rounded-lg border border-[#27272A]">
                    <span className="text-xs font-mono text-[#71717A]">
                      {"{{Company}}"}
                    </span>
                    <input
                      type="text"
                      value={customCompany}
                      onChange={(e) => setCustomCompany(e.target.value)}
                      className="bg-transparent text-xs text-[#FAFAFA] focus:outline-none w-28"
                      placeholder="Acme Inc"
                    />
                  </div>
                </div>
              </div>

              {/* 3 Steps */}
              <div className="space-y-6">
                {kit.coldEmailSequence.map((email, i) => (
                  <div
                    key={i}
                    className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden"
                  >
                    {/* Step Banner */}
                    <div className="bg-[#27272A]/60 px-6 py-4 border-b border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#EC4899] text-[#0A0A0B] font-anton text-xs flex items-center justify-center font-bold">
                          0{email.step}
                        </span>
                        <div>
                          <h4 className="font-anton text-sm text-[#FAFAFA] tracking-wide uppercase">
                            {email.name}
                          </h4>
                          <span className="text-xs font-mono text-[#A1A1AA]">
                            Cadence: {email.timing}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleCopy(
                              `Subject: ${replaceVariables(email.subjectLine)}\n\n${replaceVariables(email.bodyText)}`,
                              `email-full-${i}`,
                              `Step ${email.step} Email`
                            )
                          }
                          className="px-3 py-1.5 bg-[#18181B] text-[#FAFAFA] border border-[#3F3F46] rounded-lg text-xs font-anton tracking-wider uppercase hover:bg-[#27272A] flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedKey === `email-full-${i}` ? (
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-[#EC4899]" />
                          )}
                          COPY EMAIL
                        </button>
                      </div>
                    </div>

                    {/* Email Details */}
                    <div className="p-6 space-y-4">
                      {/* Subject Line */}
                      <div className="bg-[#0A0A0B] p-3.5 rounded-xl border border-[#27272A] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-[#71717A] font-mono">
                            Subject:
                          </span>
                          <span className="text-[#FAFAFA] font-medium">
                            {replaceVariables(email.subjectLine)}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleCopy(
                              replaceVariables(email.subjectLine),
                              `sub-${i}`,
                              "Subject Line"
                            )
                          }
                          className="text-[#71717A] hover:text-[#FAFAFA] text-xs flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          {copiedKey === `sub-${i}` ? (
                            <Check className="w-3 h-3 text-[#10B981]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {/* Email Body */}
                      <div className="bg-[#0A0A0B] p-5 rounded-xl border border-[#27272A] relative">
                        <pre className="text-xs text-[#D4D4D8] font-sans whitespace-pre-wrap leading-relaxed">
                          {replaceVariables(email.bodyText)}
                        </pre>
                      </div>

                      {/* CTA Highlight */}
                      <div className="p-3 bg-[#EC4899]/5 border border-[#EC4899]/20 rounded-xl flex items-center gap-2 text-xs text-[#EC4899]">
                        <ArrowRight className="w-4 h-4 shrink-0" />
                        <span>
                          <strong>Primary Call to Action:</strong>{" "}
                          {replaceVariables(email.callToAction)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT SOCIAL DMS */}
          {activeTab === "social-dms" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kit.socialOutreachDms.map((dm, i) => (
                  <div
                    key={i}
                    className="bg-[#18181B] border border-[#27272A] p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#EC4899]/40 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded bg-[#27272A] text-xs font-anton tracking-wider text-[#EC4899] uppercase">
                          {dm.platform}
                        </span>
                        <span className="text-[11px] font-mono text-[#71717A]">
                          {dm.messageText.length} chars
                        </span>
                      </div>

                      <div className="text-xs text-[#A1A1AA]">
                        <strong className="text-[#FAFAFA]">Target:</strong>{" "}
                        {dm.targetRecipient}
                      </div>

                      <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#27272A]">
                        <p className="text-xs text-[#D4D4D8] whitespace-pre-wrap leading-relaxed">
                          {replaceVariables(dm.messageText)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleCopy(
                          replaceVariables(dm.messageText),
                          `dm-${i}`,
                          `${dm.platform} DM`
                        )
                      }
                      className="w-full py-2 bg-[#27272A] text-[#FAFAFA] border border-[#3F3F46] rounded-xl text-xs font-anton tracking-wider uppercase hover:bg-[#3F3F46] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      {copiedKey === `dm-${i}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          COPIED!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#EC4899]" />
                          COPY MESSAGE
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PAID ADS & SEARCH HOOKS */}
          {activeTab === "ad-hooks" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {kit.adHooks.map((ad, i) => (
                  <div
                    key={i}
                    className="bg-[#18181B] border border-[#27272A] p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-[#6366F1]/40 transition-all"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded bg-[#27272A] text-xs font-anton tracking-wider text-[#6366F1] uppercase">
                          {ad.platform}
                        </span>
                        <button
                          onClick={() =>
                            handleCopy(
                              `Headline: ${ad.headline}\n\nPrimary Text: ${ad.primaryText}\n\nTargeting: ${ad.targetAudience}`,
                              `ad-${i}`,
                              `${ad.platform} Ad Hook`
                            )
                          }
                          className="text-[#71717A] hover:text-[#FAFAFA] text-xs flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === `ad-${i}` ? (
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          Copy
                        </button>
                      </div>

                      {/* Mockup Preview */}
                      <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#27272A] space-y-2">
                        <span className="text-[10px] font-mono text-[#A1A1AA] uppercase tracking-wider block">
                          Sponsored
                        </span>
                        <h4 className="text-xs font-bold text-[#FAFAFA] leading-snug">
                          {ad.headline}
                        </h4>
                        <p className="text-xs text-[#A1A1AA] leading-relaxed">
                          {ad.primaryText}
                        </p>
                      </div>

                      {/* Targeting */}
                      <div className="bg-[#27272A]/40 p-3 rounded-lg border border-[#27272A] space-y-1">
                        <span className="text-[10px] font-mono text-[#71717A] uppercase">
                          Targeting Parameters
                        </span>
                        <p className="text-xs text-[#FAFAFA] font-mono">
                          {ad.targetAudience}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        handleCopy(
                          `Headline: ${ad.headline}\n\nPrimary Text: ${ad.primaryText}\n\nTargeting: ${ad.targetAudience}`,
                          `ad-btn-${i}`,
                          "Ad Copy"
                        )
                      }
                      className="w-full py-2 bg-[#27272A] text-[#FAFAFA] border border-[#3F3F46] rounded-xl text-xs font-anton tracking-wider uppercase hover:bg-[#3F3F46] flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      {copiedKey === `ad-btn-${i}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#10B981]" />
                          COPIED
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#6366F1]" />
                          COPY AD COPY
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
