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

API and worker are composition roots. Dashboard and widget are independently built browser applications. The widget loader opens the chat document in an iframe. No application currently handles customer messages, tenant data or paid services.

Future modules must own their tables, rules, ports and adapters, expose a public index and describe ownership in a module README. P02 introduces tenancy, authentication and migrations; P03 introduces durable human support. Empty feature folders are deliberately omitted.
