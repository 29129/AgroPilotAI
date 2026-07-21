export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

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
  category: "CLIMATE" | "HEALTH" | "IRRIGATION" | "NUTRITION" | "MARKET";
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
