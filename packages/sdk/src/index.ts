import type { Health } from "@sales-support/contracts";
export async function fetchHealth(
  baseUrl: string,
  signal?: AbortSignal,
): Promise<Health> {
  const response = await fetch(
    new URL("/health", baseUrl),
    signal ? { signal } : {},
  );
  if (!response.ok) throw new Error("Service unavailable");
  const body: unknown = await response.json();
  if (
    !body ||
    typeof body !== "object" ||
    !("status" in body) ||
    body.status !== "ok" ||
    !("service" in body) ||
    !["api", "worker"].includes(String(body.service))
  )
    throw new Error("Invalid health response");
  return body as Health;
}
