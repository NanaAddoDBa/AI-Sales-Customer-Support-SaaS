import type { Readiness } from "@sales-support/contracts";
import type { ReadinessProbe } from "../ports/readiness-probe.js";

export async function getReadiness(
  service: Readiness["service"],
  probe?: ReadinessProbe,
  timeoutMs = 1000,
): Promise<Readiness> {
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 5000)
    throw new Error("Readiness timeout must be between 1 and 5000 ms");
  const unavailable: Readiness = { version: 1, service, status: "not_ready" };
  if (!probe) return unavailable;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<boolean>((resolve) => {
      timer = setTimeout(() => {
        controller.abort();
        resolve(false);
      }, timeoutMs);
    });
    const result = await Promise.race([
      Promise.resolve().then(() => probe(controller.signal)),
      timeout,
    ]);
    return { version: 1, service, status: result === true ? "ready" : "not_ready" };
  } catch {
    return unavailable;
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
