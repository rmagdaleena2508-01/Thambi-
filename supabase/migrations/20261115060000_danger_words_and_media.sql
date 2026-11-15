-- 1. The keyword layer, inside the database.
--    Plain-code matching of Tamil, Tanglish and English danger words in the
--    citizen's description. It sets danger flags and a minimum severity even
--    when the AI is unavailable, and it can't be faked by the client because the
--    database computes it from the description itself.
-- 2. Citizens record their own uploaded media for their own new reports.

create or replace function public.danger_words(p_text text)
returns table (flags text[], severity_floor smallint)
language plpgsql immutable
set search_path = public
as $$
declare
  t text := lower(coalesce(p_text, ''));
  f text[] := '{}';
  floor_value smallint := null;
begin
  -- English and Tanglish use word boundaries; Tamil script uses substrings.
  if t ~ '\m(live wire|current wire|exposed wire|hanging wire|electric wire|electric shock|shock|minsaaram|current kambi)\M'
     or t like '%மின்கம்பி%' or t like '%மின்சார%' then
    f := f || 'live_wire'::text;  floor_value := greatest(coalesce(floor_value, 0), 5);
  end if;
  if t ~ '\m(open manhole|manhole open|manhole)\M' or t like '%பாதாள சாக்கடை மூடி%' then
    f := f || 'open_manhole'::text;  floor_value := greatest(coalesce(floor_value, 0), 4);
  end if;
  if t ~ '\m(accident|accidents|fell|fallen|injured|injury|died|death|vibathu)\M'
     or t like '%விபத்து%' or t like '%விழுந்%' then
    f := f || 'accident_reported'::text;  floor_value := greatest(coalesce(floor_value, 0), 4);
  end if;
  if t ~ '\m(pit|pits|pothole|potholes|crater|hole|dug|digging|pallam|kuzhi|thondi)\M'
     or t like '%பள்ளம்%' or t like '%குழி%' or t like '%தோண்ட%' then
    f := f || 'open_pit'::text;  floor_value := greatest(coalesce(floor_value, 0), 3);
  end if;
  if t ~ '\m(sewage|sewer|drainage overflow|overflowing drain|gutter|saakkadai|sakkadai)\M'
     or t like '%சாக்கடை%' or t like '%கழிவுநீர்%' then
    f := f || 'sewage_overflow'::text;  floor_value := greatest(coalesce(floor_value, 0), 3);
  end if;
  if t ~ '\m(flood|flooded|flooding|waterlogged|waterlogging|water logging|knee deep|stagnant water|thanni thengi)\M'
     or t like '%தேங்கி%' or t like '%வெள்ளம்%' then
    f := f || 'flooding'::text;  floor_value := greatest(coalesce(floor_value, 0), 3);
  end if;
  if t ~ '\m(no barricade|no barricades|unbarricaded|no warning|no sign board|no signboard)\M' then
    f := f || 'no_barricade'::text;
  end if;
  if t ~ '\m(school|schools|children|kids|palli)\M' or t like '%பள்ளி%' or t like '%குழந்தை%' then
    f := f || 'near_school'::text;
  end if;
  if t ~ '\m(hospital|clinic|ambulance|aspathri|maruthuvamanai)\M' or t like '%மருத்துவமனை%' then
    f := f || 'near_hospital'::text;
  end if;

  flags := f;
  severity_floor := nullif(floor_value, 0);
  return next;
end;
$$;

create or replace function public.reports_apply_danger_words()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  found record;
begin
  select * into found from public.danger_words(new.description);
  -- Keep any flags the server already set; add keyword flags.
  new.danger_flags := array(select distinct unnest(coalesce(new.danger_flags, '{}') || found.flags));
  -- The keyword floor only raises a missing or lower text severity.
  if found.severity_floor is not null
     and (new.text_severity is null or new.text_severity < found.severity_floor) then
    new.text_severity := found.severity_floor;
  end if;
  return new;
end;
$$;

-- Trigger names fire in alphabetical order: this one ("reports_a_...") runs
-- before reports_before_write computes the priority.
create trigger reports_a_danger_words
  before insert or update of description on public.reports
  for each row execute function public.reports_apply_danger_words();

revoke execute on function public.reports_apply_danger_words() from public, anon, authenticated;
grant execute on function public.danger_words(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Media rows written by the citizen, for their own report, within an hour of
-- filing it, pointing only into their own private folder, at most 5 per report.
-- Fingerprint and photo GPS/time stay server-only.
-- ---------------------------------------------------------------------------
alter table public.report_media alter column uploader_id set default auth.uid();
grant insert (report_id, kind, path_private) on public.report_media to authenticated;

create policy "citizens record media for their new reports" on public.report_media
  for insert to authenticated
  with check (
    uploader_id = (select auth.uid())
    and kind in ('photo', 'video')
    and path_private like (select auth.uid())::text || '/%'
    and exists (
      select 1 from public.reports r
       where r.id = report_id
         and r.reporter_id = (select auth.uid())
         and r.created_at > now() - interval '1 hour'
    )
    and (select count(*) from public.report_media m where m.report_id = report_media.report_id) < 5
  );
