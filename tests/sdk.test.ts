import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient, ApiClientError } from "../packages/sdk/src/index.js";

const baseUrl = "https://api.example.invalid/";
const jsonFetcher = (value: unknown, status = 200): typeof fetch => async () => new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json" } });
test("SDK validates successful responses and handles explicit not-ready responses", async () => {
  const client = createClient({ baseUrl, fetcher: jsonFetcher({ status: "ok", service: "api" }) });
  assert.deepEqual(await client.health(), { status: "ok", service: "api" });
  const unready = createClient({ baseUrl, fetcher: jsonFetcher({ version: 1, status: "not_ready", service: "api" }, 503) });
  assert.equal((await unready.readiness()).status, "not_ready");
  await assert.rejects(createClient({ baseUrl, fetcher: jsonFetcher({ secret: "bad" }) }).health(), ApiClientError);
});
test("SDK rejects unsafe origins and never exposes provider errors", async () => {
  for (const origin of ["http://api.example.invalid", "https://user:pass@example.invalid", "https://api.example.invalid/?token=x", "https://api.example.invalid/prefix"]) assert.throws(() => createClient({ baseUrl: origin }));
  await assert.rejects(createClient({ baseUrl, fetcher: jsonFetcher({ version: 1, error: { code: "INTERNAL_ERROR", message: "secret", requestId: "r1" } }, 500) }).health(), (error: unknown) => error instanceof ApiClientError && error.requestId === "r1" && !error.message.includes("secret"));
});
test("SDK aborts timed-out requests without retrying", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async (_input, init) => {
    calls++;
    return new Promise<Response>((_resolve, reject) => {
      if (init?.signal?.aborted) return reject(new Error("aborted"));
      init?.signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
    });
  };
  await assert.rejects(createClient({ baseUrl, fetcher, timeoutMs: 5 }).health(), /aborted/);
  assert.equal(calls, 1);
});
