export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type RecommendationCategory =
  | "CLIMATE"
  | "HEALTH"
  | "IRRIGATION"
  | "NUTRITION"
  | "MARKET";

export type RecommendationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export interface Evidence {
  type: "WEATHER" | "IMAGE" | "SOIL" | "MARKET" | "USER_INPUT";
  label: string;
  value: string | number;
  source?: string;
  observedAt?: string;
}

export interface RecommendedAction {
  id: string;
  label: string;
  description?: string;
  scheduledFor?: string;
}

export interface Recommendation {
  id: string;
  cropId: string;
  category: RecommendationCategory;
  title: string;
  summary: string;
  priority: Priority;
  confidence: number;
  explanation: string;
  evidence: Evidence[];
  actions: RecommendedAction[];
  requiresApproval: boolean;
  status: RecommendationStatus;
  createdAt: string;
}

export type AnalysisType = "FULL";

export type AnalysisInclude = RecommendationCategory;

export interface CreateCropAnalysisInput {
  analysisType: AnalysisType;
  include: AnalysisInclude[];
  userContext?: {
    currentConcern?: string;
  };
}

/** Pending API_CONTRACT v1: confirm all agent and analysis status values. */
export type AgentName = "CLIMATE" | "HEALTH" | "IRRIGATION" | "MARKET";

export type AgentRunStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface AgentResult {
  agent: AgentName;
  status: AgentRunStatus;
  summary: string;
  confidence: number;
}

export interface CropAnalysis {
  analysisId: string;
  status: AgentRunStatus;
  summary: string;
  recommendations: Recommendation[];
  agentResults: AgentResult[];
  generatedAt: string;
}

/** Pending API_CONTRACT v1: reject reason and action idempotency still need agreement. */
export interface RejectRecommendationInput {
  reason?: string;
}
