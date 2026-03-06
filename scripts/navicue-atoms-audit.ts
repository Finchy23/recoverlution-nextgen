import fs from 'node:fs';
import path from 'node:path';
import { ATOM_CATALOG } from '../apps/design-center/src/app/components/atoms/atom-registry.ts';
import { SERIES_CATALOG } from '../apps/design-center/src/app/components/atoms/series-registry.ts';
import {
  deriveStructuralHeroSignals,
  type AtomAuditInput,
  type HeroTriageTier,
} from '../packages/navicue-atoms/src/index.ts';

const root = process.cwd();
const reportDir = path.join(root, 'docs', 'reports');
const reportJson = path.join(reportDir, 'navicue-atoms-audit.json');
const reportMd = path.join(reportDir, 'navicue-atoms-audit.md');

const atoms = Object.values(ATOM_CATALOG).map((atom) => {
  const seriesMeta = SERIES_CATALOG[atom.series];
  const collectionNumber = Math.ceil(seriesMeta.number / 10);
  const audit = deriveStructuralHeroSignals(atom as AtomAuditInput);
  return {
    ...atom,
    collectionNumber,
    seriesNumber: seriesMeta.number,
    seriesName: seriesMeta.name,
    audit,
  };
});

const completeAtoms = atoms.filter((a) => a.status === 'complete');
const countsByTier = countBy(completeAtoms.map((a) => a.audit.triageTier));
const countsByCollection = [...new Set(atoms.map((a) => a.collectionNumber))]
  .sort((a, b) => a - b)
  .map((collectionNumber) => {
    const subset = atoms.filter((a) => a.collectionNumber === collectionNumber);
    const complete = subset.filter((a) => a.status === 'complete');
    return {
      collectionNumber,
      total: subset.length,
      complete: complete.length,
      heroCandidates: complete.filter((a) => a.audit.triageTier === 'hero-candidate').length,
      compositionSensitive: complete.filter((a) => a.audit.triageTier === 'composition-sensitive').length,
      likelyUnderpowered: complete.filter((a) => a.audit.triageTier === 'likely-underpowered').length,
    };
  });

const flagged = completeAtoms
  .filter((a) => a.audit.triageTier !== 'hero-candidate')
  .sort((a, b) => a.audit.structuralScore - b.audit.structuralScore || a.number - b.number)
  .slice(0, 40)
  .map((a) => ({
    number: a.number,
    id: a.id,
    name: a.name,
    collectionNumber: a.collectionNumber,
    seriesNumber: a.seriesNumber,
    seriesName: a.seriesName,
    defaultScale: a.defaultScale,
    surfaces: a.surfaces,
    hasResolution: a.hasResolution,
    continuous: a.continuous,
    structuralScore: a.audit.structuralScore,
    triageTier: a.audit.triageTier,
    reasons: a.audit.reasons,
  }));

const summary = {
  generatedAt: new Date().toISOString(),
  totalAtoms: atoms.length,
  completeAtoms: completeAtoms.length,
  countsByTier,
  countsByCollection,
  flagged,
  notes: [
    'This is a structural triage pass, not a final artistic judgment.',
    'It scores metadata-defined hero potential and risk, not the full rendered feel of each atom.',
    'Use this to prioritize manual hero-grade review, not to replace it.',
  ],
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(reportJson, JSON.stringify(summary, null, 2));
fs.writeFileSync(reportMd, buildMarkdown(summary));

console.log(`Wrote ${path.relative(root, reportJson)}`);
console.log(`Wrote ${path.relative(root, reportMd)}`);
console.log(`Complete atoms: ${completeAtoms.length}`);
console.log(`Hero candidates: ${countsByTier['hero-candidate'] ?? 0}`);
console.log(`Composition-sensitive: ${countsByTier['composition-sensitive'] ?? 0}`);
console.log(`Likely underpowered: ${countsByTier['likely-underpowered'] ?? 0}`);

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function buildMarkdown(summary: {
  generatedAt: string;
  totalAtoms: number;
  completeAtoms: number;
  countsByTier: Record<HeroTriageTier, number>;
  countsByCollection: Array<{
    collectionNumber: number;
    total: number;
    complete: number;
    heroCandidates: number;
    compositionSensitive: number;
    likelyUnderpowered: number;
  }>;
  flagged: Array<{
    number: number;
    id: string;
    name: string;
    collectionNumber: number;
    seriesNumber: number;
    seriesName: string;
    defaultScale: string;
    surfaces: string[];
    hasResolution: boolean;
    continuous: boolean;
    structuralScore: number;
    triageTier: HeroTriageTier;
    reasons: string[];
  }>;
  notes: string[];
}) {
  const lines: string[] = [];
  lines.push('# NaviCue Atoms Audit');
  lines.push('');
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total atoms: ${summary.totalAtoms}`);
  lines.push(`- Structurally complete atoms: ${summary.completeAtoms}`);
  lines.push(`- Hero candidates: ${summary.countsByTier['hero-candidate'] ?? 0}`);
  lines.push(`- Composition-sensitive: ${summary.countsByTier['composition-sensitive'] ?? 0}`);
  lines.push(`- Likely underpowered: ${summary.countsByTier['likely-underpowered'] ?? 0}`);
  lines.push('');
  lines.push('## Notes');
  lines.push('');
  for (const note of summary.notes) lines.push(`- ${note}`);
  lines.push('');
  lines.push('## By Collection');
  lines.push('');
  lines.push('| Collection | Total | Complete | Hero candidates | Composition-sensitive | Likely underpowered |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: |');
  for (const row of summary.countsByCollection) {
    lines.push(`| ${row.collectionNumber} | ${row.total} | ${row.complete} | ${row.heroCandidates} | ${row.compositionSensitive} | ${row.likelyUnderpowered} |`);
  }
  lines.push('');
  lines.push('## Priority Review List');
  lines.push('');
  for (const atom of summary.flagged.slice(0, 20)) {
    lines.push(`### ${atom.number} — ${atom.name}`);
    lines.push(`- Series ${atom.seriesNumber}: ${atom.seriesName}`);
    lines.push(`- Collection: ${atom.collectionNumber}`);
    lines.push(`- Triage: ${atom.triageTier}`);
    lines.push(`- Structural score: ${atom.structuralScore}`);
    lines.push(`- Scale: ${atom.defaultScale}`);
    lines.push(`- Surfaces: ${atom.surfaces.join(', ') || 'none'}`);
    lines.push(`- Resolution: ${atom.hasResolution ? 'yes' : 'no'}`);
    lines.push(`- Continuous: ${atom.continuous ? 'yes' : 'no'}`);
    lines.push(`- Why flagged: ${atom.reasons.join(' ')}`);
    lines.push('');
  }
  return lines.join('\n');
}
