#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const out = {
    strict: false,
    dryRun: false,
    includeOptional: false,
    previewBranch: '',
    appDir: 'apps/design-center',
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--strict') out.strict = true;
    else if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--include-optional') out.includeOptional = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
    else if (arg.startsWith('--preview-branch=')) out.previewBranch = arg.split('=')[1] || '';
    else if (arg === '--preview-branch') out.previewBranch = argv[i + 1] || '';
    else if (arg.startsWith('--app-dir=')) out.appDir = arg.split('=')[1] || out.appDir;
    else if (arg === '--app-dir') out.appDir = argv[i + 1] || out.appDir;
    if (arg === '--preview-branch') i += 1;
    if (arg === '--app-dir') i += 1;
  }

  return out;
}

function printHelp() {
  console.log('Vercel Account Sync');
  console.log('');
  console.log('Usage: node scripts/vercel-account-sync.mjs [options]');
  console.log('');
  console.log('Options:');
  console.log('  --strict            Fail if any required keys are missing');
  console.log('  --dry-run           Print plan without calling Vercel');
  console.log('  --include-optional  Also sync optional keys');
  console.log('  --preview-branch X  Also sync preview vars for branch X');
  console.log('  --app-dir PATH      App directory to sync (default: apps/design-center)');
  console.log('  -h, --help          Show help');
}

function parseDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const source = fs.readFileSync(filePath, 'utf8');
  const out = {};

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    out[key] = value;
  }

  return out;
}

function resolveEnv() {
  const layers = [
    parseDotEnv(path.join(appDir, '.env.example')),
    parseDotEnv(path.join(appDir, '.env')),
    parseDotEnv(path.join(appDir, '.env.local')),
    process.env,
  ];
  return Object.assign({}, ...layers);
}

function maskValue(value = '') {
  if (!value) return '';
  if (value.length <= 8) return '***';
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

function isPlaceholder(value = '') {
  const normalized = value.trim().toLowerCase();
  return (
    !normalized ||
    normalized === '...' ||
    normalized === 'tbd' ||
    normalized === 'todo' ||
    normalized === 'replace_me' ||
    normalized === 'changeme' ||
    normalized === 'null' ||
    normalized === 'undefined'
  );
}

const validators = {
  VITE_SUPABASE_PROJECT_ID: (v) => /^[a-z0-9]{20}$/i.test(v.trim()),
  VITE_SUPABASE_ANON_KEY: (v) => /^eyJ/.test(v.trim()),
  VITE_POSTHOG_KEY: (v) => /^phc_/i.test(v.trim()),
  VITE_POSTHOG_HOST: (v) => /^https?:\/\//i.test(v.trim()),
  VITE_SENTRY_DSN: (v) => /^https:\/\/.+/i.test(v.trim()) && /sentry/i.test(v.trim()),
  VITE_ONESIGNAL_APP_ID: (v) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.trim()),
  VITE_STRIPE_PUBLISHABLE_KEY: (v) => /^pk_(live|test)_/i.test(v.trim()),
  VITE_JWPLAYER_LIBRARY_ID: (v) => /^[A-Za-z0-9_-]{6,}$/.test(v.trim()),
  REVENUECAT_PUBLIC_API_KEY_IOS: (v) => /^(appl_|test_)/i.test(v.trim()),
  REVENUECAT_PUBLIC_API_KEY_ANDROID: (v) => /^(goog_|test_)/i.test(v.trim()),
};

function isValidKeyValue(key, value = '') {
  if (isPlaceholder(value)) return false;
  const validator = validators[key];
  if (!validator) return true;
  return validator(value);
}

function run(cmd, args, cwd) {
  return spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
  printHelp();
  process.exit(0);
}
const appDir = path.resolve(rootDir, options.appDir);

if (!fs.existsSync(appDir) || !fs.statSync(appDir).isDirectory()) {
  console.error(`App directory not found: ${path.relative(rootDir, appDir)}`);
  process.exit(1);
}

const env = resolveEnv();

