import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { THROTTLE, type BreathPatternId, type NarrativeDensity } from '../src/navicue-types';
import {
  COLOR_SIGNATURE_IDS,
  ENTRANCE_IDS,
  EXIT_IDS,
  VOICE_LANE_IDS,
  VOCAL_FAMILY_IDS,
} from '../src/navicue-data';
import {
  ATOM_CATALOG,
  ATOM_COMPONENTS,
  ATOM_IDS,
  TOTAL_ATOM_COUNT,
} from '../src/app/components/atoms';
import { ATOM_CONTENT_PROFILES } from '../src/app/data/atom-content-profiles';
import { getAtomCopyProfile } from '../src/app/data/atom-copy-profile';
import { buildComposition, type CompositionInput } from '../src/app/data/composition-engine';

type LayoutCheck = {
  label: string;
  file: string;
  required: boolean;
};

type BuildFailure = {
  atomId: string;
  context: string;
  error: string;
};

type Report = {
  generatedAt: string;
  status: 'pass' | 'fail';
  summary: {
    totalAtoms: number;
    totalCatalogCount: number;
    completeAtoms: number;
    builtAtoms: number;
    baselineBuilds: number;
    matrixBuilds: number;
  };
  registry: {
    missingComponentsForComplete: string[];
    builtWithoutCompleteStatus: string[];
    missingContentProfiles: string[];
    missingCopyProfiles: string[];
  };
  contract: {
    invalidEntranceAffinity: Array<{ atomId: string; values: string[] }>;
    invalidExitAffinity: Array<{ atomId: string; values: string[] }>;
    invalidVocalFamilyAffinity: Array<{ atomId: string; values: string[] }>;
    copyBudgetViolations: Array<{
      atomId: string;
      anchorWordBudget: number;
      kineticWordBudget: number;
    }>;
  };
  deviceMirror: {
    required: Array<{ label: string; wired: boolean }>;
    optional: Array<{ label: string; wired: boolean }>;
  };
  build: {
    baselineFailures: BuildFailure[];
    matrixFailures: BuildFailure[];
  };
  notes: string[];
};

const BREATH_PATTERN_IDS: BreathPatternId[] = ['calm', 'box', 'simple', 'energize'];
const NARRATIVE_DENSITIES: NarrativeDensity[] = ['full', 'core', 'minimal', 'silent'];

const LAYOUT_CHECKS: LayoutCheck[] = [
  { label: 'design-center', file: '../src/app/pages/DesignCenter.tsx', required: true },
  { label: 'atoms', file: '../src/app/pages/atoms/AtomsLayout.tsx', required: true },
  { label: 'surfaces', file: '../src/app/pages/surfaces/SurfacesLayout.tsx', required: true },
  { label: 'motion', file: '../src/app/pages/motion/MotionLayout.tsx', required: true },
  { label: 'voice', file: '../src/app/pages/voice/VoiceLayout.tsx', required: true },
  { label: 'delivery', file: '../src/app/pages/delivery/DeliveryLayout.tsx', required: false },
  { label: 'showcase', file: '../src/app/pages/showcase/ShowcaseLayout.tsx', required: false },
];

function serializeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function buildInput(
  atomId: (typeof ATOM_IDS)[number],
  index: number,
  overrides?: Partial<CompositionInput>,
): CompositionInput {
  const profile = ATOM_CONTENT_PROFILES[atomId];

  return {
    schemaTarget: 'defectiveness',
    heatBand: ((index % 5) + 1) as CompositionInput['heatBand'],
    chronoContext: ['morning', 'work', 'social', 'night'][
      index % 4
    ] as CompositionInput['chronoContext'],
    colorSignature: COLOR_SIGNATURE_IDS[index % COLOR_SIGNATURE_IDS.length],
    visualEngine: ['gradient-mesh', 'particle-field', 'constellation', 'noise-fabric', 'void'][
      index % 5
    ] as CompositionInput['visualEngine'],
    engineParams: {
      density: 0.45 + (index % 3) * 0.1,
      speed: 0.25 + (index % 4) * 0.05,
      complexity: 0.45 + (index % 5) * 0.08,
      reactivity: 0.35 + (index % 4) * 0.1,
      depth: 0.4 + (index % 3) * 0.15,
    },
    responseProfile: ['resonance', 'buoyant', 'velocity', 'stillness'][
      index % 4
    ] as CompositionInput['responseProfile'],
    breathPattern: BREATH_PATTERN_IDS[index % BREATH_PATTERN_IDS.length],
    arrivalCurve: ['arrival', 'spring'][index % 2] as CompositionInput['arrivalCurve'],
    departureCurve: ['departure', 'spring'][index % 2] as CompositionInput['departureCurve'],
    voiceLane: VOICE_LANE_IDS[index % VOICE_LANE_IDS.length],
    entranceMaterialization: ['emerge', 'dissolve', 'burn-in', 'immediate'][
      index % 4
    ] as CompositionInput['entranceMaterialization'],
    exitMaterialization: ['dissolve', 'burn-in', 'emerge', 'immediate'][
      index % 4
    ] as CompositionInput['exitMaterialization'],
    entrance: ENTRANCE_IDS[index % ENTRANCE_IDS.length],
    exit: EXIT_IDS[index % EXIT_IDS.length],
    atomId,
    primaryGesture: profile.primaryGesture,
    useResolutionMatrix: index % 2 === 0,
    narrativeDensity: NARRATIVE_DENSITIES[index % NARRATIVE_DENSITIES.length],
    ...overrides,
  };
}

