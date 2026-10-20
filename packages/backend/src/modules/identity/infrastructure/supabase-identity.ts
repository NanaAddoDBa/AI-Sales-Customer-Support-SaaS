import { createClient } from "@supabase/supabase-js";
import type { VerifiedClaims } from "@sales-support/database";
export interface IdentityConfig {
  url: string;
  publishableKey: string;
  redirectUrl: string;
}
export class SupabaseIdentity {
  constructor(private readonly config: IdentityConfig) {}
  private client() {
    return createClient(this.config.url, this.config.publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  async verify(token: string): Promise<VerifiedClaims> {
    const { data, error } = await this.client().auth.getUser(token);
    if (error || !data.user?.email_confirmed_at || data.user.is_anonymous)
      throw new Error("Unauthorized");
    // Decode only after authoritative verification of this exact bearer token.
    const claims: unknown = JSON.parse(
      Buffer.from(token.split(".")[1] ?? "", "base64url").toString(),
    );
    if (
      !claims ||
      typeof claims !== "object" ||
      !("sub" in claims) ||
      claims.sub !== data.user.id ||
      !("session_id" in claims) ||
      typeof claims.session_id !== "string" ||
      !("exp" in claims) ||
      typeof claims.exp !== "number" ||
      claims.exp <= Date.now() / 1000 ||
      !/^[0-9a-f-]{36}$/i.test(claims.session_id)
    )
      throw new Error("Unauthorized");
    return {
      sub: data.user.id,
      session_id: claims.session_id,
      exp: claims.exp,
      role: "authenticated",
    };
  }
  async signup(email: string, password: string) {
    const { error } = await this.client().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: this.config.redirectUrl },
    });
    if (error) throw new Error("Account request could not be completed");
    return { message: "Check your email to verify your account." };
  }
  async login(email: string, password: string) {
    const { data, error } = await this.client().auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session || !data.user.email_confirmed_at)
      throw new Error("Unauthorized");
    return this.session(data.session);
  }
  async refresh(refreshToken: string) {
    const { data, error } = await this.client().auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error || !data.session) throw new Error("Unauthorized");
    return this.session(data.session);
  }
  private session(session: {
    access_token: string;
    refresh_token: string;
    expires_at?: number;
  }) {
    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at,
    };
  }
  async logout(accessToken: string, refreshToken: string) {
    const client = this.client();
    const { error } = await client.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw new Error("Unauthorized");
    const result = await client.auth.signOut({ scope: "global" });
    if (result.error) throw new Error("Sign out failed");
  }
  async recover(email: string) {
    await this.client().auth.resetPasswordForEmail(email, {
      redirectTo: this.config.redirectUrl,
    });
    return { message: "If the account exists, a recovery email will arrive." };
  }
  async verifyEmail(tokenHash: string, type: "email" | "recovery") {
    const { data, error } = await this.client().auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (error || !data.session) throw new Error("Unauthorized");
    return this.session(data.session);
  }
  async password(accessToken: string, refreshToken: string, password: string) {
    const client = this.client();
    if (
      (
        await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
      ).error
    )
      throw new Error("Unauthorized");
    if ((await client.auth.updateUser({ password })).error)
      throw new Error("Password update failed");
    await client.auth.signOut({ scope: "global" });
  }
}
