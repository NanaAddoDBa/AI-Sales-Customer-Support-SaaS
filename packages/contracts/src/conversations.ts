import { identifier, integer, member, onlyKeys, record, text, timestamp, version, invalid } from "./validation.js";

export const CONVERSATION_STATES = ["AI_ACTIVE", "HANDOFF_PENDING", "HUMAN_ACTIVE", "RESOLVED"] as const;
export type ConversationState = (typeof CONVERSATION_STATES)[number];
export const AUTHOR_TYPES = ["customer", "agent", "assistant", "system"] as const;
export type AuthorType = (typeof AUTHOR_TYPES)[number];
export const DELIVERY_STATES = ["pending", "sent", "delivered", "failed"] as const;
export type DeliveryState = (typeof DELIVERY_STATES)[number];

export interface SendMessageRequest {
  version: 1;
  clientMessageId: string;
  text: string;
  expectedRevision: number;
}

/** Tenant, actor, visibility and permissions are deliberately not accepted. */
export function parseSendMessageRequest(value: unknown): SendMessageRequest {
  const data = record(value);
  onlyKeys(data, ["version", "clientMessageId", "text", "expectedRevision"]);
  const message = text(data.text, 4000);
  if (!message.trim()) invalid();
  return {
    version: version(data.version),
    clientMessageId: identifier(data.clientMessageId),
    text: message,
    expectedRevision: integer(data.expectedRevision),
  };
}

export interface MessageDto {
  version: 1;
  id: string;
  conversationId: string;
  author: AuthorType;
  visibility: "public" | "internal";
  delivery: DeliveryState;
  text: string;
  createdAt: string;
  sequence: number;
}

export function parseMessage(value: unknown): MessageDto {
  const data = record(value);
  onlyKeys(data, ["version", "id", "conversationId", "author", "visibility", "delivery", "text", "createdAt", "sequence"]);
  const author = member(data.author, AUTHOR_TYPES);
  const visibility = member(data.visibility, ["public", "internal"]);
  if (visibility === "internal" && author !== "agent" && author !== "system") invalid();
  return {
    version: version(data.version),
    id: identifier(data.id),
    conversationId: identifier(data.conversationId),
    author,
    visibility,
    delivery: member(data.delivery, DELIVERY_STATES),
    text: text(data.text, 4000),
    createdAt: timestamp(data.createdAt),
    sequence: integer(data.sequence),
  };
}

export function parsePublicMessage(value: unknown): MessageDto {
  const message = parseMessage(value);
  if (message.visibility !== "public") invalid();
  return message;
}

export const sendMessageJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["version", "clientMessageId", "text", "expectedRevision"],
  properties: {
    version: { const: 1 },
    clientMessageId: { type: "string", minLength: 1, maxLength: 128, pattern: "^[A-Za-z0-9][A-Za-z0-9_:-]*$" },
    text: { type: "string", minLength: 1, maxLength: 4000, pattern: "\\S" },
    expectedRevision: { type: "integer", minimum: 0, maximum: Number.MAX_SAFE_INTEGER },
  },
} as const;
