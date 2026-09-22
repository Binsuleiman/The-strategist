import express, { Request, Response } from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy/Safe Gemini Initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using intelligent fallback generator.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to clean JSON string from LLM responses
function cleanJsonText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned;
}

// 1. Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), hasApiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// 2. Generate 5 Business Ideas
app.post("/api/generate-ideas", async (req: Request, res: Response) => {
  const { founderProfile, mode, customPrompt } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      ideas: generateFallbackIdeas(founderProfile, mode, customPrompt),
      isFallback: true,
    });
  }

  try {
    const randomSeed = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const prompt = `You are a ruthless, expert Silicon Valley startup strategist and venture partner.
Your mission: Generate exactly 5 FRESH, HIGHLY COMPELLING, DISTINCT, ACTIONABLE, AND COMMERCIALLY VIABLE business ideas tailored to this founder profile.

FOUNDER PROFILE:
- Skills: ${founderProfile?.skills?.join(", ") || "Full-stack dev, Marketing, Operations"}
- Interests: ${founderProfile?.interests?.join(", ") || "AI tools, Productivity, B2B SaaS"}
- Budget: ${founderProfile?.budget || "$500 - $2,500"}
- Time Commitment: ${founderProfile?.timeCommitment || "15-25 hrs/week"}
- Target Market: ${founderProfile?.targetMarket || "Global English / B2B"}
- Preferred Business Model: ${founderProfile?.businessType || "B2B SaaS / Micro-Tool"}
- Founder Goal: ${founderProfile?.founderGoal || "Full-Time Freedom"}
- Risk Tolerance: ${founderProfile?.riskTolerance || "Balanced"}
- Generation Mode: ${mode || "personalized"}
- User Specific Angle / Request / Prompt: ${customPrompt || "Focus on high margin, fast time-to-first-dollar"}
- Session Seed: ${randomSeed}

RULES:
1. ALWAYS GENERATE COMPLETELY NEW, UNIQUE IDEAS. Never return repetitive or cached concepts.
2. If the user specified a custom prompt or industry, generate 5 clever, distinct angles/variations specifically around their request.
3. Avoid generic SaaS cliches (no "AI note taking app for everyone"). Be specific about niche, target buyer, and willingness to pay.
4. Calculate honest Opportunity Scores (0-100) and score breakdowns across: marketDemand, customerPain, monetization, competition, differentiation, execution, founderFit.
5. Return STRICTLY valid JSON without extra markdown.

SCHEMA:
[
  {
    "id": "idea_1",
    "name": "Punchy Memorable Name",
    "tagline": "Specific 1-line value proposition",
    "description": "Clear 2-3 sentence overview of the business",
    "targetCustomer": "Specific ideal customer profile (ICP)",
    "problem": "Real acute pain point they currently waste time/money on",
    "solution": "Concrete product/service solving this without bloat",
    "businessModel": "Exact monetization (e.g., $49/mo per seat + usage, or $1.5k upfront + revshare)",
    "startupCost": "LOW" | "MEDIUM" | "HIGH",
    "executionDifficulty": "LOW" | "MEDIUM" | "HIGH",
    "whyNow": "Recent technological, regulatory, or market shift enabling this today",
    "primaryRisk": "The #1 thing that could kill this business",
    "firstValidationStep": "A free/cheap test that can be run in under 48 hours",
    "opportunityScore": 84,
    "scoreBreakdown": {
      "marketDemand": 85,
      "customerPain": 90,
      "monetization": 82,
      "competition": 70,
      "differentiation": 78,
      "execution": 65,
      "founderFit": 92
    }
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are the AI Business Strategist. Return only pure structured JSON matching the requested schema. Ensure 5 distinct, novel, high quality ideas.",
      },
    });

    const parsed = JSON.parse(cleanJsonText(response.text || "[]"));
    const ideasWithIds = parsed.map((item: any, idx: number) => ({
      ...item,
      id: item.id || `idea_${Date.now()}_${idx}`,
      status: "EXPLORING",
      savedAt: new Date().toISOString(),
    }));

    res.json({ ideas: ideasWithIds, isFallback: false });
  } catch (err: any) {
    console.error("Error generating ideas with Gemini:", err);
    res.json({
      ideas: generateFallbackIdeas(founderProfile, mode, customPrompt),
      isFallback: true,
      error: err.message,
    });
  }
});

// 2b. Evaluate Custom Typed Idea
app.post("/api/evaluate-custom-idea", async (req: Request, res: Response) => {
  const { customIdea, founderProfile } = req.body;
  const ai = getGeminiClient();

  let userSpecifiedName = "";
  let userDescription = "";
  let userTargetCustomer = "";
  let userMonetization = "";

  if (typeof customIdea === "object" && customIdea !== null) {
    userSpecifiedName = customIdea.name ? String(customIdea.name).trim() : "";
    userDescription = customIdea.description || customIdea.problem || "";
    userTargetCustomer = customIdea.targetCustomer || "";
    userMonetization = customIdea.monetization || "";
  } else if (typeof customIdea === "string") {
    try {
      const parsedObj = JSON.parse(customIdea);
      userSpecifiedName = parsedObj.name ? String(parsedObj.name).trim() : "";
      userDescription = parsedObj.description || parsedObj.problem || customIdea;
      userTargetCustomer = parsedObj.targetCustomer || "";
      userMonetization = parsedObj.monetization || "";
    } catch {
      userDescription = customIdea;
    }
  }

  if (!ai) {
    return res.json({
      idea: generateCustomFallbackIdea(customIdea, founderProfile),
      isFallback: true,
    });
  }

  try {
    const prompt = `You are an elite Silicon Valley venture partner and startup strategist.
A founder has typed their own business idea. Your task is to evaluate and structure it into a comprehensive, professional Business Idea profile with honest viability scoring.

FOUNDER'S INPUT:
- Chosen Working Title/Name: "${userSpecifiedName || "(None provided by user - synthesize a clear brand name with proper spaces)"}"
- Idea Description / Core Problem: "${userDescription}"
- Target Customer (ICP): "${userTargetCustomer || "Not specified - identify optimal ICP"}"
- Monetization / Model: "${userMonetization || "Not specified - propose high-margin model"}"

FOUNDER PROFILE CONTEXT:
- Skills: ${founderProfile?.skills?.join(", ") || "General Builder"}
- Budget: ${founderProfile?.budget || "$500 - $2,500"}
- Time Commitment: ${founderProfile?.timeCommitment || "20 hrs/week"}
- Target Market: ${founderProfile?.targetMarket || "B2B / Global"}

CRITICAL NAMING RULE:
${userSpecifiedName ? `- The user EXPLICITLY named this idea: "${userSpecifiedName}". You MUST set "name" to "${userSpecifiedName}" exactly verbatim. DO NOT remove words, DO NOT merge words together without spaces, DO NOT alter the casing/punctuation, and DO NOT replace it.` : `- Synthesize a punchy, professional 2-3 word brand name WITH PROPER SPACES between words (e.g. "Pulse Flow", "Audit Shield AI"). Never glue words together without spaces.`}

OTHER RULES:
1. Formulate a crisp tagline and clear problem-solution breakdown based on their input.
2. Sharpen the target customer (ICP) and suggest a high-margin monetization model.
3. Calculate an objective, rigorous 0-100 Opportunity Score and detailed score breakdown (marketDemand, customerPain, monetization, competition, differentiation, execution, founderFit).
4. Identify why now, the single biggest primary risk, and a 48-hour lean validation experiment.
5. Return STRICTLY valid JSON matching the schema below.

SCHEMA:
{
  "name": "${userSpecifiedName ? userSpecifiedName : "Clear Brand Name"}",
  "tagline": "Sharp 1-line value proposition",
  "description": "Clear 2-3 sentence overview of how the business operates and scales",
  "targetCustomer": "Specific ideal customer profile (ICP)",
  "problem": "The acute pain point, wasted time, or financial leak",
  "solution": "The product/service wedge that solves this pain point cleanly",
  "businessModel": "Exact monetization (e.g., $99/mo subscription or tiered usage)",
  "startupCost": "LOW" | "MEDIUM" | "HIGH",
  "executionDifficulty": "LOW" | "MEDIUM" | "HIGH",
  "whyNow": "Recent technological, market, or behavioral shift enabling this right now",
  "primaryRisk": "The #1 pitfall or threat to growth",
  "firstValidationStep": "A free or under-$50 lean test to run in under 48 hours",
  "opportunityScore": 87,
  "scoreBreakdown": {
    "marketDemand": 88,
    "customerPain": 92,
    "monetization": 85,
    "competition": 74,
    "differentiation": 82,
    "execution": 80,
    "founderFit": 90
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are the AI Business Strategist. Return only pure structured JSON matching the requested schema. Respect user-specified idea names verbatim.",
      },
    });

    const parsed = JSON.parse(cleanJsonText(response.text || "{}"));
    const finalName = userSpecifiedName && userSpecifiedName.length > 0
      ? userSpecifiedName
      : (parsed.name || "Venture Initiative");

    const enrichedIdea = {
      ...parsed,
      name: finalName,
      id: `custom_idea_${Date.now()}`,
      status: "EXPLORING",
      savedAt: new Date().toISOString(),
    };

    res.json({ idea: enrichedIdea, isFallback: false });
  } catch (err: any) {
    console.error("Error evaluating custom idea with Gemini:", err);
    res.json({
      idea: generateCustomFallbackIdea(customIdea, founderProfile),
      isFallback: true,
      error: err.message,
    });
  }
});

