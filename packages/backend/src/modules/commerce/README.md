# Commerce ownership

Owns store connections and catalog/order/checkout adapters. This slice defines a provider port, not a live integration. A platform and authorized pilot store remain owner decisions; no Shopify, WooCommerce or custom-store authorization is assumed.

Scope comes from verified membership/channel binding. Store adapters must recheck customer ownership for private orders. Never treat the `VerifiedOrderScope` TypeScript interface alone as proof of authentication. Request only the minimal read-product/read-order and checkout permissions; no refund, write-address, capture-payment or campaign privileges in this release.

Adapter contract cases: correct tenant, wrong tenant, verified and unverified customer, missing/stale stock, unavailable provider, cancellation, timeout after a possible checkout side effect, duplicate idempotency key, disallowed checkout host, credential expiry, disconnect and reconciliation. All fixtures must be explicitly synthetic. Marketplace review and billing rules must be recorded after selecting the distribution route.
