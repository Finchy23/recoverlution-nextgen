#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const registryPath = path.join(rootDir, 'infra', 'vercel', 'project-registry.json');
if (!fs.existsSync(registryPath)) {
  console.error(`Missing registry: ${path.relative(rootDir, registryPath)}`);
  process.exit(1);
}

function parseArgs(argv) {
  const out = {
    dryRun: false,
    strict: false,
    includeOptional: false,
    previewBranch: '',
    projectKeys: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--strict') out.strict = true;
    else if (arg === '--include-optional') out.includeOptional = true;
    else if (arg.startsWith('--preview-branch=')) out.previewBranch = arg.split('=')[1] || '';
    else if (arg === '--preview-branch') out.previewBranch = argv[i + 1] || '';
    else if (arg.startsWith('--projects=')) {
      out.projectKeys = arg
        .split('=')[1]
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    } else if (arg === '--projects') {
      out.projectKeys = (argv[i + 1] || '')
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    }

    if (arg === '--preview-branch' || arg === '--projects') i += 1;
  }

  return out;
}

function run(cmd, args, cwd = rootDir) {
  return spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

const options = parseArgs(process.argv.slice(2));
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

const selectedProjects = (registry.projects || [])
  .filter((p) => p.envSync)
  .filter((p) => options.projectKeys.length === 0 || options.projectKeys.includes(p.key));

if (selectedProjects.length === 0) {
  console.log('No envSync-enabled projects selected. Nothing to do.');
  process.exit(0);
}

const results = [];

for (const project of selectedProjects) {
  const args = ['./scripts/vercel-account-sync.mjs', '--app-dir', project.root];
  if (options.strict) args.push('--strict');
  if (options.dryRun) args.push('--dry-run');
  if (options.includeOptional) args.push('--include-optional');
  if (options.previewBranch) args.push('--preview-branch', options.previewBranch);

  const res = run('node', args, rootDir);
  const ok = res.status === 0;
  results.push({
    project: project.key,
    name: project.name,
    root: project.root,
    ok,
    output: (res.stdout || '').trim(),
    error: (res.stderr || '').trim(),
  });

  console.log('');
  console.log(`=== ${project.key} (${project.name}) ===`);
  if (res.stdout) process.stdout.write(`${res.stdout}\n`);
  if (res.stderr) process.stderr.write(`${res.stderr}\n`);
}

const failed = results.filter((r) => !r.ok);
console.log('');
console.log('Multi-project sync summary:');
for (const r of results) {
  console.log(`- ${r.ok ? 'SYNCED' : 'FAILED'}: ${r.project} (${r.root})`);
}

if (failed.length > 0) {
  process.exit(1);
}
