/**
 * COMPOSITION ENGINE
 * ==================
 * The runtime assembler that builds a full NaviCueComposition from
 * workspace selection state. This is the bridge between the design
 * workspaces (manual dial-turning) and the production delivery
 * pipeline (Supabase + LLM-generated NaviCues).
 *
 * ARCHITECTURAL ROLE (Layer Stack):
 *   - Workspaces produce selection state (which entrance, which voice, etc.)
 *   - This engine resolves those selections into a typed NaviCueComposition
 *   - The player/renderer consumes the composition to drive playback
 *
 * RULE: This module imports from navicue-types (bedrock) and navicue-data
 *       (data layer). It does NOT import from React components or workspace UI.
 */

import type {
  NaviCueComposition,
  DiagnosticCore,
  LivingAtmosphere,
  PulseMotion,
  Persona,
  TemporalBookends,
  HeroPhysics,
  AtomicVoicePayload,
  VisualEngineParams,
  ResponseProfileId,
  BreathPatternId,
  MotionCurveId,
  VoiceLaneId,
  MaterializationId,
  EntranceArchitectureId,
  ExitTransitionId,
  GestureId,
  SchemaTarget,
  HeatBand,
  ChronoContext,
  VocalFamilyId,
  ColorSignatureId,
  VisualEngineId,
  NarrativePayload,
  NarrativeDensity,
} from '@/navicue-types';

import {
  RESOLUTION_MATRIX,
} from '@/navicue-types';

import {
  ENTRANCE_COPY,
  EXIT_COPY,
  GESTURE_COPY,
  VOCAL_FAMILIES,
} from '@/navicue-data';

import { getAtomicVoiceCopy } from '@/app/pages/voice/atomic-voice-copy';
import { getNarrativeCopy } from '@/app/pages/voice/narrative-copy';
import type { AtomId } from '@/app/components/atoms/types';

// =====================================================================
// COMPOSITION INPUT — what the workspace/backend provides
// =====================================================================

/**
 * The inputs needed to build a composition. Every field is explicit —
 * no magic defaults, no hidden inference.
 */
export interface CompositionInput {
  // ── Layer 1: Diagnostic Core ────────────────────────────────
  schemaTarget: SchemaTarget;
  heatBand: HeatBand;
  chronoContext: ChronoContext;

  // ── Layer 2: Living Atmosphere ──────────────────────────────
  colorSignature: ColorSignatureId;
  visualEngine: VisualEngineId;
  engineParams: VisualEngineParams;
  responseProfile: ResponseProfileId;

  // ── Layer 3: Pulse & Motion ────────────────────────────────
  breathPattern: BreathPatternId;
  arrivalCurve: MotionCurveId;
  departureCurve: MotionCurveId;

  // ── Layer 4: Persona ───────────────────────────────────────
  voiceLane: VoiceLaneId;
  entranceMaterialization: MaterializationId;
  exitMaterialization: MaterializationId;

  // ── Layer 5: Temporal Bookends ─────────────────────────────
  entrance: EntranceArchitectureId;
  exit: ExitTransitionId;

  // ── Layer 6: Hero Physics ──────────────────────────────────
  atomId: AtomId;
  primaryGesture: GestureId;
  useResolutionMatrix: boolean;

  // ── Layer 7: Atomic Voice (provided by LLM or workspace) ──
  /** If provided, uses this payload. If omitted, derives from atomic-voice-copy. */
  atomicVoice?: AtomicVoicePayload;

  // ── Layer 7b: Narrative (Breathing HUD) ────────────────────
  /** Override narrative density. Defaults to 'core'. */
  narrativeDensity?: NarrativeDensity;
}

// =====================================================================
// BUILD COMPOSITION
// =====================================================================

let compositionCounter = 0;

/**
 * Assembles a full NaviCueComposition from explicit inputs.
 * This is the canonical factory — all NaviCues pass through here.
 */
