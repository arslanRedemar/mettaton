#!/bin/bash

# Mettaton Discord Bot - Auto-Update Script
# Automatic deployment with backup, health check, and rollback (no Docker)

set -euo pipefail

# ============================================================
# Configuration
# ============================================================
PROJECT_DIR="/home/pi/mettaton"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/deploy.log"
MAX_BACKUPS=5
BRANCH="main"
SERVICE_NAME="mettaton"
HEALTH_CHECK_RETRIES=6
HEALTH_CHECK_INTERVAL=10
LOCK_FILE="/tmp/mettaton-update.lock"

# ============================================================
# Argument Parsing
# ============================================================
FORCE=0
VERBOSE=0

print_usage() {
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  --force    Skip new-commit check and deploy immediately"
  echo "  --verbose  Print detailed output to stdout"
  echo "  --help     Show this help message"
}

while [ $# -gt 0 ]; do
  case "$1" in
    --force) FORCE=1 ;;
    --verbose) VERBOSE=1 ;;
    --help) print_usage; exit 0 ;;
    *) echo "Unknown option: $1"; print_usage; exit 1 ;;
  esac
  shift
done

# ============================================================
# Logging
# ============================================================
log() {
  local level="$1"
  shift
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  local message="[$timestamp] [$level] $*"
  echo "$message" >> "$LOG_FILE"
  if [ "$level" = "ERROR" ] || [ "$VERBOSE" -eq 1 ]; then
    echo "$message" >&2
  fi
}

# ============================================================
# Lock File (prevent concurrent runs)
# ============================================================
acquire_lock() {
  if [ -f "$LOCK_FILE" ]; then
    local lock_pid
    lock_pid=$(cat "$LOCK_FILE")
    if kill -0 "$lock_pid" 2>/dev/null; then
      log "INFO" "Another update is already running (PID: $lock_pid). Exiting."
      exit 0
    else
      log "WARN" "Stale lock file found. Removing."
      rm -f "$LOCK_FILE"
    fi
  fi
  echo $$ > "$LOCK_FILE"
  trap 'rm -f "$LOCK_FILE"' EXIT
}

# ============================================================
# Directory Initialization
# ============================================================
init_dirs() {
  mkdir -p "$BACKUP_DIR"
  mkdir -p "$LOG_DIR"
}

# ============================================================
# Check for Updates (git fetch + HEAD comparison)
# ============================================================
check_for_updates() {
  log "INFO" "Checking for updates on $BRANCH..."
  cd "$PROJECT_DIR"

  if ! git fetch origin "$BRANCH" 2>>"$LOG_FILE"; then
    log "ERROR" "Failed to fetch from origin. Network may be down."
    return 1
  fi

  LOCAL_HEAD=$(git rev-parse HEAD)
  REMOTE_HEAD=$(git rev-parse "origin/$BRANCH")

  if [ "$LOCAL_HEAD" = "$REMOTE_HEAD" ]; then
    log "INFO" "Already up to date. (HEAD: ${LOCAL_HEAD:0:8})"
    return 1
  fi

  log "INFO" "Update available: ${LOCAL_HEAD:0:8} -> ${REMOTE_HEAD:0:8}"
  return 0
}

# ============================================================
# Backup (DB + moon_calendars + node_modules hash)
# ============================================================
create_backup() {
  local timestamp
  timestamp=$(date '+%Y%m%d_%H%M%S')
  local commit_short
  commit_short=$(git -C "$PROJECT_DIR" rev-parse --short HEAD)
  local backup_name="backup_${timestamp}_${commit_short}"
  local backup_path="$BACKUP_DIR/$backup_name"

  log "INFO" "Creating backup: $backup_name"
  mkdir -p "$backup_path"

  if [ -d "$PROJECT_DIR/data" ]; then
    cp -a "$PROJECT_DIR/data" "$backup_path/data"
  fi

  if [ -d "$PROJECT_DIR/moon_calendars" ]; then
    cp -a "$PROJECT_DIR/moon_calendars" "$backup_path/moon_calendars"
  fi

  # Save package-lock.json for dependency rollback
  if [ -f "$PROJECT_DIR/package-lock.json" ]; then
    cp "$PROJECT_DIR/package-lock.json" "$backup_path/package-lock.json"
  fi

  echo "$LOCAL_HEAD" > "$backup_path/commit_hash"

  log "INFO" "Backup created at $backup_path"
  echo "$backup_path"
}

# ============================================================
# Backup Rotation (keep last N)
# ============================================================
rotate_backups() {
  log "INFO" "Rotating backups (keeping last $MAX_BACKUPS)..."
  local count
  count=$(find "$BACKUP_DIR" -maxdepth 1 -name "backup_*" -type d | wc -l)

  if [ "$count" -gt "$MAX_BACKUPS" ]; then
    local to_remove=$((count - MAX_BACKUPS))
    find "$BACKUP_DIR" -maxdepth 1 -name "backup_*" -type d | sort | head -n "$to_remove" | while read -r dir; do
      log "INFO" "Removing old backup: $(basename "$dir")"
      rm -rf "$dir"
    done
  fi
}

