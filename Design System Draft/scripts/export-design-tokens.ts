import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  border,
  colors,
  glassNav,
  mobile,
  motion,
  radius,
  spacing,
  surfaces,
  typography,
  zIndex,
} from '../src/design-tokens';

type TokenTree = Record<string, unknown>;

function toKebab(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function flattenTokens(node: unknown, pathParts: string[], vars: Map<string, string>): void {
  if (node == null) return;
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'boolean') {
    vars.set(pathParts.map(toKebab).join('-'), String(node));
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((value, index) => flattenTokens(value, [...pathParts, String(index)], vars));
    return;
  }
  if (typeof node === 'object') {
    Object.entries(node as TokenTree).forEach(([key, value]) => {
      if (typeof value === 'function') return;
      flattenTokens(value, [...pathParts, key], vars);
    });
  }
}

function buildSemanticAliases(): Record<string, string> {
  return {
    'semantic-colors-surface-base': surfaces.solid.base,
    'semantic-colors-surface-elevated': surfaces.solid.elevated,
    'semantic-colors-ink-primary': colors.neutral.white,
    'semantic-colors-ink-secondary': colors.neutral.gray[300],
    'semantic-colors-ink-tertiary': colors.neutral.gray[400],
    'semantic-colors-ink-inverse': colors.neutral.gray[900],
    'semantic-colors-brand-primary': colors.brand.purple.dark,
    'semantic-colors-brand-primary-bright': colors.brand.purple.primary,
    'semantic-colors-brand-precision': colors.accent.cyan.light,
    'semantic-colors-brand-growth': colors.accent.green.light,
    'semantic-colors-accent-primary': colors.brand.purple.dark,
    'semantic-colors-accent-warm': colors.status.amber.bright,
    'semantic-colors-border-subtle': colors.neutral.gray[700],
    'semantic-colors-border-default': colors.neutral.gray[600],
    'motion-arrive': `${motion.duration.fast} ${motion.easing.default}`,
    'motion-glide': `${motion.duration.default} ${motion.easing.default}`,
    'motion-settle': `${motion.duration.slow} ${motion.easing.smooth}`,
    'motion-confirm': `${motion.duration.fast} ${motion.easing.spring}`,
    'motion-carry': `${motion.duration.slower} ${motion.easing.default}`,
  };
}

function inferTokenType(value: string): 'color' | 'dimension' | 'duration' | 'string' {
  if (
    /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ||
    /^(rgb|rgba|hsl|hsla|linear-gradient|radial-gradient)/i.test(value)
  ) {
    return 'color';
  }
  if (/^-?\d+(\.\d+)?(px|rem|vh|vw|%)$/.test(value)) return 'dimension';
  if (/^-?\d+(\.\d+)?ms$/.test(value)) return 'duration';
  return 'string';
}

async function main(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const root = path.resolve(__dirname, '..');
  const cssOutput = path.join(root, 'src/styles/design-tokens.css');
  const jsonOutput = path.join(root, 'tokens/design-tokens.flat.json');

  const vars = new Map<string, string>();
  const sources = {
    colors,
    surfaces,
    spacing,
    radius,
    border,
    typography,
    motion,
    glassNav,
    mobile,
    zIndex,
  };

  Object.entries(sources).forEach(([namespace, value]) => {
    flattenTokens(value, ['token', namespace], vars);
  });

  Object.entries(buildSemanticAliases()).forEach(([key, value]) => vars.set(key, value));

  const sorted = [...vars.entries()].sort(([a], [b]) => a.localeCompare(b));
  const generatedAt = new Date().toISOString();

  const cssLines = [
    '/* AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY. */',
    '/* Source of truth: src/design-tokens.ts */',
    `/* Generated at: ${generatedAt} */`,
    '',
    ':root {',
    ...sorted.map(([name, value]) => `  --${name}: ${value};`),
    '}',
    '',
  ];

  const jsonTokens = Object.fromEntries(
    sorted.map(([name, value]) => [
      name,
      {
        $value: value,
        $type: inferTokenType(value),
      },
    ]),
  );

  await mkdir(path.dirname(cssOutput), { recursive: true });
  await mkdir(path.dirname(jsonOutput), { recursive: true });
  await writeFile(cssOutput, cssLines.join('\n'), 'utf8');
  await writeFile(jsonOutput, JSON.stringify(jsonTokens, null, 2), 'utf8');

  console.log(`Wrote ${cssOutput}`);
  console.log(`Wrote ${jsonOutput}`);
}

main().catch((error) => {
  console.error('[tokens:export] failed:', error);
  process.exit(1);
});
