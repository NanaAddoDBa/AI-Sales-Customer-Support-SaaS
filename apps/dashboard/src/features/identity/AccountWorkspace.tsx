import { useState, useEffect, type FormEvent } from "react";
import {
  MerchantClient,
  type AuthSession,
  type Organization,
  type Membership,
} from "@sales-support/sdk";
const client = new MerchantClient();
const fields = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  return new FormData(event.currentTarget);
};
export function AccountWorkspace() {
  const [session, setSession] = useState<AuthSession | null>(null),
    [mode, setMode] = useState<"login" | "signup" | "recovery" | "password">(
      "login",
    );
  const [organizations, setOrganizations] = useState<Organization[]>([]),
    [selected, setSelected] = useState(""),
    [members, setMembers] = useState<Membership[]>([]);
  const [notice, setNotice] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [invite, setInvite] = useState("");
  const organization = organizations.find((o) => o.id === selected),
    manager = organization?.role === "owner" || organization?.role === "admin";
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (error) {
      setError(error instanceof Error ? error.message : "The request failed.");
    } finally {
      setBusy(false);
    }
  }
  async function load(active: AuthSession) {
    const result = await client.organizations(active);
    setOrganizations(result.organizations);
    setSelected((previous) =>
      result.organizations.some((o) => o.id === previous)
        ? previous
        : (result.organizations[0]?.id ?? ""),
    );
  }
  useEffect(() => {
    const hash = new URLSearchParams(location.hash.slice(1));
    const accessToken = hash.get("access_token"),
      refreshToken = hash.get("refresh_token");
    if (location.hash)
      history.replaceState(null, "", location.pathname + location.search);
    if (accessToken && refreshToken) {
      setSession({
        accessToken,
        refreshToken,
        expiresAt:
          Number(hash.get("expires_at")) || Math.floor(Date.now() / 1000) + 600,
      });
      if (hash.get("type") === "recovery") setMode("password");
    }
  }, []);
  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    void client
      .organizations(session)
      .then((result) => {
        if (!cancelled) {
          setOrganizations(result.organizations);
          setSelected((previous) =>
            result.organizations.some((o) => o.id === previous)
              ? previous
              : (result.organizations[0]?.id ?? ""),
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
          setError("Your session is no longer active. Please sign in.");
        }
      });
    const timer = setTimeout(
      () => {
        void client
          .refresh(session.refreshToken)
          .then((next) => {
            if (!cancelled) setSession(next);
          })
          .catch(() => {
            if (!cancelled) {
              setSession(null);
              setError("Your session expired. Please sign in.");
            }
          });
      },
      Math.max(
        1000,
        (session.expiresAt ?? Math.floor(Date.now() / 1000) + 600) * 1000 -
          Date.now() -
          60000,
      ),
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [session]);
  useEffect(() => {
    setMembers([]);
    setInvite("");
    if (!session || !selected) return;
    let cancelled = false;
    void client
      .members(session, selected)
      .then((result) => {
        if (!cancelled) setMembers(result.members);
      })
      .catch(() => {
        if (!cancelled) setError("Members could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, [session, selected]);
  function authenticate(event: FormEvent<HTMLFormElement>) {
    const data = fields(event);
    void run(async () => {
      const email = String(data.get("email") ?? ""),
        password = String(data.get("password") ?? "");
      if (mode === "signup") {
        setNotice((await client.signup(email, password)).message);
        setMode("login");
      } else if (mode === "recovery") {
        setNotice((await client.recovery(email)).message);
      } else {
        const active = await client.login(email, password);
        setSession(active);
        await load(active);
        setNotice("Signed in.");
      }
    });
  }
  return (
    <main>
      <h1>Merchant workspace</h1>
      <p>Manage your account, organizations and staff access.</p>
      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{error}</p>}
      {!session ? (
        <section aria-label="Account access">
          <nav aria-label="Account actions">
            {(["login", "signup", "recovery"] as const).map((value) => (
              <button
                key={value}
                type="button"
                disabled={busy}
                aria-pressed={mode === value}
                onClick={() => {
                  setMode(value);
                  setError("");
                }}
              >
                {value === "login"
                  ? "Sign in"
                  : value === "signup"
                    ? "Create account"
                    : "Recover password"}
              </button>
            ))}
          </nav>
          <h2>
            {mode === "signup"
              ? "Create account"
              : mode === "recovery"
                ? "Recover password"
                : "Sign in"}
          </h2>
          <form onSubmit={authenticate}>
            <label>
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                maxLength={254}
              />
            </label>
            {mode !== "recovery" && (
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  required
                  minLength={12}
                  maxLength={128}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                />
              </label>
            )}
            <button disabled={busy}>
              {busy
                ? "Please wait…"
                : mode === "signup"
                  ? "Create account"
                  : mode === "recovery"
                    ? "Send recovery email"
                    : "Sign in"}
            </button>
          </form>
          <p>
            Verify your email before signing in. Sessions stay in memory;
            reloading requires sign-in.
          </p>
        </section>
      ) : (
        <>
          <button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                try {
                  await client.logout(session);
                  setNotice("Signed out from all sessions.");
                } finally {
                  setSession(null);
                  setOrganizations([]);
                  setMembers([]);
                  setSelected("");
                  setMode("login");
                }
              })
            }
          >
            Sign out
          </button>
          {mode === "password" ? (
            <section>
              <h2>Choose a new password</h2>
              <form
                onSubmit={(event) => {
                  const data = fields(event);
                  void run(async () => {
                    await client.password(
                      session,
                      String(data.get("password")),
                    );
                    setSession(null);
                    setMode("login");
                    setNotice("Password changed. Sign in again.");
                  });
                }}
              >
                <label>
                  New password
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={12}
                    maxLength={128}
                    autoComplete="new-password"
                  />
                </label>
                <button disabled={busy}>Update password</button>
              </form>
            </section>
          ) : (
            <>
              <section>
                <h2>Organizations</h2>
                {organizations.length ? (
                  <label>
                    Active organization
                    <select
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                    >
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.role})
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <p>
                    No organization access yet. Create one or accept an
                    invitation.
                  </p>
                )}
                <form
                  onSubmit={(event) => {
                    const data = fields(event);
                    void run(async () => {
                      const result = await client.create(
                        session,
                        String(data.get("name")),
                      );
                      await load(session);
                      setSelected(result.id);
                      setNotice("Organization created.");
                    });
                  }}
                >
                  <label>
                    Organization name
                    <input name="name" required maxLength={100} />
                  </label>
                  <button disabled={busy}>Create organization</button>
                </form>
                <form
                  onSubmit={(event) => {
                    const data = fields(event);
                    void run(async () => {
                      await client.accept(session, String(data.get("token")));
                      await load(session);
                      setNotice("Invitation accepted.");
                    });
                  }}
                >
                  <label>
                    Invitation token
                    <input
                      name="token"
                      required
                      minLength={40}
                      maxLength={100}
                      autoComplete="off"
                    />
                  </label>
                  <button disabled={busy}>Accept invitation</button>
                </form>
              </section>
              {organization && (
                <section>
                  <h2>Staff access</h2>
                  <p>
                    Your role: {organization.role}. Member management requires a
                    sign-in within the last 15 minutes.
                  </p>
                  <ul>
                    {members.map((member) => (
                      <li key={member.user_id}>
                        <span>
                          {member.user_id} — {member.role}
                          {member.revoked_at ? " (revoked)" : ""}
                        </span>
                        {manager &&
                          !member.revoked_at &&
                          member.role !== "owner" &&
                          (organization.role === "owner" ||
                            member.role !== "admin") && (
                            <>
                              <label>
                                Role for {member.user_id}
                                <select
                                  value={member.role}
                                  disabled={busy}
                                  onChange={(event) =>
                                    void run(async () => {
                                      await client.change(
                                        session,
                                        selected,
                                        member.user_id,
                                        event.target.value,
                                        false,
                                      );
                                      setMembers(
                                        (
                                          await client.members(
                                            session,
                                            selected,
                                          )
                                        ).members,
                                      );
                                      setNotice("Role updated.");
                                    })
                                  }
                                >
                                  {organization.role === "owner" && (
                                    <option value="admin">Admin</option>
                                  )}
                                  <option value="agent">Support agent</option>
                                  <option value="viewer">Viewer</option>
                                </select>
                              </label>
                              <button
                                disabled={busy}
                                onClick={() =>
                                  void run(async () => {
                                    await client.change(
                                      session,
                                      selected,
                                      member.user_id,
                                      member.role,
                                      true,
                                    );
                                    setMembers(
                                      (await client.members(session, selected))
                                        .members,
                                    );
                                    setNotice("Access revoked.");
                                  })
                                }
                              >
                                Revoke access
                              </button>
                            </>
                          )}
                      </li>
                    ))}
                  </ul>
                  {manager && (
                    <>
                      <form
                        onSubmit={(event) => {
                          const data = fields(event);
                          void run(async () => {
                            const result = await client.invite(
                              session,
                              selected,
                              String(data.get("email")),
                              String(data.get("role")),
                            );
                            setInvite(result.token);
                            setNotice(
                              "Invitation created. Share it privately with the intended colleague.",
                            );
                          });
                        }}
                      >
                        <label>
                          Staff email
                          <input
                            name="email"
                            type="email"
                            required
                            maxLength={254}
                          />
                        </label>
                        <label>
                          Staff role
                          <select name="role" defaultValue="agent">
                            {organization.role === "owner" && (
                              <option value="admin">Admin</option>
                            )}
                            <option value="agent">Support agent</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </label>
                        <button disabled={busy}>Create invitation</button>
                      </form>
                      {invite && (
                        <label>
                          Shareable invitation token
                          <textarea readOnly value={invite} />
                        </label>
                      )}
                      <p>
                        Invitations expire in seven days and bind to the
                        matching verified account. No invitation email is sent
                        automatically.
                      </p>
                    </>
                  )}
                </section>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
