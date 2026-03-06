import fs from 'node:fs';
import path from 'node:path';

interface AuditAtom {
  id: string;
  number: number;
  name: string;
  series: string;
  seriesNumber: number;
  seriesName: string;
  collectionNumber: number;
  renderMode: string;
  defaultScale: string;
  surfaces: string[];
  sensoryProfile: string[];
  resolutionProfile: string;
  therapeuticJobs: string[];
  physicsTags: string[];
  repetitionKey: string;
  repetitionClusterSize: number;
}

const root = process.cwd();
const reportDir = path.join(root, 'docs', 'reports');
const ingestDir = path.join(root, 'system', 'ingest', 'navicue-atoms');
const auditPath = path.join(reportDir, 'navicue-atoms-full-audit.json');
const clusterCsvPath = path.join(reportDir, 'navicue-atom-cluster2-differentiation.csv');
const clusterMdPath = path.join(reportDir, 'navicue-atom-cluster2-differentiation.md');
const clusterJsonPath = path.join(reportDir, 'navicue-atom-cluster2-differentiation.json');
const clusterIngestPath = path.join(ingestDir, 'navicue-atom-cluster2-differentiation-pack.json');

if (!fs.existsSync(auditPath)) {
  console.error('Missing full audit. Run "npm run atoms:audit:full" first.');
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8')) as { atoms: AuditAtom[] };
const TARGET_CLUSTER = 'canvas|full|draggable|none|resolved|discrete|haptics';

const rows = audit.atoms
  .filter((atom) => atom.repetitionKey === TARGET_CLUSTER)
  .sort((a, b) => a.number - b.number)
  .map((atom) => {
    const primaryAxis = derivePrimaryAxis(atom);
    const narrativeRisk = deriveNarrativeRisk(atom);
    const closureUpgrade = deriveClosureUpgrade(atom);
    return {
      atomNumber: atom.number,
      atomId: atom.id,
      atomName: atom.name,
      collectionNumber: atom.collectionNumber,
      seriesNumber: atom.seriesNumber,
      seriesName: atom.seriesName,
      therapeuticJobs: atom.therapeuticJobs,
      physicsTags: atom.physicsTags,
      primaryDifferentiationAxis: primaryAxis,
      narrativeRisk,
      closureUpgrade,
      clusterRule:
        'Differentiate discrete drag atoms by what gets built, aligned, translated, or revealed after the drag, not by swapping labels on the same mechanic.',
    };
  });

const pack = {
  generatedAt: new Date().toISOString(),
  repetitionKey: TARGET_CLUSTER,
  count: rows.length,
  operatingRule:
    'This pack exists to break sameness in the largest resolved-discrete drag cluster by forcing stronger aftermath differentiation.',
  rows,
};

fs.writeFileSync(clusterJsonPath, JSON.stringify(pack, null, 2));
fs.writeFileSync(clusterCsvPath, buildCsv(rows));
fs.writeFileSync(clusterMdPath, buildMarkdown(pack));
fs.writeFileSync(clusterIngestPath, JSON.stringify(pack, null, 2));

console.log(`Wrote ${path.relative(root, clusterJsonPath)}`);
console.log(`Wrote ${path.relative(root, clusterMdPath)}`);
console.log(`Wrote ${path.relative(root, clusterCsvPath)}`);
console.log(`Wrote ${path.relative(root, clusterIngestPath)}`);
console.log(`Cluster 2 atoms: ${rows.length}`);

function derivePrimaryAxis(atom: AuditAtom) {
  if (atom.physicsTags.includes('structural')) return 'Differentiate by what gets assembled or stabilized after the drag';
  if (atom.physicsTags.includes('network')) return 'Differentiate by translation, routing, or relationship mapping after the drag';
  if (atom.physicsTags.includes('optical')) return 'Differentiate by what becomes legible after the drag';
  if (atom.physicsTags.includes('fluid')) return 'Differentiate by where the flow settles after the drag';
  if (atom.physicsTags.includes('gravitational')) return 'Differentiate by lock point, orbit point, or resting point';
  return 'Differentiate by aftermath law so the same drag does not resolve into the same feeling';
}

function deriveNarrativeRisk(atom: AuditAtom) {
  if (atom.therapeuticJobs.includes('identity') || atom.therapeuticJobs.includes('perspective')) {
    return 'High risk of leaning on copy; keep the transformation mechanical and visible';
  }
  if (atom.therapeuticJobs.includes('boundary') || atom.therapeuticJobs.includes('agency')) {
    return 'Risk of generic empowerment; the post-drag state must feel specific';
  }
  return 'Moderate risk; protect distinct consequence over explanation';
}

function deriveClosureUpgrade(atom: AuditAtom) {
  if (atom.resolutionProfile === 'seal') return 'Vary the resolution artifact so discrete drag endings do not all land as the same seal';
  if (atom.resolutionProfile === 'field-recompose') return 'Push the recomposition farther so the whole frame changes, not just the dragged object';
  return 'Strengthen the post-drag state change until the aftermath is unmistakable';
}

function buildCsv(rows: typeof rows) {
  const headers = [
    'atom_number',
    'atom_id',
    'atom_name',
    'collection_number',
    'series_number',
    'series_name',
    'therapeutic_jobs',
    'physics_tags',
    'primary_differentiation_axis',
    'narrative_risk',
    'closure_upgrade',
    'cluster_rule',
  ];
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.atomNumber,
        row.atomId,
        row.atomName,
        row.collectionNumber,
        row.seriesNumber,
        row.seriesName,
        row.therapeuticJobs.join(' | '),
        row.physicsTags.join(' | '),
        row.primaryDifferentiationAxis,
        row.narrativeRisk,
        row.closureUpgrade,
        row.clusterRule,
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  return `${lines.join('\n')}\n`;
}

function buildMarkdown(pack: typeof pack) {
  return [
    '# NaviCue Atom Cluster 2 Differentiation',
    '',
    `Generated: ${pack.generatedAt}`,
    '',
    `Repetition key: \`${pack.repetitionKey}\``,
    `Atoms in cluster: ${pack.count}`,
    '',
    '## Rule',
    '',
    pack.operatingRule,
    '',
    '## Global Direction',
    '',
    '- differentiate by aftermath law',
    '- make the post-drag state unmistakable',
    '- resist solving sameness with extra copy',
    '',
  ].join('\n');
}

function csvEscape(value: string | number) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
