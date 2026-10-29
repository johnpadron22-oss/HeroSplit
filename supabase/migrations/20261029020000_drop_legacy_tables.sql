-- Remove tables left over from the old Replit/Drizzle backend.
-- None is used by the app; `users` held password hashes from the old
-- email/password login (Supabase Auth now owns authentication).
-- Approved for deletion by the project owner on 2026-10-29.
drop table if exists public.users;
drop table if exists public.user_settings;
drop table if exists public.sessions;
