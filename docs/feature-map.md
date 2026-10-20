# Feature ownership

| Area | Owner | Current public interface |
| --- | --- | --- |
| Process liveness | backend health module | getHealth |
| Runtime bind configuration | config | readRuntimeConfig |
| Health response shape | contracts | Health |
| Browser HTTP transport | sdk | fetchHealth |
| Generic controls | ui | Button |
| Transaction boundary | database | TransactionRunner (interface only) |
| Log redaction defaults | observability | loggerOptions |
| Consented local fixture identifiers | testing | syntheticOrganizations |
| Account lifecycle | backend identity module | SupabaseIdentity, registerIdentityRoutes |
| Organizations and member permissions | backend tenancy module | TenancyRepository, registerTenancyRoutes |
| Encrypted provider credentials | backend integrations module | CredentialCipher, CredentialRepository |
| Scoped Postgres transactions | database | TenantDatabase, restricted Pool |
| Merchant account and staff UI | dashboard identity feature | AccountWorkspace |

API and worker are composition roots. Dashboard and widget are independently built browser applications. The widget loader opens the chat document in an iframe. Identity/tenant records now persist through Auth and Postgres. Customer support runtime flows and paid services remain later slices; migrations establish their tenant-owned storage without claiming those workflows exist.

Future modules must own their tables, rules, ports and adapters, expose a public index and describe ownership in a module README. P03 introduces durable human support using the P02 identity and data boundaries. Cache/realtime/export boundaries remain ongoing B3 gates as those paths are implemented. Empty feature folders are deliberately omitted.
