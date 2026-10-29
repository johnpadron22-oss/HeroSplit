-- HeroSplit — Supabase Schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- This creates all tables and RLS policies needed for HeroSplit.
--
-- NOTE: user_id columns are stored as TEXT (not uuid with FK to auth.users)
-- to avoid operator type mismatch errors with auth.uid() on some Supabase
-- project configurations. auth.uid()::text is used in all RLS policies.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. WORKOUTS (seeded data, public read-only)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists workouts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text not null,
  type         text not null,          -- 'hero' | 'villain' | 'anime' | 'custom'
  difficulty   text not null,
  program      jsonb not null,
  image_url    text,
  avatar_emoji text,
  equipment    text,
  series       text,
  workout_style text,
  is_pro       boolean not null default false,
  created_at   timestamptz default now()
);

create index if not exists workouts_type_idx on workouts(type);
create index if not exists workouts_slug_idx on workouts(slug);

-- RLS: anyone can read; nobody (client) can write
alter table workouts enable row level security;

create policy "workouts_public_read"
  on workouts for select using (true);

-- inserts/updates/deletes are blocked for clients; only service role (seed script) can write

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. WORKOUT LOGS (private, users own their rows)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists workout_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null,
  workout_id   uuid references workouts(id),
  workout_name text not null,
  date         text not null,         -- YYYY-MM-DD
  duration     integer not null,      -- minutes
  completed_at bigint not null,       -- epoch ms
  xp_earned    integer,
  sets_data    jsonb,
  created_at   timestamptz default now()
);

create index if not exists workout_logs_user_id_idx on workout_logs(user_id);
create index if not exists workout_logs_date_idx on workout_logs(date);

alter table workout_logs enable row level security;

create policy "workout_logs_select_own"
  on workout_logs for select using (auth.uid()::text = user_id);

create policy "workout_logs_insert_own"
  on workout_logs for insert with check (auth.uid()::text = user_id);

create policy "workout_logs_update_own"
  on workout_logs for update using (auth.uid()::text = user_id);

create policy "workout_logs_delete_own"
  on workout_logs for delete using (auth.uid()::text = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ACHIEVEMENTS (private, users own their rows, no delete)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists achievements (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null,
  achievement_id text not null,
  unlocked_at    bigint not null,
  created_at     timestamptz default now()
);

create index if not exists achievements_user_id_idx on achievements(user_id);

alter table achievements enable row level security;

create policy "achievements_select_own"
  on achievements for select using (auth.uid()::text = user_id);

create policy "achievements_insert_own"
  on achievements for insert with check (auth.uid()::text = user_id);

create policy "achievements_update_own"
  on achievements for update using (auth.uid()::text = user_id);

-- no delete policy — achievements are permanent

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. FEEDBACK (private, insert+read only, no update/delete)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists feedback (
  id               uuid primary key default gen_random_uuid(),
  user_id          text not null,
  category         text not null,
  message          text not null,
  submitted_at     bigint not null,
  path             text,
  archetype        text,
  experience_level text,
  created_at       timestamptz default now()
);

create index if not exists feedback_user_id_idx on feedback(user_id);

alter table feedback enable row level security;

create policy "feedback_select_own"
  on feedback for select using (auth.uid()::text = user_id);

create policy "feedback_insert_own"
  on feedback for insert with check (auth.uid()::text = user_id);

-- no update/delete policies

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. USER PROFILES (private, full client read/write except deletion)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists user_profiles (
  id                 uuid primary key default gen_random_uuid(),
  user_id            text unique not null,
  is_pro             boolean not null default false,   -- display only; NOT used for access gating
  current_streak     integer not null default 0,
  longest_streak     integer not null default 0,
  total_workouts     integer not null default 0,
  total_xp           integer not null default 0,
  stripe_customer_id text,
  path               text,              -- 'hero' | 'villain'
  archetype          text,
  alias              text,
  experience_level   text,              -- 'beginner' | 'intermediate' | 'advanced' | 'veteran'
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create index if not exists user_profiles_user_id_idx on user_profiles(user_id);

alter table user_profiles enable row level security;

create policy "user_profiles_select_own"
  on user_profiles for select using (auth.uid()::text = user_id);

create policy "user_profiles_insert_own"
  on user_profiles for insert with check (auth.uid()::text = user_id);

create policy "user_profiles_update_own"
  on user_profiles for update using (auth.uid()::text = user_id);

-- no delete policy — use account deletion flow instead

-- Auto-update updated_at on any update
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. USER SUBSCRIPTIONS (THE authoritative Pro gate — write-locked to service role)
--
-- Clients can READ their own row but CANNOT create, update, or delete it.
-- Only the Stripe webhook (service role, bypasses RLS) writes here.
-- This is the ONLY source of truth for isPro access gating.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists user_subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            text unique not null,
  is_pro             boolean not null default false,
  stripe_customer_id text,
  plan               text,            -- 'monthly' | 'annual'
  subscribed_at      bigint,          -- epoch ms of most recent activation
  cancelled_at       bigint,          -- epoch ms of cancellation
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create index if not exists user_subscriptions_user_id_idx on user_subscriptions(user_id);
create index if not exists user_subscriptions_stripe_customer_id_idx
  on user_subscriptions(stripe_customer_id);

alter table user_subscriptions enable row level security;

-- Clients can only READ their own row
create policy "user_subscriptions_select_own"
  on user_subscriptions for select using (auth.uid()::text = user_id);

-- NO insert/update/delete policies for client role.
-- The Stripe webhook uses the service role key which bypasses RLS entirely.
-- This prevents any client from self-granting Pro by writing to this table.

create trigger user_subscriptions_updated_at
  before update on user_subscriptions
  for each row execute function update_updated_at();
