function getOptionalPublicVariable(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

const mockMode = getOptionalPublicVariable("NEXT_PUBLIC_USE_MOCKS");

export const runtimeConfig = {
  apiUrl: getOptionalPublicVariable("NEXT_PUBLIC_API_URL"),
  // The frontend remains explorable before a backend environment is available.
  // Set NEXT_PUBLIC_USE_MOCKS=false to route every service to the real API.
  useMocks: mockMode === undefined ? true : mockMode === "true",
} as const;
