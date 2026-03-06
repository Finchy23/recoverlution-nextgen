import fs from 'node:fs';
import path from 'node:path';
import { ATOM_CATALOG } from '../apps/design-center/src/app/components/atoms/atom-registry.ts';
import { SERIES_CATALOG } from '../apps/design-center/src/app/components/atoms/series-registry.ts';
import {
  deriveStructuralHeroSignals,
  type AtomAuditInput,
  type HeroTriageTier,
} from '../packages/navicue-atoms/src/index.ts';

type FitBand = 'low' | 'medium' | 'high' | 'signature';
type HeatFit = 'high-heat' | 'mid-heat' | 'low-heat' | 'broad';
type ComplexityBand = 'simple' | 'moderate' | 'rich' | 'advanced';
type RefinementPriority = 'low' | 'medium' | 'high' | 'critical';

interface EnrichedAtom {
  id: string;
  number: number;
  name: string;
  status: string;
  series: string;
  seriesNumber: number;
  seriesName: string;
  collectionNumber: number;
  renderMode: string;
  defaultScale: string;
  surfaces: string[];
  hapticEvents: string[];
  deviceRequirements: string[];
  breathCoupling: string;
  continuous: boolean;
  hasResolution: boolean;
  structural: ReturnType<typeof deriveStructuralHeroSignals>;
  complexityBand: ComplexityBand;
  dominantInputs: string[];
  sensoryProfile: string[];
  resolutionProfile: string;
  therapeuticJobs: string[];
  physicsTags: string[];
  heatFit: HeatFit;
  navicueFit: FitBand;
  journeyFit: FitBand;
  insightFit: FitBand;
  practiceFit: FitBand;
  repetitionKey: string;
  repetitionClusterSize: number;
  refinementPriority: RefinementPriority;
  refinementReasons: string[];
  matchingTags: string[];
}

const root = process.cwd();
const reportDir = path.join(root, 'docs', 'reports');
const reportJson = path.join(reportDir, 'navicue-atoms-full-audit.json');
const reportMd = path.join(reportDir, 'navicue-atoms-full-audit.md');
const reportCsv = path.join(reportDir, 'navicue-atom-matching-matrix.csv');

const JOB_KEYWORDS: Record<string, string[]> = {
  regulation: ['regulate', 'panic', 'calm', 'safety', 'ground', 'nervous', 'breath', 'settle', 'de-escalation', 'oxygen', 'vagal', 'homeostasis', 'pressure', 'equilibrium'],
  perspective: ['perspective', 'zoom', 'distance', 'overview', 'lens', 'observer', 'witness', 'decenter', 'parallax', 'horizon', 'optical', 'mirror', 'depth', 'focal'],
  release: ['release', 'let go', 'surrender', 'yield', 'drop', 'grief', 'forgive', 'dissolve', 'melt', 'evaporate', 'shatter', 'shed', 'thaw', 'pause'],
  transmutation: ['transform', 'transmute', 'alchemy', 'forge', 'phase-shift', 'morph', 'integrat', 'synthes', 'compost', 'kintsugi', 'recompose'],
  boundary: ['boundary', 'shield', 'brick', 'no ', 'sever', 'cut', 'repel', 'contain', 'vault', 'wall', 'gate', 'lock', 'tether', 'thread'],
  connection: ['connect', 'bridge', 'empathy', 'symbio', 'network', 'merge', 'confluence', 'thread', 'hive', 'love', 'repair', 'pollination', 'sangha'],
  focus: ['focus', 'signal', 'clarity', 'reveal', 'truth', 'scanner', 'filter', 'decrypt', 'audit', 'attention', 'spotlight', 'narrow'],
  agency: ['momentum', 'inertia', 'choice', 'choose', 'commit', 'build', 'lever', 'strategy', 'ignite', 'action', 'override', 'break', 'permissionless'],
  temporal: ['time', 'future', 'past', 'regret', 'patience', 'horizon', 'legacy', 'ancestral', 'timeline', 'chrono', 'season', 'eternal', 'hourglass'],
  identity: ['ego', 'identity', 'role', 'mask', 'shadow', 'self', 'shame', 'soul', 'projection'],
};

