#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(__filename), '..');
const DEFAULT_INPUTS = [
  path.resolve(ROOT_DIR, 'Command Center Execution Plan/tokens/zeroheight.tokens.supported.json'),
  path.resolve(ROOT_DIR, 'New2.json'),
];
const DEFAULT_OUTPUT_DIR = path.resolve(
  ROOT_DIR,
  'Command Center Execution Plan/guidelines/navicue_reverse_engineering/out',
);

function parseArgs(argv) {
  const args = {
    inputs: [...DEFAULT_INPUTS],
    outputDir: DEFAULT_OUTPUT_DIR,
    snapshotLabel: `navicue_tokens_${new Date().toISOString().slice(0, 10)}`,
    snapshotVersion: null,
    sourceRef: null,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    const next = argv[i + 1];

    if (token === '--input' && next) {
      const parsed = next
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .map((entry) => path.resolve(process.cwd(), entry));
      if (parsed.length > 0) {
        args.inputs = parsed;
      }
      i += 1;
      continue;
    }

    if (token === '--output-dir' && next) {
      args.outputDir = path.resolve(process.cwd(), next);
      i += 1;
      continue;
    }

    if (token === '--snapshot-label' && next) {
      args.snapshotLabel = next.trim();
      i += 1;
      continue;
    }

    if (token === '--snapshot-version' && next) {
      args.snapshotVersion = next.trim();
      i += 1;
      continue;
    }

    if (token === '--source-ref' && next) {
      args.sourceRef = next.trim();
      i += 1;
      continue;
    }
  }

  return args;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function inferTokenType(value, lastKey = '') {
  const key = String(lastKey || '').toLowerCase();

  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';

  if (Array.isArray(value)) {
    if (
      value.length === 4
      && value.every((entry) => typeof entry === 'number')
      && /(ease|bezier|curve|timing)/.test(key)
    ) {
      return 'cubicBezier';
    }
    return 'array';
  }

  if (typeof value === 'string') {
    const v = value.trim();
    if (/^#([0-9a-f]{3,8})$/i.test(v) || /^(rgba?|hsla?)\(/i.test(v)) return 'color';
    if (/^-?\d+(\.\d+)?(ms|s)$/i.test(v)) return 'duration';
    if (/^-?\d+(\.\d+)?(px|rem|em|%)$/i.test(v)) return 'dimension';
    if (key.includes('font') && !key.includes('weight') && !key.includes('size')) return 'fontFamily';
    if (key.includes('weight')) return 'fontWeight';
    return 'string';
  }

  if (value === null) return 'null';
  if (isPlainObject(value)) return 'object';
  return 'other';
}

function normalizeValue(value) {
  if (value === null) return 'null';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function flattenTokenTree(root, sourceFile, sourceSystem) {
  const results = [];

  function walk(node, pathParts = []) {
    if (isPlainObject(node) && Object.prototype.hasOwnProperty.call(node, '$value')) {
      const value = node.$value;
      const tokenType = typeof node.$type === 'string' && node.$type.trim()
        ? node.$type.trim()
        : inferTokenType(value, pathParts[pathParts.length - 1]);

      const tokenKey = pathParts.join('.');
      if (!tokenKey) return;

      results.push({
        token_key: tokenKey,
        token_path: tokenKey,
        token_category: pathParts[0] || 'root',
        token_type: tokenType,
        token_value: value,
        normalized_value: normalizeValue(value),
        source_system: sourceSystem,
        source_file: sourceFile,
        metadata: {
          source_format: 'dtcg',
          path_depth: pathParts.length,
        },
      });
      return;
    }

    if (Array.isArray(node) || typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean' || node === null) {
      const tokenKey = pathParts.join('.');
      if (!tokenKey) return;

      results.push({
        token_key: tokenKey,
        token_path: tokenKey,
        token_category: pathParts[0] || 'root',
        token_type: inferTokenType(node, pathParts[pathParts.length - 1]),
        token_value: node,
        normalized_value: normalizeValue(node),
        source_system: sourceSystem,
        source_file: sourceFile,
        metadata: {
          source_format: 'raw',
          path_depth: pathParts.length,
        },
      });
      return;
    }

    if (!isPlainObject(node)) return;

    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      walk(value, [...pathParts, key]);
    }
  }

  walk(root, []);
  return results;
}

function sqlText(value) {
  if (value === null || value === undefined) return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return `${sqlText(JSON.stringify(value))}::jsonb`;
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function main() {
  const args = parseArgs(process.argv);

  const existingInputs = args.inputs.filter((inputPath) => fs.existsSync(inputPath));
  if (existingInputs.length === 0) {
    throw new Error(`No token inputs found. Checked: ${args.inputs.join(', ')}`);
  }

  const sourcePriority = [];
  const tokenRecords = [];

  for (const inputPath of existingInputs) {
    const raw = fs.readFileSync(inputPath, 'utf8');
    const parsed = JSON.parse(raw);
    const sourceSystem = /zeroheight/i.test(inputPath) ? 'zeroheight' : 'navicue_local';
    sourcePriority.push({ file: inputPath, source_system: sourceSystem });

    const flattened = flattenTokenTree(parsed, inputPath, sourceSystem);
    tokenRecords.push(...flattened);
  }

  const deduped = new Map();
  let duplicateCount = 0;

  for (const record of tokenRecords) {
    if (!record.token_key) continue;
    if (!deduped.has(record.token_key)) {
      deduped.set(record.token_key, record);
      continue;
    }
    duplicateCount += 1;
  }

  const records = Array.from(deduped.values()).sort((a, b) => a.token_key.localeCompare(b.token_key));

  ensureDir(args.outputDir);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseName = `navicue_design_token_seed_${timestamp}`;
  const sqlPath = path.join(args.outputDir, `${baseName}.sql`);
  const csvPath = path.join(args.outputDir, `${baseName}.csv`);
  const summaryPath = path.join(args.outputDir, `${baseName}.summary.json`);

  const sqlLines = [];
  sqlLines.push('-- Generated by scripts/build-navicue-design-token-seed.mjs');
  sqlLines.push('begin;');

  for (const row of records) {
    sqlLines.push(
      'insert into public.navicue_design_token_registry ('
      + 'token_key, token_path, token_category, token_type, token_value, normalized_value, source_system, source_file, source_ref, metadata'
      + ') values ('
      + `${sqlText(row.token_key)}, `
      + `${sqlText(row.token_path)}, `
      + `${sqlText(row.token_category)}, `
      + `${sqlText(row.token_type)}, `
      + `${sqlJson(row.token_value)}, `
      + `${sqlText(row.normalized_value)}, `
      + `${sqlText(row.source_system)}, `
      + `${sqlText(row.source_file)}, `
      + `${sqlText(args.sourceRef)}, `
      + `${sqlJson(row.metadata)}`
      + ') '
      + 'on conflict (token_key) do update set '
      + 'token_path = excluded.token_path, '
      + 'token_category = excluded.token_category, '
      + 'token_type = excluded.token_type, '
      + 'token_value = excluded.token_value, '
      + 'normalized_value = excluded.normalized_value, '
      + 'source_system = excluded.source_system, '
      + 'source_file = excluded.source_file, '
      + 'source_ref = excluded.source_ref, '
      + 'metadata = excluded.metadata, '
      + 'is_active = true, '
      + 'updated_at = now();',
    );
  }

  const snapshotMetadata = {
    generated_by: 'scripts/build-navicue-design-token-seed.mjs',
    inputs: existingInputs,
    deduped_token_count: records.length,
    duplicate_count: duplicateCount,
  };

  sqlLines.push(
    `select public.f_navicue_token_snapshot_create(${sqlText(args.snapshotLabel)}, ${sqlText(args.snapshotVersion)}, ${sqlText(args.sourceRef)}, 'seed_builder', ${sqlJson(snapshotMetadata)}) as snapshot_id;`,
  );
  sqlLines.push('commit;');

  fs.writeFileSync(sqlPath, `${sqlLines.join('\n')}\n`, 'utf8');

  const csvHeader = [
    'token_key',
    'token_path',
    'token_category',
    'token_type',
    'normalized_value',
    'source_system',
    'source_file',
  ];

  const csvRows = [csvHeader.join(',')];
  for (const row of records) {
    csvRows.push([
      csvEscape(row.token_key),
      csvEscape(row.token_path),
      csvEscape(row.token_category),
      csvEscape(row.token_type),
      csvEscape(row.normalized_value),
      csvEscape(row.source_system),
      csvEscape(row.source_file),
    ].join(','));
  }
  fs.writeFileSync(csvPath, `${csvRows.join('\n')}\n`, 'utf8');

  const summary = {
    generated_at: new Date().toISOString(),
    inputs: existingInputs,
    snapshot: {
      label: args.snapshotLabel,
      version: args.snapshotVersion,
      source_ref: args.sourceRef,
    },
    token_counts: {
      scanned: tokenRecords.length,
      deduped: records.length,
      duplicates_ignored: duplicateCount,
    },
    outputs: {
      sql: sqlPath,
      csv: csvPath,
      summary: summaryPath,
    },
  };

  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  console.log(`Token seed SQL: ${sqlPath}`);
  console.log(`Token seed CSV: ${csvPath}`);
  console.log(`Summary: ${summaryPath}`);
  console.log(`Tokens (deduped): ${records.length}`);
}

main();
