import { execFileSync as execute } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
function execFileSync(...args) {
  try {
    return execute(...args);
  } catch {
    throw new Error(
      "Local backup/container command failed; raw output withheld",
    );
  }
}

export function backupVolumes(names, directory) {
  fs.mkdirSync(directory, { recursive: true });
  const manifest = [];
  for (const name of [...new Set(names)]) {
    if (!/^supabase_(db|storage)_sales-support-local$/.test(name))
      throw new Error("Unexpected backup volume");
    const data = execFileSync(
      "docker",
      [
        "run",
        "--rm",
        "--network",
        "none",
        "--mount",
        `type=volume,source=${name},target=/source,readonly`,
        "public.ecr.aws/supabase/postgres:17.11.0.004",
        "tar",
        "czf",
        "-",
        "-C",
        "/source",
        ".",
      ],
      {
        stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: 256 * 1024 * 1024,
        windowsHide: true,
      },
    );
    const file = path.join(directory, `${name}.tar.gz`);
    fs.writeFileSync(file, data, { mode: 0o600 });
    execFileSync(
      "docker",
      [
        "run",
        "--rm",
        "-i",
        "--network",
        "none",
        "public.ecr.aws/supabase/postgres:17.11.0.004",
        "tar",
        "tzf",
        "-",
      ],
      {
        input: data,
        stdio: ["pipe", "pipe", "pipe"],
        maxBuffer: 256 * 1024 * 1024,
        windowsHide: true,
      },
    );
    manifest.push({
      name,
      bytes: data.length,
      sha256: createHash("sha256").update(data).digest("hex"),
    });
  }
  fs.writeFileSync(
    path.join(directory, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log(
    `Verified ${manifest.length} local volume archives; contents withheld.`,
  );
}
