import fs from 'node:fs';
import path from 'node:path';

interface HeroCohortRow {
  reviewOrder: number;
  atomNumber: number;
  atomId: string;
  atomName: string;
  collectionNumber: number;
  seriesNumber: number;
  seriesName: string;
  structuralScore: number;
  repetitionClusterSize: number;
  refinementPriority: string;
  dominantVerbSeed: string;
  resolutionClassSeed: string;
  sensoryProfile: string[];
}

interface QualityPack {
  heroCohort: HeroCohortRow[];
}

interface HeroManualNote {
  heroRole: string;
  whyItAdvances: string;
  protectAtReview: string;
  primaryUse: 'navicue' | 'journey' | 'insight' | 'practice';
}

const root = process.cwd();
const reportDir = path.join(root, 'docs', 'reports');
const ingestDir = path.join(root, 'system', 'ingest', 'navicue-atoms');
const qualityPath = path.join(reportDir, 'navicue-atom-quality-orchestration.json');
const heroJsonPath = path.join(reportDir, 'navicue-atom-wave2-hero.json');
const heroMdPath = path.join(reportDir, 'navicue-atom-wave2-hero.md');
const heroCsvPath = path.join(reportDir, 'navicue-atom-wave2-hero.csv');
const heroIngestPath = path.join(ingestDir, 'navicue-atom-wave2-hero-pack.json');

if (!fs.existsSync(qualityPath)) {
  console.error('Missing quality orchestration pack. Run "npm run atoms:quality:plan" first.');
  process.exit(1);
}

const quality = JSON.parse(fs.readFileSync(qualityPath, 'utf8')) as QualityPack;

