#!/usr/bin/env bash
# No test suite yet. Runs the TypeScript compiler and linter as a proxy.
set -euo pipefail

cd "$(dirname "$0")/../frontend"

echo "Type check..."
npx tsc --noEmit

echo "Lint..."
npm run lint

echo "All checks passed."
