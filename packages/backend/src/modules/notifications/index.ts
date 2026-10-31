export {
  prepareEmail,
  type TransactionalEmailInput,
} from "./application/prepare-email.js";
export { sendTransactionalEmail } from "./application/send-email.js";
export { RecordingEmailTransport } from "./infrastructure/recording-email-transport.js";
export type {
  EmailTransport,
  PreparedEmail,
  EmailResult,
} from "./ports/email-transport.js";
