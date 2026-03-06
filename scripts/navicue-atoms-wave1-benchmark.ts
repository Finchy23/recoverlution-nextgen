import fs from 'node:fs';
import path from 'node:path';

interface SignatureCohortRow {
  reviewOrder: number;
  atomNumber: number;
  atomId: string;
  atomName: string;
  collectionNumber: number;
  seriesNumber: number;
  seriesName: string;
  structuralScore: number;
  repetitionClusterSize: number;
  navicueFit: string;
  dominantVerbSeed: string;
  counterforceTypeSeed: string;
  resolutionClassSeed: string;
  sensoryProfile: string[];
  physicsTags: string[];
}

interface QualityPack {
  signatureCohort: SignatureCohortRow[];
}

interface BenchmarkManualNote {
  benchmarkRole: string;
  whyItStays: string;
  protectAtReview: string;
  primaryUse: 'navicue' | 'journey' | 'insight' | 'practice';
}

const root = process.cwd();
const reportDir = path.join(root, 'docs', 'reports');
const ingestDir = path.join(root, 'system', 'ingest', 'navicue-atoms');
const qualityPath = path.join(reportDir, 'navicue-atom-quality-orchestration.json');
const benchmarkJsonPath = path.join(reportDir, 'navicue-atom-wave1-benchmark.json');
const benchmarkMdPath = path.join(reportDir, 'navicue-atom-wave1-benchmark.md');
const benchmarkCsvPath = path.join(reportDir, 'navicue-atom-wave1-benchmark.csv');
const benchmarkIngestPath = path.join(ingestDir, 'navicue-atom-wave1-benchmark-pack.json');

if (!fs.existsSync(qualityPath)) {
  console.error('Missing quality orchestration pack. Run "npm run atoms:quality:plan" first.');
  process.exit(1);
}

const quality = JSON.parse(fs.readFileSync(qualityPath, 'utf8')) as QualityPack;

const MANUAL_NOTES: Record<string, BenchmarkManualNote> = {
  'brown-noise': {
    benchmarkRole: 'Sensory masking benchmark',
    whyItStays: 'This is the strongest full-field cocoon atom in the system. The descending blanket, deep rumble, and complete softening of the hostile field make the nervous-system intervention unmistakable.',
    protectAtReview: 'Do not let the blanket become decorative. The field above must feel sharp, and the coverage below must feel undeniably held.',
    primaryUse: 'navicue',
  },
  thermodynamic: {
    benchmarkRole: 'Multi-input transmutation benchmark',
    whyItStays: 'It treats emotion as energy, not story. Tap, hold, and drag all matter, and the lattice payoff makes the transformation legible and earned.',
    protectAtReview: 'Preserve the temperature thresholds and the crystallization payoff. If the lattice becomes weak, the atom loses its law.',
    primaryUse: 'navicue',
  },
  'audio-zoom': {
    benchmarkRole: 'Selective attention benchmark',
    whyItStays: 'It demonstrates that clarity comes from isolating signal, not eliminating existence. The bandpass window and bell reveal create a premium attention mechanic.',
    protectAtReview: 'Keep the noise overwhelming enough that isolation feels surgical. The reveal must sound and feel different, not merely look cleaner.',
    primaryUse: 'insight',
  },
  'standing-wave': {
    benchmarkRole: 'Dynamic stillness benchmark',
    whyItStays: 'This atom explains peace as balanced force rather than dead calm. The standing wave lock is conceptually sophisticated and physically legible.',
    protectAtReview: 'Do not over-simplify the tuning. The nodes and hum at lock are the memory trace.',
    primaryUse: 'navicue',
  },
  'phase-shift': {
    benchmarkRole: 'Repair-through-touch benchmark',
    whyItStays: 'The fracture network, flowing gold, and kintsugi logic make repair feel active, beautiful, and earned. It is one of the clearest examples of threshold morph done correctly.',
    protectAtReview: 'Keep the gold path-following tactile. Instant fill without felt travel weakens the engine.',
    primaryUse: 'navicue',
  },
  'wave-collapse': {
    benchmarkRole: 'Observation-collapse benchmark',
    whyItStays: 'It turns anxiety-as-possibility into a mechanical field collapse. The hold action, breath-coupled collapse, and crystal emergence are canonical.',
    protectAtReview: 'Preserve the diffuse-to-crystal contrast. The ending has to feel like one truth surviving many possible ones.',
    primaryUse: 'navicue',
  },
  'cymatic-coherence': {
    benchmarkRole: 'Coherence-from-noise benchmark',
    whyItStays: 'It shows what regulation looks like. Still touch creating a mathematically beautiful mandala is exactly the sort of law-driven magic we need more of.',
    protectAtReview: 'The velocity penalty is essential. If frantic touch still works, the atom stops teaching the body anything.',
    primaryUse: 'navicue',
  },
  'respiration-pendulum': {
    benchmarkRole: 'Embodied rhythm benchmark',
    whyItStays: 'This is one of the best examples of breath becoming visible gravity. The pendulum, topographic field, and steady-rhythm completion make it hard to replace.',
    protectAtReview: 'Keep the cadence strict. Hold and release need to feel like inhale and exhale, not generic touch states.',
    primaryUse: 'journey',
  },
  'sand-mandala': {
    benchmarkRole: 'Non-attachment benchmark',
    whyItStays: 'It combines symmetry, creation, destruction, and acceptance in one elegant law. The scatter is not failure; it is the point.',
    protectAtReview: 'Do not weaken the post-scatter bloom. The emotional turn depends on the emptiness feeling intentional and alive.',
    primaryUse: 'journey',
  },
  symbiotic: {
    benchmarkRole: 'Relational repair benchmark',
    whyItStays: 'The split field, thread weaving, and collapsing seam make connection physically visible. It is one of the strongest relational atoms in the catalog.',
    protectAtReview: 'Keep the thread sag, tension, and gap-closing visible. If the halves meet too easily, the repair feels cheap.',
    primaryUse: 'navicue',
  },
};

