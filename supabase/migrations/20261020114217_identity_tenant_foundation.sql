-- Feature-owned schemas are not exposed through the Data API.
create schema if not exists private;
create schema tenancy;
create schema support;
create schema knowledge;
create schema integrations;
create schema jobs;
create schema audit;
create schema billing;

create role sales_api login nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
create role sales_worker login nosuperuser nocreatedb nocreaterole noinherit nobypassrls;
-- Passwords are provisioned outside migration history, separately per environment.
revoke all on schema private from public;
grant usage on schema private to sales_api, sales_worker, authenticated;

create table tenancy.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  created_at timestamptz not null default now()
);
create table tenancy.memberships (
  organization_id uuid not null references tenancy.organizations(id),
  user_id uuid not null references auth.users(id),
  role text not null check (role in ('owner','admin','agent','viewer')),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index memberships_user on tenancy.memberships(user_id, organization_id) where revoked_at is null;
create table tenancy.invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references tenancy.organizations(id),
  email text not null check (email = lower(trim(email)) and length(email) <= 254),
  role text not null check (role in ('admin','agent','viewer')),
  token_hash text not null unique,
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  invited_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

-- This small definer surface is necessary to avoid recursive membership policies
-- and to inspect Auth sessions without granting application roles Auth table access.
create function private.active_user() returns uuid language sql stable security definer set search_path = '' as $$
  select u.id from auth.users u join auth.sessions s on s.user_id = u.id
  where u.id = auth.uid()
    and s.id::text = (nullif(current_setting('request.jwt.claims',true),'')::jsonb ->> 'session_id')
    and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)
    and (u.banned_until is null or u.banned_until <= now())
    and (s.not_after is null or s.not_after > now())
    and coalesce((nullif(current_setting('request.jwt.claims',true),'')::jsonb ->> 'exp')::bigint,0) > extract(epoch from now())
$$;
create function private.member_role(org uuid) returns text language sql stable security definer set search_path = '' as $$
  select m.role from tenancy.memberships m
  where m.organization_id = org and m.user_id = private.active_user() and m.revoked_at is null
$$;
create function private.recent_session() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from auth.sessions where user_id=private.active_user()
    and id::text=(nullif(current_setting('request.jwt.claims',true),'')::jsonb ->> 'session_id')
    and created_at>now()-interval '15 minutes')
$$;
create function private.require_manager(org uuid) returns void language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(private.member_role(org),'') not in ('owner','admin') then raise exception 'Forbidden' using errcode='42501'; end if;
  if not exists (select 1 from auth.sessions where user_id = private.active_user()
    and id::text = (nullif(current_setting('request.jwt.claims',true),'')::jsonb ->> 'session_id')
    and created_at > now() - interval '15 minutes') then raise exception 'Recent sign-in required' using errcode='42501'; end if;
end $$;

create table support.customers (
  id uuid not null default gen_random_uuid(), organization_id uuid not null references tenancy.organizations(id),
  display_name text not null check (length(display_name) between 1 and 100),
  created_at timestamptz not null default now(), primary key(organization_id,id)
);
create table support.conversations (
  id uuid not null default gen_random_uuid(), organization_id uuid not null references tenancy.organizations(id), customer_id uuid not null,
  state text not null default 'HANDOFF_PENDING' check(state in ('AI_ACTIVE','HANDOFF_PENDING','HUMAN_ACTIVE','RESOLVED')),
  generation bigint not null default 0 check(generation >= 0), created_at timestamptz not null default now(),
  primary key(organization_id,id), foreign key(organization_id,customer_id) references support.customers(organization_id,id)
);
create table support.messages (
  id uuid not null default gen_random_uuid(), organization_id uuid not null references tenancy.organizations(id), conversation_id uuid not null,
  body text not null check(length(body) between 1 and 16000), visibility text not null check(visibility in ('public','internal')),
  sender text not null check(sender in ('customer','staff','assistant')), created_at timestamptz not null default now(),
  primary key(organization_id,id), foreign key(organization_id,conversation_id) references support.conversations(organization_id,id)
);
create extension if not exists vector with schema extensions;
create table knowledge.sources (
  id uuid not null default gen_random_uuid(), organization_id uuid not null references tenancy.organizations(id),
  title text not null, version integer not null default 1 check(version > 0), status text not null default 'queued' check(status in ('queued','ready','failed','deleted')),
  created_at timestamptz not null default now(), primary key(organization_id,id)
);
create table knowledge.chunks (
  id uuid not null default gen_random_uuid(), organization_id uuid not null references tenancy.organizations(id), source_id uuid not null,
  content text not null, embedding extensions.vector, search_document tsvector generated always as (to_tsvector('english',content)) stored,
  primary key(organization_id,id), foreign key(organization_id,source_id) references knowledge.sources(organization_id,id)
);
-- Dimension-specific indexes are added with the chosen versioned model in P04.
create table integrations.connections (
  id uuid not null default gen_random_uuid(), organization_id uuid not null references tenancy.organizations(id),
  provider text not null, credential_envelope jsonb not null,
  created_at timestamptz not null default now(), primary key(organization_id,id), unique(organization_id,provider)
);
create table jobs.tasks (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references tenancy.organizations(id),
  kind text not null check(kind in ('knowledge.ingest','support.reconcile')), payload jsonb not null default '{}',
  deduplication_key text not null, available_at timestamptz not null default now(),
  lease_token uuid, lease_until timestamptz, completed_at timestamptz, attempts integer not null default 0,
  unique(organization_id,deduplication_key)
);
create index tasks_pending on jobs.tasks(available_at) where completed_at is null;
create table audit.events (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references tenancy.organizations(id),
  actor_id uuid, action text not null, created_at timestamptz not null default now()
);
create table billing.subscriptions (
  organization_id uuid primary key references tenancy.organizations(id),
  provider_reference text unique, status text not null default 'inactive' check(status in ('inactive','trial','active','past_due','cancelled'))
);
create table billing.usage (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references tenancy.organizations(id),
  event_key text not null, quantity bigint not null check(quantity >= 0), created_at timestamptz not null default now(),
  unique(organization_id,event_key)
);

