# Evidence record template

Create a separate `docs/evidence/<phase>-<slice>.md` when real work is performed.
Do not copy this template and mark it passed without running the checks.

## Identity
- Task IDs:
- Date/time and timezone:
- Working directory, environment and branch:
- Code commit SHA tested (or explicitly uncommitted):
- Relevant pinned tool/provider/model versions:

## Actual change
Describe the working user journey and significant files, schema and configuration.
Distinguish source implementation, mocks/fixtures, real services and external blockers.

## Checks performed
| Exact command/action | Environment | Exit/result | Evidence/artifact |
|---|---|---|---|

Record real results, including failures and skips. Redact secrets/customer data.
A screenshot alone does not prove backend behavior or tenant isolation.

## Git delivery
- Actual commit SHA(s):
- Actual remote and branch:
- Push command/result:
- Remote-ref verification and matching SHA:

A local commit is not a push. Do not invent SHAs or attach a result to a different
code version. Record a tested commit's SHA after it exists; no self-referential
amend/rewrite loop is needed for the evidence document's own commit.

## Deployment, only if actually performed
- Environment, URL/service ID and deployed SHA:
- Specific owner authorization where required:
- Smoke checks and rollback/recovery evidence:

## Open work
- Remaining failures and launch blockers:
- Uncommitted files and their purpose:
- Exact next task ID and action:
- Owner access/decision needed, or none:
