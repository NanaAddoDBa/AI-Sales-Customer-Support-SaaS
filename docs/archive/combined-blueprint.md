# AI Sales & Customer Support SaaS — implementation blueprint

Prepared: 20 October 2026.

## Status

These are implementation and operating specifications, not an implemented application. No repository, cloud project, deployment, merchant integration, payment account, or production environment was created by preparing this pack. Production readiness must be established by evidence against the acceptance gates, not inferred from this document.

## Product decision

Build a multi-tenant sales and support product for small online retailers. Start with a website widget, a merchant inbox, approved business knowledge, product recommendations and one real commerce integration. Add WhatsApp as a separately tested release. Avoid a general-purpose autonomous assistant.

The merchant pays for a subscription. The merchant's shopper pays through the merchant's existing checkout. These are separate payment flows; this platform should not take custody of merchants' customer payments.

## Architecture decision

Use a modular monolith in a modular, atomic, feature-based TypeScript monorepo. The API and background worker are separate runtime processes sharing backend modules. The dashboard and widget are independently built applications. A monorepo does not require microservices.

Proposed baseline: pnpm, Turborepo, React/Vite, Fastify, Supabase Postgres/Auth/Storage/Queues, pgvector, a replaceable model gateway, Cloudflare Pages for static frontend assets, Railway for API/worker processes, and payment/email adapters.

These are proposed choices, not user-approved vendor purchases. Verify versions, account eligibility, data-processing terms, and actual resource consumption before provisioning paid services.

## Read in this order

1. `docs/01-product-and-workflows.md`
2. `docs/02-architecture-and-repository.md`
3. `docs/03-security-and-ai-runtime.md`
4. `docs/04-delivery-and-acceptance.md`
5. `docs/05-deployment-and-maintenance.md`
6. `docs/06-cost-model.md`
7. `docs/07-sources.md`

`AGENTS.md` supplies working rules for a coding agent. Copy it into the actual application repository only after the product scope and decisions have been reviewed.

## Initial assumptions

A solo-maintainable B2B product; text conversations first; customers in an ordinary retail niche rather than regulated advice; a Germany/EU launch considered for privacy planning; no model training or self-hosted GPU; website-first validation; one commerce integration before multiple platforms. These are planning assumptions, not claims about a registered business or existing live store.

The user's existing custom React storefront can later use the same commerce adapter contract; this SaaS should not be coupled to the storefront's internal database.


---

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


---

# Product and workflows

## Positioning

A store-specific sales and support assistant that answers from approved knowledge, checks live commerce data, creates legitimate checkout links, and hands control to staff when necessary. The first niche should be one accessible group of retailers with similar repetitive questions. Validate paid demand with a small set of real merchants before expanding integrations.

## Merchant lifecycle

Sign up -> verify account -> create organization -> invite staff and assign roles -> connect store -> import approved knowledge -> configure tone, language, opening hours and policy -> run a sandbox conversation -> install widget -> enable AI for approved intents -> review conversations, costs and handoffs -> manage subscription -> export/delete data or disconnect.

Knowledge import shows progress and meaningful states: queued, processing, ready, partially rejected, failed, outdated. A merchant can inspect sources and remove a document. Removal invalidates its indexed chunks; it is not sufficient to hide a filename in the UI.

Store connection displays permissions, last successful synchronization, failures, and the action needed to reconnect. Onboarding must work without developer intervention before broad self-serve release.

## Shopper sales journey

A visitor asks about a product. The assistant asks only necessary clarifying questions, searches this merchant's catalog, checks current price/stock through a trusted connector, and provides relevant product cards. At the shopper's request it creates a cart/checkout link through the merchant's own checkout system.

The model cannot invent prices, discounts or inventory. Money amounts are calculated by deterministic code and the commerce provider. The merchant remains responsible for fulfillment and customer payments. Delivery estimates must be grounded in current supported information; do not promise an arrival date from general model knowledge.

## Shopper support journey

Public questions about returns/shipping can use approved policies. Private order lookup requires proof of customer identity: a verified existing session or a challenge to the contact already attached to the order. Knowing an order number is not adequate authorization.

A WhatsApp phone number may help identify a customer but should not automatically authorize access to every order with related contact information. Cross-channel linking requires verification.

For an order query, fetch the authoritative order/fulfillment state, reveal only necessary fields, then explain it clearly. A request for cancellation/refund becomes a staff approval workflow in the first release, not an unrestricted agent action.

