-- HeroSplit — security hardening
-- Apply AFTER supabase/schema.sql. Safe to re-run. Deletes no rows.
-- Run in Supabase Dashboard → SQL Editor (staging project first), then production.
--
-- What this changes:
--   * RLS enabled on every public table (including any legacy/unknown table).
--   * anon (logged-out) loses all table access; authenticated gets explicit,
--     column-level grants instead of Supabase's default ALL.
--   * Ownership (user_id) is always set from the JWT, never from the request.
--   * Profile stats (XP, streaks, totals) are computed by the database,
--     not written by the browser.
--   * Pro workout programs are only returned to Pro subscribers.
--   * Input limits + per-user abuse limits on every client-writable table.
--   * Policies removed (listed here per guardrail): workout_logs_update_own,
--     achievements_insert_own, achievements_update_own. The app never uses
--     them; they only allowed users to rewrite XP history / self-award badges.

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Private schema for internal helpers (not exposed through the API)
-- ─────────────────────────────────────────────────────────────────────────────
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. RLS on EVERY table in public, and no default grants for API roles
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare t record;
begin
  for t in
    select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
  loop
    execute format('alter table public.%I enable row level security', t.relname);
  end loop;
end $$;

revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

-- New tables/functions created later are NOT exposed until explicitly granted.
alter default privileges for role postgres in schema public revoke all on tables    from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Helpers
-- ─────────────────────────────────────────────────────────────────────────────

-- Forces user_id to the caller's JWT subject on insert, and freezes it on update.
-- SECURITY INVOKER: needs no extra privileges.
create or replace function private.force_owner()
returns trigger language plpgsql set search_path = '' as $$
begin
  if auth.uid() is not null then
    new.user_id := auth.uid()::text;
  elsif current_user in ('anon', 'authenticated') then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if tg_op = 'UPDATE' then
    new.user_id := old.user_id;
  end if;
  return new;
end $$;

create or replace function public.update_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. WORKOUTS — catalog is readable by signed-in users; program content is not
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.workouts
  add column if not exists est_duration text
    generated always as (program ->> 'duration') stored,
  add column if not exists exercise_count integer
    generated always as (
      case when jsonb_typeof(program -> 'exercises') = 'array'
           then jsonb_array_length(program -> 'exercises') else 0 end
    ) stored;

drop policy if exists "workouts_public_read" on public.workouts;
drop policy if exists "workouts_read_signed_in" on public.workouts;
create policy "workouts_read_signed_in" on public.workouts
  for select to authenticated using (true);

-- Every column EXCEPT program (the paid content).
grant select (id, slug, name, description, type, difficulty, image_url,
              avatar_emoji, equipment, series, workout_style, is_pro,
              created_at, est_duration, exercise_count)
  on public.workouts to authenticated;

-- SECURITY DEFINER, deliberately: authenticated has no SELECT on
-- workouts.program, so this function is the only way to read it. It checks
-- auth.uid() itself and returns program only for free workouts or for callers
-- whose user_subscriptions row (written only by the Stripe webhook) is Pro.
create or replace function public.get_workout(p_slug text)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  w   public.workouts%rowtype;
  pro boolean;
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if p_slug is null or length(p_slug) > 120 then
    return null;
  end if;

  select * into w from public.workouts where slug = p_slug;
  if not found then
    return null;
  end if;

  select coalesce(bool_or(s.is_pro), false) into pro
  from public.user_subscriptions s where s.user_id = auth.uid()::text;

  return (to_jsonb(w) - 'program')
         || jsonb_build_object(
              'program', case when not w.is_pro or pro then w.program else null end,
              'locked',  w.is_pro and not pro);
end $$;

