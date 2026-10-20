import Fastify from "fastify";
import { getHealth } from "@sales-support/backend";
import { loggerOptions } from "@sales-support/observability";
export function createServer() {
  const app = Fastify({ logger: loggerOptions });
  app.get("/health", async () => getHealth("worker"));
  return app;
}
