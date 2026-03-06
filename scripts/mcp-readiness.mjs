#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const strictMode = process.argv.includes('--strict');
const configPath = path.join(os.homedir(), '.codex', 'config.toml');

if (!fs.existsSync(configPath)) {
  console.error(`Codex config not found: ${configPath}`);
  process.exit(1);
}

const source = fs.readFileSync(configPath, 'utf8');
const lines = source.split(/\r?\n/);

const servers = [];
let current = null;

for (const raw of lines) {
  const line = raw.trim();
  const section = line.match(/^\[mcp_servers\.([^\]]+)\]$/);
  if (section) {
    if (current) servers.push(current);
    current = { name: section[1], url: '', command: '', tokenEnv: '' };
    continue;
  }
  if (!current || !line || line.startsWith('#')) continue;

  const kv = line.match(/^([a-zA-Z0-9_]+)\s*=\s*(.+)$/);
  if (!kv) continue;

  const key = kv[1];
  const value = kv[2].replace(/^"/, '').replace(/"$/, '');

  if (key === 'url') current.url = value;
  if (key === 'command') current.command = value;
  if (key === 'bearer_token_env_var') current.tokenEnv = value;
}

if (current) servers.push(current);

const checks = servers.map((s) => {
  const transport = s.url ? 'remote' : s.command ? 'local' : 'unknown';
  const tokenNeeded = Boolean(s.tokenEnv);
  const tokenPresent = tokenNeeded ? Boolean(process.env[s.tokenEnv]) : true;
  const ok = transport !== 'unknown' && tokenPresent;
  return {
    ...s,
    transport,
    tokenNeeded,
    tokenPresent,
    ok,
  };
});

console.log('MCP Readiness');
console.log('=============');
console.log(`Config: ${configPath}`);
console.log('');
for (const c of checks) {
  const status = c.ok ? 'OK' : 'FAIL';
  console.log(`- ${status} ${c.name}`);
  console.log(`  transport: ${c.transport}`);
  if (c.url) console.log(`  url: ${c.url}`);
  if (c.command) console.log(`  command: ${c.command}`);
  if (c.tokenNeeded) {
    console.log(`  token env: ${c.tokenEnv}`);
    console.log(`  token present: ${c.tokenPresent ? 'yes' : 'no'}`);
  }
}

const failures = checks.filter((c) => !c.ok);
if (failures.length > 0) {
  console.log('');
  console.log('Failures:');
  for (const f of failures) {
    if (f.tokenNeeded && !f.tokenPresent) {
      console.log(`- ${f.name}: missing env var ${f.tokenEnv}`);
      continue;
    }
    if (f.transport === 'unknown') {
      console.log(`- ${f.name}: no url or command configured`);
      continue;
    }
    console.log(`- ${f.name}: unresolved configuration issue`);
  }
}

if (strictMode && failures.length > 0) {
  process.exit(1);
}

