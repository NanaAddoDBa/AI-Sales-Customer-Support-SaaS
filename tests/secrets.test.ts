import assert from "node:assert/strict";
import { test } from "node:test";
import { secretFindings } from "../scripts/check-secrets.mjs";

test("secret scanner detects representative credentials without returning their values", () => {
  const cases = [
    ["-----BEGIN " + "PRIVATE KEY-----", "private-key"],
    ["gh" + "p_" + "A".repeat(36), "github-token"],
    ["github_" + "pat_" + "A".repeat(50), "github-fine-grained-token"],
    ["sk_" + "live_" + "A".repeat(24), "stripe-live-secret"],
    ["AK" + "IA" + "A".repeat(16), "aws-access-key"],
  ];
  for (const [content, rule] of cases) {
    const findings = secretFindings("test.txt", content);
    assert.ok(findings.includes(rule));
    assert.ok(!JSON.stringify(findings).includes(content));
  }
});
test("environment values are forbidden while empty example configuration is permitted", () => {
  assert.deepEqual(secretFindings(".env.production", "PORT=3001"), [
    "tracked-environment-file",
  ]);
  assert.deepEqual(secretFindings(".env.example", "MODEL_KEY=\nPORT=3001"), []);
});
