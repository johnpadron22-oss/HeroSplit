-- push_subscriptions: create table (if not exists) + RLS + grants
-- Called only by /api/push-subscribe (service_role via getAdmin()).
-- Clients cannot read, insert, update or delete directly.

begin;

create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);
create index if not exists push_subscriptions_endpoint_idx on public.push_subscriptions(endpoint);

alter table public.push_subscriptions enable row level security;

-- No policies for anon or authenticated: all access goes through the
-- service-role API route (/api/push-subscribe) which calls requireUser()
-- to verify the JWT before inserting or deleting rows. Clients cannot
-- bypass this by hitting the table directly.

-- Explicit column constraints
alter table public.push_subscriptions
  drop constraint if exists push_sub_endpoint_len,
  drop constraint if exists push_sub_p256dh_len,
  drop constraint if exists push_sub_auth_len;
alter table public.push_subscriptions
  add constraint push_sub_endpoint_len check (char_length(endpoint) between 1 and 2048) not valid,
  add constraint push_sub_p256dh_len   check (char_length(p256dh)   between 1 and 256)  not valid,
  add constraint push_sub_auth_len     check (char_length(auth)      between 1 and 64)   not valid;

commit;
