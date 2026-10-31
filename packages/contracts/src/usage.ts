import {
  identifier,
  integer,
  member,
  onlyKeys,
  record,
  timestamp,
  version,
} from "./validation.js";

export interface UsageEvent {
  version: 1;
  eventId: string;
  organizationId: string;
  operationId: string;
  providerRequestId: string;
  occurredAt: string;
  kind: "model" | "tool" | "channel";
  inputTokens: number;
  outputTokens: number;
  quantity: number;
  estimatedCostMicros: number;
  currency: "USD" | "EUR";
  priceVersion: string;
}

/** Internal event only: never accept this as an authenticated public billing write. */
export function parseUsageEvent(value: unknown): UsageEvent {
  const data = record(value);
  onlyKeys(data, [
    "version",
    "eventId",
    "organizationId",
    "operationId",
    "providerRequestId",
    "occurredAt",
    "kind",
    "inputTokens",
    "outputTokens",
    "quantity",
    "estimatedCostMicros",
    "currency",
    "priceVersion",
  ]);
  return {
    version: version(data.version),
    eventId: identifier(data.eventId),
    organizationId: identifier(data.organizationId),
    operationId: identifier(data.operationId),
    providerRequestId: identifier(data.providerRequestId),
    occurredAt: timestamp(data.occurredAt),
    kind: member(data.kind, ["model", "tool", "channel"]),
    inputTokens: integer(data.inputTokens),
    outputTokens: integer(data.outputTokens),
    quantity: integer(data.quantity),
    estimatedCostMicros: integer(data.estimatedCostMicros),
    currency: member(data.currency, ["USD", "EUR"]),
    priceVersion: identifier(data.priceVersion),
  };
}
