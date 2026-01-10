#!/usr/bin/env bash
# Build jfp CLI binary for current platform
#
# Usage: ./scripts/build-cli.sh [--output PATH]
#
# This script uses Bun to compile jfp.ts into a single executable
# for the current platform.

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default output
OUTPUT="./jfp"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --output|-o)
      OUTPUT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}Building jfp CLI...${NC}"

# Build with Bun
bun build --compile ./jfp.ts --outfile "$OUTPUT"

# Make executable
chmod +x "$OUTPUT"

# Show result
SIZE=$(du -h "$OUTPUT" | cut -f1)
echo -e "${GREEN}✓ Built: $OUTPUT ($SIZE)${NC}"

# Show version
"$OUTPUT" --version
