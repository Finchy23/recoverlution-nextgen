import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const source = path.join(root, 'packages/design-system/src/runtime/design-tokens.ts');
const targets = [
  path.join(root, 'apps/design-center/src/design-tokens.ts'),
];

const sourceContent = await fs.readFile(source, 'utf8');

for (const target of targets) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  const targetContent = sourceContent;
  await fs.writeFile(target, targetContent);
  console.log(`synced ${path.relative(root, target)}`);
}