const PHYSICS_KEYWORDS: Record<string, string[]> = {
  fluid: ['fluid', 'river', 'liquid', 'water', 'pool', 'melt', 'seep', 'flow', 'delta', 'ocean', 'confluence', 'eddy', 'current'],
  structural: ['bridge', 'brick', 'scaffold', 'load-bearing', 'cornerstone', 'pillar', 'vault', 'wall', 'gate', 'anchor', 'stone', 'truss'],
  topological: ['tesseract', 'klein', 'escher', 'mobius', 'impossible', 'hypercube', 'geometry', 'topology', 'fractal'],
  optical: ['lens', 'optical', 'mirror', 'filter', 'blind', 'parallax', 'focal', 'light', 'shadow', 'polarized', 'uv', 'chromatic'],
  thermal: ['heat', 'thermo', 'cool', 'forge', 'boil', 'fire', 'ice', 'magma', 'pressure', 'temperature'],
  acoustic: ['audio', 'hum', 'frequency', 'resonance', 'cymatic', 'sound', 'echo', 'voice', 'doppler', 'binaural'],
  gravitational: ['gravity', 'orbit', 'centrifuge', 'zero-g', 'fall', 'plunge', 'weight', 'mass', 'anchor', 'buoyancy'],
  network: ['node', 'mycelial', 'network', 'thread', 'bridge', 'routing', 'mesh', 'constellation', 'web', 'hive'],
  temporal: ['time', 'chrono', 'retro', 'future', 'past', 'hourglass', 'season', 'legacy', 'eternal'],
  subtractive: ['erase', 'void', 'negative', 'dissolve', 'deprivation', 'dark', 'silence', 'strip', 'redaction', 'burn off'],
};

const DEVICE_TYPES = ['haptics', 'gyroscope', 'camera', 'pressure', 'microphone', 'audio-output'];
const SURFACE_TYPES = ['tappable', 'holdable', 'draggable', 'swipeable', 'breathable', 'observable', 'typeable', 'pinchable', 'drawable', 'gyroscopic', 'voice', 'scrubable'];

const INPUT_PRIORITY = ['voice', 'gyroscopic', 'pinchable', 'drawable', 'scrubable', 'swipeable', 'draggable', 'holdable', 'tappable', 'breathable', 'observable'];

const atoms = Object.values(ATOM_CATALOG).map((atom) => {
  const seriesMeta = SERIES_CATALOG[atom.series];
  const collectionNumber = Math.ceil(seriesMeta.number / 10);
  const structural = deriveStructuralHeroSignals(atom as AtomAuditInput);
  return {
    atom,
    seriesMeta,
    collectionNumber,
    structural,
  };
});

const clusterCounts = countBy(
  atoms.map(({ atom }) => repetitionKeyFor(atom))
);

