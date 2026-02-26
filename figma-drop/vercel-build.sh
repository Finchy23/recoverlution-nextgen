#!/bin/sh
set -eu

ROOT_DIR="$(pwd)"
APP_DIR=""

if [ -f package.json ] && [ -d src ]; then
  APP_DIR="."
elif [ -f "Command Center Execution Plan/package.json" ]; then
  APP_DIR="Command Center Execution Plan"
elif [ -f "figma-drop/Command Center Execution Plan/package.json" ]; then
  APP_DIR="figma-drop/Command Center Execution Plan"
else
  echo "No build target found" >&2
  exit 1
fi

if [ "$APP_DIR" = "." ]; then
  npm run build
  exit 0
fi

cd "$APP_DIR"
npm run build

rm -rf "$ROOT_DIR/dist"
mkdir -p "$ROOT_DIR/dist"
cp -R "$ROOT_DIR/$APP_DIR/dist/." "$ROOT_DIR/dist/"
