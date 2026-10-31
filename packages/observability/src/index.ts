const knownCodes = new Set([
  "INVALID_REQUEST", "UNAUTHENTICATED", "FORBIDDEN", "NOT_FOUND",
  "CONFLICT", "PAYLOAD_TOO_LARGE", "RATE_LIMITED", "SERVICE_UNAVAILABLE",
]);
function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

/** Structured telemetry is an allowlist, not a dump of arbitrary context. */
export function safeTelemetry(context: Record<string, unknown>) {
  const result: Record<string, string | number> = {};
  for (const key of ["requestId", "organizationId", "operationId", "jobId"]) {
    const value = context[key];
    if (typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_:-]{0,127}$/.test(value))
      result[key] = value;
  }
  if (typeof context.durationMs === "number" && Number.isFinite(context.durationMs) && context.durationMs >= 0)
    result.durationMs = Math.min(context.durationMs, 86400000);
  return result;
}

export const loggerOptions = {
  level: "info",
  redact: {
    paths: [
      "req.headers.authorization", "req.headers.cookie",
      'req.headers["x-api-key"]', 'res.headers["set-cookie"]',
      "req.body", "res.body", "body", "token", "password", "secret",
      "authorization", "cookie", "email", "prompt", "completion",
    ],
    censor: "[REDACTED]",
  },
  serializers: {
    req(value: unknown) {
      const request = object(value);
      const method = typeof request.method === "string" && /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(request.method) ? request.method : "UNKNOWN";
      return { method };
    },
    res(value: unknown) {
      const status = object(value).statusCode;
      return { statusCode: typeof status === "number" ? status : 0 };
    },
    err(value: unknown) {
      const code = object(value).code;
      // Fastify requires these fields; neither contains the original error.
      return {
        type: "Error",
        message: "An operation failed.",
        stack: "",
        code: typeof code === "string" && knownCodes.has(code) ? code : "INTERNAL_ERROR",
      };
    },
  },
};
