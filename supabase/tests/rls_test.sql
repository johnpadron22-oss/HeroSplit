-- HeroSplit — RLS / privilege tests for anon, user A, user B, a Pro user and service_role.
-- Runs entirely inside a transaction that is ROLLED BACK: no data is kept.
-- Safe on local Postgres (with local_supabase_shim.sql) or a STAGING Supabase
-- project via SQL Editor. Do not run on production.
-- Ends with an error if any assertion fails. Local run:
--   psql -v ON_ERROR_STOP=1 -f supabase/tests/rls_test.sql

begin;

select set_config('test.failures', '0', false);

create function pg_temp.report(ok boolean, label text) returns void language plpgsql as $$
begin
  if ok then
    raise notice 'PASS  %', label;
  else
    raise warning 'FAIL  %', label;
    perform set_config('test.failures', (current_setting('test.failures')::int + 1)::text, false);
  end if;
end $$;

-- Runs p_sql and expects it to fail with SQLSTATE p_code.
create function pg_temp.expect_error(p_sql text, p_code text, p_label text) returns void language plpgsql as $$
begin
  execute p_sql;
  perform pg_temp.report(false, p_label || '  (statement succeeded)');
exception when others then
  perform pg_temp.report(sqlstate = p_code, p_label || '  [' || sqlstate || ' ' || sqlerrm || ']');
end $$;

-- Runs p_sql (must return one value) and compares it as text.
create function pg_temp.expect_eq(p_sql text, p_expected text, p_label text) returns void language plpgsql as $$
declare got text;
begin
  execute p_sql into got;
  perform pg_temp.report(got is not distinct from p_expected,
                         p_label || '  (got ' || coalesce(got, 'NULL') || ')');
exception when others then
  perform pg_temp.report(false, p_label || '  [' || sqlstate || ' ' || sqlerrm || ']');
end $$;

grant execute on function pg_temp.report(boolean, text), pg_temp.expect_error(text, text, text),
                          pg_temp.expect_eq(text, text, text)
  to anon, authenticated, service_role;

-- ── Fixtures (as table owner) ────────────────────────────────────────────────
insert into public.workouts (slug, name, description, type, difficulty, program, is_pro) values
  ('test-free', 'Test Free', 'free', 'hero',    'Beginner', '{"duration": 30, "exercises": [{"name": "Push-up"}]}', false),
  ('test-pro',  'Test Pro',  'pro',  'villain', 'Advanced', '{"duration": 60, "exercises": [{"name": "Secret"}, {"name": "Move"}]}', true);
insert into public.user_subscriptions (user_id, is_pro, stripe_customer_id, plan)
values ('33333333-3333-3333-3333-333333333333', true, 'cus_TESTPRO', 'monthly');

-- ════════════════════════════════════════════════════════════════════════════
-- (a) LOGGED-OUT (anon)
-- ════════════════════════════════════════════════════════════════════════════
select set_config('request.jwt.claims', '{"role":"anon"}', false);
set role anon;

select pg_temp.expect_error($q$select * from public.workouts$q$,          '42501', 'anon cannot list workouts');
select pg_temp.expect_error($q$select * from public.workout_logs$q$,      '42501', 'anon cannot read workout_logs');
select pg_temp.expect_error($q$select * from public.user_profiles$q$,     '42501', 'anon cannot read user_profiles');
select pg_temp.expect_error($q$select * from public.user_subscriptions$q$,'42501', 'anon cannot read user_subscriptions');
select pg_temp.expect_error($q$select * from public.feedback$q$,          '42501', 'anon cannot read feedback');
select pg_temp.expect_error($q$select * from public.achievements$q$,      '42501', 'anon cannot read achievements');
select pg_temp.expect_error($q$insert into public.feedback (category, message) values ('bug', 'x')$q$, '42501', 'anon cannot write feedback');
select pg_temp.expect_error($q$select public.get_workout('test-free')$q$, '42501', 'anon cannot call get_workout');
select pg_temp.expect_error($q$select public.hit_rate_limit('k', 1, 60)$q$,'42501', 'anon cannot call hit_rate_limit');
select pg_temp.expect_error($q$select public.delete_user_data('11111111-1111-1111-1111-111111111111')$q$, '42501', 'anon cannot call delete_user_data');
reset role;

-- Legacy tables (exist only on projects created by the old Drizzle schema)
create function pg_temp.check_legacy(p_role text, p_claims text) returns void language plpgsql as $$
declare t text;
begin
  foreach t in array array['users', 'sessions', 'user_settings'] loop
    if to_regclass('public.' || t) is not null then
      perform set_config('request.jwt.claims', p_claims, true);
      execute format('set local role %I', p_role);
      perform pg_temp.expect_error(format('select * from public.%I', t), '42501', p_role || ' cannot read legacy table ' || t);
      execute 'reset role';
    end if;
  end loop;
end $$;
select pg_temp.check_legacy('anon', '{"role":"anon"}');
select pg_temp.check_legacy('authenticated', '{"sub":"55555555-5555-5555-5555-555555555555","role":"authenticated"}');