const enrichedAtoms: EnrichedAtom[] = atoms.map(({ atom, seriesMeta, collectionNumber, structural }) => {
  const text = `${atom.intent} ${atom.physics} ${seriesMeta.domain} ${seriesMeta.physicsParadigm}`.toLowerCase();
  const dominantInputs = deriveDominantInputs(atom.surfaces as string[], atom.breathCoupling, atom.deviceRequirements as string[]);
  const sensoryProfile = deriveSensoryProfile(atom.surfaces as string[], atom.deviceRequirements as string[], atom.breathCoupling);
  const therapeuticJobs = deriveTopKeywords(text, JOB_KEYWORDS, 3);
  const physicsTags = deriveTopKeywords(text, PHYSICS_KEYWORDS, 3);
  const complexityBand = deriveComplexityBand(atom.surfaces.length, atom.deviceRequirements as string[], atom.renderMode);
  const resolutionProfile = deriveResolutionProfile(atom, text);
  const heatFit = deriveHeatFit(atom, therapeuticJobs, complexityBand, structural.structuralScore, physicsTags);
  const navicueFit = deriveNavicueFit(atom, structural.structuralScore, structural.triageTier);
  const journeyFit = deriveJourneyFit(atom, therapeuticJobs, complexityBand);
  const insightFit = deriveInsightFit(atom, therapeuticJobs, physicsTags, atom.surfaces as string[]);
  const practiceFit = derivePracticeFit(atom, complexityBand);
  const repetitionKey = repetitionKeyFor(atom);
  const repetitionClusterSize = clusterCounts[repetitionKey] ?? 1;
  const { priority: refinementPriority, reasons: refinementReasons } = deriveRefinementPriority(atom, structural, repetitionClusterSize, complexityBand);
  const matchingTags = [
    ...dominantInputs.map((tag) => `input:${tag}`),
    ...sensoryProfile.map((tag) => `sensor:${tag}`),
    ...therapeuticJobs.map((tag) => `job:${tag}`),
    ...physicsTags.map((tag) => `physics:${tag}`),
    `heat:${heatFit}`,
    `fit:navicue-${navicueFit}`,
    `fit:journey-${journeyFit}`,
    `fit:insight-${insightFit}`,
    `fit:practice-${practiceFit}`,
    `resolution:${resolutionProfile}`,
    `complexity:${complexityBand}`,
  ].sort();

  return {
    id: atom.id,
    number: atom.number,
    name: atom.name,
    status: atom.status,
    series: atom.series,
    seriesNumber: seriesMeta.number,
    seriesName: seriesMeta.name,
    collectionNumber,
    renderMode: atom.renderMode,
    defaultScale: atom.defaultScale,
    surfaces: [...atom.surfaces],
    hapticEvents: [...atom.hapticEvents],
    deviceRequirements: [...atom.deviceRequirements],
    breathCoupling: atom.breathCoupling,
    continuous: atom.continuous,
    hasResolution: atom.hasResolution,
    structural,
    complexityBand,
    dominantInputs,
    sensoryProfile,
    resolutionProfile,
    therapeuticJobs,
    physicsTags,
    heatFit,
    navicueFit,
    journeyFit,
    insightFit,
    practiceFit,
    repetitionKey,
    repetitionClusterSize,
    refinementPriority,
    refinementReasons,
    matchingTags,
  };
});

const completeAtoms = enrichedAtoms.filter((atom) => atom.status === 'complete');

const collectionSummary = summarizeCollections(completeAtoms);
const seriesSummary = summarizeSeries(completeAtoms);
const interactionSummary = summarizeStrings(completeAtoms.flatMap((atom) => atom.dominantInputs));
const jobSummary = summarizeStrings(completeAtoms.flatMap((atom) => atom.therapeuticJobs));
const physicsSummary = summarizeStrings(completeAtoms.flatMap((atom) => atom.physicsTags));
const deviceSummary = summarizeUniverseStrings(completeAtoms.flatMap((atom) => atom.deviceRequirements), DEVICE_TYPES);
const surfaceSummary = summarizeUniverseStrings(completeAtoms.flatMap((atom) => atom.surfaces), SURFACE_TYPES);
const renderSummary = summarizeStrings(completeAtoms.map((atom) => atom.renderMode));
const complexitySummary = summarizeStrings(completeAtoms.map((atom) => atom.complexityBand));
const heatSummary = summarizeStrings(completeAtoms.map((atom) => atom.heatFit));

const topRepetitionClusters = Object.entries(countBy(completeAtoms.map((atom) => atom.repetitionKey)))
  .map(([key, count]) => ({
    key,
    count,
    sampleAtoms: completeAtoms.filter((atom) => atom.repetitionKey === key).slice(0, 5).map((atom) => `${atom.number}:${atom.id}`),
  }))
  .filter((cluster) => cluster.count >= 6)
  .sort((a, b) => b.count - a.count)
  .slice(0, 20);

const priorityRefinements = completeAtoms
  .filter((atom) => atom.refinementPriority === 'critical' || atom.refinementPriority === 'high')
  .sort((a, b) => priorityWeight(b.refinementPriority) - priorityWeight(a.refinementPriority) || a.structural.structuralScore - b.structural.structuralScore || a.number - b.number)
  .slice(0, 50)
  .map((atom) => ({
    number: atom.number,
    id: atom.id,
    name: atom.name,
    seriesNumber: atom.seriesNumber,
    seriesName: atom.seriesName,
    structuralScore: atom.structural.structuralScore,
    triageTier: atom.structural.triageTier,
    complexityBand: atom.complexityBand,
    heatFit: atom.heatFit,
    repetitionClusterSize: atom.repetitionClusterSize,
    refinementPriority: atom.refinementPriority,
    refinementReasons: atom.refinementReasons,
    matchingTags: atom.matchingTags,
  }));

