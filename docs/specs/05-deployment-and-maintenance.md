# Deployment and maintenance

## Environments

Local development uses Docker/local Supabase and provider test modes with synthetic fixtures. On Windows, document either a supported native setup or the required Docker Desktop/WSL2 path explicitly. Cloud model inference does not require a local GPU.

Staging has a separate database/project, keys, storage namespace, provider test accounts and sanitized data. Production is isolated from staging. Do not give pull-request previews access to production data or secrets.

## Hosting topology

Cloudflare Pages hosts the dashboard and widget's static build. Railway runs API and worker Docker deployments with health checks and environment-specific secrets. Supabase provides database, authentication, object storage and queue persistence. Configure compatible regional locations deliberately and assess all data flows; a global static CDN is not the same as regional processing for personal data.

The widget loader is independently versioned, backward compatible and cacheable. Roll out changes gradually so a dashboard release cannot unexpectedly break every merchant embed.

## Release workflow

Commit/pull request -> lint and type checks -> unit and integration tests -> database/RLS checks -> dependency/secret checks -> AI regression set -> build -> deploy staging -> browser/provider smoke tests -> owner-approved production promotion -> deployment smoke tests and monitoring.

Use one migration authority. Prefer additive/expand-contract schema changes before removing old columns. Old application versions must remain compatible during rollout. A code rollback is not permission to roll a database back destructively.

Use signed webhooks, rate limits, provider timeouts, request IDs, per-conversation correlation IDs, redacted structured logs and error alerts. Verify email delivery, SPF/DKIM/DMARC configuration as relevant to the selected email provider, OAuth redirects and production domain TLS. Do not mark success only from local development tests.

## Backups and recovery

Supabase Pro includes daily database backups, but its database backups do not include objects stored through Storage [S1, S6]. Back up required source documents/objects separately, document recovery of application secrets and custom role credentials, and test restores.

Agree a recovery point objective (acceptable data loss) and recovery time objective (acceptable downtime). A daily backup alone can mean losing changes since that backup; it does not support a promise of minute-level recovery. Point-in-time recovery costs extra and should match the business requirement. Provider webhook replay is not a universal replacement for backups.

After restoring, reconcile outbound deliveries, commerce actions and subscriptions against external providers before resuming jobs. Otherwise the restored database may attempt an action already completed externally.

## Maintenance ownership

| Cadence | Technical operator | Merchant |
|---|---|---|
| Continuous alerts | Availability, queue lag, provider errors, token budgets, delivery failures | Urgent handoff/incident alerts within staffed coverage |
| Daily during pilot | Inspect exceptions, abuse and unexpectedly expensive conversations | Handle escalations, correct policy/product issues |
| Weekly | Review sampled answers, failed jobs, model regressions, cost per tenant and safe updates | Review repetitive questions and knowledge gaps |
| Monthly | Restore exercise as appropriate, retention jobs, access review, invoice/usage reconciliation | Review staff access, policies and business changes |
| Before changes | Verify provider API/model deprecations and run regression gates | Approve changed customer-facing policy/actions |

Cadences are proposed operating practices, not a claim that an automation has been scheduled. Start with limited staffed coverage and a clear after-hours fallback; a solo founder should not promise 24/7 human support without a resourced arrangement.

## Essential runbooks

Model provider unavailable; credits or tenant allowance exhausted; commerce credentials revoked; WhatsApp delivery/template restriction; queue backlog; incident or potential data exposure; restore/reconciliation; billing disagreement; merchant offboarding; rollback.

Every runbook states detection, immediate safe action, diagnosis, escalation owner and verified recovery. The minimum safe degraded mode is usually: persist messages, disable risky AI/tool actions, and preserve human support access.

## Sustainable operation

Measure actual support workload and per-tenant gross contribution. Poor merchant knowledge, connection permissions and integration changes may require more attention than servers. Managed hosting reduces some infrastructure tasks; it does not remove product ownership, security updates, incident response or customer support.
