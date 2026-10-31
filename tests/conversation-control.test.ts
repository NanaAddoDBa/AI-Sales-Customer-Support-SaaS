import assert from "node:assert/strict";
import { test } from "node:test";
import {
  transitionControl,
  canDeliverAssistant,
  changeControl,
  ControlError,
  toolRequirement,
  type ConversationControl,
  type ControlRepository,
} from "../packages/backend/src/index.js";

const initial: ConversationControl = {
  id: "synthetic-c1",
  organizationId: "synthetic-t1",
  state: "AI_ACTIVE",
  revision: 0,
};
const agent = {
  organizationId: "synthetic-t1",
  role: "agent" as const,
  aiEnabled: true,
};
test("takeover invalidates the pending generation even after returning to AI", () => {
  const human = transitionControl(initial, "TAKE_OVER", 0, agent);
  assert.equal(human.state, "HUMAN_ACTIVE");
  assert.equal(canDeliverAssistant(initial, human), false);
  const returned = transitionControl(human, "RETURN_TO_AI", 1, agent);
  assert.equal(returned.state, "AI_ACTIVE");
  assert.equal(canDeliverAssistant(initial, returned), false);
  assert.equal(canDeliverAssistant(returned, returned), true);
});
test("customer can request human support but cannot grant agent permissions", () => {
  const customer = { ...agent, role: "customer" as const };
  assert.equal(
    transitionControl(initial, "REQUEST_HANDOFF", 0, customer).state,
    "HANDOFF_PENDING",
  );
  for (const action of [
    "TAKE_OVER",
    "RESOLVE",
    "RETURN_TO_AI",
    "REOPEN",
  ] as const)
    assert.throws(
      () => transitionControl(initial, action, 0, customer),
      ControlError,
    );
  assert.throws(() =>
    transitionControl(initial, "TAKE_OVER", 0, {
      ...agent,
      organizationId: "other",
    }),
  );
  assert.throws(() => transitionControl(initial, "TAKE_OVER", 1, agent));
});
test("reopening never silently resumes AI and returning requires AI to be enabled", () => {
  const resolved = transitionControl(initial, "RESOLVE", 0, agent);
  const reopened = transitionControl(resolved, "REOPEN", 1, agent);
  assert.equal(reopened.state, "HUMAN_ACTIVE");
  assert.throws(() =>
    transitionControl(reopened, "RETURN_TO_AI", 2, {
      ...agent,
      aiEnabled: false,
    }),
  );
  assert.equal(transitionControl(resolved, "RESOLVE", 1, agent), resolved);
});
test("application treats failed compare-and-set as a conflict", async () => {
  const repository: ControlRepository = {
    async find(tenant, id) {
      return tenant === initial.organizationId && id === initial.id
        ? initial
        : null;
    },
    async compareAndSet() {
      return false;
    },
  };
  await assert.rejects(
    changeControl(repository, agent, initial.id, "TAKE_OVER", 0),
    /CONFLICT/,
  );
  await assert.rejects(
    changeControl(
      repository,
      { ...agent, organizationId: "other" },
      initial.id,
      "TAKE_OVER",
      0,
    ),
    /FORBIDDEN/,
  );
});
test("tool policy denies unknown tools and isolates sensitive decisions", () => {
  assert.equal(toolRequirement("arbitrary_sql"), "DENY");
  assert.equal(toolRequirement("get_order"), "VERIFIED_ORDER_OWNERSHIP");
  assert.equal(toolRequirement("refund"), "STAFF_APPROVAL");
  assert.equal(toolRequirement("create_checkout"), "EXPLICIT_PURCHASE_INTENT");
});
