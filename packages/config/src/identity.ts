export function readIdentityConfig(env: Record<string, string | undefined>) {
  const values = [
    env.SUPABASE_URL,
    env.SUPABASE_PUBLISHABLE_KEY,
    env.API_DATABASE_URL,
    env.DASHBOARD_URL,
  ];
  if (values.every((v) => !v) && env.NODE_ENV !== "production") return null;
  if (values.some((v) => !v))
    throw new Error("Identity configuration is incomplete");
  const url = new URL(env.SUPABASE_URL!);
  const redirect = new URL(env.DASHBOARD_URL!);
  const database = new URL(env.API_DATABASE_URL!);
  const local = (host: string) => ["127.0.0.1", "localhost"].includes(host);
  if (
    (url.protocol !== "https:" &&
      !(url.protocol === "http:" && local(url.hostname))) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error("Invalid Auth URL");
  if (
    (redirect.protocol !== "https:" &&
      !(redirect.protocol === "http:" && local(redirect.hostname))) ||
    redirect.username ||
    redirect.password ||
    redirect.search ||
    redirect.hash
  )
    throw new Error("Invalid dashboard URL");
  if (
    !["postgres:", "postgresql:"].includes(database.protocol) ||
    decodeURIComponent(database.username) !== "sales_api" ||
    !database.password
  )
    throw new Error("API database must use its restricted role");
  if (
    !local(database.hostname) &&
    database.searchParams.get("sslmode") !== "verify-full"
  )
    throw new Error("Remote database requires verified TLS");
  if (!env.SUPABASE_PUBLISHABLE_KEY?.startsWith("sb_publishable_"))
    throw new Error("A publishable Auth key is required");
  return {
    url: url.origin,
    publishableKey: env.SUPABASE_PUBLISHABLE_KEY,
    redirectUrl: redirect.href,
    databaseUrl: env.API_DATABASE_URL!,
  };
}
export function readCredentialKeyring(env: Record<string, string | undefined>) {
  if (!env.CREDENTIAL_ACTIVE_KEY && !env.CREDENTIAL_KEYS_JSON) return null;
  try {
    const value: unknown = JSON.parse(env.CREDENTIAL_KEYS_JSON ?? "");
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      !env.CREDENTIAL_ACTIVE_KEY
    )
      throw new Error();
    const keys: Record<string, string> = {};
    for (const [id, key] of Object.entries(value)) {
      if (
        !/^[a-zA-Z0-9_-]{1,64}$/.test(id) ||
        typeof key !== "string" ||
        Buffer.from(key, "base64").length !== 32 ||
        Buffer.from(key, "base64").toString("base64") !== key
      )
        throw new Error();
      keys[id] = key;
    }
    if (!keys[env.CREDENTIAL_ACTIVE_KEY]) throw new Error();
    return { activeKey: env.CREDENTIAL_ACTIVE_KEY, keys };
  } catch {
    throw new Error("Invalid credential key configuration");
  }
}
