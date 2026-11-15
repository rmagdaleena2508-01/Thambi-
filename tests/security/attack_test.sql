-- Thambi security attack test.
-- Runs every attack as real database roles (anon / authenticated) with row-level
-- security on, records PASS/FAIL for each, then throws an exception so the whole
-- run is rolled back and leaves no test data behind. The exception message IS
-- the report. Run with the Supabase SQL editor or `execute_sql`.

do $$
declare
  a uuid := gen_random_uuid();   -- citizen A
  b uuid := gen_random_uuid();   -- citizen B
  m uuid := gen_random_uuid();   -- moderator
  rep uuid;
  rep_b uuid;
  n int;
  ok boolean;
  v_priority numeric;
  v_count int;
  e1 public.status_events;
  e2 public.status_events;
  out text := E'\n';
begin
  -- ---------- setup (as postgres) ----------
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
  values (a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@test.invalid', '{"full_name":"Citizen A"}', now() - interval '3 days', now()),
         (b, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@test.invalid', '{"full_name":"Citizen B"}', now() - interval '3 days', now()),
         (m, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'm@test.invalid', '{}', now() - interval '3 days', now());
  update public.profiles set created_at = now() - interval '3 days' where id in (a, b, m);
  update public.profiles set role = 'moderator' where id = m;
  select count(*) into n from public.profiles where id in (a, b, m);
  out := out || case when n = 3 then 'PASS' else 'FAIL' end || '  profiles created on sign-up' || E'\n';
  select display_name = 'Neighbour' into ok from public.profiles where id = m;
  out := out || case when ok then 'PASS' else 'FAIL' end || '  no name -> "Neighbour", email never used' || E'\n';

  -- ---------- citizen A files a report ----------
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  insert into public.reports (category, description, location, citizen_severity, open_since)
  values ('road_damage', 'Deep pit next to the metro pillar, fills with rain water', 'SRID=4326;POINT(80.2101 13.0418)', 4, 'months')
  returning id into rep;
  out := out || 'PASS  citizen can file a report' || E'\n';

  begin
    insert into public.reports (category, description, location, citizen_severity, review_state)
    values ('road_damage', 'Trying to publish my own report without review', 'SRID=4326;POINT(80.21 13.04)', 3, 'ok');
    out := out || 'FAIL  citizen set review_state on insert' || E'\n';
  exception when others then
    out := out || 'PASS  citizen cannot set review_state (' || sqlerrm || ')' || E'\n';
  end;

  begin
    insert into public.reports (category, description, location, citizen_severity, reporter_id)
    values ('road_damage', 'Filing a report in someone else''s name', 'SRID=4326;POINT(80.21 13.04)', 3, b);
    out := out || 'FAIL  citizen filed a report as someone else' || E'\n';
  exception when others then
    out := out || 'PASS  citizen cannot file as someone else' || E'\n';
  end;

  -- server approves it (as postgres, like the service key would)
  execute 'reset role';
  update public.reports set review_state = 'ok', text_severity = 4, title = 'Deep pit by metro pillar' where id = rep;

  -- ---------- anonymous visitor ----------
  execute 'set local role anon';
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  select count(*) into n from public.reports where id = rep;
  out := out || case when n = 1 then 'PASS' else 'FAIL' end || '  anonymous visitor sees approved report' || E'\n';
  begin
    insert into public.supports (report_id) values (rep);
    out := out || 'FAIL  anonymous visitor voted' || E'\n';
  exception when others then
    out := out || 'PASS  anonymous visitor cannot vote' || E'\n';
  end;
  begin
    perform exif_lat from public.report_media limit 1;
    out := out || 'FAIL  anonymous visitor read photo GPS' || E'\n';
  exception when others then
    out := out || 'PASS  photo GPS is hidden from the public' || E'\n';
  end;

  -- ---------- citizen B attacks A's report ----------
  execute 'reset role';
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);

  begin
    update public.reports set status = 'fixed' where id = rep;
    out := out || 'FAIL  citizen changed status directly' || E'\n';
  exception when others then
    out := out || 'PASS  citizen cannot change status directly' || E'\n';
  end;

  update public.reports set description = 'Hacked description text here' where id = rep;
  get diagnostics n = row_count;
  out := out || case when n = 0 then 'PASS' else 'FAIL' end || '  citizen cannot edit someone else''s report' || E'\n';

  begin
    perform public.change_status(rep, 'verified', 'trying');
    out := out || 'FAIL  citizen used change_status' || E'\n';
  exception when others then
    out := out || 'PASS  citizen cannot use change_status' || E'\n';
  end;

  begin
    perform public.apply_status_change(rep, 'verified', 'trying', null, b);
    out := out || 'FAIL  citizen called internal status function' || E'\n';
  exception when others then
    out := out || 'PASS  internal status function is not callable' || E'\n';
  end;

  begin
    update public.reports set priority = 99 where id = rep;
    out := out || 'FAIL  citizen changed priority' || E'\n';
  exception when others then
    out := out || 'PASS  citizen cannot change priority' || E'\n';
  end;

  begin
    perform role from public.profiles limit 1;
    out := out || 'FAIL  citizen read roles' || E'\n';
  exception when others then
    out := out || 'PASS  roles are hidden' || E'\n';
  end;

  begin
    update public.profiles set display_name = 'Hacked' where id = a;
    get diagnostics n = row_count;
    out := out || case when n = 0 then 'PASS' else 'FAIL' end || '  citizen cannot rename someone else' || E'\n';
  end;

  insert into public.supports (report_id, frequency) values (rep, 'daily');
  out := out || 'PASS  citizen can add Me too' || E'\n';
  begin
    insert into public.supports (report_id, frequency) values (rep, 'daily');
    out := out || 'FAIL  citizen voted twice' || E'\n';
  exception when others then
    out := out || 'PASS  one Me too per person' || E'\n';
  end;

  select count(*) into n from public.flags;
  out := out || case when n = 0 then 'PASS' else 'FAIL' end || '  citizen cannot read flags' || E'\n';

  begin
    delete from public.status_events;
    out := out || 'FAIL  citizen deleted history (no error)' || E'\n';
  exception when others then
    out := out || 'PASS  citizen cannot delete history' || E'\n';
  end;

  -- ---------- A tries to support their own report ----------
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  begin
    insert into public.supports (report_id) values (rep);
    out := out || 'FAIL  reporter supported own report' || E'\n';
  exception when others then
    out := out || 'PASS  reporter cannot support own report' || E'\n';
  end;

  update public.reports set description = 'Deep pit next to the metro pillar, about one metre deep' where id = rep;
  get diagnostics n = row_count;
  out := out || case when n = 1 then 'PASS' else 'FAIL' end || '  reporter can edit own report within 15 minutes' || E'\n';

  -- daily limit: A has 1 report; 4 more allowed, the 6th is refused
  begin
    for i in 1..5 loop
      insert into public.reports (category, description, location, citizen_severity)
      values ('garbage', 'Garbage pile number ' || i || ' on the corner', 'SRID=4326;POINT(80.22 13.05)', 2);
    end loop;
    out := out || 'FAIL  daily report limit not enforced' || E'\n';
  exception when others then
    out := out || 'PASS  daily limit of 5 reports enforced' || E'\n';
  end;

  -- ---------- support count and priority ----------
  execute 'reset role';
  select support_count, priority into v_count, v_priority from public.reports where id = rep;
  out := out || case when v_count = 1 then 'PASS' else 'FAIL' end || '  support_count kept in step (' || v_count || ')' || E'\n';
  out := out || case when v_priority > 0 then 'PASS' else 'FAIL' end || '  priority computed (' || v_priority || ')' || E'\n';

  -- ---------- even the server cannot bypass history ----------
  begin
    update public.reports set status = 'fixed' where id = rep;
    out := out || 'FAIL  server changed status without history' || E'\n';
  exception when others then
    out := out || 'PASS  even the server must use change_status' || E'\n';
  end;

  -- ---------- moderator flow ----------
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', m, 'role', 'authenticated')::text, true);
  e1 := public.change_status(rep, 'verified', 'Checked photos and location');
  e2 := public.change_status(rep, 'sent', 'Sent to Chennai Corporation via 1913');
  out := out || 'PASS  moderator can move reported -> verified -> sent' || E'\n';
  out := out || case when e2.prev_hash = e1.hash then 'PASS' else 'FAIL' end || '  history is hash-chained' || E'\n';

  begin
    perform public.change_status(rep, 'fixed', 'Looks fixed');
    out := out || 'FAIL  fixed without after-photo' || E'\n';
  exception when others then
    out := out || 'PASS  fixed needs an after-photo' || E'\n';
  end;

  begin
    perform public.change_status(rep, 'reported', 'go back');
    out := out || 'FAIL  illegal status step allowed' || E'\n';
  exception when others then
    out := out || 'PASS  illegal status steps refused' || E'\n';
  end;

  execute 'reset role';
  begin
    update public.status_events set note = 'rewritten' where report_id = rep;
    out := out || 'FAIL  server rewrote history' || E'\n';
  exception when others then
    out := out || 'PASS  history cannot be rewritten, even by the server' || E'\n';
  end;

  raise exception 'THAMBI SECURITY TEST (rolled back)%', out;
end;
$$;
