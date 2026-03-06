import fs from 'node:fs';
import path from 'node:path';

interface AuditAtom {
  id: string;
  number: number;
  name: string;
  series: string;
  seriesNumber: number;
  seriesName: string;
  collectionNumber: number;
  renderMode: string;
  defaultScale: string;
  surfaces: string[];
  deviceRequirements: string[];
  breathCoupling: string;
  continuous: boolean;
  hasResolution: boolean;
  structural: {
    structuralScore: number;
    triageTier: 'hero-candidate' | 'composition-sensitive' | 'likely-underpowered';
  };
  complexityBand: 'simple' | 'moderate' | 'rich' | 'advanced';
  dominantInputs: string[];
  sensoryProfile: string[];
  resolutionProfile: 'state-morph' | 'field-recompose' | 'seal' | 'loop' | 'none';
  therapeuticJobs: string[];
  physicsTags: string[];
  heatFit: 'high-heat' | 'mid-heat' | 'low-heat' | 'broad';
  navicueFit: 'low' | 'medium' | 'high' | 'signature';
  journeyFit: 'low' | 'medium' | 'high' | 'signature';
  insightFit: 'low' | 'medium' | 'high' | 'signature';
  practiceFit: 'low' | 'medium' | 'high' | 'signature';
  repetitionKey: string;
  repetitionClusterSize: number;
  refinementPriority: 'low' | 'medium' | 'high' | 'critical';
  refinementReasons: string[];
  matchingTags: string[];
}

interface SignoffRow {
  atomId: string;
  atomNumber: number;
  atomName: string;
  collectionNumber: number;
  seriesId: string;
  seriesNumber: number;
  seriesName: string;
  proposedHeroGrade: 'designed' | 'implemented' | 'playable' | 'hero-grade' | 'signature';
  reviewLane: 'signature-pass' | 'hero-pass' | 'composition-pass' | 'rebuild-pass';
  signoffStatus: string;
  ingestReadiness: 'hold' | 'curation-ready' | 'backend-ready';
  dominantVerbSeed: string;
  counterforceTypeSeed: string;
  semanticNeutralitySeed: 'high' | 'medium' | 'low';
  resolutionClassSeed: 'state-morph' | 'field-recompose' | 'seal' | 'loop' | 'none';
  memoryTraceTypeSeed: string;
  approvedForNavicue: 'yes' | 'review' | 'no';
  approvedForJourney: 'yes' | 'review' | 'no';
  approvedForInsight: 'yes' | 'review' | 'no';
  approvedForPractice: 'yes' | 'review' | 'no';
  structuralScore: number;
  triageTier: string;
  heatFit: string;
  navicueFit: string;
  journeyFit: string;
  insightFit: string;
  practiceFit: string;
  repetitionClusterSize: number;
  refinementPriority: string;
  refinementReasons: string[];
  matchingTags: string[];
  signoffNotes: string;
}

const root = process.cwd();
const reportDir = path.join(root, 'docs', 'reports');
const auditPath = path.join(reportDir, 'navicue-atoms-full-audit.json');
const signoffPath = path.join(reportDir, 'navicue-atom-signoff-scaffold.json');
const qualityJsonPath = path.join(reportDir, 'navicue-atom-quality-orchestration.json');
const qualityMdPath = path.join(reportDir, 'navicue-atom-quality-orchestration.md');
const signatureCsvPath = path.join(reportDir, 'navicue-atom-signature-cohort.csv');
const clusterCsvPath = path.join(reportDir, 'navicue-atom-cluster-pressure.csv');

