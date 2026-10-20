# Requirements, defaults and decision boundaries

## User requirements carried from the conversation

- Build the AI Sales & Customer Support Agent into an operating SaaS, not only a demo.
- Implement the frontend, API, worker, database, integrations, tests, delivery setup,
  operations documentation and verified production release for the agreed scope.
- Use a maintainable, extendable modular atomic feature-based monorepo.
- Create coherent modular commits in `NanaAddoDBa/AI-Sales-Customer-Support-SaaS`.
- Maintain the real working source at `C:\Users\nanaa\Desktop\Studies\Self_Studies\Codes\Projects\AI Sales & Customer Support SaaS`.
- Use a local coding-capable environment to perform actions, rather than returning
  instructions as if the implementation had already been done.
- Report exact verified progress and outstanding prerequisites.

## Defaults to implement without another architecture round

TypeScript throughout; pnpm/Turborepo; React/Vite dashboard and widget; Fastify API;
separate worker sharing feature-owned backend modules; Supabase Postgres/Auth/Storage
and Postgres-backed queues; pgvector/text retrieval; replaceable model gateway;
shared atomic UI only for business-neutral components. Prefer a modular monolith,
not a distributed service for every feature. Use ports/adapters for integrations.

These are proposed baseline choices carried from the blueprint, not purchases.
Inspect real existing code before adopting them. Verify supported package versions
and current official docs at implementation, then pin and record versions.

The first advertised scope is website text chat, staff inbox, approved knowledge,
bounded AI, one real store integration, verified order access, human handoff and
SaaS subscriptions. WhatsApp is retained as a separately gated release.

Merchants pay the SaaS subscription; shoppers use the merchant's own checkout.
No custody of merchant customer payments and no autonomous refunds/discounts.
Financial/customer-impacting operations use explicit authorization and approval.

## Choices not silently resolved by a coding agent

The actual pilot merchant and authorized commerce platform/test store; public store
app distribution; billing solution appropriate to that route; real product plans
and taxes; legal business identity; provider processing regions/contracts; domain;
production spending limits; support coverage and incident ownership.

Do not block the whole build on these. Use provider-neutral ports and explicit local
fixtures while implementing independent work. Implement a real connector once the
chosen platform and authorized test access are established. A fixture is not the
live acceptance evidence required for E1-E4. Do not invent pilot access or claim the
user's separate custom storefront source is already part of this repository.

Keep storefront distribution and SaaS billing separate in code. Before shipping a
Shopify-distributed app, verify current official billing/distribution requirements;
do not assume standalone billing is permitted. Record the decision in an ADR.

## Scope exclusions

Do not add unrelated flashcard/Hermes projects, build an e-commerce storefront here,
train a proprietary model, require a GPU, create unrestricted shell/SQL agent tools,
or call a mock-only application production ready. No unapproved vendor purchases.
