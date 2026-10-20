import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer as createApi } from "../apps/api/src/server.js";
import { createServer as createWorker } from "../apps/worker/src/server.js";
import { readRuntimeConfig } from "../packages/config/src/index.js";

for (const [service, factory] of [
  ["api", createApi],
  ["worker", createWorker],
] as const) {
  test(`${service} exposes liveness without claiming dependency readiness`, async () => {
    const app = factory();
    try {
      const response = await app.inject("/health");
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.json(), { status: "ok", service });
      assert.equal((await app.inject("/ready")).statusCode, 404);
    } finally {
      await app.close();
    }
  });
}
test("runtime configuration rejects unsafe or malformed ports", () => {
  for (const port of ["0", "-1", "65536", "3001junk", "", "1.5"])
    assert.throws(() => readRuntimeConfig({ PORT: port }, "api"));
  assert.throws(() => readRuntimeConfig({ HOST: "unexpected-host" }, "api"));
  assert.deepEqual(readRuntimeConfig({}, "worker"), {
    host: "127.0.0.1",
    port: 3002,
  });
});
