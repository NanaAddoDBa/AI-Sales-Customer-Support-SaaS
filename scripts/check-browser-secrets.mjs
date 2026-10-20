import fs from "node:fs";
import path from "node:path";
function files(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? files(path.join(directory, entry.name))
        : [path.join(directory, entry.name)],
    );
}
const config = fs.existsSync(".tooling/local-runtime.json")
  ? JSON.parse(fs.readFileSync(".tooling/local-runtime.json", "utf8"))
  : {};
const secretValues = [
  "SERVICE_ROLE_KEY",
  "SECRET_KEY",
  "JWT_SECRET",
  "API_DATABASE_URL",
  "WORKER_DATABASE_URL",
  "S3_PROTOCOL_ACCESS_KEY_SECRET",
]
  .map((key) => config[key])
  .filter((value) => typeof value === "string" && value.length > 16);
let count = 0;
for (const filename of ["apps/dashboard/dist", "apps/widget/dist"].flatMap(
  files,
)) {
  const text = fs.readFileSync(filename, "utf8");
  count++;
  if (
    secretValues.some((value) => text.includes(value)) ||
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sb_secret_[A-Za-z0-9_-]{20,}/.test(
      text,
    )
  )
    throw new Error("Privileged credential detected in a browser artifact");
}
if (fs.existsSync(".tooling/local-api.log")) {
  const log = fs.readFileSync(".tooling/local-api.log", "utf8");
  if (secretValues.some((value) => log.includes(value)))
    throw new Error("Privileged credential detected in API log");
}
console.log(
  `Browser credential checks passed (${count} build artifacts; ${secretValues.length} actual local secret canaries compared; values withheld).`,
);
