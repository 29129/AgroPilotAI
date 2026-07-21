import { mockApi } from "@/mocks/mock-api";
import { apiClient } from "@/services/api-client";
import { fromDataSource } from "@/services/service-utils";
import type { GenerateWeeklyPlanInput, WeeklyPlan } from "@/types/plans";

export const weeklyPlansService = {
  generate(cropId: string, input?: GenerateWeeklyPlanInput): Promise<WeeklyPlan> {
    return fromDataSource(
      () => mockApi.weeklyPlans.generate(cropId, input),
      () => apiClient.post<WeeklyPlan>(`/crops/${cropId}/weekly-plans/generate`, input),
    );
  },

  getCurrentByCrop(cropId: string): Promise<WeeklyPlan> {
    return fromDataSource(
      () => mockApi.weeklyPlans.getCurrentByCrop(cropId),
      () => apiClient.get<WeeklyPlan>(`/crops/${cropId}/weekly-plans/current`),
    );
  },

  getById(planId: string): Promise<WeeklyPlan> {
    return fromDataSource(
      () => mockApi.weeklyPlans.getById(planId),
      () => apiClient.get<WeeklyPlan>(`/weekly-plans/${planId}`),
    );
  },
};
