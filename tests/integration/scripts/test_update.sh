#!/bin/bash

# Auto-Update Script Tests
# update.sh structure validation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test_helper.sh"

UPDATE_SCRIPT="$SCRIPT_DIR/../../../scripts/update.sh"

echo "=========================================="
echo "  Testing: update.sh"
echo "=========================================="

# Test: Script file exists
test_file_exists() {
  assert_file_exists "$UPDATE_SCRIPT" "update.sh should exist"
}

# Test: Script syntax is valid
test_syntax_valid() {
  bash -n "$UPDATE_SCRIPT" 2>/dev/null
  assert_exit_code 0 $? "update.sh should have valid syntax"
}

# Test: Script has bash shebang
test_has_shebang() {
  local first_line
  first_line=$(head -n 1 "$UPDATE_SCRIPT")
  assert_equals "#!/bin/bash" "$first_line" "Script should have bash shebang"
}

# Test: Script uses strict mode
test_has_strict_mode() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" "set -euo pipefail" "Script should use strict mode"
}

# Test: Script defines PROJECT_DIR
test_defines_project_dir() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" 'PROJECT_DIR=' "Script should define PROJECT_DIR"
}

# Test: Script defines BRANCH
test_defines_branch() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" 'BRANCH="main"' "Script should target main branch"
}

# Test: Script supports --force flag
test_supports_force_flag() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" "--force" "Script should support --force flag"
}

# Test: Script supports --verbose flag
test_supports_verbose_flag() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" "--verbose" "Script should support --verbose flag"
}

# Test: Script has lock mechanism
test_has_lock_mechanism() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" "LOCK_FILE" "Script should define a lock file"
  assert_contains "$content" "acquire_lock" "Script should have acquire_lock function"
}

# Test: Script uses git fetch to check for updates
test_checks_remote() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" "git fetch" "Script should fetch from remote"
  assert_contains "$content" "git rev-parse" "Script should compare commit hashes"
}

# Test: Script creates backup before deploy
test_creates_backup() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" "create_backup" "Script should have create_backup function"
  assert_contains "$content" "BACKUP_DIR" "Script should define backup directory"
  assert_contains "$content" "cp -a" "Script should use cp -a for backups"
}

# Test: Script has deploy function
test_has_deploy() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" "deploy()" "Script should have deploy function"
  assert_contains "$content" "git pull" "Deploy should pull latest code"
  assert_contains "$content" "docker compose up -d --build" "Deploy should rebuild container"
}

# Test: Script has health check
test_has_health_check() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" "health_check" "Script should have health_check function"
  assert_contains "$content" "docker ps" "Health check should verify container status"
  assert_contains "$content" "RestartCount" "Health check should detect crash loops"
}

# Test: Script has rollback capability
test_has_rollback() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" "rollback" "Script should have rollback function"
  assert_contains "$content" "git reset --hard" "Rollback should reset code"
  assert_contains "$content" "commit_hash" "Rollback should use saved commit hash"
}

# Test: Script rotates backups
test_rotates_backups() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" "rotate_backups" "Script should have rotate_backups function"
  assert_contains "$content" "MAX_BACKUPS" "Script should define max backup count"
}

# Test: Script prunes Docker images
test_prunes_images() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" "docker image prune" "Script should prune unused Docker images"
}

# Test: Script has logging
test_has_logging() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" "LOG_FILE" "Script should define log file"
  assert_contains "$content" "log()" "Script should have log function"
}

# Test: Script has help option
test_has_help() {
  local content
  content=$(cat "$UPDATE_SCRIPT")
  assert_contains "$content" "--help" "Script should support --help flag"
  assert_contains "$content" "print_usage" "Script should have print_usage function"
}

# Run all tests
run_test "Script file exists" test_file_exists
run_test "Script syntax is valid" test_syntax_valid
run_test "Script has bash shebang" test_has_shebang
run_test "Script uses strict mode" test_has_strict_mode
run_test "Script defines PROJECT_DIR" test_defines_project_dir
run_test "Script targets main branch" test_defines_branch
run_test "Script supports --force flag" test_supports_force_flag
run_test "Script supports --verbose flag" test_supports_verbose_flag
run_test "Script has lock mechanism" test_has_lock_mechanism
run_test "Script checks remote for updates" test_checks_remote
run_test "Script creates backups" test_creates_backup
run_test "Script has deploy function" test_has_deploy
run_test "Script has health check" test_has_health_check
run_test "Script has rollback capability" test_has_rollback
run_test "Script rotates backups" test_rotates_backups
run_test "Script prunes Docker images" test_prunes_images
run_test "Script has logging" test_has_logging
run_test "Script has help option" test_has_help

print_summary
