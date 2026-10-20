import fs from "node:fs";
import { randomBytes, randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { localStatus } from "./local-runtime.mjs";
const config = localStatus();
const runtime = JSON.parse(
  fs.readFileSync(".tooling/local-runtime.json", "utf8"),
);
const require = createRequire(
  new URL("../packages/backend/package.json", import.meta.url),
);
const { createClient } = require("@supabase/supabase-js");
const { Pool } = createRequire(
  new URL("../packages/database/package.json", import.meta.url),
)("pg");
const auth = createClient(config.API_URL, config.SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const db = new Pool({ connectionString: config.DB_URL });
const run = randomUUID().slice(0, 8),
  password = "Synthetic-local-" + randomBytes(12).toString("hex");
const fixtures = {
  password,
  signupEmail: `synthetic-signup-${run}@example.test`,
  organizationId: randomUUID(),
  users: {},
};
try {
  await db.query("insert into tenancy.organizations(id,name) values($1,$2)", [
    fixtures.organizationId,
    "Synthetic browser shop",
  ]);
  for (const role of [
    "owner",
    "admin",
    "agent",
    "viewer",
    "revoked",
    "invitee",
  ]) {
    const email = `synthetic-browser-${role}-${run}@example.test`;
    const { data, error } = await auth.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user)
      throw new Error("Synthetic browser fixture failed");
    fixtures.users[role] = { email, id: data.user.id };
    if (role !== "invitee")
      await db.query(
        "insert into tenancy.memberships(organization_id,user_id,role,revoked_at) values($1,$2,$3,$4)",
        [
          fixtures.organizationId,
          data.user.id,
          role === "revoked" ? "agent" : role,
          role === "revoked" ? new Date() : null,
        ],
      );
  }
  fs.writeFileSync(".tooling/browser-fixtures.json", JSON.stringify(fixtures), {
    mode: 0o600,
  });
  // Check the generated runtime still points to the prepared restricted role.
  if (!runtime.API_DATABASE_URL.includes("sales_api:"))
    throw new Error("Invalid browser API role");
  console.log(
    "Synthetic local browser accounts prepared. Fixture values withheld.",
  );
} finally {
  await db.end();
}
