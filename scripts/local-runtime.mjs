import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import { assertLoopbackBindings } from "./local-network.mjs";
const require = createRequire(
  new URL("../packages/database/package.json", import.meta.url),
);
const { Pool } = require("pg");
export function localStatus() {
  const text = execFileSync(
    process.execPath,
    ["node_modules/supabase/dist/supabase.js", "status", "-o", "json"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
  );
  const config = JSON.parse(text);
  if (
    config.API_URL !== "http://127.0.0.1:55421" ||
    !config.DB_URL?.includes("@127.0.0.1:55422/")
  )
    throw new Error("Refusing a non-project-local test service");
  return config;
}
export async function prepareLocal() {
  const config = localStatus();
  assertLoopbackBindings();
  const admin = new Pool({ connectionString: config.DB_URL, max: 2 });
  try {
    for (const role of ["sales_api", "sales_worker"]) {
      const password = randomBytes(32).toString("hex");
      // Role identifiers are fixed; password is generated hex, never input data.
      await admin.query(`alter role ${role} password '${password}'`);
      const url = new URL(config.DB_URL);
      url.username = role;
      url.password = password;
      config[
        role === "sales_api" ? "API_DATABASE_URL" : "WORKER_DATABASE_URL"
      ] = url.href;
    }
  } finally {
    await admin.end();
  }
  return config;
}
if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url
) {
  const config = await prepareLocal();
  fs.mkdirSync(".tooling", { recursive: true });
  fs.writeFileSync(".tooling/local-runtime.json", JSON.stringify(config), {
    mode: 0o600,
  });
  console.log(
    "Project-local runtime configuration prepared in ignored .tooling/local-runtime.json. Values withheld.",
  );
}
