#!/bin/bash

# Setup Script Tests
# setup.sh 테스트

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test_helper.sh"

# Path to the script being tested
SETUP_SCRIPT="$SCRIPT_DIR/../../scripts/setup.sh"

echo "=========================================="
echo "  Testing: setup.sh"
echo "=========================================="

# Test: Script syntax is valid
test_syntax_valid() {
  bash -n "$SETUP_SCRIPT" 2>/dev/null
  assert_exit_code 0 $? "setup.sh should have valid syntax"
}

# Test: Script is executable format
test_has_shebang() {
  local first_line=$(head -n 1 "$SETUP_SCRIPT")
  assert_equals "#!/bin/bash" "$first_line" "Script should have bash shebang"
}

# Test: Script uses set -e for error handling
test_has_error_handling() {
  local content=$(cat "$SETUP_SCRIPT")
  assert_contains "$content" "set -e" "Script should use 'set -e' for error handling"
}

# Test: Script defines PROJECT_DIR
test_defines_project_dir() {
  local content=$(cat "$SETUP_SCRIPT")
  assert_contains "$content" "PROJECT_DIR=" "Script should define PROJECT_DIR"
}

# Test: Script creates data directory
test_creates_data_dir() {
  local content=$(cat "$SETUP_SCRIPT")
  assert_contains "$content" 'mkdir -p "$PROJECT_DIR/data"' "Script should create data directory"
}

# Test: Script creates moon_calendars directory
test_creates_calendars_dir() {
  local content=$(cat "$SETUP_SCRIPT")
  assert_contains "$content" 'mkdir -p "$PROJECT_DIR/moon_calendars"' "Script should create moon_calendars directory"
}

# Test: Script checks for Docker installation
test_checks_docker() {
  local content=$(cat "$SETUP_SCRIPT")
  assert_contains "$content" "command -v docker" "Script should check for Docker"
}

# Test: Script checks for Docker Compose
test_checks_docker_compose() {
  local content=$(cat "$SETUP_SCRIPT")
  assert_contains "$content" "docker compose version" "Script should check for Docker Compose"
}

# Test: Script creates .env file with required variables
test_creates_env_file() {
  local content=$(cat "$SETUP_SCRIPT")
  assert_contains "$content" "TOKEN=" "Script should include TOKEN in .env"
  assert_contains "$content" "CLIENT_ID=" "Script should include CLIENT_ID in .env"
  assert_contains "$content" "GUILD_ID=" "Script should include GUILD_ID in .env"
  assert_contains "$content" "DB_PATH=" "Script should include DB_PATH in .env"
}

# Test: Script copies systemd service file
test_copies_service_file() {
  local content=$(cat "$SETUP_SCRIPT")
  assert_contains "$content" "mettaton.service" "Script should reference systemd service file"
  assert_contains "$content" "/etc/systemd/system/" "Script should copy to systemd directory"
}

# Test: Script enables systemd service
test_enables_service() {
  local content=$(cat "$SETUP_SCRIPT")
  assert_contains "$content" "systemctl enable" "Script should enable systemd service"
}

# Test: Script reloads systemd daemon
test_reloads_daemon() {
  local content=$(cat "$SETUP_SCRIPT")
  assert_contains "$content" "systemctl daemon-reload" "Script should reload systemd daemon"
}

# Run all tests
run_test "Script syntax is valid" test_syntax_valid
run_test "Script has bash shebang" test_has_shebang
run_test "Script has error handling" test_has_error_handling
run_test "Script defines PROJECT_DIR" test_defines_project_dir
run_test "Script creates data directory" test_creates_data_dir
run_test "Script creates calendars directory" test_creates_calendars_dir
run_test "Script checks for Docker" test_checks_docker
run_test "Script checks for Docker Compose" test_checks_docker_compose
run_test "Script creates .env file" test_creates_env_file
run_test "Script copies service file" test_copies_service_file
run_test "Script enables service" test_enables_service
run_test "Script reloads daemon" test_reloads_daemon

print_summary
