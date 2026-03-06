import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const failures = [];
const checks = [];

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, rel), 'utf8'));
}

function exists(rel) {
  return fs.existsSync(path.join(rootDir, rel));
}

function add(name, status, details) {
  checks.push({ name, status, details });
  if (status === 'fail') failures.push(`${name}: ${details}`);
}

function normalizeSource(source) {
  return source.replace(/\r\n/g, '\n').trim();
}

const required = [
  'apps/design-center/package.json',
  'apps/design-center/src/design-tokens.ts',
  'apps/design-center/vite.config.ts',
  'packages/design-system/package.json',
  'packages/design-system/src/runtime/design-tokens.ts',
  'packages/ui/package.json',
  'packages/ui/src/primitives/button.tsx',
  'packages/ui/src/primitives/card.tsx',
  'packages/ui/src/primitives/badge.tsx',
  'packages/ui/src/primitives/input.tsx',
  'packages/ui/src/primitives/textarea.tsx',
  'packages/ui/src/primitives/label.tsx',
  'packages/ui/src/primitives/separator.tsx',
  'packages/ui/src/primitives/utils.ts',
  'scripts/sync-design-system-runtime-authority.mjs',
  'scripts/sync-ui-primitives-authority.mjs',
];

for (const rel of required) {
  add(`exists:${rel}`, exists(rel) ? 'pass' : 'fail', exists(rel) ? 'Required path present.' : 'Required path missing.');
}

const rootPkg = readJson('package.json');
const appPkg = readJson('apps/design-center/package.json');

const rootRoutesThroughApp =
  rootPkg.scripts?.['dev:design-center']?.includes('apps/design-center run dev') &&
  rootPkg.scripts?.['build:design-center']?.includes('apps/design-center run build') &&
  rootPkg.scripts?.['qa:design-center']?.includes('apps/design-center run qa');
add('root-design-center-routing', rootRoutesThroughApp ? 'pass' : 'fail', rootRoutesThroughApp ? 'Root scripts route through apps/design-center.' : 'Root scripts do not consistently route through apps/design-center.');

const appOwnsRuntime = ['dev', 'build', 'qa'].every((key) => {
  const value = String(appPkg.scripts?.[key] || '');
  return value.includes('vite') || value.includes('tsx') || value.includes('tsc') || value.includes('eslint') || value.includes('prettier') || value.includes('npm run tokens:export');
});
add('app-design-center-runtime', appOwnsRuntime ? 'pass' : 'fail', appOwnsRuntime ? 'apps/design-center owns its runtime scripts.' : 'apps/design-center still proxies instead of owning runtime scripts.');

const packageAuthority = fs.readFileSync(path.join(rootDir, 'packages/design-system/src/runtime/design-tokens.ts'), 'utf8');
const appMirror = fs.readFileSync(path.join(rootDir, 'apps/design-center/src/design-tokens.ts'), 'utf8');
const normalizedAppMirror = normalizeSource(appMirror);
const isSynced = normalizeSource(packageAuthority) === normalizedAppMirror;
add(
  'design-token-runtime-sync',
  isSynced ? 'pass' : 'fail',
  isSynced
    ? 'Design Center token mirror matches the package authority.'
    : 'Design Center token mirror has drifted from package authority. Run npm run design-system:sync:consumers.',
);

const uiPrimitiveFiles = [
  'utils.ts',
  'button.tsx',
  'card.tsx',
  'badge.tsx',
  'input.tsx',
  'textarea.tsx',
  'label.tsx',
  'separator.tsx',
];

for (const file of uiPrimitiveFiles) {
  const packageFile = fs.readFileSync(
    path.join(rootDir, 'packages/ui/src/primitives', file),
    'utf8',
  );
  const appFile = fs.readFileSync(
    path.join(rootDir, 'apps/design-center/src/app/components/ui', file),
    'utf8',
  );
  const synced = packageFile === appFile;
  add(
    `ui-primitive-sync:${file}`,
    synced ? 'pass' : 'fail',
    synced
      ? `Design Center mirror matches packages/ui authority for ${file}.`
      : `Design Center mirror drifted for ${file}. Run npm run ui:sync:consumers.`,
  );
}

const result = {
  generatedAt: new Date().toISOString(),
  ok: failures.length === 0,
  checks,
  failures,
};

const reportDir = path.join(rootDir, 'docs/reports');
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'design-center-ssot-readiness.json'), JSON.stringify(result, null, 2) + '\n');

let md = '# Design Center SSOT Readiness\n\n';
md += `Status: ${result.ok ? 'PASS' : 'FAIL'}\n\n`;
md += '| Status | Check | Details |\n| --- | --- | --- |\n';
for (const check of checks) {
  md += `| ${check.status.toUpperCase()} | ${check.name} | ${check.details} |\n`;
}
if (failures.length) {
  md += '\n## Failures\n\n';
  for (const failure of failures) md += `- ${failure}\n`;
}
fs.writeFileSync(path.join(reportDir, 'design-center-ssot-readiness.md'), md);

if (!result.ok) {
  console.error('Design Center SSOT readiness failed.');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Design Center SSOT readiness passed.');
for (const check of checks) {
  console.log(`- [${check.status.toUpperCase()}] ${check.name}: ${check.details}`);
}
