#!/bin/sh
set -eu

if [ -f package.json ]; then
  npm install
elif [ -f "Command Center Execution Plan/package.json" ]; then
  cd "Command Center Execution Plan"
  npm install
elif [ -f "figma-drop/Command Center Execution Plan/package.json" ]; then
  cd "figma-drop/Command Center Execution Plan"
  npm install
else
  echo "No package.json found for Vercel install" >&2
  exit 1
fi
