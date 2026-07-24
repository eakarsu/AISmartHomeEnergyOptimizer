#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$project_dir"

test -f .env || { echo '.env is required (copy .env.example)' >&2; exit 1; }
set -a
source .env
set +a

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${JWT_SECRET:?JWT_SECRET is required}"
(( ${#JWT_SECRET} >= 32 )) || { echo 'JWT_SECRET must contain at least 32 characters' >&2; exit 1; }

demo_autofill="${ENABLE_DEMO_CREDENTIAL_AUTOFILL:-false}"
case "$demo_autofill" in
  true)
    [ "${NODE_ENV:-development}" != production ] || {
      echo 'Demo credential autofill is forbidden in production' >&2
      exit 1
    }
    : "${SEED_ADMIN_EMAIL:?SEED_ADMIN_EMAIL is required when demo credential autofill is enabled}"
    : "${SEED_ADMIN_PASSWORD:?SEED_ADMIN_PASSWORD is required when demo credential autofill is enabled}"
    (( ${#SEED_ADMIN_PASSWORD} >= 12 )) || {
      echo 'SEED_ADMIN_PASSWORD must contain at least 12 characters' >&2
      exit 1
    }
    export VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL=true
    export VITE_DEMO_EMAIL="$SEED_ADMIN_EMAIL"
    export VITE_DEMO_PASSWORD="$SEED_ADMIN_PASSWORD"
    ;;
  false)
    export VITE_ENABLE_DEMO_CREDENTIAL_AUTOFILL=false
    unset VITE_DEMO_EMAIL VITE_DEMO_PASSWORD
    ;;
  *)
    echo 'ENABLE_DEMO_CREDENTIAL_AUTOFILL must be true or false' >&2
    exit 1
    ;;
esac

test -d backend/node_modules && test -d frontend/node_modules || {
  echo 'Dependencies are missing; install them explicitly before starting' >&2
  exit 1
}

backend_port="${BACKEND_PORT:-3001}"
frontend_port="${FRONTEND_PORT:-3000}"
for port in "$backend_port" "$frontend_port"; do
  if command -v lsof >/dev/null 2>&1 && lsof -ti ":$port" >/dev/null 2>&1; then
    echo "Port $port is already in use" >&2
    exit 1
  fi
done

mode="${1:-all}"
pids=()
trap 'for pid in "${pids[@]:-}"; do kill "$pid" 2>/dev/null || true; done' EXIT INT TERM

if [[ "$mode" == backend || "$mode" == all ]]; then
  npm --prefix backend start &
  pids+=("$!")
fi
if [[ "$mode" == frontend || "$mode" == all ]]; then
  npm --prefix frontend run dev -- --host 127.0.0.1 --port "$frontend_port" &
  pids+=("$!")
fi

[[ ${#pids[@]} -gt 0 ]] || { echo 'Usage: ./start.sh [all|backend|frontend]' >&2; exit 2; }
wait
