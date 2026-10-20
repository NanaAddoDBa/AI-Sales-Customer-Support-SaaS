import { createHash, randomBytes } from "node:crypto";
import type { TenantDatabase, VerifiedClaims } from "@sales-support/database";
const hash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export class TenancyRepository {
  constructor(private readonly database: TenantDatabase) {}
  async requireRecentSession(claims: VerifiedClaims) {
    await this.database.asUser(claims, async (db) => {
      const result = await db.query(
        "select private.recent_session() as recent",
      );
      if (!result.rows[0]?.recent) throw new Error("Forbidden");
    });
  }
  list(claims: VerifiedClaims) {
    return this.database.asUser(
      claims,
      async (db) =>
        (
          await db.query(
            "select o.id,o.name,m.role from tenancy.organizations o join tenancy.memberships m on m.organization_id=o.id where m.user_id=$1 and m.revoked_at is null order by o.created_at",
            [claims.sub],
          )
        ).rows,
    );
  }
  create(claims: VerifiedClaims, name: string) {
    return this.database.asUser(
      claims,
      async (db) =>
        (await db.query("select private.create_organization($1) as id", [name]))
          .rows[0],
    );
  }
  members(claims: VerifiedClaims, organizationId: string) {
    return this.database.asUser(claims, async (db) => {
      const membership = await db.query(
        "select private.member_role($1) as role",
        [organizationId],
      );
      if (!membership.rows[0]?.role) throw new Error("Forbidden");
      return (
        await db.query(
          "select user_id,role,revoked_at from tenancy.memberships where organization_id=$1 order by created_at",
          [organizationId],
        )
      ).rows;
    });
  }
  invite(
    claims: VerifiedClaims,
    organizationId: string,
    email: string,
    role: string,
  ) {
    const token = randomBytes(32).toString("base64url");
    return this.database.asUser(claims, async (db) => {
      const result = await db.query(
        "select private.invite_member($1,$2,$3,$4) as id",
        [organizationId, email, role, hash(token)],
      );
      return { id: result.rows[0]?.id, token };
    });
  }
  accept(claims: VerifiedClaims, token: string) {
    return this.database.asUser(
      claims,
      async (db) =>
        (
          await db.query(
            "select private.accept_invitation($1) as organization_id",
            [hash(token)],
          )
        ).rows[0],
    );
  }
  change(
    claims: VerifiedClaims,
    organizationId: string,
    userId: string,
    role: string,
    revoke: boolean,
  ) {
    return this.database.asUser(claims, async (db) => {
      await db.query("select private.change_member($1,$2,$3,$4)", [
        organizationId,
        userId,
        role,
        revoke,
      ]);
    });
  }
}