## Human takeover

Conversation state is explicit: `AI_ACTIVE`, `HANDOFF_PENDING`, `HUMAN_ACTIVE`, `RESOLVED`. A staff takeover increments a conversation generation/version marker. Before delivering an AI reply, the sender checks the latest state and marker; stale AI output is discarded.

The inbox shows a concise conversation summary, relevant order/product details, cited knowledge, previous tool actions and why the case escalated. Internal staff notes are never included in shopper-visible messages. A staff user can reply, assign a conversation, resolve it, or explicitly return it to AI.

When nobody is available, acknowledge the handoff honestly, show opening hours or a contact form, and do not claim a human is online.

## SaaS operator lifecycle

View tenant health, usage/cost outliers, failed jobs, billing status and integration failures. Pause AI per merchant or globally without losing the inbox. Access to conversation content should be limited, justified and audited; an operator dashboard is not permission to read every customer conversation casually.

## Measures of value

Track response latency, staff correction rate, handoff rate, sampled answer correctness, resolution with a stated definition, reopened conversations, cost per conversation and per merchant. Tie assisted purchases to real checkout/order events. Report assisted sales, not unproven incremental sales. Demonstrating causal uplift requires an appropriate comparison or experiment.

A revenue event should not automatically close a support conversation or claim the agent caused the entire order value.

## Release scope

First paid pilot: website widget, shared inbox, verified merchant accounts and tenant isolation, knowledge import, product search, one working commerce connector, safe order lookup, human takeover, usage limits, billing and operational safeguards.

WhatsApp release: Meta onboarding, tenant-owned business channel binding, webhook/delivery handling, templates, consent/opt-out, service-window enforcement and cross-channel inbox. Treat it as independently launch-gated; do not market it as live while approvals or real-channel testing are unfinished.

Later: additional commerce platforms, email/Instagram, voice, consent-based campaigns, more autonomous write actions, advanced attribution and enterprise controls. None are implied by the first pilot's production readiness.


---

# Architecture and repository

## Modular monolith with separate delivery processes

Use one maintainable backend codebase with feature modules and a shared database. Run its request-facing API separately from its background worker so document ingestion and delayed jobs do not hold HTTP requests open. Do not start with a microservice per feature.

```text
Website widget / WhatsApp / merchant dashboard
                     |
              Fastify HTTP API
                     |
        Auth + tenant + permissions + quotas
                     |
          Feature application use cases
               /                      Postgres + storage      Durable jobs
                                  |
                         Background worker
                                  |
               Knowledge retrieval + AI workflow
                                  |
                 Approved commerce/channel tools
```

## Proposed tools

React + Vite for dashboard and widget; TypeScript throughout; pnpm workspaces and Turborepo for task orchestration; Fastify for the API; Supabase for managed Postgres, Auth, Storage and Postgres-backed queues; pgvector and Postgres text search for tenant-scoped retrieval; a model gateway behind a small interface; Cloudflare Pages for static assets; Railway for API/worker; subscription billing and transactional email behind adapters.

Use a supported Node LTS pinned at implementation. Keep package versions, CLI versions and lockfiles reproducible. A direct-provider model adapter remains possible without changing business modules.

Supabase Queues is a Postgres-native queue [S5]. This avoids a separate Redis service initially. Reassess queue pressure, search load and database headroom using measurements; do not promise arbitrary scale from a folder structure.

## Repository layout

```text
ai-sales-support/
  apps/
    dashboard/src/
      app/
      pages/
      features/
        onboarding/
        inbox/
        knowledge/
        catalog/
        integrations/
        billing/
        settings/
    widget/src/
      loader/
      chat/
    api/src/                  # server boot and module registration
    worker/src/               # worker boot and handler registration
  packages/
    backend/src/
      modules/
        tenancy/
        conversations/
        knowledge/
        catalog/
        orders/
        agents/
        channels/
        billing/
        analytics/
    ui/src/
      atoms/
      molecules/
      organisms/
    contracts/                # browser-safe DTOs, validation, events
    sdk/                      # browser-safe API client
    database/                 # connection/transaction utilities, types
    observability/
    config/
    testing/
  supabase/
    migrations/
    seed.sql
    config.toml
  infra/
    docker/
    railway/
    cloudflare/
  docs/
    architecture/
    runbooks/
    feature-map.md
  .github/workflows/
  AGENTS.md
  pnpm-workspace.yaml
  turbo.json
```

