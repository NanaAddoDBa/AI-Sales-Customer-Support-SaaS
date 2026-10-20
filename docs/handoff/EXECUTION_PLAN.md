# Ordered implementation plan

This sequence is the execution default, not another planning task. Implement each
coherent vertical slice and its focused verification before moving on. Read the
relevant original specification section, not every archived file on every run.
A phase may contain several small commits. Independent work may proceed when a
specific live credential blocks one phase; never mark the blocked acceptance passed.

Source task IDs refer to `TASKS.json` and the unchanged 44-item production checklist.
Some cross-cutting IDs appear in multiple phases: all evidence for that task is
required before closing it. Stage-appropriate implementation is not full completion.

## P00 — Inspect and establish the correct working repository

Task IDs: A4, A5, A6.

**Implement:** Inspect the exact Windows path, relevant instructions, git root/status/origin/history, authorized access and tooling. Preserve existing source. Reconcile handoff files; initialize only when genuinely necessary. Create the first evidence checkpoint.

**Exit evidence:** Record the actual working path and real Git state. Verify that writes will not land in the parent Studies/Projects repository. The handoff is readable in the correct checkout. Do not mark A5/A6 complete until real code/push/run evidence exists.

## P01 — Reproducible modular monorepo foundation

Task IDs: A1, A2, A3, A4.

**Implement:** Create working dashboard/widget/API/worker applications and shared packages; pinned supported dependencies; lockfile; lint/type/build commands; import-boundary enforcement; initial CI; environment validation; developer README. Add minimal functional runtime health/start behavior, not dozens of empty features.

**Exit evidence:** Install from the lockfile in a clean checkout, run documented build/type/lint checks, demonstrate enforced dependency boundaries and record results. API and UI entrypoints run. Commit the real foundation.

## P02 — Identity, database and tenant boundaries

Task IDs: B1, B2, B3, B4.

**Implement:** Build migrations, grants/RLS and feature-owned repositories; accounts, organization membership, roles, invite/recovery flows; secret handling; local seeded synthetic two-tenant data. Pin the local DB toolchain and verify migration replay.

**Exit evidence:** Exercise a real disposable database and actual role paths. Two tenants cannot cross-read/write; revoked/unauthenticated users are denied. Verify secret absence in browser outputs. External live access can remain separately blocked.

## P03 — End-to-end human support

Task IDs: C1, C2, C3, C4.

**Implement:** Build merchant onboarding and widget installation; scoped visitor sessions; durable/realtime messages; inbox, replies, assignments, private notes and search; explicit conversation control and in-flight takeover suppression. Include mobile, accessible, empty/loading/error states.

**Exit evidence:** A shopper sends a message from a test website and staff reply through the dashboard. Reconnect/replay preserves state. Internal notes remain private. Taking over cancels stale automated delivery.

## P04 — Approved knowledge and bounded AI

Task IDs: D1, D2, D3, D4, D5, G4.

**Implement:** Implement validated imports, versioned chunks/embeddings and tenant retrieval; safe source update/removal; model adapter; bounded tool loop; policies, timeouts, fallback, costs; disclosure; frozen eval data with synthetic examples.

**Exit evidence:** Authorized model tests plus documented evals demonstrate grounded answers, uncertainty and safe tools. Prompt injection does not gain permissions. Deleted sources disappear. No model access means the real-model gate remains blocked, not passed.

## P05 — One authorized commerce connector

Task IDs: E1, E2, E3, E4.

**Implement:** Confirm actual test-store/platform access and distribution decision. Implement one real adapter, products/current stock and pricing, signed webhooks and sync reconciliation, permission/credential lifecycle, verified customer order lookup, checkout links and disconnect cleanup.

**Exit evidence:** Demonstrate real test-store data and verified order ownership end to end. Replay webhooks; test expiry/reconnect/uninstall. Mocks alone do not finish this phase. Continue independent phases if store authorization is unavailable.

## P06 — Commercial subscriptions and usage enforcement

Task IDs: F1, F2, F3, F4.

**Implement:** Implement billing behind a distribution-appropriate adapter; plans/entitlements; checkout/portal; cancellation/failed payment; durable signed events and reconciliation; concurrency-safe usage/spend caps and kill switch. Mark unapproved prices/policies as owner decisions.

**Exit evidence:** Run full sandbox billing and event replay/out-of-order scenarios. Verify budget races and provider usage accounting. Before paid launch obtain appropriate authorized live verification; no unapproved real charge.

## P07 — Security, privacy and operational controls

Task IDs: G1, G2, G3, G4, G5, I1, I2.

**Implement:** Apply security review and negative tests, safe rendering/uploads/URL handling; export/deletion/retention and audit trails; privacy-safe observability and incident runbooks. Provide legal/commercial drafts and technical evidence for actual owner/professional review, not a legal approval assertion.

**Exit evidence:** Resolve launch-blocking findings; exercise export/deletion and representative alerts/runbooks. Owner/professional legal approvals stay explicit external gates, not checked by generating page text.

## P08 — Staging, release pipeline and tested recovery

Task IDs: H1, H2, H3, H4.

**Implement:** Create manifests and secure environment configuration, independent staging/production secrets/data, CI/CD gates and promotion, domain/email verification workflow, database plus object backup, compatible migrations/rollback and recovery exercises.

**Exit evidence:** Deploy to authorized staging, verify complete flows through the intended test URLs, map deployment to SHA, restore DB and objects in an isolated environment and exercise rollback. Paid provisioning/DNS/production need recorded authorization.

## P09 — Website production acceptance and verified handover

Task IDs: I3, I4, I5, A5, A6.

**Implement:** Run real-DB isolation, browser journeys, representative load/failure tests, AI evals and a real merchant pilot; repair blockers. Set approved scope and named operating owners. With approval deploy the tested commit to production and exercise smoke checks. Verify Windows/local and remote code history.

**Exit evidence:** All website-release required gates have evidence, costs/access/owner signoffs are recorded, deploy SHA is known and local checkout matches the delivered Git reference. List any conditional/deferred channel honestly. No production-ready claim while required gates fail.

## P10 — Separately gated WhatsApp release

Task IDs: J1, J2, J3.

**Implement:** When channel scope is approved, implement authorized Meta/merchant onboarding and number binding, signed webhooks and delivery reconciliation, consent/opt-out, current service-window/template rules, handoff and channel-specific usage accounting.

**Exit evidence:** Real authorized channel tests and required approvals pass before marketing/charging for WhatsApp. Run affected P07-P09 security, billing, recovery and acceptance gates again. It is not required for a website-only launch, but remains in the overall backlog.

## Git delivery and session boundaries

Suggested commit scopes: repo, tooling, tenancy, auth, widget, inbox, knowledge,
agent, commerce, billing, security, privacy, observability, deploy, ops, whatsapp.
Use meaningful changes, not artificial splits or one commit claiming the whole SaaS.
Never publish secrets or unrelated local edits. Verify the pushed branch SHA.

At the end of an active task, write actual progress, commands/results, commits,
uncommitted changes, blockers and the next unfinished task. A limit or approval
boundary requires a truthful checkpoint, not an invented completion or a promise
that work will silently continue. Use CODEX_RESUME.md for the next session.
