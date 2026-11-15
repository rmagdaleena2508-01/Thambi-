-- Fallback duplicate search when the AI meaning search is unavailable:
-- open, approved reports of the same kind close by, nearest first.
-- Runs as the caller, so row-level security still applies.
create or replace function public.nearby_reports(
  p_lng double precision,
  p_lat double precision,
  p_category text,
  p_radius_m int default 150
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
         null::double precision as similarity,
         r.support_count,
         r.status,
         r.created_at
    from public.reports r
   where r.category = p_category
     and r.review_state = 'ok'
     and r.status not in ('fixed', 'confirmed', 'rejected')
     and st_dwithin(r.location, st_point(p_lng, p_lat)::geography, least(p_radius_m, 500))
   order by distance_m
   limit 3;
$$;
grant execute on function public.nearby_reports(double precision, double precision, text, int) to anon, authenticated;
