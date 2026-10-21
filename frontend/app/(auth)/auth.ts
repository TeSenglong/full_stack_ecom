export type UserRole = "USER" | "STAFF" | "ADMIN";

export interface User {
  id: number;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  displayName: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}
