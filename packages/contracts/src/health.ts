import { member, onlyKeys, record, version } from "./validation.js";

export interface Health {
  status: "ok";
  service: "api" | "worker";
}

export interface Readiness {
  version: 1;
  status: "ready" | "not_ready";
  service: "api" | "worker";
}

export function parseHealth(value: unknown): Health {
  const data = record(value);
  onlyKeys(data, ["status", "service"]);
  return {
    status: member(data.status, ["ok"]),
    service: member(data.service, ["api", "worker"]),
  };
}

export function parseReadiness(value: unknown): Readiness {
  const data = record(value);
  onlyKeys(data, ["version", "status", "service"]);
  return {
    version: version(data.version),
    status: member(data.status, ["ready", "not_ready"]),
    service: member(data.service, ["api", "worker"]),
  };
}
