import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type HandoffManifest = {
  generatedAt: string;
  project: {
    name: string;
    packageName: string;
    liveUrl: string;
  };
  canonical: {
    tokenSource: string;
    generatedCss: string;
    generatedJson: string;
    appEntry: string;
    designCenterEntry: string;
    atomsRegistry: string;
  };
  commands: {
    dev: string;
    qa: string;
    build: string;
    figmaHandoff: string;
  };
  routes: string[];
  notes: string[];
};

async function main(): Promise<void> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const root = path.resolve(__dirname, '..');
  const outDir = path.join(root, 'handoff');
  const manifestPath = path.join(outDir, 'figma-handoff.manifest.json');
  const readmePath = path.join(outDir, 'FIGMA_HANDOFF.md');

  const manifest: HandoffManifest = {
    generatedAt: new Date().toISOString(),
    project: {
      name: 'Recoverlution Design Center',
      packageName: '@recoverlution/design-center',
      liveUrl: 'https://recoverlution-design-center.vercel.app/design-center',
    },
    canonical: {
      tokenSource: 'src/design-tokens.ts',
      generatedCss: 'src/styles/design-tokens.css',
      generatedJson: 'tokens/design-tokens.flat.json',
      appEntry: 'src/app/App.tsx',
      designCenterEntry: 'src/app/pages/DesignCenter.tsx',
      atomsRegistry: 'src/app/components/atoms/atom-registry.ts',
    },
    commands: {
      dev: 'npm run dev',
      qa: 'npm run qa',
      build: 'npm run build',
      figmaHandoff: 'npm run figma:handoff',
    },
    routes: [
      '/design-center',
      '/design-center/palette',
      '/design-center/type',
      '/design-center/glass',
      '/design-center/motion',
      '/design-center/gates',
      '/atoms',
      '/surfaces',
      '/motion',
      '/voice',
      '/delivery',
      '/player',
      '/showcase',
      '/home',
    ],
    notes: [
      'Treat this workspace as the clean frontend handoff surface for Figma AI.',
      'Do not edit generated token artifacts directly; edit src/design-tokens.ts and regenerate.',
      'Do not treat the old figma-drop Vercel project as canonical.',
      'The live review surface is recoverlution-design-center.vercel.app.',
    ],
  };

  const md = [
    '# Figma Handoff',
    '',
    '## Project',
    `- Name: ${manifest.project.name}`,
    `- Package: \`${manifest.project.packageName}\``,
    `- Live review URL: ${manifest.project.liveUrl}`,
    '',
    '## Canonical files',
    `- Token source: \`${manifest.canonical.tokenSource}\``,
    `- Generated CSS: \`${manifest.canonical.generatedCss}\``,
    `- Generated token JSON: \`${manifest.canonical.generatedJson}\``,
    `- App entry: \`${manifest.canonical.appEntry}\``,
    `- Design Center entry: \`${manifest.canonical.designCenterEntry}\``,
    `- Atoms registry: \`${manifest.canonical.atomsRegistry}\``,
    '',
    '## Commands',
    `- Dev: \`${manifest.commands.dev}\``,
    `- QA: \`${manifest.commands.qa}\``,
    `- Build: \`${manifest.commands.build}\``,
    `- Refresh handoff pack: \`${manifest.commands.figmaHandoff}\``,
    '',
    '## Routes',
    ...manifest.routes.map((route) => `- \`${route}\``),
    '',
    '## Notes',
    ...manifest.notes.map((note) => `- ${note}`),
    '',
  ].join('\n');

  await mkdir(outDir, { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  await writeFile(readmePath, `${md}\n`, 'utf8');

  console.log(`Wrote ${manifestPath}`);
  console.log(`Wrote ${readmePath}`);
}

main().catch((error) => {
  console.error('[figma:handoff] failed:', error);
  process.exit(1);
});
