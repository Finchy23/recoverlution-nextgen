import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const ingestDir = path.join(root, 'system', 'ingest', 'navicue-atoms');
const stageRowsPath = path.join(ingestDir, 'navicue-atom-approved-stage-rows.json');
const outSqlPath = path.join(ingestDir, 'navicue-atom-approved-promote.sql');

if (!fs.existsSync(stageRowsPath)) {
  console.error('Missing staged atom rows. Run "npm run atoms:stage:approved" first.');
  process.exit(1);
}

const staged = JSON.parse(fs.readFileSync(stageRowsPath, 'utf8')) as {
  batch_id: string;
  rows: Array<unknown>;
};

const sql = [
  '-- Promote approved atom stage rows into the live atom contract tables',
  '-- Run after:',
  '--   1) navicue-atom-staging-schema.sql',
  '--   2) services/supabase/migrations/20260306_navicue_atom_contracts.sql',
  '--   3) navicue-atom-approved-stage-rows.sql',
  '',
  'begin;',
  '',
  `select public.f_navicue_atom_promote_batch('${sqlEscape(staged.batch_id)}');`,
  '',
  'select atom_id, approved_grade, source, reviewed_at',
  'from public.v_navicue_atom_backend_ready',
  `where atom_id in (select atom_id from public.stg_navicue_atom_payloads where batch_id = '${sqlEscape(staged.batch_id)}')`,
  'order by reviewed_at desc, atom_id;',
  '',
  'commit;',
  '',
].join('\n');

fs.writeFileSync(outSqlPath, sql);
console.log(`Wrote ${path.relative(root, outSqlPath)}`);

function sqlEscape(value: string) {
  return value.replace(/'/g, "''");
}
