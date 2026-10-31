import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "../apps/worker/src/server.js";

test("worker does not echo query secrets or trust supplied request IDs", async () => {
  const app = createServer({ logging: false });
  app.get("/failure-test", async () => {
    throw new Error("private-provider-credential");
  });
  try {
    const missing = await app.inject({
      url: "/missing?token=private-provider-credential",
      headers: { "x-request-id": "forged" },
    });
    assert.equal(missing.statusCode, 404);
    assert.notEqual(missing.headers["x-request-id"], "forged");
    assert.ok(!missing.body.includes("private-provider-credential"));
    const failure = await app.inject("/failure-test");
    assert.equal(failure.statusCode, 500);
    assert.ok(!failure.body.includes("private-provider-credential"));
    assert.equal(failure.headers["cache-control"], "no-store");
  } finally {
    await app.close();
  }
});

test("worker readiness requires a successful bounded dependency probe", async () => {
  const unavailable = createServer({ logging: false });
  const ready = createServer({
    logging: false,
    readiness: async () => true,
  });
  try {
    assert.equal((await unavailable.inject("/ready")).statusCode, 503);
    assert.equal((await ready.inject("/ready")).statusCode, 200);
  } finally {
    await unavailable.close();
    await ready.close();
  }
});
