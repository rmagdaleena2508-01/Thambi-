-- Thambi functions and triggers: profiles, rate limits, support counts,
-- priority score, locked status history, duplicate search.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- True when the caller is a moderator, official or admin. Security definer so
-- it can read roles that the public cannot.
create or replace function public.is_moderator()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'official', 'admin')
  );
$$;

-- True when the request is made with the server's service key.
create or replace function public.is_service()
returns boolean
language sql stable
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'role', '') = 'service_role';
$$;

-- ---------------------------------------------------------------------------
-- New users get a profile. The display name comes from the sign-in provider;
-- the email address is never used as a name.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      'Neighbour'
    ), 60)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Daily limits, enforced in the database so they can't be skipped.
-- Usage: trigger argument 1 = owner column, argument 2 = max rows per 24 h.
-- Server (service key) writes are not limited.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_daily_limit()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  owner_column text := tg_argv[0];
  max_rows     int  := tg_argv[1]::int;
  recent       int;
begin
  if auth.uid() is null then
    return new;
  end if;
  execute format(
    'select count(*) from %I.%I where %I = $1 and created_at > now() - interval ''24 hours''',
    tg_table_schema, tg_table_name, owner_column
  ) into recent using auth.uid();
  if recent >= max_rows then
    raise exception 'Daily limit reached. Please try again tomorrow.'
      using errcode = 'P0001', hint = 'thambi_rate_limit';
  end if;
  return new;
end;
$$;

create trigger reports_daily_limit  before insert on public.reports
  for each row execute function public.enforce_daily_limit('reporter_id', '5');
create trigger comments_daily_limit before insert on public.comments
  for each row execute function public.enforce_daily_limit('author_id', '30');
create trigger supports_daily_limit before insert on public.supports
  for each row execute function public.enforce_daily_limit('user_id', '100');
create trigger flags_daily_limit    before insert on public.flags
  for each row execute function public.enforce_daily_limit('created_by', '20');

-- ---------------------------------------------------------------------------
-- Priority score (0–100), explained in docs/Technical Plan section 8.
--   35% text severity (falls back to citizen severity until the AI has read it)
--   20% citizen severity
--   20% community support, log scale, weighted by how often people pass by
--   15% danger flags and nearby schools/hospitals
--   10% age
-- ---------------------------------------------------------------------------
create or replace function public.compute_priority(r public.reports)
returns table (score numeric, reason text)
language plpgsql stable security definer
set search_path = public, extensions
as $$
declare
  sev_text     numeric := coalesce(r.text_severity, r.citizen_severity);
  weighted     numeric;
  near_count   int;
  danger       int;
  base_days    int;
  days_open    numeric;
  part_text    numeric;
  part_citizen numeric;
  part_support numeric;
  part_danger  numeric;
  part_age     numeric;
  reasons      text[] := '{}';
begin
  select coalesce(sum(
           case s.frequency when 'daily' then 1.0 when 'weekly' then 0.6 else 0.3 end
           * case when p.created_at > now() - interval '24 hours' then 0.5 else 1.0 end
         ), 0)
    into weighted
    from public.supports s
    join public.profiles p on p.id = s.user_id
   where s.report_id = r.id;

  select count(*) into near_count
    from public.sensitive_places sp
   where st_dwithin(sp.location, r.location, 150);

  danger := least(3, coalesce(cardinality(r.danger_flags), 0) + least(near_count, 1));

  base_days := case r.open_since when 'weeks' then 10 when 'months' then 60 when 'year+' then 365 else 2 end;
  days_open := base_days + extract(epoch from (now() - r.created_at)) / 86400.0;

  part_text    := 0.35 * (sev_text - 1) / 4.0;
  part_citizen := 0.20 * (r.citizen_severity - 1) / 4.0;
  part_support := 0.20 * least(1.0, log(1 + weighted) / 2.0);
  part_danger  := 0.15 * danger / 3.0;
  part_age     := 0.10 * least(1.0, days_open / 90.0);

  if sev_text >= 4 then reasons := reasons || 'serious danger described'::text; end if;
  if r.support_count >= 5 then reasons := reasons || (r.support_count || ' people affected'); end if;
  if danger > 0 then reasons := reasons || 'safety risk'::text; end if;
  if near_count > 0 then reasons := reasons || 'near a school or hospital'::text; end if;
  if days_open >= 30 then reasons := reasons || ('open about ' || floor(days_open)::int || ' days'); end if;

  score  := round(100 * (part_text + part_citizen + part_support + part_danger + part_age), 2);
  reason := case when cardinality(reasons) = 0 then null else array_to_string(reasons, ', ') end;
  return next;
