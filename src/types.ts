export interface FounderProfile {
  skills: string[];
  interests: string[];
  budget: string;
  timeCommitment: string;
  targetMarket: string;
  businessType: string;
  founderGoal: string;
  riskTolerance: 'Conservative' | 'Balanced' | 'Aggressive';
  backgroundSummary?: string;
}

export interface ScoreBreakdown {
  marketDemand: number;
  customerPain: number;
  monetization: number;
  competition: number;
  differentiation: number;
  execution: number;
  founderFit: number;
}

export interface ValidationExperiment {
  experiment: string;
  successMetric: string;
  timeframe: string;
}

export interface ValidationReport {
  executiveSummary: string;
  targetCustomerDetail: string;
  problemDepth: string;
  customerPainScore: number;
  solutionViability: string;
  marketOpportunity: {
    tamSamSom: string;
    tailwinds: string[];
    demandSignals: string[];
  };
  competitionLandscape: string;
  differentiationEdge: string;
  monetizationStrategy: string;
  pricingModel: {
    tier1: string;
    tier2: string;
    rationale: string;
  };
  customerAcquisition: string[];
  startupRequirements: {
    capitalNeeded: string;
    techStack: string[];
    timeToLaunch: string;
  };
  keyRisks: string[];
  validationExperiments: ValidationExperiment[];
  recommendation: 'PURSUE' | 'CONSIDER' | 'REWORK' | 'AVOID';
  recommendationRationale: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface Competitor {
  name: string;
  whatTheyDo: string;
  targetAudience: string;
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  differentiationAngle: string;
  websiteUrl?: string;
  marketCategory?: 'Direct Competitor' | 'Legacy Incumbent' | 'Adjacent Solution' | 'Emerging Challenger';
  fundingOrScale?: string;
  verifiedLiveSignal?: string;
  sources?: GroundingSource[];
}

export interface LiveMarketIntelligence {
  overallMarketMaturity: 'Greenfield / Emerging' | 'Fragmented' | 'Growing Competition' | 'Red Ocean / Highly Saturated';
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  whitespaceOpportunity: string;
  recentTrends: string[];
  searchGroundingSources: GroundingSource[];
  webSearchQueries?: string[];
  verifiedAt: string;
  isGrounded?: boolean;
}

export interface StressTestItem {
  title: string;
  whyItMatters: string;
  howToMitigate: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
}

export interface StressTest {
  headline: string;
  failureReasons: StressTestItem[];
  stressTestResult: 'STRONG' | 'MODERATE' | 'WEAK';
  overallVerdict: string;
  createdAt: string;
}

export interface IdeaChange {
  field: string;
  before: string;
  after: string;
  rationale: string;
}

export interface ImprovedIdea {
  beforeAfterSummary: string;
  changes: IdeaChange[];
  improvedValueProposition: string;
  nicheFocus: string;
  defensibilityMoat: string;
  adjustedOpportunityScore: number;
  createdAt: string;
}

export interface BusinessModelCanvas {
  customerSegments: string[];
  valuePropositions: string[];
  revenueStreams: string[];
  pricingStrategy: string;
  distributionChannels: string[];
  keyActivities: string[];
  keyResources: string[];
  costStructure: string[];
  unfairAdvantage: string;
  createdAt: string;
}

export interface MVPFeature {
  feature: string;
  whyCrucial: string;
}

export interface MVPDeferredFeature {
  feature: string;
  whenToBuild: string;
}

export interface MVPTrapFeature {
  trap: string;
  whyToAvoid: string;
}

export interface MVPBlueprint {
  buildFirst: MVPFeature[];
  buildLater: MVPDeferredFeature[];
  dontBuildYet: MVPTrapFeature[];
  coreUserFlow: string[];
  mvpSuccessMetric: string;
  recommendedTechStack: string[];
  estimatedBuildTimeWeeks: number;
  createdAt: string;
}

export interface ActionTask {
  id: string;
  text: string;
  done: boolean;
}

export interface ActionDay {
  day: number;
  title: string;
  objective: string;
  tasks: ActionTask[];
  deliverable: string;
  proTip: string;
}

export interface ActionPlan {
  days: ActionDay[];
  finalDecisionCriteria: {
    buildSignal: string;
    iterateSignal: string;
    pivotSignal: string;
    abandonSignal: string;
  };
  createdAt: string;
}

export interface PersonaProfile {
  id: string;
  name: string;
  role: string;
  companyType: string;
  avatar: string;
  disposition: 'Skeptical & Analytical' | 'Budget-Conscious & Pragmatic' | 'Early Adopter & Tech-Savvy' | 'Burned-Out & Time-Starved';
  corePain: string;
  currentWorkaround: string;
  budgetAuthority: string;
  mainSkepticism: string;
}

export interface InterviewMessage {
  id: string;
  sender: 'founder' | 'persona';
  text: string;
  timestamp: string;
  sentiment?: 'positive' | 'neutral' | 'skeptical' | 'critical';
  buyIntentScore?: number; // 0-100
  keyTakeaway?: string;
}

export interface InterviewSimulationSession {
  persona: PersonaProfile;
  messages: InterviewMessage[];
  overallSummary?: {
    buyIntentScore: number;
    topObjections: string[];
    whatResonated: string[];
    priceSensitivityVerdict: string;
    suggestedPitchTweak: string;
  };
  completedAt?: string;
}

export interface FinancialModel {
  tam: {
    totalUnits: number;
    unitLabel: string;
    annualPricePerUnit: number;
    totalValueUsd: number;
    rationale: string;
  };
  sam: {
    segmentPercentage: number;
    totalUnits: number;
    totalValueUsd: number;
    rationale: string;
  };
  som: {
    targetSharePercentage: number;
    totalUnits: number;
    totalValueUsd: number;
    rationale: string;
  };
  unitEconomics: {
    monthlyPrice: number;
    grossMarginPercent: number;
    estimatedCac: number;
    monthlyChurnPercent: number;
    costPerServiceDelivery: number;
    lifetimeMonths: number;
    estimatedLtv: number;
    ltvCacRatio: number;
    cacPaybackMonths: number;
  };
  breakeven: {
    monthlyFixedCosts: number;
    costItems: { category: string; amount: number }[];
    customersNeeded: number;
    mrrNeeded: number;
    targetRunwayMonths: number;
  };
  projections: {
    month6: { customers: number; mrr: number; netProfit: number };
    month12: { customers: number; mrr: number; netProfit: number };
    month24: { customers: number; mrr: number; netProfit: number };
  };
  ventureVerdict: {
    viabilityScore: number;
    strengths: string[];
    riskFactors: string[];
    pricingRecommendation: string;
  };
}

export interface LaunchKit {
  heroSection: {
    headline: string;
    subheadline: string;
    primaryCtaText: string;
    secondaryCtaText: string;
    socialProofBadge: string;
  };
  valuePillars: Array<{
    title: string;
    description: string;
    highlightMetric: string;
  }>;
  featureCards: Array<{
    title: string;
    benefit: string;
    detail: string;
  }>;
  objectionFaqs: Array<{
    question: string;
    answer: string;
  }>;
  coldEmailSequence: Array<{
    step: number;
    name: string;
    timing: string;
    subjectLine: string;
    previewText: string;
    bodyText: string;
    callToAction: string;
  }>;
  socialOutreachDms: Array<{
    platform: 'LinkedIn' | 'Twitter/X' | 'Slack/Discord';
    targetRecipient: string;
    messageText: string;
  }>;
  adHooks: Array<{
    platform: 'Meta / Instagram' | 'Google Search' | 'LinkedIn B2B';
    headline: string;
    primaryText: string;
    targetAudience: string;
  }>;
}

export interface HeadToHeadDimensionAnalysis {
  dimension: string;
  weight: number;
  winnerIdeaId: string;
  analysis: string;
  scores: { [ideaId: string]: number };
}

export interface HeadToHeadComparisonResult {
  winnerIdeaId: string;
  winnerName: string;
  executiveVerdict: string;
  strengthsSummary: { [ideaId: string]: string[] };
  risksSummary: { [ideaId: string]: string[] };
  dimensionAnalysis: HeadToHeadDimensionAnalysis[];
  recommendationByFounderGoal: {
    fastestCashflow: { ideaId: string; reason: string };
    highestScalePotential: { ideaId: string; reason: string };
    lowestExecutionRisk: { ideaId: string; reason: string };
    bestSoloBootstrapper: { ideaId: string; reason: string };
  };
  generatedAt: string;
}

export interface Idea {
  id: string;
  name: string;
  tagline: string;
  description: string;
  targetCustomer: string;
  problem: string;
  solution: string;
  businessModel: string;
  startupCost: 'LOW' | 'MEDIUM' | 'HIGH';
  executionDifficulty: 'LOW' | 'MEDIUM' | 'HIGH';
  whyNow: string;
  primaryRisk: string;
  firstValidationStep: string;
  opportunityScore: number;
  scoreBreakdown: ScoreBreakdown;
  status: 'EXPLORING' | 'VALIDATING' | 'BUILDING' | 'LAUNCHED';
  savedAt: string;
  isSaved?: boolean;
  notes?: string;

  // Attached Deep Strategic Outputs
  validationReport?: ValidationReport;
  competitors?: Competitor[];
  stressTest?: StressTest;
  improvedVersion?: ImprovedIdea;
  businessModelCanvas?: BusinessModelCanvas;
  mvpBlueprint?: MVPBlueprint;
  actionPlan?: ActionPlan;
  interviewSessions?: InterviewSimulationSession[];
  financialModel?: FinancialModel;
  launchKit?: LaunchKit;
  liveMarketIntelligence?: LiveMarketIntelligence;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  hasCompletedOnboarding: boolean;
}

export type GenerationMode = 'personalized' | 'skills' | 'problem' | 'surprise';

export type IdeaDetailTab =
  | 'overview'
  | 'validation'
  | 'personas'
  | 'financials'
  | 'launch-kit'
  | 'competitors'
  | 'stress-test'
  | 'improve'
  | 'business-model'
  | 'mvp'
  | 'action-plan';

