import type { EntityId, IsoDateString } from "@/types/common";

export type UserRole = "PRODUCER" | "TECHNICIAN" | "ADMIN";

export interface User {
  id: EntityId;
  name: string;
  email: string;
  role: UserRole;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
  role?: Exclude<UserRole, "ADMIN">;
}

/**
 * Pending API_CONTRACT v1: confirm whether the backend returns tokens or uses
 * secure cookies, plus the exact refresh/expiry fields.
 */
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string;
  expiresAt?: IsoDateString;
}

export interface ApiAuthPayload {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

export interface RefreshSessionInput {
  refreshToken?: string;
}