These are planned directories, not claims that this documentation pack contains their implementations. Turborepo's application/package structure is documented in [S11].

## Backend feature example

```text
modules/conversations/
  domain/
    conversation.ts
    conversation-state.ts
  application/
    receive-message.ts
    send-reply.ts
    request-handoff.ts
  ports/
    conversation-repository.ts
    channel-gateway.ts
  infrastructure/
    postgres-conversation-repository.ts
  http/
    conversation-routes.ts
  tests/
  index.ts
```

`domain` contains business invariants. `application` implements use cases. `ports` define necessary external capabilities. `infrastructure` implements database/provider details. `http` maps validated requests to use cases. Applications register these adapters; they do not duplicate business rules.

Other modules use public exports, not private file paths or each other's tables. Inject orchestration dependencies at composition roots to avoid cycles. Version external event contracts and keep migration changes backward compatible across a rolling deployment.

## Frontend feature example

```text
features/inbox/
  components/
    ConversationList.tsx
    ConversationThread.tsx
    ReplyComposer.tsx
  hooks/
    useConversation.ts
  api/
    inbox.api.ts
  model/
    inbox.types.ts
  tests/
  index.ts
```

Atomic design is for composition, not for forcing all logic into `atoms/`. A Button is an atom; an input with label/error is a molecule; a reusable search toolbar can be an organism. A tenant-aware inbox stays in the inbox feature. Do not introduce abstractions just to satisfy a directory naming scheme.

## Enforced boundaries

Browser code must not import backend/database packages. Shared UI must not import business features. Backend domain code must not import SDKs, frameworks or persistence. Feature internals are private. Enforce these rules in linting/CI rather than relying only on convention. Each module README describes ownership, public APIs and important invariants.

## Data design

Core entities: organizations, memberships, channel connections, customers, conversations, messages, knowledge sources/chunks, catalog references, integration credentials, agent runs/tool executions, approvals, webhook receipts, outbound deliveries, usage ledger, subscriptions and audit events.

Tenant-owned records carry `organization_id`; compound uniqueness/foreign keys prevent cross-tenant relationships. Vector retrieval, caches, storage and worker jobs preserve the same boundary. The authoritative order remains in the commerce system; store only necessary references/snapshots and retention-controlled support data.

SQL migrations have one owner and history. Database access belongs to the owning feature's repository; the database package supplies connection and transaction primitives, not a universal business-service dumping ground.

## Extensibility

Define a small commerce port for searchProducts, getProductAvailability, getVerifiedCustomerOrder and createCheckout. Implement one provider first; use a separate adapter for a custom React storefront later. Do not connect the LLM directly to storefront tables. Model and channel providers follow the same adapter pattern.

The widget uses a small independently bundled loader that opens an isolated iframe. Validate postMessage origins, issue scoped chat-session tokens and lazy-load the chat UI. Do not load the entire merchant dashboard onto a store's website.

## Distribution-specific billing

For standalone SaaS subscriptions, use a Stripe billing adapter. Shopify App Store installs require a Shopify-provided billing solution unless Shopify explicitly permits an exception [S18]. Keep subscription entitlements independent of the payment adapter; an active entitlement comes from verified provider state, not a frontend callback.

Shopify public distribution is the route for unrelated merchants; custom distribution is limited to a single store, stores within the same Plus organization, or development stores [S18]. Do not treat one custom app as a review-free multi-merchant integration. Protected customer data permissions and privacy-webhook requirements are launch gates for the relevant distribution path [S16].


---

# Security and AI runtime

## Controlled agent workflow

1. Verify the webhook signature or widget/session authorization; resolve tenant from a trusted binding.
2. Persist the inbound message and its durable processing intent atomically, with a unique receipt/event identifier.
3. A worker claims the job with bounded retries and a visibility/lease policy; serialize or version work per conversation.
4. Load the permitted conversation context, relevant knowledge and validated tool permissions.
5. The model chooses an allowed next step. Application code validates input schemas, customer identity, tenant, roles and budgets.
6. Retrieve current facts through narrow tools. Compose an answer grounded in those results.
7. Validate important claims and the conversation state before dispatch. Record the outcome, model/provider, tokens, retrieved source versions and tool results.
8. Deliver through the appropriate channel, track receipts and update usage idempotently. Escalate safely on failure.

