import type { FastifyInstance } from "fastify";

export function installSafeErrors(app: FastifyInstance): void {
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
  app.setErrorHandler((error, request, reply) => {
    const status = error.validation ? 400 : error.statusCode;
    const allowed: Record<number, [string, string]> = {
      400: ["INVALID_REQUEST", "The request is invalid."],
      401: ["UNAUTHENTICATED", "Authentication is required."],
      403: ["FORBIDDEN", "This operation is not permitted."],
      404: ["NOT_FOUND", "The resource was not found."],
      409: ["CONFLICT", "The resource has changed. Refresh and try again."],
      413: ["PAYLOAD_TOO_LARGE", "The request exceeds the supported size."],
      415: ["UNSUPPORTED_MEDIA_TYPE", "The request content type is unsupported."],
      429: ["RATE_LIMITED", "Too many requests. Try again later."],
      503: ["SERVICE_UNAVAILABLE", "The service is temporarily unavailable."],
    };
    const entry = status ? allowed[status] : undefined;
    const code = entry?.[0] ?? "INTERNAL_ERROR";
    const message = entry?.[1] ?? "The request could not be completed.";
    if (!entry) request.log.error({ code, requestId: request.id }, "Request failed");
    return reply.code(entry && status ? status : 500).send({
      version: 1,
      error: { code, message, requestId: request.id },
    });
  });
}