// 3. Deep Validation Report
app.post("/api/validate-idea", async (req: Request, res: Response) => {
  const { idea, founderProfile } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      report: generateFallbackValidationReport(idea),
      isFallback: true,
    });
  }

  try {
    const prompt = `Perform an institutional-grade venture validation analysis for the following business idea:

IDEA:
Name: ${idea.name}
Tagline: ${idea.tagline}
Description: ${idea.description}
Target Customer: ${idea.targetCustomer}
Problem: ${idea.problem}
Solution: ${idea.solution}
Business Model: ${idea.businessModel}

FOUNDER CONTEXT:
Skills: ${founderProfile?.skills?.join(", ") || "Engineering, Product"}
Budget: ${founderProfile?.budget || "$1,000"}
Time: ${founderProfile?.timeCommitment || "Part-time"}

Return a STRICT JSON validation report with deep commercial insight:
{
  "executiveSummary": "Concise 3-sentence summary of commercial viability",
  "targetCustomerDetail": "Granular persona definition with budget authority",
  "problemDepth": "Analysis of pain severity (hair-on-fire vs vitamin)",
  "customerPainScore": 88,
  "solutionViability": "Technical & operational feasibility review",
  "marketOpportunity": {
    "tamSamSom": "Clear estimated breakdown of TAM, SAM, SOM in USD",
    "tailwinds": ["Tailwind 1", "Tailwind 2", "Tailwind 3"],
    "demandSignals": ["Signal 1 with search/spend evidence", "Signal 2", "Signal 3"]
  },
  "competitionLandscape": "Realistic overview of incumbent and direct competitor dynamics",
  "differentiationEdge": "The sustainable wedge or unfair advantage",
  "monetizationStrategy": "Detailed monetization mechanics, LTV/CAC dynamics",
  "pricingModel": {
    "tier1": "Starter / Entry Tier specifics",
    "tier2": "Core / Pro Tier specifics",
    "rationale": "Why customers will willingly swipe a credit card for this"
  },
  "customerAcquisition": ["Channel 1 (e.g. Cold outbound on LinkedIn)", "Channel 2 (e.g. Programmatic SEO)", "Channel 3"],
  "startupRequirements": {
    "capitalNeeded": "Estimated cash to first revenue",
    "techStack": ["Tool 1", "Tool 2", "Tool 3"],
    "timeToLaunch": "Realistic timeline (e.g. 2-3 weeks)"
  },
  "keyRisks": ["Risk 1", "Risk 2", "Risk 3"],
  "validationExperiments": [
    {
      "experiment": "Exact smoke test or landing page or outreach test",
      "successMetric": "Measurable threshold (e.g. 5 LOIs or 15% booking rate)",
      "timeframe": "48 hours - 7 days"
    },
    {
      "experiment": "Concierge MVP manual test",
      "successMetric": "3 paying beta clients",
      "timeframe": "10 days"
    }
  ],
  "recommendation": "PURSUE" | "CONSIDER" | "REWORK" | "AVOID",
  "recommendationRationale": "Transparent justification without fluff",
  "confidenceLevel": "HIGH" | "MEDIUM" | "LOW",
  "createdAt": "${new Date().toISOString()}"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are a senior venture diligence director. Be honest, objective, analytical, and rigorous.",
      },
    });

    const report = JSON.parse(cleanJsonText(response.text || "{}"));
    res.json({ report, isFallback: false });
  } catch (err: any) {
    console.error("Error validating idea with Gemini:", err);
    res.json({
      report: generateFallbackValidationReport(idea),
      isFallback: true,
      error: err.message,
    });
  }
});

// 4. Competitor Analysis with Google Search Grounding
app.post("/api/analyze-competitors", async (req: Request, res: Response) => {
  const { idea, customQuery } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      competitors: generateFallbackCompetitors(idea),
      liveMarketIntelligence: generateFallbackLiveMarketIntelligence(idea),
      isFallback: true,
    });
  }

  try {
    const searchQuery = customQuery 
      ? `Focused Search: ${customQuery}` 
      : `Market verification for ${idea.name}: "${idea.targetCustomer}" solutions for "${idea.problem}"`;

    const prompt = `You are an elite VC market intelligence analyst and competitive researcher. 
Perform a LIVE WEB SEARCH via Google to identify real, currently active market competitors, alternative software, recent Product Hunt launches, and SaaS incumbents in this space:

STARTUP CONTEXT:
Name: ${idea.name}
Tagline: ${idea.tagline || ""}
Target Customer: ${idea.targetCustomer}
Problem: ${idea.problem}
Solution: ${idea.solution}
${customQuery ? `Specific Founder Search Angle: ${customQuery}` : ""}

YOUR MISSION:
1. Search the live web for 3 to 5 REAL direct competitors, legacy incumbents, modern alternative apps, or active startups solving this or similar problems.
2. For each competitor, uncover:
   - Real product name & official website URL (e.g. https://...)
   - Category: "Direct Competitor" | "Legacy Incumbent" | "Adjacent Solution" | "Emerging Challenger"
   - Funding/Scale status (e.g. "Bootstrapped Indie", "Series A ($10M+)", "Public Enterprise", "YC W24")
   - What they actually do (1-2 sentences)
   - Target audience & positioning
   - Real pricing structure (e.g., "$29/mo starter", "Custom Enterprise quote", "Freemium")
   - Key strengths
   - Critical user complaints or product weaknesses (from reviews, Reddit, G2, etc.)
   - The user's exact asymmetric differentiation wedge / opportunity to beat them
   - Real-world verified live signal (e.g., active on Product Hunt, G2 top rated, Chrome Web Store)
3. Synthesize the overall Live Market Intelligence:
   - Market Maturity: "Greenfield / Emerging" | "Fragmented" | "Growing Competition" | "Red Ocean / Highly Saturated"
   - Threat Level: "LOW" | "MEDIUM" | "HIGH" | "EXTREME"
   - Whitespace Opportunity: 2 punchy sentences revealing the single biggest unaddressed customer void
   - Recent Market Trends: 3 concrete macro or technological shifts happening in this specific domain

You MUST format your entire response strictly as a JSON object inside a \`\`\`json markdown block with this exact schema:
\`\`\`json
{
  "competitors": [
    {
      "name": "Real Competitor Name",
      "websiteUrl": "https://example.com",
      "marketCategory": "Direct Competitor",
      "fundingOrScale": "Series A ($8M)",
      "whatTheyDo": "Concise 1-2 sentence description of their core offering.",
      "targetAudience": "Their core buyer profile",
      "pricing": "Starting at $49/mo",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"],
      "differentiationAngle": "How the founder's idea wins against them",
      "verifiedLiveSignal": "Active Product Hunt launch / 10k+ Chrome extension users"
    }
  ],
  "liveMarketIntelligence": {
    "overallMarketMaturity": "Fragmented",
    "threatLevel": "MEDIUM",
    "whitespaceOpportunity": "Incumbents lack native AI agentic autonomy, forcing users to click through 15 manual steps.",
    "recentTrends": [
      "Shift from manual dashboard reporting to autonomous conversational actions",
      "High willingness to pay for specialized vertical micro-SaaS with zero onboarding friction",
      "Customer backlash against bloated per-seat pricing models"
    ]
  }
}
\`\`\``;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are an elite VC competitive intelligence engine with live Google Search capabilities. Always verify real market competitors and provide actionable differentiation wedges.",
      },
    });

    const parsed = JSON.parse(cleanJsonText(response.text || "{}"));
    
    // Extract Grounding Citations and Search Queries
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

    const searchGroundingSources: Array<{ title: string; url: string }> = [];
    if (chunks && Array.isArray(chunks)) {
      for (const chunk of chunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          if (!searchGroundingSources.some((s) => s.url === chunk.web.uri)) {
            searchGroundingSources.push({
              title: chunk.web.title,
              url: chunk.web.uri,
            });
          }
        }
      }
    }

    const competitors = Array.isArray(parsed.competitors) ? parsed.competitors : (Array.isArray(parsed) ? parsed : generateFallbackCompetitors(idea));
    const rawIntel = parsed.liveMarketIntelligence || {};
    
    const liveMarketIntelligence = {
      overallMarketMaturity: rawIntel.overallMarketMaturity || "Fragmented",
      threatLevel: rawIntel.threatLevel || "MEDIUM",
      whitespaceOpportunity: rawIntel.whitespaceOpportunity || "Significant opportunity for a specialized, low-friction modern solution.",
      recentTrends: Array.isArray(rawIntel.recentTrends) && rawIntel.recentTrends.length > 0 
        ? rawIntel.recentTrends 
        : [
            "Customer frustration with monolithic enterprise tools",
            "Demand for rapid self-serve onboarding",
            "Accelerated adoption of niche AI-first workflows"
          ],
      searchGroundingSources,
      webSearchQueries,
      verifiedAt: new Date().toISOString(),
      isGrounded: searchGroundingSources.length > 0 || webSearchQueries.length > 0,
    };

    res.json({
      competitors,
      liveMarketIntelligence,
      isFallback: false,
    });
  } catch (err: any) {
    console.error("Error analyzing competitors with search grounding:", err);
    res.json({
      competitors: generateFallbackCompetitors(idea),
      liveMarketIntelligence: generateFallbackLiveMarketIntelligence(idea),
      isFallback: true,
      error: err.message,
    });
  }
});

// 5. Devil's Advocate / Stress Test
app.post("/api/stress-test", async (req: Request, res: Response) => {
  const { idea, founderProfile } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      stressTest: generateFallbackStressTest(idea),
      isFallback: true,
    });
  }

  try {
    const prompt = `You are the AI DEVIL'S ADVOCATE. Your sole mission is to stress-test this business idea ruthlessly.
DO NOT be nice. DO NOT flatter the founder. Try to BREAK this business model by finding the 5 most lethal structural failure points, founder blindspots, distribution traps, or unit economic flaws.

IDEA:
Name: ${idea.name}
Tagline: ${idea.tagline}
Target Customer: ${idea.targetCustomer}
Problem: ${idea.problem}
Solution: ${idea.solution}
Business Model: ${idea.businessModel}
Primary Risk Identified: ${idea.primaryRisk}

Return JSON strictly matching:
{
  "headline": "Punchy, arresting diagnosis of the biggest threat to this business",
  "failureReasons": [
    {
      "title": "Clear weakness title (e.g. The Cold-Start CAC Death Spiral)",
      "whyItMatters": "Deep analytical explanation of why this will drain capital or lead to 90% churn",
      "howToMitigate": "Actionable countermeasure to inoculate the business against this failure",
      "severity": "CRITICAL" | "HIGH" | "MODERATE"
    }
  ],
  "stressTestResult": "STRONG" | "MODERATE" | "WEAK",
  "overallVerdict": "Unfiltered final verdict on whether to proceed or kill this immediately",
  "createdAt": "${new Date().toISOString()}"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are the startup Devil's Advocate. Be brutally honest, constructive, and uncompromising.",
      },
    });

    const stressTest = JSON.parse(cleanJsonText(response.text || "{}"));
    res.json({ stressTest, isFallback: false });
  } catch (err: any) {
    console.error("Error running stress test:", err);
    res.json({
      stressTest: generateFallbackStressTest(idea),
      isFallback: true,
      error: err.message,
    });
  }
});

// 6. Improve Idea (Pivot & Sharpening)
app.post("/api/improve-idea", async (req: Request, res: Response) => {
  const { idea, stressTest } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      improvedVersion: generateFallbackImprovedIdea(idea),
      isFallback: true,
    });
  }

  try {
    const prompt = `Based on the stress-test feedback, reconstruct and sharpen this business idea into a hardened 2.0 version.
Narrow the niche, make the value proposition irresistible, build a defensibility moat, and eliminate the identified failure points.

ORIGINAL IDEA:
Name: ${idea.name}
Target Customer: ${idea.targetCustomer}
Problem: ${idea.problem}
Solution: ${idea.solution}
Business Model: ${idea.businessModel}

IDENTIFIED STRESS-TEST WEAKNESSES:
${stressTest?.failureReasons?.map((r: any) => `- ${r.title}: ${r.whyItMatters}`).join("\n") || idea.primaryRisk}

Return JSON strictly matching:
{
  "beforeAfterSummary": "High-level 2-sentence explanation of what transformed to make this a 10x stronger bet",
  "changes": [
    {
      "field": "Target Customer",
      "before": "Broad customer segment",
      "after": "Hyper-focused, high-budget wedge segment",
      "rationale": "Why this removes distribution friction and increases willingness to pay"
    },
    {
      "field": "Value Proposition & Offer",
      "before": "Original vague benefit",
      "after": "Quantifiable ROI outcome with guaranteed result",
      "rationale": "Transforms it from nice-to-have to urgent purchase"
    },
    {
      "field": "Monetization & Pricing",
      "before": "Original model",
      "after": "Hardened cash-flow positive model",
      "rationale": "Shortens payback period to day 0"
    },
    {
      "field": "Defensibility & Moat",
      "before": "Low switching costs",
      "after": "Data network effect / proprietary workflow lock-in",
      "rationale": "Protects against copycats and platform risk"
    }
  ],
  "improvedValueProposition": "One killer sentence stating the revised offer",
  "nicheFocus": "Specific beachhead market",
  "defensibilityMoat": "The concrete unfair advantage",
  "adjustedOpportunityScore": ${Math.min(96, Math.max(78, (idea.opportunityScore || 80) + 8))},
  "createdAt": "${new Date().toISOString()}"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are a master business architect who transforms fragile ideas into bulletproof, high-margin cash machines.",
      },
    });

    const improvedVersion = JSON.parse(cleanJsonText(response.text || "{}"));
    res.json({ improvedVersion, isFallback: false });
  } catch (err: any) {
    console.error("Error improving idea:", err);
    res.json({
      improvedVersion: generateFallbackImprovedIdea(idea),
      isFallback: true,
      error: err.message,
    });
  }
});

