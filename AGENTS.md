# AI Sales & Customer Support SaaS — repository working agreement

## Objective and scope

Implement a production-capable multi-tenant sales/support SaaS through real source,
tests, modular commits and authorized deployment. Do not substitute another plan,
mock dashboard, code snippets or a fabricated success report for implementation.
Read `CODEX_START.md` once, then `PROGRESS.md`, `TASKS.json`,
`docs/handoff/CURRENT_STATE.md` and the applicable execution phase. Read only the
relevant specification sections each time; do not repeatedly ingest all archives.

Target checkout: `C:\Users\nanaa\Desktop\Studies\Self_Studies\Codes\Projects\AI Sales & Customer Support SaaS`
Target origin: `https://github.com/NanaAddoDBa/AI-Sales-Customer-Support-SaaS.git`

This handoff starts with specifications only. Re-inspect the real checkout: later
work may exist. Old claims about built features/passing tests are not evidence.

## Scope and authorization

The user requests local source creation, complete development and focused GitHub
commits/pushes. Carry out ordinary scoped editing, installation, tests and
non-destructive Git work using available authorized access. Respect sandbox and
approval controls. Do not ask for permission at every routine implementation step.
Do not enable broad bypass modes or silently change global Git/security settings.
Ask only for a genuinely missing decision/access or consequential authorization
that cannot be resolved from the repository, docs or authorized services.

Paid provisioning, production/customer-data access, live messages, real charges,
DNS changes, public launch and destructive operations require specific authorized
scope and any applicable approval. `docs/handoff/ACCESS_AND_APPROVALS.md` applies.
Blocked live access does not excuse stopping all independent local implementation.
Do not promise unattended work after a session ends; record a resumable checkpoint.

## Architecture

Use a modular monolith in a TypeScript pnpm/Turborepo monorepo, not microservices.
- `apps/dashboard`: React/Vite merchant interface, feature-owned components/hooks/API/model/tests.
- `apps/widget`: independently bundled widget with a small loader and isolated chat UI.
- `apps/api`, `apps/worker`: thin runtime/composition roots, separate processes.
- `packages/backend/src/modules/<feature>`: domain, application, ports,
  infrastructure and delivery adapters; public `index.ts` boundaries.
- `packages/ui`: genuinely reusable business-neutral atoms/molecules/organisms.
- `packages/contracts`, `sdk`, `database`, `config`, `observability`, `testing`.
- `supabase/migrations`: one database migration authority and history.

Modules own their rules, tables and public APIs. Other modules must not deep-import
internals or directly access another module's tables. Inject coordination ports.
Keep domain rules free of framework, DB and model SDK imports. Browser packages
must not import server/database packages. Enforce boundaries in lint/CI.
Atomic design is composition, not arbitrary one-line fragmentation. Keep files
single-responsibility and use a module README to make ownership discoverable.

Baseline implementation choices: Fastify, Supabase Postgres/Auth/Storage/Queues,
pgvector plus text search, replaceable OpenRouter/direct model adapters, static
frontend deployment and separate API/worker hosting. These are engineering defaults,
not authorization to buy vendor plans. Reuse suitable existing code; document
necessary changes to defaults in an ADR. No Hermes/flashcard/storefront rewrite is
part of this project. Use current official docs and pin supported versions/lockfiles.

## Security and dependable automation

Tenant identity comes from validated membership/session/channel binding, never
an unchecked tenant field or LLM argument. Enforce ownership in SQL, storage,
retrieval, caches, queues, tool calls, logs and realtime delivery. Test actual API
and worker roles as well as RLS; privileged DB credentials must not leak to clients.

Customers and retrieved content are untrusted. Validate tool parameters and
authorize each call in code. No arbitrary SQL/shell/general credential-bearing
tools for the production customer agent. Use live commerce tools for prices,
stock and private orders. Verify customer ownership before private order access.
Refunds, cancellations, discounts and configured sensitive actions need approval.

Use durable jobs, signed webhooks, deduplication, safe retries and reconciliation.
A provider timeout can occur after a side effect: do not blindly repeat charges,
checkout actions or messages. Human takeover must suppress in-flight AI replies.
Enforce budgets, bounded tool loops, rate limits, safe fallback and a kill switch.
Keep human support functional when AI or a store provider is unavailable.

Do not commit secrets, .env values, access tokens, customer data, credentials,
private provider URLs with tokens or raw sensitive logs. Redact verification outputs.
Use consented synthetic fixtures only in local/test paths and label them clearly.
Mocks do not count as live integration verification.

## Git and Windows discipline

Inspect `git status`, branch, origin, commit history and the actual repository root.
An enclosing Studies/Projects repository is not the requested repo. Do not run Git
writes at the parent root. Quote the Windows path, which contains spaces and `&`.
Read the user's local state before creating files. Never discard, reset, stage or
commit unrelated changes. Do not fabricate commits or alter the user's identity.
Never force-push, rewrite shared history, delete branches or bypass protections.

For a truly empty remote/local project, initialize the target repository with a
sensible main branch. For existing history, work from that history on an appropriate
feature branch. If histories conflict, preserve both and resolve safely; no blanket
unrelated-history merge. A nonempty docs directory is not proof Git is initialized.
Verify existing origin before using it; do not silently redirect another repo.

Use one coherent feature/change per meaningful commit, e.g. `feat(inbox): add staff
replies`. Commit task evidence/docs with the relevant slice when practical. Stage
explicit relevant files, review staged diff, check for secrets, run focused checks,
commit and push through authorized Git access. Verify the actual remote ref matches
the pushed SHA. A local commit is not a successful push. Respect default-branch rules.

## Verification and evidence

For each slice: implement -> focused checks -> review diff -> commit -> push if
available -> update checkpoint. Do not check a task complete based on source alone.
Keep source existence, verification, publishing, staging and production as separate
states in `TASKS.json`. Record real commands, exit status, environment, results,
artifacts and commit SHA in `docs/evidence/`; use `EVIDENCE_TEMPLATE.md`.

Critical gates: real-DB tenant/role isolation; auth; webhook replay; verified order
access; in-flight takeover; billing/caps; prompt injection/grounding; browser
journeys; backup/object restore; deployment/rollback. Focus tests during development
but do not remove gates to obtain a green check. Never report skipped tests as passed.
Use snapshots/mocks where useful, but require real-service tests for launch claims.
Provider/model/prompt changes run the versioned evaluation set.

## Efficient continuation

Follow `docs/handoff/EXECUTION_PLAN.md`. Finish a vertical slice before creating
many disconnected placeholder features. Start implementing after the initial brief
inspection; do not spend the whole task re-planning. Continue sequentially while
resources/access permit. At a session boundary update `PROGRESS.md` with exact next
steps, dirty changes, failing tests and external blockers, not promises.
When blocked, record the precise missing prerequisite, complete unrelated safe work,
and request only the owner action needed to unblock that prerequisite.
