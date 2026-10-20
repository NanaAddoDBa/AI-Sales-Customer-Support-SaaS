export interface Health {
  status: "ok";
  service: "api" | "worker";
}
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}
export type MemberRole = "owner" | "admin" | "agent" | "viewer";
export interface Organization {
  id: string;
  name: string;
  role: MemberRole;
}
export interface Membership {
  user_id: string;
  role: MemberRole;
  revoked_at: string | null;
}
