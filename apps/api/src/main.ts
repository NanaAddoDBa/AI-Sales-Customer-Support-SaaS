import { createServer } from "./server.js";
import { readRuntimeConfig } from "@sales-support/config";
const app = createServer();
const shutdown = async () => {
  await app.close();
};
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
try {
  await app.listen(readRuntimeConfig(process.env, "api"));
} catch {
  app.log.error("Process failed to start");
  process.exitCode = 1;
}