-- ════════════════════════════════════════════════════════════════════════════
-- (b) USER A
-- ════════════════════════════════════════════════════════════════════════════
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', false);
set role authenticated;

-- ownership comes from the JWT, not the request
select pg_temp.expect_error($q$insert into public.user_profiles (user_id, alias) values ('22222222-2222-2222-2222-222222222222', 'Spoof')$q$,
                            '42501', 'A cannot choose user_id on profile insert');
insert into public.user_profiles (alias) values ('Alpha');
select pg_temp.expect_eq($q$select user_id from public.user_profiles$q$, '11111111-1111-1111-1111-111111111111', 'A profile owned by A (set from JWT)');

select pg_temp.expect_error($q$insert into public.user_profiles (alias, is_pro) values ('x', true)$q$, '42501', 'A cannot insert is_pro');
select pg_temp.expect_error($q$update public.user_profiles set is_pro = true$q$,                    '42501', 'A cannot self-grant is_pro on profile');
select pg_temp.expect_error($q$update public.user_profiles set total_xp = 999999$q$,                '42501', 'A cannot set own XP');
select pg_temp.expect_error($q$update public.user_profiles set longest_streak = 365$q$,             '42501', 'A cannot set own streak');
select pg_temp.expect_error($q$update public.user_profiles set stripe_customer_id = 'cus_TESTPRO'$q$, '42501', 'A cannot set stripe_customer_id');
select pg_temp.expect_error($q$update public.user_profiles set user_id = '22222222-2222-2222-2222-222222222222'$q$, '42501', 'A cannot reassign profile owner');
select pg_temp.expect_error($q$update public.user_profiles set path = 'wizard'$q$,                  '23514', 'A profile path must be hero/villain');
select pg_temp.expect_eq($q$with u as (update public.user_profiles set alias = 'Alpha2', path = 'hero' returning 1) select count(*) from u$q$, '1', 'A can update own onboarding fields');

select pg_temp.expect_error($q$insert into public.user_subscriptions (user_id, is_pro) values ('11111111-1111-1111-1111-111111111111', true)$q$,
                            '42501', 'A cannot write user_subscriptions (no self-Pro)');

-- workout logs
select pg_temp.expect_error($q$insert into public.workout_logs (user_id, workout_name, date, duration, xp_earned) values ('22222222-2222-2222-2222-222222222222', 'x', to_char(current_date, 'YYYY-MM-DD'), 30, 10)$q$,
                            '42501', 'A cannot insert a log as B');
insert into public.workout_logs (workout_name, date, duration, xp_earned)
values ('Push Day', to_char(current_date, 'YYYY-MM-DD'), 30, 100);
select pg_temp.expect_eq($q$select user_id from public.workout_logs$q$, '11111111-1111-1111-1111-111111111111', 'A log owned by A (set from JWT)');
select pg_temp.expect_eq($q$select total_workouts || '/' || total_xp || '/' || current_streak from public.user_profiles$q$, '1/100/1', 'stats computed by database after log');
select pg_temp.expect_error($q$insert into public.workout_logs (workout_name, date, duration, xp_earned) values ('x', '2026-01-01', 30, 999999)$q$, '23514', 'XP above cap rejected');
select pg_temp.expect_error($q$insert into public.workout_logs (workout_name, date, duration) values ('x', '1999-01-01', 30)$q$, '22023', 'absurd log date rejected');
select pg_temp.expect_error($q$insert into public.workout_logs (workout_name, date, duration) values ('', to_char(current_date, 'YYYY-MM-DD'), 30)$q$, '23514', 'empty workout name rejected');
select pg_temp.expect_error($q$update public.workout_logs set xp_earned = 5000$q$, '42501', 'A cannot edit past logs');

-- paid content
select pg_temp.expect_eq($q$select count(*) from public.workouts where slug like 'test-%'$q$, '2', 'A can list workout catalog');
select pg_temp.expect_error($q$select program from public.workouts$q$, '42501', 'A cannot select workouts.program directly');
select pg_temp.expect_error($q$select * from public.workouts$q$,        '42501', 'A cannot select * (includes program)');
select pg_temp.expect_eq($q$select (public.get_workout('test-free') -> 'program' ->> 'duration')$q$, '30', 'A gets free program via get_workout');
select pg_temp.expect_eq($q$select (public.get_workout('test-pro') ->> 'program')$q$, null, 'non-Pro A gets NO pro program');
select pg_temp.expect_eq($q$select (public.get_workout('test-pro') ->> 'locked')$q$, 'true', 'pro workout reported locked for A');

select pg_temp.expect_error($q$insert into public.achievements (user_id, achievement_id, unlocked_at) values ('11111111-1111-1111-1111-111111111111', 'god', 1)$q$, '42501', 'A cannot self-award achievements');
select pg_temp.expect_error($q$select public.delete_user_data('22222222-2222-2222-2222-222222222222')$q$, '42501', 'A cannot call delete_user_data');
select pg_temp.expect_error($q$select public.hit_rate_limit('k', 1, 60)$q$, '42501', 'A cannot call hit_rate_limit');

