import assert from "node:assert/strict";
import { test } from "node:test";
// The analyzer is exercised as a build-time JavaScript tool.
// @ts-expect-error JavaScript tool intentionally has no declaration output.
import {
  inspectImport,
  findCycles,
  checkWorkspace,
} from "../scripts/check-boundaries.mjs";

test("rejects server imports in browser source, including relative escapes", () => {
  for (const specifier of [
    "@sales-support/database",
    "@sales-support/backend",
    "../../../packages/config/src/index.js",
    "node:fs",
  ])
    assert.ok(inspectImport("apps/dashboard/src/main.tsx", specifier));
  assert.equal(
    inspectImport("apps/dashboard/src/main.tsx", "@sales-support/contracts"),
    null,
  );
});
test("protects domain rules and module public boundaries", () => {
  assert.ok(
    inspectImport(
      "packages/backend/src/modules/orders/domain/order.ts",
      "fastify",
    ),
  );
  assert.ok(
    inspectImport(
      "packages/backend/src/modules/orders/application/read.ts",
      "../../billing/infrastructure/repository.js",
    ),
  );
  assert.equal(
    inspectImport(
      "packages/backend/src/modules/orders/application/read.ts",
      "../../billing/index.js",
    ),
    null,
  );
  assert.ok(
    inspectImport("packages/ui/src/index.ts", "@sales-support/backend"),
  );
});
test("rejects dependency cycles and checks the real workspace", () => {
  assert.throws(
    () =>
      findCycles(
        new Map([
          ["a", ["b"]],
          ["b", ["a"]],
        ]),
      ),
    /cycle/,
  );
  assert.ok(checkWorkspace() > 0);
});
