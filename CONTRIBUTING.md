# Contributing

Read AGENTS.md, PROGRESS.md and the relevant feature README before editing. Preserve existing changes. Work on a focused branch; do not force-push or rewrite shared history.

## Reproduce

Use the exact Node and pnpm versions in .node-version/package.json. Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm smoke`, `pnpm format:check` and `node scripts/check-secrets.mjs`. Run `pnpm format` before committing style changes. The README covers Windows setup.

## Feature ownership

Applications are composition roots. Backend modules own their domain, application services, ports and adapters. Cross-module calls use public indexes. Browser code cannot import server code or credentials. Atomic UI is business-neutral; feature components stay with their feature.

## Commits and review

One coherent feature/change per commit, such as `feat(conversations): add control policy`. Stage explicit files, inspect the diff, run focused checks, commit, publish without force and verify the remote SHA. Do not claim someone else's identity or include unrelated work. A PR records task IDs, test evidence and exact unresolved gates.

## CI security

Normal checks have read-only repository permissions, pinned action revisions, no persisted checkout credentials, no production secrets and no dependency cache restored from another branch. Linux and Windows hosted checks are separate from verification of the owner's computer. The built-in scanner detects selected high-confidence secret patterns in tracked text; binary archives and historical commits require separate review. Passing it is not a security certification.

## Safety

Fixtures use synthetic identifiers and example.invalid addresses. No live messages, charges, paid resources, customer-data operations or production deployments without the applicable approval. Never disable tests or authorization to make checks pass.
