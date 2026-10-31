import { randomUUID } from "node:crypto";
import Fastify from "fastify";
import {
  getHealth,
  getReadiness,
  type ReadinessProbe,
} from "@sales-support/backend";
import { loggerOptions } from "@sales-support/observability";

export interface WorkerServerOptions {
  logging?: boolean;
  readiness?: ReadinessProbe;
  readinessTimeoutMs?: number;
}

export function createServer(options: WorkerServerOptions = {}) {
  const app = Fastify({
    logger: options.logging === false ? false : loggerOptions,
    bodyLimit: 16 * 1024,
    requestTimeout: 15000,
    connectionTimeout: 10000,
    requestIdHeader: false,
    genReqId: () => randomUUID(),
  });
  app.addHook("onSend", async (request, reply, payload) => {
    reply.header("x-request-id", request.id);
    reply.header("cache-control", "no-store");
    reply.header("x-content-type-options", "nosniff");
    return payload;
  });
  app.setNotFoundHandler((request, reply) => {
    return reply.code(404).send({
      version: 1,
      error: {
        code: "NOT_FOUND",
        message: "The resource was not found.",
        requestId: request.id,
      },
    });
  });
  app.setErrorHandler((_error, request, reply) => {
    request.log.error({ requestId: request.id }, "Worker request failed");
    return reply.code(500).send({
      version: 1,
      error: {
        code: "INTERNAL_ERROR",
        message: "The request could not be completed.",
        requestId: request.id,
      },
    });
  });
  app.get("/health", async () => getHealth("worker"));
  app.get("/ready", async (_request, reply) => {
    const readiness = await getReadiness(
      "worker",
      options.readiness,
      options.readinessTimeoutMs,
    );
    return reply.code(readiness.status === "ready" ? 200 : 503).send(readiness);
  });
  return app;
}
