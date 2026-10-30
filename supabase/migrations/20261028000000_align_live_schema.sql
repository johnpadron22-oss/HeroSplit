-- HeroSplit — align tables created by the old Drizzle schema with supabase/schema.sql
-- Must run BEFORE 20261029000000_security_hardening.sql. Safe to re-run.
-- Adds missing nullable columns and converts epoch columns to bigint (ms),
-- which is what the app reads and writes. Existing timestamps are preserved
-- (converted), no rows are deleted. On a fresh install from schema.sql every
-- statement here is a no-op.

begin;

alter table public.workouts
  add column if not exists series        text,
  add column if not exists workout_style text;

alter table public.workout_logs
  add column if not exists xp_earned  integer,
  add column if not exists sets_data  jsonb,
  add column if not exists created_at timestamptz;

alter table public.achievements
  add column if not exists created_at timestamptz;

do $$
begin
  if (select data_type from information_schema.columns
      where table_schema = 'public' and table_name = 'workout_logs' and column_name = 'completed_at') <> 'bigint' then
    alter table public.workout_logs alter column completed_at drop default;
    alter table public.workout_logs
      alter column completed_at type bigint using (extract(epoch from completed_at) * 1000)::bigint;
  end if;

  if (select data_type from information_schema.columns
      where table_schema = 'public' and table_name = 'achievements' and column_name = 'unlocked_at') <> 'bigint' then
    alter table public.achievements alter column unlocked_at drop default;
    alter table public.achievements
      alter column unlocked_at type bigint using (extract(epoch from unlocked_at) * 1000)::bigint;
  end if;
end $$;

-- Backfill created_at from the original completion/unlock time so per-day
-- abuse limits don't count historical rows as "today".
update public.workout_logs set created_at = to_timestamp(completed_at / 1000.0)
 where created_at is null and completed_at is not null;
update public.achievements set created_at = to_timestamp(unlocked_at / 1000.0)
 where created_at is null and unlocked_at is not null;

alter table public.workout_logs alter column created_at set default now();
alter table public.achievements alter column created_at set default now();

commit;
