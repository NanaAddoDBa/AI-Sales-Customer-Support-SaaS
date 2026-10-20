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