function assertCompositionShape(atomId: string, context: string, input: CompositionInput) {
  const composition = buildComposition(input);

  if (composition.heroPhysics.atomId !== atomId) {
    throw new Error(`${context}: composition hero atom drifted`);
  }

  if (!composition.atomicVoice.anchorPrompt?.text) {
    throw new Error(`${context}: missing anchor prompt`);
  }

  if (composition.narrative.density !== input.narrativeDensity) {
    throw new Error(`${context}: narrative density drifted`);
  }

  if (input.narrativeDensity === 'silent') {
    if (
      composition.narrative.inboundHook ||
      composition.narrative.narrativeCanopy ||
      composition.narrative.outboundReceipt
    ) {
      throw new Error(`${context}: silent narrative leaked canopy or receipt copy`);
    }
  } else {
    if (!composition.narrative.inboundHook?.text) {
      throw new Error(`${context}: missing inbound hook`);
    }
    if (!composition.narrative.outboundReceipt?.text) {
      throw new Error(`${context}: missing outbound receipt`);
    }
  }

  if (
    (input.narrativeDensity === 'core' || input.narrativeDensity === 'full') &&
    !composition.narrative.narrativeCanopy?.text
  ) {
    throw new Error(`${context}: missing narrative canopy`);
  }

  if (composition.temporalBookends.exit !== input.exit) {
    throw new Error(`${context}: exit contract drifted`);
  }
}