Use an explicit state machine or bounded workflow, not an unbounded autonomous loop. Set limits for tool rounds, time, output tokens and spending. A model's self-reported confidence is not an authorization or truth signal.

## Knowledge versus authoritative facts

Merchant-approved documents -> validate/scan -> parse -> chunk with document/version/page metadata -> embed -> tenant-scoped search -> answer with evidence. Store the original hash and processing status. Reprocess changes and invalidate removed sources.

Prices, stock, refunds, order state and payment outcomes come from authoritative APIs, not a vector index or model memory. If the upstream system is unavailable or data is too old, disclose that limitation and escalate; do not invent a favorable answer.

The first release needs retrieval, not model fine-tuning. Merchant corrections become reviewed knowledge/prompt changes with regression tests; do not automatically train on private chats.

## Authorization

A visitor's public widget ID identifies a store but is not a secret or identity proof. Issue a scoped session token, use strict origin allowlists as defense in depth, and limit access to that visitor's conversation. Order lookup requires a stronger verified customer binding. Protect against order/contact enumeration.

Every tenant-facing access path needs authorization. RLS is defense in depth, not a replacement for server policy. Supabase privileged keys can bypass RLS [S4]; do not assume backend/worker queries are protected just because table policies exist. Use least-privileged roles, explicit tenant context and tests exercising real production roles.

Use member roles such as owner, admin, support agent and viewer. Keep SaaS-operator permissions separate, with MFA and audited emergency access. Membership changes should not rely indefinitely on stale token claims.

## Tool authority

Autonomous by default: public FAQ answers, permitted product recommendations, verified order status, handoff ticket creation.

Customer-directed and deterministic: creating a valid cart/checkout link; final price/availability remains the commerce provider's responsibility.

Approval required in the first release: refunds, cancellations, discounts, shipping-address changes and bulk outbound messages. Approvals bind exact parameters, current state, approving actor and expiry; execution revalidates everything.

Never expose arbitrary shell, SQL, unrestricted network fetching, credential access or a general-purpose third-party tool marketplace to the customer-facing agent. Untrusted knowledge cannot redefine tool permissions. These controls align with OWASP's tool validation and least-privilege guidance [S12].

## Reliability and abuse

Webhook verification must use the provider's prescribed raw-body/signature process. Deduplicate receipt IDs within the correct provider/channel context. Handle out-of-order events using provider state/version data. Keep durable outbound intents and delivery status.

Queues and retries do not guarantee exactly-once external effects. Use provider idempotency keys when supported. For ambiguous timeout results, reconcile before retrying; never blindly repeat a financial action or customer send. Do not replay outbound sends from a restored database without reconciling what the provider already delivered.

Rate-limit by tenant and session, reserve budgets atomically, prevent one tenant consuming the worker pool, and apply a global kill switch. A spend limit that takes the platform offline is an emergency control, not a substitute for graceful per-tenant quotas.

Sanitize rich text, enforce CSP and safe links, scan uploads and bound document size/page count. URL import is restricted to approved sources and must block private/internal IP ranges and redirect-based SSRF. Do not include unnecessary personal data in model requests or operational logs.

## Model routing and privacy

Choose and evaluate explicit model/provider versions. Fallbacks must preserve tool support, geographic constraints and data policies; an outage must not silently send data to an unapproved provider. Test routing failure and insufficient-credit states.

OpenRouter lists different fees for Standard and Business, and regional routing is a paid-plan feature [S9]. Its named European routing scope includes EU/EEA plus UK/Switzerland in the model listing [S10]. Do not advertise strict EU-only processing without checking actual eligible endpoints and contracts. Verify embedding, email, monitoring, backups and support-access locations as well as inference.

## Legal launch gate

For an EU deployment, assess controller/processor roles, lawful basis, data minimization, DPAs and subprocessors, international transfers, retention, access/deletion/export and incident processes [S15]. A common model is merchant as controller of support conversations and platform as processor, with separate controller responsibilities for the platform's own billing/security data; confirm the actual arrangement.

Show clear AI disclosure at the first interaction. Article 50 transparency requirements have applied since 2 August 2026; review the applicable disclosure and generated-content obligations, not just a generic footer [S14]. Legal review is a separate gate, not something hosting location certifies.

