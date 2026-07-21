import { mockApi } from "@/mocks/mock-api";
import { apiClient } from "@/services/api-client";
import { clearTokens, getRefreshToken, persistTokens } from "@/services/auth-session";
import { fromDataSource } from "@/services/service-utils";
import type { ApiAuthPayload, AuthSession, LoginInput, RefreshSessionInput, RegisterInput, User } from "@/types/auth";

function toSession(payload: ApiAuthPayload): AuthSession {
  const session = { user: payload.user, ...payload.tokens };
  persistTokens(session.accessToken, session.refreshToken);
  return session;
}

export const authService = {
  register(input: RegisterInput): Promise<AuthSession> {
    return fromDataSource(
      () => mockApi.auth.register(input),
      async () => {
        const { role: _role, ...registration } = input;
        return toSession(await apiClient.post<ApiAuthPayload>("/auth/register", registration));
      },
    );
  },

  login(input: LoginInput): Promise<AuthSession> {
    return fromDataSource(
      () => mockApi.auth.login(input),
      async () => toSession(await apiClient.post<ApiAuthPayload>("/auth/login", input)),
    );
  },

  refresh(input?: RefreshSessionInput): Promise<AuthSession> {
    return fromDataSource(
      () => mockApi.auth.refresh(input),
      async () => {
        const tokens = await apiClient.post<ApiAuthPayload["tokens"]>("/auth/refresh", {
          refreshToken: input?.refreshToken ?? getRefreshToken(),
        });
        const user = await apiClient.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${tokens.accessToken}` },
        });
        return toSession({ user, tokens });
      },
    );
  },

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    return fromDataSource(
      async () => { await mockApi.auth.logout(); clearTokens(); },
      async () => { if (refreshToken) await apiClient.post("/auth/logout", { refreshToken }); clearTokens(); },
    );
  },

  getMe(): Promise<User> {
    return fromDataSource(
      () => mockApi.auth.me(),
      () => apiClient.get<User>("/auth/me"),
    );
  },
};
