import fs from 'node:fs';
import path from 'node:path';
import type {
  AtomApprovalDecision,
  AtomIngestReadiness,
  AtomIngestRow,
  AtomReviewLane,
  AtomSignoffSeed,
} from '../packages/navicue-atoms/src/index.ts';

interface AuditAtom {
  id: string;
  number: number;
  name: string;
  series: string;
  seriesNumber: number;
  seriesName: string;
  collectionNumber: number;
  structural: {
    structuralScore: number;
    triageTier: 'hero-candidate' | 'composition-sensitive' | 'likely-underpowered';
  };
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
  repetitionClusterSize: number;
  refinementPriority: 'low' | 'medium' | 'high' | 'critical';
  refinementReasons: string[];
  matchingTags: string[];
}

interface FullAuditSummary {
  generatedAt: string;
  totals: {
    totalAtoms: number;
    completeAtoms: number;
    heroCandidates: number;
    compositionSensitive: number;
    likelyUnderpowered: number;
  };
  atoms: AuditAtom[];
}

const root = process.cwd();
const reportDir = path.join(root, 'docs', 'reports');
const ingestDir = path.join(root, 'system', 'ingest', 'navicue-atoms');
const fullAuditPath = path.join(reportDir, 'navicue-atoms-full-audit.json');
const signoffJsonPath = path.join(reportDir, 'navicue-atom-signoff-scaffold.json');
const signoffCsvPath = path.join(reportDir, 'navicue-atom-signoff-scaffold.csv');
const signoffMdPath = path.join(reportDir, 'navicue-atom-signoff-and-ingest.md');
const ingestPackPath = path.join(ingestDir, 'navicue-atom-ingest-pack.json');

if (!fs.existsSync(fullAuditPath)) {
  console.error(`Missing ${path.relative(root, fullAuditPath)}. Run "npm run atoms:audit:full" first.`);
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(fullAuditPath, 'utf8')) as FullAuditSummary;
const signoffSeeds = audit.atoms.map(buildSignoffSeed);
const ingestRows = audit.atoms.map((atom) => buildIngestRow(atom, signoffSeeds.find((seed) => seed.atomId === atom.id)!));

const laneSummary = summarizeStrings(signoffSeeds.map((seed) => seed.reviewLane));
const gradeSummary = summarizeStrings(signoffSeeds.map((seed) => seed.proposedHeroGrade));
const readinessSummary = summarizeStrings(signoffSeeds.map((seed) => seed.ingestReadiness));
const navicueApprovalSummary = summarizeStrings(signoffSeeds.map((seed) => seed.approvedForNavicue));
const journeyApprovalSummary = summarizeStrings(signoffSeeds.map((seed) => seed.approvedForJourney));
const insightApprovalSummary = summarizeStrings(signoffSeeds.map((seed) => seed.approvedForInsight));
const practiceApprovalSummary = summarizeStrings(signoffSeeds.map((seed) => seed.approvedForPractice));

const topRefinementSeeds = signoffSeeds
  .filter((seed) => seed.refinementPriority === 'critical' || seed.refinementPriority === 'high')
  .sort(
    (a, b) =>
      priorityWeight(b.refinementPriority) - priorityWeight(a.refinementPriority) ||
      a.structuralScore - b.structuralScore ||
      a.atomNumber - b.atomNumber
  )
  .slice(0, 60);

const ingestPack = {
  generatedAt: new Date().toISOString(),
  sourceAuditGeneratedAt: audit.generatedAt,
  totals: audit.totals,
  signoff: {
    laneSummary,
    gradeSummary,
    readinessSummary,
    navicueApprovalSummary,
    journeyApprovalSummary,
    insightApprovalSummary,
    practiceApprovalSummary,
  },
  topRefinementSeeds,
  rows: ingestRows,
  notes: [
    'This pack is intended for backend staging and curation, not blind auto-approval.',
    'Each row is shaped as atomId + payload so it can be adapted into a staging table without lossy transforms.',
    'Manual signoff should update the scaffold first, then promotion to backend-ready can happen by lane.',
  ],
};

fs.mkdirSync(reportDir, { recursive: true });
fs.mkdirSync(ingestDir, { recursive: true });
fs.writeFileSync(signoffJsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), rows: signoffSeeds }, null, 2));
fs.writeFileSync(signoffCsvPath, buildSignoffCsv(signoffSeeds));
fs.writeFileSync(signoffMdPath, buildSignoffMarkdown(audit, signoffSeeds, ingestPack));
fs.writeFileSync(ingestPackPath, JSON.stringify(ingestPack, null, 2));

