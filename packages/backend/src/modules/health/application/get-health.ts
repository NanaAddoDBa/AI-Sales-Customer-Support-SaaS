import type { Health } from "@sales-support/contracts";
export function getHealth(service: Health["service"]): Health {
  return { status: "ok", service };
}