const summary = {
  generatedAt: new Date().toISOString(),
  totals: {
    totalAtoms: enrichedAtoms.length,
    completeAtoms: completeAtoms.length,
    heroCandidates: completeAtoms.filter((atom) => atom.structural.triageTier === 'hero-candidate').length,
    compositionSensitive: completeAtoms.filter((atom) => atom.structural.triageTier === 'composition-sensitive').length,
    likelyUnderpowered: completeAtoms.filter((atom) => atom.structural.triageTier === 'likely-underpowered').length,
  },
  summaries: {
    collectionSummary,
    seriesSummary,
    interactionSummary,
    jobSummary,
    physicsSummary,
    deviceSummary,
    surfaceSummary,
    renderSummary,
    complexitySummary,
    heatSummary,
  },
  topRepetitionClusters,
  priorityRefinements,
  atoms: completeAtoms,
  notes: [
    'This audit is for systemisation and matching, not final aesthetic judgment.',
    'Tagging is derived heuristically from registry metadata, series domain, and physics descriptions.',
    'Use matching tags as a first-pass backend and curation spine, then refine manually where needed.',
  ],
};

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(reportJson, JSON.stringify(summary, null, 2));
fs.writeFileSync(reportMd, buildMarkdown(summary));
fs.writeFileSync(reportCsv, buildCsv(completeAtoms));

console.log(`Wrote ${path.relative(root, reportJson)}`);
console.log(`Wrote ${path.relative(root, reportMd)}`);
console.log(`Wrote ${path.relative(root, reportCsv)}`);
console.log(`Complete atoms: ${summary.totals.completeAtoms}`);
console.log(`Hero candidates: ${summary.totals.heroCandidates}`);
console.log(`High/Critical refinement queue: ${summary.priorityRefinements.length}`);

function repetitionKeyFor(atom: {
  renderMode: string;
  defaultScale: string;
  surfaces: readonly string[];
  breathCoupling: string;
  hasResolution: boolean;
  continuous: boolean;
  deviceRequirements: readonly string[];
}) {
  return [
    atom.renderMode,
    atom.defaultScale,
    [...atom.surfaces].sort().join('+'),
    atom.breathCoupling,
    atom.hasResolution ? 'resolved' : 'open',
    atom.continuous ? 'continuous' : 'discrete',
    [...atom.deviceRequirements].sort().join('+') || 'touch-only',
  ].join('|');
}

function deriveDominantInputs(surfaces: string[], breathCoupling: string, deviceRequirements: string[]) {
  const tags = new Set<string>();
  const primaryMap: Record<string, string> = {
    voice: 'voice',
    gyroscopic: 'tilt',
    pinchable: 'pinch',
    drawable: 'draw',
    scrubable: 'scrub',
    swipeable: 'swipe',
    draggable: 'drag',
    holdable: 'hold',
    tappable: 'tap',
    breathable: 'breath',
    observable: 'observe',
  };
  for (const surface of INPUT_PRIORITY) {
    if (surfaces.includes(surface)) {
      tags.add(primaryMap[surface]);
      break;
    }
  }
  if (surfaces.includes('holdable')) tags.add('hold');
  if (surfaces.includes('tappable')) tags.add('tap');
  if (surfaces.includes('swipeable')) tags.add('swipe');
  if (surfaces.includes('draggable')) tags.add('drag');
  if (surfaces.includes('pinchable')) tags.add('pinch');
  if (surfaces.includes('scrubable')) tags.add('scrub');
  if (surfaces.includes('drawable')) tags.add('draw');
  if (surfaces.includes('gyroscopic') || deviceRequirements.includes('gyroscope')) tags.add('tilt');
  if (surfaces.includes('breathable') || breathCoupling !== 'none') tags.add('breath');
  if (surfaces.includes('observable')) tags.add('observe');
  if (surfaces.includes('voice') || deviceRequirements.includes('microphone')) tags.add('voice');
  return [...tags];
}

