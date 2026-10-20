# Access and consequential-action gates

## Allowed implementation direction

The owner has requested local code creation, complete feature implementation,
focused checks, modular commits and GitHub publishing to the named repository.
Use existing authorized credentials and the normal approval/sandbox mechanisms.
No script in this handoff automatically changes local files, repo or cloud accounts.

## Inspect without leaking secrets

Check availability/status, not credential contents: Git/GitHub auth, supported
runtime/package manager, disposable/local DB/container service, approved provider
connections and deployment tooling. Limit inspection to relevant project resources.
Do not dump environment variables, tokens, auth headers, user files or customer data.
Read-only access is not proof write/deploy access exists. Prompt securely for login
only when genuinely required. Do not invent credentials or request them in chat.

## Owner-controlled gates

| Gate | Needed before | Work that can continue without it |
|---|---|---|
| Git write authorization and correct identity | Real remote push | Local edits, tests, coherent local commits when identity is configured |
| Windows local folder access | Claiming delivery at the requested path | Handoff/context preparation; cloud work must be labelled separately |
| Provider connection and approved spending cap | Live model calls or paid infrastructure | Adapters, validation, controlled fixtures, local tests/config |
| Selected test store and merchant permission | Live commerce integration verification | Interface and scoped adapter work for a known platform; other modules |
| Distribution and billing decisions | Public store-app release and billing implementation finalization | Payment-independent entitlements and appropriately labelled sandbox logic |
| Sandbox billing account | External billing acceptance | Local event handling, schema, replay/dedup tests |
| Domain/DNS and approved email sender | Domain/verification changes and live delivery | Config, runbooks, local preview and test email tools |
| Explicit production authorization | Production data/migrations, deployment, DNS, real charges/messages | Staging/local code and test work in authorized environments |
| Business/privacy/commercial review | Paid public launch | Technical controls, source registers, review drafts and evidence |
| Named operational owner/support coverage | Production acceptance | Monitoring/runbooks, tested alerts with approved recipients |
| Meta assets/merchant onboarding/access | Real WhatsApp verification and release | Channel abstraction and safe local tests |

Use least privilege. No force pushes, deletion/recreation of cloud projects, global
security bypass, destructive schema work, public exposure of an admin interface,
unbounded model testing or paid purchases without the appropriate approval.
Do not infer vendor plan purchases from the user approving the architecture.

When blocked, report: task ID, exact attempted action, non-secret error, missing
access/decision, minimum owner action and what independent work was completed.
Do not report an unavailable integration as connected just because its code exists.
