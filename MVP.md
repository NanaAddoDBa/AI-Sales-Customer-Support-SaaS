# MVP: website sales and support assistant

Recorded: 2026-10-31. Status: implementation direction fixed; product not complete.

## One product, one finish line

Build a standalone, website-only SaaS for small independent online shops. A merchant supplies approved FAQs, policies and a curated product directory, installs a chat widget, and receives grounded answers and product recommendations with reliable human takeover. The merchant pays one fixed monthly subscription; shoppers continue purchasing on the merchant's own website.

The release target is a hosted, production-safe, invitation-only paid pilot, not a public app-store launch or an omnichannel automation platform. Aim for 3-5 pilot merchants; no recruited merchant or merchant authorization is implied. At least one consenting pilot merchant must complete the real acceptance journey before the release is called complete.

This narrows the first release deliberately. The 177-task checklist and original blueprint remain the long-term roadmap. Do not execute all D1-D3 tasks before shipping this workflow. Work by dependencies and end-to-end outcomes, including necessary D4-D5 security and reliability work. Deferred is not done. This document determines release scope; it does not override security, authorization, privacy, Git preservation or evidence requirements in AGENTS.md.

## Included and excluded

| Included in the MVP | Explicit boundary |
| --- | --- |
| Merchant identity, organization and existing staff roles | Reuse the identity branch; do not replace it with mock authentication. |
| Website widget and durable conversations | One website channel; scoped visitor access and cursor-based polling first. No separate WebSocket infrastructure or streaming-token UI requirement. |
| Merchant inbox, staff replies, private notes, close/reopen and takeover | Staff control must suppress in-flight AI results. Human replies remain available when AI is unavailable or out of allowance. |
| Knowledge editor and bounded TXT/Markdown ingestion | Merchant reviews/publishes sources. No crawling, PDF/OCR, attachments in customer chat or automatic policy discovery. |
| Curated product directory with product-page links | Manual product editing: title, description, tags, enabled flag and validated HTTPS merchant URL. No inventory, price, promotion or delivery-date guarantees. No generated checkout or cart. |
| Grounded AI FAQ answers and product discovery | One configured model route, restricted retrieval tools, bounded work and measured spending. No autonomous sensitive actions. |
| Simple onboarding and settings | Business details, approved knowledge, product directory, snippet installation test, test conversation and explicit activation. |
| One fixed monthly subscription and usage page | Standalone Stripe Checkout/Billing Portal integration. One configured recurring price; no tiers, seat pricing, coupons, automatic overages or bespoke billing console. |
| Deployment and operational safeguards | Staging and production, real transactional email, tenant tests, logs/alerts, backups/restoration, privacy lifecycle, rollback and named support owner. |

Post-MVP: WhatsApp, Shopify/WooCommerce/custom commerce API integration, private order lookup, generated checkouts, refunds, cancellation/address-change actions, outbound campaigns, voice, multi-agent frameworks, multi-provider failover, advanced analytics and revenue attribution. Existing unused ports/tests may be retained, but deferred functionality must not be exposed or advertised as working.

A curated product directory is NOT a live commerce integration. Never convert its contents into claims of current price, stock or promised arrival. Link to the approved merchant product page for those details and escalate private order questions without requesting unnecessary private information. The narrower capability must be reflected in the widget, pricing page and onboarding copy.

## Retained architecture

Keep the existing TypeScript pnpm/Turborepo modular monolith, not a rewrite:

- apps/dashboard and apps/widget: React/Vite, feature-owned components, reusable business-neutral atomic UI.
- apps/api and apps/worker: thin Fastify/runtime composition and separate background execution.
- packages/backend/src/modules/<feature>: domain, application, ports and infrastructure with public indexes.
- Existing contracts, SDK, database, config, observability and testing packages.
- Existing Supabase Postgres/Auth/Storage and tenant/job boundaries, with one migration authority.

Keep the existing provider adapter approach; select one evaluated, authorized OpenRouter route for the pilot. Do not silently route personal data to other providers. Retain the earlier Cloudflare static-frontends and Railway API/worker deployment direction unless an existing authorized deployment already exists. These engineering defaults authorize neither paid provisioning nor production access. Pin dependencies; do not upgrade the entire stack while implementing the MVP without a demonstrated blocker.

## Verified repository starting point

Inspection found these heads:

