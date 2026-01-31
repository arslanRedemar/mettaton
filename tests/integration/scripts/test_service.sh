#!/bin/bash

# Systemd Service File Tests
# mettaton.service 테스트

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test_helper.sh"

# Path to the service file being tested
SERVICE_FILE="$SCRIPT_DIR/../../scripts/mettaton.service"

echo "=========================================="
echo "  Testing: mettaton.service"
echo "=========================================="

# Test: Service file exists
test_file_exists() {
  assert_file_exists "$SERVICE_FILE" "Service file should exist"
}

# Test: Has Unit section
test_has_unit_section() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "[Unit]" "Service should have [Unit] section"
}

# Test: Has Service section
test_has_service_section() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "[Service]" "Service should have [Service] section"
}

# Test: Has Install section
test_has_install_section() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "[Install]" "Service should have [Install] section"
}

# Test: Requires docker.service
test_requires_docker() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "Requires=docker.service" "Service should require docker.service"
}

# Test: Starts after docker.service
test_after_docker() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "After=docker.service" "Service should start after docker.service"
}

# Test: Starts after network
test_after_network() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "network-online.target" "Service should wait for network"
}

# Test: Has description
test_has_description() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "Description=" "Service should have a description"
}

# Test: Uses correct working directory
test_working_directory() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "WorkingDirectory=/home/pi/mettaton" "Service should have correct working directory"
}

# Test: Uses docker compose up for ExecStart
test_exec_start() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "ExecStart=" "Service should have ExecStart"
  assert_contains "$content" "docker compose up" "ExecStart should use docker compose up"
}

# Test: Uses docker compose down for ExecStop
test_exec_stop() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "ExecStop=" "Service should have ExecStop"
  assert_contains "$content" "docker compose down" "ExecStop should use docker compose down"
}

# Test: Enabled at multi-user target
test_wanted_by() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "WantedBy=multi-user.target" "Service should be wanted by multi-user.target"
}

# Test: Uses oneshot type
test_service_type() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "Type=oneshot" "Service should be oneshot type"
}

# Test: Remains after exit
test_remain_after_exit() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "RemainAfterExit=yes" "Service should remain after exit"
}

# Test: Has reasonable timeout
test_has_timeout() {
  local content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "TimeoutStartSec=" "Service should have start timeout"
}

# Run all tests
run_test "Service file exists" test_file_exists
run_test "Has [Unit] section" test_has_unit_section
run_test "Has [Service] section" test_has_service_section
run_test "Has [Install] section" test_has_install_section
run_test "Requires docker.service" test_requires_docker
run_test "Starts after docker.service" test_after_docker
run_test "Starts after network" test_after_network
run_test "Has description" test_has_description
run_test "Uses correct working directory" test_working_directory
run_test "Has ExecStart with docker compose" test_exec_start
run_test "Has ExecStop with docker compose" test_exec_stop
run_test "Wanted by multi-user.target" test_wanted_by
run_test "Uses oneshot type" test_service_type
run_test "Remains after exit" test_remain_after_exit
run_test "Has start timeout" test_has_timeout

print_summary