-- feedback validation, then abuse limit (5 / hour)
select pg_temp.expect_error($q$insert into public.feedback (category, message) values ('hack', 'x')$q$,        '23514', 'unknown feedback category rejected');
select pg_temp.expect_error($q$insert into public.feedback (category, message, user_id) values ('bug', 'x', '22222222-2222-2222-2222-222222222222')$q$, '42501', 'A cannot file feedback as B');
insert into public.feedback (category, message) select 'general', 'msg ' || g from generate_series(1, 5) g;
select pg_temp.expect_error($q$insert into public.feedback (category, message) values ('general', 'sixth')$q$, 'P0429', 'feedback rate limit triggers on 6th/hour');

select set_config('test.a_log',     (select id::text from public.workout_logs limit 1),  false);
select set_config('test.a_profile', (select id::text from public.user_profiles limit 1), false);
reset role;

-- ════════════════════════════════════════════════════════════════════════════
-- (c) USER B — attacks on A's rows with known/guessed IDs
-- ════════════════════════════════════════════════════════════════════════════
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', false);
set role authenticated;

insert into public.user_profiles (alias) values ('Bravo');
select pg_temp.expect_eq($q$select count(*) from public.workout_logs where id::text = current_setting('test.a_log')$q$, '0', 'B cannot read A log by exact id');
select pg_temp.expect_eq($q$select count(*) from public.workout_logs$q$,  '0', 'B sees no logs of A');
select pg_temp.expect_eq($q$select count(*) from public.user_profiles where id::text = current_setting('test.a_profile')$q$, '0', 'B cannot read A profile by exact id');
select pg_temp.expect_eq($q$select count(*) from public.user_profiles$q$, '1', 'B sees only own profile');
select pg_temp.expect_eq($q$select count(*) from public.feedback$q$,      '0', 'B sees none of A feedback');
select pg_temp.expect_eq($q$with u as (update public.user_profiles set alias = 'pwned' where id::text = current_setting('test.a_profile') returning 1) select count(*) from u$q$, '0', 'B cannot update A profile');
select pg_temp.expect_eq($q$with d as (delete from public.workout_logs where id::text = current_setting('test.a_log') returning 1) select count(*) from d$q$, '0', 'B cannot delete A log');
select pg_temp.expect_eq($q$select count(*) from public.user_subscriptions$q$, '0', 'B cannot read others subscriptions');
reset role;

select pg_temp.expect_eq($q$select alias from public.user_profiles where id::text = current_setting('test.a_profile')$q$, 'Alpha2', 'A profile unchanged after B attack');
select pg_temp.expect_eq($q$select count(*) from public.workout_logs where id::text = current_setting('test.a_log')$q$, '1', 'A log still exists after B attack');

-- ════════════════════════════════════════════════════════════════════════════
-- (d) PRO USER C
-- ════════════════════════════════════════════════════════════════════════════
select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', false);
set role authenticated;
select pg_temp.expect_eq($q$select (public.get_workout('test-pro') -> 'program' -> 'exercises' -> 0 ->> 'name')$q$, 'Secret', 'Pro user C gets pro program');
reset role;

-- ════════════════════════════════════════════════════════════════════════════
-- (e) SERVICE ROLE (Vercel API routes only)
-- ════════════════════════════════════════════════════════════════════════════
select set_config('request.jwt.claims', '{"role":"service_role"}', false);
set role service_role;
select pg_temp.expect_eq($q$select string_agg(public.hit_rate_limit('test:ip', 3, 60)::text, ',') from generate_series(1, 5)$q$,
                         'true,true,true,false,false', 'rate limit allows 3 then returns false (→ 429)');
select public.delete_user_data('11111111-1111-1111-1111-111111111111');
select pg_temp.expect_eq($q$select (select count(*) from public.workout_logs where user_id = '11111111-1111-1111-1111-111111111111')
                              + (select count(*) from public.user_profiles where user_id = '11111111-1111-1111-1111-111111111111')
                              + (select count(*) from public.feedback where user_id = '11111111-1111-1111-1111-111111111111')$q$,
                         '0', 'delete_user_data erased all of A data');
select pg_temp.expect_eq($q$select count(*) from public.user_profiles where user_id = '22222222-2222-2222-2222-222222222222'$q$, '1', 'delete_user_data left B intact');
reset role;

-- ── Every public table has RLS on ────────────────────────────────────────────
select pg_temp.expect_eq($q$select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
                            where n.nspname = 'public' and c.relkind in ('r','p') and not c.relrowsecurity$q$,
                         '0', 'every public table has RLS enabled');
select pg_temp.expect_eq($q$select relrowsecurity::text from pg_class where oid = 'private.rate_limits'::regclass$q$,
                         'true', 'private.rate_limits has RLS enabled');

do $$ begin
  if current_setting('test.failures')::int > 0 then
    raise exception '% RLS test(s) FAILED', current_setting('test.failures');
  end if;
  raise notice 'ALL RLS TESTS PASSED';
end $$;

rollback;
