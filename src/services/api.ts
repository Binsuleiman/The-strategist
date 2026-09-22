import {
  FounderProfile,
  Idea,
  ValidationReport,
  Competitor,
  StressTest,
  ImprovedIdea,
  BusinessModelCanvas,
  MVPBlueprint,
  ActionPlan,
  PersonaProfile,
  InterviewMessage,
  FinancialModel,
  LaunchKit,
  LiveMarketIntelligence,
  GenerationMode,
  HeadToHeadComparisonResult,
} from "../types";

export async function generateIdeasApi(
  founderProfile: FounderProfile,
  mode: GenerationMode = "personalized",
  customPrompt?: string
): Promise<{ ideas: Idea[]; isFallback: boolean }> {
  const response = await fetch("/api/generate-ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ founderProfile, mode, customPrompt }),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate ideas: ${response.statusText}`);
  }
  return response.json();
}

export async function evaluateCustomIdeaApi(
  customIdea: string | { name?: string; problem?: string; description?: string; targetCustomer?: string },
  founderProfile: FounderProfile
): Promise<{ idea: Idea; isFallback: boolean }> {
  const response = await fetch("/api/evaluate-custom-idea", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customIdea, founderProfile }),
  });
  if (!response.ok) {
    throw new Error(`Failed to evaluate custom idea: ${response.statusText}`);
  }
  return response.json();
}

export async function validateIdeaApi(
  idea: Idea,
  founderProfile: FounderProfile
): Promise<{ report: ValidationReport; isFallback: boolean }> {
  const response = await fetch("/api/validate-idea", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, founderProfile }),
  });
  if (!response.ok) {
    throw new Error(`Failed to validate idea: ${response.statusText}`);
  }
  return response.json();
}

export async function analyzeCompetitorsApi(
  idea: Idea,
  customQuery?: string
): Promise<{
  competitors: Competitor[];
  liveMarketIntelligence?: LiveMarketIntelligence;
  isFallback: boolean;
}> {
  const response = await fetch("/api/analyze-competitors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, customQuery }),
  });
  if (!response.ok) {
    throw new Error(`Failed to analyze competitors: ${response.statusText}`);
  }
  return response.json();
}

export async function stressTestIdeaApi(
  idea: Idea,
  founderProfile: FounderProfile
): Promise<{ stressTest: StressTest; isFallback: boolean }> {
  const response = await fetch("/api/stress-test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, founderProfile }),
  });
  if (!response.ok) {
    throw new Error(`Failed to stress test idea: ${response.statusText}`);
  }
  return response.json();
}

export async function improveIdeaApi(
  idea: Idea,
  stressTest?: StressTest
): Promise<{ improvedVersion: ImprovedIdea; isFallback: boolean }> {
  const response = await fetch("/api/improve-idea", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, stressTest }),
  });
  if (!response.ok) {
    throw new Error(`Failed to improve idea: ${response.statusText}`);
  }
  return response.json();
}

export async function generateBusinessModelApi(
  idea: Idea
): Promise<{ businessModelCanvas: BusinessModelCanvas; isFallback: boolean }> {
  const response = await fetch("/api/generate-business-model", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate business model: ${response.statusText}`);
  }
  return response.json();
}

export async function generateMVPApi(
  idea: Idea
): Promise<{ mvpBlueprint: MVPBlueprint; isFallback: boolean }> {
  const response = await fetch("/api/generate-mvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate MVP blueprint: ${response.statusText}`);
  }
  return response.json();
}

export async function generateActionPlanApi(
  idea: Idea,
  mvpBlueprint?: MVPBlueprint
): Promise<{ actionPlan: ActionPlan; isFallback: boolean }> {
  const response = await fetch("/api/generate-action-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, mvpBlueprint }),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate action plan: ${response.statusText}`);
  }
  return response.json();
}

export async function generatePersonasApi(
  idea: Idea
): Promise<{ personas: PersonaProfile[]; isFallback: boolean }> {
  const response = await fetch("/api/generate-personas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate personas: ${response.statusText}`);
  }
  return response.json();
}

export async function simulateInterviewReplyApi(
  idea: Idea,
  persona: PersonaProfile,
  conversationHistory: InterviewMessage[],
  founderMessage: string
): Promise<{
  simulation: {
    reply: string;
    sentiment: "positive" | "neutral" | "skeptical" | "critical";
    buyIntentScore: number;
    keyTakeaway: string;
  };
  isFallback: boolean;
}> {
  const response = await fetch("/api/simulate-interview-reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, persona, conversationHistory, founderMessage }),
  });
  if (!response.ok) {
    throw new Error(`Failed to simulate interview reply: ${response.statusText}`);
  }
  return response.json();
}

export async function generateFinancialsApi(
  idea: Idea
): Promise<{ financialModel: FinancialModel; isFallback: boolean }> {
  const response = await fetch("/api/generate-financials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate financial model: ${response.statusText}`);
  }
  return response.json();
}

export async function generateLaunchKitApi(
  idea: Idea
): Promise<{ launchKit: LaunchKit; isFallback: boolean }> {
  const response = await fetch("/api/generate-launch-kit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea }),
  });
  if (!response.ok) {
    throw new Error(`Failed to generate launch kit: ${response.statusText}`);
  }
  return response.json();
}

export async function compareIdeasApi(
  ideas: Idea[],
  founderProfile?: FounderProfile
): Promise<{ comparison: HeadToHeadComparisonResult; isFallback: boolean }> {
  const response = await fetch("/api/compare-ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ideas, founderProfile }),
  });
  if (!response.ok) {
    throw new Error(`Failed to compare ideas: ${response.statusText}`);
  }
  return response.json();
}


