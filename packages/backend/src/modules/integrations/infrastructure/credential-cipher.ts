import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
export interface CredentialContext {
  organizationId: string;
  connectionId: string;
  provider: string;
}
export interface CredentialEnvelope {
  version: 1;
  keyId: string;
  iv: string;
  tag: string;
  ciphertext: string;
}
export class CredentialCipher {
  private readonly keys: ReadonlyMap<string, Buffer>;
  constructor(
    private readonly activeKey: string,
    keys: Record<string, string>,
  ) {
    const entries = Object.entries(keys).map(([id, key]) => {
      const decoded = Buffer.from(key, "base64");
      if (
        !/^[a-zA-Z0-9_-]{1,64}$/.test(id) ||
        decoded.length !== 32 ||
        decoded.toString("base64") !== key
      )
        throw new Error("Invalid credential key configuration");
      return [id, decoded] as const;
    });
    this.keys = new Map(entries);
    if (!this.keys.has(activeKey))
      throw new Error("Missing active credential key");
  }
  private aad(context: CredentialContext, keyId: string) {
    return Buffer.from(
      JSON.stringify([
        1,
        keyId,
        context.organizationId,
        context.connectionId,
        context.provider,
      ]),
    );
  }
  encrypt(secret: string, context: CredentialContext): CredentialEnvelope {
    if (!secret || Buffer.byteLength(secret) > 65536)
      throw new Error("Invalid credential length");
    const iv = randomBytes(12),
      cipher = createCipheriv(
        "aes-256-gcm",
        this.keys.get(this.activeKey)!,
        iv,
      );
    cipher.setAAD(this.aad(context, this.activeKey));
    const ciphertext = Buffer.concat([
      cipher.update(secret, "utf8"),
      cipher.final(),
    ]);
    return {
      version: 1,
      keyId: this.activeKey,
      iv: iv.toString("base64"),
      tag: cipher.getAuthTag().toString("base64"),
      ciphertext: ciphertext.toString("base64"),
    };
  }
  decrypt(envelope: CredentialEnvelope, context: CredentialContext) {
    const key = this.keys.get(envelope.keyId);
    if (envelope.version !== 1 || !key)
      throw new Error("Unknown credential key");
    try {
      const decipher = createDecipheriv(
        "aes-256-gcm",
        key,
        Buffer.from(envelope.iv, "base64"),
      );
      decipher.setAAD(this.aad(context, envelope.keyId));
      decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
      return Buffer.concat([
        decipher.update(Buffer.from(envelope.ciphertext, "base64")),
        decipher.final(),
      ]).toString("utf8");
    } catch {
      throw new Error("Credential authentication failed");
    }
  }
  rotate(envelope: CredentialEnvelope, context: CredentialContext) {
    return this.encrypt(this.decrypt(envelope, context), context);
  }
}
