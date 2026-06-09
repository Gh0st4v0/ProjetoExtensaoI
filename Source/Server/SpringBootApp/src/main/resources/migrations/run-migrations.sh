#!/bin/sh
set -euo pipefail

echo "Waiting for Postgres on db:5432..."
until pg_isready -h db -p 5432 -U "$DB_USERNAME"; do
  sleep 1
done

# Apply SQL files in lexicographic order
for f in /migrations/*.sql; do
  [ -f "$f" ] || continue
  echo "Applying $f"
  psql -h db -U "$DB_USERNAME" -d "$DB_NAME" -f "$f"
done

echo "Migrations completed"
