#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../frontend"

echo "Type-checking..."
npx tsc --noEmit

echo "Building..."
npm run build

echo "Build output: frontend/dist/"
