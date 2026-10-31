export type ToolRequirement =
  | "APPROVED_PUBLIC_KNOWLEDGE"
  | "LIVE_CATALOG"
  | "VERIFIED_ORDER_OWNERSHIP"
  | "EXPLICIT_PURCHASE_INTENT"
  | "HUMAN_HANDOFF"
  | "STAFF_APPROVAL"
  | "DENY";

/** Classification is not authorization; the runtime must enforce each requirement. */
export function toolRequirement(name: string): ToolRequirement {
  switch (name) {
    case "answer_faq":
      return "APPROVED_PUBLIC_KNOWLEDGE";
    case "search_products":
    case "get_product":
      return "LIVE_CATALOG";
    case "get_order":
      return "VERIFIED_ORDER_OWNERSHIP";
    case "create_checkout":
      return "EXPLICIT_PURCHASE_INTENT";
    case "request_human":
      return "HUMAN_HANDOFF";
    case "refund":
    case "cancel_order":
    case "change_address":
    case "grant_discount":
      return "STAFF_APPROVAL";
    default:
      return "DENY";
  }
}
