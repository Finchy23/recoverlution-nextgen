import fs from 'node:fs';
import path from 'node:path';

interface RemediationRow {
  atomNumber: number;
  atomId: string;
  atomName: string;
  seriesNumber: number;
  seriesName: string;
  reviewLane: 'signature-pass' | 'hero-pass' | 'composition-pass' | 'rebuild-pass';
  proposedHeroGrade: string;
  structuralScore: number;
  repetitionClusterSize: number;
  refinementPriority: 'low' | 'medium' | 'high' | 'critical';
  remediationAxis: string;
  nextMove: string;
}

interface SeriesSummaryRow {
  seriesNumber: number;
  seriesName: string;
  total: number;
  hero: number;
  avgRepetition: number;
  highPriority: number;
}

const root = process.cwd();
const reportDir = path.join(root, 'docs', 'reports');
const ingestDir = path.join(root, 'system', 'ingest', 'navicue-atoms');
const remediationPath = path.join(reportDir, 'navicue-atom-collection7-remediation.json');
const outJsonPath = path.join(reportDir, 'navicue-atom-collection7-execution.json');
const outMdPath = path.join(reportDir, 'navicue-atom-collection7-execution.md');
const outCsvPath = path.join(reportDir, 'navicue-atom-collection7-execution.csv');
const outIngestPath = path.join(ingestDir, 'navicue-atom-collection7-execution-pack.json');

if (!fs.existsSync(remediationPath)) {
  console.error('Missing Collection 7 remediation pack. Run "npm run atoms:collection7:remediate" first.');
  process.exit(1);
}

const remediation = JSON.parse(fs.readFileSync(remediationPath, 'utf8')) as {
  collectionNumber: number;
  totalAtoms: number;
  seriesSummary: SeriesSummaryRow[];
  rows: RemediationRow[];
};

const orderedSeries = remediation.seriesSummary
  .map((series) => ({
    ...series,
    executionPressure:
      series.highPriority * 3 +
      series.avgRepetition * 0.8 +
      Math.max(0, 4 - series.hero) * 2,
  }))
  .sort((a, b) => b.executionPressure - a.executionPressure || a.seriesNumber - b.seriesNumber)
  .map((series, index) => ({
    ...series,
    executionWave: index < 3 ? 'wave-1' : index < 6 ? 'wave-2' : index < 8 ? 'wave-3' : 'wave-4',
    executionDirective:
      index < 3
        ? 'Differentiate first. Attack cluster sameness before polishing.'
        : index < 6
          ? 'Tighten consequence and closure after the first wave lands.'
          : 'Protect the outliers and resolve the remaining overlap.'
  }));

const seriesWaveByNumber = new Map(orderedSeries.map((series) => [series.seriesNumber, series.executionWave]));

const rows = remediation.rows.map((row) => ({
  ...row,
  executionWave: seriesWaveByNumber.get(row.seriesNumber) ?? 'wave-4',
  executionReason: deriveExecutionReason(row),
  executionAction: deriveExecutionAction(row),
}));

const pack = {
  generatedAt: new Date().toISOString(),
  collectionNumber: remediation.collectionNumber,
  totalAtoms: remediation.totalAtoms,
  operatingRule:
    'Run Collection 7 by wave, not by sequence. Break repetition first, protect outliers second, then polish the remainder.',
  seriesWaveOrder: orderedSeries,
  rows,
};

fs.writeFileSync(outJsonPath, JSON.stringify(pack, null, 2));
fs.writeFileSync(outCsvPath, buildCsv(rows));
fs.writeFileSync(outMdPath, buildMarkdown(pack));
fs.writeFileSync(outIngestPath, JSON.stringify(pack, null, 2));

console.log(`Wrote ${path.relative(root, outJsonPath)}`);
console.log(`Wrote ${path.relative(root, outMdPath)}`);
console.log(`Wrote ${path.relative(root, outCsvPath)}`);
console.log(`Wrote ${path.relative(root, outIngestPath)}`);
console.log(`Collection 7 execution rows: ${rows.length}`);

function deriveExecutionReason(row: RemediationRow) {
  if (row.reviewLane === 'hero-pass') return 'Protect the outlier. Use it as a local benchmark for the series.';
  if (row.repetitionClusterSize >= 50) return 'High cluster pressure. Differentiate before anything else.';
  if (row.refinementPriority === 'critical' || row.refinementPriority === 'high') return 'High refinement pressure. Tighten consequence and closure.';
  return 'Secondary polish after the high-pressure atoms move.';
}

function deriveExecutionAction(row: RemediationRow) {
  if (row.reviewLane === 'hero-pass') return 'Manual hero polish only. Do not dilute the current law.';
  if (row.repetitionClusterSize >= 50) return 'Rework counterforce and aftermath so the mechanic stops overlapping with its cluster.';
  if (row.refinementPriority === 'critical' || row.refinementPriority === 'high') return 'Increase hero occupancy, consequence, and visible resolution artifact.';
  return 'Hold until wave pressure above it is reduced.';
}

function buildCsv(rows: typeof pack.rows) {
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
    'execution_wave',
    'execution_reason',
    'execution_action',
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
        row.executionWave,
        row.executionReason,
        row.executionAction,
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  return `${lines.join('\n')}\n`;
}

function buildMarkdown(pack: typeof pack) {
  return [
    '# NaviCue Atom Collection 7 Execution Queue',
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
    '## Series Wave Order',
    '',
    ...pack.seriesWaveOrder.map(
      (series) =>
        `- ${series.executionWave}: Series ${series.seriesNumber} ${series.seriesName} (pressure ${round(series.executionPressure)}, hero ${series.hero}, avg repetition ${series.avgRepetition})`
    ),
    '',
  ].join('\n');
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function csvEscape(value: string | number) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
