# Local database authority

All application migrations live in migrations/. They were created with Supabase CLI 2.121.0 (`supabase migration new`). Postgres major version 17 and the local services are selected by the pinned CLI; config.toml uses isolated ports 55420–55424 and project ID sales-support-local. No hosted project is linked.

Schemas are feature-owned: tenancy, support, knowledge, integrations, jobs, audit and billing. The private helper schema and business schemas are excluded from the Data API. Every business table has enabled/forced RLS and explicit grants. API and worker logins have no superuser or bypass privilege and no schema mutation rights. Login passwords are provisioned separately, never embedded in migrations.

Private SECURITY DEFINER functions have an empty search_path, qualified objects and explicit EXECUTE grants. They are restricted to membership/session lookup, guarded organization/member changes and opaque worker job leasing. API users cannot query auth tables. Storage uses authenticated RLS with a live verified session and tenant-prefixed object names. The public knowledge bucket URL is disabled.

With Docker running, install from the lockfile, then use `pnpm local:start`. The wrapper withholds CLI output because it contains local development keys. `LOCAL_DB_TESTS=1 pnpm test:migrations` explicitly acknowledges rebuilding this disposable project-local database, tests an upgrade from the first schema with a synthetic row preserved, then rebuilds empty. `LOCAL_DB_TESTS=1 pnpm test:db` creates synthetic users through real local Auth and exercises restricted API/worker roles and storage. On PowerShell set `$env:LOCAL_DB_TESTS='1'` before the command.

After tests, `pnpm local:prepare` generates ignored local runtime configuration and rotates the two local application role passwords. Then `pnpm local:api` starts the built API on port 19311 and `pnpm --filter @sales-support/dashboard dev` starts the dashboard on port 5183. Preparation invalidates earlier local role connection passwords, so stop development API processes before rerunning DB tests. `pnpm local:advisors` runs the local security advisor. `pnpm local:stop` stops only this project's stack.

These commands never imply cloud verification. Local email is intercepted by Mailpit at http://127.0.0.1:55424. The elevated local mail allowance is for synthetic tests only. No seed/customer data is shipped. Test-created synthetic accounts/records remain until the next acknowledged disposable replay.


