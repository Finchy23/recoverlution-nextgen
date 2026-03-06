#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESIGN_CENTER_DIR="$ROOT_DIR/apps/design-center"

"$ROOT_DIR/scripts/ssot-guard.sh"

if [[ -d "$DESIGN_CENTER_DIR" ]]; then
  echo "Running Design Center ship check..."
  (
    cd "$DESIGN_CENTER_DIR"
    NPM_BIN=""
    if command -v npm >/dev/null 2>&1; then
      NPM_BIN="$(command -v npm)"
    elif [[ -x "$HOME/.nvm/versions/node/v24.14.0/bin/npm" ]]; then
      NPM_BIN="$HOME/.nvm/versions/node/v24.14.0/bin/npm"
    fi

    if [[ -z "$NPM_BIN" ]]; then
      echo "Readiness check failed: npm not found in PATH (and fallback binary missing)"
      exit 1
    fi

    NPM_DIR="$(dirname "$NPM_BIN")"
    export PATH="$NPM_DIR:$PATH"

    "$NPM_BIN" run -s ship:check
  )
else
  echo "Readiness check failed: Design Center directory missing"
  exit 1
fi

if command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI detected"
else
  echo "Vercel CLI not found (install with: npm i -g vercel)"
fi

echo "Platform readiness check completed."
