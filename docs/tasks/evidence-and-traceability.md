# Completion evidence and traceability

Updated 2026-10-31. D1-D3 in the current request means difficulty levels 1-3 in the 177-task detailed backlog. It does not mean the original D1/D2/D3 knowledge-and-agent requirements in TASKS.json.

## Authoritative records

- TASKS.json retains all 44 original acceptance requirements and their IDs. Do not replace these with the difficulty subset.
- docs/reference/verified-status-and-checklist.md contains their full acceptance text.
- docs/evidence/p01-foundation.md records the earlier Windows foundation; it is dated evidence, not proof of the current Windows checkout.
- The detailed backlog maps each feature task to original IDs through source_task_ids. Completing a child task does not automatically complete its parent requirement.
- docs/tasks/d1-d3-status.md records this implementation batch and its outstanding dependencies when available.

## Evidence states

Record these separately: implemented, tested, committed, published, Windows-verified, staging-verified, production-verified. A source file proves only implementation. A commit must have a real SHA; publishing requires the remote ref and corresponding file. Tests record the command, result, environment and tested SHA. An API fixture is not a live provider. Hosted Windows CI is not the owner's Windows computer. A review document is not business/legal approval.

Only mark an overall task complete when all acceptance criteria and required approvals/dependencies are satisfied. Preparatory contracts may be implemented while their broader feature remains blocked. Report that explicitly. Difficulty must never override security prerequisites.

## Original requirement groups (44 IDs preserved)

| Group | Original IDs | Delivery area |
| --- | --- | --- |
| A | A1, A2, A3, A4, A5, A6 | Workspace, architecture, tooling, docs, Git, Windows copy |
| B | B1, B2, B3, B4 | Database, identity, isolation, credentials |
| C | C1, C2, C3, C4 | Widget, inbox, takeover, onboarding |
| D | D1, D2, D3, D4, D5 | Knowledge lifecycle, bounded AI, grounding, evaluations |
| E | E1, E2, E3, E4 | Commerce, synchronization, order verification, offboarding |
| F | F1, F2, F3, F4 | Commercial plans, subscriptions, billing events, usage |
| G | G1, G2, G3, G4, G5 | Security, privacy, legal review, AI disclosure, commercial terms |
| H | H1, H2, H3, H4 | Environments, domains, delivery, recovery |
| I | I1, I2, I3, I4, I5 | Monitoring, operations, tests, acceptance, maintenance |
| J | J1, J2, J3 | WhatsApp onboarding, messaging rules, costs |

## Current batch mapping

REP tasks extend A1-A6. ARC tasks contribute to A1-A3, B4, H2 and I1. MSG-01 contributes only contracts/control rules toward B1/B3/C1-C3. KNW-01 specifies intake before D1-D2 ingestion. COM-01 defines a port before E1-E4 integration. USE-01 defines events before F4 enforcement. AGT-01 classifies tools before D3-D5 execution/evaluation. None of these mappings certify their broader parent requirements.

## Reconcile historical claims

The base branch at 315b2ba0ea4262536bcb9dba6ace67047c1f13b2 contains genuine application source and earlier evidence. Earlier conversation claims that the repository was empty are no longer current. Earlier unsupported claims that complete support/AI/database workflows existed must not be reused. Inspect the actual source and fresh CI results.

All this batch's development changes belong to feat/d1-d3-foundations and PR #1. Default-branch content, production services and the owner's local disk are not changed merely by opening that PR.
