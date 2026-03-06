import fs from 'node:fs';
import path from 'node:path';

interface ApprovedPackRow {
  atomId: string;
  atomNumber: number;
  atomName: string;
  manualHeroGrade: string;
  ingestReadiness: string;
  reviewer?: string;
  reviewedAt?: string;
}

interface ApprovedPack {
  rows: ApprovedPackRow[];
}

const root = process.cwd();
const reportDir = path.join(root, 'docs', 'reports');
const ingestDir = path.join(root, 'system', 'ingest', 'navicue-atoms');
const wave1Path = path.join(reportDir, 'navicue-atom-wave1-benchmark.json');
const wave2Path = path.join(reportDir, 'navicue-atom-wave2-hero.json');
const stageJsonPath = path.join(ingestDir, 'navicue-atom-approved-stage-rows.json');
const stageNdjsonPath = path.join(ingestDir, 'navicue-atom-approved-stage-rows.ndjson');
const stageCsvPath = path.join(ingestDir, 'navicue-atom-approved-stage-rows.csv');

if (!fs.existsSync(wave1Path) || !fs.existsSync(wave2Path)) {
  console.error('Missing wave1/wave2 packs. Run benchmark and hero passes first.');
  process.exit(1);
}

const wave1 = JSON.parse(fs.readFileSync(wave1Path, 'utf8')) as ApprovedPack;
const wave2 = JSON.parse(fs.readFileSync(wave2Path, 'utf8')) as ApprovedPack;
const batchId = `navicue-atom-approved-${new Date().toISOString()}`;

const rows = [...wave1.rows, ...wave2.rows].map((row) => ({
  batch_id: batchId,
  atom_id: row.atomId,
  payload: {
    atom_id: row.atomId,
    atom_number: row.atomNumber,
    atom_name: row.atomName,
    approved_grade: row.manualHeroGrade,
    ingest_readiness: row.ingestReadiness,
    reviewer: row.reviewer ?? 'codex',
    reviewed_at: row.reviewedAt ?? new Date().toISOString(),
    source: row.manualHeroGrade === 'signature' ? 'wave1-benchmark' : 'wave2-hero',
  },
}));

fs.writeFileSync(stageJsonPath, JSON.stringify({ batch_id: batchId, rows }, null, 2));
fs.writeFileSync(stageNdjsonPath, `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`);
fs.writeFileSync(stageCsvPath, buildCsv(rows));

console.log(`Wrote ${path.relative(root, stageJsonPath)}`);
console.log(`Wrote ${path.relative(root, stageNdjsonPath)}`);
console.log(`Wrote ${path.relative(root, stageCsvPath)}`);
console.log(`Approved staged rows: ${rows.length}`);

function buildCsv(rows: typeof rows) {
  const headers = ['batch_id', 'atom_id', 'payload_json'];
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push([row.batch_id, row.atom_id, JSON.stringify(row.payload)].map(csvEscape).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function csvEscape(value: string | number) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
