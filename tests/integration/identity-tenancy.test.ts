import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import {
  Pool,
  TenantDatabase,
  type VerifiedClaims,
} from "../../packages/database/src/index.js";
import {
  TenancyRepository,
  SupabaseIdentity,
  CredentialCipher,
  CredentialRepository,
} from "../../packages/backend/src/index.js";
import { createServer } from "../../apps/api/src/server.js";
// @ts-expect-error Local operational script has no declaration output.
import { prepareLocal } from "../../scripts/local-runtime.mjs";
const require = createRequire(
  new URL("../../packages/backend/package.json", import.meta.url),
);
const { createClient } = require("@supabase/supabase-js");

test(
  "real local Auth, SQL API/worker roles, storage and tenant boundaries",
  { timeout: 180000 },
  async (t) => {
    if (process.env.LOCAL_DB_TESTS !== "1")
      throw new Error(
        "Set LOCAL_DB_TESTS=1 to acknowledge disposable project-local tests",
      );
    const config = await prepareLocal();
    const admin = new Pool({ connectionString: config.DB_URL, max: 2 });
    const apiPool = new Pool({
      connectionString: config.API_DATABASE_URL,
      max: 1,
    });
    const workerPool = new Pool({
      connectionString: config.WORKER_DATABASE_URL,
      max: 2,
    });
    const apiDb = new TenantDatabase(apiPool),
      workerDb = new TenantDatabase(workerPool);
    const identity = new SupabaseIdentity({
      url: config.API_URL,
      publishableKey: config.PUBLISHABLE_KEY,
      redirectUrl: "http://127.0.0.1:5183/",
    });
    const tenancy = new TenancyRepository(apiDb);
    const app = createServer({ identity, tenancy });
    const authAdmin = createClient(config.API_URL, config.SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const password = "Synthetic-local-" + randomBytes(12).toString("hex");
    const run = randomUUID().slice(0, 8);
    const users: Array<{
      id: string;
      email: string;
      accessToken: string;
      refreshToken: string;
      claims: VerifiedClaims;
    }> = [];
    async function user(name: string) {
      const email = `synthetic-${name}-${run}@example.test`;
      const { data, error } = await authAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error || !data.user)
        throw new Error("Synthetic user creation failed");
      const session = await identity.login(email, password);
      const item = {
        id: data.user.id,
        email,
        ...session,
        claims: await identity.verify(session.accessToken),
      };
      users.push(item);
      return item;
    }
    const ownerA = await user("owner-a"),
      ownerB = await user("owner-b"),
      agent = await user("agent"),
      viewer = await user("viewer"),
      manager = await user("admin");
    const orgA = (await tenancy.create(ownerA.claims, "Synthetic Alpha"))
      .id as string;
    const orgB = (await tenancy.create(ownerB.claims, "Synthetic Beta"))
      .id as string;
    const call = (
      method: "GET" | "POST" | "PATCH",
      url: string,
      token?: string,
      payload?: unknown,
    ) =>
      app.inject({
        method,
        url,
        ...(token ? { headers: { authorization: `Bearer ${token}` } } : {}),
        ...(payload ? { payload: payload as Record<string, unknown> } : {}),
      });
    try {
      await t.test(
        "actual connection roles cannot bypass RLS or elevate privileges",
        async () => {
          await apiDb.assertRole("sales_api");
          await workerDb.assertRole("sales_worker");
          await assert.rejects(apiPool.query("set role postgres"));
          await assert.rejects(workerPool.query("select * from auth.users"));
          await assert.rejects(apiPool.query("select * from auth.sessions"));
          await assert.rejects(
            admin.query("set role anon; select * from tenancy.organizations"),
          );
          await admin.query("reset role");
        },
      );
      await t.test(
        "unverified and missing/forged sessions cannot authorize",
        async () => {
          const email = `synthetic-unverified-${run}@example.test`;
          await identity.signup(email, password);
          await assert.rejects(identity.login(email, password));
          assert.equal((await call("GET", "/organizations")).statusCode, 401);
          assert.equal(
            (
              await call(
                "GET",
                "/organizations",
                ownerA.accessToken + "tampered",
              )
            ).statusCode,
            401,
          );
          await assert.rejects(
            apiDb.asUser(
              { ...ownerA.claims, session_id: randomUUID() },
              async () => true,
            ),
          );
        },
      );
      await t.test(
        "email verification and recovery use real local Auth state and intercepted email",
        async () => {
          const email = `synthetic-unverified-${run}@example.test`;
          const confirmation = (
            await admin.query(
              "select confirmation_token from auth.users where email=$1",
              [email],
            )
          ).rows[0]?.confirmation_token;
          assert.ok(
            typeof confirmation === "string" && confirmation.length > 16,
          );
          const verified = await identity.verifyEmail(confirmation, "email");
          assert.ok(await identity.verify(verified.accessToken));
          const mail = await fetch(
            `${config.MAILPIT_URL}/api/v1/search?query=${encodeURIComponent("to:" + email)}`,
          ).then((r) => r.json());
          assert.ok(mail.messages?.length > 0);
          await identity.recover(email);
          let recovery = "";
          for (let i = 0; i < 30 && !recovery; i++) {
            recovery =
              (
                await admin.query(
                  "select recovery_token from auth.users where email=$1",
                  [email],
                )
              ).rows[0]?.recovery_token ?? "";
            if (!recovery) await new Promise((r) => setTimeout(r, 200));
          }
          assert.ok(recovery.length > 16);
          const recovered = await identity.verifyEmail(recovery, "recovery");
          const nextPassword =
            "New-synthetic-" + randomBytes(12).toString("hex");
          await identity.password(
            recovered.accessToken,
            recovered.refreshToken,
            nextPassword,
          );
          await assert.rejects(identity.login(email, password));
          assert.ok(await identity.login(email, nextPassword));
          assert.equal(
            (await call("GET", "/organizations", verified.accessToken))
              .statusCode,
            401,
          );
          const generic = await identity.recover(
            `synthetic-missing-${run}@example.test`,
          );
          assert.equal(
            generic.message,
            "If the account exists, a recovery email will arrive.",
          );
        },
      );
      await t.test(
        "one-use invitations bind to verified email; roles stay current",
        async () => {
          for (const [member, role] of [
            [agent, "agent"],
            [viewer, "viewer"],
            [manager, "admin"],
          ] as const) {
            const invitation = await tenancy.invite(
              ownerA.claims,
              orgA,
              member.email,
              role,
            );
            await assert.rejects(
              tenancy.accept(ownerB.claims, invitation.token),
            );
            await tenancy.accept(member.claims, invitation.token);
            await assert.rejects(
              tenancy.accept(member.claims, invitation.token),
            );
          }
          assert.equal((await tenancy.list(agent.claims))[0]?.role, "agent");
          await authAdmin.auth.admin.updateUserById(agent.id, {
            user_metadata: { organization_id: orgB, role: "owner" },
          });
          const forgedMetadata = await identity.login(agent.email, password);
          assert.equal(
            (
              await call(
                "GET",
                `/organizations/${orgB}/members`,
                forgedMetadata.accessToken,
              )
            ).statusCode,
            403,
          );
          await assert.rejects(
            tenancy.invite(viewer.claims, orgA, ownerB.email, "agent"),
          );
          await assert.rejects(
            tenancy.invite(manager.claims, orgA, ownerB.email, "admin"),
          );
          await assert.rejects(
            tenancy.change(manager.claims, orgA, ownerA.id, "viewer", true),
          );
          const expired = await tenancy.invite(
            ownerA.claims,
            orgA,
            ownerB.email,
            "viewer",
          );
          await admin.query(
            "update tenancy.invitations set expires_at=now()-interval '1 second' where token_hash=$1",
            [createHash("sha256").update(expired.token).digest("hex")],
          );
          await assert.rejects(tenancy.accept(ownerB.claims, expired.token));
        },
      );
      await t.test(
        "HTTP refresh, password and logout accept provider tokens and invalidate sessions",
        async () => {
          const account = await user("http-session");
          const refreshed = await call("POST", "/auth/refresh", undefined, {
            refreshToken: account.refreshToken,
          });
          assert.equal(refreshed.statusCode, 200);
          const session = refreshed.json();
          const next = "HTTP-synthetic-" + randomBytes(12).toString("hex");
          const changed = await call("POST", "/auth/password", undefined, {
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            password: next,
          });
          assert.equal(changed.statusCode, 200);
          assert.equal(
            (await call("GET", "/organizations", session.accessToken))
              .statusCode,
            401,
          );
          const signedIn = await identity.login(account.email, next);
          const signedOut = await call("POST", "/auth/logout", undefined, {
            accessToken: signedIn.accessToken,
            refreshToken: signedIn.refreshToken,
          });
          assert.equal(signedOut.statusCode, 200);
          assert.equal(
            (await call("GET", "/organizations", signedIn.accessToken))
              .statusCode,
            401,
          );
          const stale = await call("POST", "/auth/password", undefined, {
            accessToken: signedIn.accessToken,
            refreshToken: signedIn.refreshToken,
            password: next + "-blocked",
          });
          assert.equal(stale.statusCode, 401);
        },
      );
      const customerA = randomUUID(),
        customerB = randomUUID(),
        sourceA = randomUUID(),
        sourceB = randomUUID();
      await t.test(
        "API role isolates reads, writes, relational ownership, search and reuse of pooled connections",
        async () => {
          for (const [owner, org, customer, source] of [
            [ownerA, orgA, customerA, sourceA],
            [ownerB, orgB, customerB, sourceB],
          ] as const)
            await apiDb.asUser(owner.claims, async (db) => {
              await db.query(
                "insert into support.customers(id,organization_id,display_name) values($1,$2,$3)",
                [customer, org, "Synthetic customer"],
              );
              await db.query(
                "insert into knowledge.sources(id,organization_id,title,status) values($1,$2,$3,$4)",
                [source, org, "Synthetic policy", "ready"],
              );
              await db.query(
                "insert into knowledge.chunks(organization_id,source_id,content,embedding) values($1,$2,'synthetic shipping policy','[1,0,0]')",
                [org, source],
              );
            });
          await apiDb.asUser(ownerA.claims, async (db) => {
            assert.deepEqual(
              (
                await db.query("select organization_id from support.customers")
              ).rows.map((r) => r.organization_id),
              [orgA],
            );
            assert.equal(
              (
                await db.query(
                  "select * from support.customers where organization_id=$1",
                  [orgB],
                )
              ).rowCount,
              0,
            );
            assert.equal(
              (
                await db.query(
                  "update support.customers set display_name=$1 where organization_id=$2",
                  ["changed", orgB],
                )
              ).rowCount,
              0,
            );
            assert.equal(
              (
                await db.query(
                  "select * from knowledge.chunks where search_document @@ plainto_tsquery('english','shipping')",
                )
              ).rowCount,
              1,
            );
            assert.equal(
              (
                await db.query(
                  "select organization_id from knowledge.chunks order by embedding OPERATOR(extensions.<->) '[1,0,0]'::extensions.vector",
                )
              ).rows[0]?.organization_id,
              orgA,
            );
          });
          await assert.rejects(
            apiDb.asUser(ownerA.claims, (db) =>
              db.query(
                "insert into support.customers(organization_id,display_name) values($1,$2)",
                [orgB, "cross-tenant"],
              ),
            ),
          );
          await assert.rejects(
            apiDb.asUser(ownerA.claims, (db) =>
              db.query(
                "insert into support.conversations(organization_id,customer_id) values($1,$2)",
                [orgA, customerB],
              ),
            ),
          );
          await assert.rejects(
            apiDb.asUser(viewer.claims, (db) =>
              db.query(
                "insert into support.customers(organization_id,display_name) values($1,$2)",
                [orgA, "viewer write"],
              ),
            ),
          );
          assert.equal(
            (
              await apiDb.asUser(ownerB.claims, (db) =>
                db.query("select * from support.customers"),
              )
            ).rows[0]?.organization_id,
            orgB,
          );
          assert.equal(
            (await apiPool.query("select * from support.customers")).rowCount,
            0,
          );
          assert.equal(
            (
              await call(
                "GET",
                `/organizations/${orgB}/members`,
                ownerA.accessToken,
              )
            ).statusCode,
            403,
          );
          assert.equal(
            (
              await call("POST", "/organizations", ownerA.accessToken, {
                name: "Forged",
                organization_id: orgB,
              })
            ).statusCode,
            400,
          );
        },
      );
      await t.test(
        "worker can only read the tenant bound to a current opaque job lease",
        async () => {
          assert.equal(
            (await workerPool.query("select * from support.customers"))
              .rowCount,
            0,
          );
          await assert.rejects(workerDb.asJob(randomUUID(), async () => true));
          for (const [owner, org] of [
            [ownerA, orgA],
            [ownerB, orgB],
          ] as const)
            await apiDb.asUser(owner.claims, (db) =>
              db.query(
                "insert into jobs.tasks(organization_id,kind,deduplication_key) values($1,'knowledge.ingest',$2)",
                [org, run],
              ),
            );
          const claimed = await Promise.all([
            workerPool.query("select * from private.claim_job()"),
            workerPool.query("select * from private.claim_job()"),
          ]);
          assert.equal(new Set(claimed.map((x) => x.rows[0]?.id)).size, 2);
          for (const result of claimed) {
            const job = result.rows[0];
            await workerDb.asJob(job.lease_token, async (db) => {
              const rows = (await db.query("select * from support.customers"))
                .rows;
              assert.equal(rows.length, 1);
              assert.equal(rows[0]?.organization_id, job.organization_id);
              const other = job.organization_id === orgA ? orgB : orgA;
              assert.equal(
                (
                  await db.query(
                    "select * from knowledge.chunks where organization_id=$1",
                    [other],
                  )
                ).rowCount,
                0,
              );
            });
            assert.equal(
              (
                await workerPool.query(
                  "select private.complete_job($1) as done",
                  [job.lease_token],
                )
              ).rows[0]?.done,
              true,
            );
            await assert.rejects(
              workerDb.asJob(job.lease_token, async () => true),
            );
          }
          assert.equal(
            (await workerPool.query("select * from support.customers"))
              .rowCount,
            0,
          );
          await assert.rejects(
            workerPool.query("select * from integrations.connections"),
          );
        },
      );
      await t.test(
        "private object storage denies cross-tenant uploads, downloads, listings and anonymous access",
        async () => {
          const client = (token: string) =>
            createClient(config.API_URL, config.PUBLISHABLE_KEY, {
              global: { headers: { Authorization: `Bearer ${token}` } },
              auth: { persistSession: false },
            });
          const a = client(ownerA.accessToken),
            b = client(ownerB.accessToken),
            v = client(viewer.accessToken);
          const filename = `${orgA}/${run}.txt`;
          assert.equal(
            (
              await a.storage
                .from("knowledge")
                .upload(filename, "Synthetic policy", {
                  contentType: "text/plain",
                })
            ).error,
            null,
          );
          assert.ok(
            (await b.storage.from("knowledge").download(filename)).error,
          );
          assert.ok(
            (
              await b.storage
                .from("knowledge")
                .upload(`${orgA}/bad.txt`, "blocked", {
                  contentType: "text/plain",
                })
            ).error,
          );
          assert.ok(
            (
              await v.storage
                .from("knowledge")
                .upload(`${orgA}/viewer.txt`, "blocked", {
                  contentType: "text/plain",
                })
            ).error,
          );
          const list = await b.storage.from("knowledge").list(orgA);
          assert.equal(list.data?.length, 0);
          assert.equal(
            (await a.storage.from("knowledge").download(filename)).error,
            null,
          );
          assert.notEqual(
            (
              await fetch(
                `${config.API_URL}/storage/v1/object/public/knowledge/${filename}`,
              )
            ).status,
            200,
          );
          await a.storage.from("knowledge").remove([filename]);
        },
      );
      await t.test(
        "credential envelopes isolate tenants, reject tampering and rotate keys under role checks",
        async () => {
          const old = randomBytes(32).toString("base64"),
            next = randomBytes(32).toString("base64");
          const cipher = new CredentialCipher("old", { old });
          const rotating = new CredentialCipher("next", { old, next });
          const secrets = new CredentialRepository(apiDb, cipher),
            rotator = new CredentialRepository(apiDb, rotating);
          const plaintext =
            "synthetic-provider-" + randomBytes(10).toString("hex");
          const id = await secrets.store(
            ownerA.claims,
            orgA,
            "synthetic",
            plaintext,
          );
          const row = (
            await admin.query(
              "select credential_envelope from integrations.connections where organization_id=$1 and id=$2",
              [orgA, id],
            )
          ).rows[0];
          assert.ok(!JSON.stringify(row).includes(plaintext));
          const context = {
            organizationId: orgA,
            connectionId: id,
            provider: "synthetic",
          };
          assert.equal(
            cipher.decrypt(row.credential_envelope, context),
            plaintext,
          );
          assert.throws(() =>
            cipher.decrypt(row.credential_envelope, {
              ...context,
              organizationId: orgB,
            }),
          );
          assert.throws(() =>
            cipher.decrypt(
              {
                ...row.credential_envelope,
                tag: randomBytes(16).toString("base64"),
              },
              context,
            ),
          );
          await assert.rejects(
            secrets.store(agent.claims, orgA, "agent", plaintext),
          );
          await assert.rejects(
            secrets.store(ownerB.claims, orgA, "cross", plaintext),
          );
          assert.equal(
            (await rotator.rotate(ownerA.claims, orgA, id)).keyId,
            "next",
          );
          const envelope = (
            await admin.query(
              "select credential_envelope from integrations.connections where organization_id=$1 and id=$2",
              [orgA, id],
            )
          ).rows[0]?.credential_envelope;
          assert.equal(
            new CredentialCipher("next", { next }).decrypt(envelope, context),
            plaintext,
          );
          assert.throws(() => cipher.decrypt(envelope, context));
        },
      );
      await t.test(
        "revocation, stale sensitive sessions and sign-out take effect before token expiry",
        async () => {
          await tenancy.change(ownerA.claims, orgA, agent.id, "agent", true);
          assert.equal((await tenancy.list(agent.claims)).length, 0);
          assert.equal(
            (
              await call(
                "GET",
                `/organizations/${orgA}/members`,
                agent.accessToken,
              )
            ).statusCode,
            403,
          );
          await admin.query(
            "update auth.sessions set created_at=now()-interval '16 minutes' where id=$1",
            [ownerA.claims.session_id],
          );
          await assert.rejects(
            tenancy.invite(ownerA.claims, orgA, ownerB.email, "viewer"),
          );
          assert.equal(
            (
              await call("POST", "/auth/password", undefined, {
                accessToken: ownerA.accessToken,
                refreshToken: ownerA.refreshToken,
                password: password + "-blocked",
              })
            ).statusCode,
            403,
          );
          const fresh = await identity.login(ownerA.email, password);
          const freshClaims = await identity.verify(fresh.accessToken);
          assert.ok(
            await tenancy.invite(freshClaims, orgA, ownerB.email, "viewer"),
          );
          await identity.logout(fresh.accessToken, fresh.refreshToken);
          assert.equal(
            (await call("GET", "/organizations", fresh.accessToken)).statusCode,
            401,
          );
        },
      );
    } finally {
      await app.close();
      await apiDb.close();
      await workerDb.close();
      await admin.end();
      // Synthetic records remain in the isolated local stack for debugging; replay
      // verification uses a separately disposable DB. Nothing touches hosted data.
    }
  },
);
