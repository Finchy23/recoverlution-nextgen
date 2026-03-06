#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const strict = process.argv.includes('--strict');

const commandCenterRoot = path.join(rootDir, 'Command Center Execution Plan');
const figmaDropRoot = path.join(commandCenterRoot, 'figma-drop');
const reportsDir = path.join(rootDir, 'docs', 'reports');
const reportJsonPath = path.join(reportsDir, 'command-center-ssot-readiness.json');
const reportMdPath = path.join(reportsDir, 'command-center-ssot-readiness.md');

const authoritativeFiles = [
  'design-tokens.ts',
  'styles/theme.css',
  'styles/design-tokens.css',
  'styles/fonts.css',
  'app/design-system/navicue-blueprint.ts',
  'app/design-system/navicue-mechanics.ts',
  'app/design-system/navicue-compositor.ts',
  'app/design-system/navicue-creative-brief.ts',
  'app/design-system/navicue-magic-colors.ts',
  'app/design-system/navicue-visual-patterns.ts',
  'app/design-system/navicue-figma-surface.ts',
  'app/design-system/navicue-tokens.ts',
  'utils/assets.ts',
  'utils/storageUrls.ts',
  'utils/supabaseInfo.ts',
];

const report = {
  generatedAt: new Date().toISOString(),
  strict,
  checks: [],
  runtimeOnlySample: [],
  mirrorOnlySample: [],
};

function addCheck(name, status, details) {
  report.checks.push({ name, status, details });
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(targetPath) {
  return JSON.parse(await fs.readFile(targetPath, 'utf8'));
}

async function collectRelativeFiles(baseDir) {
  const out = [];

  async function walk(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.vercel') {
        continue;
      }
      const absolute = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolute);
      } else if (entry.isFile()) {
        out.push(path.relative(baseDir, absolute));
      }
    }
  }

  if (await pathExists(baseDir)) {
    await walk(baseDir);
  }

  return out.sort();
}

