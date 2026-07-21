import { mockApi } from "@/mocks/mock-api";
import { apiClient } from "@/services/api-client";
import { fromDataSource, withQuery } from "@/services/service-utils";
import type { ListQuery } from "@/types/common";
import type { CreateDiagnosisInput, Diagnosis } from "@/types/diagnoses";

function createDiagnosisFormData(input: CreateDiagnosisInput): FormData {
  const formData = new FormData();
  formData.set("image", input.image);
  if (input.symptoms) formData.set("symptoms", input.symptoms);
  return formData;
}

export const diagnosesService = {
  create(cropId: string, input: CreateDiagnosisInput): Promise<Diagnosis> {
    return fromDataSource(
      () => mockApi.diagnoses.create(cropId, input),
      () => apiClient.post<Diagnosis>(`/crops/${cropId}/diagnoses`, createDiagnosisFormData(input)),
    );
  },

  listByCrop(cropId: string, query?: ListQuery): Promise<Diagnosis[]> {
    return fromDataSource(
      () => mockApi.diagnoses.listByCrop(cropId, query),
      () => apiClient.get<Diagnosis[]>(withQuery(`/crops/${cropId}/diagnoses`, query)),
    );
  },

  getById(diagnosisId: string): Promise<Diagnosis> {
    return fromDataSource(
      () => mockApi.diagnoses.getById(diagnosisId),
      () => apiClient.get<Diagnosis>(`/diagnoses/${diagnosisId}`),
    );
  },
};