// 7. Business Model Canvas
app.post("/api/generate-business-model", async (req: Request, res: Response) => {
  const { idea } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      businessModelCanvas: generateFallbackBusinessModel(idea),
      isFallback: true,
    });
  }

  try {
    const prompt = `Generate a comprehensive, actionable Business Model Canvas for:
Idea: ${idea.name} (${idea.tagline})
Target Customer: ${idea.targetCustomer}
Problem: ${idea.problem}
Solution: ${idea.solution}

Return JSON matching:
{
  "customerSegments": ["Primary segment", "Secondary expansion segment"],
  "valuePropositions": ["Core quantifiable promise", "Speed/cost advantage"],
  "revenueStreams": ["Primary MRR tier", "Add-on setup or usage fee", "Enterprise tier"],
  "pricingStrategy": "Clear pricing mechanics and ROI anchor explanation",
  "distributionChannels": ["Direct cold outreach", "Niche community partnerships", "SEO wedge"],
  "keyActivities": ["Automated data extraction", "Customer onboarding concierges", "Weekly model retraining"],
  "keyResources": ["Proprietary prompt pipeline", "Domain dataset", "Founder credibility"],
  "costStructure": ["LLM API compute", "Cloud hosting", "Stripe processing fees", "Outreach software"],
  "unfairAdvantage": "What competitors cannot easily buy or copy",
  "createdAt": "${new Date().toISOString()}"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are a startup business model architect. Provide a high-velocity, realistic business model canvas in JSON.",
      },
    });

    const businessModelCanvas = JSON.parse(cleanJsonText(response.text || "{}"));
    res.json({ businessModelCanvas, isFallback: false });
  } catch (err: any) {
    console.error("Error generating business model:", err);
    res.json({
      businessModelCanvas: generateFallbackBusinessModel(idea),
      isFallback: true,
      error: err.message,
    });
  }
});

// 8. MVP Builder
app.post("/api/generate-mvp", async (req: Request, res: Response) => {
  const { idea } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      mvpBlueprint: generateFallbackMVP(idea),
      isFallback: true,
    });
  }

  try {
    const prompt = `Create an MVP Blueprint for:
Idea: ${idea.name}
Core Promise: ${idea.tagline}
Solution: ${idea.solution}

Differentiate between:
1. BUILD FIRST (Absolute minimum needed to prove value and charge money)
2. BUILD LATER (Valuable features for v1.1 after first 10 paying customers)
3. DON'T BUILD YET (Feature bloat traps that founders waste weeks on)

Return JSON matching:
{
  "buildFirst": [
    { "feature": "Feature 1", "whyCrucial": "Directly delivers the core outcome" },
    { "feature": "Feature 2", "whyCrucial": "Allows user to input data and get instant output" },
    { "feature": "Feature 3", "whyCrucial": "Simple payment link / checkout" }
  ],
  "buildLater": [
    { "feature": "Team roles & permissions", "whenToBuild": "When customer asks for multiple seats" },
    { "feature": "Automated integrations (Zapier/Slack)", "whenToBuild": "After manual workflows prove sticky" }
  ],
  "dontBuildYet": [
    { "trap": "Custom native mobile app", "whyToAvoid": "Web app is 5x faster to iterate and distribute" },
    { "trap": "Complex multi-tenant analytics dashboard", "whyToAvoid": "Customers only care about the core output" }
  ],
  "coreUserFlow": [
    "Step 1: User lands and connects account / submits input",
    "Step 2: Core processing delivers first draft in 30 seconds",
    "Step 3: User approves and exports or publishes"
  ],
  "mvpSuccessMetric": "Specific metric (e.g. 5 paying customers in 14 days, $500 MRR)",
  "recommendedTechStack": ["React + Tailwind", "Node / Express", "Gemini API", "Stripe Checkout"],
  "estimatedBuildTimeWeeks": 2,
  "createdAt": "${new Date().toISOString()}"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are a lean MVP startup engineer. Return a razor-sharp MVP blueprint strictly prioritizing first revenue in JSON.",
      },
    });

    const mvpBlueprint = JSON.parse(cleanJsonText(response.text || "{}"));
    res.json({ mvpBlueprint, isFallback: false });
  } catch (err: any) {
    console.error("Error generating MVP blueprint:", err);
    res.json({
      mvpBlueprint: generateFallbackMVP(idea),
      isFallback: true,
      error: err.message,
    });
  }
});

// 9. 7-Day Action Plan
app.post("/api/generate-action-plan", async (req: Request, res: Response) => {
  const { idea, mvpBlueprint } = req.body;
  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      actionPlan: generateFallbackActionPlan(idea),
      isFallback: true,
    });
  }

  try {
    const prompt = `Generate a realistic, tactical 7-Day Action Plan for this business:
Idea: ${idea.name} (${idea.tagline})
Target ICP: ${idea.targetCustomer}
Problem: ${idea.problem}
MVP Scope: ${mvpBlueprint?.buildFirst?.map((f: any) => f.feature).join(", ") || idea.solution}

Structure days 1 through 7:
Day 1: Define Customer & Offer Crafting
Day 2: Customer Discovery & Problem Verification Interviews
Day 3: Landing Page & Pre-sell Offer Construction
Day 4: Direct Outbound & Cold Traffic Testing
Day 5: Concierge / Manual Delivery with First Beta User
Day 6: Quantitative Feedback & Retention Check
Day 7: Final Decision (BUILD, ITERATE, PIVOT, or ABANDON)

Return JSON matching:
{
  "days": [
    {
      "day": 1,
      "title": "Define Customer & Value Hypothesis",
      "objective": "Clear single goal for the day",
      "tasks": [
        { "id": "d1_t1", "text": "Specific actionable task", "done": false },
        { "id": "d1_t2", "text": "Specific actionable task", "done": false }
      ],
      "deliverable": "1-page ICP profile and value proposition doc",
      "proTip": "Tactical founder advice for execution"
    }
    // Days 2 to 7...
  ],
  "finalDecisionCriteria": {
    "buildSignal": "e.g., 3+ customers paid or committed with letter of intent",
    "iterateSignal": "e.g., High enthusiasm but request for 1 specific tweak",
    "pivotSignal": "e.g., Target ICP won't buy, but adjacent ICP expressed strong interest",
    "abandonSignal": "e.g., 30 ICPs contacted, zero interest in solving the problem"
  },
  "createdAt": "${new Date().toISOString()}"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are a hyper-tactical founder growth coach. Provide a crisp 7-day action sprint in structured JSON.",
      },
    });

    const actionPlan = JSON.parse(cleanJsonText(response.text || "{}"));
    res.json({ actionPlan, isFallback: false });
  } catch (err: any) {
    console.error("Error generating action plan:", err);
    res.json({
      actionPlan: generateFallbackActionPlan(idea),
      isFallback: true,
      error: err.message,
    });
  }
});

// 8. Generate Personas & Simulate Customer Interview
app.post("/api/generate-personas", async (req: Request, res: Response) => {
  const { idea } = req.body;
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ personas: generateFallbackPersonas(idea), isFallback: true });
    }

    const prompt = `You are a user research director. Analyze this startup idea and generate 4 distinct, hyper-realistic customer personas who represent potential buyers:

STARTUP IDEA:
Name: ${idea?.name}
Tagline: ${idea?.tagline}
Target Customer: ${idea?.targetCustomer}
Problem: ${idea?.problem}
Solution: ${idea?.solution}
Business Model: ${idea?.businessModel}

Generate exactly 4 diverse personas matching these exact dispositions:
1. "Skeptical & Analytical" (Senior decision-maker, cares about ROI proof and compliance)
2. "Budget-Conscious & Pragmatic" (Bootstrapped or SMB manager, very price-sensitive)
3. "Early Adopter & Tech-Savvy" (Tech enthusiast, excited by new tools, wants speed and APIs)
4. "Burned-Out & Time-Starved" (Overwhelmed operator, hates long onboarding, wants instant relief)

SCHEMA JSON:
[
  {
    "id": "persona_1",
    "name": "Sarah Chen",
    "role": "VP of Operations",
    "companyType": "Mid-market B2B Logistics (120 employees)",
    "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160",
    "disposition": "Skeptical & Analytical",
    "corePain": "Spends 15 hours/week auditing manual reconciliation errors.",
    "currentWorkaround": "Custom Excel macros + 2 junior offshore contractors.",
    "budgetAuthority": "$1,000 - $5,000 / month without board signoff",
    "mainSkepticism": "Worried about security leaks and high learning curve for her team."
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are an elite customer discovery researcher. Return 4 distinct buyer personas in pure JSON.",
      },
    });

    const personas = JSON.parse(cleanJsonText(response.text || "[]"));
    res.json({ personas, isFallback: false });
  } catch (err: any) {
    console.error("Error generating personas:", err);
    res.json({
      personas: generateFallbackPersonas(idea),
      isFallback: true,
      error: err.message,
    });
  }
});

app.post("/api/simulate-interview-reply", async (req: Request, res: Response) => {
  const { idea, persona, conversationHistory, founderMessage } = req.body;
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ simulation: generateFallbackInterviewReply(persona, founderMessage), isFallback: true });
    }

    const prompt = `You are roleplaying as the prospective buyer: ${persona?.name}, a ${persona?.role} at ${persona?.companyType}.
Your personality and disposition: ${persona?.disposition}.
Your core pain point: ${persona?.corePain}.
Your current workaround: ${persona?.currentWorkaround}.
Your budget authority: ${persona?.budgetAuthority}.
Your chief skepticism: ${persona?.mainSkepticism}.

STARTUP BEING PITCHED TO YOU:
Product Name: ${idea?.name}
Tagline: ${idea?.tagline}
Solution: ${idea?.solution}
Pricing / Model: ${idea?.businessModel}

CONVERSATION HISTORY:
${conversationHistory?.map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`).join("\n") || "No prior messages."}

FOUNDER JUST SAID:
"${founderMessage}"

Respond in-character naturally, realistically, and constructively. Do not be overly sycophantic. If the pitch sounds vague, call it out. If pricing is too steep or unclear, push back. If the founder makes a great point, acknowledge it. Keep response to 2-4 sentences max.

Also compute:
1. sentiment: "positive" | "neutral" | "skeptical" | "critical"
2. buyIntentScore: number between 0 and 100 (how likely this persona is to pay for this today based on the conversation so far)
3. keyTakeaway: 1 short sentence note for the founder's discovery log.

SCHEMA JSON:
{
  "reply": "In-character reply...",
  "sentiment": "skeptical",
  "buyIntentScore": 42,
  "keyTakeaway": "Needs concrete evidence of integration with their existing ERP before committing."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: `You are roleplaying as ${persona?.name || "a buyer"}. Stay authentic, realistic, and insightful. Return structured JSON.`,
      },
    });

    const simulation = JSON.parse(cleanJsonText(response.text || "{}"));
    res.json({ simulation, isFallback: false });
  } catch (err: any) {
    console.error("Error simulating interview reply:", err);
    res.json({
      simulation: generateFallbackInterviewReply(persona, founderMessage),
      isFallback: true,
      error: err.message,
    });
  }
});

// 9. Generate Financial Model & Unit Economics (TAM/SAM/SOM + Breakeven)
app.post("/api/generate-financials", async (req: Request, res: Response) => {
  const { idea } = req.body;
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ financialModel: generateFallbackFinancials(idea), isFallback: true });
    }

    const prompt = `You are a Principal at an elite Venture Capital firm and financial analyst. Calculate precise, mathematically sound TAM/SAM/SOM market sizing, unit economics, breakeven thresholds, and a 24-month revenue trajectory for this startup:

STARTUP IDEA:
Name: ${idea?.name}
Tagline: ${idea?.tagline}
Target Customer: ${idea?.targetCustomer}
Problem: ${idea?.problem}
Solution: ${idea?.solution}
Business Model: ${idea?.businessModel}
Startup Cost Level: ${idea?.startupCost}

Calculate the following rigorously:
1. TAM (Total Addressable Market): Total theoretical global market demand in USD.
2. SAM (Serviceable Available Market): Realistic geographical & segment portion reachable.
3. SOM (Serviceable Obtainable Market): Target captured share in Year 1-3.
4. Unit Economics: Recommended monthly subscription/transaction price, gross margin %, realistic blended Customer Acquisition Cost (CAC), monthly churn rate %, estimated Lifetime Value (LTV), LTV:CAC ratio, and CAC payback period (months).
5. Breakeven: Estimated lean monthly fixed operational burn rate ($), list of 4 key expense items, and exact customer count and Monthly Recurring Revenue (MRR) needed to hit cash-flow breakeven.
6. 24-Month Projections: Month 6, 12, and 24 benchmarks.
7. Venture Verdict: Viability score (0-100), top economic strengths, critical margin risks, and pricing optimization advice.

SCHEMA JSON:
{
  "tam": {
    "totalUnits": 500000,
    "unitLabel": "Mid-market B2B Agencies",
    "annualPricePerUnit": 1200,
    "totalValueUsd": 600000000,
    "rationale": "500k global digital agencies spending an average of $1,200/yr on workflow automation."
  },
  "sam": {
    "segmentPercentage": 25,
    "totalUnits": 125000,
    "totalValueUsd": 150000000,
    "rationale": "English-speaking markets (US, UK, CA, AU) with team sizes between 5-50 people."
  },
  "som": {
    "targetSharePercentage": 1.5,
    "totalUnits": 1875,
    "totalValueUsd": 2250000,
    "rationale": "Capturing 1.5% of SAM in Year 1-2 via targeted outbound & community marketing."
  },
  "unitEconomics": {
    "monthlyPrice": 99,
    "grossMarginPercent": 82,
    "estimatedCac": 220,
    "monthlyChurnPercent": 3.5,
    "costPerServiceDelivery": 18,
    "lifetimeMonths": 28,
    "estimatedLtv": 2270,
    "ltvCacRatio": 10.3,
    "cacPaybackMonths": 2.7
  },
  "breakeven": {
    "monthlyFixedCosts": 3500,
    "costItems": [
      { "category": "AI API & Cloud Hosting", "amount": 600 },
      { "category": "Core Software & Tooling", "amount": 400 },
      { "category": "Growth & Ad Experiments", "amount": 1500 },
      { "category": "Legal, Admin & Support", "amount": 1000 }
    ],
    "customersNeeded": 43,
    "mrrNeeded": 4257,
    "targetRunwayMonths": 6
  },
  "projections": {
    "month6": { "customers": 25, "mrr": 2475, "netProfit": -1025 },
    "month12": { "customers": 80, "mrr": 7920, "netProfit": 4420 },
    "month24": { "customers": 320, "mrr": 31680, "netProfit": 22400 }
  },
  "ventureVerdict": {
    "viabilityScore": 86,
    "strengths": [
      "High gross margins (>80%) typical of software automation",
      "Short CAC payback window (<3 months) allows fast reinvestment in growth"
    ],
    "riskFactors": [
      "Customer churn risk if initial onboarding time-to-value exceeds 48 hours",
      "API usage cost scaling if compute per customer is unbounded"
    ],
    "pricingRecommendation": "Introduce a tiered annual prepay discount (2 months free) to drive upfront cash flow."
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are a financial modeler and venture capital partner. Provide mathematically coherent unit economics and market sizing in pure JSON.",
      },
    });

    const financialModel = JSON.parse(cleanJsonText(response.text || "{}"));
    res.json({ financialModel, isFallback: false });
  } catch (err: any) {
    console.error("Error generating financial model:", err);
    res.json({
      financialModel: generateFallbackFinancials(idea),
      isFallback: true,
      error: err.message,
    });
  }
});

// 10. Generate Launch Kit (Landing Page Copy, Cold Email Sequence, Ad Hooks)
app.post("/api/generate-launch-kit", async (req: Request, res: Response) => {
  const { idea } = req.body;
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ launchKit: generateFallbackLaunchKit(idea), isFallback: true });
    }

    const prompt = `You are a world-class startup copywriter, growth marketer, and Y-Combinator launch advisor.
