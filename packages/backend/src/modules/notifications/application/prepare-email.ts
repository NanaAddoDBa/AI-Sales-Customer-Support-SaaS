import type { PreparedEmail } from "../ports/email-transport.js";

export type TransactionalEmailKind = "verification" | "invitation" | "recovery" | "alert";
export interface TransactionalEmailInput {
  kind: TransactionalEmailKind;
  to: string;
  actionUrl: string;
  idempotencyKey: string;
}
const templates = {
  verification: { subject: "Verify your account", body: "Confirm your email address to continue.", action: "Verify email" },
  invitation: { subject: "Workspace invitation", body: "You have been invited to a workspace. Review the invitation before accepting.", action: "Review invitation" },
  recovery: { subject: "Account recovery", body: "Use the secure link to recover your account. Ignore this message if you did not request it.", action: "Recover account" },
  alert: { subject: "Workspace action required", body: "A workspace setting requires your attention. Sign in to review the details.", action: "Review workspace" },
} as const;
function escape(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

/** Origins must come from trusted deployment configuration, not the request body. */
export function prepareEmail(input: TransactionalEmailInput, trustedOrigins: readonly string[]): PreparedEmail {
  if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(input.to) || input.to.length > 254)
    throw new Error("Invalid email recipient");
  if (!/^[A-Za-z0-9][A-Za-z0-9_:-]{0,127}$/.test(input.idempotencyKey))
    throw new Error("Invalid email operation identifier");
  const url = new URL(input.actionUrl);
  if (url.protocol !== "https:" || url.username || url.password || url.hash || !trustedOrigins.includes(url.origin))
    throw new Error("Email action URL must use an approved HTTPS origin");
  const template = templates[input.kind];
  if (!template) throw new Error("Unsupported email template");
  return {
    to: input.to,
    subject: template.subject,
    text: `${template.body}\n\n${url.href}\n\nDo not forward this private link.`,
    html: `<p>${escape(template.body)}</p><p><a href="${escape(url.href)}">${escape(template.action)}</a></p><p>Do not forward this private link.</p>`,
    idempotencyKey: input.idempotencyKey,
  };
}
