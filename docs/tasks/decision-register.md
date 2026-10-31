# Remaining decisions and engineering defaults

Status: working requirements, not fabricated owner approvals. Read docs/handoff/DECISIONS.md for the carried user requirements and choices that must not be silently resolved.

## Established scope

Maintainable TypeScript feature-based monorepo; modular monolith with separate API/worker processes; website widget and merchant inbox; approved knowledge; bounded AI; one complete commerce integration; verified private order access; staff approval for sensitive actions; subscriptions and usage controls. WhatsApp is retained but separately release-gated. Shopper payments remain in merchant checkout. No unrelated storefront build, autonomous refunds, arbitrary SQL/shell tools or production-readiness claim.

## Decisions still needed

| Task | Decision | Why it remains open |
| --- | --- | --- |
| DEC-01 / DEC-03 | Actual first commerce platform and distribution route | Provider-neutral ports are implemented; selecting an unauthorized pilot or storefront is not an engineering assumption |
| DEC-02 | Pilot merchant, target niche, approved workflows and success goals | No merchant approval supplied |
| DEC-05 | Prices, counting unit, allowances, refunds/tax handling, spend ceiling and support coverage | Usage schema is not a commercial contract or an authorization to spend |
| DEC-06 | Business-approved service, quality and recovery targets | Candidate test targets below are not a promised SLA |
| DEC-08 | Real approved FAQs, policies and evaluation cases | Synthetic test fixtures cannot represent approved merchant policy |

## Candidate engineering test targets (not approved service promises)

Use these to prepare tests, then record accepted or replaced values before release testing:

- Initial load scenario: 10 synthetic organizations, 50 concurrent text conversations, with declared request/message rates in the load test.
- API target excluding external model/store calls: p95 under 500 ms; separately record cold start, error rate and maximum latency.
- AI target: first visible response p95 under 5 seconds and bounded final response p95 under 15 seconds; never hide tool/provider latency.
- Security gates: zero demonstrated cross-tenant reads/writes or unauthorized order/tool actions in the release suite; no unresolved release-blocking findings.
- Quality proposal: at least 90% correct supported answers in a reviewed evaluation set, zero invented prices/orders in its critical cases, and explicit escalation for unsupported requests. Record sample size, failures and reviewer method.
- Accessibility target: keyboard-complete core journeys, meaningful focus/errors and a reviewed WCAG 2.2 AA target; no claim of conformance without verification.
- Recovery candidate: RPO 24 hours and RTO 4 hours only if business-approved and demonstrated, including uploaded documents. Tighter targets require a different tested backup plan and potentially additional paid capabilities.

These values are proposals, not measured performance or owner acceptance. No production infrastructure or recurring costs are selected by this document.
