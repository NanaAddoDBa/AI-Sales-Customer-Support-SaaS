import { bindLocalPorts } from "./bind-local-ports.mjs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { localStatus } from "./local-runtime.mjs";
import { localNetwork, assertLoopbackBindings } from "./local-network.mjs";
if (process.env.LOCAL_DB_TESTS !== "1")
  throw new Error(
    "Set LOCAL_DB_TESTS=1 to acknowledge disposable project-local replay",
  );
const config = localStatus();
assertLoopbackBindings();
const require = createRequire(
  new URL("../packages/database/package.json", import.meta.url),
);
const { Pool } = require("pg");
async function cli(args) {
  try {
    execFileSync(
      process.execPath,
      [
        "node_modules/supabase/dist/supabase.js",
        ...args,
        "--network-id",
        localNetwork,
      ],
      { stdio: "pipe", windowsHide: true },
    );
    if (process.platform === "win32") await bindLocalPorts();
    assertLoopbackBindings();
  } catch {
    try {
      execFileSync(
        process.execPath,
        [
          "node_modules/supabase/dist/supabase.js",
          "stop",
          "--network-id",
          localNetwork,
        ],
        { stdio: "pipe", windowsHide: true },
      );
    } catch {
      /* Report failure without exposing CLI keys. */
    }
    throw new Error(
      "Local migration command or binding verification failed; raw CLI output withheld",
    );
  }
}
await cli([
  "db",
  "reset",
  "--local",
  "--no-seed",
  "--version",
  "20261020114217",
  "--yes",
]);
const previous = new Pool({ connectionString: config.DB_URL });
const id = randomUUID();
await previous.query(
  "insert into tenancy.organizations(id,name) values($1,$2)",
  [id, "Synthetic migration preservation"],
);
await previous.end();
await cli(["db", "push", "--local", "--yes"]);
const upgraded = new Pool({ connectionString: config.DB_URL });
assert.equal(
  (
    await upgraded.query("select name from tenancy.organizations where id=$1", [
      id,
    ])
  ).rows[0]?.name,
  "Synthetic migration preservation",
);
assert.equal(
  (
    await upgraded.query(
      "select count(*)::int as count from supabase_migrations.schema_migrations",
    )
  ).rows[0]?.count,
  2,
);
await upgraded.end();
await cli(["db", "reset", "--local", "--no-seed", "--yes"]);
const fresh = new Pool({ connectionString: config.DB_URL });
assert.equal(
  (
    await fresh.query(
      "select count(*)::int as count from supabase_migrations.schema_migrations",
    )
  ).rows[0]?.count,
  2,
);
assert.equal(
  (
    await fresh.query(
      "select count(*)::int as count from tenancy.organizations",
    )
  ).rows[0]?.count,
  0,
);
await fresh.end();
assertLoopbackBindings();
console.log(
  "Prior schema upgraded with synthetic data preserved; empty database rebuilt from both migrations. No customer or hosted data accessed.",
);
