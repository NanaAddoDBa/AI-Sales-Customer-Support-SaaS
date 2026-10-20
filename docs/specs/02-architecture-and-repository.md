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