async function layoutWiringChecks(scriptDir: string) {
  const results = await Promise.all(
    LAYOUT_CHECKS.map(async (check) => {
      const content = await readFile(path.resolve(scriptDir, check.file), 'utf8');
      return {
        label: check.label,
        required: check.required,
        wired: content.includes('DeviceMirrorProvider'),
      };
    }),
  );

  return {
    required: results
      .filter((result) => result.required)
      .map(({ label, wired }) => ({ label, wired })),
    optional: results
      .filter((result) => !result.required)
      .map(({ label, wired }) => ({ label, wired })),
  };
}

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const repoRoot = path.resolve(__dirname, '../../..');
  const reportsDir = path.join(repoRoot, 'docs/reports');
  const reportBase = path.join(reportsDir, 'design-center-player-readiness');

  const completeAtoms = ATOM_IDS.filter((id) => ATOM_CATALOG[id].status === 'complete');
  const builtAtoms = ATOM_IDS.filter((id) => Boolean(ATOM_COMPONENTS[id]));

  const missingComponentsForComplete = completeAtoms.filter((id) => !ATOM_COMPONENTS[id]);
  const builtWithoutCompleteStatus = builtAtoms.filter(
    (id) => ATOM_CATALOG[id].status !== 'complete',
  );
  const missingContentProfiles = ATOM_IDS.filter((id) => !ATOM_CONTENT_PROFILES[id]);

  const missingCopyProfiles: string[] = [];
  const copyBudgetViolations: Array<{
    atomId: string;
    anchorWordBudget: number;
    kineticWordBudget: number;
  }> = [];

  for (const atomId of ATOM_IDS) {
    try {
      const profile = getAtomCopyProfile(atomId);
      if (
        profile.anchorWordBudget > THROTTLE.anchorPrompt.wordMax ||
        profile.kineticWordBudget > THROTTLE.kineticPayload.wordMax
      ) {
        copyBudgetViolations.push({
          atomId,
          anchorWordBudget: profile.anchorWordBudget,
          kineticWordBudget: profile.kineticWordBudget,
        });
      }
    } catch {
      missingCopyProfiles.push(atomId);
    }
  }

  const invalidEntranceAffinity = ATOM_IDS.map((atomId) => ({
    atomId,
    values: ATOM_CONTENT_PROFILES[atomId].entranceAffinity.filter(
      (value) => !ENTRANCE_IDS.includes(value),
    ),
  })).filter((item) => item.values.length > 0);

  const invalidExitAffinity = ATOM_IDS.map((atomId) => ({
    atomId,
    values: ATOM_CONTENT_PROFILES[atomId].exitAffinity.filter((value) => !EXIT_IDS.includes(value)),
  })).filter((item) => item.values.length > 0);

  const invalidVocalFamilyAffinity = ATOM_IDS.map((atomId) => ({
    atomId,
    values: ATOM_CONTENT_PROFILES[atomId].vocalFamilyAffinity.filter(
      (value) => !VOCAL_FAMILY_IDS.includes(value),
    ),
  })).filter((item) => item.values.length > 0);

  const baselineFailures: BuildFailure[] = [];
  builtAtoms.forEach((atomId, index) => {
    const input = buildInput(atomId, index);
    try {
      assertCompositionShape(atomId, 'baseline', input);
    } catch (error) {
      baselineFailures.push({
        atomId,
        context: 'baseline',
        error: serializeError(error),
      });
    }
  });

  const matrixFailures: BuildFailure[] = [];
  const representativeAtoms = [
    builtAtoms[0],
    builtAtoms[Math.floor(builtAtoms.length / 2)],
    builtAtoms[builtAtoms.length - 1],
  ].filter(Boolean) as string[];

  let matrixBuilds = 0;

  representativeAtoms.forEach((atomId, atomIndex) => {
    VOICE_LANE_IDS.forEach((voiceLane, index) => {
      const input = buildInput(atomId, index + atomIndex, { voiceLane });
      try {
        assertCompositionShape(atomId, `voice:${voiceLane}`, input);
        matrixBuilds++;
      } catch (error) {
        matrixFailures.push({
          atomId,
          context: `voice:${voiceLane}`,
          error: serializeError(error),
        });
      }
    });

    ENTRANCE_IDS.forEach((entrance, index) => {
      const input = buildInput(atomId, index + atomIndex, { entrance });
      try {
        assertCompositionShape(atomId, `entrance:${entrance}`, input);
        matrixBuilds++;
      } catch (error) {
        matrixFailures.push({
          atomId,
          context: `entrance:${entrance}`,
          error: serializeError(error),
        });
      }
    });

    EXIT_IDS.forEach((exit, index) => {
      const input = buildInput(atomId, index + atomIndex, {
        exit,
        exitMaterialization: exit === 'burn-in' ? 'burn-in' : exit,
      });
      try {
        assertCompositionShape(atomId, `exit:${exit}`, input);
        matrixBuilds++;
      } catch (error) {
        matrixFailures.push({ atomId, context: `exit:${exit}`, error: serializeError(error) });
      }
    });

    COLOR_SIGNATURE_IDS.forEach((colorSignature, index) => {
      const input = buildInput(atomId, index + atomIndex, { colorSignature });
      try {
        assertCompositionShape(atomId, `color:${colorSignature}`, input);
        matrixBuilds++;
      } catch (error) {
        matrixFailures.push({
          atomId,
          context: `color:${colorSignature}`,
          error: serializeError(error),
        });
      }
    });

    BREATH_PATTERN_IDS.forEach((breathPattern, index) => {
      const input = buildInput(atomId, index + atomIndex, { breathPattern });
      try {
        assertCompositionShape(atomId, `breath:${breathPattern}`, input);
        matrixBuilds++;
      } catch (error) {
        matrixFailures.push({
          atomId,
          context: `breath:${breathPattern}`,
          error: serializeError(error),
        });
      }
    });

    NARRATIVE_DENSITIES.forEach((narrativeDensity, index) => {
      const input = buildInput(atomId, index + atomIndex, { narrativeDensity });
      try {
        assertCompositionShape(atomId, `density:${narrativeDensity}`, input);
        matrixBuilds++;
      } catch (error) {
        matrixFailures.push({
          atomId,
          context: `density:${narrativeDensity}`,
          error: serializeError(error),
        });
      }
    });
  });

  const deviceMirror = await layoutWiringChecks(__dirname);

  const notes = [
    `Player composition assembled successfully for ${builtAtoms.length - baselineFailures.length}/${builtAtoms.length} built atoms under baseline coverage.`,
    `Matrix assembly exercised ${matrixBuilds} variable combinations across representative atoms.`,
    'Current app QA typecheck is still narrow and token-focused. This readiness harness closes the runtime gap until the wider app is typechecked.',
  ];

  if (TOTAL_ATOM_COUNT !== 700 || ATOM_IDS.length !== 700) {
    notes.push('Atom registry count is not at the expected 700 baseline.');
  }

  if (deviceMirror.optional.some((item) => !item.wired)) {
    notes.push(
      'Delivery and showcase are not mirror-wired today. That is acceptable if they remain inspection surfaces instead of live assembly labs.',
    );
  }

  const hardFailures = [
    missingComponentsForComplete.length > 0,
    missingContentProfiles.length > 0,
    missingCopyProfiles.length > 0,
    invalidEntranceAffinity.length > 0,
    invalidExitAffinity.length > 0,
    invalidVocalFamilyAffinity.length > 0,
    copyBudgetViolations.length > 0,
    baselineFailures.length > 0,
    matrixFailures.length > 0,
    deviceMirror.required.some((item) => !item.wired),
    TOTAL_ATOM_COUNT !== 700,
    ATOM_IDS.length !== 700,
  ].some(Boolean);

  const report: Report = {
    generatedAt: new Date().toISOString(),
    status: hardFailures ? 'fail' : 'pass',
    summary: {
      totalAtoms: ATOM_IDS.length,
      totalCatalogCount: TOTAL_ATOM_COUNT,
      completeAtoms: completeAtoms.length,
      builtAtoms: builtAtoms.length,
      baselineBuilds: builtAtoms.length,
      matrixBuilds,
    },
    registry: {
      missingComponentsForComplete,
      builtWithoutCompleteStatus,
      missingContentProfiles,
      missingCopyProfiles,
    },
    contract: {
      invalidEntranceAffinity,
      invalidExitAffinity,
      invalidVocalFamilyAffinity,
      copyBudgetViolations,
    },
    deviceMirror,
    build: {
      baselineFailures,
      matrixFailures,
    },
    notes,
  };

  const md = [
    '# Design Center Player Readiness',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Status: ${report.status.toUpperCase()}`,
    '',
    '## Summary',
    `- Total atoms: ${report.summary.totalAtoms}`,
    `- Registry count: ${report.summary.totalCatalogCount}`,
    `- Complete atoms: ${report.summary.completeAtoms}`,
    `- Built atoms: ${report.summary.builtAtoms}`,
    `- Baseline builds checked: ${report.summary.baselineBuilds}`,
    `- Matrix builds checked: ${report.summary.matrixBuilds}`,
    '',
    '## Registry',
    `- Missing components for complete atoms: ${report.registry.missingComponentsForComplete.length}`,
    `- Built without complete status: ${report.registry.builtWithoutCompleteStatus.length}`,
    `- Missing content profiles: ${report.registry.missingContentProfiles.length}`,
    `- Missing copy profiles: ${report.registry.missingCopyProfiles.length}`,
    '',
    '## Contract',
    `- Invalid entrance affinities: ${report.contract.invalidEntranceAffinity.length}`,
    `- Invalid exit affinities: ${report.contract.invalidExitAffinity.length}`,
    `- Invalid vocal family affinities: ${report.contract.invalidVocalFamilyAffinity.length}`,
    `- Copy budget violations: ${report.contract.copyBudgetViolations.length}`,
    '',
    '## Device Mirror',
    ...report.deviceMirror.required.map(
      (item) => `- Required ${item.label}: ${item.wired ? 'wired' : 'missing'}`,
    ),
    ...report.deviceMirror.optional.map(
      (item) => `- Optional ${item.label}: ${item.wired ? 'wired' : 'missing'}`,
    ),
    '',
    '## Build Failures',
    `- Baseline failures: ${report.build.baselineFailures.length}`,
    `- Matrix failures: ${report.build.matrixFailures.length}`,
    '',
    '## Notes',
    ...report.notes.map((note) => `- ${note}`),
    '',
  ].join('\n');

  await mkdir(reportsDir, { recursive: true });
  await writeFile(`${reportBase}.json`, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await writeFile(`${reportBase}.md`, `${md}\n`, 'utf8');

  console.log(md);

  if (report.status === 'fail') {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[player:readiness] failed:', error);
  process.exit(1);
});
