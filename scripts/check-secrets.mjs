import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const patterns = [
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["github-token", /\bgh[pousr]_[A-Za-z0-9]{30,}\b/],
  ["github-fine-grained-token", /\bgithub_pat_[A-Za-z0-9_]{40,}\b/],
  ["stripe-live-secret", /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}\b/],
  ["aws-access-key", /\bAKIA[A-Z0-9]{16}\b/],
];

/** Returns rule names only; secret values must never enter CI output. */
export function secretFindings(filename, content) {
  const result = [];
  const base = path.basename(filename);
  if ((base === ".env" || base.startsWith(".env.")) && !base.endsWith(".example"))
    result.push("tracked-environment-file");
  for (const [name, expression] of patterns)
    if (expression.test(content)) result.push(name);
  return result;
}

export function checkSecrets() {
  const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
  const errors = [];
  let inspected = 0;
  let binary = 0;
  for (const filename of tracked) {
    const bytes = fs.readFileSync(filename);
    if (bytes.includes(0)) { binary++; continue; }
    inspected++;
    for (const rule of secretFindings(filename, bytes.toString("utf8")))
      errors.push(`${filename}: ${rule}`);
  }
  if (errors.length) throw new Error(`Potential secrets detected (values suppressed):\n${errors.join("\n")}`);
  return { inspected, binarySkipped: binary };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  console.log("Tracked-text secret scan:", checkSecrets());