console.log(`Wrote ${path.relative(root, signoffJsonPath)}`);
console.log(`Wrote ${path.relative(root, signoffCsvPath)}`);
console.log(`Wrote ${path.relative(root, signoffMdPath)}`);
console.log(`Wrote ${path.relative(root, ingestPackPath)}`);
console.log(`Seeded signoff rows: ${signoffSeeds.length}`);

function buildSignoffSeed(atom: AuditAtom): AtomSignoffSeed {
  const proposedHeroGrade = deriveHeroGrade(atom);
  const reviewLane = deriveReviewLane(atom, proposedHeroGrade);
  const ingestReadiness = deriveIngestReadiness(atom, proposedHeroGrade);
  const dominantVerbSeed = deriveDominantVerb(atom);
  const counterforceTypeSeed = deriveCounterforce(atom);
  const semanticNeutralitySeed = deriveSemanticNeutrality(atom);
  const memoryTraceTypeSeed = deriveMemoryTrace(atom);

  return {
    atomId: atom.id,
    atomNumber: atom.number,
    atomName: atom.name,
    collectionNumber: atom.collectionNumber,
    seriesId: atom.series,
    seriesNumber: atom.seriesNumber,
    seriesName: atom.seriesName,
    proposedHeroGrade,
    reviewLane,
    signoffStatus: 'seeded',
    ingestReadiness,
    dominantVerbSeed,
    counterforceTypeSeed,
    semanticNeutralitySeed,
    resolutionClassSeed: atom.resolutionProfile,
    memoryTraceTypeSeed,
    approvedForNavicue: deriveApprovalDecision(atom.navicueFit, atom.structural.triageTier),
    approvedForJourney: deriveApprovalDecision(atom.journeyFit, atom.structural.triageTier),
    approvedForInsight: deriveApprovalDecision(atom.insightFit, atom.structural.triageTier),
    approvedForPractice: deriveApprovalDecision(atom.practiceFit, atom.structural.triageTier),
    structuralScore: atom.structural.structuralScore,
    triageTier: atom.structural.triageTier,
    heatFit: atom.heatFit,
    navicueFit: atom.navicueFit,
    journeyFit: atom.journeyFit,
    insightFit: atom.insightFit,
    practiceFit: atom.practiceFit,
    repetitionClusterSize: atom.repetitionClusterSize,
    refinementPriority: atom.refinementPriority,
    refinementReasons: atom.refinementReasons,
    matchingTags: atom.matchingTags,
    signoffNotes: buildSeedNote(atom, proposedHeroGrade, reviewLane),
    manualHeroGrade: '',
    manualOverrideReason: '',
    reviewer: '',
    reviewedAt: '',
  };
}

function buildIngestRow(atom: AuditAtom, seed: AtomSignoffSeed): AtomIngestRow {
  return {
    atomId: atom.id,
    payload: {
      atomId: atom.id,
      atomNumber: atom.number,
      atomName: atom.name,
      collectionNumber: atom.collectionNumber,
      seriesId: atom.series,
      seriesNumber: atom.seriesNumber,
      seriesName: atom.seriesName,
      audit: {
        structuralScore: atom.structural.structuralScore,
        triageTier: atom.structural.triageTier,
        heatFit: atom.heatFit,
        navicueFit: atom.navicueFit,
        journeyFit: atom.journeyFit,
        insightFit: atom.insightFit,
        practiceFit: atom.practiceFit,
        repetitionClusterSize: atom.repetitionClusterSize,
        refinementPriority: atom.refinementPriority,
        refinementReasons: atom.refinementReasons,
      },
      matching: {
        dominantInputs: atom.dominantInputs,
        sensoryProfile: atom.sensoryProfile,
        therapeuticJobs: atom.therapeuticJobs,
        physicsTags: atom.physicsTags,
        tags: atom.matchingTags,
      },
      signoff: {
        proposedHeroGrade: seed.proposedHeroGrade,
        reviewLane: seed.reviewLane,
        signoffStatus: seed.signoffStatus,
        ingestReadiness: seed.ingestReadiness,
        dominantVerbSeed: seed.dominantVerbSeed,
        counterforceTypeSeed: seed.counterforceTypeSeed,
        semanticNeutralitySeed: seed.semanticNeutralitySeed,
        resolutionClassSeed: seed.resolutionClassSeed,
        memoryTraceTypeSeed: seed.memoryTraceTypeSeed,
        approvedForNavicue: seed.approvedForNavicue,
        approvedForJourney: seed.approvedForJourney,
        approvedForInsight: seed.approvedForInsight,
        approvedForPractice: seed.approvedForPractice,
        signoffNotes: seed.signoffNotes,
      },
    },
  };
}