- feat/workspace-foundation: 315b2ba0ea4262536bcb9dba6ace67047c1f13b2; still the repository default branch at inspection.
- feat/identity-tenant-boundaries: 9927afca5fd27ceaa9c8550b0e36849e5170130d. Its PROGRESS.md records real local identity/tenant tests. GitHub check-runs for this exact SHA independently show foundation and tenant-isolation succeeded (workflow run 39445232787).
- feat/d1-d3-foundations: 90bff1ea5f2eff07b13a962b4822eeed0cd97714. It contains additional contracts, conversation-control rules, runtime checks and tooling, but is divergent from identity: 13 commits ahead and 6 behind at inspection. The common ancestor is 315b2ba.

feat/mvp-website-support starts from the inspected identity head. This preserves identity/tenancy history; it does NOT merge D1-D3. Do not apply an old ZIP or replace entire API/server/index/CI files over the identity work. Reconcile the useful D1-D3 changes with identity and retain both test suites. Preserve the Windows runtime guards, private backups and unrelated local work.

The inspection above is not a new execution of the application tests, not inspection of the current Windows drive, and not deployment evidence. Re-read refs and the local working tree before implementation. The next runtime feature remains durable human support.

## Ordered completion gates

All release checkboxes below start open. Existing evidence may satisfy part of a gate after integration; a documentation commit cannot close it.

### M0 - One integrated, reproducible codebase

Dependency: none beyond authorized repository/local development access.

- [ ] Reconcile the useful D1-D3 changes into the identity-based implementation line without losing identity routes, permissions, schema history or Windows safeguards.
- [ ] Run the pinned frozen install, workspace checks, formatting, process smoke checks and real local tenant/identity suite. Preserve both branches' applicable tests; fix failures rather than dropping them.
- [ ] Push focused commits and verify the remote SHA and hosted checks. Record the chosen source of implementation status in PROGRESS.md and the existing task ledger, retaining historical requirement IDs.

Done: a fresh checkout runs the integrated application foundation and actual tenant tests. Do not change the default branch or rewrite shared history as part of this gate.

### M1 - A complete human support conversation

Dependency: M0. This is the next implemented user journey; AI remains disabled.

- [ ] Merchant configures a website binding; an external page embeds the widget and obtains a short-lived conversation-scoped visitor session. A public site identifier or Origin header is not authorization to read a conversation.
- [ ] Persist customer/staff messages, sequencing, idempotency and control state in the database. Use durable scoped jobs/events where needed. Acknowledge accepted messages only after durable persistence.
- [ ] Deliver the widget/inbox journey with scoped polling, reconnect/history, error/retry states, staff replies, private notes, close/reopen and offline contact. Never expose private notes in visitor queries or serializers.
- [ ] Implement transactional control/version checks so taking over or closing invalidates stale queued/generated AI replies. Add race tests now, before a model is enabled.
- [ ] Test two-tenant denial, guessed conversation IDs, revoked staff, duplicate submissions, process restart and the desktop/mobile browser journey.

Done: visitor sends a message, merchant sees it and replies, visitor receives it, refresh/restart preserves history, and staff control is reliable. No fixture-only chat counts.

### M2 - Approved knowledge and product directory

Dependency: M0; final integration requires M1. This may be built alongside M1 only by a separate coordinated owner, without competing shared migrations.

- [ ] Implement feature-owned knowledge/product editing and review/publish states, bounded TXT/Markdown import, safe parsing and visible import status.
- [ ] Index only the current approved tenant content; replacing, disabling or deleting a source/product invalidates retrieval and caches.
- [ ] Validate merchant HTTPS product links without fetching arbitrary URLs. Keep private policies/secrets out of public answer sources. Do not expose raw internal source records to visitors.
- [ ] Prove cross-tenant retrieval denial and stale/deleted-source exclusion with real storage/database tests.

Done: the merchant can maintain its own approved answer sources and product directory, and only those published records are retrievable.

### M3 - Bounded AI connected to that conversation

Dependencies: M1 and M2. Hard budget reservations are required before any live model call; payment integration is not a substitute for this control.

- [ ] Implement one real provider adapter with authorized endpoint/configuration, server-only credentials, request timeouts and an explicit maximum number of tool/model calls.
- [ ] Retrieve approved FAQs/products, answer from evidence, offer stored product-page links and explicitly decline/escalate unsupported or private order requests. Keep merchant-visible evidence references for review.
- [ ] Reserve model budget atomically across concurrent jobs, meter actual provider attempts, reconcile/release unused reservations, apply abuse limits and provide tenant/global AI switches.
- [ ] Deliver an answer only when the same conversation control epoch still permits AI. Provider failure, uncertainty, budget exhaustion and takeover all leave a usable human fallback.
- [ ] Evaluate merchant-approved cases, adversarial instructions, unsupported price/stock/order claims, cross-tenant leakage, costs and takeover races against the real configured provider where authorized.

