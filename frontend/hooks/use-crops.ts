"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cropKeys } from "@/hooks/query-keys";
import { cropsService } from "@/services/crops.service";
import { diagnosesService } from "@/services/diagnoses.service";
import type { ListQuery } from "@/types/common";
import type { CreateCropInput, CropsListQuery, UpdateCropInput } from "@/types/crops";
import type { CreateDiagnosisInput } from "@/types/diagnoses";

export function useCrops(query?: CropsListQuery) {
  return useQuery({
    queryKey: cropKeys.list(query),
    queryFn: () => cropsService.list(query),
  });
}

export function useCrop(cropId?: string) {
  return useQuery({
    queryKey: cropKeys.detail(cropId ?? ""),
    queryFn: () => cropsService.getById(cropId as string),
    enabled: Boolean(cropId),
  });
}

export function useCropDiagnoses(cropId?: string, query?: ListQuery) {
  return useQuery({
    queryKey: cropKeys.diagnoses(cropId ?? "", query),
    queryFn: () => diagnosesService.listByCrop(cropId as string, query),
    enabled: Boolean(cropId),
  });
}

export function useDiagnosis(diagnosisId?: string) {
  return useQuery({
    queryKey: ["diagnoses", "detail", diagnosisId ?? ""] as const,
    queryFn: () => diagnosesService.getById(diagnosisId as string),
    enabled: Boolean(diagnosisId),
  });
}

export function useCreateCrop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCropInput) => cropsService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cropKeys.all }),
  });
}

export function useUpdateCrop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cropId, input }: { cropId: string; input: UpdateCropInput }) =>
      cropsService.update(cropId, input),
    onSuccess: (crop) => {
      queryClient.setQueryData(cropKeys.detail(crop.id), crop);
      return queryClient.invalidateQueries({ queryKey: cropKeys.all });
    },
  });
}

export function useDeleteCrop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cropId: string) => cropsService.remove(cropId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cropKeys.all }),
  });
}

export function useCreateDiagnosis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cropId, input }: { cropId: string; input: CreateDiagnosisInput }) =>
      diagnosesService.create(cropId, input),
    onSuccess: (diagnosis) =>
      queryClient.invalidateQueries({ queryKey: cropKeys.diagnoses(diagnosis.cropId) }),
  });
}
