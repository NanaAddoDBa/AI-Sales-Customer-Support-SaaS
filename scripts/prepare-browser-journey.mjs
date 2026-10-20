import fs from "node:fs";
import { randomUUID } from "node:crypto";
const fixture = JSON.parse(
  fs.readFileSync(".tooling/browser-fixtures.json", "utf8"),
);
const segment = process.argv[2] ?? "account";
if (!["account", "invitations"].includes(segment))
  throw new Error("Invalid browser segment");
if (segment === "account")
  fixture.signupEmail = `synthetic-signup-${randomUUID().slice(0, 8)}@example.test`;
const template = fs
  .readFileSync(`tests/browser/${segment}.journey.mjs`, "utf8")
  .replace("export default ", "");
fs.mkdirSync("output/playwright", { recursive: true });
fs.writeFileSync(
  "output/playwright/identity.journey.js",
  `async (page) => (${template})(page,${JSON.stringify(fixture)})`,
);
console.log(
  "Ignored browser journey prepared with synthetic local fixtures. Values withheld.",
);