function deriveHeroGrade(atom: AuditAtom) {
  if (
    atom.structural.triageTier === 'hero-candidate' &&
    atom.structural.structuralScore >= 9 &&
    atom.navicueFit === 'signature' &&
    atom.repetitionClusterSize <= 8
  ) {
    return 'signature' as const;
  }
  if (atom.structural.triageTier === 'hero-candidate') {
    return 'hero-grade' as const;
  }
  if (atom.structural.triageTier === 'composition-sensitive' && atom.structural.structuralScore >= 6) {
    return 'playable' as const;
  }
  return 'implemented' as const;
}

function deriveReviewLane(atom: AuditAtom, grade: ReturnType<typeof deriveHeroGrade>): AtomReviewLane {
  if (atom.structural.triageTier === 'likely-underpowered') return 'rebuild-pass';
  if (grade === 'signature') return 'signature-pass';
  if (grade === 'hero-grade') return 'hero-pass';
  return 'composition-pass';
}

function deriveIngestReadiness(atom: AuditAtom, grade: ReturnType<typeof deriveHeroGrade>): AtomIngestReadiness {
  if (atom.structural.triageTier === 'likely-underpowered') return 'hold';
  if (grade === 'signature' || grade === 'hero-grade') return 'curation-ready';
  return 'hold';
}

function deriveDominantVerb(atom: AuditAtom): string {
  const input = atom.dominantInputs[0];
  if (input === 'breath') return 'regulate';
  if (input === 'observe') return 'witness';
  if (input === 'voice') return 'speak';
  if (input === 'tilt') return 'tilt';
  if (input === 'pinch') return 'reshape';
  if (input === 'draw') return 'trace';
  if (input === 'scrub') return 'clear';
  if (input === 'swipe') return 'redirect';
  if (input === 'drag') return 'guide';
  if (input === 'hold') return 'hold';
  if (input === 'tap') return 'trigger';
  return 'engage';
}

function deriveCounterforce(atom: AuditAtom): string {
  if (atom.physicsTags.includes('topological')) return 'paradox';
  if (atom.physicsTags.includes('optical')) return 'distortion';
  if (atom.physicsTags.includes('network')) return 'entanglement';
  if (atom.physicsTags.includes('structural')) return 'constraint';
  if (atom.physicsTags.includes('thermal')) return 'pressure';
  if (atom.physicsTags.includes('gravitational')) return 'weight';
  if (atom.physicsTags.includes('fluid')) return 'drag';
  if (atom.physicsTags.includes('acoustic')) return 'noise';
  if (atom.physicsTags.includes('subtractive')) return 'occlusion';
  return 'friction';
}

function deriveSemanticNeutrality(atom: AuditAtom) {
  if (atom.dominantInputs.includes('voice') || atom.dominantInputs.includes('type')) return 'medium' as const;
  if (
    atom.series.includes('semantic') ||
    atom.series.includes('epistemic') ||
    atom.series.includes('identity')
  ) {
    return 'medium' as const;
  }
  return 'high' as const;
}

function deriveMemoryTrace(atom: AuditAtom): string {
  if (atom.resolutionProfile === 'seal') return 'closure';
  if (atom.resolutionProfile === 'state-morph') return 'transformation';
  if (atom.resolutionProfile === 'field-recompose') return 'reorientation';
  if (atom.physicsTags.includes('gravitational')) return 'weight-shift';
  if (atom.physicsTags.includes('optical')) return 'clarity';
  if (atom.physicsTags.includes('network')) return 'integration';
  if (atom.physicsTags.includes('fluid')) return 'release';
  return 'stillness';
}

function deriveApprovalDecision(
  fit: AuditAtom['navicueFit'],
  triageTier: AuditAtom['structural']['triageTier']
): AtomApprovalDecision {
  if (triageTier === 'likely-underpowered') return 'no';
  if (fit === 'signature' || fit === 'high') return 'yes';
  if (fit === 'medium') return 'review';
  return 'no';
}

function buildSeedNote(atom: AuditAtom, grade: string, lane: AtomReviewLane): string {
  const base = `Seeded from structural audit. ${lane} with proposed grade ${grade}.`;
  if (atom.refinementPriority === 'critical' || atom.refinementPriority === 'high') {
    return `${base} Manual review required before ingest because refinement priority is ${atom.refinementPriority}.`;
  }
  if (atom.repetitionClusterSize >= 20) {
    return `${base} Review against repetition cluster before approving as signature behavior.`;
  }
  return `${base} Ready for manual curation pass.`;
}