const integrations = [
  {
    id: 'supabase',
    required: true,
    keys: ['VITE_SUPABASE_PROJECT_ID', 'VITE_SUPABASE_ANON_KEY'],
  },
  {
    id: 'posthog',
    required: true,
    keys: ['VITE_POSTHOG_KEY', 'VITE_POSTHOG_HOST'],
  },
  {
    id: 'sentry',
    required: true,
    keys: ['VITE_SENTRY_DSN'],
  },
  {
    id: 'onesignal',
    required: true,
    keys: ['VITE_ONESIGNAL_APP_ID'],
  },
  {
    id: 'stripe',
    required: true,
    keys: ['VITE_STRIPE_PUBLISHABLE_KEY'],
  },
  {
    id: 'jwplayer',
    required: true,
    keys: ['VITE_JWPLAYER_LIBRARY_ID'],
  },
  {
    id: 'revenuecat_mobile',
    required: false,
    keys: ['REVENUECAT_PUBLIC_API_KEY_IOS', 'REVENUECAT_PUBLIC_API_KEY_ANDROID'],
  },
];

const selected = integrations.filter((it) => options.includeOptional || it.required);
const rows = selected.map((it) => {
  const keyStatus = it.keys.map((key) => ({
    key,
    value: env[key] || '',
    valid: isValidKeyValue(key, env[key] || ''),
  }));
  return {
    ...it,
    keyStatus,
    missing: keyStatus.filter((k) => !k.valid).map((k) => k.key),
  };
});

const requiredMissing = rows
  .filter((r) => r.required)
  .flatMap((r) => r.missing.map((m) => ({ integration: r.id, key: m })));

console.log('Account sync plan:');
console.log(`Target app dir: ${path.relative(rootDir, appDir)}`);
for (const row of rows) {
  for (const ks of row.keyStatus) {
    const state = ks.valid
      ? `set (${maskValue(ks.value)})`
      : ks.value
      ? `invalid/placeholder (${maskValue(ks.value)})`
      : 'missing';
    console.log(`- ${row.id}: ${ks.key} => ${state}`);
  }
}

if (requiredMissing.length > 0) {
  console.log('');
  console.log('Required keys missing:');
  for (const miss of requiredMissing) {
    console.log(`- ${miss.integration}: ${miss.key}`);
  }
  if (options.strict) {
    process.exit(1);
  }
}

const auth = run('npx', ['vercel', 'whoami'], appDir);
if (auth.status !== 0) {
  console.error('Vercel auth check failed. Run `npx vercel login` in app folder.');
  process.exit(1);
}

const targets = [
  { env: 'development', branch: '' },
  { env: 'production', branch: '' },
];

if (options.previewBranch) {
  targets.push({ env: 'preview', branch: options.previewBranch });
}

if (!options.previewBranch) {
  console.log('');
  console.log(
    'Preview not synced in non-interactive mode. To sync preview, re-run with --preview-branch <branch-name>.',
  );
}

const results = [];

for (const row of rows) {
  for (const ks of row.keyStatus) {
    if (!ks.valid) continue;

    for (const target of targets) {
      const args = ['vercel', 'env', 'add', ks.key, target.env];
      if (target.branch) args.push(target.branch);
      args.push('--value', ks.value, '--yes', '--force');

      if (options.dryRun) {
        results.push({
          key: ks.key,
          env: target.env,
          branch: target.branch || '-',
          status: 'DRY_RUN',
        });
        continue;
      }

      const res = run('npx', args, appDir);
      if (res.status === 0) {
        results.push({
          key: ks.key,
          env: target.env,
          branch: target.branch || '-',
          status: 'SYNCED',
        });
      } else {
        results.push({
          key: ks.key,
          env: target.env,
          branch: target.branch || '-',
          status: 'FAILED',
          error: (res.stderr || res.stdout || '').trim(),
        });
      }
    }
  }
}

console.log('');
console.log('Sync summary:');
for (const row of results) {
  console.log(`- ${row.status}: ${row.key} -> ${row.env}${row.branch !== '-' ? ` (${row.branch})` : ''}`);
  if (row.status === 'FAILED' && row.error) {
    console.log(`  ${row.error.split('\n')[0]}`);
  }
}

const failures = results.filter((r) => r.status === 'FAILED');
if (failures.length > 0) {
  process.exit(1);
}
