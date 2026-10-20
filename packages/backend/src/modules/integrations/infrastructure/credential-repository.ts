import { randomUUID } from "node:crypto";
import type { TenantDatabase, VerifiedClaims } from "@sales-support/database";
import type {
  CredentialCipher,
  CredentialEnvelope,
} from "./credential-cipher.js";
export class CredentialRepository {
  constructor(
    private readonly database: TenantDatabase,
    private readonly cipher: CredentialCipher,
  ) {}
  store(
    claims: VerifiedClaims,
    organizationId: string,
    provider: string,
    secret: string,
  ) {
    const id = randomUUID(),
      context = { organizationId, connectionId: id, provider };
    const envelope = this.cipher.encrypt(secret, context);
    return this.database.asUser(claims, async (db) => {
      await db.query(
        "insert into integrations.connections(id,organization_id,provider,credential_envelope) values($1,$2,$3,$4)",
        [id, organizationId, provider, envelope],
      );
      return id;
    });
  }
  rotate(claims: VerifiedClaims, organizationId: string, connectionId: string) {
    return this.database.asUser(claims, async (db) => {
      const row = (
        await db.query(
          "select provider,credential_envelope from integrations.connections where organization_id=$1 and id=$2 for update",
          [organizationId, connectionId],
        )
      ).rows[0];
      if (!row) throw new Error("Forbidden");
      const envelope = this.cipher.rotate(
        row.credential_envelope as CredentialEnvelope,
        { organizationId, connectionId, provider: row.provider },
      );
      await db.query(
        "update integrations.connections set credential_envelope=$3 where organization_id=$1 and id=$2",
        [organizationId, connectionId, envelope],
      );
      return { keyId: envelope.keyId };
    });
  }
}
