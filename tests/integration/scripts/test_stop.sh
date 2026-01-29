#!/bin/bash

# Stop Script Tests
# stop.sh 테스트

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test_helper.sh"

# Path to the script being tested
STOP_SCRIPT="$SCRIPT_DIR/../../scripts/stop.sh"

echo "=========================================="
echo "  Testing: stop.sh"
echo "=========================================="

# Test: Script syntax is valid
test_syntax_valid() {
  bash -n "$STOP_SCRIPT" 2>/dev/null
  assert_exit_code 0 $? "stop.sh should have valid syntax"
}

# Test: Script has bash shebang
test_has_shebang() {
  local first_line=$(head -n 1 "$STOP_SCRIPT")
  assert_equals "#!/bin/bash" "$first_line" "Script should have bash shebang"
}

# Test: Script changes to project directory
test_changes_directory() {
  local content=$(cat "$STOP_SCRIPT")
  assert_contains "$content" "cd /home/pi/mettaton" "Script should change to project directory"
}

# Test: Script uses docker compose down
test_uses_docker_compose_down() {
  local content=$(cat "$STOP_SCRIPT")
  assert_contains "$content" "docker compose down" "Script should use 'docker compose down'"
}

# Test: Script prints stop message
test_prints_message() {
  local content=$(cat "$STOP_SCRIPT")
  assert_contains "$content" "echo" "Script should print status message"
  assert_contains "$content" "stopped" "Script should indicate bot stopped"
}

# Run all tests
run_test "Script syntax is valid" test_syntax_valid
run_test "Script has bash shebang" test_has_shebang
run_test "Script changes to project directory" test_changes_directory
run_test "Script uses docker compose down" test_uses_docker_compose_down
run_test "Script prints stop message" test_prints_message

print_summary
