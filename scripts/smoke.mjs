import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";

const children = [];
async function launch(args, url, validate, extraEnv = {}) {
  const child = spawn(process.execPath, args, {
    env: { ...process.env, ...extraEnv },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  children.push(child);
  let output = "";
  child.stdout.on("data", (data) => {
    output += data;
  });
  child.stderr.on("data", (data) => {
    output += data;
  });
  let lastError;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (child.exitCode !== null)
      throw new Error(`Process exited ${child.exitCode}: ${output}`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      assert.equal(response.status, 200);
      await validate(response);
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Startup failed: ${String(lastError)} ${output}`);
}
try {
  for (const [service, port, key] of [
    ["api", 19301, "PORT"],
    ["worker", 19302, "WORKER_HEALTH_PORT"],
  ]) {
    await launch(
      [`apps/${service}/dist/main.js`],
      `http://127.0.0.1:${port}/health`,
      async (response) =>
        assert.deepEqual(await response.json(), { status: "ok", service }),
      { [key]: String(port), HOST: "127.0.0.1" },
    );
  }
  for (const [app, port, title] of [
    ["dashboard", 19303, "Merchant workspace"],
    ["widget", 19304, "Customer support"],
  ]) {
    const require = createRequire(
      new URL(`../apps/${app}/package.json`, import.meta.url),
    );
    const vite = path.join(
      path.dirname(require.resolve("vite/package.json")),
      "bin/vite.js",
    );
    await launch(
      [
        vite,
        "preview",
        `apps/${app}`,
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--strictPort",
      ],
      `http://127.0.0.1:${port}`,
      async (response) => assert.ok((await response.text()).includes(title)),
    );
  }
  const loader = await fetch("http://127.0.0.1:19304/loader.js");
  assert.equal(loader.status, 200);
  assert.ok((await loader.text()).includes("iframe"));
  console.log(
    "Built API, worker, dashboard, widget and loader HTTP smoke checks passed. No rendered-browser or database acceptance claimed.",
  );
} finally {
  for (const child of children) child.kill();
  await Promise.all(
    children.map((child) =>
      child.exitCode !== null
        ? Promise.resolve()
        : new Promise((resolve) => child.once("exit", resolve)),
    ),
  );
}
