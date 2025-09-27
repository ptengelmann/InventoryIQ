#!/usr/bin/env bash
# scripts/start-app.sh
# Simple script to start InventoryIQ dev stack: postgres, redis, app, adminer
set -euo pipefail


# Source shared container environment utilities and message utils
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}" )" && pwd)"
source "$SCRIPT_DIR/container-env-utils.sh"
source "$SCRIPT_DIR/container-msg-utils.sh"

ENGINE="$(detect_engine)"



# Image versions
POSTGRES_VERSION="18-bookworm"
REDIS_VERSION="8.2.1-bookworm"
ADMINER_VERSION="latest"
APP_IMAGE="inventoryiq-app"

# Port variables
POSTGRES_PORT=5432
REDIS_PORT=6379
APP_PORT=3000
ADMINER_PORT=8080

# Names
NET=inventoryiq-net
PG=inventoryiq-pg
REDIS=inventoryiq-redis
APP=$APP_IMAGE
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

for C in "$PG" "$REDIS" "$APP" "$ADMINER"; do
  if $ENGINE ps -a --format '{{.Names}}' | grep -wq "$C"; then
    msg_info "Removing existing container: $C"
    $ENGINE rm -f "$C" || true
  fi
done

# Start Postgres
PG_VOLUME_OPT="$(get_volume_opt "$PG_VOL" "/var/lib/postgresql/data")"
$ENGINE run -d --rm --name $PG --network $NET \
  -e POSTGRES_DB=inventoryiq_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=dev_password_123 \
  -p ${POSTGRES_PORT}:5432 \
  $PG_VOLUME_OPT \
  postgres:$POSTGRES_VERSION


# Start Redis
REDIS_VOLUME_OPT="$(get_volume_opt "$REDIS_VOL" "/data")"
$ENGINE run -d --rm --name $REDIS --network $NET \
  -p ${REDIS_PORT}:6379 \
  $REDIS_VOLUME_OPT \
  redis:$REDIS_VERSION


# Build app image if needed
if ! $ENGINE image exists "$APP_IMAGE"; then
  msg_info "Building app image: $APP_IMAGE"
  $ENGINE build -t "$APP_IMAGE" -f dockerfile.dev .
else
  msg_info "App image $APP_IMAGE already exists."
fi

# Start app
APP_VOLUME_OPT="$(get_volume_opt "${PWD}" "/app")"
$ENGINE run -d --rm --name $APP --network $NET \
  -p ${APP_PORT}:3000 \
  -e DATABASE_URL=postgresql://postgres:dev_password_123@$PG:${POSTGRES_PORT}/inventoryiq_dev \
  -e REDIS_URL=redis://$REDIS:${REDIS_PORT} \
  -e NODE_ENV=development \
  $APP_VOLUME_OPT \
  $APP_IMAGE npm run dev

# Start Adminer
$ENGINE run -d --rm --name $ADMINER --network $NET \
  -p ${ADMINER_PORT}:8080 \
  -e ADMINER_DEFAULT_SERVER=postgres \
  adminer:$ADMINER_VERSION

# Wait for Postgres to be ready
msg_info "Waiting for Postgres to be ready..."
until $ENGINE exec $PG pg_isready -U postgres -d inventoryiq_dev; do
  sleep 1
done

# Run Prisma migration (or db push) in the app container
msg_info "Running Prisma migrations..."
$ENGINE exec $APP npx prisma migrate dev --name init || $ENGINE exec $APP npx prisma db push

msg_success "All containers started."
msg_info ""
msg_info "Service endpoints:"
msg_info "  Postgres:  localhost:${POSTGRES_PORT}"
msg_info "  Redis:     localhost:${REDIS_PORT}"
msg_info "  App:       http://localhost:${APP_PORT}"
msg_info "  Adminer:   http://localhost:${ADMINER_PORT}"
