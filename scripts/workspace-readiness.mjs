#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const strictMode = process.argv.includes('--strict');

const checks = [];

function exists(relPath) {
  return fs.existsSync(path.join(rootDir, relPath));
}

function add(id, area, title, ok, severity, remediation, evidence) {
  checks.push({ id, area, title, ok, severity, remediation, evidence });
}

add(
  'root_tsconfig',
  'Workspace',
  'Root TypeScript base config exists',
  exists('tsconfig.base.json'),
  'major',
  'Add a root tsconfig.base.json for shared workspace compiler defaults.',
  'tsconfig.base.json',
);

add(
  'design_system_package',
  'Packages',
  'Design system package is present',
  exists('packages/design-system/package.json'),
  'critical',
  'Create packages/design-system as the canonical token and variable package.',
  'packages/design-system/package.json',
);

add(
  'navicue_engine_package',
  'Packages',
  'NaviCue engine package is present',
  exists('packages/navicue-engine/package.json'),
  'major',
  'Create packages/navicue-engine for shared runtime contracts and engine logic.',
  'packages/navicue-engine/package.json',
);

add(
  'ui_package',
  'Packages',
  'UI package is present',
  exists('packages/ui/package.json'),
  'major',
  'Create packages/ui for shared component primitives.',
  'packages/ui/package.json',
);

add(
  'types_package',
  'Packages',
  'Types package is present',
  exists('packages/types/package.json'),
  'major',
  'Create packages/types for shared platform and runtime types.',
  'packages/types/package.json',
);

add(
  'config_package',
  'Packages',
  'Config package is present',
  exists('packages/config/package.json'),
  'minor',
  'Create packages/config for shared workspace config assets.',
  'packages/config/package.json',
);

add(
  'design_center_app',
  'Apps',
  'Design Center canonical app exists',
  exists('apps/design-center/package.json'),
  'critical',
  'Create apps/design-center as the canonical review and design-system delivery app.',
  'apps/design-center/package.json',
);

add(
  'marketing_app',
  'Apps',
  'Marketing app package exists',
  exists('apps/marketing/package.json'),
  'major',
  'Create apps/marketing as the canonical growth surface.',
  'apps/marketing/package.json',
);

add(
  'mobile_app',
  'Apps',
  'Mobile app package exists',
  exists('apps/mobile/package.json'),
  'major',
  'Create apps/mobile as the canonical mobile shell target.',
  'apps/mobile/package.json',
);

add(
  'transitional_design_system',
  'Transitional Sources',
  'Legacy Design System Draft source exists',
  exists('Design System Draft/package.json'),
  'minor',
  'Retain the legacy draft only as source material while the active app lives in apps/design-center.',
  'Design System Draft/package.json',
);

add(
  'source_of_truth_manifest',
  'Governance',
  'Source-of-truth manifest exists',
  exists('system/source-of-truth.manifest.json'),
  'major',
  'Maintain a canonical manifest so source and derived assets are explicit.',
  'system/source-of-truth.manifest.json',
);

const severityOrder = { critical: 0, major: 1, minor: 2 };
const failures = checks.filter((check) => !check.ok);
const score = Math.round(((checks.length - failures.length) / checks.length) * 100);

const sorted = [...checks].sort((a, b) => {
  if (a.ok !== b.ok) return a.ok ? 1 : -1;
  if (a.severity !== b.severity) return severityOrder[a.severity] - severityOrder[b.severity];
  return a.area.localeCompare(b.area);
});

const reportsDir = path.join(rootDir, 'docs', 'reports');
fs.mkdirSync(reportsDir, { recursive: true });

const generatedAt = new Date().toISOString();
const report = {
  generated_at: generatedAt,
  strict_mode: strictMode,
  score,
  totals: {
    checks: checks.length,
    passed: checks.length - failures.length,
    failed: failures.length,
  },
  checks: sorted,
};

fs.writeFileSync(
  path.join(reportsDir, 'workspace-readiness.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);

const markdown = [
  '# Workspace Readiness',
  '',
  `Generated: ${generatedAt}`,
  '',
  `- Score: **${score}**`,
  `- Checks: **${checks.length}**`,
  `- Failed: **${failures.length}**`,
  '',
  '| Status | Severity | Area | Check | Evidence |',
  '|---|---|---|---|---|',
  ...sorted.map((check) => `| ${check.ok ? 'PASS' : 'FAIL'} | ${check.severity} | ${check.area} | ${check.title} | ${check.evidence} |`),
  '',
  '## Priority Actions',
  '',
  ...(failures.length
    ? failures
        .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
        .map((failure, index) => `${index + 1}. [${failure.severity}] ${failure.title} -- ${failure.remediation}`)
    : ['1. Workspace structure is ready for canonical delivery.']),
  '',
].join('\n');

fs.writeFileSync(path.join(reportsDir, 'workspace-readiness.md'), markdown, 'utf8');

console.log(`Workspace readiness score: ${score}`);
console.log('Report: docs/reports/workspace-readiness.md');
console.log('Data:   docs/reports/workspace-readiness.json');

if (strictMode && failures.length > 0) {
  process.exit(1);
}
