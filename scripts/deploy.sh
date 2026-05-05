#!/usr/bin/env bash
# Deployment is handled by Vercel via Git push to main.
# Run this script to trigger a manual deploy via the Vercel CLI.
set -euo pipefail

if ! command -v vercel &>/dev/null; then
  echo "Vercel CLI not found. Install it: npm i -g vercel"
  exit 1
fi

cd "$(dirname "$0")/../frontend"
vercel --prod
