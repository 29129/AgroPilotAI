import type { EntityId, IsoDateString } from "@/types/common";

export type DiagnosisStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export type DiagnosisSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface DiagnosisFinding {
  condition: string;
  confidence: number;
  severity?: DiagnosisSeverity;
  description?: string;
}

/**
 * Pending API_CONTRACT v1: the diagnosis-result schema has not been published.
 * These fields cover the documented image, confidence and technical-review UI.
 */
export interface Diagnosis {
  id: EntityId;
  cropId: EntityId;
  status: DiagnosisStatus;
  imageUrl?: string;
  symptoms?: string;
  summary?: string;
  findings?: DiagnosisFinding[];
  confidence?: number;
  requiresTechnicalReview: boolean;
  createdAt: IsoDateString;
  updatedAt?: IsoDateString;
}

/** Pending API_CONTRACT v1: confirm the multipart field name and optional metadata. */
export interface CreateDiagnosisInput {
  image: File;
  symptoms?: string;
}