For WhatsApp, implement opt-in, opt-out, template and service-window policy plus a clear escalation route [S8]. Platform access, business verification and integration approvals are external dependencies, not code-only tasks.


---

# Delivery plan and acceptance evidence

No time-to-delivery guarantee is implied. Complete each stage against its evidence before claiming it is finished.

| Stage | Implement | Demonstrable exit criterion |
|---|---|---|
| 0. Scope | Customer niche, pilot workflows, permissions, supported integrations, acceptance definitions | A written launch scope distinguishes supported, blocked and deferred capabilities |
| 1. Foundation | Workspace, CI, environment validation, database migrations, login, tenant membership, roles, design primitives | Fresh checkout runs; two organizations cannot access each other's data; no secrets in frontend bundles |
| 2. Human support | Widget/session, durable messages, merchant inbox, delivery, assignment, takeover | A real visitor can exchange messages with a real staff user; reconnect/replay does not corrupt conversation state |
| 3. Grounded AI | Knowledge pipeline, retrieval, bounded agent workflow, sources, safe fallback, usage accounting | Approved questions answer correctly; unsupported questions escalate; injection cases cannot gain tool authority |
| 4. Commerce | One actual store connector, sync/reconciliation, product cards, verified order lookup, checkout links | Real test-store data flows end to end; another shopper's order is never exposed; checkout uses authoritative prices |
| 5. Commercial pilot | Subscription lifecycle, quotas, dunning/grace policy, monitoring, backup/restore, privacy controls | A merchant can pay, use the app, reach limits, cancel and export data without developer intervention |
| 6. WhatsApp | Onboarding, per-merchant binding, incoming/outgoing messages, receipts, templates, consent and policy | Authorized real-channel tests pass; opt-out/window rules are enforced; clear human escalation exists |
| 7. Production release | Load and security checks, model evaluations, operational runbooks, staging promotion and rollback | Evidence is reviewed; outstanding external approvals are resolved for every advertised capability |

## Critical acceptance scenarios

### Tenant isolation and identity

Attempt access using another tenant's conversation/message/file/customer IDs, forged tenant inputs, expired chat tokens and a removed staff membership. Exercise direct database/Data API paths if exposed, repositories, workers, retrieval and storage. Testing only the dashboard is insufficient.

### Reliability

Replay incoming webhooks. Inject out-of-order events and worker crashes. Simulate provider timeout after a side effect, queue-lease expiry, API restart, and database interruption. Confirm durable recovery and reconciliation rather than duplicate checkout actions or sends.

### Conversation control

Trigger staff takeover while generation is running. A stale AI answer must not appear afterward. Private staff notes stay private. Handoff outside working hours must not claim an available staff member.

### Grounded behavior

Use a frozen, human-reviewed evaluation set covering product selection, ambiguous variants, unsupported delivery promises, conflicting policy versions, stale stock, identity challenges, missing sources, hostile prompts and unsupported requests. Track correctness, groundedness, tool validity and escalation—not a single model-generated score.

A reasonable initial evaluation-set target is approximately 100 representative cases, expanded with real failures. The number is a planning target, not proof of safety. Require all critical authorization/security cases to pass, and agree an explicit answer-quality threshold with the pilot merchants.

### Billing and costs

Verify signed subscription events, idempotent usage entries, concurrent quota checks, declined payment, cancellation, upgrade/downgrade, grace policy and duplicate webhook handling. Test that exceeding AI allowance preserves access to the human inbox. Do not silently turn on paid overages.

### Restore and deploy

Restore into an isolated environment, including document objects, credentials/configuration recovery, grants and RLS checks. Reconcile messages/payments before resuming delivery. Run smoke tests from the deployed domain and exercise a rollback-compatible release.

### Accessibility and usability

Test keyboard operation, focus management, readable error messages, mobile widget behavior, loading/empty/error states, reconnect and session expiry. Staff must be able to complete the core workflow without reading developer logs.

## Feature-based commit sequence

Examples: `chore: bootstrap workspace and CI`; `feat(tenancy): isolate organizations and membership`; `feat(conversations): persist and deliver widget messages`; `feat(inbox): implement human takeover`; `feat(knowledge): index approved sources`; `feat(agent): add grounded bounded replies`; `feat(commerce): integrate real product and order tools`; `feat(billing): enforce subscription quotas`; `feat(whatsapp): connect approved business channels`; `ops: verify restore and production promotion`.

