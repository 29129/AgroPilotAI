"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cropKeys, weeklyPlanKeys } from "@/hooks/query-keys";
import { weeklyPlansService } from "@/services/weekly-plans.service";
import type { GenerateWeeklyPlanInput } from "@/types/plans";

export function useCurrentWeeklyPlan(cropId?: string) {
  return useQuery({
    queryKey: cropKeys.currentWeeklyPlan(cropId ?? ""),
    queryFn: () => weeklyPlansService.getCurrentByCrop(cropId as string),
    enabled: Boolean(cropId),
  });
}

export function useWeeklyPlan(planId?: string) {
  return useQuery({
    queryKey: weeklyPlanKeys.detail(planId ?? ""),
    queryFn: () => weeklyPlansService.getById(planId as string),
    enabled: Boolean(planId),
  });
}

export function useGenerateWeeklyPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cropId, input }: { cropId: string; input?: GenerateWeeklyPlanInput }) =>
      weeklyPlansService.generate(cropId, input),
    onSuccess: (plan) => {
      queryClient.setQueryData(weeklyPlanKeys.detail(plan.id), plan);
      queryClient.setQueryData(cropKeys.currentWeeklyPlan(plan.cropId), plan);
      return queryClient.invalidateQueries({ queryKey: cropKeys.currentWeeklyPlan(plan.cropId) });
    },
  });
}