end;
$$;

create or replace function public.reports_before_write()
returns trigger
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  result record;
begin
  new.updated_at := now();
  select * into result from public.compute_priority(new);
  new.priority := result.score;
  new.priority_reason := result.reason;
  return new;
end;
$$;

create trigger reports_before_write
  before insert or update on public.reports
  for each row execute function public.reports_before_write();

-- Keep support_count in step with the supports table. Touching the report
-- also recomputes its priority through reports_before_write.
create or replace function public.sync_support_count()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.report_id, old.report_id);
begin
  update public.reports
     set support_count = (select count(*) from public.supports where report_id = target),
         last_seen_at  = case when tg_op = 'INSERT' then now() else last_seen_at end
   where id = target;
  return null;
end;
$$;

create trigger supports_sync_count
  after insert or delete on public.supports
  for each row execute function public.sync_support_count();

-- ---------------------------------------------------------------------------
-- Locked status history
-- ---------------------------------------------------------------------------

-- Nobody (not even the server) can edit or delete history.
create or replace function public.status_events_immutable()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'Status history cannot be changed or deleted.';
end;
$$;

create trigger status_events_no_update before update or delete on public.status_events
  for each row execute function public.status_events_immutable();

-- A report's status can only change through apply_status_change, which writes
-- the history row in the same transaction.
create or replace function public.guard_report_status()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status is distinct from old.status
     and coalesce(current_setting('thambi.status_change', true), '') <> 'on' then
    raise exception 'Status can only be changed through change_status().';
  end if;
  return new;
end;
$$;

create trigger reports_guard_status before update of status on public.reports
  for each row execute function public.guard_report_status();

-- Allowed steps in a report's life.
create or replace function public.status_step_allowed(from_status text, to_status text)
returns boolean
language sql immutable
set search_path = public
as $$
  select (from_status, to_status) in (
    ('reported', 'verified'), ('reported', 'rejected'),
    ('verified', 'sent'), ('verified', 'rejected'),
    ('sent', 'acknowledged'), ('sent', 'in_progress'), ('sent', 'fixed'),
    ('acknowledged', 'in_progress'), ('acknowledged', 'fixed'),
    ('in_progress', 'fixed'),
    ('fixed', 'confirmed'), ('fixed', 'reopened'),
    ('confirmed', 'reopened'),
    ('reopened', 'sent'), ('reopened', 'in_progress'), ('reopened', 'fixed'),
    ('rejected', 'verified')
  );
$$;

-- Internal. Not callable by the public; used by change_status and by the
-- automatic reopen rule.
create or replace function public.apply_status_change(
  p_report uuid, p_to text, p_note text, p_proof uuid, p_actor uuid
)
returns public.status_events
language plpgsql security definer
set search_path = public, extensions
as $$
declare
  current_status text;
  last_hash      text;
  event          public.status_events;
  stamp          timestamptz := clock_timestamp();
begin
  select status into current_status from public.reports where id = p_report for update;
  if current_status is null then
    raise exception 'Report not found.';
  end if;
  if not public.status_step_allowed(current_status, p_to) then
    raise exception 'A report cannot move from % to %.', current_status, p_to;
  end if;
  if p_to = 'fixed' and not exists (
    select 1 from public.report_media
     where id = p_proof and report_id = p_report and kind = 'after'
  ) then
    raise exception 'Marking a report fixed needs an after-photo of the same report.';
  end if;
  if (current_status in ('confirmed', 'rejected') or p_to = 'rejected')
     and coalesce(trim(p_note), '') = '' then
    raise exception 'This change needs a note explaining why.';
  end if;

  select hash into last_hash from public.status_events
   where report_id = p_report order by id desc limit 1;

  insert into public.status_events (report_id, from_status, to_status, actor_id, note, proof_media_id, prev_hash, hash, created_at)
  values (
    p_report, current_status, p_to, p_actor, p_note, p_proof, last_hash,
    encode(extensions.digest(
      concat_ws('|', coalesce(last_hash, ''), p_report, current_status, p_to,
                coalesce(p_actor::text, 'system'), coalesce(p_note, ''),
                coalesce(p_proof::text, ''), stamp), 'sha256'), 'hex'),
    stamp
  )
  returning * into event;

  perform set_config('thambi.status_change', 'on', true);
  update public.reports set status = p_to where id = p_report;
  perform set_config('thambi.status_change', 'off', true);

  return event;