function deriveSensoryProfile(surfaces: string[], deviceRequirements: string[], breathCoupling: string) {
  const tags = new Set<string>();
  tags.add('visual');
  if (surfaces.some((surface) => ['tappable', 'holdable', 'swipeable', 'draggable', 'pinchable', 'scrubable', 'drawable'].includes(surface))) tags.add('touch');
  if (breathCoupling !== 'none' || surfaces.includes('breathable')) tags.add('breath');
  if (deviceRequirements.includes('haptics')) tags.add('haptics');
  if (deviceRequirements.includes('gyroscope')) tags.add('tilt');
  if (deviceRequirements.includes('camera')) tags.add('camera');
  if (deviceRequirements.includes('microphone')) tags.add('microphone');
  if (deviceRequirements.includes('audio-output')) tags.add('audio');
  if (deviceRequirements.includes('pressure')) tags.add('pressure');
  return [...tags];
}

function deriveComplexityBand(surfaceCount: number, deviceRequirements: string[], renderMode: string): ComplexityBand {
  const hardwareCount = deviceRequirements.filter((req) => req !== 'haptics').length;
  const score = surfaceCount + hardwareCount + (renderMode === 'webgl' ? 1 : 0);
  if (score <= 2) return 'simple';
  if (score <= 4) return 'moderate';
  if (score <= 6) return 'rich';
  return 'advanced';
}

function deriveResolutionProfile(atom: { hasResolution: boolean; continuous: boolean; hapticEvents: readonly string[] }, text: string) {
  if (!atom.hasResolution && atom.continuous) return 'loop';
  if (!atom.hasResolution) return 'none';
  if (atom.hapticEvents.includes('seal_stamp') || /\bseal\b|\block\b|\banchor\b|\boath\b/.test(text)) return 'seal';
  if (/\bmelt\b|\bdissolve\b|\bshatter\b|\bfreeze\b|\bliquefy\b|\bevaporat|\btransmut|\bmorph\b/.test(text)) return 'state-morph';
  return 'field-recompose';
}

function deriveHeatFit(
  atom: {
    surfaces: readonly string[];
    defaultScale: string;
    hasResolution: boolean;
    continuous: boolean;
    breathCoupling: string;
    deviceRequirements: readonly string[];
  },
  jobs: string[],
  complexityBand: ComplexityBand,
  structuralScore: number,
  physicsTags: string[],
): HeatFit {
  const hardwareComplexity = atom.deviceRequirements.filter((req) => req !== 'haptics').length;
  const isSimpleSomatic = atom.surfaces.length <= 2 && hardwareComplexity === 0 && (atom.breathCoupling !== 'none' || atom.surfaces.includes('holdable') || atom.surfaces.includes('tappable'));
  if (isSimpleSomatic && ['field', 'full'].includes(atom.defaultScale) && atom.hasResolution) return 'high-heat';
  if (complexityBand === 'advanced' || hardwareComplexity >= 1 || physicsTags.some((tag) => ['topological', 'optical', 'temporal'].includes(tag))) return 'low-heat';
  if (!atom.hasResolution && atom.continuous) return 'low-heat';
  if (structuralScore >= 8 && jobs.some((job) => ['regulation', 'release', 'boundary', 'focus'].includes(job))) return 'mid-heat';
  return 'broad';
}

function deriveNavicueFit(
  atom: { hasResolution: boolean; defaultScale: string; continuous: boolean },
  structuralScore: number,
  triageTier: HeroTriageTier,
): FitBand {
  if (triageTier === 'hero-candidate' && atom.hasResolution && ['field', 'full'].includes(atom.defaultScale) && structuralScore >= 9) return 'signature';
  if (triageTier === 'hero-candidate') return 'high';
  if (atom.hasResolution || (atom.continuous && structuralScore >= 6)) return 'medium';
  return 'low';
}

