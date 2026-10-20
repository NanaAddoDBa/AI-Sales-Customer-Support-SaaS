import http from "node:http";
import { isDeepStrictEqual } from "node:util";
import fs from "node:fs";
import { backupVolumes } from "./local-backup.mjs";
import { execFileSync as execute } from "node:child_process";

// Docker Desktop can ignore a bridge's default bind address. Recreate only the
// three published project containers with explicit loopback mappings, retaining
// their exact image, environment, mounted data and network aliases in memory.
function execFileSync(...args) {
  try {
    return execute(...args);
  } catch {
    throw new Error(
      "Local backup/container command failed; raw output withheld",
    );
  }
}

export async function bindLocalPorts() {
  const endpoint = JSON.parse(
    execFileSync(
      "docker",
      ["context", "inspect", "--format", "{{json .Endpoints.docker.Host}}"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    ),
  );
  const socketPath = endpoint.startsWith("unix://")
    ? endpoint.slice(7)
    : endpoint.startsWith("npipe:////./pipe/")
      ? "\\\\.\\pipe\\" + endpoint.slice("npipe:////./pipe/".length)
      : null;
  if (!socketPath) throw new Error("Only a local Docker socket is supported");
  async function request(method, path, body) {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          socketPath,
          path: "/v1.47" + path,
          method,
          headers: body ? { "Content-Type": "application/json" } : {},
        },
        (res) => {
          let text = "";
          res.setEncoding("utf8");
          res.on("data", (part) => {
            text += part;
          });
          res.on("end", () => {
            if ((res.statusCode ?? 500) >= 300 && res.statusCode !== 304) {
              reject(
                new Error(
                  "Project container operation failed (response withheld)",
                ),
              );
              return;
            }
            resolve(text ? JSON.parse(text) : null);
          });
        },
      );
      req.on("error", () =>
        reject(new Error("Local Docker socket unavailable")),
      );
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }
  for (const service of ["db", "kong", "inbucket"]) {
    const name = `supabase_${service}_sales-support-local`;
    const prior = await request("GET", `/containers/${name}/json`);
    if (
      prior.Name !== "/" + name ||
      !prior.Config.Image.startsWith("public.ecr.aws/supabase/")
    )
      throw new Error("Unexpected local service identity");
    const bindings = Object.values(prior.NetworkSettings.Ports).flatMap(
      (value) => value ?? [],
    );
    if (
      bindings.length &&
      bindings.every((binding) => binding.HostIp === "127.0.0.1")
    )
      continue;
    const expectedPort = { db: "55422", kong: "55421", inbucket: "55424" }[
      service
    ];
    const configured = Object.values(
      prior.HostConfig.PortBindings ?? {},
    ).flatMap((v) => v ?? []);
    if (configured.length !== 1 || configured[0].HostPort !== expectedPort)
      throw new Error("Unexpected project port configuration");
    const host = {
      ...prior.HostConfig,
      PortBindings: Object.fromEntries(
        Object.entries(prior.HostConfig.PortBindings).map(([port, values]) => [
          port,
          values.map((value) => ({ ...value, HostIp: "127.0.0.1" })),
        ]),
      ),
    };
    // Anonymous image volumes also need their original data retained. Never use
    // volume-removing deletion or replace a mounted data directory.
    const bound = new Set(
      (host.Binds ?? []).map((value) => value.split(":")[1]),
    );
    for (const mount of prior.Mounts)
      if (!bound.has(mount.Destination) && mount.Type === "volume") {
        host.Binds = [
          ...(host.Binds ?? []),
          `${mount.Name}:${mount.Destination}:${mount.RW ? "rw" : "ro"}`,
        ];
      }
    const network = {
      EndpointsConfig: Object.fromEntries(
        Object.entries(prior.NetworkSettings.Networks).map(
          ([network, value]) => [
            network,
            {
              Aliases: value.Aliases?.filter(
                (alias) => alias !== prior.Id.slice(0, 12),
              ) ?? [name],
            },
          ],
        ),
      ),
    };
    const directory = `.tooling/backups/${Date.now()}-${service}`;
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(
      `${directory}/container.json`,
      JSON.stringify(prior, null, 2),
      { mode: 0o600 },
    );
    if (prior.State.Running)
      await request("POST", `/containers/${prior.Id}/stop?t=30`);
    if (service === "kong") {
      const archive = execFileSync(
        "docker",
        ["cp", `${prior.Id}:/home/kong`, "-"],
        {
          stdio: ["ignore", "pipe", "pipe"],
          maxBuffer: 32 * 1024 * 1024,
          windowsHide: true,
        },
      );
      fs.writeFileSync(`${directory}/kong.tar`, archive, { mode: 0o600 });
    }
    backupVolumes(
      prior.Mounts.filter((m) => m.Type === "volume").map((m) => m.Name),
      directory,
    );
    await request(
      "POST",
      `/containers/${prior.Id}/rename?name=${name}-binding-backup`,
    );
    let created;
    try {
      created = await request("POST", `/containers/create?name=${name}`, {
        ...prior.Config,
        HostConfig: host,
        NetworkingConfig: network,
      });
      if (service === "kong") {
        execFileSync("docker", ["cp", "-a", "-", `${created.Id}:/home`], {
          input: fs.readFileSync(`${directory}/kong.tar`),
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true,
        });
      }
      await request("POST", `/containers/${created.Id}/start`);
      const deadline = Date.now() + 90000;
      let ready = false;
      while (Date.now() < deadline) {
        const current = await request("GET", `/containers/${created.Id}/json`);
        if (!current.State.Running)
          throw new Error("Rebound local service stopped");
        if (
          !current.State.Health ||
          current.State.Health.Status === "healthy"
        ) {
          ready = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      if (!ready)
        throw new Error("Rebound local service did not become healthy");
      const current = await request("GET", `/containers/${created.Id}/json`);
      if (
        Object.values(current.NetworkSettings.Ports)
          .flatMap((v) => v ?? [])
          .some((v) => v.HostIp !== "127.0.0.1")
      )
        throw new Error("Explicit loopback verification failed");
      if (
        current.Image !== prior.Image ||
        current.Mounts.length !== prior.Mounts.length ||
        prior.Mounts.some(
          (mount) =>
            !current.Mounts.some(
              (next) =>
                mount.Source === next.Source &&
                mount.Destination === next.Destination &&
                mount.RW === next.RW,
            ),
        )
      )
        throw new Error("Local data mounts changed");
      for (const key of [
        "Image",
        "Env",
        "Cmd",
        "Entrypoint",
        "Labels",
        "Healthcheck",
        "User",
        "WorkingDir",
      ])
        if (!isDeepStrictEqual(current.Config[key], prior.Config[key]))
          throw new Error("Service configuration changed");
      await request("DELETE", `/containers/${prior.Id}?v=false`);
    } catch {
      if (created) {
        await request("POST", `/containers/${created.Id}/stop?t=5`).catch(
          () => {},
        );
        await request("DELETE", `/containers/${created.Id}?v=false`).catch(
          () => {},
        );
      }
      await request(
        "POST",
        `/containers/${prior.Id}/rename?name=${name}`,
      ).catch(() => {});
      throw new Error(
        "Explicit loopback binding failed; original container and its data retained stopped",
      );
    }
    if (service === "db") {
      // Replacing Postgres invalidates connections held by the local services.
      // Restart these existing containers; only the three published services are recreated.
      for (const dependent of ["auth", "rest", "storage"]) {
        const dependentName = `supabase_${dependent}_sales-support-local`;
        await request("POST", `/containers/${dependentName}/restart?t=15`);
        const deadline = Date.now() + 90000;
        let ready = false;
        while (Date.now() < deadline) {
          const current = await request(
            "GET",
            `/containers/${dependentName}/json`,
          );
          if (
            current.State.Running &&
            (!current.State.Health || current.State.Health.Status === "healthy")
          ) {
            ready = true;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        if (!ready)
          throw new Error("Local dependent service did not become healthy");
      }
    }
  }
}