const MANUAL_NOTES: Record<string, HeroManualNote> = {
  'somatic-resonance': {
    heroRole: 'Autonomic entrainment benchmark',
    whyItAdvances: 'This is one of the cleanest state-before-story atoms in the catalog. Breath, hold, sound, and membrane deformation all point at one intervention: regulation through felt resonance.',
    protectAtReview: 'Do not flatten the organic membrane into a generic orb. The living edge and bilateral mode are what give it authority.',
    primaryUse: 'navicue',
  },
  'constructive-destructive': {
    heroRole: 'Boundary construction benchmark',
    whyItAdvances: 'It turns saying no into mass, lift, gravity, and permanence. The wall feels built, not asserted.',
    protectAtReview: 'Preserve mass-lag and snap logic. If blocks feel weightless, the atom loses its sovereignty.',
    primaryUse: 'navicue',
  },
  cryptographic: {
    heroRole: 'Obscuration-clearing benchmark',
    whyItAdvances: 'The layer-by-layer wipe teaches that truth was obscured rather than absent. It is reusable and semantically thin.',
    protectAtReview: 'The hidden geometry must feel worth revealing. If the truth layer is weak, the wipe becomes cosmetic.',
    primaryUse: 'insight',
  },
  'boids-flocking': {
    heroRole: 'Influence-over-force benchmark',
    whyItAdvances: 'This is a strong proof that gentle guidance beats control. The flock coherence metric creates real consequence.',
    protectAtReview: 'Fast movement must continue to scatter the flock. That punitive feedback is the lesson.',
    primaryUse: 'navicue',
  },
  'reality-tear': {
    heroRole: 'Belief-as-code benchmark',
    whyItAdvances: 'It stages limiting belief as editable code rather than identity. The tear, reveal, and variable flip are highly legible.',
    protectAtReview: 'The tear needs physical raggedness. If it opens too cleanly, the reveal loses force.',
    primaryUse: 'insight',
  },
  'exhale-release': {
    heroRole: 'Minimal release benchmark',
    whyItAdvances: 'This is a clean, compact surrender atom. It proves that small engines can still carry premium regulation when the breath law is strict.',
    protectAtReview: 'Do not let simplicity become vagueness. The freeze-to-release contrast has to stay sharp.',
    primaryUse: 'practice',
  },
  'z-axis-parallax': {
    heroRole: 'Perspective expansion benchmark',
    whyItAdvances: 'The true 3D zoom-out remains one of the strongest perspective mechanics in the system and is portable across multiple wrappers.',
    protectAtReview: 'Protect the scale-domain progression. If the problem mass shrinks too quickly, the overview effect weakens.',
    primaryUse: 'insight',
  },
  'l-system-branching': {
    heroRole: 'Growth-through-breath benchmark',
    whyItAdvances: 'It makes micro-yes growth visible and fractal. The mirrored root/canopy logic gives it real depth.',
    protectAtReview: 'Keep the generational progression legible. If growth feels constant rather than staged, the atom loses meaning.',
    primaryUse: 'journey',
  },
  'mycelial-routing': {
    heroRole: 'Network consequence benchmark',
    whyItAdvances: 'One ignition changing the whole field is a core Recoverlution law. This atom expresses that cleanly.',
    protectAtReview: 'Preserve the cascade travel. Instant whole-network lighting would cheapen the relational math.',
    primaryUse: 'journey',
  },
  'apneic-pause': {
    heroRole: 'Stillness threshold benchmark',
    whyItAdvances: 'It treats cessation itself as the intervention. The full freeze of the field is unusually disciplined and strong.',
    protectAtReview: 'Everything must truly stop. Any leftover ambient motion breaks the atom’s authority.',
    primaryUse: 'practice',
  },
  retrocausal: {
    heroRole: 'Meaning-rewrite benchmark',
    whyItAdvances: 'It makes reinterpretation mechanical by letting present movement reorganize fractured past structure.',
    protectAtReview: 'The mandala end-state must feel materially earned, not merely animated into place.',
    primaryUse: 'insight',
  },
  'phase-lock': {
    heroRole: 'Internal conflict tuning benchmark',
    whyItAdvances: 'Two incompatible states resolving into one harmonic waveform is direct, elegant, and reusable.',
    protectAtReview: 'Keep the beat frequency audible and visible enough that convergence feels physically relieving.',
    primaryUse: 'navicue',
  },
  'tempo-override': {
    heroRole: 'Body-rhythm override benchmark',
    whyItAdvances: 'It proves the body can impose a slower reality on panic. The inertia model is what makes it credible.',
    protectAtReview: 'The world must resist at first. If the environment follows too easily, the override feels fake.',
    primaryUse: 'practice',
  },
  'lag-spike': {
    heroRole: 'Frustration exposure benchmark',
    whyItAdvances: 'This is a rare atom that weaponizes absence. It exposes compulsion with almost no visual complexity.',
    protectAtReview: 'Do not add comfort during the freeze. The lack of response is the intervention.',
    primaryUse: 'insight',
  },
  'kernel-panic': {
    heroRole: 'Crash-and-reboot benchmark',
    whyItAdvances: 'It externalizes rumination as system failure, then resolves through reboot and warmth. The progression is sharp and memorable.',
    protectAtReview: 'The halt state needs to feel absolute before reboot. If the crash is too playful, the catharsis collapses.',
    primaryUse: 'navicue',
  },
  'ego-zoom': {
    heroRole: 'Identity expansion benchmark',
    whyItAdvances: 'Concentric identity rings are simple, but the layer progression is powerful and durable in use.',
    protectAtReview: 'The identity layers need enough spacing and darkness pushback to feel like true expansion.',
    primaryUse: 'journey',
  },
  'friction-polish': {
    heroRole: 'Drag-to-ease benchmark',
    whyItAdvances: 'It is one of the clearest practice atoms in the system: friction becomes smoothness through repeated contact.',
    protectAtReview: 'The polished glide must feel noticeably different from the rough track. Otherwise it becomes just another scrub interaction.',
    primaryUse: 'practice',
  },
  'ten-year-echo': {
    heroRole: 'Voice crystallization benchmark',
    whyItAdvances: 'It takes a recorded waveform and turns it into something preserved and dropped into depth. That is a good use of voice without turning into chat UI.',
    protectAtReview: 'The crystallization must feel like memory condensing, not just a shape morph.',
    primaryUse: 'journey',
  },
  'binary-breaker': {
    heroRole: 'Paradox mixing benchmark',
    whyItAdvances: 'The atom makes nuance visible through stirring and gradient emergence. It is conceptually clean and highly reusable.',
    protectAtReview: 'The gradient must read as true emergence, not simple interpolation.',
    primaryUse: 'insight',
  },
  'sisyphus-smile': {
    heroRole: 'Joy-through-rhythm benchmark',
    whyItAdvances: 'It upgrades burden into play through momentum, color diffraction, and repetition. That tonal inversion is valuable.',
    protectAtReview: 'Keep the rhythmic build. If one swipe is enough, the joy arc disappears.',
    primaryUse: 'journey',
  },
  'infinite-canvas': {
    heroRole: 'Scale-of-error benchmark',
    whyItAdvances: 'This is a strong perspective atom for shrinking mistakes against an infinite frame. The zoom law is simple and powerful.',
    protectAtReview: 'The mistake has to feel painfully local before the zoom. Otherwise the expansion lacks emotional contrast.',
    primaryUse: 'insight',
  },
  'lila-seal': {
    heroRole: 'Flow-state capstone benchmark',
    whyItAdvances: 'It rewards continuous, playful movement without reintroducing scorekeeping. That is rare and useful.',
    protectAtReview: 'Protect the ribbon quality and the sustained-flow requirement. The seal should only arrive through true continuity.',
    primaryUse: 'journey',
  },
  'silence-gap': {
    heroRole: 'Silence reveal benchmark',
    whyItAdvances: 'Frequency to zero as a gateway to truth is minimal but potent. It belongs in the hero tier when framed well.',
    protectAtReview: 'The deadness has to be real. If the UI still feels busy while frequency approaches zero, the reveal is weakened.',
    primaryUse: 'insight',
  },
  'kinetic-battery': {
    heroRole: 'Self-generated energy benchmark',
    whyItAdvances: 'It is a clean demonstration that energy can be produced through the body’s rhythm rather than borrowed from stimulus.',
    protectAtReview: 'The fill should feel dense and earned. If the battery fills too quickly, the proof disappears.',
    primaryUse: 'practice',
  },
};

