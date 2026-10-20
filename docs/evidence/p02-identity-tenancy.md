# P02 identity, database and tenant boundaries

Date: 2026-10-20, Europe/Berlin. Tasks: B1–B4, with A2/A3/A5/A6 continuation evidence.
Checkout: `C:\Users\nanaa\Desktop\Studies\Self_Studies\Codes\Projects\AI Sales & Customer Support SaaS`.
Branch: `feat/identity-tenant-boundaries`, based on P01 commit 315b2ba.

## Changes

Two versioned migrations establish feature-owned organizations/memberships/invitations, customers/conversations/messages, knowledge sources/chunks, connections, leased jobs, audit, subscriptions and usage. Composite foreign keys, forced RLS and explicit grants cover all business tables. API and worker logins cannot bypass RLS, become postgres or read Auth tables. Private definer helpers have fixed empty search paths and restricted execute grants. API scope derives from verified live sessions and current membership; worker scope derives from opaque job leases. Storage is private and tenant-prefixed.

Signup, real intercepted email verification/recovery, password login, refresh, global logout, recent-session password changes, organization creation, staff invitation acceptance/expiry and role/revocation controls are implemented in the API and dashboard. Credentials use tenant/context-bound authenticated encryption and tested key rotation. All fixtures are explicitly synthetic and local. No external email, hosted service, commerce/model or billing call was made.

## Environment

Windows PowerShell, Node 22.14.0, pnpm 10.34.7, Docker Engine/Desktop CLI 29.8.2; Supabase CLI 2.121.0, supabase-js 2.118.0, pg/@types/pg 8.23.1. Runtime images are recorded in ADR 0002. Auth/DB/storage/mail ran as actual local containers, not mocks. The browser used the built Vite preview at 127.0.0.1:5183 with its API proxy to 127.0.0.1:19311. Other projects' occupied ports/processes were preserved.

## Checks and observed results

| Exact action | Outcome |
| --- | --- |
| `docker desktop start`, `docker info --format '{{.ServerVersion}}'` | Started the initially stopped engine; version 29.8.2 verified |
| `node .tooling/node_modules/supabase/dist/supabase.js migration new identity_tenant_foundation` and `migration new credential_access` | Generated the migration filenames through the pinned CLI |
| `node .tooling/node_modules/pnpm/bin/pnpm.cjs install --store-dir .tooling/store` | Exit 0 with pinned dependencies |
| `node .tooling/node_modules/supabase/dist/supabase.js db reset --local --no-seed --yes` | Both migrations rebuilt the disposable database |
| `$env:LOCAL_DB_TESTS='1'; node scripts/test-migrations.mjs` | Exit 0: first schema upgraded with a synthetic row preserved, then both migrations rebuilt empty; ran before the final binding guard was added |
| `$env:LOCAL_DB_TESTS='1'; node .tooling/node_modules/pnpm/bin/pnpm.cjs test:db` | Exit 0: 11 tests passed, 0 failed/skipped; includes 10 subtests and parent |
| `node .tooling/node_modules/pnpm/bin/pnpm.cjs check` | Exit 0: lint/import boundaries, 19 typecheck/dependency tasks, 9 focused tests and all 12 builds |
| `node scripts/smoke.mjs` | Exit 0: built API/worker and UI/loader HTTP checks; child processes stopped |
| `node .tooling/node_modules/pnpm/bin/pnpm.cjs format:check` | Exit 0 after final formatting |
| `node scripts/local-stack.mjs advisors` and direct local security advisor | Exit 0; direct advisor reported no warnings/errors |
| `node scripts/check-browser-secrets.mjs` | Exit 0: six browser artifacts checked against six actual local development secret strings; no matches; values withheld |
| `tests/logging.test.ts` via the focused suite | Captured actual API structured logging; authorization/cookies/password/session fields redacted, request query-token canary absent |
| `node scripts/prepare-browser-journey.mjs invitations` then `npx.cmd --yes --package @playwright/cli playwright-cli -s=tenant-identity run-code --filename output/playwright/identity.journey.js` | Exit 0: create/share/accept invitation, viewer restrictions, revoke access, revoked-user empty state and mobile no-overflow checks |
| Same browser commands with `account` segment | Exit 0: signup, denial before verification, actual intercepted email link, organization creation, password recovery/change, and owner/admin/agent/viewer/revoked controls; localStorage/sessionStorage empty and callback token fragment removed |
| `docker ps ... --format '{{.Names}} {{.Ports}}'` after network hardening | Docker Desktop ignored bridge loopback defaults; all-interface bindings detected |
| Final `node scripts/local-stack.mjs start` with guarded startup | Correctly failed closed, stopped project containers and preserved their data. A following project-filtered docker ps listed no running project services |

