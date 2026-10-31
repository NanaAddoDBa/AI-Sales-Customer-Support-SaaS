import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareEmail, sendTransactionalEmail, RecordingEmailTransport } from "../packages/backend/src/modules/notifications/index.js";

const origins = ["https://app.example.invalid"];
const base = { kind: "verification" as const, to: "person@example.invalid", actionUrl: "https://app.example.invalid/verify?token=synthetic&next=%22%3E", idempotencyKey: "verify-test-1" };
test("all transactional templates escape URLs and keep sensitive content out of subjects", () => {
  for (const kind of ["verification", "invitation", "recovery", "alert"] as const) {
    const email = prepareEmail({ ...base, kind }, origins);
    assert.ok(email.html.includes("&amp;next="));
    assert.ok(!email.subject.includes("synthetic"));
    assert.ok(!email.subject.includes(base.to));
  }
});
test("email preparation rejects header injection, unsafe links and unexpected origins", () => {
  assert.throws(() => prepareEmail({ ...base, to: "person@example.invalid\r\nBcc:x@real.test" }, origins));
  for (const actionUrl of ["javascript:alert(1)", "http://app.example.invalid/verify", "https://evil.example/verify", "https://name:secret@app.example.invalid/verify"]) assert.throws(() => prepareEmail({ ...base, actionUrl }, origins));
});
test("local adapter records only synthetic email, deduplicates and makes failures observable", async () => {
  const transport = new RecordingEmailTransport();
  assert.equal((await sendTransactionalEmail(transport, base, origins)).status, "recorded");
  await sendTransactionalEmail(transport, base, origins);
  assert.equal(transport.recorded().length, 1);
  const copy = transport.recorded();
  copy[0]!.text = "changed";
  assert.notEqual(transport.recorded()[0]!.text, "changed");
  assert.equal((await sendTransactionalEmail(transport, { ...base, to: "person@example.com" }, origins)).status, "failed");
  assert.equal((await sendTransactionalEmail({ async send() { throw new Error("private-provider-token"); } }, base, origins)).status, "failed");
});
