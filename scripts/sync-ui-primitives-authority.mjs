import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const primitiveFiles = [
  'utils.ts',
  'button.tsx',
  'card.tsx',
  'badge.tsx',
  'input.tsx',
  'textarea.tsx',
  'label.tsx',
  'separator.tsx',
];

for (const file of primitiveFiles) {
  const source = path.join(root, 'packages/ui/src/primitives', file);
  const target = path.join(root, 'apps/design-center/src/app/components/ui', file);
  const content = await fs.readFile(source, 'utf8');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
  console.log(`synced ${path.relative(root, target)}`);
}
