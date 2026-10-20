import { execFileSync } from "node:child_process";
export const localNetwork = "sales-support-loopback";
const docker = (args) =>
  execFileSync("docker", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
export function ensureLocalNetwork() {
  const endpoint = JSON.parse(
    docker([
      "context",
      "inspect",
      "--format",
      "{{json .Endpoints.docker.Host}}",
    ]),
  );
  if (!endpoint.startsWith("npipe://") && !endpoint.startsWith("unix://"))
    throw new Error("Only a local Docker context is supported");
  const names = docker(["network", "ls", "--format", "{{.Name}}"])
    .trim()
    .split(/\r?\n/);
  if (!names.includes(localNetwork))
    docker([
      "network",
      "create",
      "-o",
      "com.docker.network.bridge.host_binding_ipv4=127.0.0.1",
      localNetwork,
    ]);
  const options = JSON.parse(
    docker([
      "network",
      "inspect",
      localNetwork,
      "--format",
      "{{json .Options}}",
    ]),
  );
  if (options["com.docker.network.bridge.host_binding_ipv4"] !== "127.0.0.1")
    throw new Error("Project network must bind published ports to loopback");
}
export function assertLoopbackBindings() {
  for (const service of ["db", "kong", "inbucket"]) {
    const ports = JSON.parse(
      docker([
        "inspect",
        `supabase_${service}_sales-support-local`,
        "--format",
        "{{json .NetworkSettings.Ports}}",
      ]),
    );
    const bindings = Object.values(ports).flatMap((value) => value ?? []);
    if (
      !bindings.length ||
      bindings.some((binding) => binding.HostIp !== "127.0.0.1")
    )
      throw new Error("Local service is not bound exclusively to loopback");
  }
}
