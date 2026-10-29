#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

RUN_DIR="$ROOT/.run"
DB_CONTAINER="notes-db"
API_PORT=3000
WEB_PORT=5173
MIN_NODE=22
SEED=1
STOP_DB=0
LAN=0

if [ -t 1 ]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; RED=$'\033[31m'; GREEN=$'\033[32m'; RESET=$'\033[0m'
else
  BOLD=""; DIM=""; RED=""; GREEN=""; RESET=""
fi

step() { printf '%s==>%s %s\n' "$BOLD" "$RESET" "$1"; }
ok() { printf '    %s✓%s %s\n' "$GREEN" "$RESET" "$1"; }
die() { printf '%s✗ %s%s\n' "$RED" "$1" "$RESET" >&2; exit 1; }

usage() {
  cat <<EOF
Usage: ./run.sh [options]

Sets everything up and starts the app with one command:
  database (Docker), dependencies, migrations, demo data, API and web app.

Options:
  --no-seed    do not load the demo notes into an empty database
  --lan        also open the app to your local network, to try it on a phone
  --down       stop the database container and exit (data is kept)
  -h, --help   show this help

App: http://localhost:$WEB_PORT   API: http://localhost:$API_PORT/api
EOF
}

for arg in "$@"; do
  case "$arg" in
    --no-seed) SEED=0 ;;
    --lan) LAN=1 ;;
    --down) STOP_DB=1 ;;
    -h|--help) usage; exit 0 ;;
    *) usage; die "Unknown option: $arg" ;;
  esac
done

lan_ip() {
  local ip=""
  if command -v ipconfig >/dev/null 2>&1; then
    ip="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
  fi
  if [ -z "$ip" ] && command -v hostname >/dev/null 2>&1; then
    ip="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
  fi
  printf '%s' "$ip"
}

port_in_use() {
  (exec 3<>"/dev/tcp/127.0.0.1/$1") 2>/dev/null
}

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  else
    docker-compose "$@"
  fi
}

wait_for() {
  local label="$1" tries="$2"
  shift 2
  local i=0
  until "$@" >/dev/null 2>&1; do
    i=$((i + 1))
    [ "$i" -ge "$tries" ] && return 1
    sleep 1
  done
  ok "$label"
}

check_node() {
  command -v node >/dev/null 2>&1 || die "Node.js is not installed. Install Node $MIN_NODE or newer (see .nvmrc)."
  command -v npm >/dev/null 2>&1 || die "npm is not installed."
  local major
  major="$(node -p 'process.versions.node.split(".")[0]')"
  [ "$major" -ge "$MIN_NODE" ] || die "Node $MIN_NODE or newer is required (found $(node -v)). With nvm: nvm install && nvm use"
  ok "Node $(node -v), npm $(npm -v)"
}

check_docker() {
  command -v docker >/dev/null 2>&1 || die "Docker is not installed. It runs the PostgreSQL database."
  if ! docker info >/dev/null 2>&1; then
    if [ "$(uname -s)" = "Darwin" ]; then
      printf '    starting Docker Desktop...\n'
      open -a Docker >/dev/null 2>&1 || true
      wait_for "Docker is running" 90 docker info || die "Docker did not start. Open Docker Desktop and run this script again."
    else
      die "The Docker daemon is not running. Start it (for example: sudo systemctl start docker) and run this script again."
    fi
  else
    ok "Docker $(docker --version | sed -E 's/Docker version ([^,]+),.*/\1/')"
  fi
  compose version >/dev/null 2>&1 || die "Docker Compose is not available."
}

ensure_env() {
  local dir="$1"
  if [ ! -f "$dir/.env" ]; then
    cp "$dir/.env.example" "$dir/.env"
    if [ "$dir" = "backend" ] && [ -n "${DB_PORT:-}" ]; then
      sed "s/^DB_PORT=.*/DB_PORT=$DB_PORT/" "$dir/.env" >"$dir/.env.tmp" && mv "$dir/.env.tmp" "$dir/.env"
    fi
    ok "created $dir/.env from .env.example"
  fi
}

install_deps() {
  local dir="$1"
  if [ ! -d "$dir/node_modules" ] || [ "$dir/package-lock.json" -nt "$dir/node_modules" ]; then
    printf '    installing %s dependencies (this can take a minute)...\n' "$dir"
    (cd "$dir" && npm ci --no-audit --no-fund >"$RUN_DIR/install-$dir.log" 2>&1) \
      || { tail -n 20 "$RUN_DIR/install-$dir.log"; die "npm ci failed in $dir"; }
  fi
  ok "$dir dependencies ready"
}

