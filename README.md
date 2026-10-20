# Sales & Customer Support

This repository is being implemented in ordered, verified slices. The current foundation starts four processes; account management, durable chat and provider integrations are not implemented yet. See PROGRESS.md and TASKS.json for evidence and remaining gates.

## Windows development

Use Node 22.14.0 (pinned in `.node-version`) and pnpm 10.34.7. Run from this directory in PowerShell. The path contains an ampersand: invoke the pnpm JavaScript entry directly if the Windows command shim fails.

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm check
corepack pnpm --filter @sales-support/api start
corepack pnpm --filter @sales-support/worker start
corepack pnpm --filter @sales-support/dashboard dev
corepack pnpm --filter @sales-support/widget dev
```

If Corepack cannot provision its local cache, install the pinned manager into the ignored project-local tooling directory:

```powershell
npm.cmd install --prefix .tooling pnpm@10.34.7 --no-audit --no-fund
node .tooling/node_modules/pnpm/bin/pnpm.cjs install --frozen-lockfile
node .tooling/node_modules/pnpm/bin/pnpm.cjs check
```

If nested commands also need a writable Corepack cache, set `$env:COREPACK_HOME = Join-Path (Get-Location) '.tooling/corepack'` before running checks. A restricted Windows session may require approved package linking during installation. Do not disable security controls to work around it.

After building, `pnpm smoke` launches the built processes on isolated loopback ports 19301–19304, checks their HTTP responses and the widget loader, then stops them. This does not replace rendered browser journeys or database tests.

Build before starting API/worker. Their `/health` endpoints report process liveness at ports 3001/3002; this is not database or queue readiness. The worker currently has no job handlers. Defaults bind to loopback. Override HOST/PORT/WORKER_HEALTH_PORT through process environment; `.env.example` contains only non-secret examples. No environment file is automatically loaded.

The widget builds `loader.js` separately from its isolated iframe page. Serve its output from a dedicated origin when embedding on another site. Scoped visitor sessions and messaging are P03 work.

## Ownership and verification

Applications compose shared packages. Backend business rules live in `packages/backend/src/modules/<feature>` with public indexes and module READMEs. Database migrations will have one authority under `supabase/migrations` in P02. The current database package defines transaction contracts only; there is no connected database.

`pnpm check` runs lint, import/dependency boundary checks, type checking, focused tests and every application build. `pnpm format:check` checks source formatting. CI repeats these from the frozen lockfile. Boundary checks reject server dependencies in browsers, private cross-module imports, domain dependencies and source/package cycles. Tests include intentionally invalid imports and cycle cases.

Do not add secrets to browser environments. Live services, paid provisioning, customer messages and production releases retain the access gates in `docs/handoff/ACCESS_AND_APPROVALS.md`.