Create a complete, high-converting Launch Kit for this startup idea:

STARTUP IDEA:
Name: ${idea?.name}
Tagline: ${idea?.tagline}
Target Customer: ${idea?.targetCustomer}
Problem: ${idea?.problem}
Solution: ${idea?.solution}
Business Model: ${idea?.businessModel}
Why Now: ${idea?.whyNow}

Generate a comprehensive Launch Kit with:
1. High-Converting Landing Page Hero Copy (Punchy headline, compelling subheadline, action-oriented primary & secondary CTAs, trust/social proof badge).
2. 3 Core Value Pillars (Outcome-driven title, explanation, and quantified metric impact).
3. 4 Feature Cards (Title, clear benefit, technical/workflow detail).
4. 4 Objection-Busting FAQs (Direct address of skepticisms, pricing, migration, security).
5. 3-Step Cold Email Outbound Sequence for securing the first 10 beta/paying customers:
   - Step 1: Specific Pain Hook + Soft 15-min Feedback Ask.
   - Step 2: Proof & Architecture / Early Metrics.
   - Step 3: Direct Pilot Invitation with Free VIP Onboarding.
6. 3 Social & Direct Outreach DMs (LinkedIn, Twitter/X, Discord/Slack communities).
7. 3 Paid Ad Copy Hooks (Meta/Instagram, Google Search, LinkedIn B2B).

Format MUST be valid JSON matching this exact structure:
{
  "heroSection": {
    "headline": "Automate Client Onboarding Without The Chaotic Email Chains",
    "subheadline": "The single command center that collects assets, signs NDAs, and syncs project trackers in 10 minutes instead of 3 days.",
    "primaryCtaText": "Claim Free Beta Access",
    "secondaryCtaText": "Watch 2-Min Interactive Demo",
    "socialProofBadge": "Trusted by 140+ boutique agency founders"
  },
  "valuePillars": [
    {
      "title": "Zero-Friction Client Portal",
      "description": "Clients upload files and sign docs without needing yet another account password.",
      "highlightMetric": "85% faster onboarding completion"
    },
    {
      "title": "Automated Progress Chasing",
      "description": "Smart AI nudges remind stakeholders gently before deadlines are missed.",
      "highlightMetric": "14 hours saved per account manager weekly"
    },
    {
      "title": "Bi-Directional Tool Sync",
      "description": "Instantly routes client deliverables into Notion, Asana, Slack, and Google Drive.",
      "highlightMetric": "1-click instant integration"
    }
  ],
  "featureCards": [
    {
      "title": "Smart Asset Checklist",
      "benefit": "Eliminates missing file back-and-forth",
      "detail": "Dynamic forms validate file formats, resolutions, and access rights instantly upon upload."
    },
    {
      "title": "White-Label Brand Experience",
      "benefit": "Make your agency look like a Fortune 500 powerhouse",
      "detail": "Custom domains, client logos, and brand color palettes applied automatically."
    },
    {
      "title": "Automated Escalation Triggers",
      "benefit": "Never lose momentum on signed deals",
      "detail": "Configurable reminders via SMS, WhatsApp, or email if deliverables stall past 48 hours."
    },
    {
      "title": "SOC-2 Ready File Encryption",
      "benefit": "Enterprise-grade trust from day one",
      "detail": "End-to-end encrypted file pipelines with granular role-based client permissions."
    }
  ],
  "objectionFaqs": [
    {
      "question": "How is this different from tools like HoneyBook or Notion?",
      "answer": "Generic tools require manual setup for each client and still rely on endless manual reminder emails. We automate the entire intake workflow specifically for agency handoffs in one dedicated flow."
    },
    {
      "question": "Will my clients actually use this without training?",
      "answer": "Yes. Clients receive a personalized magic link that opens directly to their checklist without creating accounts or downloading apps. Completion rates average over 92%."
    },
    {
      "question": "How long does it take to integrate with our current stack?",
      "answer": "Under 5 minutes. Connect your Google Drive, Slack, and project manager with our native 1-click authenticators."
    },
    {
      "question": "What happens after the beta period ends?",
      "answer": "Beta partners lock in a lifetime 50% discount on all future tiers, with free VIP migration support forever."
    }
  ],
  "coldEmailSequence": [
    {
      "step": 1,
      "name": "The Pain-Point Probe",
      "timing": "Day 1",
      "subjectLine": "Quick question regarding {{Company}} client intake bottleneck?",
      "previewText": "Saw your recent agency case study...",
      "bodyText": "Hi {{FirstName}},\n\nSaw {{Company}}'s recent launch on LinkedIn—congrats on the rapid client growth!\n\nQuick question: Are your account leads still losing 8-10 hours a week chasing client assets, passwords, and signed NDAs over email?\n\nWe built a lightweight client intake portal specifically for growing agencies that cuts kickoff lag from 4 days to under 15 minutes.\n\nWould you be open to a 7-minute peek this Thursday, or should I send a 60-second Loom demo?",
      "callToAction": "Would Thursday at 2pm or Friday at 10am work better for a quick 7-minute look?"
    },
    {
      "step": 2,
      "name": "The Benchmark Proof",
      "timing": "Day 3 (Follow-up)",
      "subjectLine": "How similar agency cut intake lag by 85%",
      "previewText": "Quick follow-up on client onboarding...",
      "bodyText": "Hi {{FirstName}},\n\nWanted to share a quick benchmark: Another 20-person creative agency was losing ~14 hours per client kickoff to email back-and-forth.\n\nAfter setting up our 1-link intake portal, 92% of their clients uploaded every required asset within 24 hours of contract signing.\n\nI put together a customized intake template for {{Company}} based on your service offerings. Want me to send over the link?",
      "callToAction": "Reply 'yes' and I'll send your tailored interactive portal preview."
    },
    {
      "step": 3,
      "name": "The VIP Pilot Offer",
      "timing": "Day 7 (Final Breakup)",
      "subjectLine": "Permission to close your file, {{FirstName}}?",
      "previewText": "Last note regarding your client onboarding portal...",
      "bodyText": "Hi {{FirstName}},\n\nI know you're super busy scaling {{Company}}, so I won't keep following up.\n\nWe are accepting 5 more agencies into our Q3 Founder Pilot (includes custom white-label setup + free team onboarding).\n\nIf eliminating kickoff friction isn't a priority right now, no worries at all! If it is, here's a link to test drive the live portal directly with zero signup:\n\n[Interactive Demo Link]",
      "callToAction": "Grab one of the remaining pilot spots here or let me know if you'd like to reconnect next quarter."
    }
  ],
  "socialOutreachDms": [
    {
      "platform": "LinkedIn",
      "targetRecipient": "Founder / Managing Director",
      "messageText": "Hey {{FirstName}}, noticed you're scaling the team at {{Company}}. Are you finding that client onboarding lag is becoming a bottleneck as deal volume grows? We built a zero-login intake system for agencies that cuts kickoff friction by 80%. Would love your feedback on our beta if you're open to taking a quick look!"
    },
    {
      "platform": "Twitter/X",
      "targetRecipient": "Agency Owner / Indie Founder",
      "messageText": "Loved your thread on scaling operations, {{FirstName}}! We're building a tool to eliminate client asset chasing for teams like {{Company}}. Would love to gift you a free lifetime beta account in exchange for 5 mins of brutal feedback."
    },
    {
      "platform": "Slack/Discord",
      "targetRecipient": "Community Member / Operator",
      "messageText": "Hey everyone! 👋 Built a quick tool that automates client onboarding checklists so account managers stop spending their Mondays chasing missing logos and passwords. Free access for community members here: [Link]"
    }
  ],
  "adHooks": [
    {
      "platform": "Meta / Instagram",
      "headline": "Stop Chasing Clients For Files Over Email.",
      "primaryText": "Send one magic link. Get signed docs, brand assets, and questionnaire answers in 15 minutes. Try the 1-click intake portal built for modern agencies.",
      "targetAudience": "Interests: Digital Agency, Creative Director, Marketing Agency, SaaS Tools"
    },
    {
      "platform": "Google Search",
      "headline": "Automate Client Onboarding | 1-Click Agency Intake Portal",
      "primaryText": "Eliminate 10+ hours of weekly email tag. Magic link client checklists that sync directly with Google Drive & Notion. Start free trial today.",
      "targetAudience": "Keywords: [client onboarding software], [agency intake workflow], [client asset portal]"
    },
    {
      "platform": "LinkedIn B2B",
      "headline": "How Top Agencies Cut Kickoff Lag From 4 Days to 15 Minutes",
      "primaryText": "Top account managers don't send 12 emails to onboard one new client. See how automated magic-link portals increase client NPS and save 14 hours every single week.",
      "targetAudience": "Job Titles: VP Client Services, Agency Founder, Head of Operations"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction: "You are a master conversion copywriter and B2B growth strategist. Generate pristine, high-converting Launch Kits in pure JSON.",
      },
    });

    const launchKit = JSON.parse(cleanJsonText(response.text || "{}"));
    res.json({ launchKit, isFallback: false });
  } catch (err: any) {
    console.error("Error generating launch kit:", err);
    res.json({
      launchKit: generateFallbackLaunchKit(idea),
      isFallback: true,
      error: err.message,
    });
  }
});


