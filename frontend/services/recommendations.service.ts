import { mockApi } from "@/mocks/mock-api";
import { apiClient } from "@/services/api-client";
import { fromDataSource, withQuery } from "@/services/service-utils";
import type { ListQuery } from "@/types/common";
import type {
  CreateCropAnalysisInput,
  CropAnalysis,
  Recommendation,
  RejectRecommendationInput,
} from "@/types/recommendations";

export const analysisService = {
  run(cropId: string, input: CreateCropAnalysisInput): Promise<CropAnalysis> {
    return fromDataSource(
      () => mockApi.recommendations.runAnalysis(cropId, input),
      () => apiClient.post<CropAnalysis>(`/crops/${cropId}/analysis`, input),
    );
  },
};

export const recommendationsService = {
  listByCrop(cropId: string, query?: ListQuery): Promise<Recommendation[]> {
    return fromDataSource(
      () => mockApi.recommendations.listByCrop(cropId, query),
      () => apiClient.get<Recommendation[]>(withQuery(`/crops/${cropId}/recommendations`, query)),
    );
  },

  getById(recommendationId: string): Promise<Recommendation> {
    return fromDataSource(
      () => mockApi.recommendations.getById(recommendationId),
      () => apiClient.get<Recommendation>(`/recommendations/${recommendationId}`),
    );
  },

  approve(recommendationId: string): Promise<Recommendation> {
    return fromDataSource(
      () => mockApi.recommendations.approve(recommendationId),
      () => apiClient.post<Recommendation>(`/recommendations/${recommendationId}/approve`),
    );
  },

  reject(recommendationId: string, input?: RejectRecommendationInput): Promise<Recommendation> {
    return fromDataSource(
      () => mockApi.recommendations.reject(recommendationId, input),
      () => apiClient.post<Recommendation>(`/recommendations/${recommendationId}/reject`, input),
    );
  },

  complete(recommendationId: string): Promise<Recommendation> {
    return fromDataSource(
      () => mockApi.recommendations.complete(recommendationId),
      () => apiClient.post<Recommendation>(`/recommendations/${recommendationId}/complete`),
    );
  },
};
