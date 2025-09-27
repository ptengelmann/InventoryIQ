#!/usr/bin/env bash
# scripts/start-app.sh
# Simple script to start InventoryIQ dev stack: postgres, redis, app, adminer
set -euo pipefail


# Source shared container environment utilities and message utils
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}" )" && pwd)"
source "$SCRIPT_DIR/container-env-utils.sh"
source "$SCRIPT_DIR/container-msg-utils.sh"

ENGINE="$(detect_engine)"

# Names
NET=inventoryiq-net
PG=inventoryiq-pg
REDIS=inventoryiq-redis
APP=inventoryiq-app
ADMINER=inventoryiq-adminer
PG_VOL=pgdata
REDIS_VOL=redisdata

# Create network and volumes

if $ENGINE network inspect $NET >/dev/null 2>&1; then
  msg_info "Network $NET already exists."
else
  msg_info "Creating network $NET."
  $ENGINE network create $NET
fi
if $ENGINE volume inspect $PG_VOL >/dev/null 2>&1; then
  msg_info "Postgres volume $PG_VOL already exists."
else
  msg_info "Creating Postgres volume $PG_VOL."
  $ENGINE volume create $PG_VOL
fi
if $ENGINE volume inspect $REDIS_VOL >/dev/null 2>&1; then
  msg_info "Redis volume $REDIS_VOL already exists."
else
  msg_info "Creating Redis volume $REDIS_VOL."
  $ENGINE volume create $REDIS_VOL
fi


# Start Postgres
PG_VOLUME_OPT="$(get_volume_opt "$PG_VOL" "/var/lib/postgresql/data")"
$ENGINE run -d --rm --name $PG --network $NET \
  -e POSTGRES_DB=inventoryiq_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=dev_password_123 \
  -p 5432:5432 \
  $PG_VOLUME_OPT \
  postgres:15-alpine


# Start Redis
REDIS_VOLUME_OPT="$(get_volume_opt "$REDIS_VOL" "/data")"
$ENGINE run -d --rm --name $REDIS --network $NET \
  -p 6379:6379 \
  $REDIS_VOLUME_OPT \
  redis:7-alpine


# Build app image if needed
if ! $ENGINE image exists inventoryiq-app; then
  msg_info "Building app image: inventoryiq-app"
  $ENGINE build -t inventoryiq-app -f Dockerfile.dev .
else
  msg_info "App image inventoryiq-app already exists."
fi

# Start app
APP_VOLUME_OPT="$(get_volume_opt "${PWD}" "/app")"
$ENGINE run -d --rm --name $APP --network $NET \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://postgres:dev_password_123@$PG:5432/inventoryiq_dev \
  -e REDIS_URL=redis://$REDIS:6379 \
  -e NODE_ENV=development \
  $APP_VOLUME_OPT \
  inventoryiq-app npm run dev

# Start Adminer
$ENGINE run -d --rm --name $ADMINER --network $NET \
  -p 8080:8080 \
  -e ADMINER_DEFAULT_SERVER=postgres \
  adminer:latest

msg_success "All containers started."
msg_info "App: http://localhost:3000"
msg_info "Adminer: http://localhost:8080"
