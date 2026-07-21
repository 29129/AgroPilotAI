import { runtimeConfig } from "@/lib/env";

export function fromDataSource<T>(
  mockRequest: () => Promise<T>,
  apiRequest: () => Promise<T>,
): Promise<T> {
  return runtimeConfig.useMocks ? mockRequest() : apiRequest();
}

export function withQuery(
  path: string,
  query?: object,
): string {
  if (!query) return path;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  const serialized = params.toString();
  return serialized ? `${path}?${serialized}` : path;
}
