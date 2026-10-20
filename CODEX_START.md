# Initial Codex task — execute the project, do not repeat the planning

You are taking over the implementation of **AI Sales & Customer Support SaaS**.
This file is the implementation instruction from the project owner. Follow local
and applicable repository instructions and the permission boundaries below.

## Required destination

Work directly in my local checkout:

```text
C:\Users\nanaa\Desktop\Studies\Self_Studies\Codes\Projects\AI Sales & Customer Support SaaS
```

The intended GitHub remote is:

```text
https://github.com/NanaAddoDBa/AI-Sales-Customer-Support-SaaS.git
```

Create actual files in that checkout and commit/push modularly through my authorized
Git access. A cloud workspace or a separate Codex worktree is not the same as this
path. Inspect the working directory first; explain and resolve a location mismatch
before claiming local delivery. Preserve all existing work and repository history.

## Baseline and required reading

Read `AGENTS.md`, `docs/handoff/CURRENT_STATE.md`, `docs/handoff/DECISIONS.md`,
`docs/handoff/EXECUTION_PLAN.md`, `PROGRESS.md` and `TASKS.json`. Then read the
architecture/product/security specifications needed for the current phase.
All 44 original acceptance tasks are preserved in
`docs/reference/verified-status-and-checklist.md`.

The previous ChatGPT delivery contains specifications, not a working application.
Earlier claims about implemented features, passing tests and commits were withdrawn.
Do not repeat them. No usable Git bundle was delivered. Do not run the old installer.
Re-inspect the actual repository: it may have changed after the recorded audit.

## First actions

Inspect only relevant project paths and authorized tooling. Check the actual
repository root, origin, branch, working-tree changes, remote history, Git write
access, Node/package-manager tooling and local database/container prerequisites.
Never print credentials. Obtain any truly necessary interactive login through the
normal secure flow, not by requesting a token in chat.

Reconcile this handoff with existing code rather than replacing it. If genuinely
empty, initialize the repository at the exact project path. If the remote already
has commits, preserve them and build from that history. Never commit into a parent
folder or create duplicate source repositories without explaining the need.

Make a brief execution checkpoint, then **write the actual code immediately**.
Do not return only an architecture explanation, an implementation proposal or a
list of commands for me to run. Perform the available actions yourself.

## Implementation scope

Build a maintainable modular, atomic, feature-based TypeScript monorepo: merchant
React dashboard, independently bundled customer widget, Fastify API, background
worker, feature-owned backend modules and shared UI/contracts/SDK/config packages.
Use the supplied architecture with current supported pinned dependencies.

Complete the website-first SaaS: accounts/organizations/roles; tenant isolation;
merchant onboarding; widget and persisted conversations; staff inbox/replies;
human takeover; approved knowledge ingestion/retrieval; bounded model/tool runtime;
one real authorized commerce integration; verified private order lookup; legitimate
checkout links; billing/usage caps; privacy/security controls; observability;
recovery; CI/CD; staging and production acceptance for the advertised scope.
WhatsApp has its own required implementation/approval gates when included in launch.
It must not be falsely listed as complete or quietly dropped from the overall backlog.

Work in the order in `EXECUTION_PLAN.md`. The first concrete milestone is a
reproducible monorepo build, followed by:

merchant account -> website widget -> durable conversation -> staff reply -> takeover.

Then add grounded AI, one commerce connector and the remaining commercial/launch
slices. Do not produce a large set of disconnected mock screens. Do not assume a
custom storefront, Hermes agent or flashcard codebase has been supplied here.

## How to finish each slice

Run its focused lint/type/build/unit/integration/browser checks as appropriate.
Fix actual failures; do not disable tests or safety controls to make checks pass.
Record exact commands, outcome, environment and evidence. Commit coherent changes
with meaningful feature-scoped messages, then push to the authorized branch and
verify the remote SHA. A documentation bootstrap commit is not feature implementation.
Preserve existing branch protection and normal approvals; do not force-push.
Update `TASKS.json` and `PROGRESS.md` after real progress. Keep independent states
for implementation, verification, commit/push, staging and production.

## Autonomy and legitimate blockers

Continue the ordered implementation during the active task without asking me to
approve every routine edit or test. Use the documented defaults unless contradicted
by real repository context. Do not spend limited task context repeatedly reading
unchanged documentation or designing new architecture.

Do not incur unapproved spending, change DNS, send real customer messages, run live
charges, expose customer data, perform destructive migrations, or publicly launch
without the appropriate specific authorization. Never bypass sandbox protections.
Prepare the corresponding code/config/tests/runbooks even when a production
credential is unavailable. Mark real-service verification blocked and continue
independent work. Ask only for the exact access or decision that is genuinely needed.
Do not call mocks or placeholder secrets a verified provider integration.

## End-of-task output

Report what actually changed and works, commands and tests actually run, actual
commit SHAs and remote verification, remaining failures, and the next task ID.
State clearly whether anything was deployed and to which environment. Update the
persistent checkpoint so I can resume by using `CODEX_RESUME.md`.

**Start with the local/repository inspection and the first executable implementation
slice now. Do not stop at another plan, and do not claim the entire SaaS is finished
without the recorded production acceptance evidence.**
