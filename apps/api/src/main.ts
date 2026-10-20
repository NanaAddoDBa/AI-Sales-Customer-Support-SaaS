import { createServer } from "./server.js";
import {
  readRuntimeConfig,
  readIdentityConfig,
  readCredentialKeyring,
} from "@sales-support/config";
import { Pool, TenantDatabase } from "@sales-support/database";
import { SupabaseIdentity, TenancyRepository } from "@sales-support/backend";
const config = readIdentityConfig(process.env);
readCredentialKeyring(process.env);
const database = config
  ? new TenantDatabase(
      new Pool({
        connectionString: config.databaseUrl,
        max: 10,
        connectionTimeoutMillis: 5000,
      }),
    )
  : null;
if (database) await database.assertRole("sales_api");
const app = createServer(
  config && database
    ? {
        identity: new SupabaseIdentity(config),
        tenancy: new TenancyRepository(database),
      }
    : undefined,
);
app.addHook("onClose", async () => {
  await database?.close();
});
const shutdown = async () => {
  await app.close();
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
try {
  await app.listen(readRuntimeConfig(process.env, "api"));
} catch (error) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "UNKNOWN";
  app.log.error({ code }, "Process failed to start");
  await app.close();
  process.exitCode = 1;
}