const wave1 = quality.signatureCohort
  .filter((row) => row.reviewOrder <= 10)
  .map((row) => {
    const note = MANUAL_NOTES[row.atomId];
    if (!note) {
      throw new Error(`Missing benchmark note for ${row.atomId}`);
    }
    return {
      ...row,
      reviewer: 'codex',
      reviewedAt: new Date().toISOString(),
      manualHeroGrade: 'signature',
      manualSignoffStatus: 'approved',
      ingestReadiness: 'backend-ready',
      benchmarkRole: note.benchmarkRole,
      whyItStays: note.whyItStays,
      protectAtReview: note.protectAtReview,
      primaryUse: note.primaryUse,
    };
  });

const benchmarkPack = {
  generatedAt: new Date().toISOString(),
  benchmarkCount: wave1.length,
  operatingRule:
    'This wave is the benchmark cohort. These atoms define the quality bar for future hero-grade promotion and cluster refinement.',
  rows: wave1,
};

fs.writeFileSync(benchmarkJsonPath, JSON.stringify(benchmarkPack, null, 2));
fs.writeFileSync(benchmarkCsvPath, buildCsv(wave1));
fs.writeFileSync(benchmarkMdPath, buildMarkdown(wave1));
fs.writeFileSync(benchmarkIngestPath, JSON.stringify(benchmarkPack, null, 2));

console.log(`Wrote ${path.relative(root, benchmarkJsonPath)}`);
console.log(`Wrote ${path.relative(root, benchmarkMdPath)}`);
console.log(`Wrote ${path.relative(root, benchmarkCsvPath)}`);
console.log(`Wrote ${path.relative(root, benchmarkIngestPath)}`);
console.log(`Wave 1 benchmark atoms: ${wave1.length}`);

function buildCsv(rows: typeof wave1) {
  const headers = [
    'review_order',
    'atom_number',
    'atom_id',
    'atom_name',
    'series_number',
    'series_name',
    'manual_hero_grade',
    'manual_signoff_status',
    'ingest_readiness',
    'benchmark_role',
    'primary_use',
    'why_it_stays',
    'protect_at_review',
  ];
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.reviewOrder,
        row.atomNumber,
        row.atomId,
        row.atomName,
        row.seriesNumber,
        row.seriesName,
        row.manualHeroGrade,
        row.manualSignoffStatus,
        row.ingestReadiness,
        row.benchmarkRole,
        row.primaryUse,
        row.whyItStays,
        row.protectAtReview,
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  return `${lines.join('\n')}\n`;
}

function buildMarkdown(rows: typeof wave1) {
  return [
    '# NaviCue Atom Wave 1 Benchmark Cohort',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    'These 10 atoms are approved as the first benchmark cohort.',
    '',
    ...rows.flatMap((row) => [
      `## ${row.atomNumber} — ${row.atomName}`,
      `- Atom: \`${row.atomId}\``,
      `- Series ${row.seriesNumber}: ${row.seriesName}`,
      `- Benchmark role: ${row.benchmarkRole}`,
      `- Primary use: ${row.primaryUse}`,
      `- Why it stays: ${row.whyItStays}`,
      `- Protect at review: ${row.protectAtReview}`,
      '',
    ]),
  ].join('\n');
}

function csvEscape(value: string | number) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
