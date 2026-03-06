#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const strictMode = process.argv.includes('--strict');

const checks = [];

function run(cmd, args, cwd = rootDir) {
  return spawnSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function exists(relPath) {
  return fs.existsSync(path.join(rootDir, relPath));
}

function add(id, area, title, ok, severity, remediation, evidence) {
  checks.push({ id, area, title, ok, severity, remediation, evidence });
}

const nodeVersion = process.version;
const majorNode = Number((nodeVersion.match(/^v(\d+)/) || [0, 0])[1]);

add(
  'node_runtime',
  'Local Toolchain',
  'Node runtime >= 20',
  majorNode >= 20,
  'critical',
  'Install Node 20+ and retry readiness checks.',
  `node=${nodeVersion}`,
);

const npmCheck = run('npm', ['--version']);
add(
  'npm_available',
  'Local Toolchain',
  'npm command available',
  npmCheck.status === 0,
  'critical',
  'Install npm and ensure it is available in PATH.',
  npmCheck.status === 0 ? `npm=${npmCheck.stdout.trim()}` : (npmCheck.stderr || 'missing'),
);

const gitRemote = run('git', ['remote', '-v']).stdout.trim();
add(
  'git_remote',
  'Repo Topology',
  'Git remote configured',
  Boolean(gitRemote),
  'major',
  'Configure origin remote to enable push/PR workflow.',
  gitRemote || 'none',
);

add(
  'workstream_script',
  'Branch Workflow',
  'Workstream branch bootstrap script exists',
  exists('scripts/create-workstream-branch.mjs'),
  'major',
  'Add branch/workstream automation for consistent parallel delivery.',
  'scripts/create-workstream-branch.mjs',
);

add(
  'account_sync_script',
  'Release Infrastructure',
  'Vercel account sync script exists',
  exists('scripts/vercel-account-sync.mjs'),
  'major',
  'Add deterministic env sync script for deployment keys.',
  'scripts/vercel-account-sync.mjs',
);

add(
  'vercel_registry',
  'Release Infrastructure',
  'Vercel project registry + topology script exist',
  exists('infra/vercel/project-registry.json') && exists('scripts/vercel-topology.mjs'),
  'major',
  'Add a project registry and topology checker for multi-project Vercel operations.',
  'infra/vercel/project-registry.json',
);

add(
  'release_workflows',
  'Release Infrastructure',
  'GitHub quality/release workflows exist',
  exists('.github/workflows/navicue-pr-gate.yml') &&
    exists('.github/workflows/navicue-nightly-qa.yml') &&
    exists('.github/workflows/release-gate.yml'),
  'major',
  'Add PR + nightly + release workflows for production safety.',
  '.github/workflows/*',
);

const accountReadiness = run('npm', ['run', '-s', 'accounts:check:strict']);
add(
  'account_readiness_strict',
  'Account Integrations',
  'Strict account readiness passes',
  accountReadiness.status === 0,
  'critical',
  'Fix invalid/missing required account keys before production deployment.',
  accountReadiness.status === 0 ? 'accounts:check:strict passed' : 'accounts:check:strict failed',
);

const qualityGaps = run('npm', ['run', '-s', 'quality:gaps']);
add(
  'quality_gap_report',
  'Quality Governance',
  'System gap analysis passes',
  qualityGaps.status === 0,
  'major',
  'Resolve architectural/process gaps reported by quality baseline.',
  qualityGaps.status === 0 ? 'quality:gaps passed' : 'quality:gaps failed',
);

const vercelTopology = run('npm', ['run', '-s', 'vercel:topology:strict']);
add(
  'vercel_topology',
  'Release Infrastructure',
  'Vercel topology strict gate passes',
  vercelTopology.status === 0,
  'major',
  'Link active runtime project and resolve Vercel topology blockers.',
  vercelTopology.status === 0 ? 'vercel:topology:strict passed' : 'vercel:topology:strict failed',
);

add(
  'runbook_branch_infra',
  'Operational Clarity',
  'Branch + infra runbook exists',
  exists('docs/runbooks/BRANCH_AND_INFRA_SYSTEM.md'),
  'minor',
  'Add a single operational runbook for branch model and infra promotion.',
  'docs/runbooks/BRANCH_AND_INFRA_SYSTEM.md',
);

const severityOrder = { critical: 0, major: 1, minor: 2 };
const failures = checks.filter((c) => !c.ok);
const score = Math.round(((checks.length - failures.length) / checks.length) * 100);

const bySeverity = {
  critical: failures.filter((f) => f.severity === 'critical').length,
  major: failures.filter((f) => f.severity === 'major').length,
  minor: failures.filter((f) => f.severity === 'minor').length,
};

const sorted = [...checks].sort((a, b) => {
  if (a.ok !== b.ok) return a.ok ? 1 : -1;
  if (a.severity !== b.severity) return severityOrder[a.severity] - severityOrder[b.severity];
  return a.area.localeCompare(b.area);
});

const generatedAt = new Date().toISOString();
const report = {
  generated_at: generatedAt,
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

const reportsDir = path.join(rootDir, 'docs/reports');
fs.mkdirSync(reportsDir, { recursive: true });

const jsonPath = path.join(reportsDir, 'infra-readiness.json');
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

const md = [
  '# Infrastructure Readiness',
  '',
  `Generated: ${generatedAt}`,
  '',
  `- Score: **${score}**`,
  `- Checks: **${checks.length}**`,
  `- Failed: **${failures.length}** (critical: ${bySeverity.critical}, major: ${bySeverity.major}, minor: ${bySeverity.minor})`,
  '',
  '| Status | Severity | Area | Check | Evidence |',
  '|---|---|---|---|---|',
  ...sorted.map((c) => `| ${c.ok ? 'PASS' : 'FAIL'} | ${c.severity} | ${c.area} | ${c.title} | ${c.evidence} |`),
  '',
  '## Priority Actions',
  '',
  ...(failures.length
    ? failures
        .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
        .map((f, i) => `${i + 1}. [${f.severity}] ${f.title} -- ${f.remediation}`)
    : ['1. No infrastructure blockers detected.']),
  '',
].join('\n');

const mdPath = path.join(reportsDir, 'infra-readiness.md');
fs.writeFileSync(mdPath, md, 'utf8');

console.log(`Infrastructure readiness score: ${score}`);
console.log(`Report: ${path.relative(rootDir, mdPath)}`);
console.log(`Data:   ${path.relative(rootDir, jsonPath)}`);

if (strictMode && failures.length > 0) {
  process.exit(1);
}
