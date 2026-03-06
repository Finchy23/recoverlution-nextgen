#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="$ROOT_DIR/system/source-of-truth.manifest.json"

if [[ ! -f "$MANIFEST" ]]; then
  echo "SSOT guard failed: manifest missing at $MANIFEST"
  exit 1
fi

NODE_BIN=""
if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
elif [[ -x "$HOME/.nvm/versions/node/v24.14.0/bin/node" ]]; then
  NODE_BIN="$HOME/.nvm/versions/node/v24.14.0/bin/node"
fi

if [[ -z "$NODE_BIN" ]]; then
  echo "SSOT guard failed: node is required but not found in PATH (and fallback binary missing)"
  exit 1
fi

"$NODE_BIN" - "$ROOT_DIR" "$MANIFEST" <<'NODE'
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = process.argv[2];
const manifestPath = process.argv[3];
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

let failures = 0;

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

const canonicalSeen = new Map();

for (const domain of manifest.domains || []) {
  for (const p of domain.canonical || []) {
    if (!exists(p)) {
      console.error(`[FAIL] Missing canonical path for domain '${domain.name}': ${p}`);
      failures += 1;
    }
    if (!canonicalSeen.has(p)) canonicalSeen.set(p, []);
    canonicalSeen.get(p).push(domain.name);
  }
  for (const p of domain.derived || []) {
    if (!exists(p)) {
      console.error(`[FAIL] Missing derived path for domain '${domain.name}': ${p}`);
      failures += 1;
    }
  }
}

for (const [p, domains] of canonicalSeen.entries()) {
  if (domains.length > 1) {
    console.error(`[FAIL] Canonical path appears in multiple domains: ${p} -> ${domains.join(', ')}`);
    failures += 1;
  }
}

function getChangedFiles() {
  try {
    const hasHead = cp.execSync('git rev-parse --verify HEAD >/dev/null 2>&1; echo $?', { cwd: root, encoding: 'utf8' }).trim() === '0';

    const unstaged = cp.execSync('git diff --name-only', { cwd: root, encoding: 'utf8' })
      .split('\n').map(s => s.trim()).filter(Boolean);
    const staged = cp.execSync('git diff --name-only --cached', { cwd: root, encoding: 'utf8' })
      .split('\n').map(s => s.trim()).filter(Boolean);
    const untracked = cp.execSync('git ls-files --others --exclude-standard', { cwd: root, encoding: 'utf8' })
      .split('\n').map(s => s.trim()).filter(Boolean);

    let committedDelta = [];
    if (hasHead) {
      committedDelta = cp.execSync('git diff --name-only HEAD', { cwd: root, encoding: 'utf8' })
        .split('\n').map(s => s.trim()).filter(Boolean);
    }

    return Array.from(new Set([...unstaged, ...staged, ...committedDelta, ...untracked]));
  } catch {
    return [];
  }
}

const changed = new Set(getChangedFiles());

for (const domain of manifest.domains || []) {
  const canonical = domain.canonical || [];
  const derived = domain.derived || [];
  if (canonical.length === 0 || derived.length === 0) continue;

  const canonicalChanged = canonical.some(p => changed.has(p) || Array.from(changed).some(c => c.startsWith(p.endsWith('/') ? p : `${p}/`)));
  const derivedChanged = derived.some(p => changed.has(p) || Array.from(changed).some(c => c.startsWith(p.endsWith('/') ? p : `${p}/`)));

  if (derivedChanged && !canonicalChanged) {
    console.error(`[FAIL] Derived changes without canonical update in domain '${domain.name}'`);
    console.error(`       Canonical: ${canonical.join(', ')}`);
    console.error(`       Derived:   ${derived.join(', ')}`);
    failures += 1;
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log('SSOT guard passed. Canonical and derived integrity checks succeeded.');
NODE