export function buildComposition(input: CompositionInput): NaviCueComposition {
  compositionCounter++;
  const id = `nc-${Date.now()}-${compositionCounter}`;

  // ── Layer 1 ──
  const diagnosticCore: DiagnosticCore = {
    schemaTarget: input.schemaTarget,
    heatBand: input.heatBand,
    chronoContext: input.chronoContext,
  };

  // ── Layer 2 ──
  const livingAtmosphere: LivingAtmosphere = {
    colorSignature: input.colorSignature,
    visualEngine: input.useResolutionMatrix
      ? RESOLUTION_MATRIX[input.primaryGesture]
      : input.visualEngine,
    engineParams: input.engineParams,
    responseProfile: input.responseProfile,
  };

  // ── Layer 3 ──
  const pulseMotion: PulseMotion = {
    breathPattern: input.breathPattern,
    arrivalCurve: input.arrivalCurve,
    departureCurve: input.departureCurve,
  };

  // ── Layer 4 ──
  const persona: Persona = {
    voiceLane: input.voiceLane,
    entranceMaterialization: input.entranceMaterialization,
    exitMaterialization: input.exitMaterialization,
  };

  // ── Layer 5 ──
  const temporalBookends: TemporalBookends = {
    entrance: input.entrance,
    exit: input.exit,
  };

  // ── Layer 6 ──
  const heroPhysics: HeroPhysics = {
    atomId: input.atomId,
    primaryGesture: input.primaryGesture,
    useResolutionMatrix: input.useResolutionMatrix,
  };

  // ── Layer 7 ──
  const atomicVoice: AtomicVoicePayload = input.atomicVoice
    ?? deriveAtomicVoice(input.atomId, input.voiceLane);

  // ── Bookend copy (resolved from static library) ──
  const entranceCopyData = ENTRANCE_COPY[input.entrance]?.[input.voiceLane];
  const exitReceipt = EXIT_COPY[input.exit]?.[input.voiceLane] ?? '';
  const gestureLabel = GESTURE_COPY[input.primaryGesture]?.[input.voiceLane] ?? '';

  // ── Layer 7b: Narrative Payload (Breathing HUD) ──
  const narrative = getNarrativeCopy(
    input.atomId,
    input.voiceLane,
    input.entrance,
    input.primaryGesture,
    input.narrativeDensity ?? 'core', // default density — override via future composition input
  );

  return {
    id,
    diagnosticCore,
    livingAtmosphere,
    pulseMotion,
    persona,
    temporalBookends,
    heroPhysics,
    atomicVoice,
    entranceCopy: {
      text: entranceCopyData?.text ?? '',
      followText: entranceCopyData?.followText,
    },
    gestureLabel,
    exitReceipt,
    narrative,
  };
}

// =====================================================================
// BUILD FROM VOCAL FAMILY — convenience shorthand
// =====================================================================

/**
 * Creates a CompositionInput pre-filled from a Vocal Family preset.
 * The caller can then override any field before passing to buildComposition().
 */
export function inputFromVocalFamily(
  familyId: VocalFamilyId,
  atomId: AtomId,
  overrides?: Partial<CompositionInput>,
): CompositionInput {
  const family = VOCAL_FAMILIES[familyId];

  // Default engine params (Gentle Current atmosphere)
  const defaultParams: VisualEngineParams = {
    density: 0.5,
    speed: 0.35,
    complexity: 0.5,
    reactivity: 0.5,
    depth: 0.5,
  };

  const base: CompositionInput = {
    // Layer 1 — defaults (would come from clinical AI in production)
    schemaTarget: family.schemas[0] ?? 'abandonment',
    heatBand: family.heatRange[0],
    chronoContext: 'work',

    // Layer 2
    colorSignature: family.colorSignature,
    visualEngine: family.visualEngine,
    engineParams: defaultParams,
    responseProfile: 'resonance',

    // Layer 3
    breathPattern: family.breathPattern,
    arrivalCurve: 'arrival',
    departureCurve: 'departure',

    // Layer 4
    voiceLane: family.voiceAnchor,
    entranceMaterialization: 'emerge',
    exitMaterialization: 'dissolve',

    // Layer 5
    entrance: family.entrance,
    exit: family.exit,

    // Layer 6
    atomId,
    primaryGesture: family.gesture,
    useResolutionMatrix: false,
  };

  return { ...base, ...overrides };
}

// =====================================================================
// INTERNAL HELPERS
// =====================================================================

/**
 * Maps the flat AtomicVoiceCopy (string-based, from the copy derivation system)
 * into the structured AtomicVoicePayload (typed sub-objects, from navicue-types).
 *
 * AtomicVoiceCopy has flat strings; AtomicVoicePayload has typed sub-interfaces
 * (AnchorPrompt.text, KineticPayload.text, ReactiveFriction.states, etc.)
 */
function deriveAtomicVoice(atomId: AtomId, voiceLane: VoiceLaneId): AtomicVoicePayload {
  const copy = getAtomicVoiceCopy(atomId, voiceLane);

  const payload: AtomicVoicePayload = {
    anchorPrompt: { text: copy.anchorPrompt },
    kineticPayload: { text: copy.kineticPayload },
    ambientSubtext: { text: copy.ambientSubtext },
    metacognitiveTag: { text: copy.metacognitiveTag },
    thresholdShift: { before: copy.thresholdShift.before, after: copy.thresholdShift.after },
  };

  // Map midInteraction → reactiveFriction or progressiveSequence
  if (copy.midInteraction.type === 'friction') {
    payload.reactiveFriction = {
      states: {
        start: copy.midInteraction.start,
        mid: copy.midInteraction.mid,
        max: copy.midInteraction.max,
      },
    };
  } else if (copy.midInteraction.type === 'sequence') {
    payload.progressiveSequence = { steps: copy.midInteraction.steps };
  }

  // Shadow node is optional
  if (copy.shadowNode) {
    payload.shadowNode = { text: copy.shadowNode };
  }

  return payload;
}