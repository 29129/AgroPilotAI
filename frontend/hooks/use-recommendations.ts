"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cropKeys, recommendationKeys } from "@/hooks/query-keys";
import { analysisService, recommendationsService } from "@/services/recommendations.service";
import type { ListQuery } from "@/types/common";
import type { CreateCropAnalysisInput, RejectRecommendationInput } from "@/types/recommendations";

function refreshRecommendationData(
  queryClient: ReturnType<typeof useQueryClient>,
  cropId: string,
  recommendationId: string,
) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: cropKeys.all }),
    queryClient.invalidateQueries({ queryKey: recommendationKeys.detail(recommendationId) }),
    queryClient.invalidateQueries({ queryKey: cropKeys.currentWeeklyPlan(cropId) }),
  ]);
}

export function useCropRecommendations(cropId?: string, query?: ListQuery) {
  return useQuery({
    queryKey: cropKeys.recommendations(cropId ?? "", query),
    queryFn: () => recommendationsService.listByCrop(cropId as string, query),
    enabled: Boolean(cropId),
  });
}

export function useRecommendation(recommendationId?: string) {
  return useQuery({
    queryKey: recommendationKeys.detail(recommendationId ?? ""),
    queryFn: () => recommendationsService.getById(recommendationId as string),
    enabled: Boolean(recommendationId),
  });
}

export function useRunCropAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cropId, input }: { cropId: string; input: CreateCropAnalysisInput }) =>
      analysisService.run(cropId, input),
    onSuccess: (analysis, variables) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: cropKeys.recommendations(variables.cropId) }),
        queryClient.invalidateQueries({ queryKey: cropKeys.currentWeeklyPlan(variables.cropId) }),
        ...analysis.recommendations.map((recommendation) =>
          queryClient.setQueryData(
            recommendationKeys.detail(recommendation.id),
            recommendation,
          ),
        ),
      ]),
  });
}

export function useApproveRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recommendationId }: { recommendationId: string }) =>
      recommendationsService.approve(recommendationId),
    onSuccess: (recommendation) => {
      queryClient.setQueryData(recommendationKeys.detail(recommendation.id), recommendation);
      return refreshRecommendationData(queryClient, recommendation.cropId, recommendation.id);
    },
  });
}

export function useRejectRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recommendationId, input }: { recommendationId: string; input?: RejectRecommendationInput }) =>
      recommendationsService.reject(recommendationId, input),
    onSuccess: (recommendation) => {
      queryClient.setQueryData(recommendationKeys.detail(recommendation.id), recommendation);
      return refreshRecommendationData(queryClient, recommendation.cropId, recommendation.id);
    },
  });
}

export function useCompleteRecommendation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recommendationId }: { recommendationId: string }) =>
      recommendationsService.complete(recommendationId),
    onSuccess: (recommendation) => {
      queryClient.setQueryData(recommendationKeys.detail(recommendation.id), recommendation);
      return refreshRecommendationData(queryClient, recommendation.cropId, recommendation.id);
    },
  });
}
