import pg from "pg";
export type { PoolClient } from "pg";
export const { Pool } = pg;
export interface VerifiedClaims {
  sub: string;
  session_id: string;
  exp: number;
  role: "authenticated";
}
export class TenantDatabase {
  constructor(private readonly pool: pg.Pool) {}
  async asUser<T>(
    claims: VerifiedClaims,
    operation: (session: pg.PoolClient) => Promise<T>,
  ): Promise<T> {
    return this.transaction(async (client) => {
      await client.query("select set_config('request.jwt.claims',$1,true)", [
        JSON.stringify(claims),
      ]);
      const result = await client.query("select private.active_user() as id");
      if (result.rows[0]?.id !== claims.sub) throw new Error("Unauthorized");
      return operation(client);
    });
  }
  async asJob<T>(
    leaseToken: string,
    operation: (session: pg.PoolClient) => Promise<T>,
  ): Promise<T> {
    return this.transaction(async (client) => {
      await client.query("select set_config('app.job_token',$1,true)", [
        leaseToken,
      ]);
      const result = await client.query(
        "select private.worker_organization() as id",
      );
      if (!result.rows[0]?.id) throw new Error("Invalid job lease");
      return operation(client);
    });
  }
  private async transaction<T>(
    operation: (session: pg.PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("begin");
      await client.query("set local statement_timeout = '5s'");
      const value = await operation(client);
      await client.query("commit");
      return value;
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
  async assertRole(expected: "sales_api" | "sales_worker") {
    const result = await this.pool.query(
      "select current_user as name, rolsuper, rolbypassrls from pg_roles where rolname=current_user",
    );
    const role = result.rows[0];
    if (role?.name !== expected || role.rolsuper || role.rolbypassrls)
      throw new Error("Unsafe database role");
  }
  async close() {
    await this.pool.end();
  }
}
