export function readRuntimeConfig(
  env: Record<string, string | undefined>,
  service: "api" | "worker",
) {
  const key = service === "api" ? "PORT" : "WORKER_HEALTH_PORT";
  const raw = env[key] ?? (service === "api" ? "3001" : "3002");
  if (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > 65535)
    throw new Error(key + " must be a port between 1 and 65535");
  const host = env.HOST ?? "127.0.0.1";
  if (!["127.0.0.1", "0.0.0.0", "::1"].includes(host))
    throw new Error("HOST must be a supported bind address");
  return { host, port: Number(raw) };
}
