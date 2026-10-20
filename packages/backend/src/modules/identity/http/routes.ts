import type { FastifyInstance } from "fastify";
import type { SupabaseIdentity } from "../infrastructure/supabase-identity.js";
const email = { type: "string", format: "email", maxLength: 254 };
const password = { type: "string", minLength: 12, maxLength: 128 };
const token = { type: "string", minLength: 16, maxLength: 8192 };
const refreshToken = { type: "string", minLength: 8, maxLength: 512 };
const object = (
  properties: Record<string, unknown>,
  required = Object.keys(properties),
) => ({ type: "object", properties, required, additionalProperties: false });
export function registerIdentityRoutes(
  app: FastifyInstance,
  identity: SupabaseIdentity,
  requireRecentSession: (token: string) => Promise<void>,
) {
  app.post<{ Body: { email: string; password: string } }>(
    "/auth/signup",
    { schema: { body: object({ email, password }) } },
    async (r) => identity.signup(r.body.email, r.body.password),
  );
  app.post<{ Body: { email: string; password: string } }>(
    "/auth/login",
    { schema: { body: object({ email, password }) } },
    async (r) => identity.login(r.body.email, r.body.password),
  );
  app.post<{ Body: { refreshToken: string } }>(
    "/auth/refresh",
    { schema: { body: object({ refreshToken }) } },
    async (r) => identity.refresh(r.body.refreshToken),
  );
  app.post<{ Body: { email: string } }>(
    "/auth/recovery",
    { schema: { body: object({ email }) } },
    async (r) => identity.recover(r.body.email),
  );
  app.post<{ Body: { tokenHash: string; type: "email" | "recovery" } }>(
    "/auth/verify",
    {
      schema: {
        body: object({
          tokenHash: token,
          type: { type: "string", enum: ["email", "recovery"] },
        }),
      },
    },
    async (r) => identity.verifyEmail(r.body.tokenHash, r.body.type),
  );
  app.post<{ Body: { accessToken: string; refreshToken: string } }>(
    "/auth/logout",
    { schema: { body: object({ accessToken: token, refreshToken }) } },
    async (r) => {
      await identity.logout(r.body.accessToken, r.body.refreshToken);
      return { message: "Signed out." };
    },
  );
  app.post<{
    Body: { accessToken: string; refreshToken: string; password: string };
  }>(
    "/auth/password",
    {
      schema: {
        body: object({ accessToken: token, refreshToken, password }),
      },
    },
    async (r) => {
      await requireRecentSession(r.body.accessToken);
      await identity.password(
        r.body.accessToken,
        r.body.refreshToken,
        r.body.password,
      );
      return { message: "Password changed. Sign in again." };
    },
  );
}
