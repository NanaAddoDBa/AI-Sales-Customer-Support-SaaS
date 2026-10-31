import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import {
  getHealth,
  getReadiness,
  type ReadinessProbe,
} from "@sales-support/backend";
import { loggerOptions } from "@sales-support/observability";
import { installSafeErrors } from "./http/errors.js";

export interface ServerOptions {
  logging?: boolean;
  readiness?: ReadinessProbe;
  readinessTimeoutMs?: number;
}
export function createServer(options: ServerOptions = {}) {
  const app = Fastify({
    logger: options.logging === false ? false : loggerOptions,
    bodyLimit: 16 * 1024,
    requestTimeout: 15000,
    connectionTimeout: 10000,
    keepAliveTimeout: 5000,
    requestIdHeader: false,
    genReqId: () => randomUUID(),
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false } },
  });
  app.addHook("onSend", async (request, reply, payload) => {
    reply.header("x-request-id", request.id);
    reply.header("cache-control", "no-store");
    reply.header("x-content-type-options", "nosniff");
    return payload;
  });
  installSafeErrors(app);
  app.get("/health", async () => getHealth("api"));
  app.get("/ready", async (_request, reply) => {
    const readiness = await getReadiness(
      "api",
      options.readiness,
      options.readinessTimeoutMs,
    );
    return reply.code(readiness.status === "ready" ? 200 : 503).send(readiness);
  });
  return app;
}
