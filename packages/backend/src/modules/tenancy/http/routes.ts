import type { FastifyInstance, FastifyRequest } from "fastify";
import type { VerifiedClaims } from "@sales-support/database";
import type { TenancyRepository } from "../infrastructure/tenancy-repository.js";
const uuid = { type: "string", format: "uuid" };
const role = { type: "string", enum: ["admin", "agent", "viewer"] };
const object = (properties: Record<string, unknown>) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});
export function registerTenancyRoutes(
  app: FastifyInstance,
  repository: TenancyRepository,
  verify: (token: string) => Promise<VerifiedClaims>,
) {
  async function actor(request: FastifyRequest) {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ") || header.length > 8192)
      throw new Error("Unauthorized");
    return verify(header.slice(7));
  }
  app.get("/organizations", async (r) => ({
    organizations: await repository.list(await actor(r)),
  }));
  app.post<{ Body: { name: string } }>(
    "/organizations",
    {
      schema: {
        body: object({
          name: { type: "string", minLength: 1, maxLength: 100 },
        }),
      },
    },
    async (r) => repository.create(await actor(r), r.body.name),
  );
  app.get<{ Params: { organizationId: string } }>(
    "/organizations/:organizationId/members",
    { schema: { params: object({ organizationId: uuid }) } },
    async (r) => ({
      members: await repository.members(
        await actor(r),
        r.params.organizationId,
      ),
    }),
  );
  app.post<{
    Params: { organizationId: string };
    Body: { email: string; role: string };
  }>(
    "/organizations/:organizationId/invitations",
    {
      schema: {
        params: object({ organizationId: uuid }),
        body: object({
          email: { type: "string", format: "email", maxLength: 254 },
          role,
        }),
      },
    },
    async (r) =>
      repository.invite(
        await actor(r),
        r.params.organizationId,
        r.body.email,
        r.body.role,
      ),
  );
  app.post<{ Body: { token: string } }>(
    "/invitations/accept",
    {
      schema: {
        body: object({
          token: { type: "string", minLength: 40, maxLength: 100 },
        }),
      },
    },
    async (r) => repository.accept(await actor(r), r.body.token),
  );
  app.patch<{
    Params: { organizationId: string; userId: string };
    Body: { role: string; revoke: boolean };
  }>(
    "/organizations/:organizationId/members/:userId",
    {
      schema: {
        params: object({ organizationId: uuid, userId: uuid }),
        body: object({ role, revoke: { type: "boolean" } }),
      },
    },
    async (r) => {
      await repository.change(
        await actor(r),
        r.params.organizationId,
        r.params.userId,
        r.body.role,
        r.body.revoke,
      );
      return { message: "Membership updated." };
    },
  );
}