async function main() {
  const failures = [];
  const warnings = [];

  const requiredPaths = [
    'Command Center Execution Plan',
    'Command Center Execution Plan/src',
    'Command Center Execution Plan/figma-drop',
    'apps/command-center/package.json',
    'system/source-of-truth.manifest.json',
    'docs/architecture/SINGLE_SOURCE_OF_TRUTH.md',
  ];

  for (const rel of requiredPaths) {
    if (await pathExists(path.join(rootDir, rel))) {
      addCheck(`exists:${rel}`, 'pass', 'Required path present.');
    } else {
      addCheck(`exists:${rel}`, 'fail', 'Required path missing.');
      failures.push(`Missing required path: ${rel}`);
    }
  }

  const rootPackage = await readJson(path.join(rootDir, 'package.json'));
  const appPackage = await readJson(path.join(rootDir, 'apps', 'command-center', 'package.json'));
  const ccepPackage = await readJson(path.join(commandCenterRoot, 'package.json'));

  const rootScriptOk =
    rootPackage.scripts?.['dev:command-center']?.includes('apps/command-center run dev') &&
    rootPackage.scripts?.['build:command-center']?.includes('apps/command-center run build') &&
    rootPackage.scripts?.['ship:check:command-center']?.includes('apps/command-center run ship:check');
  if (rootScriptOk) {
    addCheck('root-command-center-routing', 'pass', 'Root scripts route through apps/command-center.');
  } else {
    addCheck('root-command-center-routing', 'fail', 'Root scripts do not consistently route through apps/command-center.');
    failures.push('Root command-center scripts are not routed through apps/command-center.');
  }

  const appScriptValues = Object.values(appPackage.scripts || {}).join('\n');
  if (appScriptValues.includes('../../Command Center Execution Plan') && !appScriptValues.includes('figma-drop')) {
    addCheck('app-command-center-routing', 'pass', 'apps/command-center proxies to Command Center Execution Plan only.');
  } else {
    addCheck('app-command-center-routing', 'fail', 'apps/command-center does not proxy cleanly to Command Center Execution Plan.');
    failures.push('apps/command-center is not cleanly proxied to Command Center Execution Plan.');
  }

  const ccepReadme = await fs.readFile(path.join(commandCenterRoot, 'README.md'), 'utf8');
  if (
    ccepReadme.includes('Mirror workspace: `figma-drop/`') &&
    ccepReadme.includes('never the authority')
  ) {
    addCheck('command-center-readme-boundary', 'pass', 'Command Center README defines figma-drop as mirror only.');
  } else {
    addCheck('command-center-readme-boundary', 'fail', 'Command Center README boundary language is incomplete.');
    failures.push('Command Center README does not clearly define figma-drop as mirror only.');
  }

  const figmaReadme = await fs.readFile(path.join(figmaDropRoot, 'README.md'), 'utf8');
  if (
    figmaReadme.includes('derived mirror') &&
    figmaReadme.includes('Do not build production from this folder')
  ) {
    addCheck('figma-readme-boundary', 'pass', 'figma-drop README defines ingest-only behavior.');
  } else {
    addCheck('figma-readme-boundary', 'fail', 'figma-drop README boundary language is incomplete.');
    failures.push('figma-drop README does not clearly define ingest-only behavior.');
  }

  const manifest = await readJson(path.join(rootDir, 'system', 'source-of-truth.manifest.json'));
  const designDomain = (manifest.domains || []).find((domain) => domain.name === 'design_system_current');
  const runtimeDomain = (manifest.domains || []).find((domain) => domain.name === 'command_center_runtime');

  if (designDomain?.derived?.includes('Command Center Execution Plan/figma-drop/')) {
    addCheck('manifest-design-mirror', 'pass', 'SSOT manifest tracks figma-drop as derived for design system.');
  } else {
    addCheck('manifest-design-mirror', 'fail', 'SSOT manifest is missing figma-drop derived mapping for design system.');
    failures.push('SSOT manifest missing figma-drop derived mapping in design_system_current.');
  }

  if (runtimeDomain?.canonical?.includes('Command Center Execution Plan/src/') && runtimeDomain?.derived?.includes('Command Center Execution Plan/figma-drop/')) {
    addCheck('manifest-runtime-domain', 'pass', 'SSOT manifest tracks Command Center runtime and figma-drop ingest boundary.');
  } else {
    addCheck('manifest-runtime-domain', 'fail', 'SSOT manifest is missing the runtime/ingest boundary domain.');
    failures.push('SSOT manifest missing command_center_runtime domain.');
  }

  for (const rel of authoritativeFiles) {
    const runtimeFile = path.join(commandCenterRoot, 'src', rel);
    const mirrorFile = path.join(figmaDropRoot, 'src', rel);

    if (!(await pathExists(runtimeFile))) {
      addCheck(`authority:${rel}`, 'fail', 'Canonical runtime file missing.');
      failures.push(`Missing canonical runtime file: Command Center Execution Plan/src/${rel}`);
      continue;
    }

    if (!(await pathExists(mirrorFile))) {
      addCheck(`authority:${rel}`, 'fail', 'Mirror file missing.');
      failures.push(`Missing figma-drop mirror file: Command Center Execution Plan/figma-drop/src/${rel}`);
      continue;
    }

    const [runtimeContent, mirrorContent] = await Promise.all([
      fs.readFile(runtimeFile, 'utf8'),
      fs.readFile(mirrorFile, 'utf8'),
    ]);

    if (runtimeContent === mirrorContent) {
      addCheck(`authority:${rel}`, 'pass', 'Canonical and mirror copies are synchronized.');
    } else {
      addCheck(`authority:${rel}`, 'fail', 'Canonical and mirror copies differ.');
      failures.push(`Drift detected between Command Center and figma-drop for src/${rel}`);
    }
  }

  const runtimeFiles = new Set(await collectRelativeFiles(path.join(commandCenterRoot, 'src')));
  const mirrorFiles = new Set(await collectRelativeFiles(path.join(figmaDropRoot, 'src')));

  report.runtimeOnlySample = Array.from(runtimeFiles).filter((file) => !mirrorFiles.has(file)).slice(0, 25);
  report.mirrorOnlySample = Array.from(mirrorFiles).filter((file) => !runtimeFiles.has(file)).slice(0, 25);

  if (report.mirrorOnlySample.length > 0) {
    warnings.push(`figma-drop has ${report.mirrorOnlySample.length}+ files that do not exist in canonical src/. This is acceptable only as ingest/reference, not runtime authority.`);
  }

  if (report.runtimeOnlySample.length > 0) {
    warnings.push(`Command Center has ${report.runtimeOnlySample.length}+ canonical files not mirrored into figma-drop. Review if tooling needs them; do not invert authority.`);
  }

  const passed = report.checks.filter((check) => check.status === 'pass').length;
  const failed = report.checks.filter((check) => check.status === 'fail').length;
  const score = report.checks.length === 0 ? 100 : Math.max(0, Math.round((passed / report.checks.length) * 100));
  report.summary = { passed, failed, warnings: warnings.length, score, failures, warnings };

  await fs.mkdir(reportsDir, { recursive: true });
  await fs.writeFile(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);

  const md = [
    '# Command Center SSOT Readiness',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Strict: ${strict ? 'yes' : 'no'}`,
    `- Score: ${score}`,
    `- Passed: ${passed}`,
    `- Failed: ${failed}`,
    `- Warnings: ${warnings.length}`,
    '',
    '## Checks',
    ...report.checks.map((check) => `- [${check.status.toUpperCase()}] ${check.name}: ${check.details}`),
    '',
    '## Warnings',
    ...(warnings.length > 0 ? warnings.map((warning) => `- ${warning}`) : ['- None']),
    '',
    '## Failures',
    ...(failures.length > 0 ? failures.map((failure) => `- ${failure}`) : ['- None']),
    '',
    '## Runtime-only sample',
    ...(report.runtimeOnlySample.length > 0 ? report.runtimeOnlySample.map((file) => `- ${file}`) : ['- None']),
    '',
    '## Mirror-only sample',
    ...(report.mirrorOnlySample.length > 0 ? report.mirrorOnlySample.map((file) => `- ${file}`) : ['- None']),
    '',
  ].join('\n');

  await fs.writeFile(reportMdPath, `${md}\n`);

  if (failures.length > 0 || (strict && warnings.length > 0)) {
    console.error(`command-center:ssot failed with score ${score}`);
    if (failures.length > 0) {
      for (const failure of failures) console.error(`- ${failure}`);
    }
    if (strict && warnings.length > 0) {
      for (const warning of warnings) console.error(`- ${warning}`);
    }
    process.exit(1);
  }

  console.log(`command-center:ssot passed with score ${score}`);
  if (warnings.length > 0) {
    for (const warning of warnings) console.log(`warning: ${warning}`);
  }
}

main().catch((error) => {
  console.error('command-center:ssot failed unexpectedly:', error);
  process.exit(1);
});
