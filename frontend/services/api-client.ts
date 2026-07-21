import { runtimeConfig } from "@/lib/env";
import {
  type ApiFailure,
  type ApiResponse,
  isApiResponse,
} from "@/types/api";

export class ApiClientError extends Error {
  readonly code: string;
  readonly details?: unknown;
  readonly requestId?: string;
  readonly status?: number;

  constructor(
    message: string,
    options: {
      code: string;
      details?: unknown;
      requestId?: string;
      status?: number;
    },
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = options.code;
    this.details = options.details;
    this.requestId = options.requestId;
    this.status = options.status;
  }
}

export type ApiRequestOptions = Omit<RequestInit, "body" | "headers" | "method"> & {
  body?: unknown;
  headers?: HeadersInit;
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
};

function isRawRequestBody(value: unknown): value is BodyInit {
  return (
    typeof value === "string" ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof Blob ||
    value instanceof ArrayBuffer
  );
}

function toApiError(failure: ApiFailure, status: number): ApiClientError {
  return new ApiClientError(failure.error.message, {
    code: failure.error.code,
    details: failure.error.details,
    requestId: failure.meta.requestId,
    status,
  });
}

function buildUrl(path: string): string {
  if (!runtimeConfig.apiUrl) {
    throw new ApiClientError(
      "La URL pública de la API no está configurada.",
      { code: "API_URL_MISSING" },
    );
  }

  return `${runtimeConfig.apiUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new ApiClientError("La API devolvió una respuesta no compatible.", {
      code: "INVALID_RESPONSE",
      status: response.status,
    });
  }

  try {
    return await response.json();
  } catch {
    throw new ApiClientError("No se pudo interpretar la respuesta de la API.", {
      code: "INVALID_RESPONSE",
      status: response.status,
    });
  }
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  let body: BodyInit | undefined;
  if (options.body !== undefined && options.body !== null) {
    if (isRawRequestBody(options.body)) {
      body = options.body;
    } else {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...options,
      body,
      headers,
      method: options.method ?? "GET",
    });
  } catch (error) {
    if (error instanceof ApiClientError) throw error;

    throw new ApiClientError("No fue posible conectar con la API.", {
      code: "NETWORK_ERROR",
      details: error,
    });
  }

  const payload = await parseResponse(response);
  if (!isApiResponse(payload)) {
    throw new ApiClientError("La API no respetó el contrato de respuesta.", {
      code: "CONTRACT_ERROR",
      status: response.status,
    });
  }

  if (!payload.success) throw toApiError(payload, response.status);

  if (!response.ok) {
    throw new ApiClientError("La API respondió con un estado inesperado.", {
      code: "HTTP_ERROR",
      requestId: payload.meta.requestId,
      status: response.status,
    });
  }

  return payload.data as T;
}

export const apiClient = {
  get<T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return request<T>(path, { ...options, body, method: "POST" });
  },
  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return request<T>(path, { ...options, body, method: "PATCH" });
  },
  put<T>(
    path: string,
    body?: unknown,
    options?: Omit<ApiRequestOptions, "method" | "body">,
  ) {
    return request<T>(path, { ...options, body, method: "PUT" });
  },
  delete<T>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};

export type { ApiResponse };
