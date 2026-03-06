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
const clusterCsvPath = path.join(reportDir, 'navicue-atom-cluster1-differentiation.csv');
const clusterMdPath = path.join(reportDir, 'navicue-atom-cluster1-differentiation.md');
const clusterJsonPath = path.join(reportDir, 'navicue-atom-cluster1-differentiation.json');
const clusterIngestPath = path.join(ingestDir, 'navicue-atom-cluster1-differentiation-pack.json');

if (!fs.existsSync(auditPath)) {
  console.error('Missing full audit. Run "npm run atoms:audit:full" first.');
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8')) as { atoms: AuditAtom[] };
const TARGET_CLUSTER = 'canvas|full|draggable|none|resolved|continuous|haptics';

const rows = audit.atoms
  .filter((atom) => atom.repetitionKey === TARGET_CLUSTER)
  .sort((a, b) => a.number - b.number)
  .map((atom) => {
    const primaryAxis = derivePrimaryAxis(atom);
    const sensorEscalation = deriveSensorEscalation(atom);
    const closureUpgrade = deriveClosureUpgrade(atom);
    const occupancyUpgrade = deriveOccupancyUpgrade(atom);
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
      sensorEscalation,
      closureUpgrade,
      occupancyUpgrade,
      clusterRule:
        'Differentiate drag atoms by counterforce and destination law, not by visual object theme.',
    };
  });

const pack = {
  generatedAt: new Date().toISOString(),
  repetitionKey: TARGET_CLUSTER,
  count: rows.length,
  operatingRule:
    'This pack exists to break sameness in the largest drag-based cluster by assigning each atom a primary differentiation axis.',
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
console.log(`Cluster 1 atoms: ${rows.length}`);

function derivePrimaryAxis(atom: AuditAtom) {
  if (atom.physicsTags.includes('gravitational')) return 'Change destination law: orbit, drop, levitate, anchor, escape';
  if (atom.physicsTags.includes('network')) return 'Change propagation law: local pull, cascade, routing, field recruitment';
  if (atom.physicsTags.includes('optical')) return 'Change reveal law: refocus, strip distortion, expose hidden layer';
  if (atom.physicsTags.includes('fluid')) return 'Change drag law: eddy, stream, pressure gradient, viscosity shift';
  return 'Change counterforce law so the same drag gesture solves a different equation';
}

function deriveSensorEscalation(atom: AuditAtom) {
  if (atom.sensoryProfile.includes('breath')) return 'Already breath-aware; consider stronger cadence consequence instead of adding noise';
  if (atom.sensoryProfile.includes('audio')) return 'Protect audio distinctiveness; avoid collapsing back to silent drag';
  return 'Candidate for secondary sensor channel: breath, microphone, or gyroscope if it deepens the law';
}

function deriveClosureUpgrade(atom: AuditAtom) {
  if (atom.resolutionProfile === 'state-morph') return 'Protect state morph but vary the aftermath so endings do not all feel like the same morph';
  if (atom.resolutionProfile === 'field-recompose') return 'Push the field recompose harder so the whole environment visibly reorganizes';
  return 'Upgrade closure into a stronger threshold morph or field aftermath';
}

function deriveOccupancyUpgrade(atom: AuditAtom) {
  if (atom.collectionNumber >= 5) return 'Use depth, pressure, or materiality so the atom commands the whole phone';
  return 'Protect hero occupancy; do not let the drag zone shrink into local UI behavior';
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
    'sensor_escalation',
    'closure_upgrade',
    'occupancy_upgrade',
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
        row.sensorEscalation,
        row.closureUpgrade,
        row.occupancyUpgrade,
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
    '# NaviCue Atom Cluster 1 Differentiation',
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
    '- differentiate by counterforce law',
    '- differentiate by destination law',
    '- add secondary sensors only when they sharpen the law',
    '- stop relying on the same resolved drag grammar for distinct concepts',
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