Done: the installed widget answers real approved questions and recommends relevant stored products without fabricated facts, unauthorized tools or uncontrolled spending.

### M4 - One billable plan and completed onboarding

Dependencies: M0 for initial billing implementation; M1-M3 for end-to-end acceptance. Requires authorized Stripe test resources; live pricing and charging require owner approval.

- [ ] Implement one recurring subscription, hosted checkout, billing portal, payment/cancellation status and server-enforced entitlements. Verify webhook signatures, duplicates, out-of-order delivery and reconciliation.
- [ ] Define customer usage as one successfully persisted, visitor-visible AI reply per incoming shopper turn; retries/duplicate deliveries do not increment twice. Meter all model attempts separately as operational cost. No automatic overage billing.
- [ ] Display allowance/usage and clear cap behavior. Reaching the AI cap never blocks staff replies or necessary account/export access. Final price, included allowance and spending ceiling are owner-owned configuration, not invented approvals.
- [ ] Complete the existing signup/verification/recovery email flow using an authorized real sender; do not build a second identity system.
- [ ] Complete signup -> knowledge/products -> snippet test -> test conversation -> subscription -> explicit AI activation. No public signup/acquisition campaign is required for the invite-only pilot.

Done: a pilot merchant can complete onboarding, subscribe and manage its subscription, and failed payments/caps/cancellation behave as specified and tested. Test-mode billing is not live billing evidence.

### M5 - Production-safe pilot release

Dependencies: M0-M4. Planning/reviews may start earlier; production actions still require the specific approvals in AGENTS.md.

- [ ] Deploy isolated staging and production with HTTPS, appropriate domain/sender setup, secrets, health/readiness checks, controlled migrations and rollback. Verify the deployed version against GitHub.
- [ ] Complete relevant tenant/visitor/staff/billing/AI security and browser checks; remove release-blocking defects. Record latency/error behavior and a declared pilot load test; do not invent an SLA from passing unit tests.
- [ ] Implement and exercise data export/deletion/retention, privacy-safe logging and restricted operator access. Review notices, terms, AI disclosure and the actual provider/data-processing arrangements before inviting real customers.
- [ ] Back up and restore database records and required stored objects; test an alert and the AI-off/human-support recovery path. Name the support/incident owner and document operating coverage.
- [ ] Use an approved evaluation set of at least 50 representative cases spanning FAQ, products, unknowns and attacks. Engineering release target: at least 90% supported-answer correctness and zero critical leakage, invented live commerce claims or unauthorized-action failures in that set. These are release checks, not marketing guarantees.
- [ ] A consenting real pilot merchant completes the installed-widget, AI, takeover and subscription journey under authorized production use. Record evidence and owner release acceptance; verify the requested Windows checkout matches the published history.

Done: all six gates have evidence and the agreed pilot can operate the narrowly advertised product. A preview URL, synthetic demo or test subscription alone does not complete the MVP.

## Execution and change control

Finish one vertical slice before starting the next. Related implementation, tests and evidence belong in focused commits, not one giant merge or an accumulating ZIP handover. Merge shared changes deliberately; never resolve conflicts by blindly choosing one branch's server, contracts, policies or CI configuration.

PROGRESS.md records the current gate, exact next code change, failing check and external blocker. Existing task ledgers retain historical statuses and link to these gates; do not invent a new 177-task replacement. Keep implemented, tested, committed, pushed, staging-verified and production-verified distinct.

No new framework, channel, integration, pricing tier or major redesign enters this release without explicitly replacing another scope item and updating this document. Do not make security work optional to hit the MVP boundary. A blocked provider account does not block unrelated local implementation, but mocks must never close the corresponding real-service gate.

## Owner inputs that remain genuinely external

Use authorized services/local configuration to discover existing access before asking again. Never paste secrets into chat or commit them. Needed before their relevant gates: one consenting pilot store and approved content/product links; model provider access and spending cap; hosting/database/email/domain authorization; Stripe account and approved monthly price/allowance; reviewed business/privacy arrangements; and a named human operator. No specific merchant, price, paid plan, approval or credential is asserted to exist by this scope document.

## Immediate local execution

Inspect and preserve the existing Windows checkout, fetch the current refs, and continue from the identity-based MVP branch (or reconcile newer accepted work). Complete M0, then M1. The first deliverable is a database-backed visitor-to-staff conversation, not another scope document, mock dashboard or AI demo. Do not restart authentication or widen the release while that journey is unfinished.
