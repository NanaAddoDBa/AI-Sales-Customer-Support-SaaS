# Sales & Customer Support

Merchant signup, email verification, login/logout, recovery, organizations and staff invitations/roles now use local Supabase Auth and Postgres. API/worker role isolation, private storage and encrypted credential rotation have real-service tests. Durable customer chat and commerce/model/billing integrations remain later slices. See PROGRESS.md and TASKS.json for verified status.

## Windows setup

Use Node 22.14.0 and pnpm 10.34.7. Install from the committed lockfile and build before starting processes:

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm check
corepack pnpm smoke
```

If Corepack cannot provision its cache or command shims fail in the ampersand-containing checkout path, use the ignored local manager:

```powershell
npm.cmd install --prefix .tooling pnpm@10.34.7 --no-audit --no-fund
$env:COREPACK_HOME = Join-Path (Get-Location) '.tooling/corepack'
node .tooling/node_modules/pnpm/bin/pnpm.cjs install --frozen-lockfile --store-dir .tooling/store
node .tooling/node_modules/pnpm/bin/pnpm.cjs check
```

Restricted Windows sessions may require normal approval for package links or the Docker socket. Do not disable security controls. No environment file is loaded automatically. `.env.example` lists server-only configuration names, without credentials. Production refuses incomplete identity configuration and an API pool using a privileged database role.

## Local identity and tenant verification

Start Docker Desktop. Use the wrapper so CLI-generated development keys are withheld and the published database, API and intercepted-email ports bind exclusively to loopback:

```powershell
corepack pnpm local:start
$env:LOCAL_DB_TESTS = '1'
corepack pnpm test:migrations
corepack pnpm test:db
corepack pnpm local:advisors
corepack pnpm local:prepare
corepack pnpm local:api
```

In another terminal run `corepack pnpm --filter @sales-support/dashboard dev`. Dashboard: http://127.0.0.1:5183; API: http://127.0.0.1:19311; intercepted local email: http://127.0.0.1:55424. Account verification and recovery messages stay inside the local mail service. Sign in after creating/verifying an account, then create an organization or accept an invitation token from its owner/admin.

Browser sessions are held in memory, refreshed while the tab remains open and cleared on reload/sign-out. Membership changes require a sign-in within 15 minutes. Invitations expire after seven days and bind to the matching verified email. The inviter shares the token privately; the application does not send invitation emails automatically. Owner transfer/deletion is deliberately unavailable so membership changes cannot orphan an organization.

`test:migrations` acknowledges and rebuilds only this disposable local stack; it tests prior-schema upgrade preservation and empty replay. `test:db` uses real Auth, restricted PostgreSQL logins and private object storage with explicitly synthetic accounts. These tests rotate local application-role passwords; stop the development API before rerunning them and run `local:prepare` afterward. No hosted project is linked. Stop this project's services with `pnpm local:stop`; Docker itself and other projects are left alone.

See `supabase/README.md` for schema ownership and `docs/runbooks/credential-rotation.md` for encrypted envelopes, key rotation and database-role provisioning. Deployment secret management, SMTP and production acceptance remain separate gates.

## Verification and ownership

`pnpm check` runs lint, dependency/import boundaries, type checks, focused tests and every application build. `pnpm smoke` checks built API/worker health, dashboard/widget HTTP entrypoints and the widget loader, then stops its child processes. Health means process liveness, not queue or database readiness. `pnpm check:browser-secrets` compares browser outputs with actual local secret canaries when prepared runtime configuration exists. `pnpm format:check` checks formatting.

Hosted CI repeats foundation checks and uses a separate disposable Docker stack for migration replay, database isolation and security advisors. Browser CLI journeys under `tests/browser` cover accounts/roles and invitations/mobile separately. Prepare only synthetic local fixtures with `scripts/prepare-browser-fixtures.mjs`, then generate an ignored journey using `scripts/prepare-browser-journey.mjs account` or `invitations`; run it with `playwright-cli run-code --filename output/playwright/identity.journey.js`. Use a stable built preview on port 5183 with its configured API proxy. Screenshots and operational files stay in ignored output/tooling directories.

Backend rules live in feature modules with public indexes and READMEs. Browser code cannot import server/database packages; domain code cannot import frameworks or persistence. Organizations come from current membership/session checks; worker scope comes from database-issued job leases. Other feature modules must use public coordination ports instead of querying another module's tables. `docs/feature-map.md` records ownership.

The widget still displays an unavailable-chat message; its loader is separately bundled from the isolated iframe UI. Scoped visitor sessions and durable messaging are P03 work. No staging/production deployment or live provider integration is implied by local checks. The access gates in `docs/handoff/ACCESS_AND_APPROVALS.md` apply.
