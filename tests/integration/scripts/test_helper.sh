#!/bin/bash

# Test Helper Functions
# 테스트 헬퍼 함수들

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Setup test environment
setup_test_env() {
  TEST_DIR=$(mktemp -d)
  export PROJECT_DIR="$TEST_DIR/mettaton"
  mkdir -p "$PROJECT_DIR/scripts"
  mkdir -p "$PROJECT_DIR/data"

  # Create mock bin directory
  MOCK_BIN="$TEST_DIR/mock_bin"
  mkdir -p "$MOCK_BIN"
  export PATH="$MOCK_BIN:$PATH"
}

# Cleanup test environment
cleanup_test_env() {
  if [ -n "$TEST_DIR" ] && [ -d "$TEST_DIR" ]; then
    rm -rf "$TEST_DIR"
  fi
}

# Create mock command
create_mock() {
  local cmd_name="$1"
  local exit_code="${2:-0}"
  local output="${3:-}"

  cat > "$MOCK_BIN/$cmd_name" << EOF
#!/bin/bash
echo "$output"
exit $exit_code
EOF
  chmod +x "$MOCK_BIN/$cmd_name"
}

# Assert equals
assert_equals() {
  local expected="$1"
  local actual="$2"
  local message="${3:-Values should be equal}"

  if [ "$expected" = "$actual" ]; then
    return 0
  else
    echo -e "${RED}FAIL: $message${NC}"
    echo "  Expected: $expected"
    echo "  Actual:   $actual"
    return 1
  fi
}

# Assert file exists
assert_file_exists() {
  local file="$1"
  local message="${2:-File should exist}"

  if [ -f "$file" ]; then
    return 0
  else
    echo -e "${RED}FAIL: $message${NC}"
    echo "  File not found: $file"
    return 1
  fi
}

# Assert directory exists
assert_dir_exists() {
  local dir="$1"
  local message="${2:-Directory should exist}"

  if [ -d "$dir" ]; then
    return 0
  else
    echo -e "${RED}FAIL: $message${NC}"
    echo "  Directory not found: $dir"
    return 1
  fi
}

# Assert command exists
assert_command_exists() {
  local cmd="$1"
  local message="${2:-Command should exist}"

  if command -v "$cmd" &> /dev/null; then
    return 0
  else
    echo -e "${RED}FAIL: $message${NC}"
    echo "  Command not found: $cmd"
    return 1
  fi
}

# Assert exit code
assert_exit_code() {
  local expected="$1"
  local actual="$2"
  local message="${3:-Exit code should match}"

  if [ "$expected" -eq "$actual" ]; then
    return 0
  else
    echo -e "${RED}FAIL: $message${NC}"
    echo "  Expected exit code: $expected"
    echo "  Actual exit code:   $actual"
    return 1
  fi
}

# Assert string contains
assert_contains() {
  local haystack="$1"
  local needle="$2"
  local message="${3:-String should contain substring}"

  if [[ "$haystack" == *"$needle"* ]]; then
    return 0
  else
    echo -e "${RED}FAIL: $message${NC}"
    echo "  String: $haystack"
    echo "  Should contain: $needle"
    return 1
  fi
}

# Run a test
run_test() {
  local test_name="$1"
  local test_func="$2"

  TESTS_RUN=$((TESTS_RUN + 1))

  echo -n "  Testing: $test_name ... "

  # Run setup if exists
  if declare -f setup &> /dev/null; then
    setup
  fi

  # Run test
  if $test_func; then
    echo -e "${GREEN}PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi

  # Run teardown if exists
  if declare -f teardown &> /dev/null; then
    teardown
  fi
}

# Print test summary
print_summary() {
  echo ""
  echo "=========================================="
  echo "  Test Summary"
  echo "=========================================="
  echo "  Total:  $TESTS_RUN"
  echo -e "  ${GREEN}Passed: $TESTS_PASSED${NC}"
  if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "  ${RED}Failed: $TESTS_FAILED${NC}"
  else
    echo "  Failed: $TESTS_FAILED"
  fi
  echo "=========================================="

  if [ $TESTS_FAILED -gt 0 ]; then
    return 1
  fi
  return 0
}
