import { mockApi } from "@/mocks/mock-api";
import { apiClient } from "@/services/api-client";
import { fromDataSource, withQuery } from "@/services/service-utils";
import type { CreateCropInput, Crop, CropsListQuery, UpdateCropInput } from "@/types/crops";

export const cropsService = {
  list(query?: CropsListQuery): Promise<Crop[]> {
    return fromDataSource(
      () => mockApi.crops.list(query),
      () => apiClient.get<Crop[]>(withQuery("/crops", query)),
    );
  },

  getById(cropId: string): Promise<Crop> {
    return fromDataSource(
      () => mockApi.crops.getById(cropId),
      () => apiClient.get<Crop>(`/crops/${cropId}`),
    );
  },

  create(input: CreateCropInput): Promise<Crop> {
    return fromDataSource(
      () => mockApi.crops.create(input),
      () => apiClient.post<Crop>("/crops", input),
    );
  },

  update(cropId: string, input: UpdateCropInput): Promise<Crop> {
    return fromDataSource(
      () => mockApi.crops.update(cropId, input),
      () => apiClient.patch<Crop>(`/crops/${cropId}`, input),
    );
  },

  remove(cropId: string): Promise<void> {
    return fromDataSource(
      () => mockApi.crops.remove(cropId),
      () => apiClient.delete<void>(`/crops/${cropId}`),
    );
  },
};
