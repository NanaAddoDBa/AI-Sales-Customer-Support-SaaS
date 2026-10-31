import type { Money } from "@sales-support/contracts";

/** Constructed by the authorization layer; never taken from a model argument. */
export interface CommerceScope {
  organizationId: string;
  integrationId: string;
}
export interface CurrentProduct {
  id: string;
  title: string;
  price: Money;
  availability: "in_stock" | "out_of_stock" | "unknown";
  checkedAt: string;
}
export interface VerifiedOrderScope extends CommerceScope {
  customerId: string;
  verificationId: string;
}
export interface OrderSummary {
  id: string;
  status: "pending" | "paid" | "fulfilled" | "cancelled" | "unknown";
  fulfillmentStatus: string;
  checkedAt: string;
}
export interface CheckoutLink {
  url: string;
  expiresAt: string;
}

/** All adapters must enforce tenant and customer ownership at the store boundary. */
export interface CommerceProvider {
  searchProducts(
    scope: CommerceScope,
    query: string,
    limit: number,
    signal: AbortSignal,
  ): Promise<CurrentProduct[]>;
  getProduct(
    scope: CommerceScope,
    productId: string,
    signal: AbortSignal,
  ): Promise<CurrentProduct | null>;
  getOrder(
    scope: VerifiedOrderScope,
    orderId: string,
    signal: AbortSignal,
  ): Promise<OrderSummary | null>;
  createCheckout(
    scope: CommerceScope,
    productId: string,
    quantity: number,
    idempotencyKey: string,
    signal: AbortSignal,
  ): Promise<CheckoutLink>;
}
