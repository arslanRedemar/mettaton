#!/bin/bash

# Run All Shell Script Tests
# 모든 쉘 스크립트 테스트 실행

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo "============================================"
echo "  Mettaton Shell Script Tests"
echo "============================================"
echo ""

TOTAL_PASSED=0
TOTAL_FAILED=0
FAILED_TESTS=""

# Run each test file
for test_file in "$SCRIPT_DIR"/test_*.sh; do
  if [ -f "$test_file" ] && [ "$test_file" != "$SCRIPT_DIR/test_helper.sh" ]; then
    echo ""

    # Run the test and capture output
    output=$(bash "$test_file" 2>&1)
    exit_code=$?

    echo "$output"

    # Parse results from output
    passed=$(echo "$output" | grep -oP 'Passed: \K\d+' | tail -1)
    failed=$(echo "$output" | grep -oP 'Failed: \K\d+' | tail -1)

    if [ -n "$passed" ]; then
      TOTAL_PASSED=$((TOTAL_PASSED + passed))
    fi

    if [ -n "$failed" ] && [ "$failed" -gt 0 ]; then
      TOTAL_FAILED=$((TOTAL_FAILED + failed))
      FAILED_TESTS="$FAILED_TESTS\n  - $(basename "$test_file")"
    fi
  fi
done

# Final summary
echo ""
echo "============================================"
echo "  Final Summary"
echo "============================================"
echo "  Total Passed: $TOTAL_PASSED"
echo "  Total Failed: $TOTAL_FAILED"

if [ $TOTAL_FAILED -gt 0 ]; then
  echo -e "${RED}  Failed test files:${NC}"
  echo -e "$FAILED_TESTS"
  echo "============================================"
  exit 1
else
  echo -e "  ${GREEN}All tests passed!${NC}"
  echo "============================================"
  exit 0
fi
