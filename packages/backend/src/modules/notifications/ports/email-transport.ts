export interface PreparedEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
  idempotencyKey: string;
}
export type EmailResult =
  | { status: "accepted" | "recorded"; receiptId: string }
  | { status: "failed"; code: "EMAIL_DELIVERY_FAILED" };
export interface EmailTransport {
  send(email: PreparedEmail): Promise<EmailResult>;
}
