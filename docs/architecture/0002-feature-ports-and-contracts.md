# ADR 0002: feature-owned ports and validated contracts

Status: implemented foundation design. This does not approve a live provider or production release.

## Boundaries

Applications compose backend modules. Each module owns domain rules, application operations, ports, adapters and its README/public index. Browser-safe versioned payload validators live in contracts; the SDK decodes responses rather than trusting TypeScript declarations alone. Infrastructure implements ports and never gains authority from a model-selected tenant ID.

## Working reference

The conversations module implements pure control transitions and changeControl through a scoped ControlRepository. Tests exercise stale revision rejection, tenant mismatch, role restrictions, human takeover invalidation, explicit AI resumption and compare-and-set failure. No production database adapter or durable delivery route exists yet.

The commerce module defines the provider port and required scope; agents classify tool requirements with default denial; notifications prepare escaped fixed templates behind a transport port. Their READMEs distinguish interface, synthetic adapter and live acceptance.

## Compatibility

Externally exchanged contracts carry version 1. Unknown fields/versions are rejected on security-sensitive inputs. Do not add a required field or reinterpret money/usage units under the existing version. Introduce a new version, support the compatibility window explicitly, add decoders and contract tests, then retire the old version through a documented release. Money uses integer minor units and usage cost uses integer micros with a currency/price version.

Caller JSON must not select authenticated organization, role, verified customer state, privileged tool permissions or message visibility. Those come from trusted application authorization. Even a correctly typed port parameter is not identity proof.

## Dependency and extension policy

Use public exports, not cross-module internals. Never import backend/database/config into browser packages. Keep domain logic independent of frameworks/providers. A new adapter must pass the same synthetic contract suite and its separate authorized real-service acceptance. A module must not query another module's tables directly; expose an operation or event contract instead.
