import assert from "node:assert/strict";
import { test } from "node:test";
import { ContractValidationError, parseSendMessageRequest, parsePublicMessage, parseToolRequest, parseMoney, parseUsageEvent, parseKnowledgeUploadMetadata, parseApiError } from "../packages/contracts/src/index.js";

const send = { version: 1, clientMessageId: "synthetic-message", text: "Hello", expectedRevision: 0 };
test("message requests reject identity, permissions, unknown versions and empty content", () => {
  assert.deepEqual(parseSendMessageRequest(send), send);
  for (const value of [null, [], { ...send, version: 2 }, { ...send, organizationId: "other-tenant" }, { ...send, author: "agent" }, { ...send, text: "  \n " }, { ...send, text: "x".repeat(4001) }, { ...send, expectedRevision: -1 }, { ...send, expectedRevision: 1.5 }]) {
    assert.throws(() => parseSendMessageRequest(value), ContractValidationError);
  }
});
test("public contract refuses internal notes and invalid calendar timestamps", () => {
  const message = { version: 1, id: "m1", conversationId: "c1", author: "agent", visibility: "public", delivery: "sent", text: "Hello", createdAt: "2026-10-31T00:00:00.000Z", sequence: 1 };
  assert.equal(parsePublicMessage(message).text, "Hello");
  assert.throws(() => parsePublicMessage({ ...message, visibility: "internal" }));
  assert.throws(() => parsePublicMessage({ ...message, createdAt: "2026-02-30T00:00:00.000Z" }));
});
test("tool contracts constrain operations without accepting forged authorization", () => {
  assert.equal(parseToolRequest({ version: 1, name: "get_order", orderId: "o1" }).name, "get_order");
  for (const value of [{ version: 1, name: "refund" }, { version: 1, name: "get_order", orderId: "o1", verified: true }, { version: 1, name: "create_checkout", productId: "p1", quantity: 0 }, { version: 1, name: "search_products", query: "gift", limit: 21 }]) assert.throws(() => parseToolRequest(value));
});
test("money and usage reject floats, invalid currency and unsafe numeric values", () => {
  assert.deepEqual(parseMoney({ amountMinor: 1299, currency: "EUR" }), { amountMinor: 1299, currency: "EUR" });
  for (const amountMinor of [NaN, Infinity, -1, 1.1, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => parseMoney({ amountMinor, currency: "EUR" }));
  assert.throws(() => parseMoney({ amountMinor: 1, currency: "eur" }));
  const usage = { version: 1, eventId: "e1", organizationId: "t1", operationId: "op1", providerRequestId: "p1", occurredAt: "2026-10-31T00:00:00.000Z", kind: "model", inputTokens: 20, outputTokens: 10, quantity: 1, estimatedCostMicros: 100, currency: "USD", priceVersion: "test-1" };
  assert.equal(parseUsageEvent(usage).inputTokens, 20);
  assert.throws(() => parseUsageEvent({ ...usage, outputTokens: -1 }));
});
test("knowledge metadata rejects path traversal and unsupported content", () => {
  const upload = { version: 1, filename: "policy.txt", mediaType: "text/plain", sizeBytes: 12, language: "en" };
  assert.equal(parseKnowledgeUploadMetadata(upload).filename, "policy.txt");
  for (const value of [{ ...upload, filename: "../secret" }, { ...upload, filename: "C:\\secret" }, { ...upload, sizeBytes: 0 }, { ...upload, sizeBytes: 999999999 }, { ...upload, mediaType: "application/zip" }]) assert.throws(() => parseKnowledgeUploadMetadata(value));
});
test("error parser never returns arbitrary upstream error details", () => {
  const result = parseApiError({ version: 1, error: { code: "INTERNAL_ERROR", message: "secret provider token", requestId: "r1" } });
  assert.equal(result.error.message, "The request could not be completed.");
  assert.throws(() => parseApiError({ version: 1, error: { code: "UNKNOWN", requestId: "r1" } }));
});