const wave2 = quality.heroCohort
  .slice(0, 24)
  .map((row) => {
    const note = MANUAL_NOTES[row.atomId];
    if (!note) {
      throw new Error(`Missing hero note for ${row.atomId}`);
    }
    return {
      ...row,
      reviewer: 'codex',
      reviewedAt: new Date().toISOString(),
      manualHeroGrade: 'hero-grade',
      manualSignoffStatus: 'approved',
      ingestReadiness: 'backend-ready',
      heroRole: note.heroRole,
      whyItAdvances: note.whyItAdvances,
      protectAtReview: note.protectAtReview,
      primaryUse: note.primaryUse,
    };
  });

const heroPack = {
  generatedAt: new Date().toISOString(),
  heroCount: wave2.length,
  operatingRule:
    'Wave 2 is the approved hero-grade cohort. These atoms are strong enough to ingest while still sitting below the benchmark signature tier.',
  rows: wave2,
};

fs.writeFileSync(heroJsonPath, JSON.stringify(heroPack, null, 2));
fs.writeFileSync(heroCsvPath, buildCsv(wave2));
fs.writeFileSync(heroMdPath, buildMarkdown(wave2));
fs.writeFileSync(heroIngestPath, JSON.stringify(heroPack, null, 2));

console.log(`Wrote ${path.relative(root, heroJsonPath)}`);
console.log(`Wrote ${path.relative(root, heroMdPath)}`);
console.log(`Wrote ${path.relative(root, heroCsvPath)}`);
console.log(`Wrote ${path.relative(root, heroIngestPath)}`);
console.log(`Wave 2 hero atoms: ${wave2.length}`);

function buildCsv(rows: typeof wave2) {
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
    'hero_role',
    'primary_use',
    'why_it_advances',
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
        row.heroRole,
        row.primaryUse,
        row.whyItAdvances,
        row.protectAtReview,
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  return `${lines.join('\n')}\n`;
}

function buildMarkdown(rows: typeof wave2) {
  return [
    '# NaviCue Atom Wave 2 Hero Cohort',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    'These atoms are approved as the first broad hero-grade cohort.',
    '',
    ...rows.flatMap((row) => [
      `## ${row.atomNumber} — ${row.atomName}`,
      `- Atom: \`${row.atomId}\``,
      `- Series ${row.seriesNumber}: ${row.seriesName}`,
      `- Hero role: ${row.heroRole}`,
      `- Primary use: ${row.primaryUse}`,
      `- Why it advances: ${row.whyItAdvances}`,
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
