-- HeroSplit — live security discovery (READ-ONLY)
-- Run in Supabase Dashboard → SQL Editor before and after applying migrations.
-- Every query here only reads catalog tables; nothing is changed.

-- 1. Every table in exposed schemas, with RLS status
select n.nspname as schema, c.relname as table_name,
       c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind in ('r', 'p')
  and n.nspname in ('public', 'storage', 'graphql_public')
order by 1, 2;

-- 2. Every RLS policy
select schemaname, tablename, policyname, cmd, roles, permissive,
       qual as using_expr, with_check
from pg_policies
order by schemaname, tablename, policyname;

-- 3. Table / column privileges held by the API roles (anon, authenticated)
select table_schema, table_name, grantee, string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where grantee in ('anon', 'authenticated') and table_schema = 'public'
group by 1, 2, 3 order by 2, 3;

select table_name, column_name, grantee, privilege_type
from information_schema.column_privileges
where grantee in ('anon', 'authenticated') and table_schema = 'public'
order by 1, 3, 4, 2;

-- 4. Functions callable through the API, and whether they are SECURITY DEFINER
select p.proname as function_name, p.prosecdef as security_definer,
       p.proconfig as settings,
       has_function_privilege('anon', p.oid, 'execute') as anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated_can_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by 1;

-- 5. Views in public (a view owned by postgres bypasses RLS unless security_invoker is on)
select c.relname as view_name, c.reloptions
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('v', 'm');

-- 6. Storage buckets and whether they are public
select id, name, public, file_size_limit, allowed_mime_types, created_at
from storage.buckets order by name;

-- 7. Storage object counts per bucket (no file contents are read)
select bucket_id, count(*) as objects from storage.objects group by bucket_id;
