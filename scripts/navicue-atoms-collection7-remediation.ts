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
  structural: {
    structuralScore: number;
    triageTier: 'hero-candidate' | 'composition-sensitive' | 'likely-underpowered';
  };
  therapeuticJobs: string[];
  physicsTags: string[];
  repetitionKey: string;
  repetitionClusterSize: number;
  refinementPriority: 'low' | 'medium' | 'high' | 'critical';
}

interface SignoffRow {
  atomId: string;
  atomNumber: number;
  atomName: string;
  reviewLane: 'signature-pass' | 'hero-pass' | 'composition-pass' | 'rebuild-pass';
  proposedHeroGrade: string;
  dominantVerbSeed: string;
  counterforceTypeSeed: string;
  resolutionClassSeed: string;
}

const root = process.cwd();
const reportDir = path.join(root, 'docs', 'reports');
const ingestDir = path.join(root, 'system', 'ingest', 'navicue-atoms');
const auditPath = path.join(reportDir, 'navicue-atoms-full-audit.json');
const signoffPath = path.join(reportDir, 'navicue-atom-signoff-scaffold.json');
const outJsonPath = path.join(reportDir, 'navicue-atom-collection7-remediation.json');
const outMdPath = path.join(reportDir, 'navicue-atom-collection7-remediation.md');
const outCsvPath = path.join(reportDir, 'navicue-atom-collection7-remediation.csv');
const outIngestPath = path.join(ingestDir, 'navicue-atom-collection7-remediation-pack.json');

