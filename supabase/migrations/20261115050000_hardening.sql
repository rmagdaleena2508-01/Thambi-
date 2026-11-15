-- Hardening after the first Supabase advisor run.
--
-- 1. is_moderator() moves to a private schema that the REST API does not
--    expose, so it can't be called as /rest/v1/rpc/is_moderator. Policies still
--    use it.
-- 2. change_status() stays callable by signed-in users on purpose: it is how
--    moderators change status, and it checks the caller's role itself.
-- 3. Indexes for every foreign key.

create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

create or replace function private.is_moderator()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'official', 'admin')
  );
$$;
revoke execute on function private.is_moderator() from public;
grant execute on function private.is_moderator() to anon, authenticated, service_role;

-- Re-point policies to the private helper.
alter policy "approved reports are public" on public.reports
  using (review_state = 'ok' or reporter_id = (select auth.uid()) or (select private.is_moderator()));
alter policy "media of visible reports is public" on public.report_media
  using (exists (
    select 1 from public.reports r
     where r.id = report_id
       and (r.review_state = 'ok' or r.reporter_id = (select auth.uid()) or (select private.is_moderator()))
  ));
alter policy "approved comments are public" on public.comments
  using (moderation = 'ok' or author_id = (select auth.uid()) or (select private.is_moderator()));
alter policy "history of visible reports is public" on public.status_events
  using (exists (
    select 1 from public.reports r
     where r.id = report_id
       and (r.review_state = 'ok' or r.reporter_id = (select auth.uid()) or (select private.is_moderator()))
  ));
alter policy "moderators read flags" on public.flags
  using ((select private.is_moderator()));

create or replace function public.change_status(
  p_report uuid, p_to text, p_note text default null, p_proof uuid default null
)
returns public.status_events
language plpgsql security definer
set search_path = public
as $$
begin
  if not (private.is_moderator() or public.is_service()) then
    raise exception 'Only moderators can change a report''s status.';
  end if;
  return public.apply_status_change(p_report, p_to, p_note, p_proof, auth.uid());
end;
$$;
comment on function public.change_status(uuid, text, text, uuid) is
  'Intentionally callable by signed-in users: only moderators, officials, admins or the server pass the role check inside.';

drop function public.is_moderator();

-- Foreign key indexes.
create index if not exists fixed_confirmations_user_idx on public.fixed_confirmations (user_id);
create index if not exists flags_created_by_idx        on public.flags (created_by);
create index if not exists flags_resolved_by_idx       on public.flags (resolved_by);
create index if not exists report_media_uploader_idx   on public.report_media (uploader_id);
create index if not exists reports_authority_idx       on public.reports (authority_id);
create index if not exists reports_ward_idx            on public.reports (ward_id);
create index if not exists routing_rules_authority_idx on public.routing_rules (authority_id);
create index if not exists status_events_actor_idx     on public.status_events (actor_id);
create index if not exists status_events_proof_idx     on public.status_events (proof_media_id);