create function private.create_organization(org_name text) returns uuid language plpgsql security definer set search_path = '' as $$
declare actor uuid := private.active_user(); org uuid;
begin
  if actor is null then raise exception 'Unauthorized' using errcode='42501'; end if;
  if (select count(*) from tenancy.memberships where user_id=actor and role='owner' and revoked_at is null) >= 10 then raise exception 'Organization limit' using errcode='22023'; end if;
  insert into tenancy.organizations(name) values(trim(org_name)) returning id into org;
  insert into tenancy.memberships(organization_id,user_id,role) values(org,actor,'owner');
  insert into audit.events(organization_id,actor_id,action) values(org,actor,'organization.created');
  return org;
end $$;
create function private.invite_member(org uuid, address text, member_role text, hashed_token text) returns uuid language plpgsql security definer set search_path = '' as $$
declare invite_id uuid;
begin
  perform private.require_manager(org);
  if member_role='admin' and private.member_role(org)<>'owner' then raise exception 'Forbidden' using errcode='42501'; end if;
  insert into tenancy.invitations(organization_id,email,role,token_hash,invited_by)
    values(org,lower(trim(address)),member_role,hashed_token,private.active_user()) returning id into invite_id;
  insert into audit.events(organization_id,actor_id,action) values(org,private.active_user(),'membership.invited');
  return invite_id;
end $$;
create function private.accept_invitation(hashed_token text) returns uuid language plpgsql security definer set search_path = '' as $$
declare invitation tenancy.invitations; actor uuid := private.active_user(); address text;
begin
  if actor is null then raise exception 'Unauthorized' using errcode='42501'; end if;
  select lower(email) into address from auth.users where id=actor;
  select * into invitation from tenancy.invitations where token_hash=hashed_token and email=address and accepted_at is null and expires_at>now() for update;
  if not found then raise exception 'Invalid invitation' using errcode='42501'; end if;
  -- Do not let an invitation downgrade an existing owner or modify existing access.
  if exists(select 1 from tenancy.memberships where organization_id=invitation.organization_id and user_id=actor and revoked_at is null) then raise exception 'Already a member' using errcode='22023'; end if;
  insert into tenancy.memberships(organization_id,user_id,role) values(invitation.organization_id,actor,invitation.role)
    on conflict(organization_id,user_id) do update set role=excluded.role,revoked_at=null;
  update tenancy.invitations set accepted_at=now() where id=invitation.id;
  insert into audit.events(organization_id,actor_id,action) values(invitation.organization_id,actor,'membership.accepted');
  return invitation.organization_id;
end $$;
create function private.change_member(org uuid, target_user uuid, next_role text, revoke_access boolean) returns void language plpgsql security definer set search_path = '' as $$
declare target_role text;
begin
  perform private.require_manager(org);
  perform 1 from tenancy.organizations where id=org for update;
  select role into target_role from tenancy.memberships where organization_id=org and user_id=target_user and revoked_at is null;
  if target_role is null then raise exception 'Not found' using errcode='22023'; end if;
  if target_role='owner' or next_role='owner' or (next_role='admin' and private.member_role(org)<>'owner')
     or (target_role='admin' and private.member_role(org)<>'owner') then raise exception 'Forbidden' using errcode='42501'; end if;
  update tenancy.memberships set role=next_role,revoked_at=case when revoke_access then now() else null end where organization_id=org and user_id=target_user;
  insert into audit.events(organization_id,actor_id,action) values(org,private.active_user(),case when revoke_access then 'membership.revoked' else 'membership.role_changed' end);
end $$;

create function private.worker_organization() returns uuid language sql stable security definer set search_path = '' as $$
  select organization_id from jobs.tasks where lease_token::text = nullif(current_setting('app.job_token',true),'')
    and lease_until>now() and completed_at is null
