-- The media insert policy counted rows in report_media itself, which Postgres
-- rejects as infinite policy recursion. The count now runs in a private helper
-- (not exposed by the API) that bypasses row-level security for this one number.

create or replace function private.media_count(p_report uuid)
returns int
language sql stable security definer
set search_path = public
as $$
  select count(*)::int from public.report_media where report_id = p_report;
$$;
revoke execute on function private.media_count(uuid) from public;
grant execute on function private.media_count(uuid) to authenticated;

alter policy "citizens record media for their new reports" on public.report_media
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
    and private.media_count(report_id) < 5
  );