end;
$$;

-- Public entry point. Moderators, officials, admins, or the server only.
create or replace function public.change_status(
  p_report uuid, p_to text, p_note text default null, p_proof uuid default null
)
returns public.status_events
language plpgsql security definer
set search_path = public
as $$
begin
  if not (public.is_moderator() or public.is_service()) then
    raise exception 'Only moderators can change a report''s status.';
  end if;
  return public.apply_status_change(p_report, p_to, p_note, p_proof, auth.uid());
end;
$$;

-- Neighbours say "not fixed": three no-votes within 7 days of the fix reopen it.
create or replace function public.check_fixed_confirmations()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  fixed_at  timestamptz;
  no_votes  int;
begin
  select e.created_at into fixed_at
    from public.status_events e
   where e.report_id = new.report_id and e.to_status = 'fixed'
   order by e.id desc limit 1;

  if fixed_at is null or fixed_at < now() - interval '7 days' then
    return null;
  end if;

  select count(*) into no_votes
    from public.fixed_confirmations
   where report_id = new.report_id and is_fixed = false and created_at >= fixed_at;

  if no_votes >= 3 and (select status from public.reports where id = new.report_id) = 'fixed' then
    perform public.apply_status_change(
      new.report_id, 'reopened',
      no_votes || ' neighbours said it is not fixed.', null, null);
  end if;
  return null;
end;
$$;

create trigger fixed_confirmations_check
  after insert on public.fixed_confirmations
  for each row execute function public.check_fixed_confirmations();

-- ---------------------------------------------------------------------------
-- Duplicate search: open reports of the same category nearby, closest in
-- meaning first. Runs as the caller, so row-level security still applies.
-- ---------------------------------------------------------------------------
create or replace function public.similar_reports(
  p_lng double precision,
  p_lat double precision,
  p_category text,
  p_embedding extensions.vector(768),
  p_radius_m int default 250,
  p_min_similarity double precision default 0.75
)
returns table (
  id uuid, title text, distance_m double precision, similarity double precision,
  support_count int, status text, created_at timestamptz
)
language sql stable security invoker
set search_path = public, extensions
as $$
  select r.id,
         r.title,
         st_distance(r.location, st_point(p_lng, p_lat)::geography) as distance_m,
         1 - (r.embedding <=> p_embedding) as similarity,
         r.support_count,
         r.status,
         r.created_at
    from public.reports r
   where r.category = p_category
     and r.review_state = 'ok'
     and r.status not in ('fixed', 'confirmed', 'rejected')
     and r.embedding is not null
     and st_dwithin(r.location, st_point(p_lng, p_lat)::geography, least(p_radius_m, 1000))
     and 1 - (r.embedding <=> p_embedding) >= p_min_similarity
   order by r.embedding <=> p_embedding
   limit 3;
$$;

-- ---------------------------------------------------------------------------
-- Function permissions: internal functions are never callable from outside.
-- ---------------------------------------------------------------------------
revoke execute on function public.apply_status_change(uuid, text, text, uuid, uuid) from public, anon, authenticated;
revoke execute on function public.compute_priority(public.reports) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.enforce_daily_limit() from public, anon, authenticated;
revoke execute on function public.reports_before_write() from public, anon, authenticated;
revoke execute on function public.sync_support_count() from public, anon, authenticated;
revoke execute on function public.check_fixed_confirmations() from public, anon, authenticated;
revoke execute on function public.change_status(uuid, text, text, uuid) from public, anon;
grant  execute on function public.change_status(uuid, text, text, uuid) to authenticated, service_role;
grant  execute on function public.similar_reports(double precision, double precision, text, extensions.vector, int, double precision) to anon, authenticated;
