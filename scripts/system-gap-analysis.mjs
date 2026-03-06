#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const designCenterDir = path.join(rootDir, 'apps/design-center');
const strictMode = process.argv.includes('--strict');

const SEVERITY_ORDER = { critical: 0, major: 1, minor: 2 };

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function exists(relPath) {
  return fs.existsSync(path.join(rootDir, relPath));
}

function readIfExists(relPath) {
  const full = path.join(rootDir, relPath);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
}

function parseLabWindow() {
  const labDir = path.join(rootDir, 'Command Center Execution Plan/src/app/data/lab');
  const pattern = /^atomicLibrarySeries32_(\d+)_(\d+)\.ts$/;
  if (!fs.existsSync(labDir)) {
    return { ok: false, reason: 'lab directory missing', files: 0, count: 0 };
  }

  const files = fs.readdirSync(labDir).filter((f) => pattern.test(f));
  let cueCount = 0;
  for (const file of files) {
    const source = fs.readFileSync(path.join(labDir, file), 'utf8');
    cueCount += [...source.matchAll(/\bcue\s*:\s*(\d+)\s*,/g)].length;
  }

  return {
    ok: files.length === 10 && cueCount === 1000,
    reason: `found ${files.length} active files and ${cueCount} cues`,
    files: files.length,
    count: cueCount,
  };
}

