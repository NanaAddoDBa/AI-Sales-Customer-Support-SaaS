# Worker composition root

The worker is a separate Fastify process with bounded HTTP requests, generated correlation IDs, safe errors, redacted logs and graceful shutdown. It exposes /health for process liveness and /ready for dependency readiness. Without a real dependency probe, /ready returns 503: no database or queue readiness is implied.

Only compose public backend module interfaces here. Durable queue claiming, scoped job execution, retry/dead-letter handling, cancellation and real dependency probes remain to be implemented. Unit tests of a readiness probe are not job-processing acceptance.

Unknown paths and thrown errors must not echo request URLs, query tokens or provider error details. Keep this operational endpoint private in the deployment network; it is not the customer API.