if (!fs.existsSync(auditPath) || !fs.existsSync(signoffPath)) {
  console.error('Missing audit/signoff inputs. Run "npm run atoms:signoff:seed" first.');
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8')) as { atoms: AuditAtom[] };
const signoff = JSON.parse(fs.readFileSync(signoffPath, 'utf8')) as { rows: SignoffRow[] };
const signoffById = new Map(signoff.rows.map((row) => [row.atomId, row]));

const rows = audit.atoms
  .filter((atom) => atom.collectionNumber === 7)
  .sort((a, b) => priorityWeight(b.refinementPriority) - priorityWeight(a.refinementPriority) || b.repetitionClusterSize - a.repetitionClusterSize || a.number - b.number)
  .map((atom) => {
    const signoffRow = signoffById.get(atom.id)!;
    return {
      atomNumber: atom.number,
      atomId: atom.id,
      atomName: atom.name,
      seriesNumber: atom.seriesNumber,
      seriesName: atom.seriesName,
      reviewLane: signoffRow.reviewLane,
      proposedHeroGrade: signoffRow.proposedHeroGrade,
      structuralScore: atom.structural.structuralScore,
      repetitionClusterSize: atom.repetitionClusterSize,
      refinementPriority: atom.refinementPriority,
      dominantVerbSeed: signoffRow.dominantVerbSeed,
      counterforceTypeSeed: signoffRow.counterforceTypeSeed,
      resolutionClassSeed: signoffRow.resolutionClassSeed,
      remediationAxis: deriveRemediationAxis(atom, signoffRow),
      nextMove: deriveNextMove(atom, signoffRow),
    };
  });

const seriesSummary = summarizeBySeries(rows);

const pack = {
  generatedAt: new Date().toISOString(),
  collectionNumber: 7,
  totalAtoms: rows.length,
  seriesSummary,
  rows,
  operatingRule:
    'Collection 7 needs signature lift and repetition relief. Promote only the strongest outliers, then differentiate the bulk by counterforce law and closure.',
};

fs.writeFileSync(outJsonPath, JSON.stringify(pack, null, 2));
fs.writeFileSync(outCsvPath, buildCsv(rows));
fs.writeFileSync(outMdPath, buildMarkdown(pack));
fs.writeFileSync(outIngestPath, JSON.stringify(pack, null, 2));

console.log(`Wrote ${path.relative(root, outJsonPath)}`);
console.log(`Wrote ${path.relative(root, outMdPath)}`);
console.log(`Wrote ${path.relative(root, outCsvPath)}`);
console.log(`Wrote ${path.relative(root, outIngestPath)}`);
console.log(`Collection 7 atoms: ${rows.length}`);

function deriveRemediationAxis(atom: AuditAtom, signoffRow: SignoffRow) {
  if (signoffRow.reviewLane === 'hero-pass') return 'Protect outlier quality and use as seed for collection identity';
  if (atom.repetitionClusterSize >= 20) return 'Break sameness by counterforce and closure, not by theme naming';
  if (atom.refinementPriority === 'high' || atom.refinementPriority === 'critical') return 'Tighten hero occupancy and consequence before any promotion';
  return 'Refine by sharpening primary law and resolution aftermath';
}

function deriveNextMove(atom: AuditAtom, signoffRow: SignoffRow) {
  if (signoffRow.reviewLane === 'hero-pass') return 'Shortlist for manual hero polish and potential promotion';
  if (atom.repetitionClusterSize >= 30) return 'Route into cluster remediation before further curation';
  if (atom.refinementPriority === 'high' || atom.refinementPriority === 'critical') return 'Route into high-priority composition pass';
  return 'Hold for later collection-specific polish';
}

function summarizeBySeries(rows: typeof rows) {
  const seriesMap = new Map<number, typeof rows>();
  for (const row of rows) {
    const items = seriesMap.get(row.seriesNumber) ?? [];
    items.push(row);
    seriesMap.set(row.seriesNumber, items);
  }
  return [...seriesMap.entries()]
    .map(([seriesNumber, items]) => ({
      seriesNumber,
      seriesName: items[0].seriesName,
      total: items.length,
      hero: items.filter((item) => item.reviewLane === 'hero-pass').length,
      avgRepetition: round(avg(items.map((item) => item.repetitionClusterSize))),
      highPriority: items.filter((item) => item.refinementPriority === 'high' || item.refinementPriority === 'critical').length,
    }))
    .sort((a, b) => b.avgRepetition - a.avgRepetition || a.seriesNumber - b.seriesNumber);
}

function buildCsv(rows: typeof rows) {
  const headers = [
    'atom_number',
    'atom_id',
    'atom_name',
    'series_number',
    'series_name',
    'review_lane',
    'proposed_hero_grade',
    'structural_score',
    'repetition_cluster_size',
    'refinement_priority',
    'dominant_verb_seed',
    'counterforce_type_seed',
    'resolution_class_seed',
    'remediation_axis',
    'next_move',
  ];
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.atomNumber,
        row.atomId,
        row.atomName,
        row.seriesNumber,
        row.seriesName,
        row.reviewLane,
        row.proposedHeroGrade,
        row.structuralScore,
        row.repetitionClusterSize,
        row.refinementPriority,
        row.dominantVerbSeed,
        row.counterforceTypeSeed,
        row.resolutionClassSeed,
        row.remediationAxis,
        row.nextMove,
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  return `${lines.join('\n')}\n`;
}

function buildMarkdown(pack: typeof pack) {
  return [
    '# NaviCue Atom Collection 7 Remediation',
    '',
    `Generated: ${pack.generatedAt}`,
    '',
    `Collection: ${pack.collectionNumber}`,
    `Atoms: ${pack.totalAtoms}`,
    '',
    '## Operating Rule',
    '',
    pack.operatingRule,
    '',
    '## Series Summary',
    '',
    ...pack.seriesSummary.map(
      (item) =>
        `- Series ${item.seriesNumber} ${item.seriesName}: hero ${item.hero}, avg repetition ${item.avgRepetition}, high priority ${item.highPriority}`
    ),
    '',
  ].join('\n');
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function priorityWeight(priority: string) {
  if (priority === 'critical') return 4;
  if (priority === 'high') return 3;
  if (priority === 'medium') return 2;
  return 1;
}

function csvEscape(value: string | number) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
