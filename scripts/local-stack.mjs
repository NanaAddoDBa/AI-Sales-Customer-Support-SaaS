import { spawn } from "node:child_process";
import {
  ensureLocalNetwork,
  assertLoopbackBindings,
  localNetwork,
} from "./local-network.mjs";
const action = process.argv[2];
const commands = {
  start: [
    "start",
    "-x",
    "realtime,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor",
  ],
  stop: ["stop"],
  advisors: [
    "db",
    "advisors",
    "--local",
    "--type",
    "security",
    "--level",
    "warn",
    "--fail-on",
    "error",
  ],
};
if (!commands[action]) throw new Error("Use start, stop or advisors");
if (action === "start") ensureLocalNetwork();
// The CLI prints development keys on success. Capture all output and report only
// status; never place raw CLI output into evidence or CI artifacts.
const child = spawn(
  process.execPath,
  [
    "node_modules/supabase/dist/supabase.js",
    ...commands[action],
    "--network-id",
    localNetwork,
  ],
  { stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
);
child.stdout.resume();
child.stderr.resume();
const code = await new Promise((resolve) => child.once("exit", resolve));
if (code !== 0) {
  console.error(
    `Local stack ${action} failed (exit ${code}). Inspect the local runtime; CLI output withheld to protect development keys.`,
  );
  process.exitCode = 1;
} else {
  if (action === "start") {
    try {
      assertLoopbackBindings();
    } catch {
      const stop = spawn(
        process.execPath,
        [
          "node_modules/supabase/dist/supabase.js",
          "stop",
          "--network-id",
          localNetwork,
        ],
        { stdio: "ignore", windowsHide: true },
      );
      await new Promise((resolve) => stop.once("exit", resolve));
      throw new Error(
        "Unsafe local port bindings rejected; project stack stopped",
      );
    }
  }
  console.log(
    `Local stack ${action} completed successfully. Development keys withheld.`,
  );
}
