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
