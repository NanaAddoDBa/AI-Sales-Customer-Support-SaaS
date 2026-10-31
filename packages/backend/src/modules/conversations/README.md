# Conversations ownership

Owns conversation control, messages, assignments and delivery decisions. This slice implements control invariants and the compare-and-set port only. It does not implement a database repository, authenticated routes, durable delivery or realtime subscriptions.

- Domain: pure transitions; no framework, provider or database imports.
- Application: coordinates a tenant-scoped repository port.
- Ports: `ControlRepository`; every adapter must scope reads and atomically compare revisions.
- Public boundary: this directory's `index.ts`.

Verified identity and membership must establish `TrustedControlContext`. Do not deserialize that context from an HTTP body. Message contracts deliberately omit caller-selected tenant, author and visibility. Internal notes require separate authorized commands and cannot pass the public-message decoder.

`canDeliverAssistant` is a necessary check, not a complete race-free delivery implementation. The future durable outbox adapter must run it with locking/revision checks at the final delivery decision. A model result generated at an older revision stays invalid even after staff deliberately return control to AI.

No other module may query conversation tables or import these internals. Add coordination through ports/public application functions.
