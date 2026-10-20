import Fastify, { LogController } from "fastify";
import {
  getHealth,
  registerIdentityRoutes,
  registerTenancyRoutes,
  type SupabaseIdentity,
  type TenancyRepository,
} from "@sales-support/backend";
import { loggerOptions } from "@sales-support/observability";
export function createServer(
  services?: {
    identity: SupabaseIdentity;
    tenancy: TenancyRepository;
  },
  logStream?: { write: (message: string) => void },
) {
  const app = Fastify({
    ajv: { customOptions: { removeAdditional: false } },
    logger: logStream ? { ...loggerOptions, stream: logStream } : loggerOptions,
    logController: new LogController({ disableRequestLogging: true }),
    bodyLimit: 16384,
    requestTimeout: 10000,
  });
  app.get("/health", async () => getHealth("api"));
  app.setErrorHandler((error, _request, reply) => {
    const value = error as {
      code?: string;
      message?: string;
      validation?: unknown;
    };
    const unauthorized = value.message === "Unauthorized";
    const forbidden = value.code === "42501" || value.message === "Forbidden";
    const bad =
      value.validation ||
      ["22023", "23514", "23505"].includes(value.code ?? "");
    reply.code(unauthorized ? 401 : forbidden ? 403 : bad ? 400 : 503).send({
      error: unauthorized
        ? "Sign in required."
        : forbidden
          ? "Access denied. Sign in again if your session is old."
          : bad
            ? "Check the submitted values."
            : "The service could not complete the request.",
    });
  });
  app.addHook("onSend", async (_r, reply, payload) => {
    reply.header("Cache-Control", "no-store");
    reply.header("X-Content-Type-Options", "nosniff");
    return payload;
  });
  if (services) {
    const attempts = new Map<string, { count: number; until: number }>();
    app.addHook("onRequest", async (request, reply) => {
      if (!request.url.startsWith("/auth/")) return;
      const now = Date.now();
      const key = request.ip;
      const entry = attempts.get(key);
      if (entry && entry.until > now && entry.count >= 60) {
        reply.code(429).send({ error: "Please wait before trying again." });
        return;
      }
      if (!entry || entry.until <= now) {
        if (attempts.size > 10000)
          for (const [key, value] of attempts)
            if (value.until <= now) attempts.delete(key);
        if (attempts.size > 10000) {
          reply.code(503).send({ error: "Please try again later." });
          return;
        }
        attempts.set(key, { count: 1, until: now + 60000 });
      } else entry.count++;
    });
    registerIdentityRoutes(app, services.identity, async (token) =>
      services.tenancy.requireRecentSession(
        await services.identity.verify(token),
      ),
    );
    registerTenancyRoutes(app, services.tenancy, (token) =>
      services.identity.verify(token),
    );
  }
  return app;
}
