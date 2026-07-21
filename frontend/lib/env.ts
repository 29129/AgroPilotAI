function getOptionalPublicVariable(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export const runtimeConfig = {
  apiUrl: getOptionalPublicVariable("NEXT_PUBLIC_API_URL"),
  useMocks: getOptionalPublicVariable("NEXT_PUBLIC_USE_MOCKS") === "true",
} as const;
