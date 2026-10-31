# Extending a feature

Read CONTRIBUTING.md and the owning feature README. This guide is executable against the conversation/contract tests; independent contributor and browser-harness acceptance remain separate tasks.

## Add a backend capability

1. Define the versioned external payload in contracts, excluding caller-selected authorization context. Add malformed/extra-field tests.
2. Add pure rules under the module's domain directory. Add an application operation that depends on ports rather than a provider client.
3. Define the smallest port with explicit scope, cancellation, errors and idempotency requirements. Implement a synthetic adapter only in tests until real authorization is available.
4. Export the supported operation through the module index. Compose it in the API/worker only after authorization and rate/budget controls exist.
5. Add positive, denial, retry and failure tests plus the feature README. Run the full checks before publication.

Reference: packages/backend/src/modules/conversations contains all three domain/application/port layers. Its missing durable adapter is intentionally explicit, not represented by an in-memory production repository.

## Add a channel

Implement verified inbound binding, deduplication and outbound delivery behind channel ports. Reuse conversation state and final delivery authorization, not separate per-channel copies. Add provider-specific consent/window/template checks as applicable. Test synthetic events first; keep real delivery evidence separate and authorized.

## Add a model or store adapter

Preserve tool permissions, source ownership, budgets, deadlines, error semantics and processing restrictions. A model fallback cannot silently change data region or trust level. A commerce adapter uses verified tenant/customer scope, live values and safe checkout URLs; it must not expose credentials or treat an order ID as authentication.

## Focused verification commands

After `pnpm install --frozen-lockfile` and dependency builds:

```text
pnpm exec tsx --test tests/contracts.test.ts
pnpm exec tsx --test tests/conversation-control.test.ts
pnpm exec tsx --test tests/api-runtime.test.ts tests/sdk.test.ts
pnpm exec tsx --test tests/email.test.ts tests/secrets.test.ts
pnpm check
pnpm smoke
pnpm format:check
node scripts/check-secrets.mjs
```

A successful focused test is not a replacement for real database/provider/browser tests required by the feature. Record commands, exit results, SHA and remaining gates in the evidence document.
