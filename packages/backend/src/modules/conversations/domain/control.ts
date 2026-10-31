export type ControlState =
  | "AI_ACTIVE"
  | "HANDOFF_PENDING"
  | "HUMAN_ACTIVE"
  | "RESOLVED";
export type ControlAction =
  | "REQUEST_HANDOFF"
  | "TAKE_OVER"
  | "RESOLVE"
  | "REOPEN"
  | "RETURN_TO_AI";
export interface ConversationControl {
  readonly id: string;
  readonly organizationId: string;
  readonly state: ControlState;
  readonly revision: number;
}
export interface TrustedControlContext {
  readonly organizationId: string;
  readonly role: "customer" | "agent" | "assistant";
  readonly aiEnabled: boolean;
}
export class ControlError extends Error {
  constructor(readonly code: "FORBIDDEN" | "CONFLICT" | "INVALID_TRANSITION") {
    super(code);
    this.name = "ControlError";
  }
}

/** Context must be derived from verified membership/session, never request JSON. */
export function transitionControl(
  current: ConversationControl,
  action: ControlAction,
  expectedRevision: number,
  context: TrustedControlContext,
): ConversationControl {
  if (context.organizationId !== current.organizationId)
    throw new ControlError("FORBIDDEN");
  if (
    !Number.isSafeInteger(expectedRevision) ||
    expectedRevision < 0 ||
    current.revision !== expectedRevision
  )
    throw new ControlError("CONFLICT");
  if (context.role !== "agent" && action !== "REQUEST_HANDOFF")
    throw new ControlError("FORBIDDEN");
  let state: ControlState;
  switch (action) {
    case "REQUEST_HANDOFF":
      if (current.state === "RESOLVED")
        throw new ControlError("INVALID_TRANSITION");
      state = current.state === "AI_ACTIVE" ? "HANDOFF_PENDING" : current.state;
      break;
    case "TAKE_OVER":
      if (current.state === "RESOLVED")
        throw new ControlError("INVALID_TRANSITION");
      state = "HUMAN_ACTIVE";
      break;
    case "RESOLVE":
      state = "RESOLVED";
      break;
    case "REOPEN":
      if (current.state !== "RESOLVED")
        throw new ControlError("INVALID_TRANSITION");
      state = "HUMAN_ACTIVE";
      break;
    case "RETURN_TO_AI":
      if (
        !context.aiEnabled ||
        !["HUMAN_ACTIVE", "HANDOFF_PENDING"].includes(current.state)
      )
        throw new ControlError("INVALID_TRANSITION");
      state = "AI_ACTIVE";
      break;
    default:
      throw new ControlError("INVALID_TRANSITION");
  }
  if (state === current.state) return current;
  if (!Number.isSafeInteger(current.revision + 1))
    throw new ControlError("CONFLICT");
  return { ...current, state, revision: current.revision + 1 };
}

/** Must be evaluated inside a durable compare-and-set/outbox transaction later. */
export function canDeliverAssistant(
  generationSnapshot: ConversationControl,
  current: ConversationControl,
): boolean {
  return (
    generationSnapshot.id === current.id &&
    generationSnapshot.organizationId === current.organizationId &&
    generationSnapshot.state === "AI_ACTIVE" &&
    current.state === "AI_ACTIVE" &&
    generationSnapshot.revision === current.revision
  );
}
