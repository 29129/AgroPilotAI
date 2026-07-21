import { mockApi } from "@/mocks/mock-api";
import { apiClient } from "@/services/api-client";
import { fromDataSource } from "@/services/service-utils";
import type { AuthSession, LoginInput, RefreshSessionInput, RegisterInput, User } from "@/types/auth";

/** Pending API_CONTRACT v1: token transport belongs here once cookies/Bearer are agreed. */
export const authService = {
  register(input: RegisterInput): Promise<AuthSession> {
    return fromDataSource(
      () => mockApi.auth.register(input),
      () => apiClient.post<AuthSession>("/auth/register", input),
    );
  },

  login(input: LoginInput): Promise<AuthSession> {
    return fromDataSource(
      () => mockApi.auth.login(input),
      () => apiClient.post<AuthSession>("/auth/login", input),
    );
  },

  refresh(input?: RefreshSessionInput): Promise<AuthSession> {
    return fromDataSource(
      () => mockApi.auth.refresh(input),
      () => apiClient.post<AuthSession>("/auth/refresh", input),
    );
  },

  logout(): Promise<void> {
    return fromDataSource(
      () => mockApi.auth.logout(),
      () => apiClient.post<void>("/auth/logout"),
    );
  },

  getMe(): Promise<User> {
    return fromDataSource(
      () => mockApi.auth.me(),
      () => apiClient.get<User>("/auth/me"),
    );
  },
};
