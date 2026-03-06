import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ingestDir = path.join(root, 'system', 'ingest', 'navicue-atoms');
const stageJsonPath = path.join(ingestDir, 'navicue-atom-approved-stage-rows.json');
const stageSqlPath = path.join(ingestDir, 'navicue-atom-approved-stage-rows.sql');

if (!fs.existsSync(stageJsonPath)) {
  console.error('Missing approved stage rows. Run "npm run atoms:stage:approved" first.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(stageJsonPath, 'utf8')) as {
  batch_id: string;
  rows: Array<{ batch_id: string; atom_id: string; payload: Record<string, unknown> }>;
};

const values = data.rows
  .map((row) => {
    const payload = JSON.stringify(row.payload).replace(/'/g, "''");
    const source = String((row.payload as { source?: string }).source ?? 'approved-stage').replace(/'/g, "''");
    return `('${row.batch_id.replace(/'/g, "''")}', '${row.atom_id.replace(/'/g, "''")}', '${payload}'::jsonb, '${source}')`;
  })
  .join(',\n');

const sql = [
  '-- Approved atom stage rows',
  '-- Run after navicue-atom-staging-schema.sql',
  '',
  'insert into public.stg_navicue_atom_payloads (batch_id, atom_id, payload, source)',
  values.length ? `values\n${values}` : 'values',
  'on conflict (batch_id, atom_id) do update',
  'set payload = excluded.payload,',
  '    source = excluded.source,',
  '    inserted_at = now();',
  '',
].join('\n');

fs.writeFileSync(stageSqlPath, sql);
console.log(`Wrote ${path.relative(root, stageSqlPath)}`);
