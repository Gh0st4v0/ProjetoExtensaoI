#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(pwd)"
BACKEND_DIR="$ROOT_DIR/Source/Server/SpringBootApp"

if [ ! -d "$BACKEND_DIR" ]; then
  echo "Backend directory not found: $BACKEND_DIR" >&2
  exit 1
fi

if ! command -v mvn >/dev/null 2>&1; then
  echo "mvn not found in PATH. Install Maven or ensure mvn is available in the environment." >&2
  exit 2
fi

echo "Running: mvn clean install in $BACKEND_DIR"
cd "$BACKEND_DIR"
mvn clean install

echo "mvn clean install finished. Return code: $?"
