# Coding-agent working agreement

## Truthful delivery

Implement complete vertical slices, not just disconnected screens. Do not report a feature, integration, deployment, test, or security control as complete unless it has actually been exercised. Distinguish implemented, tested, deployed, externally blocked, and intentionally deferred work. Never label mocks or seed data as live integration data.

## Scope and changes

Read this file, the feature map, relevant architecture decisions and acceptance criteria before editing. Work on one coherent feature at a time. Preserve unrelated changes. Do not rewrite architecture or swap providers without a documented reason. Create one meaningful commit per coherent change; do not commit secrets or generated local credentials. Do not deploy, incur paid costs, send live customer messages or perform destructive migrations without the appropriate authorization.

## Repository boundaries

Applications are composition roots and delivery surfaces. Backend business capabilities live under `packages/backend/src/modules/<feature>`. Backend domain logic does not import React, Fastify, database clients or model SDKs. Application use cases use explicit ports. Infrastructure implements those ports. HTTP adapters are thin.

A module owns its tables and exposes a documented public API. Other modules must not query its tables or deep-import its internals. Resolve orchestration dependencies through explicit public interfaces and composition; avoid cyclic module imports.

Frontend features own their components, hooks, API wrappers, models and tests. Promote only genuinely reusable business-neutral components into `packages/ui`. Use atomic UI composition without splitting every line of code into a file. Shared contracts and SDKs must be browser-safe and cannot re-export database code or secrets.

## Tenant and agent safety

Tenant identity comes from verified session/membership or a trusted channel binding, never a model argument or an unchecked request field. Apply tenant scoping to SQL, retrieval, caches, storage, jobs and logs. Database grants and row-level policies are explicit. Privileged Supabase keys bypass RLS in relevant contexts and are never browser configuration. Privileged worker access needs explicit scoped authorization and cross-tenant tests.

Treat customer messages and retrieved files as untrusted data. The LLM can propose approved tools but cannot authorize them. Do not expose arbitrary SQL, shell, browsing or general credential-bearing tools. Validate tool schemas and enforce roles, ownership, budgets and policy in code. Refunds, cancellations and discounts require the configured approval path.

Use durable jobs, deduplication, idempotent business commands and audit records. Never assume a queue's delivery guarantees imply exactly-once external effects. Ambiguous delivery or payment results require reconciliation before retry.

## Versions and migrations

Consult current official documentation before installing or changing dependencies. Pin supported versions, the package manager and lockfile. Avoid preview infrastructure features in the first production release unless explicitly justified.

Keep one migration history under `supabase/migrations`. Follow the installed Supabase tooling's migration workflow, discover CLI commands with `--help`, verify on a disposable/local database and review generated SQL. Check grants, RLS, views and privileged functions. Never run a destructive production change as a routine automated fix. Do not use multiple competing migration authorities.

## Required checks

Run checks proportionate to the change. Critical launch checks are not optional: tenant isolation; auth and RBAC; webhook verification and replay; human takeover during in-flight AI generation; billing/usage limits; verified customer order lookup; prompt injection; knowledge grounding; backup/restore; core browser flows.

Model/prompt changes run the frozen evaluation set before release. Passing unit tests alone is not evidence of safe AI behavior. Record exact commands, results and remaining failures. Testing can be focused during implementation but cannot be postponed past a paid production launch.

## Handover after each slice

Report the working customer journey, files changed, migrations and configuration, checks executed, external blockers, and the next unfinished acceptance criterion. Update the feature map and runbooks. Supply short Windows-compatible setup instructions or explicit WSL2 instructions, not unexplained Unix-only assumptions.
