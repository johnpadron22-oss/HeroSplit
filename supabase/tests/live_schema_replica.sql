-- Replica of the production table shapes as of 2026-10-29 (old Drizzle tables
-- mixed with schema.sql tables), so migrations are tested against what is
-- really deployed, not only against a fresh schema.sql install.
-- Test fixture only — never run on a real project.

create table public.sessions (sid varchar primary key, sess json not null, expire timestamp not null);
create table public.users (
  id varchar primary key, email varchar, first_name varchar, last_name varchar,
  profile_image_url varchar, created_at timestamp default now(), updated_at timestamp default now(),
  password_hash varchar
);
create table public.user_settings (
  user_id text primary key, is_pro boolean default false, current_streak integer default 0,
  longest_streak integer default 0, total_workouts integer default 0, xp integer default 0,
  level integer default 1, onboarding_completed boolean default false, assigned_workout_slug text,
  archetype text, training_level text, mission text, total_xp integer not null default 0
);
create table public.workouts (
  id serial primary key, slug text not null unique, name text not null, description text not null,
  type text not null, difficulty text not null, program jsonb not null, image_url text,
  avatar_emoji text, equipment text, is_pro boolean default false, created_at timestamp default now()
);
create table public.workout_logs (
  id serial primary key, user_id text not null, workout_id integer, workout_name text not null,
  date text not null, duration integer not null, completed_at timestamp default now()
);
create table public.achievements (
  id serial primary key, user_id text not null, achievement_id text not null, unlocked_at timestamp default now()
);
create table public.feedback (
  id uuid primary key default gen_random_uuid(), user_id text not null, category text not null,
  message text not null, submitted_at bigint not null, path text, archetype text,
  experience_level text, created_at timestamptz default now()
);
create table public.user_profiles (
  id uuid primary key default gen_random_uuid(), user_id text unique not null,
  is_pro boolean not null default false, current_streak integer not null default 0,
  longest_streak integer not null default 0, total_workouts integer not null default 0,
  total_xp integer not null default 0, stripe_customer_id text, path text, archetype text,
  alias text, experience_level text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table public.user_subscriptions (
  id uuid primary key default gen_random_uuid(), user_id text unique not null,
  is_pro boolean not null default false, stripe_customer_id text, plan text,
  subscribed_at bigint, cancelled_at bigint, created_at timestamptz default now(), updated_at timestamptz default now()
);

create or replace function public.update_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger user_profiles_updated_at before update on public.user_profiles for each row execute function public.update_updated_at();
create trigger user_subscriptions_updated_at before update on public.user_subscriptions for each row execute function public.update_updated_at();

-- RLS + policies as currently deployed (all bound to the public role)
alter table public.sessions enable row level security;
alter table public.users enable row level security;
alter table public.user_settings enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_logs enable row level security;
alter table public.achievements enable row level security;
alter table public.feedback enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_subscriptions enable row level security;

create policy users_select_own on public.users for select using ((auth.uid())::text = (id)::text);
create policy users_update_own on public.users for update using ((auth.uid())::text = (id)::text) with check ((auth.uid())::text = (id)::text);
create policy user_settings_select_own on public.user_settings for select using ((auth.uid())::text = user_id);
create policy user_settings_insert_own on public.user_settings for insert with check ((auth.uid())::text = user_id);
create policy user_settings_update_own on public.user_settings for update using ((auth.uid())::text = user_id) with check ((auth.uid())::text = user_id);
create policy workouts_public_read on public.workouts for select using (true);
create policy workout_logs_select_own on public.workout_logs for select using ((auth.uid())::text = user_id);
create policy workout_logs_insert_own on public.workout_logs for insert with check ((auth.uid())::text = user_id);
create policy workout_logs_update_own on public.workout_logs for update using ((auth.uid())::text = user_id);
create policy workout_logs_delete_own on public.workout_logs for delete using ((auth.uid())::text = user_id);
create policy achievements_select_own on public.achievements for select using ((auth.uid())::text = user_id);
create policy achievements_insert_own on public.achievements for insert with check ((auth.uid())::text = user_id);
create policy achievements_update_own on public.achievements for update using ((auth.uid())::text = user_id);
create policy feedback_select_own on public.feedback for select using ((auth.uid())::text = user_id);
create policy feedback_insert_own on public.feedback for insert with check ((auth.uid())::text = user_id);
create policy user_profiles_select_own on public.user_profiles for select using ((auth.uid())::text = user_id);
create policy user_profiles_insert_own on public.user_profiles for insert with check ((auth.uid())::text = user_id);
create policy user_profiles_update_own on public.user_profiles for update using ((auth.uid())::text = user_id);
create policy user_subscriptions_select_own on public.user_subscriptions for select using ((auth.uid())::text = user_id);

-- legacy rows like production's (fake values)
insert into public.users (id, email, password_hash) values ('legacy-1', 'old@example.com', 'x'), ('legacy-2', 'old2@example.com', null);
insert into public.user_settings (user_id) values ('legacy-1');
