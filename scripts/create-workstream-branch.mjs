#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const streamCatalog = {
  tokens: 'Design token architecture and variable governance',
  components: 'UI components and interaction primitives',
  navicue: 'NaviCue runtime and specimen interaction evolution',
  auth: 'Auth + identity (Supabase/Apple/Google)',
  billing: 'Stripe/RevenueCat entitlements and billing surfaces',
  mobile: 'React Native app shell and store-release track',
  infra: 'Platform reliability, CI/CD, and deployment hardening',
  growth: 'Analytics, events, flags, and experimentation',
};

function parseArgs(argv) {
  const out = {
    stream: '',
    name: '',
    create: false,
    withWorktree: false,
    previewSync: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') out.help = true;
    else if (arg === '--create') out.create = true;
    else if (arg === '--with-worktree') out.withWorktree = true;
    else if (arg === '--preview-sync') out.previewSync = true;
    else if (arg === '--stream') out.stream = argv[i + 1] || '';
    else if (arg.startsWith('--stream=')) out.stream = arg.split('=')[1] || '';
    else if (arg === '--name') out.name = argv[i + 1] || '';
    else if (arg.startsWith('--name=')) out.name = arg.split('=')[1] || '';

    if (arg === '--stream' || arg === '--name') i += 1;
  }

  return out;
}

function usage() {
  console.log('Create Workstream Branch');
  console.log('');
  console.log('Usage: node scripts/create-workstream-branch.mjs --stream <key> --name <slug> [options]');
  console.log('');
  console.log('Options:');
  console.log('  --create          Create and switch to branch');
  console.log('  --with-worktree   Also create git worktree in ../worktrees/<branch>');
  console.log('  --preview-sync    Sync preview env vars for branch (requires --create)');
  console.log('  --help            Show help');
  console.log('');
  console.log('Available streams:');
  for (const [k, v] of Object.entries(streamCatalog)) {
    console.log(`- ${k}: ${v}`);
  }
}

function run(cmd, args, cwd = rootDir) {
  return spawnSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function sanitizeSlug(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  usage();
  process.exit(0);
}

if (!args.stream || !args.name) {
  usage();
  process.exit(1);
}

if (!streamCatalog[args.stream]) {
  console.error(`Unknown stream '${args.stream}'.`);
  usage();
  process.exit(1);
}

const slug = sanitizeSlug(args.name);
if (!slug) {
  console.error('Invalid --name value.');
  process.exit(1);
}

const branch = `codex/${args.stream}-${slug}`;
const worktreePath = path.resolve(rootDir, '..', 'worktrees', `${args.stream}-${slug}`);
const streamDescription = streamCatalog[args.stream];

const checkRepo = run('git', ['rev-parse', '--is-inside-work-tree']);
if (checkRepo.status !== 0) {
  console.error('Not inside a git repository.');
  process.exit(1);
}

const existingBranches = run('git', ['branch', '--list', branch]).stdout.trim();
const exists = Boolean(existingBranches);

const workstreamDir = path.join(rootDir, 'docs', 'workstreams');
const workstreamDocPath = path.join(workstreamDir, `${args.stream}-${slug}.md`);

const docBody = [
  `# Workstream: ${args.stream}-${slug}`,
  '',
  `- Branch: \`${branch}\``,
  `- Stream: \`${args.stream}\``,
  `- Scope: ${streamDescription}`,
  `- Status: Planned`,
  '',
  '## Objectives',
  '- Objective 1:',
  '- Objective 2:',
  '- Objective 3:',
  '',
  '## Definition of Done',
  '- [ ] CI quality gate green',
  '- [ ] Account readiness unaffected',
  '- [ ] Release notes updated',
  '',
  '## Notes',
  '-',
  '',
].join('\n');

if (!fs.existsSync(workstreamDir)) fs.mkdirSync(workstreamDir, { recursive: true });
if (!fs.existsSync(workstreamDocPath)) {
  fs.writeFileSync(workstreamDocPath, docBody, 'utf8');
}

if (!args.create) {
  console.log(`Planned branch: ${branch}`);
  console.log(`Workstream doc: ${path.relative(rootDir, workstreamDocPath)}`);
  console.log('');
  console.log('To create branch now:');
  console.log(`git switch -c ${branch}`);
  if (args.withWorktree) {
    console.log(`mkdir -p "${path.dirname(worktreePath)}"`);
    console.log(`git worktree add "${worktreePath}" ${branch}`);
  }
  if (args.previewSync) {
    console.log(`node ./scripts/vercel-account-sync.mjs --strict --preview-branch ${branch}`);
  }
  process.exit(0);
}

if (!exists) {
  const createBranch = run('git', ['switch', '-c', branch]);
  if (createBranch.status !== 0) {
    console.error(createBranch.stderr || createBranch.stdout || 'Failed to create branch');
    process.exit(1);
  }
} else {
  const switchBranch = run('git', ['switch', branch]);
  if (switchBranch.status !== 0) {
    console.error(switchBranch.stderr || switchBranch.stdout || 'Failed to switch branch');
    process.exit(1);
  }
}

if (args.withWorktree) {
  fs.mkdirSync(path.dirname(worktreePath), { recursive: true });
  const addWorktree = run('git', ['worktree', 'add', worktreePath, branch]);
  if (addWorktree.status !== 0) {
    console.error(addWorktree.stderr || addWorktree.stdout || 'Failed to add worktree');
    process.exit(1);
  }
}

if (args.previewSync) {
  const sync = run('node', ['./scripts/vercel-account-sync.mjs', '--strict', '--preview-branch', branch]);
  if (sync.status !== 0) {
    console.error(sync.stderr || sync.stdout || 'Preview env sync failed');
    process.exit(1);
  }
}

console.log(`Ready: ${branch}`);
console.log(`Workstream doc: ${path.relative(rootDir, workstreamDocPath)}`);
if (args.withWorktree) {
  console.log(`Worktree: ${worktreePath}`);
}

