create function private.recent_manager(org uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(private.member_role(org) in ('owner','admin'),false) and exists (
    select 1 from auth.sessions where user_id=private.active_user()
      and id::text=(nullif(current_setting('request.jwt.claims',true),'')::jsonb ->> 'session_id')
      and created_at>now()-interval '15 minutes'
  )
$$;
revoke all on function private.recent_manager(uuid) from public,anon,authenticated,sales_api,sales_worker;
grant execute on function private.recent_manager(uuid) to sales_api;
drop policy member_read on integrations.connections;
grant select,insert,update on integrations.connections to sales_api;
create policy credential_read on integrations.connections for select to sales_api using(private.recent_manager(organization_id));
create policy credential_insert on integrations.connections for insert to sales_api with check(private.recent_manager(organization_id));
create policy credential_update on integrations.connections for update to sales_api using(private.recent_manager(organization_id)) with check(private.recent_manager(organization_id));
