import type {
  AuthSession,
  Organization,
  Membership,
} from "@sales-support/contracts";
export type {
  AuthSession,
  Organization,
  Membership,
} from "@sales-support/contracts";
export class MerchantClient {
  constructor(private readonly base = "/api") {}
  private async request<T>(
    path: string,
    method = "GET",
    body?: unknown,
    token?: string,
  ): Promise<T> {
    const response = await fetch(this.base + path, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    const value = await response.json();
    if (!response.ok)
      throw new Error(
        typeof value.error === "string"
          ? value.error
          : "The request could not be completed.",
      );
    return value as T;
  }
  login(email: string, password: string) {
    return this.request<AuthSession>("/auth/login", "POST", {
      email,
      password,
    });
  }
  signup(email: string, password: string) {
    return this.request<{ message: string }>("/auth/signup", "POST", {
      email,
      password,
    });
  }
  recovery(email: string) {
    return this.request<{ message: string }>("/auth/recovery", "POST", {
      email,
    });
  }
  refresh(refreshToken: string) {
    return this.request<AuthSession>("/auth/refresh", "POST", { refreshToken });
  }
  logout(session: AuthSession) {
    return this.request("/auth/logout", "POST", {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
  }
  password(session: AuthSession, password: string) {
    return this.request("/auth/password", "POST", {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      password,
    });
  }
  organizations(session: AuthSession) {
    return this.request<{ organizations: Organization[] }>(
      "/organizations",
      "GET",
      undefined,
      session.accessToken,
    );
  }
  create(session: AuthSession, name: string) {
    return this.request<{ id: string }>(
      "/organizations",
      "POST",
      { name },
      session.accessToken,
    );
  }
  members(session: AuthSession, id: string) {
    return this.request<{ members: Membership[] }>(
      `/organizations/${encodeURIComponent(id)}/members`,
      "GET",
      undefined,
      session.accessToken,
    );
  }
  invite(session: AuthSession, id: string, email: string, role: string) {
    return this.request<{ token: string }>(
      `/organizations/${encodeURIComponent(id)}/invitations`,
      "POST",
      { email, role },
      session.accessToken,
    );
  }
  accept(session: AuthSession, token: string) {
    return this.request(
      "/invitations/accept",
      "POST",
      { token },
      session.accessToken,
    );
  }
  change(
    session: AuthSession,
    id: string,
    userId: string,
    role: string,
    revoke: boolean,
  ) {
    return this.request(
      `/organizations/${encodeURIComponent(id)}/members/${encodeURIComponent(userId)}`,
      "PATCH",
      { role, revoke },
      session.accessToken,
    );
  }
}