Each coherent slice includes its necessary schema, API, UI, checks and documentation. Do not defer all tests until after deployment. Keep reviews focused to reduce coding-agent usage without deleting critical evidence.

## Responsibility split

Implementation can include application code, database policies, tests, CI/CD, infrastructure configuration and runbooks. Executing account actions depends on authorized access. The owner supplies business/provider accounts, spending authorization, credentials through secure configuration, domain control, merchant permissions and legal/business approvals. External platform reviews remain outside the implementer's control.

Never claim public launch, live customer integration or production readiness solely because a code bundle was generated.


---

# Deployment and maintenance

## Environments

Local development uses Docker/local Supabase and provider test modes with synthetic fixtures. On Windows, document either a supported native setup or the required Docker Desktop/WSL2 path explicitly. Cloud model inference does not require a local GPU.

Staging has a separate database/project, keys, storage namespace, provider test accounts and sanitized data. Production is isolated from staging. Do not give pull-request previews access to production data or secrets.

## Hosting topology

Cloudflare Pages hosts the dashboard and widget's static build. Railway runs API and worker Docker deployments with health checks and environment-specific secrets. Supabase provides database, authentication, object storage and queue persistence. Configure compatible regional locations deliberately and assess all data flows; a global static CDN is not the same as regional processing for personal data.

The widget loader is independently versioned, backward compatible and cacheable. Roll out changes gradually so a dashboard release cannot unexpectedly break every merchant embed.

## Release workflow

Commit/pull request -> lint and type checks -> unit and integration tests -> database/RLS checks -> dependency/secret checks -> AI regression set -> build -> deploy staging -> browser/provider smoke tests -> owner-approved production promotion -> deployment smoke tests and monitoring.

Use one migration authority. Prefer additive/expand-contract schema changes before removing old columns. Old application versions must remain compatible during rollout. A code rollback is not permission to roll a database back destructively.

Use signed webhooks, rate limits, provider timeouts, request IDs, per-conversation correlation IDs, redacted structured logs and error alerts. Verify email delivery, SPF/DKIM/DMARC configuration as relevant to the selected email provider, OAuth redirects and production domain TLS. Do not mark success only from local development tests.

## Backups and recovery

Supabase Pro includes daily database backups, but its database backups do not include objects stored through Storage [S1, S6]. Back up required source documents/objects separately, document recovery of application secrets and custom role credentials, and test restores.

Agree a recovery point objective (acceptable data loss) and recovery time objective (acceptable downtime). A daily backup alone can mean losing changes since that backup; it does not support a promise of minute-level recovery. Point-in-time recovery costs extra and should match the business requirement. Provider webhook replay is not a universal replacement for backups.

After restoring, reconcile outbound deliveries, commerce actions and subscriptions against external providers before resuming jobs. Otherwise the restored database may attempt an action already completed externally.

## Maintenance ownership

| Cadence | Technical operator | Merchant |
|---|---|---|
| Continuous alerts | Availability, queue lag, provider errors, token budgets, delivery failures | Urgent handoff/incident alerts within staffed coverage |
| Daily during pilot | Inspect exceptions, abuse and unexpectedly expensive conversations | Handle escalations, correct policy/product issues |
| Weekly | Review sampled answers, failed jobs, model regressions, cost per tenant and safe updates | Review repetitive questions and knowledge gaps |
| Monthly | Restore exercise as appropriate, retention jobs, access review, invoice/usage reconciliation | Review staff access, policies and business changes |
| Before changes | Verify provider API/model deprecations and run regression gates | Approve changed customer-facing policy/actions |

Cadences are proposed operating practices, not a claim that an automation has been scheduled. Start with limited staffed coverage and a clear after-hours fallback; a solo founder should not promise 24/7 human support without a resourced arrangement.

## Essential runbooks

Model provider unavailable; credits or tenant allowance exhausted; commerce credentials revoked; WhatsApp delivery/template restriction; queue backlog; incident or potential data exposure; restore/reconciliation; billing disagreement; merchant offboarding; rollback.

Every runbook states detection, immediate safe action, diagnosis, escalation owner and verified recovery. The minimum safe degraded mode is usually: persist messages, disable risky AI/tool actions, and preserve human support access.

## Sustainable operation

Measure actual support workload and per-tenant gross contribution. Poor merchant knowledge, connection permissions and integration changes may require more attention than servers. Managed hosting reduces some infrastructure tasks; it does not remove product ownership, security updates, incident response or customer support.


