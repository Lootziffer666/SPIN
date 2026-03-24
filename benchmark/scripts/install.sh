#!/usr/bin/env bash
set -euo pipefail

# SPIN Evaluation Lab - install/bootstrap (macOS/Linux)
# - installs node deps
# - bootstraps required folders + example artifact

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/4] Checking Node..."
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Install Node 18+ and retry."
  exit 1
fi
NODE_VER="$(node -v | sed 's/^v//')"
echo "Node version: v$NODE_VER"

echo "[2/4] Installing dependencies..."
npm install

echo "[3/4] Bootstrapping folders + example artifact..."
node scripts/bootstrap_folders.mjs --force

echo "[4/4] Done."
echo "Next:"
echo "  - Start UI: npm run dev"
echo "  - Run a private benchmark: npm run bench -- --artifact private/_inbox/artifact.json --out private/runs"
echo "  - Start auto-tweak: npm run tweak -- --minutes 10 --artifact private/_inbox/artifact.json"
echo "  - Start runner: npm run runner"
