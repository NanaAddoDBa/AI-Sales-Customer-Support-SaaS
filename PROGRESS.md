# Implementation checkpoint

Updated: 2026-10-20 (Europe/Berlin).
Current phase: P02 — B1/B2/B4 accepted locally and in hosted CI; B3 continues across later tenant-facing paths. Guarded Windows runtime restart remains blocked.
Next action: resolve the local Docker binding gate, then rerun guarded acceptance and continue P03 durable human support.

## Repository and focused delivery

Actual working directory/Git root: `C:\Users\nanaa\Desktop\Studies\Self_Studies\Codes\Projects\AI Sales & Customer Support SaaS`.
Origin: `https://github.com/NanaAddoDBa/AI-Sales-Customer-Support-SaaS.git`.
Branch: `feat/identity-tenant-boundaries`, based on P01 checkpoint 315b2ba. Initial working tree was clean; unrelated projects/processes were preserved.

- e0dfa3e0fad43b721827a27fd3ab12bd8bf23468: feature-owned schemas, forced RLS, restricted roles, private storage and job leases.
- 5249fd56aa5bd91c944c4df7cc1a0605bd968cc9: verified merchant sessions, organizations, staff permissions/UI and encrypted credential storage/rotation.
- 6c14e3a7d288d74f6b06c9809c5b56bde42e2bf8: real-service/browser acceptance harness and CI.
- All pushed to the named feature branch; remote ref matched 6c14e3a. Subsequent checkpoint publication changes documentation/task status only.
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

## Current Docker gate — do not report local startup as passing

Docker Desktop 29.8.2 was started and exercised successfully. A final port-binding audit found that it ignored the officially documented bridge loopback default. A disposable probe reproduced that behavior; an explicit loopback-port probe worked. Both probes were stopped/removed. The committed wrapper now checks actual bindings and stops this project's stack if unsafe. Its final fail-closed check passed: project services stopped, data preserved. Existing Docker engine/other projects were left alone.

Automatic approval review rejected the proposed replacement of the three published project containers through the Docker API because of configuration/data-preservation risk without specific authorization. That replacement was not executed and is not imported by committed code. The reviewable candidate is only in ignored `.tooling/proposed-bind-local-ports.mjs`.

Minimum owner action: repair Docker's binding behavior, or specifically authorize a reviewed replacement of only this disposable project's three published containers with explicit loopback ports while preserving mounted data. Then rerun guarded migration, database and browser acceptance. Do not disable the binding guard. Earlier successful real-service results remain evidence of application behavior; they do not make the final Windows startup green.

## Deployment and continuation

No hosted Supabase project, real customer data, external email, provider spending, live commerce/billing, staging or production deployment was used. Test mail was intercepted locally. Worker business handlers, durable chat and commerce/model/billing workflows remain unimplemented.

After the binding prerequisite: `pnpm local:start`, set LOCAL_DB_TESTS=1, run test:migrations/test:db/local:advisors, prepare local runtime again, start API and preview, and run the account/invitation browser segments. P03 C1–C4 is next, preserving current-session authorization and extending B3 to every new path. Hosted/provider/production gates stay separate.

Ignored artifacts retain development dependencies, synthetic runtime/fixture files, screenshots, a P01 disposable verification checkout and the unexecuted replacement proposal. Only checkpoint documentation is being changed after the source/test commits; no unrelated edits were staged.