function buildSignoffCsv(rows: AtomSignoffSeed[]): string {
  const headers = [
    'atom_number',
    'atom_id',
    'atom_name',
    'collection_number',
    'series_number',
    'series_id',
    'series_name',
    'proposed_hero_grade',
    'review_lane',
    'signoff_status',
    'ingest_readiness',
    'dominant_verb_seed',
    'counterforce_type_seed',
    'semantic_neutrality_seed',
    'resolution_class_seed',
    'memory_trace_type_seed',
    'approved_for_navicue',
    'approved_for_journey',
    'approved_for_insight',
    'approved_for_practice',
    'structural_score',
    'triage_tier',
    'heat_fit',
    'navicue_fit',
    'journey_fit',
    'insight_fit',
    'practice_fit',
    'repetition_cluster_size',
    'refinement_priority',
    'refinement_reasons',
    'matching_tags',
    'signoff_notes',
    'manual_hero_grade',
    'manual_override_reason',
    'reviewer',
    'reviewed_at',
  ];

  const lines = [headers.join(',')];
  for (const row of rows) {
    const values = [
      row.atomNumber,
      row.atomId,
      row.atomName,
      row.collectionNumber,
      row.seriesNumber,
      row.seriesId,
      row.seriesName,
      row.proposedHeroGrade,
      row.reviewLane,
      row.signoffStatus,
      row.ingestReadiness,
      row.dominantVerbSeed,
      row.counterforceTypeSeed,
      row.semanticNeutralitySeed,
      row.resolutionClassSeed,
      row.memoryTraceTypeSeed,
      row.approvedForNavicue,
      row.approvedForJourney,
      row.approvedForInsight,
      row.approvedForPractice,
      row.structuralScore,
      row.triageTier,
      row.heatFit,
      row.navicueFit,
      row.journeyFit,
      row.insightFit,
      row.practiceFit,
      row.repetitionClusterSize,
      row.refinementPriority,
      row.refinementReasons.join(' | '),
      row.matchingTags.join(' | '),
      row.signoffNotes,
      row.manualHeroGrade ?? '',
      row.manualOverrideReason ?? '',
      row.reviewer ?? '',
      row.reviewedAt ?? '',
    ].map(csvEscape);
    lines.push(values.join(','));
  }
  return `${lines.join('\n')}\n`;
}

function buildSignoffMarkdown(audit: FullAuditSummary, rows: AtomSignoffSeed[], ingestPack: typeof ingestPack): string {
  const fastTrack = rows.filter((row) => row.reviewLane === 'signature-pass' || row.reviewLane === 'hero-pass');
  const rebuild = rows.filter((row) => row.reviewLane === 'rebuild-pass');
  const hold = rows.filter((row) => row.ingestReadiness === 'hold');
  const curationReady = rows.filter((row) => row.ingestReadiness === 'curation-ready');

  return [
    '# NaviCue Atom Signoff And Ingest',
    '',
    `Generated: ${ingestPack.generatedAt}`,
    '',
    '## What This Pack Does',
    '',
    '- Seeds a manual signoff row for every atom',
    '- Translates the audit into review lanes instead of one flat queue',
    '- Produces an ingest pack shaped as `atomId + payload` for backend staging',
    '',
    '## Seeded Signoff Totals',
    '',
    `- Total atoms: ${audit.totals.completeAtoms}`,
    `- Signature pass candidates: ${rows.filter((row) => row.reviewLane === 'signature-pass').length}`,
    `- Hero pass candidates: ${rows.filter((row) => row.reviewLane === 'hero-pass').length}`,
    `- Composition pass atoms: ${rows.filter((row) => row.reviewLane === 'composition-pass').length}`,
    `- Rebuild pass atoms: ${rebuild.length}`,
    `- Curation-ready for ingest: ${curationReady.length}`,
    `- Hold before ingest: ${hold.length}`,
    '',
    '## Recommended Signoff Order',
    '',
    `1. Signature + hero pass (${fastTrack.length} atoms)`,
    `2. Critical/high composition queue (${ingestPack.topRefinementSeeds.length} atoms surfaced)`,
    `3. Rebuild pass (${rebuild.length} atoms)`,
    '',
    '## Output Files',
    '',
    `- JSON scaffold: \`${path.relative(root, signoffJsonPath)}\``,
    `- CSV scaffold: \`${path.relative(root, signoffCsvPath)}\``,
    `- Ingest pack: \`${path.relative(root, ingestPackPath)}\``,
    '',
    '## How To Use',
    '',
    '1. Review the CSV scaffold by lane, not by atom number.',
    '2. Promote or downgrade `manual_hero_grade` where needed.',
    '3. Fill reviewer, reviewed_at, and manual_override_reason during curation.',
    '4. Only promote rows from `curation-ready` to `backend-ready` after manual signoff.',
    '',
  ].join('\n');
}

function summarizeStrings(values: string[]) {
  return Object.entries(countBy(values))
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function countBy(values: string[]) {
  const counts: Record<string, number> = {};
  for (const value of values) {
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

function csvEscape(value: string | number) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function priorityWeight(priority: string) {
  if (priority === 'critical') return 4;
  if (priority === 'high') return 3;
  if (priority === 'medium') return 2;
  return 1;
}
