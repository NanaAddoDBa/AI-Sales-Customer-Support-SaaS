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