---

# Cost model

Checked against official public pages on 20 October 2026. Vendor prices below are in USD unless explicitly stated in EUR. Estimates are not quotes, exchange-rate conversions, capacity guarantees or profit forecasts. VAT/taxes, card currency conversion, developer labor, legal/security review, acquisition costs, WhatsApp charges and payment fees are additional unless stated.

## Small hosted setup, before AI and channel/payment fees

| Item | Monthly planning amount | Basis |
|---|---:|---|
| Static dashboard/widget hosting | $0 | Cloudflare Pages static-asset requests are free; dynamic functions and other limits are separate [S3] |
| Production + small staging database projects | $35 | Supabase Pro starts at $25; another project starts at $10 [S1] |
| API + worker + light staging runtime | $20–60 | Own resource estimate; Railway Pro has a $20 usage minimum, not $20 plus the same included usage [S2] |
| Transactional email | $0–20 | Resend Free has 3,000/month and 100/day; Pro starts at $20 [S7] |
| Monitoring and separate object backup | $10–40 | Planning allowance, not a selected vendor quote |
| Domain, annual cost spread monthly | $1–3 | Planning allowance; actual TLD/registrar varies |
| Fixed/low-usage subtotal | $66–158 | Rounded working budget: $70–160; higher compute, storage and egress are extra |

Supabase point-in-time recovery is not included in this subtotal; public pricing starts at approximately $100/month for the add-on [S1]. Match backup spending to the agreed acceptable data loss. Free project pausing/backups and low plan limits must not be confused with production reliability.

## Model calculation

Illustrative conversation consumption across ALL inference requests, including repeated context and tools:

- 25,000 input tokens.
- 2,500 output tokens.
- No cache discount assumed.

Claude Haiku 4.5's OpenRouter listing gives a standard $1 input / $5 output per million tokens and a European route price of $1.10 / $5.50 [S10]. This is a costing reference, not a claim it is the best model for this product.

```text
Standard raw inference:
25,000 / 1,000,000 * $1.00 + 2,500 / 1,000,000 * $5.00
= $0.03750 per conversation

Regional price example:
25,000 / 1,000,000 * $1.10 + 2,500 / 1,000,000 * $5.50
= $0.04125 per conversation

With an 8% Business credit-purchase fee allocated to consumed credits:
$0.04125 * 1.08 = $0.04455 per conversation
```

OpenRouter Standard charges 5.5% and Business 8% on credit purchases, not as an extra fee on every request [S9]. The calculation allocates that cash cost for budgeting. A region label is not a promise of strict EU-only processing; review actual endpoints and terms.

Add a planning allowance of 30% for embeddings, evaluations, additional successful calls, longer conversations and occasional stronger-model routing. This is an assumption, not a guaranteed ceiling. OCR, images, audio and premium-model heavy use require a separate model.

| Monthly conversations | Inference plus allocated Business fee | With 30% planning allowance |
|---:|---:|---:|
| 2,000 | $89.10 | $115.83 |
| 10,000 | $445.50 | $579.15 |
| 50,000 | $2,227.50 | $2,895.75 |

## Total operating scenarios

| Scenario | Working monthly budget |
|---|---:|
| Local development/light experimentation | $0–30, depending on paid model calls |
| Hosted pilot, 2,000 text conversations/month | Approximately $200–300 |
| Early commercial use, 10,000 conversations/month | Approximately $700–1,000 |
| Higher usage, 50,000 conversations/month | Approximately $3,000–4,200 |

Higher tiers allow additional runtime/observability capacity. These scenarios inherit the token/model assumptions above; they are not user-count-based scalability claims. Measure p95 conversation length and concurrency, not only averages. The excluded costs in the opening paragraph remain excluded.

A three-month pilot operating reserve at $200–300/month is $600–900, before development-tool subscriptions, labor, professional review, messaging and taxes. This is a cash-reserve scenario, not an implementation time estimate.

## WhatsApp

Meta charges for eligible delivered messages by recipient market and category. Service messages during the rolling 24-hour customer-service window are free of Meta message charges; utility responses within that window are also free under the pricing policy [S8]. Approved templates are required outside the service window, and opt-in/opt-out and escalation requirements apply [S8].

Budget separately for AI inference, paid templates and any third-party solution-provider markup. Do not sell unlimited WhatsApp usage. A SaaS conversation allowance is a commercial definition, not Meta's billing unit.

