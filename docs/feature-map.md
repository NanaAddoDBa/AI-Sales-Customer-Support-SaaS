# Feature map

This map distinguishes implemented foundation code from operational product features. Read PROGRESS.md for current verification evidence.

| Area | Owner/path | Implemented boundary | Still required |
| --- | --- | --- | --- |
| API | apps/api/src | Composition, limits, request IDs, safe errors, liveness/readiness | Authenticated business routes, real readiness probes |
| Worker | apps/worker/src | Process bootstrap/liveness/shutdown | Durable scoped jobs, retries, readiness |
| Contracts | packages/contracts/src | Validated messages, public/internal distinction, tools, money, usage, knowledge metadata | New feature contracts as implementation grows |
| SDK | packages/sdk/src | Bounded decoded health/readiness client | Authenticated business APIs and browser journey verification |
| Conversations | packages/backend/src/modules/conversations | Control domain/application/port and tests | Database repository, outbox, actual messages/realtime, concurrency integration tests |
| Agents | packages/backend/src/modules/agents | Fail-closed tool policy | Provider runtime, authorization, budgets, evaluations, live acceptance |
| Commerce | packages/backend/src/modules/commerce | Provider port and scope requirements | Selected authorized store, live connector, synchronization and order verification |
| Notifications | packages/backend/src/modules/notifications | Safe templates, delivery port, synthetic-only recording transport | Real sender, durable retries, signed delivery events |
| Observability | packages/observability/src | Redacted log serializers and allowed correlation metadata | Job instrumentation, trace/error provider, alerts and operational dashboards |
| Dashboard/widget | apps/dashboard and apps/widget | Existing React/Vite entrypoints and isolated loader | Accounts, connected screens and full shopper/staff journeys |
| UI | packages/ui/src | Existing shared foundation component | Atomic design system, accessibility/browser verification |
| Database | packages/database | Transaction interface only | Real schema/migrations, auth integration, actual-role tenant tests |
| Tooling | scripts and .github/workflows | Build, boundary tests, smoke, secret-pattern scan, cross-platform checks, source evidence | Full security/history/archive review and deployment pipelines |

## Documentation ownership

Product/workflow baseline: docs/specs. Knowledge and navigation requirements: docs/product. Module rules: per-module READMEs and docs/architecture. Extension steps: docs/development. Access/decisions/evidence rules: docs/tasks. The original 44 acceptance IDs remain in TASKS.json; do not mark them complete from a narrow foundation slice.
