-- Thambi security: the database is the security boundary.
-- Every table has row-level security. Table privileges are reset and then
-- granted column by column, so the public can only touch what it should.

alter table public.profiles            enable row level security;
alter table public.authorities         enable row level security;
alter table public.routing_rules       enable row level security;
alter table public.wards               enable row level security;
alter table public.sensitive_places    enable row level security;
alter table public.reports             enable row level security;
alter table public.report_media        enable row level security;
alter table public.supports            enable row level security;
alter table public.comments            enable row level security;
alter table public.fixed_confirmations enable row level security;
alter table public.status_events       enable row level security;
alter table public.flags               enable row level security;

-- Start from nothing for the public roles.
revoke all on
  public.profiles, public.authorities, public.routing_rules, public.wards,
  public.sensitive_places, public.reports, public.report_media, public.supports,
  public.comments, public.fixed_confirmations, public.status_events, public.flags
from anon, authenticated;

-- ---------------------------------------------------------------------------
-- profiles: public name only; people edit their own name and locality.
-- role and trust_score are server-only.
-- ---------------------------------------------------------------------------
grant select (id, display_name, locality, created_at) on public.profiles to anon, authenticated;
grant update (display_name, locality) on public.profiles to authenticated;

create policy "profiles are public" on public.profiles
  for select to anon, authenticated using (true);
create policy "people edit their own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Reference data: read-only for everyone.
-- ---------------------------------------------------------------------------
grant select on public.authorities, public.routing_rules, public.wards, public.sensitive_places to anon, authenticated;

create policy "authorities are public"      on public.authorities      for select to anon, authenticated using (true);
create policy "routing rules are public"    on public.routing_rules    for select to anon, authenticated using (true);
create policy "wards are public"            on public.wards            for select to anon, authenticated using (true);
create policy "sensitive places are public" on public.sensitive_places for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- reports
--   read: approved reports for everyone; your own always; moderators all
--   create: signed-in people, as themselves, only the fields a citizen fills in
--   edit: reporter only, title and description only, within 15 minutes
--   status, priority, AI fields, review state: never from the public
-- ---------------------------------------------------------------------------
grant select on public.reports to anon, authenticated;
grant insert (category, title, description, location, road_name, locality, landmark,
              citizen_severity, affected_groups, open_since)
  on public.reports to authenticated;
grant update (title, description) on public.reports to authenticated;

create policy "approved reports are public" on public.reports
  for select to anon, authenticated
  using (review_state = 'ok' or reporter_id = (select auth.uid()) or (select public.is_moderator()));
create policy "people create their own reports" on public.reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));
create policy "reporters edit within 15 minutes" on public.reports
  for update to authenticated
  using (reporter_id = (select auth.uid()) and created_at > now() - interval '15 minutes')
  with check (reporter_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- report_media: written by the server only. The public sees the public copy
-- of approved reports; private path, fingerprint and photo GPS/time stay hidden.
-- ---------------------------------------------------------------------------
grant select (id, report_id, kind, path_public, created_at) on public.report_media to anon, authenticated;

create policy "media of visible reports is public" on public.report_media
  for select to anon, authenticated
  using (exists (
    select 1 from public.reports r
     where r.id = report_id
       and (r.review_state = 'ok' or r.reporter_id = (select auth.uid()) or (select public.is_moderator()))
  ));

-- ---------------------------------------------------------------------------
-- supports ("Me too"): one per person per report (primary key), never on your
-- own report, only on open approved reports. People can take theirs back.
-- ---------------------------------------------------------------------------
grant select on public.supports to anon, authenticated;
grant insert (report_id, frequency) on public.supports to authenticated;
grant delete on public.supports to authenticated;

create policy "supports are public" on public.supports
  for select to anon, authenticated using (true);
create policy "people support others' open reports" on public.supports
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.reports r
       where r.id = report_id
         and r.review_state = 'ok'
         and r.status not in ('fixed', 'confirmed', 'rejected')
         and r.reporter_id is distinct from (select auth.uid())
    )
  );
create policy "people remove their own support" on public.supports
  for delete to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- comments: shown after moderation; authors see their own; no edits.
-- ---------------------------------------------------------------------------
grant select (id, report_id, author_id, body, moderation, created_at) on public.comments to anon, authenticated;
grant insert (report_id, body) on public.comments to authenticated;
grant delete on public.comments to authenticated;

create policy "approved comments are public" on public.comments
  for select to anon, authenticated
  using (moderation = 'ok' or author_id = (select auth.uid()) or (select public.is_moderator()));
create policy "people comment as themselves" on public.comments
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (select 1 from public.reports r where r.id = report_id and r.review_state = 'ok')
  );
create policy "people delete their own comments" on public.comments
  for delete to authenticated using (author_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- fixed_confirmations: "Is it really fixed?" — reporter and supporters only,
-- only while the report is marked fixed.
-- ---------------------------------------------------------------------------
grant select on public.fixed_confirmations to anon, authenticated;
grant insert (report_id, is_fixed) on public.fixed_confirmations to authenticated;

create policy "confirmations are public" on public.fixed_confirmations
  for select to anon, authenticated using (true);
create policy "reporter and supporters confirm fixes" on public.fixed_confirmations
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.reports r where r.id = report_id and r.status = 'fixed')
    and (
      exists (select 1 from public.reports r where r.id = report_id and r.reporter_id = (select auth.uid()))
      or exists (select 1 from public.supports s where s.report_id = fixed_confirmations.report_id and s.user_id = (select auth.uid()))
    )
  );

-- ---------------------------------------------------------------------------
-- status_events: public history of visible reports. Written only by
-- change_status(); update and delete are blocked by trigger for everyone.
-- ---------------------------------------------------------------------------
grant select on public.status_events to anon, authenticated;

create policy "history of visible reports is public" on public.status_events
  for select to anon, authenticated
  using (exists (
    select 1 from public.reports r
     where r.id = report_id
       and (r.review_state = 'ok' or r.reporter_id = (select auth.uid()) or (select public.is_moderator()))
  ));

-- ---------------------------------------------------------------------------
-- flags: anyone signed in can report something; only moderators read them.
-- ---------------------------------------------------------------------------
grant select on public.flags to authenticated;
grant insert (target_type, target_id, reason) on public.flags to authenticated;

create policy "moderators read flags" on public.flags
  for select to authenticated using ((select public.is_moderator()));
create policy "people raise flags as themselves" on public.flags
  for insert to authenticated
  with check (created_by = (select auth.uid()) and source = 'user');

-- ---------------------------------------------------------------------------
-- Live updates for the feed: "Me too" counts and status.
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.reports, public.supports, public.status_events;
