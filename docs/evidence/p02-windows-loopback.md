# Windows local-service binding repair

Date: 2026-10-20. Branch: feat/identity-tenant-boundaries. Tasks: B1–B4 runtime verification follow-up.

The owner explicitly authorized recreation of only the local database, gateway and mail services, with backups and preservation of data/configuration. The checkout, Git root and origin matched the project; initial working tree was clean at 01de535.

## Backup and replacement

Before startup, no project containers existed; the database and storage volumes remained. Both stopped volumes were archived read-only into ignored `.tooling/backups/pre-loopback-20261020/`. Tar integrity checks passed, and a separate SHA-256 recheck matched the manifests:

- Database: 9,122,467 bytes; SHA-256 `2a0094636357872621fa6e226abd83900e49729b6d6b3a77cfe770f4d73ba9d7`.
- Object storage: 106 bytes; SHA-256 `343f29dc89aba4bf7edf446a4660f4f8e3b1340e1338f05c6de5f16756252bde`.

Configuration snapshots and per-replacement stopped-volume backups remain in `.tooling/backups/`. They are private local artifacts and are not committed. Original mount sources/destinations, image, environment, command, entrypoint, labels, healthcheck, user and working directory are compared before an original container is removed. Removal explicitly retains volumes. Network aliases are preserved. Gateway files injected by the CLI are backed up/restored as tar with Linux ownership preserved.

Two initial gateway replacement attempts failed health checks: the first lacked CLI-injected certificates; the second copied through Windows and changed file ownership. The guard stopped this project's stack after both failures. Direct archive transfer corrected both issues; the subsequent guarded startup exited 0. No unrelated project's services were stopped or replaced.

The Windows fallback is part of `local:start`; Linux retains the bridge default and actual-binding guard. Migration replay reapplies/checks bindings after CLI operations. On a runtime that ignores the bridge default, CLI-created services can briefly have its default mappings during startup/reset before replacement; do not treat this as a production network isolation mechanism.

## Acceptance

Results will be recorded below after completion. Local synthetic test services only; no hosted deployment or external email.

The first real-service run after reset failed on synthetic user creation. Sanitized Auth diagnostics identified PostgreSQL `57P01` (an administrator-terminated stale connection). The repair now restarts the existing local Auth/REST/storage containers after replacing Postgres and waits for health; it does not recreate them. A full guarded stop/start then passed, followed immediately by 11 passing real-service tests with no failures/skips.

| Action | Verified result |
| --- | --- |
| Read-only stopped-volume archive, tar integrity and independent SHA-256 recheck | Exit 0; both original volumes retained in private local archives |
| `node scripts/local-stack.mjs start` and full `stop` / `start` cycle | Exit 0 with database, gateway and local mail healthy |
| Independent `docker inspect` comparison with saved snapshots | Original image IDs, configuration and mount sources/destinations/access preserved for all three replacements |
| Actual binding inspection | DB 127.0.0.1:55422, gateway 127.0.0.1:55421, mail 127.0.0.1:55424; no wildcard/IPv6 mappings |
| `$env:LOCAL_DB_TESTS='1'; node scripts/test-migrations.mjs` | Exit 0; prior schema upgraded with synthetic row preserved, both migrations rebuilt empty; binding checks passed |
| `$env:LOCAL_DB_TESTS='1'; node .tooling/node_modules/pnpm/bin/pnpm.cjs test:db` after corrected restart | Exit 0; 11 pass, 0 fail/skip; actual restricted API/worker roles, Auth, invitations, sessions/revocation, SQL/text/vector, storage and encrypted credential permissions/rotation |
| `node scripts/local-stack.mjs advisors` | Exit 0; raw CLI output withheld |
| Workspace `check` | Exit 0; lint/import boundaries, 19 typecheck/dependency tasks, 9 focused tests, 12 builds (unchanged build outputs reused from cache) |
| `pnpm smoke` | Exit 0; built API/worker/dashboard/widget/loader HTTP checks |
| Final changed-script lint and formatting | Exit 0 |

The initial workspace-check invocation encountered the existing Windows Corepack cache-path issue; rerunning with workspace-local COREPACK_HOME and download prompts disabled passed. No dependency or lockfile change was needed.

Both built-preview browser segments passed on the repaired stack: account signup/verification/recovery/password changes and owner/admin/agent/viewer/revoked permissions; invitation acceptance/revocation and responsive mobile layout. The CLI reported no journey error. Fresh artifacts: `output/playwright/identity-mobile.png` and `identity-desktop.png` (ignored, synthetic fixtures). The mobile screenshot was visually inspected. Browser secret scan passed against six actual local secret canaries across six build artifacts. No privileged values were printed or committed.