function deriveJourneyFit(atom: { continuous: boolean; deviceRequirements: readonly string[]; surfaces: readonly string[] }, jobs: string[], complexityBand: ComplexityBand): FitBand {
  const score =
    (atom.continuous ? 2 : 0) +
    (jobs.some((job) => ['temporal', 'perspective', 'release', 'regulation'].includes(job)) ? 1 : 0) +
    (atom.deviceRequirements.filter((req) => req !== 'haptics').length <= 1 ? 1 : 0) +
    (complexityBand === 'simple' || complexityBand === 'moderate' ? 1 : 0);
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

function deriveInsightFit(
  atom: { continuous: boolean; surfaces: readonly string[]; hasResolution: boolean },
  jobs: string[],
  physicsTags: string[],
  surfaces: string[],
): FitBand {
  const score =
    (jobs.some((job) => ['perspective', 'focus', 'identity', 'temporal'].includes(job)) ? 2 : 0) +
    (physicsTags.some((tag) => ['optical', 'topological', 'temporal', 'network'].includes(tag)) ? 2 : 0) +
    (surfaces.some((surface) => ['observable', 'scrubable', 'pinchable', 'drawable'].includes(surface)) ? 1 : 0) +
    (!atom.hasResolution || atom.continuous ? 1 : 0);
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

function derivePracticeFit(atom: { surfaces: readonly string[]; deviceRequirements: readonly string[]; hasResolution: boolean }, complexityBand: ComplexityBand): FitBand {
  const score =
    (atom.surfaces.length <= 2 ? 2 : 0) +
    (atom.deviceRequirements.filter((req) => req !== 'haptics').length === 0 ? 1 : 0) +
    (atom.hasResolution ? 1 : 0) +
    (complexityBand === 'simple' || complexityBand === 'moderate' ? 1 : 0);
  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

function deriveRefinementPriority(
  atom: { defaultScale: string; hasResolution: boolean; surfaces: readonly string[]; deviceRequirements: readonly string[] },
  structural: ReturnType<typeof deriveStructuralHeroSignals>,
  repetitionClusterSize: number,
  complexityBand: ComplexityBand,
) {
  const reasons: string[] = [];
  let priority: RefinementPriority = 'low';

  if (structural.triageTier === 'likely-underpowered') {
    priority = 'critical';
    reasons.push('Engine itself is structurally weak for hero use.');
  } else if (structural.triageTier === 'composition-sensitive') {
    priority = structural.structuralScore <= 5 ? 'high' : 'medium';
    reasons.push('Quality likely depends on stronger composition, scale, and payoff.');
  }

  if (atom.defaultScale === 'point' || atom.defaultScale === 'element') {
    priority = bumpPriority(priority);
    reasons.push('Small hero footprint needs stronger consequence design.');
  }
  if (!atom.hasResolution) {
    priority = bumpPriority(priority);
    reasons.push('No explicit resolution path; wrapper must carry closure.');
  }
  if (repetitionClusterSize >= 10) {
    priority = bumpPriority(priority);
    reasons.push('Over-represented interaction signature risks sameness.');
  }
  if (complexityBand === 'advanced' && atom.deviceRequirements.filter((req) => req !== 'haptics').length > 0) {
    reasons.push('Higher device/input complexity makes matching more selective.');
  }

  return { priority, reasons };
}

function bumpPriority(priority: RefinementPriority): RefinementPriority {
  if (priority === 'low') return 'medium';
  if (priority === 'medium') return 'high';
  return priority;
}

function deriveTopKeywords(text: string, groups: Record<string, string[]>, limit: number) {
  return Object.entries(groups)
    .map(([key, keywords]) => ({
      key,
      score: keywords.reduce((sum, keyword) => sum + countOccurrences(text, keyword), 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key))
    .slice(0, limit)
    .map((entry) => entry.key);
}

function countOccurrences(text: string, keyword: string) {
  const matches = text.match(new RegExp(escapeRegExp(keyword), 'g'));
  return matches ? matches.length : 0;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countBy(values: string[]) {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function summarizeStrings(values: string[]) {
  return Object.entries(countBy(values))
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function summarizeUniverseStrings(values: string[], universe: string[]) {
  const counts = countBy(values);
  return universe
    .map((key) => ({ key, count: counts[key] ?? 0 }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function summarizeCollections(atomsToSummarize: EnrichedAtom[]) {
  const groups = groupBy(atomsToSummarize, (atom) => String(atom.collectionNumber));
  return Object.entries(groups)
    .map(([collectionNumber, subset]) => ({
      collectionNumber: Number(collectionNumber),
      count: subset.length,
      averageStructuralScore: round(avg(subset.map((atom) => atom.structural.structuralScore))),
      heroCandidates: subset.filter((atom) => atom.structural.triageTier === 'hero-candidate').length,
      averageRepetitionCluster: round(avg(subset.map((atom) => atom.repetitionClusterSize))),
      highHeatFriendly: subset.filter((atom) => atom.heatFit === 'high-heat').length,
      insightHigh: subset.filter((atom) => atom.insightFit === 'high' || atom.insightFit === 'signature').length,
      practiceHigh: subset.filter((atom) => atom.practiceFit === 'high' || atom.practiceFit === 'signature').length,
    }))
    .sort((a, b) => a.collectionNumber - b.collectionNumber);
}

function summarizeSeries(atomsToSummarize: EnrichedAtom[]) {
  const groups = groupBy(atomsToSummarize, (atom) => `${atom.seriesNumber}`);
  return Object.entries(groups)
    .map(([seriesNumber, subset]) => ({
      seriesNumber: Number(seriesNumber),
      seriesName: subset[0]?.seriesName ?? '',
      count: subset.length,
      averageStructuralScore: round(avg(subset.map((atom) => atom.structural.structuralScore))),
      heroCandidateRate: round(subset.filter((atom) => atom.structural.triageTier === 'hero-candidate').length / subset.length),
      averageRepetitionCluster: round(avg(subset.map((atom) => atom.repetitionClusterSize))),
      dominantJob: summarizeStrings(subset.flatMap((atom) => atom.therapeuticJobs))[0]?.key ?? 'none',
      dominantInput: summarizeStrings(subset.flatMap((atom) => atom.dominantInputs))[0]?.key ?? 'none',
      refinementHighOrCritical: subset.filter((atom) => atom.refinementPriority === 'high' || atom.refinementPriority === 'critical').length,
    }))
    .sort((a, b) => a.seriesNumber - b.seriesNumber);
}

function groupBy<T>(items: T[], selector: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = selector(item);
    (acc[key] ??= []).push(item);
    return acc;
  }, {});
}

function avg(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function priorityWeight(priority: RefinementPriority) {
  switch (priority) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
  }
}

function buildMarkdown(summary: typeof summary) {
  const lines: string[] = [];
  lines.push('# NaviCue Atoms Full Audit');
  lines.push('');
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Total atoms: ${summary.totals.totalAtoms}`);
  lines.push(`- Complete atoms: ${summary.totals.completeAtoms}`);
  lines.push(`- Hero candidates: ${summary.totals.heroCandidates}`);
  lines.push(`- Composition-sensitive: ${summary.totals.compositionSensitive}`);
  lines.push(`- Likely underpowered: ${summary.totals.likelyUnderpowered}`);
  lines.push(`- Matching matrix rows: ${summary.atoms.length}`);
  lines.push('');
  lines.push('## What This Audit Adds');
  lines.push('');
  lines.push('- Per-atom matching tags for backend and curation');
  lines.push('- Heat-fit and content-type fit suggestions');
  lines.push('- Repetition cluster detection to catch sameness');
  lines.push('- Priority refinement queue for manual hero review');
  lines.push('');
  lines.push('## Collection Summary');
  lines.push('');
  lines.push('| Collection | Count | Avg structural score | Hero candidates | Avg repetition cluster | High-heat friendly | Insight high | Practice high |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const row of summary.summaries.collectionSummary) {
    lines.push(`| ${row.collectionNumber} | ${row.count} | ${row.averageStructuralScore} | ${row.heroCandidates} | ${row.averageRepetitionCluster} | ${row.highHeatFriendly} | ${row.insightHigh} | ${row.practiceHigh} |`);
  }
  lines.push('');
  lines.push('## Strongest System Consistencies');
  lines.push('');
  for (const item of summary.summaries.jobSummary.slice(0, 8)) lines.push(`- Therapeutic job \`${item.key}\`: ${item.count}`);
  lines.push('');
  for (const item of summary.summaries.physicsSummary.slice(0, 8)) lines.push(`- Physics tag \`${item.key}\`: ${item.count}`);
  lines.push('');
  lines.push('## Disparities And Gaps');
  lines.push('');
  const lowUsageDevices = summary.summaries.deviceSummary.filter((item) => item.count <= 25);
  if (lowUsageDevices.length) {
    for (const item of lowUsageDevices) lines.push(`- Underused device channel \`${item.key}\`: ${item.count}`);
  } else {
    lines.push('- No major device-channel gaps flagged by simple count threshold.');
  }
  lines.push('');
  const lowUsageSurfaces = summary.summaries.surfaceSummary.filter((item) => item.count <= 25);
  if (lowUsageSurfaces.length) {
    for (const item of lowUsageSurfaces) lines.push(`- Underused interaction surface \`${item.key}\`: ${item.count}`);
  } else {
    lines.push('- No major interaction-surface gaps flagged by simple count threshold.');
  }
  lines.push('');
  lines.push('## Repetition Pressure');
  lines.push('');
  for (const cluster of summary.topRepetitionClusters.slice(0, 12)) {
    lines.push(`- Cluster \`${cluster.key}\`: ${cluster.count} atoms (${cluster.sampleAtoms.join(', ')})`);
  }
  lines.push('');
  lines.push('## Priority Refinement Queue');
  lines.push('');
  for (const atom of summary.priorityRefinements.slice(0, 20)) {
    lines.push(`### ${atom.number} — ${atom.name}`);
    lines.push(`- Series ${atom.seriesNumber}: ${atom.seriesName}`);
    lines.push(`- Structural score: ${atom.structuralScore}`);
    lines.push(`- Triage: ${atom.triageTier}`);
    lines.push(`- Priority: ${atom.refinementPriority}`);
    lines.push(`- Heat fit: ${atom.heatFit}`);
    lines.push(`- Repetition cluster: ${atom.repetitionClusterSize}`);
    lines.push(`- Reasons: ${atom.refinementReasons.join(' ')}`);
    lines.push(`- Tags: ${atom.matchingTags.join(', ')}`);
    lines.push('');
  }
  lines.push('## Notes');
  lines.push('');
  for (const note of summary.notes) lines.push(`- ${note}`);
  lines.push('');
  lines.push(`The machine-readable matching matrix is in \`${path.relative(root, reportCsv)}\`.`);
  return lines.join('\n');
}

function buildCsv(atomsToWrite: EnrichedAtom[]) {
  const headers = [
    'number',
    'id',
    'name',
    'collection_number',
    'series_number',
    'series_name',
    'render_mode',
    'default_scale',
    'surfaces',
    'device_requirements',
    'breath_coupling',
    'continuous',
    'has_resolution',
    'structural_score',
    'triage_tier',
    'complexity_band',
    'dominant_inputs',
    'sensory_profile',
    'resolution_profile',
    'therapeutic_jobs',
    'physics_tags',
    'heat_fit',
    'navicue_fit',
    'journey_fit',
    'insight_fit',
    'practice_fit',
    'repetition_cluster_size',
    'refinement_priority',
    'refinement_reasons',
    'matching_tags',
  ];

  const rows = atomsToWrite.map((atom) => [
    atom.number,
    atom.id,
    atom.name,
    atom.collectionNumber,
    atom.seriesNumber,
    atom.seriesName,
    atom.renderMode,
    atom.defaultScale,
    atom.surfaces.join('|'),
    atom.deviceRequirements.join('|'),
    atom.breathCoupling,
    atom.continuous,
    atom.hasResolution,
    atom.structural.structuralScore,
    atom.structural.triageTier,
    atom.complexityBand,
    atom.dominantInputs.join('|'),
    atom.sensoryProfile.join('|'),
    atom.resolutionProfile,
    atom.therapeuticJobs.join('|'),
    atom.physicsTags.join('|'),
    atom.heatFit,
    atom.navicueFit,
    atom.journeyFit,
    atom.insightFit,
    atom.practiceFit,
    atom.repetitionClusterSize,
    atom.refinementPriority,
    atom.refinementReasons.join(' | '),
    atom.matchingTags.join('|'),
  ]);

  return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
}

function csvEscape(value: unknown) {
  const stringValue = String(value ?? '');
  if (/[",\n]/.test(stringValue)) return `"${stringValue.replace(/"/g, '""')}"`;
  return stringValue;
}