// Fallback Generators (Ensures 100% resilience with high variety and intelligent adaptation)
function generateCustomFallbackIdea(customIdeaInput: any, profile: any): any {
  let userTitle = "";
  let userDesc = "";
  let userTarget = "";
  let userMonetization = "";

  if (typeof customIdeaInput === "object" && customIdeaInput !== null) {
    userTitle = customIdeaInput.name ? String(customIdeaInput.name).trim() : "";
    userDesc = customIdeaInput.description || customIdeaInput.problem || "";
    userTarget = customIdeaInput.targetCustomer || "";
    userMonetization = customIdeaInput.monetization || "";
  } else if (typeof customIdeaInput === "string") {
    try {
      const parsed = JSON.parse(customIdeaInput);
      userTitle = parsed.name ? String(parsed.name).trim() : "";
      userDesc = parsed.description || parsed.problem || customIdeaInput;
      userTarget = parsed.targetCustomer || "";
      userMonetization = parsed.monetization || "";
    } catch {
      userDesc = customIdeaInput;
    }
  }

  const cleanDesc = (userDesc || "B2B Workflow Automation").trim();
  const words = cleanDesc.split(/\s+/).filter(Boolean);
  const fallbackTitle = userTitle || (words.slice(0, 3).join(" ") ? `${words.slice(0, 3).join(" ")} System` : "Venture Engine");

  return {
    id: `custom_idea_${Date.now()}`,
    name: userTitle || fallbackTitle,
    tagline: `Modern automated workflow and intelligence platform for ${userTitle || words.slice(0, 3).join(" ")}`,
    description: cleanDesc.length > 20 
      ? cleanDesc 
      : `A purpose-built solution that operationalizes "${cleanDesc}". It eliminates manual friction, automates key stakeholder communication, and delivers clear quantifiable ROI.`,
    targetCustomer: userTarget || `Specialized business operators, founders, and teams experiencing acute friction`,
    problem: cleanDesc,
    solution: `An autonomous, self-serve platform providing instant onboarding, automated workflows, and continuous performance tracking.`,
    businessModel: userMonetization || "$79 - $249/mo SaaS tier + optional usage-based expansion",
    startupCost: "LOW",
    executionDifficulty: "MEDIUM",
    whyNow: "Emerging API capabilities and heightened customer appetite for focused micro-tools make this buildable in under 14 days.",
    primaryRisk: "Customer distribution velocity and initial retention stickiness",
    firstValidationStep: "Run a 48-hour cold outreach experiment to 30 target buyers with a simple 1-page interactive demo",
    opportunityScore: 87,
    scoreBreakdown: {
      marketDemand: 88,
      customerPain: 91,
      monetization: 86,
      competition: 74,
      differentiation: 84,
      execution: 82,
      founderFit: 90,
    },
    status: "EXPLORING",
    savedAt: new Date().toISOString(),
  };
}

function generateFallbackIdeas(profile: any, mode: string, customPrompt?: string): any[] {
  const masterPool = [
    {
      name: "RevFlow AI",
      tagline: "Autonomous B2B invoice collection & payment dispute resolver",
      description: "An AI-powered cash flow assistant that connects to QuickBooks/Xero, drafts polite dynamic payment reminders, and resolves billing discrepancies before they turn into delinquent debt.",
      targetCustomer: "B2B agencies, consultancies, and SaaS companies doing $20k-$200k MRR",
      problem: "Founders waste 8+ hours a week chasing unpaid invoices, and 12% of accounts receivable slip past 60 days overdue.",
      solution: "Smart automated follow-up sequences that negotiate payment plans and reconcile bank transactions autonomously.",
      businessModel: "$79/mo base + 0.5% recovered overdue collections",
      startupCost: "LOW",
      executionDifficulty: "MEDIUM",
      whyNow: "LLMs now possess the nuanced conversational tact to negotiate financial payments without harming customer relationships.",
      primaryRisk: "Customer trust regarding automated financial messaging",
      firstValidationStep: "Manually run invoice recovery for 3 agency friends and take a 10% cut of collected funds",
      opportunityScore: 88,
      scoreBreakdown: { marketDemand: 91, customerPain: 94, monetization: 89, competition: 72, differentiation: 84, execution: 78, founderFit: 92 },
    },
    {
      name: "ContractPulse",
      tagline: "Instant vendor agreement audit & auto-renewal alert engine for mid-market CFOs",
      description: "Monitors PDF vendor contracts and SaaS agreements, extracting sneaky auto-renewal clauses, price hikes, and liability traps in 10 seconds.",
      targetCustomer: "VPs of Finance and bootstrapped founders managing 20+ software licenses",
      problem: "Companies waste $40,000+ annually on software subscriptions they forgot to cancel before the 30-day renewal notice window.",
      solution: "Drag-and-drop contract scanner that syncs cancellation deadlines directly to Google Calendar and Slack.",
      businessModel: "$149/mo flat or $29 per contract audit",
      startupCost: "LOW",
      executionDifficulty: "LOW",
      whyNow: "OCR and vision-language models can parse complex 40-page legal PDFs flawlessly in under 5 seconds.",
      primaryRisk: "Incumbents like Ironclad building lightweight alerts",
      firstValidationStep: "Create a simple landing page offering a free 3-contract audit to 20 CFOs on LinkedIn",
      opportunityScore: 84,
      scoreBreakdown: { marketDemand: 85, customerPain: 88, monetization: 86, competition: 74, differentiation: 79, execution: 85, founderFit: 89 },
    },
    {
      name: "ClinicSync AI",
      tagline: "Voice-to-EHR clinical charting for independent dental & physical therapy clinics",
      description: "Ambient listening iPad tool that transcribes patient consultations into structured medical codes and compliant clinical notes in real time.",
      targetCustomer: "Private practice physical therapists, chiropractors, and dental specialists",
      problem: "Practitioners spend 2 hours every evening typing clinical notes instead of seeing patients or resting.",
      solution: "Hands-free ambient scribe tailored for specialized diagnostic vocabularies with 1-click EHR export.",
      businessModel: "$199/month per practitioner seat",
      startupCost: "MEDIUM",
      executionDifficulty: "HIGH",
      whyNow: "Whisper and Gemini models achieve near-perfect domain transcription accuracy in noisy clinical environments.",
      primaryRisk: "HIPAA compliance hurdles and EHR integration lock-in",
      firstValidationStep: "Shadow 2 physical therapist clinics with a prototype test on an iPad",
      opportunityScore: 81,
      scoreBreakdown: { marketDemand: 89, customerPain: 95, monetization: 90, competition: 65, differentiation: 76, execution: 62, founderFit: 84 },
    },
    {
      name: "SpecCraft Engine",
      tagline: "Turn messy Loom videos and Slack threads into ready-to-code Jira user stories",
      description: "Product management AI copilot that ingests customer call transcripts, design files, and team chats to generate crisp user stories with acceptance criteria.",
      targetCustomer: "Overwhelmed Solo Tech Founders and Lead Engineers managing offshore teams",
      problem: "Engineers waste 30% of their sprint asking clarifying questions because PRDs and user stories are vague.",
      solution: "1-click specification generator that outputs Gherkin-syntax user stories and edge cases.",
      businessModel: "$39/mo per developer / PM seat",
      startupCost: "LOW",
      executionDifficulty: "LOW",
      whyNow: "Modern LLMs excel at translating unstructured human conversations into strict engineering schema.",
      primaryRisk: "Low barrier to entry / copycat tools",
      firstValidationStep: "Post a free Loom-to-Jira converter tool on ProductHunt and Twitter/X",
      opportunityScore: 86,
      scoreBreakdown: { marketDemand: 87, customerPain: 84, monetization: 81, competition: 80, differentiation: 82, execution: 92, founderFit: 94 },
    },
    {
      name: "LocalLeadRadar",
      tagline: "Predictive permit & license scraping for commercial contractors and trades",
      description: "Scrapes municipal building permits and commercial renovation filings to notify local HVAC, electrical, and roofing contractors 30 days before work begins.",
      targetCustomer: "Commercial subcontractors, trades, and facility service providers",
      problem: "Tradespeople rely on word-of-mouth or pay extortionate fees to lead brokers for stale leads.",
      solution: "Daily SMS alert of high-value approved building permits in their zip code with owner contact info.",
      businessModel: "$299/mo per territory (exclusive zip codes)",
      startupCost: "LOW",
      executionDifficulty: "MEDIUM",
      whyNow: "Municipal open-data portals are standardized and AI can parse unstructured permit records instantly.",
      primaryRisk: "Varying data quality across city governments",
      firstValidationStep: "Manually scrape 1 city's weekly permits and sell the list for $50 to 3 local contractors",
      opportunityScore: 90,
      scoreBreakdown: { marketDemand: 93, customerPain: 92, monetization: 95, competition: 82, differentiation: 88, execution: 84, founderFit: 90 },
    },
    {
      name: "SubScribeShield",
      tagline: "Chargeback defense & dispute evidence pack generator for Stripe merchants",
      description: "Automatically pulls customer IP logs, delivery tracking, and terms-of-service acceptance screenshots to submit win-rate-optimized chargeback dispute packages.",
      targetCustomer: "Shopify store owners, digital course creators, and SaaS founders losing 2%+ GMV to disputes",
      problem: "Merchants lose 70% of dispute claims simply because manual PDF evidence takes 45 minutes per chargeback to compile.",
      solution: "Instant 1-click evidence generator that hooks into Stripe webhooks and wins 65%+ of dispute resolutions.",
      businessModel: "$49/mo + 15% success fee on won dispute chargebacks",
      startupCost: "LOW",
      executionDifficulty: "LOW",
      whyNow: "Payment gateways now have direct API endpoints for programmatic PDF dispute submissions.",
      primaryRisk: "Platform reliance on Stripe/PayPal API changes",
      firstValidationStep: "Gather 5 e-commerce founders and win 3 disputes for them manually",
      opportunityScore: 89,
      scoreBreakdown: { marketDemand: 92, customerPain: 96, monetization: 94, competition: 75, differentiation: 85, execution: 88, founderFit: 91 },
    },
    {
      name: "PropIQ Appraisal",
      tagline: "Automated zoning & permit feasibility checks for residential real estate wholesalers",
      description: "Instantly cross-references county tax assessor files, flood zones, and GIS maps to calculate maximum allowable offer (MAO) in under 60 seconds.",
      targetCustomer: "Independent real estate investors, wholesalers, and hard-money lenders",
      problem: "Wholesalers spend 3+ hours per property verifying deed history and setback requirements before making an offer.",
      solution: "Address-to-deal-packet generator providing instant zoning classification and rehab cost estimation.",
      businessModel: "$99/mo for 50 lookups + $2 per additional address report",
      startupCost: "LOW",
      executionDifficulty: "MEDIUM",
      whyNow: "Public GIS and county property records have achieved widespread open API standardization.",
      primaryRisk: "Inconsistent zoning terminology across rural counties",
      firstValidationStep: "Post in 3 real estate Facebook groups offering free deal audits",
      opportunityScore: 87,
      scoreBreakdown: { marketDemand: 88, customerPain: 91, monetization: 93, competition: 76, differentiation: 81, execution: 83, founderFit: 88 },
    },
    {
      name: "StaffLoop AI",
      tagline: "Instant bilingual onboarding & compliance trainer for restaurant and hospitality workers",
      description: "Converts kitchen safety SOPs and food handler manuals into interactive 90-second WhatsApp quizzes in Spanish, Mandarin, and English with manager proof of completion.",
      targetCustomer: "Multi-location restaurant franchise operators and hospitality general managers",
      problem: "Hospitality turnover is 75%+, and managers spend 10+ hours a week repeating the exact same training and OSHA checkoffs.",
      solution: "SMS/WhatsApp conversational trainer that verifies employee understanding and exports signed compliance records.",
      businessModel: "$129/mo per restaurant location",
      startupCost: "LOW",
      executionDifficulty: "LOW",
      whyNow: "WhatsApp Business API + multilingual LLMs enable zero-app-download onboarding for frontline staff.",
      primaryRisk: "Restaurant manager adoption friction",
      firstValidationStep: "Interview 3 local restaurant owners and build a WhatsApp quiz for their line cooks",
      opportunityScore: 85,
      scoreBreakdown: { marketDemand: 86, customerPain: 94, monetization: 88, competition: 70, differentiation: 84, execution: 89, founderFit: 86 },
    },
    {
      name: "API Sentinel",
      tagline: "Breaking change & deprecation alerts for production third-party developer APIs",
      description: "Monitors vendor changelogs, GitHub releases, and dev docs for Stripe, OpenAI, Twilio, and Shopify to alert engineering teams 30 days before breaking changes take down production.",
      targetCustomer: "CTOs and Lead Engineers at Series A/B tech companies with 15+ external dependencies",
      problem: "Silent API deprecations cost engineering teams emergency weekend outages and unplanned technical debt.",
      solution: "Automated changelog diffing engine that tags affected repositories and opens draft pull requests.",
      businessModel: "$89/mo for up to 20 monitored vendor APIs",
      startupCost: "LOW",
      executionDifficulty: "LOW",
      whyNow: "AI web monitoring can parse unstructured markdown changelogs with 99.9% accuracy.",
      primaryRisk: "Developers setting and forgetting RSS feeds instead",
      firstValidationStep: "Launch a free weekly 'Major API Deprecations' newsletter on Hacker News",
      opportunityScore: 83,
      scoreBreakdown: { marketDemand: 84, customerPain: 85, monetization: 82, competition: 85, differentiation: 80, execution: 94, founderFit: 95 },
    },
    {
      name: "AuditMate Fleet",
      tagline: "Automated DOT driver log audit & hours-of-service violation detector for small trucking fleets",
      description: "Scans ELD driver logs and fuel receipts to identify hours-of-service compliance violations before state troopers issue $5,000+ fines during roadside inspections.",
      targetCustomer: "Independent trucking fleet owners operating 5 to 30 commercial trucks",
      problem: "Small fleet owners face suspension and heavy penalties because manual compliance audits take 15 hours a week.",
      solution: "Drag-and-drop log auditor that flags high-risk drivers and formats audit-ready DOT reports in 10 seconds.",
      businessModel: "$25/month per active commercial truck",
      startupCost: "LOW",
      executionDifficulty: "MEDIUM",
      whyNow: "Electronic Logging Device (ELD) mandate standardizes all telematics data across fleets.",
      primaryRisk: "Telematics provider API lock-in",
      firstValidationStep: "Contact 10 local freight dispatchers on LinkedIn and audit their last 3 driver logs for free",
      opportunityScore: 91,
      scoreBreakdown: { marketDemand: 94, customerPain: 97, monetization: 92, competition: 78, differentiation: 87, execution: 84, founderFit: 88 },
    }
  ];

  // If user provided a custom prompt, dynamically generate one custom tailored idea on top!
  let pool = [...masterPool];
  if (customPrompt && customPrompt.trim().length > 3) {
    const customDynamic = generateCustomFallbackIdea(customPrompt, profile);
    pool = [customDynamic, ...pool.filter(p => p.name !== customDynamic.name)];
  }

  // Shuffle based on current timestamp seed so it's always different!
  const shuffled = pool.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);

  return selected.map((item, idx) => ({
    ...item,
    id: `idea_${Date.now()}_${idx}_${Math.floor(Math.random() * 1000)}`,
    status: "EXPLORING",
    savedAt: new Date().toISOString(),
  }));
}

