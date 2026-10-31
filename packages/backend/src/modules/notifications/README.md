# Notifications ownership

Owns transactional-email preparation and transport ports. Fixed verification, invitation, recovery and operational-alert templates never include customer transcript excerpts or private information in subjects. Action URLs must match explicitly trusted HTTPS origins. The caller supplies a scoped idempotency key.

`RecordingEmailTransport` is a bounded, no-network testing adapter accepting only `@example.invalid` recipients. Its result is `recorded`, never `delivered`. A production transport, authenticated sender domain, durable retry/dead-letter handling and authorized real-delivery checks are still required. No email is sent by this slice.

Production adapters should return provider acceptance identifiers, not imply final delivery. Delivery/bounce callbacks need signature checks, duplicate handling and reconciliation. Keep recipient/action-token content out of operational telemetry. Do not expose the recording adapter through HTTP.
