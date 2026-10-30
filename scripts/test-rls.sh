#!/usr/bin/env bash
# Runs the RLS suite against two throwaway local databases:
#   fresh — supabase/schema.sql (a new project)
#   live  — supabase/tests/live_schema_replica.sql (production's actual table shapes)
# Each applies every migration twice (proving re-runnability) before testing.
# Usage: scripts/test-rls.sh   (needs local Postgres; uses `sudo -u postgres` if not already postgres)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "$(id -un)" = "postgres" ]; then PG=(); else PG=(sudo -u postgres); fi
status=0

run_suite() {
  local name=$1 base=$2 db="herosplit_rls_$1"
  local psqlq=("${PG[@]}" psql -X -q -v ON_ERROR_STOP=1 -d "$db")
  "${PG[@]}" dropdb --if-exists "$db" >/dev/null 2>&1
  "${PG[@]}" createdb "$db"
  "${psqlq[@]}" -f supabase/tests/local_supabase_shim.sql
  "${psqlq[@]}" -f "$base"
  for pass in 1 2; do
    for f in supabase/migrations/*.sql; do "${psqlq[@]}" -f "$f" 2>/dev/null; done
  done
  echo "== $name: migrations applied (twice)"
  if ! "${psqlq[@]}" -t -o /dev/null -f supabase/tests/rls_test.sql 2>&1 | sed -E 's/^psql:[^ ]+ //; s/^(NOTICE|WARNING):  //'; then
    status=1
  fi
  "${PG[@]}" dropdb --if-exists "$db" >/dev/null 2>&1
}

run_suite fresh supabase/schema.sql
run_suite live supabase/tests/live_schema_replica.sql
exit $status
