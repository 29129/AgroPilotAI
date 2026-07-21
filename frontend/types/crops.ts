import type { EntityId, IsoDateString, ListQuery } from "@/types/common";

export type CropStatus = "ACTIVE" | "HARVESTED" | "CANCELLED";

export interface Crop {
  id: EntityId;
  plotId: EntityId;
  cropType: string;
  variety?: string;
  sowingDate?: IsoDateString;
  expectedHarvestDate?: IsoDateString;
  growthStage?: string;
  status: CropStatus;
}

export interface CreateCropInput {
  plotId: EntityId;
  cropType: string;
  variety?: string;
  sowingDate?: IsoDateString;
  expectedHarvestDate?: IsoDateString;
  growthStage?: string;
}

export type UpdateCropInput = Partial<Omit<CreateCropInput, "plotId">> & {
  status?: CropStatus;
};

export type CropsListQuery = ListQuery & {
  plotId?: EntityId;
  status?: CropStatus;
};