function run() {
  const checks = [];

  const rootPkgPath = path.join(rootDir, 'package.json');
  const designCenterPkgPath = path.join(designCenterDir, 'package.json');
  const rootPkg = fs.existsSync(rootPkgPath) ? readJson(rootPkgPath) : null;
  const designCenterPkg = fs.existsSync(designCenterPkgPath) ? readJson(designCenterPkgPath) : null;

  const add = (id, area, title, ok, severity, remediation, evidence) => {
    checks.push({ id, area, title, ok, severity, remediation, evidence });
  };

  add(
    'governance_ssot_manifest',
    'Governance',
    'SSOT manifest exists',
    exists('system/source-of-truth.manifest.json'),
    'critical',
    'Create and maintain a canonical source-of-truth manifest for cross-domain ownership.',
    'system/source-of-truth.manifest.json',
  );

  add(
    'governance_ssot_guard',
    'Governance',
    'SSOT guard script exists',
    exists('scripts/ssot-guard.sh'),
    'critical',
    'Add guard script to block derived-only edits and duplicate canonical ownership.',
    'scripts/ssot-guard.sh',
  );

  add(
    'delivery_pr_gate',
    'Delivery QA',
    'PR gate workflow exists',
    exists('.github/workflows/navicue-pr-gate.yml'),
    'major',
    'Add a PR workflow to run build + QA scripts before merge.',
    '.github/workflows/navicue-pr-gate.yml',
  );

  add(
    'delivery_nightly',
    'Delivery QA',
    'Nightly QA workflow exists',
    exists('.github/workflows/navicue-nightly-qa.yml'),
    'major',
    'Add nightly QA drift checks with artifact reports.',
    '.github/workflows/navicue-nightly-qa.yml',
  );

  add(
    'dev_precommit_hook',
    'Developer Experience',
    'Pre-commit hook exists',
    exists('.githooks/pre-commit'),
    'minor',
    'Add a local pre-commit hook for staged formatting and contract checks.',
    '.githooks/pre-commit',
  );

  add(
    'design_prettier_config',
    'Design System Ops',
    'Prettier config in Design Center',
    exists('apps/design-center/.prettierrc.json'),
    'minor',
    'Add a local formatter baseline to keep token/system files consistent.',
    'apps/design-center/.prettierrc.json',
  );

  const rootScripts = rootPkg?.scripts ?? {};
  add(
    'root_release_scripts',
    'Governance',
    'Root scripts include readiness + qa + hooks installer',
    ['readiness', 'qa', 'hooks:install'].every((key) => Boolean(rootScripts[key])),
    'major',
    'Expose standardized root scripts so release and QA are one-command actions.',
    'package.json scripts: readiness, qa, hooks:install',
  );

  const ccScripts = designCenterPkg?.scripts ?? {};
  add(
    'design_center_quality_scripts',
    'Delivery QA',
    'Design Center has quality scripts',
    ['tokens:export', 'figma:handoff', 'lint', 'qa', 'ship:check'].every(
      (key) => Boolean(ccScripts[key]),
    ),
    'critical',
    'Define explicit quality scripts for the live design-system review surface.',
    'apps/design-center/package.json scripts',
  );

  const labWindow = parseLabWindow();
  add(
    'content_active_window',
    'Content Pipeline',
    'Active Lab window is structurally complete (4001-5000)',
    labWindow.ok,
    'major',
    'Keep active lab in contiguous chunks and keep metadata in sync with served range.',
    labWindow.reason,
  );

  add(
    'design_token_export',
    'Design System Ops',
    'Design Center token export is present',
    exists('apps/design-center/tokens/design-tokens.flat.json'),
    'major',
    'Generate and commit token exports used by downstream design tooling and review flows.',
    'apps/design-center/tokens/design-tokens.flat.json',
  );

  add(
    'release_runbook',
    'Release Management',
    'Vercel release runbook exists',
    exists('docs/runbooks/VERCEL_RELEASE_RUNBOOK.md'),
    'minor',
    'Maintain one release runbook with gates and rollback procedure.',
    'docs/runbooks/VERCEL_RELEASE_RUNBOOK.md',
  );

  add(
    'account_readiness_script',
    'Governance',
    'Account readiness gate script exists',
    exists('scripts/account-readiness.mjs'),
    'major',
    'Add a single account-readiness script to validate integration keys before release.',
    'scripts/account-readiness.mjs',
  );

  const observabilityMain = readIfExists('apps/design-center/src/main.tsx') || '';
  const observabilityInitWired = /initializeObservability/.test(observabilityMain);
  const posthogModule = readIfExists('apps/design-center/src/app/observability/posthog.ts');
  const sentryModule = readIfExists('apps/design-center/src/app/observability/sentry.ts');
  const eventTaxonomyModule = readIfExists(
    'apps/design-center/src/app/observability/events.ts',
  );

  const posthogConfigured =
    observabilityInitWired &&
    Boolean(posthogModule) &&
    /posthog\.init|posthog/i.test(posthogModule);

  add(
    'observability_posthog_hook',
    'Observability',
    'PostHog integration module + startup wiring detected',
    posthogConfigured,
    'major',
    'Wire PostHog in app entrypoint and document core event taxonomy.',
    'apps/design-center/src/main.tsx + src/app/observability/posthog.ts',
  );

  const sentryConfigured =
    observabilityInitWired &&
    Boolean(sentryModule) &&
    /Sentry\.init|sentry/i.test(sentryModule);

  add(
    'observability_sentry_hook',
    'Observability',
    'Sentry integration module + startup wiring detected',
    sentryConfigured,
    'major',
    'Initialize Sentry in app entrypoint for frontend crash triage.',
    'apps/design-center/src/main.tsx + src/app/observability/sentry.ts',
  );

  add(
    'observability_event_taxonomy',
    'Observability',
    'Event taxonomy module exists',
    Boolean(eventTaxonomyModule) && /OBS_EVENTS/.test(eventTaxonomyModule),
    'minor',
    'Create a centralized event taxonomy and shared event helpers.',
    'apps/design-center/src/app/observability/events.ts',
  );

  add(
    'observability_env_contract',
    'Observability',
    'Observability env contract documented',
    exists('apps/design-center/.env.example') &&
      exists('docs/runbooks/OBSERVABILITY_SETUP.md'),
    'minor',
    'Document required VITE_* observability keys and onboarding steps.',
    'apps/design-center/.env.example + docs/runbooks/OBSERVABILITY_SETUP.md',
  );

  add(
    'integration_modules_present',
    'Platform Integrations',
    'OneSignal + Stripe + JW Player integration modules exist',
    exists('apps/design-center/src/app/integrations/onesignal.ts') &&
      exists('apps/design-center/src/app/integrations/stripe.ts') &&
      exists('apps/design-center/src/app/integrations/jwplayer.ts'),
    'minor',
    'Create shared integration modules so notifications and billing stay modular.',
    'apps/design-center/src/app/integrations/onesignal.ts + src/app/integrations/stripe.ts + src/app/integrations/jwplayer.ts',
  );

  const failures = checks.filter((c) => !c.ok);
  const bySeverity = {
    critical: failures.filter((f) => f.severity === 'critical').length,
    major: failures.filter((f) => f.severity === 'major').length,
    minor: failures.filter((f) => f.severity === 'minor').length,
  };

  const score = Math.round(((checks.length - failures.length) / checks.length) * 100);

  const sorted = [...checks].sort((a, b) => {
    if (a.ok !== b.ok) return a.ok ? 1 : -1;
    if (a.severity !== b.severity) {
      return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    }
    return a.area.localeCompare(b.area);
  });

  const now = new Date().toISOString();
  const reportJson = {
    generated_at: now,
    strict_mode: strictMode,
    score,
    totals: {
      checks: checks.length,
      passed: checks.length - failures.length,
      failed: failures.length,
      by_severity: bySeverity,
    },
    checks: sorted,
  };

  const reportDir = path.join(rootDir, 'docs/reports');
  fs.mkdirSync(reportDir, { recursive: true });

  const jsonPath = path.join(reportDir, 'system-gap-analysis.json');
  fs.writeFileSync(jsonPath, `${JSON.stringify(reportJson, null, 2)}\n`, 'utf8');

  const tableLines = sorted.map((c) => {
    const status = c.ok ? 'PASS' : 'FAIL';
    return `| ${status} | ${c.severity} | ${c.area} | ${c.title} | ${c.evidence} |`;
  });

  const markdown = [
    '# System Gap Analysis',
    '',
    `Generated: ${now}`,
    '',
    `- Score: **${score}**`,
    `- Checks: **${checks.length}**`,
    `- Failed: **${failures.length}** (critical: ${bySeverity.critical}, major: ${bySeverity.major}, minor: ${bySeverity.minor})`,
    '',
    '## Results',
    '',
    '| Status | Severity | Area | Check | Evidence |',
    '|---|---|---|---|---|',
    ...tableLines,
    '',
    '## Priority Actions',
    '',
    ...(failures.length
      ? failures
          .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
          .map((f, i) => `${i + 1}. [${f.severity}] ${f.title} -- ${f.remediation}`)
      : ['1. No open gaps detected in this baseline.']),
    '',
  ].join('\n');

  const markdownPath = path.join(reportDir, 'system-gap-analysis.md');
  fs.writeFileSync(markdownPath, markdown, 'utf8');

  console.log(`System gap analysis score: ${score}`);
  console.log(`Report: ${path.relative(rootDir, markdownPath)}`);
  console.log(`Data:   ${path.relative(rootDir, jsonPath)}`);

  if (strictMode && bySeverity.critical > 0) {
    process.exit(1);
  }
}

run();
