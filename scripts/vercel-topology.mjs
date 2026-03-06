#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const strictMode = process.argv.includes('--strict');

const registryPath = path.join(rootDir, 'infra', 'vercel', 'project-registry.json');
if (!fs.existsSync(registryPath)) {
  console.error(`Missing registry: ${path.relative(rootDir, registryPath)}`);
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const projects = registry.projects || [];

const reportRows = projects.map((project) => {
  const absRoot = path.join(rootDir, project.root);
  const rootExists = fs.existsSync(absRoot);
  const vercelProjectJson = path.join(absRoot, '.vercel', 'project.json');
  const linked = rootExists && fs.existsSync(vercelProjectJson);
  const recommendedLinkCmd = `cd "${project.root}" && npx vercel link --project ${project.name}`;

  return {
    key: project.key,
    name: project.name,
    root: project.root,
    activeRuntime: Boolean(project.activeRuntime),
    envSync: Boolean(project.envSync),
    rootExists,
    linked,
    domains: Array.isArray(project.domains) ? project.domains : [],
    notes: project.notes || '',
    recommendedLinkCmd,
  };
});

const requiredFailures = reportRows.filter((row) => row.activeRuntime && (!row.rootExists || !row.linked));
const score = Math.round(
  (reportRows.reduce((acc, row) => acc + (row.rootExists ? 1 : 0) + (row.linked ? 1 : 0), 0) /
    Math.max(reportRows.length * 2, 1)) *
    100,
);

const report = {
  generated_at: new Date().toISOString(),
  strict_mode: strictMode,
  branch_routing: registry.branchRouting || {},
  score,
  totals: {
    projects: reportRows.length,
    active_runtime_projects: reportRows.filter((r) => r.activeRuntime).length,
    linked_projects: reportRows.filter((r) => r.linked).length,
    missing_links: reportRows.filter((r) => !r.linked).length,
  },
  projects: reportRows,
  failures: requiredFailures.map((f) => ({
    key: f.key,
    name: f.name,
    reason: !f.rootExists ? 'project root missing' : 'project not linked to vercel',
    fix: f.recommendedLinkCmd,
  })),
};

const reportsDir = path.join(rootDir, 'docs', 'reports');
fs.mkdirSync(reportsDir, { recursive: true });

const jsonPath = path.join(reportsDir, 'vercel-topology.json');
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

const md = [
  '# Vercel Topology Report',
  '',
  `Generated: ${report.generated_at}`,
  '',
  `- Score: **${score}**`,
  `- Projects: **${report.totals.projects}**`,
  `- Linked projects: **${report.totals.linked_projects}**`,
  `- Missing links: **${report.totals.missing_links}**`,
  '',
  '## Branch Routing',
  '',
  `- Production branch: \`${report.branch_routing.production || 'main'}\``,
  `- Preview prefix: \`${report.branch_routing.previewPrefix || 'codex/'}\``,
  '',
  '| Key | Vercel Project | Root | Active Runtime | Env Sync | Root Exists | Linked |',
  '|---|---|---|---|---|---|---|',
  ...reportRows.map(
    (row) =>
      `| ${row.key} | ${row.name} | ${row.root} | ${row.activeRuntime ? 'yes' : 'no'} | ${row.envSync ? 'yes' : 'no'} | ${row.rootExists ? 'yes' : 'no'} | ${row.linked ? 'yes' : 'no'} |`,
  ),
  '',
  '## Link Commands',
  '',
  ...reportRows.map((row) => `- ${row.key}: \`${row.recommendedLinkCmd}\``),
  '',
  '## Required Fixes',
  '',
  ...(requiredFailures.length
    ? requiredFailures.map(
        (f) =>
          `1. ${f.name} (${f.key}): ${!f.rootExists ? 'create root' : 'link to vercel'} using \`${f.recommendedLinkCmd}\``,
      )
    : ['1. No active runtime blockers.']),
  '',
].join('\n');

const mdPath = path.join(reportsDir, 'vercel-topology.md');
fs.writeFileSync(mdPath, md, 'utf8');

console.log(`Vercel topology score: ${score}`);
console.log(`Report: ${path.relative(rootDir, mdPath)}`);
console.log(`Data:   ${path.relative(rootDir, jsonPath)}`);

if (strictMode && requiredFailures.length > 0) {
  process.exit(1);
}
