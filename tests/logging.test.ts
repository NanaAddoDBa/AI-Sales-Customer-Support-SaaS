import assert from "node:assert/strict";
import { test } from "node:test";
import { createServer } from "../apps/api/src/server.js";
test("API suppresses request credentials and redacts sensitive structured fields", async () => {
  const entries: string[] = [];
  const app = createServer(undefined, {
    write: (message) => {
      entries.push(message);
    },
  });
  const canary = "synthetic-secret-log-canary";
  try {
    await app.inject({
      method: "GET",
      url: "/health?token=" + canary,
      headers: {
        authorization: "Bearer " + canary,
        cookie: "session=" + canary,
      },
    });
    app.log.info(
      {
        req: {
          headers: { authorization: canary, cookie: canary },
          body: { password: canary, accessToken: canary, refreshToken: canary },
        },
        body: {
          password: canary,
          accessToken: canary,
          refreshToken: canary,
          token: canary,
        },
        credential: canary,
      },
      "Synthetic redaction verification",
    );
    const log = entries.join("");
    assert.ok(!log.includes(canary));
    assert.ok(log.includes("[REDACTED]"));
    assert.ok(!log.includes("/health?"));
  } finally {
    await app.close();
  }
});
