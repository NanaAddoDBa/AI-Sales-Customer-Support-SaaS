import { spawn } from "node:child_process";
import fs from "node:fs";
const config = JSON.parse(
  fs.readFileSync(".tooling/local-runtime.json", "utf8"),
);
if (config.API_URL !== "http://127.0.0.1:55421")
  throw new Error("Not a local test runtime");
const child = spawn(process.execPath, ["apps/api/dist/main.js"], {
  stdio: "inherit",
  windowsHide: true,
  env: {
    ...process.env,
    PORT: "19311",
    SUPABASE_URL: config.API_URL,
    SUPABASE_PUBLISHABLE_KEY: config.PUBLISHABLE_KEY,
    API_DATABASE_URL: config.API_DATABASE_URL,
    DASHBOARD_URL: "http://127.0.0.1:5183",
  },
});
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => child.kill());
child.once("exit", (code) => {
  process.exitCode = code ?? 1;
});
