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
