#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'apps/design-center');

const strictMode = process.argv.includes('--strict');

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

const env = resolveEnv();

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

const integrationMatrix = [
  {
    id: 'supabase',
    area: 'Core Data + Auth',
    required: true,
    keys: ['VITE_SUPABASE_PROJECT_ID', 'VITE_SUPABASE_ANON_KEY'],
  },
  {
    id: 'posthog',
    area: 'Analytics',
    required: true,
    keys: ['VITE_POSTHOG_KEY', 'VITE_POSTHOG_HOST'],
  },
  {
    id: 'sentry',
    area: 'Error Monitoring',
    required: true,
    keys: ['VITE_SENTRY_DSN'],
  },
  {
    id: 'onesignal',
    area: 'Push Notifications',
    required: true,
    keys: ['VITE_ONESIGNAL_APP_ID'],
  },
  {
    id: 'stripe',
    area: 'Billing',
    required: true,
    keys: ['VITE_STRIPE_PUBLISHABLE_KEY'],
  },
  {
    id: 'jwplayer',
    area: 'Wellbeing Video',
    required: true,
    keys: ['VITE_JWPLAYER_LIBRARY_ID'],
  },
  {
    id: 'revenuecat_mobile',
    area: 'Mobile Subscriptions',
    required: false,
    keys: ['REVENUECAT_PUBLIC_API_KEY_IOS', 'REVENUECAT_PUBLIC_API_KEY_ANDROID'],
  },
];

function maskValue(value = '') {
  if (!value) return '';
  if (value.length <= 8) return '***';
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

const rows = integrationMatrix.map((integration) => {
  const keyStatus = integration.keys.map((key) => {
    const value = env[key] || '';
    const valid = isValidKeyValue(key, value);
    return {
      key,
      present: Boolean(value),
      valid,
      valuePreview: maskValue(value),
    };
  });

  const missing = keyStatus.filter((k) => !k.valid).map((k) => k.key);
  const invalid = keyStatus.filter((k) => k.present && !k.valid).map((k) => k.key);
  const connected = missing.length === 0;

  return {
    ...integration,
    connected,
    missing,
    invalid,
    keyStatus,
  };
});

const requiredFailures = rows.filter((r) => r.required && !r.connected);
const optionalFailures = rows.filter((r) => !r.required && !r.connected);

const score = Math.round(((rows.length - requiredFailures.length) / rows.length) * 100);

const report = {
  generated_at: new Date().toISOString(),
  strict_mode: strictMode,
  score,
  totals: {
    integrations: rows.length,
    connected: rows.filter((r) => r.connected).length,
    required_failures: requiredFailures.length,
    optional_failures: optionalFailures.length,
  },
  integrations: rows,
};

const reportsDir = path.join(rootDir, 'docs/reports');
fs.mkdirSync(reportsDir, { recursive: true });

const jsonPath = path.join(reportsDir, 'account-readiness.json');
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

const markdown = [
  '# Account Readiness',
  '',
  `Generated: ${report.generated_at}`,
  '',
  `- Score: **${score}**`,
  `- Integrations: **${report.totals.integrations}**`,
  `- Connected: **${report.totals.connected}**`,
  `- Required failures: **${report.totals.required_failures}**`,
  `- Optional failures: **${report.totals.optional_failures}**`,
  '',
  '| Integration | Area | Required | Status | Missing Keys |',
  '|---|---|---|---|---|',
  ...rows.map((r) => {
    const status = r.connected ? 'CONNECTED' : 'MISSING';
    const missing = r.missing.length ? r.missing.join(', ') : '-';
    return `| ${r.id} | ${r.area} | ${r.required ? 'yes' : 'no'} | ${status} | ${missing} |`;
  }),
  '',
  '## Key Presence (masked)',
  '',
  ...rows.flatMap((r) => [
    `### ${r.id}`,
    ...r.keyStatus.map((k) => {
      if (!k.present) return `- ${k.key}: missing`;
      if (!k.valid) return `- ${k.key}: invalid/placeholder (${k.valuePreview})`;
      return `- ${k.key}: set (${k.valuePreview})`;
    }),
    '',
  ]),
].join('\n');

const mdPath = path.join(reportsDir, 'account-readiness.md');
fs.writeFileSync(mdPath, markdown, 'utf8');

console.log(`Account readiness score: ${score}`);
console.log(`Report: ${path.relative(rootDir, mdPath)}`);
console.log(`Data:   ${path.relative(rootDir, jsonPath)}`);

if (strictMode && requiredFailures.length > 0) {
  process.exit(1);
}