revoke execute on function public.get_workout(text) from public, anon;
grant  execute on function public.get_workout(text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. WORKOUT LOGS — own rows only; validated; no edits after the fact
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.workout_logs
  alter column user_id      set default (auth.uid())::text,
  alter column completed_at set default ((extract(epoch from now()) * 1000)::bigint);

drop policy if exists "workout_logs_update_own" on public.workout_logs;
drop policy if exists "workout_logs_select_own" on public.workout_logs;
drop policy if exists "workout_logs_insert_own" on public.workout_logs;
drop policy if exists "workout_logs_delete_own" on public.workout_logs;
create policy "workout_logs_select_own" on public.workout_logs
  for select to authenticated using ((select auth.uid())::text = user_id);
create policy "workout_logs_insert_own" on public.workout_logs
  for insert to authenticated with check ((select auth.uid())::text = user_id);
create policy "workout_logs_delete_own" on public.workout_logs
  for delete to authenticated using ((select auth.uid())::text = user_id);

grant select, delete on public.workout_logs to authenticated;
grant insert (workout_id, workout_name, date, duration, xp_earned, sets_data)
  on public.workout_logs to authenticated;

-- Projects created by the old Drizzle schema use a serial id here; inserting
-- needs USAGE on that one sequence (no-op where the id is a uuid).
do $$
declare seq text := pg_get_serial_sequence('public.workout_logs', 'id');
begin
  if seq is not null then
    execute format('grant usage on sequence %s to authenticated', seq);
  end if;
end $$;

alter table public.workout_logs
  drop constraint if exists workout_logs_name_len,
  drop constraint if exists workout_logs_duration_range,
  drop constraint if exists workout_logs_xp_range,
  drop constraint if exists workout_logs_date_format,
  drop constraint if exists workout_logs_sets_size;
alter table public.workout_logs
  add constraint workout_logs_name_len       check (char_length(workout_name) between 1 and 200) not valid,
  add constraint workout_logs_duration_range check (duration between 0 and 600) not valid,
  add constraint workout_logs_xp_range       check (xp_earned is null or xp_earned between 0 and 5000) not valid,
  add constraint workout_logs_date_format    check (date ~ '^\d{4}-\d{2}-\d{2}$') not valid,
  add constraint workout_logs_sets_size      check (sets_data is null or pg_column_size(sets_data) <= 32768) not valid;

-- Date sanity + abuse cap (max 30 logs per user per day). SECURITY INVOKER:
-- the count only sees the caller's own rows through RLS.
create or replace function private.validate_workout_log()
returns trigger language plpgsql set search_path = '' as $$
declare recent integer;
begin
  if new.date::date not between current_date - 3650 and current_date + 1 then
    raise exception 'invalid workout date' using errcode = '22023';
  end if;
  new.completed_at := (extract(epoch from now()) * 1000)::bigint;
  select count(*) into recent from public.workout_logs
   where user_id = new.user_id and created_at > now() - interval '1 day';
  if recent >= 30 then
    raise exception 'rate limit exceeded' using errcode = 'P0429';
  end if;
  return new;
end $$;

drop trigger if exists workout_logs_force_owner on public.workout_logs;
drop trigger if exists workout_logs_validate    on public.workout_logs;
create trigger workout_logs_force_owner before insert or update on public.workout_logs
  for each row execute function private.force_owner();
create trigger workout_logs_validate before insert on public.workout_logs
  for each row execute function private.validate_workout_log();

-- Profile stats are derived from logs by the database.
-- SECURITY DEFINER, deliberately: authenticated has no UPDATE on the stats
-- columns, so the browser cannot set its own XP/streaks. The function only
-- touches the profile of the user who owns the inserted/deleted log row, and
-- that row already passed RLS (user_id = auth.uid()).
create or replace function private.refresh_profile_stats()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  uid       text := coalesce(new.user_id, old.user_id);
  v_total   integer;
  v_xp      integer;
  v_longest integer;
  v_current integer;
begin
  select count(*), coalesce(sum(xp_earned), 0) into v_total, v_xp
  from public.workout_logs where user_id = uid;

  with d as (
    select distinct date::date as day from public.workout_logs
    where user_id = uid and date ~ '^\d{4}-\d{2}-\d{2}$'
  ), g as (
    select day, day - (row_number() over (order by day))::integer as grp from d
  ), runs as (
    select count(*)::integer as len, max(day) as last_day from g group by grp
  )
  select coalesce(max(len), 0),
         coalesce(max(len) filter (where last_day >= current_date - 1), 0)
    into v_longest, v_current
  from runs;

  update public.user_profiles
     set total_workouts = v_total,
         total_xp       = v_xp,
         current_streak = v_current,
         longest_streak = v_longest
   where user_id = uid;
  return null;
end $$;
revoke execute on function private.refresh_profile_stats() from public;

drop trigger if exists workout_logs_refresh_stats on public.workout_logs;
create trigger workout_logs_refresh_stats after insert or delete on public.workout_logs
  for each row execute function private.refresh_profile_stats();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ACHIEVEMENTS — read own; no client writes (the app never writes them)
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "achievements_insert_own" on public.achievements;
drop policy if exists "achievements_update_own" on public.achievements;
drop policy if exists "achievements_select_own" on public.achievements;
create policy "achievements_select_own" on public.achievements
  for select to authenticated using ((select auth.uid())::text = user_id);
grant select on public.achievements to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. FEEDBACK — insert + read own; validated; max 5 per hour
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.feedback
  alter column user_id      set default (auth.uid())::text,
  alter column submitted_at set default ((extract(epoch from now()) * 1000)::bigint);

drop policy if exists "feedback_select_own" on public.feedback;
drop policy if exists "feedback_insert_own" on public.feedback;
create policy "feedback_select_own" on public.feedback
  for select to authenticated using ((select auth.uid())::text = user_id);
create policy "feedback_insert_own" on public.feedback
  for insert to authenticated with check ((select auth.uid())::text = user_id);

grant select on public.feedback to authenticated;
grant insert (category, message, path, archetype, experience_level)
  on public.feedback to authenticated;

alter table public.feedback
  drop constraint if exists feedback_category_valid,
  drop constraint if exists feedback_message_len,
  drop constraint if exists feedback_meta_len;
alter table public.feedback
  add constraint feedback_category_valid check (category in ('character', 'fitness', 'general', 'bug')) not valid,
  add constraint feedback_message_len    check (char_length(message) between 1 and 2000) not valid,
  add constraint feedback_meta_len       check (coalesce(char_length(path), 0) <= 20
                                            and coalesce(char_length(archetype), 0) <= 40
                                            and coalesce(char_length(experience_level), 0) <= 20) not valid;

create or replace function private.limit_feedback()
returns trigger language plpgsql set search_path = '' as $$
declare recent integer;
begin
  new.submitted_at := (extract(epoch from now()) * 1000)::bigint;
  select count(*) into recent from public.feedback
   where user_id = new.user_id and created_at > now() - interval '1 hour';
  if recent >= 5 then
    raise exception 'rate limit exceeded' using errcode = 'P0429';
  end if;
  return new;
end $$;

drop trigger if exists feedback_force_owner on public.feedback;
drop trigger if exists feedback_rate_limit  on public.feedback;
create trigger feedback_force_owner before insert or update on public.feedback
  for each row execute function private.force_owner();
create trigger feedback_rate_limit before insert on public.feedback
  for each row execute function private.limit_feedback();

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. USER PROFILES — own row; client may only set onboarding fields
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.user_profiles
  alter column user_id set default (auth.uid())::text;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
drop policy if exists "user_profiles_update_own" on public.user_profiles;
create policy "user_profiles_select_own" on public.user_profiles
  for select to authenticated using ((select auth.uid())::text = user_id);
create policy "user_profiles_insert_own" on public.user_profiles
  for insert to authenticated with check ((select auth.uid())::text = user_id);
create policy "user_profiles_update_own" on public.user_profiles
  for update to authenticated
  using ((select auth.uid())::text = user_id)
  with check ((select auth.uid())::text = user_id);

-- is_pro, stripe_customer_id, XP, streaks and totals are NOT client-writable.
grant select on public.user_profiles to authenticated;
grant insert (path, archetype, alias, experience_level) on public.user_profiles to authenticated;
grant update (path, archetype, alias, experience_level) on public.user_profiles to authenticated;

alter table public.user_profiles
  drop constraint if exists user_profiles_path_valid,
  drop constraint if exists user_profiles_level_valid,
  drop constraint if exists user_profiles_alias_len,
  drop constraint if exists user_profiles_archetype_fmt;
alter table public.user_profiles
  add constraint user_profiles_path_valid     check (path is null or path in ('hero', 'villain')) not valid,
  add constraint user_profiles_level_valid    check (experience_level is null or experience_level in ('beginner', 'intermediate', 'advanced', 'veteran')) not valid,
  add constraint user_profiles_alias_len      check (alias is null or char_length(alias) between 1 and 40) not valid,
  add constraint user_profiles_archetype_fmt  check (archetype is null or archetype ~ '^[a-z0-9-]{1,40}$') not valid;

drop trigger if exists user_profiles_force_owner on public.user_profiles;
create trigger user_profiles_force_owner before insert or update on public.user_profiles
  for each row execute function private.force_owner();

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. USER SUBSCRIPTIONS — read own; only the Stripe webhook (service_role) writes
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "user_subscriptions_select_own" on public.user_subscriptions;
create policy "user_subscriptions_select_own" on public.user_subscriptions
  for select to authenticated using ((select auth.uid())::text = user_id);
grant select on public.user_subscriptions to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Durable rate limiting for Vercel API routes (service_role only)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists private.rate_limits (
  key          text primary key,
  window_start timestamptz not null,
  hits         integer not null
);
grant select, insert, update, delete on private.rate_limits to service_role;

create or replace function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql set search_path = '' as $$
declare v_hits integer;
begin
  insert into private.rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update
    set hits         = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning hits into v_hits;

  if random() < 0.01 then
    delete from private.rate_limits where window_start < now() - interval '1 day';
  end if;
  return v_hits <= p_limit;
end $$;
revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant  execute on function public.hit_rate_limit(text, integer, integer) to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Account deletion (GDPR/CCPA) — called only by /api/delete-account
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.delete_user_data(p_user_id text)
returns void language plpgsql set search_path = '' as $$
begin
  if p_user_id is null or length(p_user_id) = 0 then
    raise exception 'user id required';
  end if;
  delete from public.workout_logs       where user_id = p_user_id;
  delete from public.achievements       where user_id = p_user_id;
  delete from public.feedback           where user_id = p_user_id;
  delete from public.user_subscriptions where user_id = p_user_id;
  delete from public.user_profiles      where user_id = p_user_id;
end $$;
revoke execute on function public.delete_user_data(text) from public, anon, authenticated;
grant  execute on function public.delete_user_data(text) to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. Storage — the app uploads nothing; no bucket may be public
-- ─────────────────────────────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'storage' and table_name = 'buckets') then
    update storage.buckets set public = false where public;
  end if;
end $$;
-- storage.objects has RLS enabled by Supabase; with no policies on it,
-- anon/authenticated can neither list, read, upload nor delete objects.

commit;