db_healthy() {
  [ "$(docker inspect -f '{{.State.Health.Status}}' "$DB_CONTAINER" 2>/dev/null)" = "healthy" ]
}

cleanup() {
  trap - INT TERM EXIT
  [ -n "${API_PID:-}" ] && kill -TERM -- "-$API_PID" 2>/dev/null || true
  [ -n "${WEB_PID:-}" ] && kill -TERM -- "-$WEB_PID" 2>/dev/null || true
}

mkdir -p "$RUN_DIR"

if [ "$STOP_DB" -eq 1 ]; then
  check_docker
  compose stop db >/dev/null
  ok "database stopped (data is kept, ./run.sh starts it again)"
  exit 0
fi

step "Checking requirements"
check_node
check_docker

step "Checking ports"
port_in_use "$API_PORT" && die "Port $API_PORT is already in use (API)."
port_in_use "$WEB_PORT" && die "Port $WEB_PORT is already in use (web app)."
DB_PORT="${DB_PORT:-5433}"
if port_in_use "$DB_PORT" && ! db_healthy; then
  die "Port $DB_PORT is already in use by another program. Stop it, or free the port, and try again."
fi
ok "ports $API_PORT, $WEB_PORT and $DB_PORT are available"

step "Preparing configuration"
ensure_env backend
ensure_env frontend

step "Starting the database"
compose up -d db >"$RUN_DIR/docker.log" 2>&1 || { tail -n 20 "$RUN_DIR/docker.log"; die "Could not start the database container."; }
wait_for "PostgreSQL is ready" 60 db_healthy || die "The database did not become healthy in time (docker logs $DB_CONTAINER)."

step "Installing dependencies"
install_deps backend
install_deps frontend

step "Setting up the database"
npm --prefix backend run migration:run >"$RUN_DIR/migrations.log" 2>&1 \
  || { tail -n 20 "$RUN_DIR/migrations.log"; die "Migrations failed."; }
ok "migrations applied"
if [ "$SEED" -eq 1 ]; then
  npm --prefix backend run seed 2>&1 | grep -E "^(Seed|Seeded)" | sed 's/^/    ✓ /' || true
fi

step "Starting the app"
set -m
trap cleanup INT TERM EXIT
LAN_IP=""
if [ "$LAN" -eq 1 ]; then
  LAN_IP="$(lan_ip)"
  [ -n "$LAN_IP" ] || die "Could not find your local network address. Are you connected to Wi-Fi?"
  ok "network address $LAN_IP"
  FRONTEND_URL="http://localhost:$WEB_PORT,http://$LAN_IP:$WEB_PORT" npm --prefix backend run start:dev >"$RUN_DIR/backend.log" 2>&1 &
  API_PID=$!
  VITE_API_URL="http://$LAN_IP:$API_PORT/api" npm --prefix frontend run dev -- --host >"$RUN_DIR/frontend.log" 2>&1 &
  WEB_PID=$!
else
  npm --prefix backend run start:dev >"$RUN_DIR/backend.log" 2>&1 &
  API_PID=$!
  npm --prefix frontend run dev >"$RUN_DIR/frontend.log" 2>&1 &
  WEB_PID=$!
fi

wait_for "API is up" 90 curl -sf "http://localhost:$API_PORT/api/notes" \
  || { tail -n 30 "$RUN_DIR/backend.log"; die "The API did not start (log: .run/backend.log)."; }
wait_for "web app is up" 60 curl -sf "http://localhost:$WEB_PORT" \
  || { tail -n 30 "$RUN_DIR/frontend.log"; die "The web app did not start (log: .run/frontend.log)."; }

printf '\n%sNotes is running%s\n' "$BOLD" "$RESET"
printf '  App  http://localhost:%s\n' "$WEB_PORT"
printf '  API  http://localhost:%s/api\n' "$API_PORT"
if [ -n "$LAN_IP" ]; then
  printf '\n%sOn your phone (same Wi-Fi):%s\n  http://%s:%s\n' "$BOLD" "$RESET" "$LAN_IP" "$WEB_PORT"
fi
printf '%s  Press Ctrl+C to stop. The database keeps running; ./run.sh --down stops it.%s\n\n' "$DIM" "$RESET"

while kill -0 "$API_PID" 2>/dev/null && kill -0 "$WEB_PID" 2>/dev/null; do
  sleep 1
done

die "A server stopped unexpectedly. Check .run/backend.log and .run/frontend.log."
