#!/bin/bash

# Auto-Update Systemd Unit Tests
# mettaton-update.service and mettaton-update.timer validation

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/test_helper.sh"

SERVICE_FILE="$SCRIPT_DIR/../../../scripts/mettaton-update.service"
TIMER_FILE="$SCRIPT_DIR/../../../scripts/mettaton-update.timer"

echo "=========================================="
echo "  Testing: mettaton-update.service/timer"
echo "=========================================="

# ---- Service File Tests ----

# Test: Service file exists
test_service_file_exists() {
  assert_file_exists "$SERVICE_FILE" "mettaton-update.service should exist"
}

# Test: Service has Unit section
test_service_has_unit_section() {
  local content
  content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "[Unit]" "Service should have [Unit] section"
}

# Test: Service has Service section
test_service_has_service_section() {
  local content
  content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "[Service]" "Service should have [Service] section"
}

# Test: Service has description
test_service_has_description() {
  local content
  content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "Description=" "Service should have a description"
}

# Test: Service waits for network
test_service_after_network() {
  local content
  content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "network-online.target" "Service should wait for network"
}

# Test: Service waits for Docker
test_service_after_docker() {
  local content
  content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "docker.service" "Service should wait for docker"
}

# Test: Service is oneshot type
test_service_type_oneshot() {
  local content
  content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "Type=oneshot" "Service should be oneshot type"
}

# Test: Service runs as pi user
test_service_user() {
  local content
  content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "User=pi" "Service should run as pi user"
}

# Test: Service has correct working directory
test_service_working_dir() {
  local content
  content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "WorkingDirectory=/home/pi/mettaton" "Service should have correct working directory"
}

# Test: Service executes update.sh
test_service_exec_start() {
  local content
  content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "ExecStart=" "Service should have ExecStart"
  assert_contains "$content" "update.sh" "ExecStart should run update.sh"
}

# Test: Service has Nice priority
test_service_nice() {
  local content
  content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "Nice=19" "Service should run at lowest CPU priority"
}

# Test: Service has IO scheduling
test_service_io_scheduling() {
  local content
  content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "IOSchedulingClass=idle" "Service should use idle IO scheduling"
}

# Test: Service has memory limit
test_service_memory_limit() {
  local content
  content=$(cat "$SERVICE_FILE")
  assert_contains "$content" "MemoryMax=" "Service should have memory limit"
}

# ---- Timer File Tests ----

# Test: Timer file exists
test_timer_file_exists() {
  assert_file_exists "$TIMER_FILE" "mettaton-update.timer should exist"
}

# Test: Timer has Unit section
test_timer_has_unit_section() {
  local content
  content=$(cat "$TIMER_FILE")
  assert_contains "$content" "[Unit]" "Timer should have [Unit] section"
}

# Test: Timer has Timer section
test_timer_has_timer_section() {
  local content
  content=$(cat "$TIMER_FILE")
  assert_contains "$content" "[Timer]" "Timer should have [Timer] section"
}

# Test: Timer has Install section
test_timer_has_install_section() {
  local content
  content=$(cat "$TIMER_FILE")
  assert_contains "$content" "[Install]" "Timer should have [Install] section"
}

# Test: Timer has boot delay
test_timer_boot_delay() {
  local content
  content=$(cat "$TIMER_FILE")
  assert_contains "$content" "OnBootSec=" "Timer should have boot delay"
}

# Test: Timer has periodic interval
test_timer_interval() {
  local content
  content=$(cat "$TIMER_FILE")
  assert_contains "$content" "OnUnitActiveSec=" "Timer should have periodic interval"
}

# Test: Timer has randomized delay
test_timer_randomized_delay() {
  local content
  content=$(cat "$TIMER_FILE")
  assert_contains "$content" "RandomizedDelaySec=" "Timer should have randomized delay for SD card wear reduction"
}

# Test: Timer is persistent
test_timer_persistent() {
  local content
  content=$(cat "$TIMER_FILE")
  assert_contains "$content" "Persistent=true" "Timer should be persistent to catch up missed runs"
}

# Test: Timer wanted by timers.target
test_timer_wanted_by() {
  local content
  content=$(cat "$TIMER_FILE")
  assert_contains "$content" "WantedBy=timers.target" "Timer should be wanted by timers.target"
}

# Run service tests
run_test "Service file exists" test_service_file_exists
run_test "Service has [Unit] section" test_service_has_unit_section
run_test "Service has [Service] section" test_service_has_service_section
run_test "Service has description" test_service_has_description
run_test "Service waits for network" test_service_after_network
run_test "Service waits for Docker" test_service_after_docker
run_test "Service is oneshot type" test_service_type_oneshot
run_test "Service runs as pi user" test_service_user
run_test "Service has correct working directory" test_service_working_dir
run_test "Service executes update.sh" test_service_exec_start
run_test "Service has low CPU priority" test_service_nice
run_test "Service has idle IO scheduling" test_service_io_scheduling
run_test "Service has memory limit" test_service_memory_limit

# Run timer tests
run_test "Timer file exists" test_timer_file_exists
run_test "Timer has [Unit] section" test_timer_has_unit_section
run_test "Timer has [Timer] section" test_timer_has_timer_section
run_test "Timer has [Install] section" test_timer_has_install_section
run_test "Timer has boot delay" test_timer_boot_delay
run_test "Timer has periodic interval" test_timer_interval
run_test "Timer has randomized delay" test_timer_randomized_delay
run_test "Timer is persistent" test_timer_persistent
run_test "Timer wanted by timers.target" test_timer_wanted_by

print_summary
