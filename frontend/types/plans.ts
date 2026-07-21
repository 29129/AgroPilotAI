import type { EntityId, IsoDateString } from "@/types/common";
import type { Priority } from "@/types/recommendations";

/** Pending API_CONTRACT v1: task lifecycle and completion endpoint are not defined. */
export type PlanTaskStatus = "PENDING" | "COMPLETED";

export interface PlanTask {
  id: EntityId;
  title: string;
  description?: string;
  scheduledFor: IsoDateString;
  priority: Priority;
  reason: string;
  recommendationId?: EntityId;
  status: PlanTaskStatus;
}

export interface WeeklyPlan {
  id: EntityId;
  cropId: EntityId;
  weekStart: IsoDateString;
  weekEnd: IsoDateString;
  summary: string;
  tasks: PlanTask[];
  generatedAt: IsoDateString;
}

/** Pending API_CONTRACT v1: confirm whether plan generation accepts a start date. */
export interface GenerateWeeklyPlanInput {
  weekStart?: IsoDateString;
}
