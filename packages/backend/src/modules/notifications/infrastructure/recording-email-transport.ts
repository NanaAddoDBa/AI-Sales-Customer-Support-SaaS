import type { EmailTransport, PreparedEmail } from "../ports/email-transport.js";

/** Test-only, bounded, no-network transport. Never reports mail as delivered. */
export class RecordingEmailTransport implements EmailTransport {
  private readonly messages = new Map<string, PreparedEmail>();
  async send(email: PreparedEmail) {
    if (!email.to.endsWith("@example.invalid"))
      throw new Error("Recording transport only accepts synthetic recipients");
    const prior = this.messages.get(email.idempotencyKey);
    if (prior && JSON.stringify(prior) !== JSON.stringify(email))
      throw new Error("Email idempotency conflict");
    if (!prior && this.messages.size >= 100)
      throw new Error("Recording transport capacity reached");
    this.messages.set(email.idempotencyKey, structuredClone(email));
    return { status: "recorded" as const, receiptId: email.idempotencyKey };
  }
  recorded(): PreparedEmail[] {
    return structuredClone([...this.messages.values()]);
  }
}
