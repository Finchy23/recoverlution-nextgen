#!/usr/bin/env node
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, 'tokens');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'zeroheight.tokens.json');
const MIRROR_OUTPUT_FILE = path.join(
  ROOT_DIR,
  'figma-drop',
  'tokens',
  'zeroheight.tokens.json',
);

function sanitizeForJson(value) {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeForJson(entry))
      .filter((entry) => entry !== undefined);
  }

  if (typeof value === 'object') {
    const out = {};
    for (const [key, entry] of Object.entries(value)) {
      const normalized = sanitizeForJson(entry);
      if (normalized !== undefined) {
        out[key] = normalized;
      }
    }
    return out;
  }

  return undefined;
}

function countLeafNodes(value) {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return 1;
  }
  if (Array.isArray(value)) {
    return value.reduce((sum, entry) => sum + countLeafNodes(entry), 0);
  }
  if (typeof value === 'object') {
    return Object.values(value).reduce((sum, entry) => sum + countLeafNodes(entry), 0);
  }
  return 0;
}

async function loadRuntimeModules() {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'navicue-token-export-'));
  const bundlePath = path.join(tmpDir, 'runtime.mjs');

  try {
    await build({
      absWorkingDir: ROOT_DIR,
      stdin: {
        contents: `
import * as design from './src/design-tokens.ts';
import * as blueprint from './src/app/design-system/navicue-blueprint.ts';
import * as mechanics from './src/app/design-system/navicue-mechanics.ts';

export default { design, blueprint, mechanics };
        `,
        resolveDir: ROOT_DIR,
        sourcefile: 'token-export-entry.ts',
        loader: 'ts',
      },
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: ['node20'],
      outfile: bundlePath,
      logLevel: 'silent',
      plugins: [
        {
          name: 'alias-at-src',
          setup(pluginBuild) {
            const resolveAliasPath = (rawPath) => {
              const basePath = path.join(ROOT_DIR, 'src', rawPath.slice(2));
              const candidates = [
                basePath,
                `${basePath}.ts`,
                `${basePath}.tsx`,
                `${basePath}.js`,
                `${basePath}.mjs`,
                `${basePath}.json`,
                path.join(basePath, 'index.ts'),
                path.join(basePath, 'index.tsx'),
                path.join(basePath, 'index.js'),
              ];
              return candidates.find((candidate) => fsSync.existsSync(candidate)) || basePath;
            };

            pluginBuild.onResolve({ filter: /^@\// }, (args) => ({
              path: resolveAliasPath(args.path),
            }));
          },
        },
      ],
    });

    const mod = await import(`${pathToFileURL(bundlePath).href}?t=${Date.now()}`);
    return mod.default;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

async function writeFile(targetPath, jsonContent) {
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, jsonContent, 'utf8');
}

async function run() {
  const runtimeModules = await loadRuntimeModules();
  const schemaPath = path.join(ROOT_DIR, 'navicue_magic_signatures.json');
  const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));

  const designTokens = sanitizeForJson(runtimeModules.design);
  const blueprintTokens = sanitizeForJson(runtimeModules.blueprint);
  const mechanicsTokens = sanitizeForJson(runtimeModules.mechanics);
  const magicSignatureSchema = sanitizeForJson(schema);

  const payload = {
    meta: {
      generated_at: new Date().toISOString(),
      generator: 'scripts/export-design-tokens.mjs',
      format: 'zeroheight-design-token-export-v1',
      canonical_sources: [
        'src/design-tokens.ts',
        'src/app/design-system/navicue-blueprint.ts',
        'src/app/design-system/navicue-mechanics.ts',
        'navicue_magic_signatures.json',
      ],
    },
    tokens: {
      design: designTokens,
      navicue_blueprint: blueprintTokens,
      navicue_mechanics: mechanicsTokens,
      magic_signature_schema: magicSignatureSchema,
    },
    stats: {
      design_leaf_tokens: countLeafNodes(designTokens),
      blueprint_leaf_tokens: countLeafNodes(blueprintTokens),
      mechanics_leaf_tokens: countLeafNodes(mechanicsTokens),
      schema_leaf_tokens: countLeafNodes(magicSignatureSchema),
    },
  };

  const serialized = `${JSON.stringify(payload, null, 2)}\n`;

  await writeFile(OUTPUT_FILE, serialized);
  console.log(`[tokens:export] wrote ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);

  try {
    await fs.access(path.join(ROOT_DIR, 'figma-drop'));
    await writeFile(MIRROR_OUTPUT_FILE, serialized);
    console.log(`[tokens:export] mirrored ${path.relative(ROOT_DIR, MIRROR_OUTPUT_FILE)}`);
  } catch {
    // Mirror workspace is optional; no-op when absent.
  }
}

run().catch((error) => {
  console.error('[tokens:export] failed:', error);
  process.exit(1);
});