if (!fs.existsSync(auditPath) || !fs.existsSync(signoffPath)) {
  console.error('Missing audit/signoff inputs. Run "npm run atoms:signoff:seed" first.');
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8')) as { atoms: AuditAtom[]; totals: Record<string, number> };
const signoff = JSON.parse(fs.readFileSync(signoffPath, 'utf8')) as { rows: SignoffRow[] };

const atomsById = new Map(audit.atoms.map((atom) => [atom.id, atom]));
const rows = signoff.rows.map((row) => ({ row, atom: atomsById.get(row.atomId)! }));

const signatureCohort = rows
  .filter(({ row }) => row.reviewLane === 'signature-pass')
  .sort((a, b) => signatureOrderScore(b) - signatureOrderScore(a) || a.row.atomNumber - b.row.atomNumber)
  .map(({ row, atom }, index) => ({
    reviewOrder: index + 1,
    atomNumber: row.atomNumber,
    atomId: row.atomId,
    atomName: row.atomName,
    collectionNumber: row.collectionNumber,
    seriesNumber: row.seriesNumber,
    seriesName: row.seriesName,
    structuralScore: row.structuralScore,
    repetitionClusterSize: row.repetitionClusterSize,
    navicueFit: row.navicueFit,
    dominantVerbSeed: row.dominantVerbSeed,
    counterforceTypeSeed: row.counterforceTypeSeed,
    resolutionClassSeed: row.resolutionClassSeed,
    sensoryProfile: atom.sensoryProfile,
    physicsTags: atom.physicsTags,
  }));

const heroCohort = rows
  .filter(({ row }) => row.reviewLane === 'hero-pass')
  .sort((a, b) => heroOrderScore(b) - heroOrderScore(a) || a.row.atomNumber - b.row.atomNumber)
  .slice(0, 80)
  .map(({ row, atom }, index) => ({
    reviewOrder: index + 1,
    atomNumber: row.atomNumber,
    atomId: row.atomId,
    atomName: row.atomName,
    collectionNumber: row.collectionNumber,
    seriesNumber: row.seriesNumber,
    seriesName: row.seriesName,
    structuralScore: row.structuralScore,
    repetitionClusterSize: row.repetitionClusterSize,
    refinementPriority: row.refinementPriority,
    dominantVerbSeed: row.dominantVerbSeed,
    resolutionClassSeed: row.resolutionClassSeed,
    sensoryProfile: atom.sensoryProfile,
  }));

const clusterPressure = Object.entries(groupBy(audit.atoms, (atom) => atom.repetitionKey))
  .map(([repetitionKey, atoms]) => {
    const sample = atoms
      .slice()
      .sort((a, b) => a.number - b.number)
      .slice(0, 8)
      .map((atom) => `${atom.number}:${atom.id}`);
    return {
      repetitionKey,
      clusterSize: atoms.length,
      renderMode: atoms[0]?.renderMode ?? 'unknown',
      defaultScale: atoms[0]?.defaultScale ?? 'unknown',
      dominantSurfaceSignature: atoms[0]?.surfaces.join('+') ?? 'unknown',
      dominantResolution: atoms[0]?.resolutionProfile ?? 'unknown',
      dominantInputs: summarizeValues(atoms.flatMap((atom) => atom.dominantInputs)).slice(0, 4).map((item) => item.value),
      dominantPhysics: summarizeValues(atoms.flatMap((atom) => atom.physicsTags)).slice(0, 4).map((item) => item.value),
      examples: sample,
      differentiationLevers: deriveDifferentiationLevers(atoms[0]),
    };
  })
  .filter((cluster) => cluster.clusterSize >= 10)
  .sort((a, b) => b.clusterSize - a.clusterSize)
  .slice(0, 40);

const collectionPriorities = Object.entries(groupBy(rows, ({ row }) => String(row.collectionNumber)))
  .map(([collectionNumber, items]) => {
    const total = items.length;
    const signature = items.filter(({ row }) => row.reviewLane === 'signature-pass').length;
    const hero = items.filter(({ row }) => row.reviewLane === 'hero-pass').length;
    const rebuild = items.filter(({ row }) => row.reviewLane === 'rebuild-pass').length;
    const highRefinement = items.filter(({ row }) => row.refinementPriority === 'high' || row.refinementPriority === 'critical').length;
    const avgRepetition = avg(items.map(({ row }) => row.repetitionClusterSize));
    const priorityScore =
      avgRepetition * 0.6 +
      highRefinement * 0.8 +
      rebuild * 3 +
      Math.max(0, 12 - (signature + hero)) * 0.9;
    return {
      collectionNumber: Number(collectionNumber),
      total,
      signature,
      hero,
      rebuild,
      highRefinement,
      avgRepetition: round(avgRepetition),
      priorityScore: round(priorityScore),
      recommendedFocus: deriveCollectionFocus(Number(collectionNumber), avgRepetition, highRefinement, rebuild, signature + hero),
    };
  })
  .sort((a, b) => b.priorityScore - a.priorityScore || a.collectionNumber - b.collectionNumber);

const rebuildBriefs = rows
  .filter(({ row }) => row.reviewLane === 'rebuild-pass')
  .map(({ row, atom }) => ({
    atomNumber: row.atomNumber,
    atomId: row.atomId,
    atomName: row.atomName,
    seriesNumber: row.seriesNumber,
    seriesName: row.seriesName,
    currentIssues: row.refinementReasons,
    dominantVerbSeed: row.dominantVerbSeed,
    currentCounterforce: row.counterforceTypeSeed,
    upgradeBrief: deriveRebuildBrief(row, atom),
  }));

const qualityPack = {
  generatedAt: new Date().toISOString(),
  totals: {
    signatureCohort: signatureCohort.length,
    heroCohort: heroCohort.length,
    clusterPressureGroups: clusterPressure.length,
    rebuildBriefs: rebuildBriefs.length,
  },
  signatureCohort,
  heroCohort,
  clusterPressure,
  collectionPriorities,
  rebuildBriefs,
  operatingRule:
    'Review signature and hero atoms first, then attack sameness by repetition cluster, then redesign rebuild-pass atoms last.',
};

fs.writeFileSync(qualityJsonPath, JSON.stringify(qualityPack, null, 2));
fs.writeFileSync(signatureCsvPath, buildSignatureCsv(signatureCohort));
fs.writeFileSync(clusterCsvPath, buildClusterCsv(clusterPressure));
fs.writeFileSync(qualityMdPath, buildQualityMarkdown(qualityPack));

console.log(`Wrote ${path.relative(root, qualityJsonPath)}`);
console.log(`Wrote ${path.relative(root, qualityMdPath)}`);
console.log(`Wrote ${path.relative(root, signatureCsvPath)}`);
console.log(`Wrote ${path.relative(root, clusterCsvPath)}`);
console.log(`Signature cohort: ${signatureCohort.length}`);
console.log(`Hero cohort: ${heroCohort.length}`);
console.log(`Cluster pressure groups: ${clusterPressure.length}`);

function signatureOrderScore(item: { row: SignoffRow; atom: AuditAtom }) {
  return (
    item.row.structuralScore * 8 +
    fitScore(item.row.navicueFit) * 6 -
    item.row.repetitionClusterSize * 1.25 +
    inputDiversityScore(item.atom) * 2 +
    sensorDiversityScore(item.atom)
  );
}

function heroOrderScore(item: { row: SignoffRow; atom: AuditAtom }) {
  return (
    item.row.structuralScore * 7 +
    fitScore(item.row.navicueFit) * 5 -
    item.row.repetitionClusterSize +
    priorityPenalty(item.row.refinementPriority) +
    inputDiversityScore(item.atom)
  );
}

function fitScore(fit: string) {
  if (fit === 'signature') return 4;
  if (fit === 'high') return 3;
  if (fit === 'medium') return 2;
  return 1;
}

function priorityPenalty(priority: string) {
  if (priority === 'low') return 2;
  if (priority === 'medium') return 1;
  if (priority === 'high') return -1;
  return -3;
}

function inputDiversityScore(atom: AuditAtom) {
  return atom.dominantInputs.length + atom.surfaces.length * 0.5;
}

function sensorDiversityScore(atom: AuditAtom) {
  return atom.sensoryProfile.length + atom.deviceRequirements.length * 0.75;
}

function deriveDifferentiationLevers(atom?: AuditAtom) {
  if (!atom) return ['No source atom available'];
  const levers: string[] = [];
  if (atom.renderMode === 'canvas') levers.push('Break canvas sameness with depth, glass, or device-coupled motion');
  if (atom.renderMode === 'webgl') levers.push('Use depth and materiality to justify the premium rendering cost');
  if (atom.surfaces.includes('draggable')) levers.push('Differentiate drag atoms by counterforce and destination law, not by object theme');
  if (atom.surfaces.includes('tappable')) levers.push('Upgrade tap atoms with richer aftermath so the action does more than trigger');
  if (atom.surfaces.includes('holdable')) levers.push('Use hold duration, strain, and breath cadence to create consequence');
  if (atom.surfaces.includes('swipeable')) levers.push('Make swipe atoms directionally decisive instead of interchangeable');
  if (atom.surfaces.includes('pinchable')) levers.push('Use scale change to alter ontology, not just size');
  if (atom.resolutionProfile === 'seal') levers.push('Avoid overusing seal endings; vary into field-recompose or state-morph where possible');
  if (atom.resolutionProfile === 'loop' || atom.resolutionProfile === 'none') levers.push('Strengthen closure so the atom leaves a sharper memory trace');
  if (atom.deviceRequirements.includes('gyroscope')) levers.push('Push device embodiment harder; gyroscope atoms should feel physically non-transferable');
  if (!atom.deviceRequirements.some((req) => req !== 'haptics')) levers.push('Consider adding a secondary sensor channel where it deepens the law');
  return dedupe(levers).slice(0, 4);
}

function deriveCollectionFocus(
  collectionNumber: number,
  avgRepetition: number,
  highRefinement: number,
  rebuild: number,
  eliteCount: number
) {
  if (rebuild > 0) return 'Redesign weak engines before promoting the collection as stable.';
  if (avgRepetition > 30 && eliteCount < 20) return 'This collection needs differentiation pressure relief and stronger signature atoms.';
  if (highRefinement > 20) return 'Run a composition and payoff pass before broad ingest.';
  if (eliteCount >= 20) return 'Use this collection as a benchmark lane for hero-grade standards.';
  return 'Maintain quality and review by cluster instead of by atom number.';
}

function deriveRebuildBrief(row: SignoffRow, atom: AuditAtom) {
  const upgrades: string[] = [];
  if (atom.defaultScale === 'point' || atom.defaultScale === 'focus') {
    upgrades.push('Increase hero occupancy so the atom can command the phone.');
  }
  if (!atom.hasResolution) {
    upgrades.push('Add a decisive resolution path with a real threshold morph.');
  }
  if (atom.surfaces.length <= 1) {
    upgrades.push('Add a second meaningful interaction dimension or counterforce.');
  }
  upgrades.push('Rebuild around one dominant verb and one unforgettable memory trace.');
  return upgrades.join(' ');
}

function buildSignatureCsv(rows: typeof signatureCohort) {
  const headers = [
    'review_order',
    'atom_number',
    'atom_id',
    'atom_name',
    'collection_number',
    'series_number',
    'series_name',
    'structural_score',
    'repetition_cluster_size',
    'navicue_fit',
    'dominant_verb_seed',
    'counterforce_type_seed',
    'resolution_class_seed',
    'sensory_profile',
    'physics_tags',
  ];
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.reviewOrder,
        row.atomNumber,
        row.atomId,
        row.atomName,
        row.collectionNumber,
        row.seriesNumber,
        row.seriesName,
        row.structuralScore,
        row.repetitionClusterSize,
        row.navicueFit,
        row.dominantVerbSeed,
        row.counterforceTypeSeed,
        row.resolutionClassSeed,
        row.sensoryProfile.join(' | '),
        row.physicsTags.join(' | '),
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  return `${lines.join('\n')}\n`;
}

function buildClusterCsv(rows: typeof clusterPressure) {
  const headers = [
    'repetition_key',
    'cluster_size',
    'render_mode',
    'default_scale',
    'dominant_surface_signature',
    'dominant_resolution',
    'dominant_inputs',
    'dominant_physics',
    'examples',
    'differentiation_levers',
  ];
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.repetitionKey,
        row.clusterSize,
        row.renderMode,
        row.defaultScale,
        row.dominantSurfaceSignature,
        row.dominantResolution,
        row.dominantInputs.join(' | '),
        row.dominantPhysics.join(' | '),
        row.examples.join(' | '),
        row.differentiationLevers.join(' | '),
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  return `${lines.join('\n')}\n`;
}

function buildQualityMarkdown(pack: typeof qualityPack) {
  return [
    '# NaviCue Atom Quality Orchestration',
    '',
    `Generated: ${pack.generatedAt}`,
    '',
    '## Operating Rule',
    '',
    pack.operatingRule,
    '',
    '## Totals',
    '',
    `- Signature cohort: ${pack.totals.signatureCohort}`,
    `- Hero cohort surfaced: ${pack.totals.heroCohort}`,
    `- Cluster pressure groups: ${pack.totals.clusterPressureGroups}`,
    `- Rebuild briefs: ${pack.totals.rebuildBriefs}`,
    '',
    '## Review Order',
    '',
    '1. Signature cohort',
    '2. Hero cohort',
    '3. Largest repetition clusters',
    '4. Rebuild briefs',
    '',
    '## Highest Priority Collections',
    '',
    ...pack.collectionPriorities.slice(0, 5).map(
      (item) =>
        `- Collection ${item.collectionNumber}: score ${item.priorityScore} — ${item.recommendedFocus}`
    ),
    '',
    '## Top Cluster Pressure Groups',
    '',
    ...pack.clusterPressure.slice(0, 8).map(
      (cluster) =>
        `- ${cluster.clusterSize} atoms in \`${cluster.repetitionKey}\` — ${cluster.differentiationLevers.join('; ')}`
    ),
    '',
  ].join('\n');
}

function groupBy<T>(values: T[], getKey: (value: T) => string) {
  const groups: Record<string, T[]> = {};
  for (const value of values) {
    const key = getKey(value);
    groups[key] = groups[key] ?? [];
    groups[key].push(value);
  }
  return groups;
}

function summarizeValues(values: string[]) {
  return Object.entries(groupBy(values, (value) => value)).map(([value, entries]) => ({
    value,
    count: entries.length,
  })).sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function avg(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function dedupe(values: string[]) {
  return [...new Set(values)];
}

function csvEscape(value: string | number) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
