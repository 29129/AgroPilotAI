import { mockApi } from "@/mocks/mock-api";
import { apiClient } from "@/services/api-client";
import { fromDataSource, withQuery } from "@/services/service-utils";
import type { ListQuery } from "@/types/common";
import type {
  CreateFarmInput,
  CreatePlotInput,
  Farm,
  FarmsListQuery,
  Plot,
  UpdateFarmInput,
  UpdatePlotInput,
} from "@/types/farms";

export const farmsService = {
  list(query?: FarmsListQuery): Promise<Farm[]> {
    return fromDataSource(
      () => mockApi.farms.list(query),
      () => apiClient.get<Farm[]>(withQuery("/farms", query)),
    );
  },

  getById(farmId: string): Promise<Farm> {
    return fromDataSource(
      () => mockApi.farms.getById(farmId),
      () => apiClient.get<Farm>(`/farms/${farmId}`),
    );
  },

  create(input: CreateFarmInput): Promise<Farm> {
    return fromDataSource(
      () => mockApi.farms.create(input),
      () => apiClient.post<Farm>("/farms", input),
    );
  },

  update(farmId: string, input: UpdateFarmInput): Promise<Farm> {
    return fromDataSource(
      () => mockApi.farms.update(farmId, input),
      () => apiClient.patch<Farm>(`/farms/${farmId}`, input),
    );
  },

  remove(farmId: string): Promise<void> {
    return fromDataSource(
      () => mockApi.farms.remove(farmId),
      () => apiClient.delete<void>(`/farms/${farmId}`),
    );
  },
};

export const plotsService = {
  listByFarm(farmId: string, query?: ListQuery): Promise<Plot[]> {
    return fromDataSource(
      () => mockApi.farms.listPlots(farmId, query),
      () => apiClient.get<Plot[]>(withQuery(`/farms/${farmId}/plots`, query)),
    );
  },

  create(farmId: string, input: CreatePlotInput): Promise<Plot> {
    return fromDataSource(
      () => mockApi.farms.createPlot(farmId, input),
      () => apiClient.post<Plot>(`/farms/${farmId}/plots`, input),
    );
  },

  update(plotId: string, input: UpdatePlotInput): Promise<Plot> {
    return fromDataSource(
      () => mockApi.farms.updatePlot(plotId, input),
      () => apiClient.patch<Plot>(`/plots/${plotId}`, input),
    );
  },

  remove(plotId: string): Promise<void> {
    return fromDataSource(
      () => mockApi.farms.removePlot(plotId),
      () => apiClient.delete<void>(`/plots/${plotId}`),
    );
  },
};
