# Implementation checkpoint

Updated: 2026-10-20 (Europe/Berlin).
Current phase: P02 — B1/B2/B4 accepted locally and in hosted CI; B3 continues across later tenant-facing paths. Guarded Windows runtime restart and acceptance now pass.
Next action: P03 C1–C4 durable human support; extend B3 isolation to each new path.

## Repository and focused delivery

Actual working directory/Git root: `C:\Users\nanaa\Desktop\Studies\Self_Studies\Codes\Projects\AI Sales & Customer Support SaaS`.
Origin: `https://github.com/NanaAddoDBa/AI-Sales-Customer-Support-SaaS.git`.
Branch: `feat/identity-tenant-boundaries`, based on P01 checkpoint 315b2ba. Initial working tree was clean; unrelated projects/processes were preserved.

- e0dfa3e0fad43b721827a27fd3ab12bd8bf23468: feature-owned schemas, forced RLS, restricted roles, private storage and job leases.
- 5249fd56aa5bd91c944c4df7cc1a0605bd968cc9: verified merchant sessions, organizations, staff permissions/UI and encrypted credential storage/rotation.
- 6c14e3a7d288d74f6b06c9809c5b56bde42e2bf8: real-service/browser acceptance harness and CI.
- 5925d2cb9fd74dc829168281505bf1850e6bdb1b: preserve local services with explicit loopback ports, backups and guarded restart/reset checks. Pushed; remote ref matched this SHA.
- Earlier source/checkpoint commits are also pushed.
- Author/committer verified as NanaAddoDBA <nanaaddoldoe@gmail.com>, no attribution trailers. No shared history rewrite, merge or pull request.

## Implemented P02 paths

Real Supabase Auth signup/verification/login/refresh/logout/recovery/password changes, current-session and membership checks, organizations, owner/admin/agent/viewer permissions, one-use email-bound expiring invitations and immediate revocation. Dashboard forms use those APIs; sessions remain in memory and callback fragments are cleared. Sensitive operations require a recent sign-in.

Tenant-owned schemas cover the B1 entities with compound relationship constraints. API and worker roles cannot bypass RLS or query Auth/credential data beyond their narrow grants. Worker tenant scope comes from an opaque leased job token. Text/vector SQL and private object storage are tenant-scoped. Provider secrets use AES-256-GCM with tenant/connection/provider/key context and tested rotation; keys remain server-side, with no default key or activated provider credential endpoint.

B3 remains an ongoing gate for realtime, application caches and exports when those features are introduced. No placeholder path is counted as tested. Full details: docs/evidence/p02-identity-tenancy.md and ADR 0002.

## Verified results

- Migration replay: first schema upgraded with synthetic data preserved, then both migrations rebuilt empty; exit 0 before final runtime-binding guard was added.
- Real local Auth/Postgres/Storage suite: 11 tests passed, 0 failed/skipped. Includes actual restricted API/worker logins, metadata spoofing, cross-tenant reads/writes/relationships/text/vector denial, pool reset, job leases, storage, invitations, HTTP refresh/password/logout, credential permissions/rotation and revocation/stale sessions.
- Full workspace check: lint/boundaries, 19 typecheck/dependency tasks, 9 focused tests and 12 builds passed.
- Built process/UI/loader HTTP smoke checks and final formatting passed.
- Actual API logging redaction test passed. Six browser artifacts contained none of six compared local development secret canaries.
- Two independent browser segments passed against a built preview: account verification/recovery/roles, and invitation acceptance/revocation/mobile. Mobile screenshot inspected; no horizontal overflow. Artifacts: output/playwright/identity-desktop.png and identity-mobile.png (synthetic data only).
- Local security advisor reported no warnings/errors.
- Hosted [run 39422857753](https://github.com/NanaAddoDBa/AI-Sales-Customer-Support-SaaS/actions/runs/39422857753) passed for exact source commit 6c14e3a. Both jobs passed: frozen install, full foundation checks, guarded loopback startup, migration upgrade/replay, real Auth/Postgres/Storage tests, security advisor and cleanup. The final committed runtime guard and test harness were therefore verified on hosted Linux; the restart issue is specific to the inspected Windows Docker Desktop runtime.

- Hosted [run 39444605050](https://github.com/NanaAddoDBa/AI-Sales-Customer-Support-SaaS/actions/runs/39444605050) passed for runtime fix 5925d2c: foundation and tenant-isolation jobs both completed successfully, including guarded migration replay and real-service acceptance on Linux.

## Windows Docker gate resolved

The owner specifically authorized the three-service recreation. Original stopped database and storage volumes were archived read-only before startup; tar integrity and SHA-256 checks passed. Private archives/configuration snapshots remain under ignored `.tooling/backups/`. The replacement preserves original mounts, image, settings and network aliases; gateway certificates/configuration transfer as tar with Linux permissions intact. Postgres replacement restarts existing Auth/REST/storage services to clear stale connections. Only database/gateway/mail containers are recreated; unrelated projects are untouched.

Guarded startup and a full stop/start passed. Actual final bindings are exclusively 127.0.0.1:55422 (database), :55421 (API gateway) and :55424 (local mail). Guarded migration upgrade/replay passed, followed by 11 real-service tests with no failures/skips, both built-preview browser segments, security advisor exit 0, workspace checks/smoke, formatting and browser-secret scan. The mobile screenshot was inspected. Initial certificate/ownership and stale-connection failures were fixed and are recorded in docs/evidence/p02-windows-loopback.md.

The wrapper still rejects unsafe final bindings. The CLI can briefly create default all-interface mappings before Windows replacement during startup/reset; this local fallback is not a production network-isolation mechanism. Migration replay intentionally rebuilds disposable synthetic state; original pre-repair data is retained in the private archives. This is archive integrity and local runtime preservation evidence, not the production backup/restore gate.

## Deployment and continuation

No hosted Supabase project, real customer data, external email, provider spending, live commerce/billing, staging or production deployment was used. Test mail was intercepted locally. Worker business handlers, durable chat and commerce/model/billing workflows remain unimplemented.

P03 C1–C4 is next, preserving current-session authorization and extending B3 to every new path. B1/B2/B4 remain accepted; B3 remains in progress for future realtime, application-cache and export paths. Hosted/provider/production gates stay separate.

Ignored artifacts retain private backups, development dependencies, synthetic runtime/fixture files, screenshots and the historical replacement proposal. No unrelated edits were staged. Final process/CI publication state is recorded in the follow-up evidence.

Final local state: repaired project services remain running on explicit loopback bindings. Acceptance browser/API/preview processes were stopped. Private original-volume backups remain in `.tooling/backups/pre-loopback-20261020/`; configuration snapshots and later replacement backups remain alongside them. No staging/production deployment.
