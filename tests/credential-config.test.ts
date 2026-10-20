import assert from "node:assert/strict";
import { test } from "node:test";
import { randomBytes } from "node:crypto";
import {
  readIdentityConfig,
  readCredentialKeyring,
} from "../packages/config/src/index.js";
import { CredentialCipher } from "../packages/backend/src/index.js";
test("server identity rejects privileged database roles and unsafe endpoints", () => {
  const good = {
    SUPABASE_URL: "http://127.0.0.1:55421",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic",
    DASHBOARD_URL: "http://127.0.0.1:5173",
    API_DATABASE_URL:
      "postgresql://sales_api:synthetic@127.0.0.1:55422/postgres",
  };
  assert.ok(readIdentityConfig(good));
  assert.throws(() =>
    readIdentityConfig({
      ...good,
      API_DATABASE_URL: good.API_DATABASE_URL.replace("sales_api", "postgres"),
    }),
  );
  assert.throws(() =>
    readIdentityConfig({ ...good, SUPABASE_URL: "http://remote.example.test" }),
  );
  assert.throws(() =>
    readIdentityConfig({ ...good, SUPABASE_PUBLISHABLE_KEY: "privileged-key" }),
  );
  assert.throws(() => readIdentityConfig({ NODE_ENV: "production" }));
});
test("credential key configuration is validated without echoing secrets", () => {
  const key = randomBytes(32).toString("base64");
  assert.equal(readCredentialKeyring({}), null);
  assert.ok(
    readCredentialKeyring({
      CREDENTIAL_ACTIVE_KEY: "v2",
      CREDENTIAL_KEYS_JSON: JSON.stringify({ v2: key }),
    }),
  );
  assert.throws(() =>
    readCredentialKeyring({
      CREDENTIAL_ACTIVE_KEY: "v2",
      CREDENTIAL_KEYS_JSON: JSON.stringify({ v1: key }),
    }),
  );
  assert.throws(() => new CredentialCipher("v2", { v2: "short" }));
  const cipher = new CredentialCipher("v2", { v2: key });
  const context = {
    organizationId: "a",
    connectionId: "b",
    provider: "synthetic",
  };
  const one = cipher.encrypt("synthetic credential", context),
    two = cipher.encrypt("synthetic credential", context);
  assert.notEqual(one.ciphertext, two.ciphertext);
  assert.equal(cipher.decrypt(one, context), "synthetic credential");
  assert.throws(() => cipher.decrypt(one, { ...context, connectionId: "c" }));
});