$$;
create function private.claim_job() returns table(id uuid,organization_id uuid,kind text,payload jsonb,lease_token uuid) language plpgsql security definer set search_path = '' as $$
begin
  return query update jobs.tasks j set lease_token=gen_random_uuid(),lease_until=now()+interval '60 seconds',attempts=j.attempts+1
  where j.id=(select t.id from jobs.tasks t where t.completed_at is null and t.available_at<=now() and (t.lease_until is null or t.lease_until<=now()) and t.attempts<5 order by t.available_at,t.id for update skip locked limit 1)
  returning j.id,j.organization_id,j.kind,j.payload,j.lease_token;
end $$;
create function private.complete_job(token uuid) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update jobs.tasks set completed_at=now() where lease_token=token and lease_until>now() and completed_at is null;
  return found;
end $$;

-- Default deny. API membership mutations are limited to checked functions above.
do $$ declare item record; begin
  for item in select schemaname,tablename from pg_tables where schemaname in ('tenancy','support','knowledge','integrations','jobs','audit','billing') loop
    execute format('alter table %I.%I enable row level security',item.schemaname,item.tablename);
    execute format('alter table %I.%I force row level security',item.schemaname,item.tablename);
    execute format('revoke all on %I.%I from public, anon, authenticated, sales_api, sales_worker',item.schemaname,item.tablename);
    if item.tablename <> 'invitations' then
      execute format('create policy member_read on %I.%I for select to sales_api, authenticated using (private.member_role(%I) is not null)',item.schemaname,item.tablename,case when item.tablename='organizations' then 'id' else 'organization_id' end);
    end if;
  end loop;
end $$;
grant usage on schema tenancy,support,knowledge,audit,billing,integrations,jobs to sales_api, authenticated;
grant select on tenancy.organizations,tenancy.memberships,support.customers,support.conversations,support.messages,knowledge.sources,knowledge.chunks,audit.events,billing.subscriptions,billing.usage to sales_api,authenticated;
grant insert,update on support.customers,support.conversations,support.messages,knowledge.sources,knowledge.chunks to sales_api;
grant insert on jobs.tasks to sales_api;
create policy enqueue on jobs.tasks for insert to sales_api with check(private.member_role(organization_id) in ('owner','admin','agent'));
do $$ declare item record; begin
  for item in select schemaname,tablename from pg_tables where schemaname in ('support','knowledge') loop
    execute format('create policy member_insert on %I.%I for insert to sales_api with check (private.member_role(organization_id) in (''owner'',''admin'',''agent''))',item.schemaname,item.tablename);
    execute format('create policy member_update on %I.%I for update to sales_api using (private.member_role(organization_id) in (''owner'',''admin'',''agent'')) with check (private.member_role(organization_id) in (''owner'',''admin'',''agent''))',item.schemaname,item.tablename);
    execute format('create policy worker_read on %I.%I for select to sales_worker using (organization_id=private.worker_organization())',item.schemaname,item.tablename);
    execute format('grant select on %I.%I to sales_worker',item.schemaname,item.tablename);
  end loop;
end $$;
grant usage on schema support,knowledge to sales_worker;
grant usage on schema extensions to sales_api,sales_worker;

-- Private, tenant-prefixed object paths. No public URLs or anonymous object access.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('knowledge','knowledge',false,5242880,array['text/plain','application/pdf']);
create policy knowledge_object_read on storage.objects for select to authenticated using(bucket_id='knowledge' and private.member_role((storage.foldername(name))[1]::uuid) is not null);
create policy knowledge_object_insert on storage.objects for insert to authenticated with check(bucket_id='knowledge' and private.member_role((storage.foldername(name))[1]::uuid) in ('owner','admin'));
create policy knowledge_object_update on storage.objects for update to authenticated using(bucket_id='knowledge' and private.member_role((storage.foldername(name))[1]::uuid) in ('owner','admin')) with check(bucket_id='knowledge' and private.member_role((storage.foldername(name))[1]::uuid) in ('owner','admin'));
create policy knowledge_object_delete on storage.objects for delete to authenticated using(bucket_id='knowledge' and private.member_role((storage.foldername(name))[1]::uuid) in ('owner','admin'));

-- No implicit PUBLIC execute on any privileged function.
revoke all on all functions in schema private from public,anon,authenticated,sales_api,sales_worker;
grant execute on function private.active_user(), private.member_role(uuid) to authenticated,sales_api;
grant execute on function private.recent_session() to sales_api;
grant execute on function private.create_organization(text),private.invite_member(uuid,text,text,text),private.accept_invitation(text),private.change_member(uuid,uuid,text,boolean) to sales_api;
grant execute on function private.worker_organization(),private.claim_job(),private.complete_job(uuid) to sales_worker;
alter default privileges in schema private revoke execute on functions from public;
