# Foundation toolchain

Date: 2026-10-20. Status: accepted for P01.

Use the installed Node 22.14.0 maintenance-LTS line and pin pnpm 10.34.7, Turborepo 2.11.9, Vite 8.3.4, React 19.3.1 and Fastify 5.12.7. Pin TypeScript 6.0.3 with typescript-eslint 8.72.0 and ESLint 10.13.0. Registry metadata was queried during implementation. TypeScript 7.0.2 was rejected because the parser supports TypeScript below 6.1; the compatible installation has no peer-dependency warnings.

Vite documents Node 22.12+ support: https://vite.dev/guide/. Fastify supports Node LTS lines: https://fastify.dev/docs/latest/Reference/LTS/. The installed runtime meets those minimums. Upgrade the pinned runtime in a separately verified maintenance change before production; minimum compatibility does not establish patch currency or production security acceptance.

The architecture remains a modular monolith. Worker liveness has a separate HTTP listener but no queue handler yet. Health means process liveness only. There is no readiness endpoint until actual dependency checks exist.

On this Windows filesystem the default Corepack cache could not be provisioned and restricted pnpm linking failed. A project-local ignored tooling/cache directory plus normal approved package linking allowed installation. No global security or Git settings were changed.
