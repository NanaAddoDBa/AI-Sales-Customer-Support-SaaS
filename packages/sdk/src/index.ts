import {
  parseHealth,
  parseReadiness,
  parseApiError,
  type Health,
  type Readiness,
} from "@sales-support/contracts";

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly requestId?: string,
  ) {
    super("The API request could not be completed.");
    this.name = "ApiClientError";
  }
}
export interface ClientOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}
export function createClient(options: ClientOptions) {
  const base = new URL(options.baseUrl);
  if (
    base.username || base.password || base.search || base.hash ||
    base.pathname !== "/" ||
    (base.protocol !== "https:" && !(base.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname)))
  ) throw new Error("Use an HTTPS API origin or a loopback development origin");
  const timeoutMs = options.timeoutMs ?? 10000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000)
    throw new Error("API timeout must be between 1 and 30000 ms");
  const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
  async function read<T>(path: string, decode: (value: unknown) => T, signal?: AbortSignal, allowUnavailable = false): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) controller.abort();
    try {
      const response = await fetcher(new URL(path, base), {
        method: "GET",
        headers: { accept: "application/json" },
        credentials: "omit",
        redirect: "error",
        signal: controller.signal,
      });
      if (!response.ok && !(allowUnavailable && response.status === 503)) {
        let code = "INVALID_RESPONSE";
        let requestId: string | undefined;
        try {
          const envelope = parseApiError(await response.json());
          code = envelope.error.code;
          requestId = envelope.error.requestId;
        } catch { /* Never expose upstream HTML or arbitrary error text. */ }
        throw new ApiClientError(response.status, code, requestId);
      }
      try {
        return decode(await response.json());
      } catch {
        throw new ApiClientError(response.status, "INVALID_RESPONSE");
      }
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
    }
  }
  return {
    health: (signal?: AbortSignal): Promise<Health> => read("/health", parseHealth, signal),
    readiness: (signal?: AbortSignal): Promise<Readiness> => read("/ready", parseReadiness, signal, true),
  };
}
export function fetchHealth(baseUrl: string, signal?: AbortSignal): Promise<Health> {
  return createClient({ baseUrl }).health(signal);
}