Real DB cases include cross-tenant SELECT/UPDATE/INSERT denial, composite foreign-key denial, text/vector isolation, pooled-connection context reset, schema privilege denial, changed user_metadata not granting access, invitation email/expiry/replay rules, concurrent distinct job claims, fake/completed job-lease denial, private object download/list/upload/public-URL denial, ciphertext context/tamper protection, restricted-role key rotation, stale sensitive sessions and immediate logout/revocation before JWT expiry. These checks cover current paths; realtime, application caches and exports remain future B3 gates.

## Failures corrected

The test runner needed root ESM configuration. Vector queries initially lacked a restricted-role extension schema grant; that grant and qualified operator use fixed the test. HTTP recovery/logout initially rejected short provider refresh tokens; a dedicated refresh-token schema and HTTP regression tests fixed it. A development reload interrupted an earlier browser attempt; the final checks used a stable built preview. Nested select/textarea label locators were corrected and account/invitation checks were split; both final segments passed. Earlier failures were not counted as passes.

The new CLI rejected a multi-statement query file; the local session-helper prototype was applied through pg, then the full final migration replay and HTTP suite passed. No schema change was made to a hosted project.

## Current runtime limitation and approval boundary

The final local bootstrap guard is stricter than the earlier successful acceptance run. It requests a loopback Docker bridge and inspects actual published ports, including before destructive disposable replay. This Windows engine ignored that bridge default, confirmed by a short-lived network probe; an explicit per-container loopback probe worked. Both probes were stopped and removed. At that earlier checkpoint Windows startup/replay remained blocked. The subsequent authorized fix and complete retest are recorded in [Windows loopback follow-up](p02-windows-loopback.md); that follow-up supersedes this historical runtime status. Core application/SQL acceptance results above predate that final guard; application and migration behavior is unchanged.

At the earlier checkpoint, automatic approval review rejected a proposed Docker API replacement of the three published project containers because configuration/data preservation required specific authorization. No replacement was executed during that run; the guard stopped the stack and retained volumes. The owner subsequently granted the specific authorization. The replacement, backups and complete acceptance rerun are recorded in the follow-up below.

## Git delivery and deployment

- e0dfa3e0fad43b721827a27fd3ab12bd8bf23468 — tenant schemas and restricted runtime roles.
- 5249fd56aa5bd91c944c4df7cc1a0605bd968cc9 — verified merchant sessions, staff UI and encrypted credential access.
- 6c14e3a7d288d74f6b06c9809c5b56bde42e2bf8 — real-service/browser test harness and CI.
- All author/committer metadata reviewed: NanaAddoDBA <nanaaddoldoe@gmail.com>, natural subjects, no attribution trailers.
- `git push -u origin feat/identity-tenant-boundaries`: exit 0. `git ls-remote origin refs/heads/feat/identity-tenant-boundaries` matched 6c14e3a7d288d74f6b06c9809c5b56bde42e2bf8.
- Hosted CI is evaluated separately from the local results; see the checkpoint for its final observed status. No pull request, merge, staging or production deployment occurred.
- [Hosted run 39422857753](https://github.com/NanaAddoDBa/AI-Sales-Customer-Support-SaaS/actions/runs/39422857753) completed successfully for exact source SHA 6c14e3a7d288d74f6b06c9809c5b56bde42e2bf8. Both foundation and tenant-isolation jobs passed. The latter verified the final committed loopback startup guard, migration upgrade/replay, real-service suite, advisors and cleanup on Ubuntu. `gh run view 39422857753 --repo NanaAddoDBa/AI-Sales-Customer-Support-SaaS --json status,conclusion,jobs,url` returned completed/success with every configured step successful. This closes B1/B2/B4 acceptance evidence independently of the Windows-specific restart problem; B3 remains open for future realtime/cache/export paths.

Next action: resolve guarded local Docker bindings and rerun migration/isolation/browser acceptance. Then continue P03 durable human support while extending B3 to its new tenant-facing paths. Operating-system/runtime access is not evidence of cloud/provider readiness.


## Authorized Windows runtime follow-up

The owner subsequently authorized the specific three-service replacement. Fix 5925d2cb9fd74dc829168281505bf1850e6bdb1b was committed/pushed and its remote SHA verified. Guarded startup/restart and migration replay passed; 11 real-service tests and both browser segments passed after preserving private backups. See [follow-up evidence](p02-windows-loopback.md) for failures corrected, backup hashes, exact scope and runtime limits. B3 remains open for later realtime/cache/export paths.
