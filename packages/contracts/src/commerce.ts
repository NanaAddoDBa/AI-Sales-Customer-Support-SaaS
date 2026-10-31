import {
  identifier,
  integer,
  invalid,
  member,
  onlyKeys,
  record,
  text,
  version,
} from "./validation.js";

export interface Money {
  amountMinor: number;
  currency: string;
}
export function parseMoney(value: unknown): Money {
  const data = record(value);
  onlyKeys(data, ["amountMinor", "currency"]);
  const currency = text(data.currency, 3, 3);
  if (!/^[A-Z]{3}$/.test(currency)) invalid();
  return { amountMinor: integer(data.amountMinor), currency };
}

export type ToolRequest =
  | { version: 1; name: "search_products"; query: string; limit: number }
  | { version: 1; name: "get_product"; productId: string }
  | { version: 1; name: "get_order"; orderId: string }
  | { version: 1; name: "create_checkout"; productId: string; quantity: number }
  | { version: 1; name: "request_human" };

/** No arbitrary URL, SQL, credential, tenant, identity or destructive tool input. */
export function parseToolRequest(value: unknown): ToolRequest {
  const data = record(value);
  version(data.version);
  const name = member(data.name, [
    "search_products",
    "get_product",
    "get_order",
    "create_checkout",
    "request_human",
  ]);
  switch (name) {
    case "search_products": {
      onlyKeys(data, ["version", "name", "query", "limit"]);
      const limit = integer(data.limit, 20);
      if (limit < 1) invalid();
      return { version: 1, name, query: text(data.query, 200), limit };
    }
    case "get_product":
      onlyKeys(data, ["version", "name", "productId"]);
      return { version: 1, name, productId: identifier(data.productId) };
    case "get_order":
      onlyKeys(data, ["version", "name", "orderId"]);
      return { version: 1, name, orderId: identifier(data.orderId) };
    case "create_checkout": {
      onlyKeys(data, ["version", "name", "productId", "quantity"]);
      const quantity = integer(data.quantity, 20);
      if (quantity < 1) invalid();
      return {
        version: 1,
        name,
        productId: identifier(data.productId),
        quantity,
      };
    }
    case "request_human":
      onlyKeys(data, ["version", "name"]);
      return { version: 1, name };
  }
}
