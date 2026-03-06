import fs from 'node:fs';
import path from 'node:path';

interface AuditAtom {
  id: string;
  number: number;
  name: string;
  seriesNumber: number;
  seriesName: string;
  collectionNumber: number;
  therapeuticJobs: string[];
  physicsTags: string[];
  repetitionKey: string;
  resolutionProfile: string;
}

const root = process.cwd();
const reportDir = path.join(root, 'docs', 'reports');
const ingestDir = path.join(root, 'system', 'ingest', 'navicue-atoms');
const auditPath = path.join(reportDir, 'navicue-atoms-full-audit.json');
const clusterCsvPath = path.join(reportDir, 'navicue-atom-cluster3-differentiation.csv');
const clusterMdPath = path.join(reportDir, 'navicue-atom-cluster3-differentiation.md');
const clusterJsonPath = path.join(reportDir, 'navicue-atom-cluster3-differentiation.json');
const clusterIngestPath = path.join(ingestDir, 'navicue-atom-cluster3-differentiation-pack.json');

if (!fs.existsSync(auditPath)) {
  console.error('Missing full audit. Run "npm run atoms:audit:full" first.');
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8')) as { atoms: AuditAtom[] };
const TARGET_CLUSTER = 'canvas|full|tappable|none|resolved|discrete|haptics';

const rows = audit.atoms
  .filter((atom) => atom.repetitionKey === TARGET_CLUSTER)
  .sort((a, b) => a.number - b.number)
  .map((atom) => ({
    atomNumber: atom.number,
    atomId: atom.id,
    atomName: atom.name,
    collectionNumber: atom.collectionNumber,
    seriesNumber: atom.seriesNumber,
    seriesName: atom.seriesName,
    therapeuticJobs: atom.therapeuticJobs,
    physicsTags: atom.physicsTags,
    primaryDifferentiationAxis: derivePrimaryAxis(atom),
    ignitionLaw: deriveIgnitionLaw(atom),
    narrativeRisk: deriveNarrativeRisk(atom),
    closureUpgrade: deriveClosureUpgrade(atom),
    clusterRule:
      'Differentiate discrete tap atoms by what the tap ignites, collapses, or reconfigures after contact, not by swapping labels on the same trigger.',
  }));

const pack = {
  generatedAt: new Date().toISOString(),
  repetitionKey: TARGET_CLUSTER,
  count: rows.length,
  operatingRule:
    'This pack exists to break sameness in the largest resolved-discrete tap cluster by forcing stronger ignition law and richer aftermath.',
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
console.log(`Cluster 3 atoms: ${rows.length}`);

function derivePrimaryAxis(atom: AuditAtom) {
  if (atom.physicsTags.includes('network')) return 'Differentiate by what gets routed or connected after contact';
  if (atom.physicsTags.includes('fluid')) return 'Differentiate by where the field floods, clears, or settles after contact';
  if (atom.physicsTags.includes('structural')) return 'Differentiate by what gets assembled, snapped, or stabilized after contact';
  if (atom.physicsTags.includes('optical')) return 'Differentiate by what becomes visible after contact';
  if (atom.physicsTags.includes('gravitational')) return 'Differentiate by what gets dropped, anchored, or centered after contact';
  return 'Differentiate by aftermath law so the same tap does not resolve into the same feeling';
}

function deriveIgnitionLaw(atom: AuditAtom) {
  if (atom.therapeuticJobs.includes('regulation')) return 'Tap should dampen or settle a live system, not merely toggle it';
  if (atom.therapeuticJobs.includes('boundary') || atom.therapeuticJobs.includes('agency')) {
    return 'Tap should establish a field condition or line-hold, not just trigger a burst';
  }
  if (atom.therapeuticJobs.includes('perspective') || atom.therapeuticJobs.includes('identity')) {
    return 'Tap should cause a decisive reveal, inversion, or reframing event';
  }
  return 'Tap should ignite a real state change with a visible memory trace';
}

function deriveNarrativeRisk(atom: AuditAtom) {
  if (atom.therapeuticJobs.includes('perspective') || atom.therapeuticJobs.includes('identity')) {
    return 'High risk of becoming a conceptual button. Keep the meaning in the field change, not the caption.';
  }
  if (atom.therapeuticJobs.includes('agency') || atom.therapeuticJobs.includes('boundary')) {
    return 'Risk of generic empowerment. The tap must create a specific post-contact condition.';
  }
  return 'Moderate risk. Protect distinct consequence over explanation.';
}

function deriveClosureUpgrade(atom: AuditAtom) {
  if (atom.resolutionProfile === 'field-recompose') {
    return 'Push the whole frame to recompose so the tap feels catalytic, not incidental.';
  }
  if (atom.resolutionProfile === 'seal') {
    return 'Avoid overusing seal endings; diversify into burst, bloom, anchor, or reveal where the law supports it.';
  }
  return 'Strengthen the aftermath until the tap leaves a memorable state change.';
}

function buildCsv(rows: typeof pack.rows) {
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
    'ignition_law',
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
        row.ignitionLaw,
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
    '# NaviCue Atom Cluster 3 Differentiation',
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
    '- differentiate by ignition law',
    '- make the tap catalytic, not decorative',
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
