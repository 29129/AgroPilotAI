function getOptionalPublicVariable(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

const mockMode = getOptionalPublicVariable("NEXT_PUBLIC_USE_MOCKS");

export const runtimeConfig = {
  apiUrl: getOptionalPublicVariable("NEXT_PUBLIC_API_URL") ?? "http://localhost:4000/api/v1",
  useMocks: mockMode === "true",
} as const;
