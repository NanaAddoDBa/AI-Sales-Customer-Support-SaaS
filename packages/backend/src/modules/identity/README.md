# Identity

Owns the Supabase Auth adapter, not the auth schema. Uses a publishable key, never a service-role key. Every protected request verifies its token through Auth, then tenancy verifies current session and membership in Postgres. Anonymous/unverified accounts are denied. Raw user metadata is never authorization input.

Signup, verification, password login, refresh, global logout and password recovery are supported. Recovery uses the local intercepted inbox in tests. Session responses and request bodies must never be logged. Browser sessions are kept in memory; reload requires sign-in. Password changes sign out all sessions.
