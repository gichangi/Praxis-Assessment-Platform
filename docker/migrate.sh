#!/usr/bin/env sh
# migrate.sh — Apply Supabase migrations that haven't been applied yet.
# Runs as a one-shot container before the rest of the stack becomes live.
# Tracks applied versions in supabase_migrations.schema_migrations (same table
# the Supabase CLI uses, so local dev and production stay in sync).

set -e

DB_URL="${DATABASE_URL:-postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/postgres}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-/migrations}"

echo "Migration runner starting…"
echo "Target: ${DB_URL%%:*}:***@${DB_URL##*@}"

# Wait for PostgreSQL to accept connections
until psql "${DB_URL}" -c '\q' 2>/dev/null; do
  echo "  waiting for database…"
  sleep 2
done
echo "Database is up."

# Create the migration tracking table if it doesn't exist
psql "${DB_URL}" <<'SQL'
CREATE SCHEMA IF NOT EXISTS supabase_migrations;
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version    text  NOT NULL PRIMARY KEY,
  statements text[],
  name       text
);
SQL

# Apply each .sql file in lexicographic order
find "${MIGRATIONS_DIR}" -maxdepth 1 -name '*.sql' | sort | while read -r file; do
  version=$(basename "${file}" .sql)

  already=$(psql "${DB_URL}" -t -A \
    -c "SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '${version}'")

  if [ "${already}" = "1" ]; then
    echo "  skipping  ${version} (already applied)"
  else
    echo "  applying  ${version}…"
    psql "${DB_URL}" -f "${file}"
    psql "${DB_URL}" \
      -c "INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES ('${version}', '${version}')"
    echo "  done      ${version}"
  fi
done

echo "All migrations complete."
