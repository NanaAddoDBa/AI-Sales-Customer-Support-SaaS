import type { EmailResult, EmailTransport } from "../ports/email-transport.js";
import { prepareEmail, type TransactionalEmailInput } from "./prepare-email.js";

export async function sendTransactionalEmail(
  transport: EmailTransport,
  input: TransactionalEmailInput,
  trustedOrigins: readonly string[],
): Promise<EmailResult> {
  const message = prepareEmail(input, trustedOrigins);
  try {
    return await transport.send(message);
  } catch {
    // Surface failure without returning tokens, provider errors or recipients.
    return { status: "failed", code: "EMAIL_DELIVERY_FAILED" };
  }
}
