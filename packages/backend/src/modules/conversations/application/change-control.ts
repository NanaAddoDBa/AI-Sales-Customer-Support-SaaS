import {
  ControlError,
  transitionControl,
  type ControlAction,
  type TrustedControlContext,
} from "../domain/control.js";
import type { ControlRepository } from "../ports/control-repository.js";

export async function changeControl(
  repository: ControlRepository,
  context: TrustedControlContext,
  conversationId: string,
  action: ControlAction,
  expectedRevision: number,
) {
  const current = await repository.find(context.organizationId, conversationId);
  if (!current) throw new ControlError("FORBIDDEN");
  const next = transitionControl(current, action, expectedRevision, context);
  if (next !== current && !(await repository.compareAndSet(current, next)))
    throw new ControlError("CONFLICT");
  return next;
}
