import type { ConversationControl } from "../domain/control.js";

/** Implementations must scope all operations and commit control + audit atomically. */
export interface ControlRepository {
  find(organizationId: string, conversationId: string): Promise<ConversationControl | null>;
  compareAndSet(
    previous: ConversationControl,
    next: ConversationControl,
  ): Promise<boolean>;
}
