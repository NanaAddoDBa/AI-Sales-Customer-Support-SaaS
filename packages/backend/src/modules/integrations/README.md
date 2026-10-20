# Integrations

Owns integrations.connections and encrypted credential envelopes. AES-256-GCM binds version, key ID, organization, connection and provider as authenticated context. Only a current owner/admin with a recent session can store or rotate credentials through the restricted API role. Browser/Data API/worker roles cannot read ciphertext here. No provider connector or credential HTTP route is exposed in P02.

Keys stay outside Postgres in a server-only secret manager/environment key ring; there is no default key. Rotation decrypts with an old key and writes with the active key in a locked transaction. Never remove an old key until all envelopes and required backups have migrated. See docs/runbooks/credential-rotation.md.