## SaaS subscription collection

Stripe Germany currently lists 1.5% + EUR 0.25 for standard EEA cards, and Stripe Billing pay-as-you-go lists 0.7% of Billing volume [S13]. On a EUR 99 subscription charged to such a card, the combined illustrative amount is EUR 2.428, approximately EUR 2.43, before other applicable products, card categories, FX, disputes or taxes. For Shopify App Store installs, use Shopify App Pricing or its permitted billing system rather than assuming Stripe is allowed; an off-platform exception requires Shopify's permission [S18]. Shopify billing fees/revenue share are separate from the Stripe example.

## Suggested validation pricing, not a market quote

Test EUR 99–149/month with a clearly bounded allowance, such as 500 text conversations, and a setup fee only where actual onboarding service is provided. Charge WhatsApp template costs separately or with an explicit allowance; obtain agreement for overages. Keep a hard limit on cost per conversation/tenant as well as a customer-facing conversation count.

Define a conversation explicitly, such as a customer support session ending after an agreed idle window, with maximum length and fair-use provisions. Do not imply the commercial unit is identical to WhatsApp's pricing model.

## Profitability model

```text
Contribution per merchant =
subscription revenue excluding VAT
- payment/billing fees
- AI and messaging usage
- allocated variable hosting
- merchant-specific support labor

Operating profit =
sum of merchant contributions
- shared infrastructure
- development/maintenance labor
- customer acquisition
- professional services and other overhead
```

Avoid treating revenue minus token costs as profit. Track cost per tenant from the first release. A merchant that requires custom engineering at a low subscription price can be unprofitable even when inference is inexpensive.


---

# Official source register

Accessed 20 October 2026. These sources support vendor features, prices, and platform/privacy requirements. Architecture, workload and budget allowances in this pack are proposed engineering decisions and assumptions, not facts claimed by the vendors.

[S1] Supabase pricing — Pro, additional projects, daily backups, PITR.
```text
https://supabase.com/pricing
```

[S2] Railway pricing — usage minima and metered resources.
```text
https://railway.com/pricing
```

[S3] Cloudflare Pages pricing — static versus function requests.
```text
https://developers.cloudflare.com/pages/functions/pricing/
```

[S4] Supabase RLS — authorization, policies and privileged key behavior.
```text
https://supabase.com/docs/guides/database/postgres/row-level-security
```

[S5] Supabase Queues — Postgres-backed durable queues.
```text
https://supabase.com/docs/guides/queues
```

[S6] Supabase database backups — retention, restore, Storage objects not included.
```text
https://supabase.com/docs/guides/platform/backups
```

[S7] Resend pricing.
```text
https://resend.com/pricing
```

[S8] WhatsApp pricing, messaging policy and onboarding documentation.
```text
https://whatsappbusiness.com/products/platform-pricing/
https://whatsappbusiness.com/policy/
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview
```
The onboarding page was surfaced in official search results but returned a rate-limit error when directly opened. Re-read implementation documentation before building; no unverified onboarding schema is prescribed here.

[S9] OpenRouter pricing — Standard/Business fees, regional routing and credits.
```text
https://openrouter.ai/pricing
```

[S10] Claude Haiku 4.5 OpenRouter listing — model/token prices and regional scope.
```text
https://openrouter.ai/anthropic/claude-haiku-4.5
```

[S11] Turborepo repository structure.
```text
https://turborepo.dev/docs/crafting-your-repository/structuring-a-repository
```

[S12] OWASP AI-agent and prompt-injection security.
```text
https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html
https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
```

[S13] Stripe Germany pricing — payments and Billing.
```text
https://stripe.com/de/pricing
```

[S14] European Commission Article 50 transparency guidance.
```text
https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act
https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations
```

[S15] GDPR official text.
```text
https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng
```

[S16] Shopify protected customer data and mandatory privacy webhooks.
```text
https://shopify.dev/docs/apps/launch/protected-customer-data
https://shopify.dev/docs/apps/build/compliance/privacy-law-compliance
```

[S17] Supabase changelog — verify breaking changes and supported dependencies.
```text
https://supabase.com/changelog
```

[S18] Shopify billing and distribution requirements.
```text
https://shopify.dev/docs/apps/launch/billing
https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements
https://shopify.dev/docs/apps/launch/distribution
```
