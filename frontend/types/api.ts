export interface ApiMeta {
  requestId: string;
  page?: number;
  limit?: number;
  total?: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: Pick<ApiMeta, "requestId">;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function isApiResponse(value: unknown): value is ApiResponse<unknown> {
  if (!value || typeof value !== "object") return false;

  const response = value as Record<string, unknown>;
  const meta = response.meta as Record<string, unknown> | undefined;

  if (typeof response.success !== "boolean" || !meta) return false;
  if (typeof meta.requestId !== "string") return false;

  if (response.success) return "data" in response;

  const error = response.error as Record<string, unknown> | undefined;
  return typeof error?.code === "string" && typeof error.message === "string";
}
