# Tenancy

Owns tenancy schema: organizations, memberships and one-use invitations. Public repository methods execute through live session checks and forced RLS. Member roles are loaded from current database rows on every transaction. Invites store hashes only, expire after seven days and bind to the verified account email. The inviter receives a shareable token once; no email is sent by this module.

Owner is immutable in this phase. Admins cannot create/promote admins or change owners. Member management requires a session created within 15 minutes; reauthenticate when stale. SQL functions serialize membership changes on the organization row and append minimal audit events atomically.