function generateFallbackValidationReport(idea: any): any {
  return {
    executiveSummary: `The market for ${idea.name} exhibits severe, quantifiable customer pain with immediate budget authority. Monetization via ${idea.businessModel} provides a high LTV/CAC ratio, but success hinges strictly on establishing an organic, low-cost distribution channel.`,
    targetCustomerDetail: `High-intent B2B decision makers who lose tangible revenue or billable hours daily to this specific bottleneck. They have discretion on software purchases under $500/mo without procurement committee sign-off.`,
    problemDepth: "Tier-1 'Hair on Fire' operational friction. Customers are currently duct-taping spreadsheets, manual labor, and fragmented SaaS tools.",
    customerPainScore: 91,
    solutionViability: "Highly viable as a modern cloud application. Initial core wedge can be delivered in under 2 weeks using modern APIs and rapid scaffolding.",
    marketOpportunity: {
      tamSamSom: "TAM: $4.2B Global Market | SAM: $680M English-speaking Mid-Market | SOM: $12M Realistic 3-Year Beachhead",
      tailwinds: [
        "Accelerating demand for lean operational efficiency",
        "Willingness of SMBs and mid-market teams to adopt specialized micro-SaaS",
        "API commoditization lowering foundational infrastructure costs",
      ],
      demandSignals: [
        "Active forum and Reddit queries requesting workflow automation",
        "High CPC on Google Search for related search terms",
        "Existing incumbent reviews highlighting poor UX and slow support",
      ],
    },
    competitionLandscape: "Fragmented incumbents with bloated enterprise features, leaving a clear void for an agile, purpose-built product.",
    differentiationEdge: "10x faster time-to-value, zero complex onboarding, and specialized domain-tuned intelligence.",
    monetizationStrategy: "SaaS subscription with tiered usage or seat volume, plus annual upfront discount to accelerate early cash flow.",
    pricingModel: {
      tier1: "Starter: $49/mo (Up to 500 actions/mo, core features)",
      tier2: "Growth / Pro: $149/mo (Unlimited actions, prioritized speed, team access)",
      rationale: "Positioned well beneath the $500 credit-card approval ceiling, delivering an estimated 10x ROI in saved labor hours.",
    },
    customerAcquisition: [
      "Direct personalized cold email & LinkedIn outreach to 50 targeted prospects weekly",
      "Free interactive ROI calculator / free audit tool as lead magnet",
      "Strategic partnerships with complementary service agencies and consultants",
    ],
    startupRequirements: {
      capitalNeeded: "$250 - $1,000 for domain, hosting, and outreach tooling",
      techStack: ["React", "Tailwind CSS", "Node / Express", "Stripe Checkout"],
      timeToLaunch: "10 - 14 Days to First Beta User",
    },
    keyRisks: [
      "Retention drop-off if user onboarding requires manual configuration",
      "Platform dependency on upstream data providers",
      "Reaching sufficient outbound reply velocity in month 1",
    ],
    validationExperiments: [
      {
        experiment: "Targeted LinkedIn outreach with a 3-sentence pain proposition to 40 prospects",
        successMetric: "At least 6 replies requesting a demo or beta access (15% reply rate)",
        timeframe: "48 - 72 Hours",
      },
      {
        experiment: "Pre-sell concierge audit delivering the outcome manually for $99",
        successMetric: "3 paying customers before writing a single line of backend code",
        timeframe: "7 Days",
      },
    ],
    recommendation: "PURSUE",
    recommendationRationale: "Strong unit economics, immediate founder fit, high pain intensity, and minimal upfront capital expenditure.",
    confidenceLevel: "HIGH",
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackCompetitors(idea: any): any[] {
  return [
    {
      name: "Legacy Incumbent Systems",
      websiteUrl: "https://www.oracle.com",
      marketCategory: "Legacy Incumbent",
      fundingOrScale: "Public Enterprise ($50B+)",
      whatTheyDo: "Enterprise-grade monolithic suite with hundreds of complex, high-friction modules.",
      targetAudience: "Fortune 500 procurement teams with 6-month sales cycles.",
      pricing: "$10,000+ annual contracts with mandatory onboarding fees.",
      strengths: ["Brand recognition", "Extensive compliance certifications", "Massive partner network"],
      weaknesses: ["Clunky 2010s UI", "Requires weeks of training", "Overpriced for small teams"],
      differentiationAngle: "Instant self-serve setup with 3-minute time-to-first-value and zero sales calls.",
      verifiedLiveSignal: "Enterprise G2 Category Leader with declining usability ratings",
      sources: [
        { title: "G2 Enterprise Software Review Index", url: "https://www.g2.com" }
      ]
    },
    {
      name: "Generic AI Wrapper Tools",
      websiteUrl: "https://www.producthunt.com",
      marketCategory: "Emerging Challenger",
      fundingOrScale: "Bootstrapped Indie / Seed ($500k)",
      whatTheyDo: "Broad prompt-based tools that try to do everything for everyone without domain context.",
      targetAudience: "Casual consumers and prosumers.",
      pricing: "$20/mo generic subscription.",
      strengths: ["Low price point", "Broad feature surface", "Fast initial buzz"],
      weaknesses: ["Shallow workflows", "High churn", "Hallucinations and lack of domain rules"],
      differentiationAngle: "Deep verticalized workflow automation with verified accuracy guarantees and deterministic logic.",
      verifiedLiveSignal: "Top 5 Product of the Day on Product Hunt (high churn rate reported)",
      sources: [
        { title: "Product Hunt: AI Productivity Category", url: "https://www.producthunt.com" }
      ]
    },
    {
      name: "Manual In-House Spreadsheets & VAs",
      websiteUrl: "https://workspace.google.com/sheets",
      marketCategory: "Adjacent Solution",
      fundingOrScale: "Internal Labor Cost",
      whatTheyDo: "Human virtual assistants or internal employees performing repetitive manual copy-paste tasks.",
      targetAudience: "Small business owners who haven't found software that works reliably.",
      pricing: "$500 - $2,000/mo in human labor and payroll cost.",
      strengths: ["Flexible to arbitrary requests", "Zero new software to buy"],
      weaknesses: ["Human error", "Slow turnaround times", "Difficult to scale during peaks"],
      differentiationAngle: "95% cost reduction with 24/7 instant turnaround and 100% data consistency.",
      verifiedLiveSignal: "Standard de-facto baseline across 80% of target users",
      sources: [
        { title: "Reddit r/smallbusiness workflow discussions", url: "https://www.reddit.com" }
      ]
    },
  ];
}

function generateFallbackLiveMarketIntelligence(idea: any): any {
  return {
    overallMarketMaturity: "Fragmented",
    threatLevel: "MEDIUM",
    whitespaceOpportunity: "Incumbents are burdened by complex legacy codebases, while lightweight AI wrappers lack deterministic enterprise reliability. The winning wedge is vertical automation with zero setup friction.",
    recentTrends: [
      "Customers aggressively replacing bloated per-seat tools with outcome-based micro-SaaS",
      "Surging search volume on Google & Reddit for specialized AI assistants with native integrations",
      "Shortening buyer decision cycles favoring self-serve credit card checkouts over 30-day demos"
    ],
    searchGroundingSources: [
      { title: "Product Hunt: Trending B2B SaaS & Automation", url: "https://www.producthunt.com" },
      { title: "G2 Category Market Landscape & Buyer Intent", url: "https://www.g2.com" },
      { title: "Crunchbase Live Startup & Venture Signals", url: "https://www.crunchbase.com" }
    ],
    webSearchQueries: [
      `${idea.name} software competitors`,
      `${idea.targetCustomer} tools alternatives`,
      `software solutions for ${idea.problem}`
    ],
    verifiedAt: new Date().toISOString(),
    isGrounded: false,
  };
}

function generateFallbackStressTest(idea: any): any {
  return {
    headline: `Why ${idea.name} might fail: The Distribution Friction & High Churn Trap`,
    failureReasons: [
      {
        title: "The Silent Customer Churn Threat",
        whyItMatters: "If the product solves a one-time project problem rather than an ongoing daily routine, customers will cancel after 60 days once their immediate backlog is cleared.",
        howToMitigate: "Embed persistent monitoring, automated recurring workflows, and proactive reporting that delivers ongoing weekly ROI.",
        severity: "CRITICAL",
      },
      {
        title: "Cold-Start Customer Acquisition Grind",
        whyItMatters: "B2B buyers ignore generic pitches. Without a proprietary lead list or sharp hook, customer acquisition cost (CAC) will exceed lifetime value (LTV).",
        howToMitigate: "Lead with a free, instant micro-audit tool that diagnoses their exact leak before asking for money.",
        severity: "HIGH",
      },
      {
        title: "Feature Replicability by Upstream Platforms",
        whyItMatters: "If upstream platform APIs release a native 1-click button for this, a superficial wrapper gets wiped out overnight.",
        howToMitigate: "Build deep integrations across multiple software silos and capture proprietary proprietary metadata that upstream platforms cannot access.",
        severity: "HIGH",
      },
      {
        title: "Underpricing and High Support Overhead",
        whyItMatters: "Charging $19/mo attracts high-maintenance users who submit 10 support tickets each, resulting in negative net margins.",
        howToMitigate: "Anchor pricing at $79 - $199/mo to filter for serious commercial operators with clear budgets.",
        severity: "MODERATE",
      },
      {
        title: "Founder Scope-Creep Paralysis",
        whyItMatters: "Spending 3 months coding edge-case features before talking to 10 buyers will deplete founder motivation and runway.",
        howToMitigate: "Enforce a strict 7-day build rule: ship only the core wedge feature and sell manually first.",
        severity: "CRITICAL",
      },
    ],
    stressTestResult: "MODERATE",
    overallVerdict: "Viable and highly profitable IF you narrow the niche to a high-budget sub-segment and charge upfront. DO NOT build a broad generic tool.",
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackImprovedIdea(idea: any): any {
  return {
    beforeAfterSummary: `We pivoted ${idea.name} from a broad tool into a hyper-targeted, high-retention cash flow engine with built-in switching costs and 3x higher price tolerance.`,
    changes: [
      {
        field: "Target ICP (Ideal Customer Profile)",
        before: idea.targetCustomer || "General small businesses & agencies",
        after: "High-ticket digital agencies and boutique service firms with 5-25 staff",
        rationale: "They experience immediate cash bleed and have standard $150+/mo software budgets.",
      },
      {
        field: "Core Value Proposition",
        before: idea.tagline || "Automated assistant",
        after: "Guaranteed $3,000+ monthly operational recovery or 100% refund",
        rationale: "Transforms the purchase decision from a cost into an indisputable ROI positive investment.",
      },
      {
        field: "Monetization Model",
        before: "$29 - $49/mo low tier",
        after: "$149/mo base + $499 concierge onboarding setup",
        rationale: "Locks in upfront commitment, weeds out tire-kickers, and funds paid acquisition immediately.",
      },
      {
        field: "Defensibility Moat",
        before: "Standard API prompting",
        after: "Proprietary multi-step audit engine + historical performance benchmark dataset",
        rationale: "Creates insurmountable switching costs and proprietary IP.",
      },
    ],
    improvedValueProposition: `The definitive high-velocity solution for high-ticket service firms to reclaim lost revenue autonomously.`,
    nicheFocus: "Boutique B2B service firms & high-growth agencies",
    defensibilityMoat: "Continuous automated data loop and proprietary ROI benchmarking",
    adjustedOpportunityScore: 92,
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackBusinessModel(idea: any): any {
  return {
    customerSegments: [
      "Boutique digital agency founders & operations managers (5-30 employees)",
      "High-ticket B2B service providers and consultancies",
      "Scaling e-commerce and SaaS operators needing automated audit controls",
    ],
    valuePropositions: [
      "Reclaim 15+ hours of manual labor per team member weekly",
      "Plug financial and operational leaks with zero manual spreadsheets",
      "Instant 5-minute setup with immediate quantifiable ROI",
    ],
    revenueStreams: [
      "Core SaaS Subscription ($99 - $249 / month)",
      "One-time VIP Concierge Setup & Custom Workflow Integration ($499)",
      "Usage-based volume scaling for heavy users ($0.10 per extra transaction/run)",
    ],
    pricingStrategy: "Value-based pricing anchored to 10% of the total monthly dollars saved or recovered.",
    distributionChannels: [
      "Direct personalized cold email sequences to validated Apollo/LinkedIn lead lists",
      "High-value LinkedIn case study posts and teardown breakdowns",
      "Affiliate and revenue-share partnerships with agency operations consultants",
      "Product-led free diagnostic assessment tool",
    ],
    keyActivities: [
      "Core workflow engine optimization and speed improvements",
      "Direct customer onboarding calls and feedback synthesis",
      "Weekly outbound campaign testing and optimization",
    ],
    keyResources: [
      "Proprietary workflow logic & domain-specific prompt engineering",
      "Secure cloud infrastructure and Stripe payment pipeline",
      "Founder sales & engineering execution velocity",
    ],
    costStructure: [
      "Server hosting & database compute (~$40/mo)",
      "LLM API usage (~$0.02 per user action)",
      "Outreach & lead prospecting tooling (~$100/mo)",
      "Stripe processing fee (2.9% + 30¢)",
    ],
    unfairAdvantage: "Hyper-specialized focus on agency workflows with an instant 3-click setup that enterprise suites cannot replicate.",
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackMVP(idea: any): any {
  return {
    buildFirst: [
      {
        feature: "Core 1-Click Assessment & Action Engine",
        whyCrucial: "Delivers the primary transformation immediately without fluff.",
      },
      {
        feature: "Clean Single-Page Result Dashboard & Report Export",
        whyCrucial: "Gives user a concrete artifact they can immediately share with their team or client.",
      },
      {
        feature: "Stripe Checkout & Basic Auth (Magic Link)",
        whyCrucial: "Enables immediate monetization on day 1 to validate willingness to pay.",
      },
    ],
    buildLater: [
      {
        feature: "Multi-user Team Workspaces & Permissions",
        whenToBuild: "When 5+ customers explicitly request colleague logins.",
      },
      {
        feature: "Automated Webhook & Zapier / Slack Integrations",
        whenToBuild: "After proving the manual CSV / export workflow has high retention.",
      },
      {
        feature: "Custom White-Label Branding for Agencies",
        whenToBuild: "Once customers are willing to pay an extra $100/mo add-on fee.",
      },
    ],
    dontBuildYet: [
      {
        trap: "Native iOS / Android Mobile Apps",
        whyToAvoid: "Web app is 10x faster to iterate and your B2B customers work on laptops.",
      },
      {
        trap: "Complex Custom Workflow Canvas Builder",
        whyToAvoid: "Premature engineering. 90% of users want an opinionated preset that just works.",
      },
      {
        trap: "AI Chatbot Floating Widget",
        whyToAvoid: "Gimmicky distraction that adds zero core strategic value.",
      },
    ],
    coreUserFlow: [
      "Step 1: User enters URL or pastes operational data",
      "Step 2: Engine runs automated diagnostics in 15 seconds",
      "Step 3: User receives prioritized action items & 1-click execution fixes",
      "Step 4: User triggers automated workflow or downloads report",
    ],
    mvpSuccessMetric: "Acquire 5 paying customers ($500+ MRR) within 14 days of launch",
    recommendedTechStack: ["React 19 + Tailwind CSS", "Express + TypeScript", "Gemini 3.7 Flash", "Stripe Checkout"],
    estimatedBuildTimeWeeks: 2,
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackActionPlan(idea: any): any {
  return {
    days: [
      {
        day: 1,
        title: "ICP Definition & Unfair Offer Construction",
        objective: "Write a 1-page Customer & Offer blueprint with quantifiable ROI.",
        tasks: [
          { id: "d1_t1", "text": "Draft exact ideal customer persona (title, company size, revenue, tech stack)", done: false },
          { id: "d1_t2", "text": "Write a 1-sentence Dream Outcome offer with guaranteed payoff", done: false },
          { id: "d1_t3", "text": "List 10 specific objections your buyer will have and write counter-arguments", done: false },
        ],
        deliverable: "1-Page Offer Sheet with clear pricing ($99/mo or $499 setup)",
        proTip: "If you cannot explain why this saves 10x its cost in 30 seconds, refine the offer before building.",
      },
      {
        day: 2,
        title: "Target Lead List & 20 Prospect Interviews",
        objective: "Directly speak with 5-10 real buyers to verify problem severity.",
        tasks: [
          { id: "d2_t1", "text": "Scrape or curate 50 qualified decision makers on LinkedIn/Twitter", done: false },
          { id: "d2_t2", "text": "Send 30 direct messages asking for 10-minute feedback (no hard pitch)", done: false },
          { id: "d2_t3", "text": "Conduct 5 discovery calls taking notes on exact words they use for the problem", done: false },
        ],
        deliverable: "5 Completed Customer Interview Notes with verbatim pain quotes",
        proTip: "Ask: 'How much did you spend trying to solve this last month?' If the answer is $0, caution.",
      },
      {
        day: 3,
        title: "High-Converting Pre-Launch Page",
        objective: "Build a single high-contrast landing page with live Stripe pre-order.",
        tasks: [
          { id: "d3_t1", "text": "Set up crisp hero headline and problem/solution bento cards", done: false },
          { id: "d3_t2", "text": "Embed 3 interactive mockup screenshots and clear pricing tier", done: false },
          { id: "d3_t3", "text": "Connect Stripe payment link for Founding Member 50% discount", done: false },
        ],
        deliverable: "Live URL with working checkout and demo request form",
        proTip: "Keep the page focused on the transformation, not technical implementation details.",
      },
      {
        day: 4,
        title: "Cold Outbound & Traffic Blitz",
        objective: "Drive 100 targeted decision makers to the page.",
        tasks: [
          { id: "d4_t1", "text": "Send 50 personalized cold emails / DMs with video teardown snippet", done: false },
          { id: "d4_t2", "text": "Post a detailed industry case-study teardown in 2 target communities", done: false },
          { id: "d4_t3", "text": "Follow up with interviewees from Day 2 with early access link", done: false },
        ],
        deliverable: "100+ Unique Targeted Visitors & 5+ Email Opt-ins / Demo Bookings",
        proTip: "Personalize the first line of every outreach email with a specific observation about their business.",
      },
      {
        day: 5,
        title: "Concierge MVP Beta Delivery",
        objective: "Manually deliver the core outcome to your first 2 beta users.",
        tasks: [
          { id: "d5_t1", "text": "Manually process the user's data using AI scripts and curated templates", done: false },
          { id: "d5_t2", "text": "Deliver the finished report/outcome in under 2 hours", done: false },
          { id: "d5_t3", "text": "Record their live reaction and ask for immediate feedback", done: false },
        ],
        deliverable: "2 Delighted Users with validated manual workflow data",
        proTip: "Doing things manually first reveals all the edge cases before you write backend software.",
      },
      {
        day: 6,
        title: "Payment Conversion & Testimonial Capture",
        objective: "Convert beta users to paying customers and capture proof.",
        tasks: [
          { id: "d6_t1", "text": "Ask beta users: 'Would you pay $99/mo to have this run every single week?'", done: false },
          { id: "d6_t2", "text": "Send invoice / payment link to convert them to paid subscribers", done: false },
          { id: "d6_t3", "text": "Collect 2 written testimonials or video quote snippets", done: false },
        ],
        deliverable: "First 1-3 Paying Customers & Verified Social Proof Quotes",
        proTip: "A user who won't pay after getting real value is giving you the most valuable feedback possible.",
      },
      {
        day: 7,
        title: "The Pivot-or-Build Strategy Council",
        objective: "Make the final data-driven executive decision on whether to scale this.",
        tasks: [
          { id: "d7_t1", "text": "Review conversion metrics: Traffic, Replies, Payments, User Feedback", done: false },
          { id: "d7_t2", "text": "Compare results against Decision Criteria (Build / Iterate / Pivot / Kill)", done: false },
          { id: "d7_t3", "text": "If GREEN: Lock in 2-week MVP development sprint. If RED: Pivot niche or next idea", done: false },
        ],
        deliverable: "Final Executive Decision Document & Sprint Plan",
        proTip: "Killing a weak idea on Day 7 is a massive victory — you just saved 6 months of wasted life.",
      },
    ],
    finalDecisionCriteria: {
      buildSignal: "At least 2 paying customers ($200+ revenue) + 5 high-intent waitlist leads.",
      iterateSignal: "Strong interest and 10+ discovery calls, but users requested a specific workflow tweak before paying.",
      pivotSignal: "Primary ICP rejected the offer, but an adjacent niche (e.g. consultants) begged for it.",
      abandonSignal: "Contacted 50 qualified prospects, <5% open rate, zero calls booked, zero willingness to pay.",
    },
    createdAt: new Date().toISOString(),
  };
}

function generateFallbackPersonas(idea: any): any[] {
  return [
    {
      id: "persona_1",
      name: "Marcus Vance",
      role: "VP of Operations",
      companyType: "Mid-Market Growth Co (85 employees)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160",
      disposition: "Skeptical & Analytical",
      corePain: "Losing hours per week to manual data inconsistencies and fragmented tooling.",
      currentWorkaround: "Spreadsheet trackers, weekly status meetings, and manual oversight.",
      budgetAuthority: "$1,500/mo without executive signoff",
      mainSkepticism: "Worries whether this truly works reliably without requiring months of change management.",
    },
    {
      id: "persona_2",
      name: "Elena Rostova",
      role: "Founder & Lead Consultant",
      companyType: "Boutique Strategy Agency (8 employees)",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=160",
      disposition: "Budget-Conscious & Pragmatic",
      corePain: "Needs fast turnaround on deliverables without hiring expensive full-time staff.",
      currentWorkaround: "Juggling 5 different disparate SaaS subscriptions and freelance contractors.",
      budgetAuthority: "$100 - $300/mo",
      mainSkepticism: "Very sensitive to monthly software bloat and recurring overhead.",
    },
    {
      id: "persona_3",
      name: "Devon Reed",
      role: "Head of Product",
      companyType: "Seed-stage Tech Startup (15 employees)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=160",
      disposition: "Early Adopter & Tech-Savvy",
      corePain: "Needs to prototype and launch customer-facing features at 10x developer speed.",
      currentWorkaround: "Building internal scripts with Node.js and OpenAI API wrappers.",
      budgetAuthority: "$500/mo discretionary tech budget",
      mainSkepticism: "Needs API access, webhook support, and wants to know it won't lock his data into a silo.",
    },
    {
      id: "persona_4",
      name: "Rachel Miller",
      role: "Managing Director",
      companyType: "Regional Professional Services Firm",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160",
      disposition: "Burned-Out & Time-Starved",
      corePain: "Overwhelmed by administrative overhead and client communication backlog.",
      currentWorkaround: "Working 60+ hour weeks and checking emails at 11 PM.",
      budgetAuthority: "$1,000/mo if it saves 5+ hours/week",
      mainSkepticism: "Refuses to spend more than 15 minutes setting up or learning new complicated software.",
    },
  ];
}

function generateFallbackInterviewReply(persona: any, founderMessage: string): any {
  const msgLower = (founderMessage || "").toLowerCase();
  if (msgLower.includes("price") || msgLower.includes("cost") || msgLower.includes("$")) {
    return {
      reply: `Regarding price, ${persona?.budgetAuthority || "my budget"} is manageable, but I'd need to see an immediate ROI within the first 14 days before committing to an annual plan.`,
      sentiment: "skeptical",
      buyIntentScore: 55,
      keyTakeaway: "Open to pricing if a low-risk trial or pilot proves concrete ROI quickly.",
    };
  }
  return {
    reply: `I see what you're trying to solve. Currently, our workaround is ${persona?.currentWorkaround || "handling it manually"}, which is frustrating. If your solution can reliably fix that without a 3-week onboarding curve, I'd definitely test it.`,
    sentiment: "positive",
    buyIntentScore: 68,
    keyTakeaway: "Strong interest in removing manual workaround; zero-friction onboarding is non-negotiable.",
  };
}

function generateFallbackFinancials(idea: any): any {
  const isHighCost = idea?.startupCost === "HIGH";
  const monthlyPrice = isHighCost ? 249 : 79;
  const fixedCosts = isHighCost ? 4500 : 2200;
  const cac = isHighCost ? 350 : 180;
  const grossMargin = 85;
  const churn = 3.8;
  const lifetimeMonths = Math.round(100 / churn);
  const ltv = Math.round(monthlyPrice * (grossMargin / 100) * lifetimeMonths);
  const ltvCacRatio = Number((ltv / cac).toFixed(1));
  const cacPaybackMonths = Number((cac / (monthlyPrice * (grossMargin / 100))).toFixed(1));
  const customersNeeded = Math.ceil(fixedCosts / (monthlyPrice * (grossMargin / 100)));

  return {
    tam: {
      totalUnits: 450000,
      unitLabel: "Global Target Businesses",
      annualPricePerUnit: monthlyPrice * 12,
      totalValueUsd: 450000 * monthlyPrice * 12,
      rationale: `Estimated 450,000 addressable companies in target vertical with matching digital maturity.`,
    },
    sam: {
      segmentPercentage: 22,
      totalUnits: 99000,
      totalValueUsd: 99000 * monthlyPrice * 12,
      rationale: `English-speaking primary tier-1 markets with active operational budget.`,
    },
    som: {
      targetSharePercentage: 1.2,
      totalUnits: 1188,
      totalValueUsd: 1188 * monthlyPrice * 12,
      rationale: `Capturable within 18-24 months via focused niche SEO, outbound, and partner integration channels.`,
    },
    unitEconomics: {
      monthlyPrice,
      grossMarginPercent: grossMargin,
      estimatedCac: cac,
      monthlyChurnPercent: churn,
      costPerServiceDelivery: Math.round(monthlyPrice * (1 - grossMargin / 100)),
      lifetimeMonths,
      estimatedLtv: ltv,
      ltvCacRatio,
      cacPaybackMonths,
    },
    breakeven: {
      monthlyFixedCosts: fixedCosts,
      costItems: [
        { category: "Cloud & AI Compute", amount: Math.round(fixedCosts * 0.25) },
        { category: "Acquisition & Advertising", amount: Math.round(fixedCosts * 0.4) },
        { category: "Tooling & Infra", amount: Math.round(fixedCosts * 0.15) },
        { category: "Admin & Operations", amount: Math.round(fixedCosts * 0.2) },
      ],
      customersNeeded,
      mrrNeeded: customersNeeded * monthlyPrice,
      targetRunwayMonths: 6,
    },
    projections: {
      month6: { customers: Math.round(customersNeeded * 0.6), mrr: Math.round(customersNeeded * 0.6 * monthlyPrice), netProfit: Math.round(customersNeeded * 0.6 * monthlyPrice * (grossMargin / 100) - fixedCosts) },
      month12: { customers: Math.round(customersNeeded * 1.8), mrr: Math.round(customersNeeded * 1.8 * monthlyPrice), netProfit: Math.round(customersNeeded * 1.8 * monthlyPrice * (grossMargin / 100) - fixedCosts) },
      month24: { customers: Math.round(customersNeeded * 5.5), mrr: Math.round(customersNeeded * 5.5 * monthlyPrice), netProfit: Math.round(customersNeeded * 5.5 * monthlyPrice * (grossMargin / 100) - fixedCosts) },
    },
    ventureVerdict: {
      viabilityScore: 84,
      strengths: [
        `Favorable LTV:CAC ratio (${ltvCacRatio}x) allows rapid reinvestment of cash into acquisition.`,
        `Low marginal cost of software delivery creates high leverage at scale.`,
      ],
      riskFactors: [
        `Ensuring initial churn stays below ${churn}% through quick time-to-value onboarding.`,
        `Competition copying feature set before network effects take hold.`,
      ],
      pricingRecommendation: `Test annual prepay at $${Math.round(monthlyPrice * 10)}/year (2 months free) to eliminate customer acquisition cash lag.`,
    },
  };
}

function generateFallbackLaunchKit(idea: any): any {
  const name = idea?.name || "The Product";
  const customer = idea?.targetCustomer || "Founders & Busy Teams";
  const problem = idea?.problem || "manual operational bottlenecks";
  const solution = idea?.solution || "an automated, high-velocity workflow platform";

  return {
    heroSection: {
      headline: `The Modern Way For ${customer} To Eliminate ${problem.split('.')[0]}`,
      subheadline: `${name} delivers ${solution.toLowerCase().replace(/\.$/, "")}—giving you 10x faster execution without overhead.`,
      primaryCtaText: "Get Free Early Access",
      secondaryCtaText: "Explore Interactive Demo",
      socialProofBadge: `Trusted by 200+ top operators & founding teams`,
    },
    valuePillars: [
      {
        title: "10x Speed to Execution",
        description: `Automate manual steps so you can focus strictly on high-impact strategic growth.`,
        highlightMetric: "80% reduction in time-to-value",
      },
      {
        title: "Frictionless Integration",
        description: `Works directly with the tools you already rely on every single day with zero friction.`,
        highlightMetric: "3-minute setup time",
      },
      {
        title: "Measurable ROI from Day 1",
        description: `Quantified efficiency gains that deliver positive payback in your very first month.`,
        highlightMetric: "4.2x verified ROI",
      },
    ],
    featureCards: [
      {
        title: "Smart Workflow Engine",
        benefit: "Eliminates tedious manual steps",
        detail: "Context-aware automation triggers that handle complex handoffs without human intervention.",
      },
      {
        title: "Unified Command Dashboard",
        benefit: "Real-time visibility into all key metrics",
        detail: "Single pane of glass tracking progress, health scores, and critical bottlenecks.",
      },
      {
        title: "Enterprise-Grade Reliability",
        benefit: "Security and scale built-in",
        detail: "End-to-end data encryption, granular permission controls, and audit logs.",
      },
      {
        title: "AI Co-Pilot Assistance",
        benefit: "Instant answers and recommendations",
        detail: "Proactive recommendations that identify revenue leaks before they hurt your bottom line.",
      },
    ],
    objectionFaqs: [
      {
        question: `How does ${name} compare to our current manual workflow?`,
        answer: `Manual workflows fail when volume scales. ${name} standardizes your operational playbook into an automated machine that runs seamlessly 24/7.`,
      },
      {
        question: "How difficult is it to migrate our existing data?",
        answer: "We offer 1-click import presets and dedicated onboarding assistance to ensure you are fully running in under 15 minutes.",
      },
      {
        question: "What is included in the beta access program?",
        answer: "Early beta users receive direct access to founding engineers, locked-in founder pricing for life, and free customized workflow setups.",
      },
      {
        question: "Can we cancel or adjust our plan anytime?",
        answer: "Yes, there are no long-term lock-in contracts. You can scale up, down, or cancel whenever you need with 1-click.",
      },
    ],
    coldEmailSequence: [
      {
        step: 1,
        name: "The Focused Problem Hook",
        timing: "Day 1",
        subjectLine: `Quick question regarding ${customer} bottleneck at {{Company}}?`,
        previewText: "Saw your team's recent milestone...",
        bodyText: `Hi {{FirstName}},\n\nSaw your team's recent updates on LinkedIn—congrats on the momentum at {{Company}}!\n\nQuick question: Are you finding that ${problem.toLowerCase().slice(0, 80)} is taking up too much team bandwidth this quarter?\n\nWe built ${name} to solve this exact bottleneck. It gives ${customer} a streamlined system that cuts operational lag by over 75%.\n\nWould you be open to a brief 7-minute peek this week, or should I send a 60-second video demo?`,
        callToAction: "Would Tuesday at 11am or Wednesday at 2pm work for a brief 7-minute chat?",
      },
      {
        step: 2,
        name: "The Benchmark & Social Proof",
        timing: "Day 4 (Follow-up)",
        subjectLine: `How similar teams cut operational friction by 75%`,
        previewText: "Quick follow-up on your team's workflow...",
        bodyText: `Hi {{FirstName}},\n\nWanted to follow up with a quick benchmark: Another team of ${customer} was previously losing ~12 hours each week to manual coordination.\n\nAfter adopting ${name}, they eliminated the back-and-forth and accelerated their delivery cycle by 3.5x.\n\nI put together a quick preview tailored for {{Company}}'s setup. Mind if I share the link?`,
        callToAction: "Reply 'yes' and I will send over your customized workflow preview.",
      },
      {
        step: 3,
        name: "The VIP Early Adopter Offer",
        timing: "Day 8 (Graceful Breakup)",
        subjectLine: `Permission to close your file, {{FirstName}}?`,
        previewText: "Last note regarding the ${name} pilot...",
        bodyText: `Hi {{FirstName}},\n\nI know your inbox is packed with higher priorities, so this is my final note.\n\nWe are reserving 5 more spots in our Founder Beta Program (includes free migration + 50% lifetime discount).\n\nIf solving ${problem.toLowerCase().slice(0, 60)} isn't top of mind right now, no worries at all! If it is, you can test drive the interactive demo with zero signup here:\n\n[Interactive Demo Link]`,
        callToAction: "Grab one of the 5 beta spots here, or let me know if we should touch base next quarter.",
      },
    ],
    socialOutreachDms: [
      {
        platform: "LinkedIn",
        targetRecipient: "Founder / Head of Operations",
        messageText: `Hey {{FirstName}}, noticed your team's great work at {{Company}}. Are you running into friction with ${problem.toLowerCase().slice(0, 70)}? We built ${name} to automate this completely. Would love to share early access and get your thoughts!`,
      },
      {
        platform: "Twitter/X",
        targetRecipient: "Tech Leader / Builder",
        messageText: `Loved your recent post on team scaling, {{FirstName}}! We created ${name} to solve ${problem.toLowerCase().slice(0, 60)}. Would love to hook you up with free VIP beta access in exchange for your candid feedback.`,
      },
      {
        platform: "Slack/Discord",
        targetRecipient: "Community Member / Operator",
        messageText: `Hey community! 👋 Just released early beta access for ${name}—built specifically for ${customer} looking to eliminate manual busywork. Free access for members here: [Link]`,
      },
    ],
    adHooks: [
      {
        platform: "Meta / Instagram",
        headline: `Stop Wasting Hours on ${problem.slice(0, 40)}.`,
        primaryText: `Modern teams use ${name} to automate high-friction workflows in minutes. Get your team back to building high-value work today.`,
        targetAudience: `Interests: Startup founders, Product Management, Productivity software, Technology`,
      },
      {
        platform: "Google Search",
        headline: `${name} | Modern Solution For ${customer}`,
        primaryText: `Eliminate manual lag with automated workflows. Fast onboarding, enterprise security, and 24/7 reliability. Start free trial.`,
        targetAudience: `Keywords: [best tools for ${customer}], [automate ${problem.slice(0, 30)}], [workflow platform]`,
      },
      {
        platform: "LinkedIn B2B",
        headline: `How Leading ${customer} Cut Operational Lag by 75%`,
        primaryText: `Top teams don't rely on chaotic manual processes. See how ${name} gives you end-to-end automation and measurable ROI in week one.`,
        targetAudience: `Job Titles: VP Operations, Director of Strategy, Head of Product, Founder & CEO`,
      },
    ],
  };
}

// Vite middleware and static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Business Strategist server running on port ${PORT}`);
  });
}

startServer();