# ============================================================
# Deploy (pull + npm install + restart service)
# ============================================================
deploy() {
  log "INFO" "Pulling latest code..."
  cd "$PROJECT_DIR"

  # Save current package-lock hash for comparison
  local old_lock_hash=""
  if [ -f "package-lock.json" ]; then
    old_lock_hash=$(md5sum package-lock.json | cut -d' ' -f1)
  fi

  if ! git pull origin "$BRANCH" 2>>"$LOG_FILE"; then
    log "ERROR" "Git pull failed."
    return 1
  fi

  local new_head
  new_head=$(git rev-parse --short HEAD)
  log "INFO" "Code updated to: $new_head"

  # Reinstall dependencies only if package-lock.json changed
  local new_lock_hash=""
  if [ -f "package-lock.json" ]; then
    new_lock_hash=$(md5sum package-lock.json | cut -d' ' -f1)
  fi

  if [ "$old_lock_hash" != "$new_lock_hash" ]; then
    log "INFO" "package-lock.json changed. Running npm ci..."
    if ! npm ci --only=production 2>>"$LOG_FILE"; then
      log "ERROR" "npm ci failed."
      return 1
    fi
    log "INFO" "Dependencies updated."
  else
    log "INFO" "Dependencies unchanged. Skipping npm ci."
  fi

  # Restart the bot service
  log "INFO" "Restarting bot service..."
  if ! sudo systemctl restart "$SERVICE_NAME" 2>>"$LOG_FILE"; then
    log "ERROR" "Failed to restart service."
    return 1
  fi

  return 0
}

# ============================================================
# Health Check (process alive + no crash loops)
# ============================================================
health_check() {
  log "INFO" "Checking bot health..."

  for i in $(seq 1 "$HEALTH_CHECK_RETRIES"); do
    sleep "$HEALTH_CHECK_INTERVAL"

    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
      log "INFO" "Bot is running. (check $i/$HEALTH_CHECK_RETRIES)"
      return 0
    fi

    log "WARN" "Bot not running yet (attempt $i/$HEALTH_CHECK_RETRIES)..."
  done

  log "ERROR" "Bot failed health check after $((HEALTH_CHECK_RETRIES * HEALTH_CHECK_INTERVAL))s."
  return 1
}

# ============================================================
# Rollback (restore code + data + dependencies)
# ============================================================
rollback() {
  local backup_path="$1"
  log "ERROR" "ROLLING BACK to previous state..."

  cd "$PROJECT_DIR"

  # Stop the bot first
  sudo systemctl stop "$SERVICE_NAME" 2>>"$LOG_FILE" || true

  local prev_commit
  prev_commit=$(cat "$backup_path/commit_hash")
  log "INFO" "Resetting to commit: ${prev_commit:0:8}"
  git reset --hard "$prev_commit" 2>>"$LOG_FILE"

  if [ -d "$backup_path/data" ]; then
    log "INFO" "Restoring database backup..."
    rm -rf "$PROJECT_DIR/data"
    cp -a "$backup_path/data" "$PROJECT_DIR/data"
  fi

  if [ -d "$backup_path/moon_calendars" ]; then
    log "INFO" "Restoring moon_calendars backup..."
    rm -rf "$PROJECT_DIR/moon_calendars"
    cp -a "$backup_path/moon_calendars" "$PROJECT_DIR/moon_calendars"
  fi

  # Restore dependencies if package-lock was backed up
  if [ -f "$backup_path/package-lock.json" ]; then
    log "INFO" "Restoring dependencies..."
    cp "$backup_path/package-lock.json" "$PROJECT_DIR/package-lock.json"
    npm ci --only=production 2>>"$LOG_FILE" || true
  fi

  log "INFO" "Restarting bot with rolled-back code..."
  sudo systemctl start "$SERVICE_NAME" 2>>"$LOG_FILE" || true

  log "INFO" "Rollback complete."
}

# ============================================================
# Main
# ============================================================
main() {
  init_dirs
  acquire_lock

  log "INFO" "========== Update check started =========="

  if [ "$FORCE" -eq 0 ]; then
    if ! check_for_updates; then
      exit 0
    fi
  else
    log "INFO" "Force mode: skipping update check."
    cd "$PROJECT_DIR"
    git fetch origin "$BRANCH" 2>>"$LOG_FILE" || true
    LOCAL_HEAD=$(git rev-parse HEAD)
  fi

  BACKUP_PATH=$(create_backup)

  if deploy; then
    if health_check; then
      log "INFO" "Deployment successful! ($(git -C "$PROJECT_DIR" rev-parse --short HEAD))"
      rotate_backups
    else
      log "ERROR" "Health check failed. Initiating rollback..."
      rollback "$BACKUP_PATH"
    fi
  else
    log "ERROR" "Deploy failed. Initiating rollback..."
    rollback "$BACKUP_PATH"
  fi

  log "INFO" "========== Update check finished =========="
}

main "$@"
