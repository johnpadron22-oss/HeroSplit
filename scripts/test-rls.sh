#!/usr/bin/env bash
# Applies schema + security migration to a throwaway local Postgres database
# (twice, to prove the migration is re-runnable) and runs the RLS test suite.
# Usage: scripts/test-rls.sh   (needs local Postgres; uses `sudo -u postgres` if not already postgres)
set -euo pipefail
cd "$(dirname "$0")/.."

DB=herosplit_rls_test
if [ "$(id -un)" = "postgres" ]; then PG=(); else PG=(sudo -u postgres); fi
psqlq() { "${PG[@]}" psql -X -q -v ON_ERROR_STOP=1 -d "$DB" "$@"; }

"${PG[@]}" dropdb --if-exists "$DB" >/dev/null
"${PG[@]}" createdb "$DB"
trap '"${PG[@]}" dropdb --if-exists "$DB" >/dev/null' EXIT

psqlq -f supabase/tests/local_supabase_shim.sql
psqlq -f supabase/schema.sql
for f in supabase/migrations/*.sql; do psqlq -f "$f" 2>/dev/null; done
for f in supabase/migrations/*.sql; do psqlq -f "$f" 2>/dev/null; done
echo "migrations applied (twice)"

psqlq -t -o /dev/null -f supabase/tests/rls_test.sql 2>&1 | sed -E 's/^psql:[^ ]+ //; s/^(NOTICE|WARNING):  //'
