import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "../apps/api/src/server.js";
import { sendMessageJsonSchema } from "../packages/contracts/src/index.js";
import { loggerOptions, safeTelemetry } from "../packages/observability/src/index.js";

test("API generates correlation IDs and reports unavailable dependencies honestly", async () => {
  const app = createServer({ logging: false });
  try {
    const response = await app.inject({ url: "/health", headers: { "x-request-id": "forged" } });
    assert.equal(response.statusCode, 200);
    assert.notEqual(response.headers["x-request-id"], "forged");
    assert.equal(response.headers["cache-control"], "no-store");
    assert.equal((await app.inject("/ready")).statusCode, 503);
    const missing = await app.inject("/missing?token=do-not-echo");
    assert.equal(missing.json().error.code, "NOT_FOUND");
    assert.ok(!missing.body.includes("do-not-echo"));
  } finally { await app.close(); }
});
test("dependency readiness handles success, failures and bounded timeout", async () => {
  for (const [probe, expected] of [
    [async () => true, 200],
    [async () => { throw new Error("private provider endpoint"); }, 503],
    [async () => new Promise<boolean>(() => {}), 503],
  ] as const) {
    const app = createServer({ logging: false, readiness: probe, readinessTimeoutMs: 5 });
    try {
      const response = await app.inject("/ready");
      assert.equal(response.statusCode, expected);
      assert.ok(!response.body.includes("provider"));
    } finally { await app.close(); }
  }
});
test("API schemas reject spoofed fields, malformed JSON and oversize requests", async () => {
  const app = createServer({ logging: false });
  app.post("/contract-test", { schema: { body: sendMessageJsonSchema } }, async () => ({ accepted: true }));
  app.get("/failure-test", async () => { throw new Error("private-secret-stack"); });
  try {
    const payload = { version: 1, clientMessageId: "m1", text: "Hello", expectedRevision: 0 };
    assert.equal((await app.inject({ method: "POST", url: "/contract-test", payload })).statusCode, 200);
    for (const invalid of [{ ...payload, organizationId: "other" }, { ...payload, expectedRevision: "0" }]) {
      assert.equal((await app.inject({ method: "POST", url: "/contract-test", payload: invalid })).statusCode, 400);
    }
    assert.equal((await app.inject({ method: "POST", url: "/contract-test", payload: "{", headers: { "content-type": "application/json" } })).statusCode, 400);
    assert.equal((await app.inject({ method: "POST", url: "/contract-test", payload: { ...payload, text: "x".repeat(20000) } })).statusCode, 413);
    const failure = await app.inject("/failure-test");
    assert.equal(failure.statusCode, 500);
    assert.ok(!failure.body.includes("private-secret-stack"));
  } finally { await app.close(); }
});
test("telemetry and log serializers exclude secrets and private payloads", () => {
  const unsafe = { requestId: "r1", organizationId: "t1", password: "secret", body: "private transcript", email: "person@example.invalid", url: "/?token=secret", method: "POST", durationMs: 12 };
  assert.deepEqual(safeTelemetry(unsafe), { requestId: "r1", organizationId: "t1", durationMs: 12 });
  assert.deepEqual(loggerOptions.serializers.req(unsafe), { method: "POST" });
  const error = loggerOptions.serializers.err(new Error("private-secret-stack"));
  assert.equal(error.code, "INTERNAL_ERROR");
  assert.equal(error.stack, "");
  assert.ok(!JSON.stringify(error).includes("private-secret-stack"));
});
