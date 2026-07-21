import type { EntityId, IsoDateString, ListQuery } from "@/types/common";

export interface Farm {
  id: EntityId;
  ownerId: EntityId;
  name: string;
  province: string;
  canton: string;
  latitude?: number;
  longitude?: number;
  totalAreaHa?: number;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

export interface Plot {
  id: EntityId;
  farmId: EntityId;
  name: string;
  areaHa?: number;
  soilType?: string;
  irrigationType?: string;
}

export interface CreateFarmInput {
  name: string;
  province: string;
  canton: string;
  latitude?: number;
  longitude?: number;
  totalAreaHa?: number;
}

export type UpdateFarmInput = Partial<CreateFarmInput>;

export interface CreatePlotInput {
  name: string;
  areaHa?: number;
  soilType?: string;
  irrigationType?: string;
}

export type UpdatePlotInput = Partial<CreatePlotInput>;

export type FarmsListQuery = ListQuery;
