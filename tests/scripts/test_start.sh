#!/bin/bash

# Start Script Tests
# start.sh 테스트

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test_helper.sh"

# Path to the script being tested
START_SCRIPT="$SCRIPT_DIR/../../scripts/start.sh"

echo "=========================================="
echo "  Testing: start.sh"
echo "=========================================="

# Test: Script syntax is valid
test_syntax_valid() {
  bash -n "$START_SCRIPT" 2>/dev/null
  assert_exit_code 0 $? "start.sh should have valid syntax"
}

# Test: Script has bash shebang
test_has_shebang() {
  local first_line=$(head -n 1 "$START_SCRIPT")
  assert_equals "#!/bin/bash" "$first_line" "Script should have bash shebang"
}

# Test: Script changes to project directory
test_changes_directory() {
  local content=$(cat "$START_SCRIPT")
  assert_contains "$content" "cd /home/pi/mettaton" "Script should change to project directory"
}

# Test: Script uses docker compose up
test_uses_docker_compose_up() {
  local content=$(cat "$START_SCRIPT")
  assert_contains "$content" "docker compose up" "Script should use 'docker compose up'"
}

# Test: Script uses detached mode
test_uses_detached_mode() {
  local content=$(cat "$START_SCRIPT")
  assert_contains "$content" "-d" "Script should use detached mode (-d)"
}

# Test: Script builds containers
test_builds_containers() {
  local content=$(cat "$START_SCRIPT")
  assert_contains "$content" "--build" "Script should build containers (--build)"
}

# Test: Script shows logs
test_shows_logs() {
  local content=$(cat "$START_SCRIPT")
  assert_contains "$content" "docker logs" "Script should show logs"
}

# Test: Script follows logs
test_follows_logs() {
  local content=$(cat "$START_SCRIPT")
  assert_contains "$content" "-f" "Script should follow logs (-f)"
}

# Test: Script references correct container name
test_container_name() {
  local content=$(cat "$START_SCRIPT")
  assert_contains "$content" "mettaton-bot" "Script should reference mettaton-bot container"
}

# Test: Script prints start message
test_prints_message() {
  local content=$(cat "$START_SCRIPT")
  assert_contains "$content" "echo" "Script should print status message"
}

# Run all tests
run_test "Script syntax is valid" test_syntax_valid
run_test "Script has bash shebang" test_has_shebang
run_test "Script changes to project directory" test_changes_directory
run_test "Script uses docker compose up" test_uses_docker_compose_up
run_test "Script uses detached mode" test_uses_detached_mode
run_test "Script builds containers" test_builds_containers
run_test "Script shows logs" test_shows_logs
run_test "Script follows logs" test_follows_logs
run_test "Script references correct container" test_container_name
run_test "Script prints status message" test_prints_message

print_summary
