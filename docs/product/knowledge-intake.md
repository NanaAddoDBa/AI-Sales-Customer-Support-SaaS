# Knowledge intake specification

Task KNW-01. Schema: packages/contracts/src/knowledge.ts. This is intake policy and metadata validation, not a working upload/parser/indexing service.

## Initial formats and limits

Manual FAQ text, UTF-8 plain text, Markdown and text-bearing PDF are in scope. MIME declarations are untrusted; the future server must inspect actual bytes and use bounded isolated parsers. Scanned/image-only or encrypted PDFs return a clear unsupported-content error; OCR, archives, executable content and external website crawling are not silently enabled.

Per source: 5 MiB upload, 200,000 extracted characters. Per workspace: 100 active sources. Manual FAQ: 10,000 characters. Filename: at most 120 characters, no path separators or control characters. Storage uses server-generated keys, never the supplied filename. The metadata language field accepts en/de; that is not proof of translated UI or AI language quality.

## Review and lifecycle

`pending -> validating -> extracting -> review_required -> approved -> indexing -> ready`.

A failed stage becomes `failed` with a safe error code and retriable/non-retriable explanation. Only an authorized merchant owner/admin can approve a source version. Failed retries cannot bypass review. Keep source ID, version, tenant, checksum, uploader/reviewer identifiers and timestamps. Index only the approved current version.

Replacement creates a new version; approval and index activation must invalidate the former version's retrieval/caches according to the lifecycle transaction. Deletion enters `deleting`, revokes retrieval immediately, removes original/chunks/derived caches according to retention rules, then becomes `deleted`. Do not claim deletion is complete while retry jobs remain unresolved.

## Security and acceptance

Metadata checks do not prove content safety, tenant ownership, quota concurrency enforcement or prompt-injection resistance. Uploaded instructions are untrusted data, not system instructions. Store credentials, private orders and current inventory must not be imported as general FAQ knowledge. Live prices, stock and private order information come from authorized commerce tools.

Later acceptance must exercise real tenant-scoped storage and indexing, malformed/oversize files, missing text, unsupported MIME, import cancellation, stale source replacement, deletion, review permissions, worker retries and visible failure states. None passed merely because the metadata contract test passed.
