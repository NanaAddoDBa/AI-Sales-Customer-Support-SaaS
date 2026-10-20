# P00/P01 foundation evidence

Date: 2026-10-20, Europe/Berlin. Tasks: A1–A6; some remain open across later phases.
Working directory: `C:\Users\nanaa\Desktop\Studies\Self_Studies\Codes\Projects\AI Sales & Customer Support SaaS`.
Branch: `feat/workspace-foundation`.
Application SHA tested: `fd19daad668a1538739add89d290e76e52cf2ffa`.
Windows portability fix: `43f7ce95817460663edca499e44d011de7417c30` (configuration only).

## Actual change and boundaries

Four application entrypoints and eight shared packages; public backend health module, independently bundled widget loader/iframe, environment validation, safe logging defaults, dependency/import analyzer, six focused tests and CI. Database package is a transaction interface only. Worker has liveness but no queue handlers. UI explicitly states that accounts/chat are unavailable. No external service integration, tenant isolation or operational support workflow is implied.

Pinned Node 22.14.0, pnpm 10.34.7, Turbo 2.11.9, TypeScript 6.0.3, ESLint 10.13.0, typescript-eslint 8.72.0, React 19.3.1, Vite 8.3.4 and Fastify 5.12.7. Full dependency pins are in the lockfile. Architecture/toolchain rationale is ADR 0001.

## Commands and actual results

Commands ran from the requested Windows root. Nested pnpm checks used `$env:COREPACK_HOME = Join-Path (Get-Location) '.tooling/corepack'` and `$env:COREPACK_ENABLE_DOWNLOAD_PROMPT='0'`. Installation needed normal approved package-link creation. No global security bypass was used.

| Command/action | Environment | Result |
| --- | --- | --- |
| `git rev-parse --show-toplevel`, status/branch/origin/log inspection | Initial folder | No Git repository; only supplied documents |
| `git ls-remote` intended origin | Initial remote | Exit 0; no advertised refs |
| `node --version`, `npm.cmd --version` | Windows | 22.14.0 / 11.2.0 |
| `docker info --format '{{.ServerVersion}}'` | Windows | Engine unavailable; real DB tests not run |
| `npm.cmd install --prefix .tooling pnpm@10.34.7 --no-audit --no-fund` | Windows | Exit 0 |
| `node .tooling/node_modules/pnpm/bin/pnpm.cjs install --store-dir .tooling/store` | Approved linking | Exit 0 with compatible pins; no peer warnings |
| `node .tooling/node_modules/pnpm/bin/pnpm.cjs check` | Main checkout | Exit 0: lint/boundaries, 17 typecheck/dependency tasks, six tests and all 12 builds |
| `node scripts/smoke.mjs` | Main built checkout | Exit 0: API/worker health, both UI HTTP entrypoints and widget loader; children stopped |
| `node .tooling/node_modules/pnpm/bin/pnpm.cjs lint` | Final source including tests/smoke | Exit 0 |
| `node .tooling/node_modules/pnpm/bin/pnpm.cjs format:check` | Main checkout | Exit 0 |
| `git clone --no-hardlinks --single-branch --branch feat/workspace-foundation . .tooling/verification` | Disposable checkout | Exit 0; no dependencies/build output copied |
| `node .tooling/node_modules/pnpm/bin/pnpm.cjs --dir .tooling/verification install --frozen-lockfile --store-dir .tooling/store` | Clean Windows checkout | Exit 0; resolution skipped; 167 packages installed |
| `node .tooling/node_modules/pnpm/bin/pnpm.cjs --dir .tooling/verification check` | Clean Windows checkout | Exit 0: lint/boundaries, all type checks, six tests, all builds |
| `node .tooling/node_modules/pnpm/bin/pnpm.cjs --dir .tooling/verification smoke` | Clean Windows checkout | Exit 0, HTTP checks passed |
| `node .tooling/node_modules/pnpm/bin/pnpm.cjs --dir .tooling/verification format:check` | Initial clean Windows checkout | Failed: CRLF conversions rejected |
| Same formatting command after fast-forward to portability fix | Windows checkout | Exit 0; all files formatted |
| `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm smoke`, `pnpm format:check` | Hosted Ubuntu, Node 22.14.0 | All passed for exact foundation SHA |
| `git diff --cached --check` | Before source/config commits | Exit 0 |
| Focused tracked/build credential-pattern inspection | Main checkout | 106 files considered; ZIPs excluded; zero private-key/common GitHub/payment-token pattern matches |

The default Corepack cache and restricted symlink creation initially failed; a local cache and approved linking resolved them. The first lint run rejected TypeScript 7; supported TypeScript 6.0.3 fixed it. Clean Windows formatting uncovered CRLF differences; `.gitattributes` plus explicit formatter line-ending compatibility fixed that case. Failures were corrected, not counted as passes. The focused credential scan is not a full security audit.

## Git and hosted evidence

Handoff commit `3f44052679167fe811fcee605c8d3c2a33c6d28c`, foundation commit `fd19daad668a1538739add89d290e76e52cf2ffa`, portability commit `43f7ce95817460663edca499e44d011de7417c30`.

`git push -u origin feat/workspace-foundation` and subsequent `git push` succeeded. `git ls-remote origin refs/heads/feat/workspace-foundation` matched each published head. `git log --format=fuller` verified the owner's author/committer identity and no attribution trailers.

`gh run view 39415509835 --repo NanaAddoDBa/AI-Sales-Customer-Support-SaaS --json conclusion,headSha,jobs,url` verified [hosted CI success](https://github.com/NanaAddoDBa/AI-Sales-Customer-Support-SaaS/actions/runs/39415509835) for the exact foundation SHA, including every configured check step.

## Open work

No staging/production deployment occurred. No rendered-browser journey, actual database role/RLS, authentication, provider, load, backup/restore or production gate passed merely from this work. P02 B1–B4 is next. Docker Desktop's Linux engine must be available for the default disposable-database route. Later feature module architecture remains part of A2; continuing delivery/local parity remains part of A5/A6. Ignored dependencies, caches, builds and disposable verification checkout are retained for continuation.
