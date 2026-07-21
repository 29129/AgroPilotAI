"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { farmKeys } from "@/hooks/query-keys";
import { farmsService, plotsService } from "@/services/farms.service";
import type { ListQuery } from "@/types/common";
import type {
  CreateFarmInput,
  CreatePlotInput,
  FarmsListQuery,
  UpdateFarmInput,
  UpdatePlotInput,
} from "@/types/farms";

export function useFarms(query?: FarmsListQuery) {
  return useQuery({
    queryKey: farmKeys.list(query),
    queryFn: () => farmsService.list(query),
  });
}

export function useFarm(farmId?: string) {
  return useQuery({
    queryKey: farmKeys.detail(farmId ?? ""),
    queryFn: () => farmsService.getById(farmId as string),
    enabled: Boolean(farmId),
  });
}

export function useFarmPlots(farmId?: string, query?: ListQuery) {
  return useQuery({
    queryKey: farmKeys.plots(farmId ?? "", query),
    queryFn: () => plotsService.listByFarm(farmId as string, query),
    enabled: Boolean(farmId),
  });
}

export function useCreateFarm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFarmInput) => farmsService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: farmKeys.all }),
  });
}

export function useUpdateFarm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ farmId, input }: { farmId: string; input: UpdateFarmInput }) =>
      farmsService.update(farmId, input),
    onSuccess: (farm) => {
      queryClient.setQueryData(farmKeys.detail(farm.id), farm);
      return queryClient.invalidateQueries({ queryKey: farmKeys.all });
    },
  });
}

export function useDeleteFarm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (farmId: string) => farmsService.remove(farmId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: farmKeys.all }),
  });
}

export function useCreatePlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ farmId, input }: { farmId: string; input: CreatePlotInput }) =>
      plotsService.create(farmId, input),
    onSuccess: (_plot, variables) =>
      queryClient.invalidateQueries({ queryKey: farmKeys.plots(variables.farmId) }),
  });
}

export function useUpdatePlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plotId, input }: { plotId: string; input: UpdatePlotInput }) =>
      plotsService.update(plotId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: farmKeys.all }),
  });
}

export function useDeletePlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plotId: string) => plotsService.remove(plotId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: farmKeys.all }),
  });
}
