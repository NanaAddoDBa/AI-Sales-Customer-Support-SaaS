import {
  identifier,
  member,
  onlyKeys,
  record,
  text,
  version,
} from "./validation.js";

export const ERROR_MESSAGES = {
  INVALID_REQUEST: "The request is invalid.",
  UNAUTHENTICATED: "Authentication is required.",
  FORBIDDEN: "This operation is not permitted.",
  NOT_FOUND: "The resource was not found.",
  CONFLICT: "The resource has changed. Refresh and try again.",
  PAYLOAD_TOO_LARGE: "The request exceeds the supported size.",
  UNSUPPORTED_MEDIA_TYPE: "The request content type is unsupported.",
  RATE_LIMITED: "Too many requests. Try again later.",
  SERVICE_UNAVAILABLE: "The service is temporarily unavailable.",
  INTERNAL_ERROR: "The request could not be completed.",
} as const;
export type ApiErrorCode = keyof typeof ERROR_MESSAGES;
export interface ApiErrorEnvelope {
  version: 1;
  error: { code: ApiErrorCode; message: string; requestId: string };
}

export function parseApiError(value: unknown): ApiErrorEnvelope {
  const data = record(value);
  onlyKeys(data, ["version", "error"]);
  const error = record(data.error);
  onlyKeys(error, ["code", "message", "requestId"]);
  const code = member(
    error.code,
    Object.keys(ERROR_MESSAGES) as ApiErrorCode[],
  );
  text(error.message, 1000);
  return {
    version: version(data.version),
    error: {
      code,
      message: ERROR_MESSAGES[code],
      requestId: identifier(error.requestId),
    },
  };
}
