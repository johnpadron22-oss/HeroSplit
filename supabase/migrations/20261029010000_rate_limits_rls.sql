-- Defense in depth: private.rate_limits is not exposed through the API and
-- anon/authenticated have no USAGE on schema private, but RLS is enabled
-- anyway. No policies are needed: only service_role (BYPASSRLS) uses it.
alter table private.rate_limits enable row level security;
