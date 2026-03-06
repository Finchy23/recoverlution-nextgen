import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces, withAlpha } from '@/design-tokens';
import {
  layout,
  atomsLayout,
  sectionAccents,
  workspaceSectionAccents,
} from '../design-center/dc-tokens';
import { useDeviceMirror, DeviceMirror } from '../design-center/components/DeviceMirror';
import { useBreathEngine } from '../design-center/hooks/useBreathEngine';
import type { BreathPattern } from '../design-center/hooks/useBreathEngine';

// ── NaviCue data ────────────────────────────────────────────
import {
  VOICE_LANES,
  VOICE_LANE_IDS,
  GESTURE_COPY,
  ENTRANCE_COPY,
  ENTRANCE_IDS,
  ENTRANCES,
  EXIT_COPY,
  EXIT_IDS,
  EXITS,
  COLOR_SIGNATURES,
  COLOR_SIGNATURE_IDS,
} from '@/navicue-data';

import { getAtomicVoiceCopy } from './atomic-voice-copy';
import { getNarrativeCopy } from './narrative-copy';
import { BreathingHUD } from '@/app/components/BreathingHUD';

import type {
  VoiceLaneId,
  GestureId,
  EntranceArchitectureId,
  ExitTransitionId,
  ColorSignatureId,
  NarrativeDensity,
  PlayerPhase,
} from '@/navicue-types';



// ── Atom system ─────────────────────────────────────────────
import type { AtomId, AtomProps, AtomPhase } from '@/app/components/atoms/types';
import {
  ATOM_CATALOG,
  ATOM_IDS,
  ATOM_COMPONENTS,
  SERIES_CATALOG,
} from '@/app/components/atoms';

// =====================================================================
// SECTION ACCENTS — imported from centralized dc-tokens
// =====================================================================

const SECTION_ACCENTS = workspaceSectionAccents.voice;

// =====================================================================
// ENTRANCE / EXIT ANIMATION CONFIGS
// =====================================================================
// Each entrance architecture maps to a visual choreography.
// Phase steps are timed proportionally within the entrance's durationMs.

interface EntranceVisual {
  /** Opacity easing for the entrance copy */
  copyIn: (t: number) => number;
  /** Opacity easing for the atom itself */
  atomIn: (t: number) => number;
  /** Y-offset for copy (translateY) in px */
  copyY: (t: number) => number;
  /** Blur amount for copy */
  copyBlur: (t: number) => number;
  /** Atmosphere intensity */
  atmoIn: (t: number) => number;
  /** Flash / brightness boost */
  flash: (t: number) => number;
}

const ENTRANCE_VISUALS: Record<EntranceArchitectureId, EntranceVisual> = {
  'the-silence': {
    // void → signal → void → reveal: text appears and disappears, then everything reveals
    copyIn:  (t) => t < 0.15 ? 0 : t < 0.35 ? smoothstep(0.15, 0.35, t) : t < 0.55 ? 1 - smoothstep(0.35, 0.55, t) : t > 0.75 ? smoothstep(0.75, 1, t) : 0,
    atomIn:  (t) => t < 0.7 ? 0 : smoothstep(0.7, 1, t),
    copyY:   (t) => t < 0.75 ? 0 : 0,
    copyBlur:(t) => 0,
    atmoIn:  (t) => t < 0.6 ? 0 : smoothstep(0.6, 1, t),
    flash:   () => 0,
  },
  'the-breath-gate': {
    // atmosphere → signal → reveal: gentle build, copy breathes in
    copyIn:  (t) => t < 0.3 ? 0 : smoothstep(0.3, 0.6, t),
    atomIn:  (t) => t < 0.55 ? 0 : smoothstep(0.55, 1, t),
    copyY:   (t) => t < 0.3 ? 8 : 8 * (1 - smoothstep(0.3, 0.7, t)),
    copyBlur:(t) => 0,
    atmoIn:  (t) => smoothstep(0, 0.4, t),
    flash:   () => 0,
  },
  'the-dissolution': {
    // signal(blur) → reveal(defrost): text starts blurred, sharpens as atom appears
    copyIn:  (t) => smoothstep(0, 0.3, t),
    atomIn:  (t) => t < 0.4 ? 0 : smoothstep(0.4, 1, t),
    copyY:   () => 0,
    copyBlur:(t) => Math.max(0, 12 * (1 - smoothstep(0, 0.8, t))),
    atmoIn:  (t) => smoothstep(0, 0.5, t) * 0.6,
    flash:   () => 0,
  },
  'the-scene-build': {
    // void → atmosphere → signal → reveal: deliberate layered construction
    copyIn:  (t) => t < 0.35 ? 0 : smoothstep(0.35, 0.65, t),
    atomIn:  (t) => t < 0.6 ? 0 : smoothstep(0.6, 1, t),
    copyY:   (t) => t < 0.35 ? 12 : 12 * (1 - smoothstep(0.35, 0.7, t)),
    copyBlur:(t) => 0,
    atmoIn:  (t) => t < 0.15 ? 0 : smoothstep(0.15, 0.45, t),
    flash:   () => 0,
  },
  'the-emergence': {
    // atmosphere → signal → reveal: truth rises from below
    copyIn:  (t) => t < 0.2 ? 0 : smoothstep(0.2, 0.55, t),
    atomIn:  (t) => t < 0.45 ? 0 : smoothstep(0.45, 1, t),
    copyY:   (t) => t < 0.2 ? 30 : 30 * (1 - smoothstep(0.2, 0.6, t)),
    copyBlur:(t) => 0,
    atmoIn:  (t) => smoothstep(0, 0.3, t),
    flash:   () => 0,
  },
  'the-gathering': {
    // atmosphere → converge → reveal: fragments gather inward
    copyIn:  (t) => t < 0.25 ? 0 : smoothstep(0.25, 0.6, t),
    atomIn:  (t) => t < 0.5 ? 0 : smoothstep(0.5, 1, t),
    copyY:   () => 0,
    copyBlur:(t) => t < 0.25 ? 4 : 4 * (1 - smoothstep(0.25, 0.55, t)),
    atmoIn:  (t) => smoothstep(0, 0.35, t),
    flash:   () => 0,
  },
  'the-threshold': {
    // atmosphere → signal → interaction → reveal: waits for user
    copyIn:  (t) => t < 0.15 ? 0 : smoothstep(0.15, 0.4, t),
    atomIn:  (t) => t < 0.65 ? 0 : smoothstep(0.65, 1, t),
    copyY:   () => 0,
    copyBlur:(t) => 0,
    atmoIn:  (t) => smoothstep(0, 0.25, t),
    flash:   () => 0,
  },
  'cold-arrival': {
    // instant: everything at once, hard
    copyIn:  (t) => t < 0.05 ? 0 : 1,
    atomIn:  (t) => t < 0.05 ? 0 : 1,
    copyY:   () => 0,
    copyBlur:(t) => 0,
    atmoIn:  (t) => t < 0.05 ? 0 : 0.8,
    flash:   (t) => t < 0.1 ? smoothstep(0, 0.05, t) * 0.3 : 0.3 * (1 - smoothstep(0.1, 0.4, t)),
  },
};

interface ExitVisual {
  /** Atom opacity during exit */
  atomOut: (t: number) => number;
  /** Exit copy opacity */
  copyIn: (t: number) => number;
  /** Voice copy fade out */
  voiceOut: (t: number) => number;
  /** Y-offset for exit copy */
  copyY: (t: number) => number;
  /** Brightness/flash */
  flash: (t: number) => number;
  /** Screen overlay opacity (for void/white final states) */
  overlayOpacity: (t: number) => number;
  /** Overlay color */
  overlayColor: string;
}

const EXIT_VISUALS: Record<ExitTransitionId, ExitVisual> = {
  dissolve: {
    // Slow fade to void. Relief and letting go.
    atomOut:       (t) => 1 - smoothstep(0, 0.7, t),
    copyIn:        (t) => t < 0.15 ? smoothstep(0, 0.15, t) : t < 0.7 ? 1 : 1 - smoothstep(0.7, 1, t),
    voiceOut:      (t) => 1 - smoothstep(0, 0.4, t),
    copyY:         () => 0,
    flash:         () => 0,
    overlayOpacity:(t) => smoothstep(0.5, 1, t) * 0.8,
    overlayColor:  colors.neutral.black,
  },
  'burn-in': {
    // Flash bright → lock. Hard truth sealed.
    atomOut:       (t) => t < 0.3 ? 1 : 1 - smoothstep(0.3, 0.8, t),
    copyIn:        (t) => t < 0.1 ? smoothstep(0, 0.1, t) : 1,
    voiceOut:      (t) => t < 0.15 ? 1 : 1 - smoothstep(0.15, 0.5, t),
    copyY:         () => 0,
    flash:         (t) => t < 0.15 ? smoothstep(0, 0.15, t) * 0.5 : 0.5 * (1 - smoothstep(0.15, 0.6, t)),
    overlayOpacity:(t) => t < 0.15 ? smoothstep(0, 0.15, t) * 0.35 : smoothstep(0.4, 1, t) * 0.6,
    overlayColor:  colors.neutral.white,
  },
  emerge: {
    // Elements lift softly. Hope rises.
    atomOut:       (t) => 1 - smoothstep(0.1, 0.7, t),
    copyIn:        (t) => t < 0.1 ? smoothstep(0, 0.1, t) : t < 0.65 ? 1 : 1 - smoothstep(0.65, 1, t),
    voiceOut:      (t) => 1 - smoothstep(0, 0.35, t),
    copyY:         (t) => -30 * smoothstep(0.3, 1, t),
    flash:         () => 0,
    overlayOpacity:(t) => smoothstep(0.6, 1, t) * 0.5,
    overlayColor:  colors.neutral.black,
  },
  immediate: {
    // Snap cut. Pattern disruption.
    atomOut:       (t) => t < 0.1 ? 1 : 0,
    copyIn:        (t) => t < 0.1 ? 0 : 1,
    voiceOut:      (t) => t < 0.05 ? 1 : 0,
    copyY:         () => 0,
    flash:         () => 0,
    overlayOpacity:() => 0,
    overlayColor:  colors.neutral.black,
  },
};

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// =====================================================================
// COMPOSITION STATE
// =====================================================================

const GESTURE_IDS: GestureId[] = ['tap', 'hold', 'drag', 'swipe', 'pinch', 'breathe'];

type SequencePhase = 'idle' | 'entrance' | 'active' | 'exit' | 'complete';

interface VoiceCompositionState {
  voiceLane: VoiceLaneId;
  gestureId: GestureId;
  entranceId: EntranceArchitectureId;
  exitId: ExitTransitionId;
  colorSignature: ColorSignatureId;
  breathPattern: BreathPattern;
  activeVariable: 'anchor' | 'kinetic' | 'friction' | 'ambient' | 'metacognitive' | 'progressive' | 'shadow' | 'threshold';
  atomId: AtomId;
  narrativeDensity: NarrativeDensity;
  hudMode: 'breathing-hud' | 'raw-copy';
}

const BUILT_ATOM_IDS = ATOM_IDS.filter(id => ATOM_COMPONENTS[id] != null);

const INITIAL_STATE: VoiceCompositionState = {
  voiceLane: 'coach',
  gestureId: 'tap',
  entranceId: 'the-scene-build',
  exitId: 'dissolve',
  colorSignature: 'quiet-authority',
  breathPattern: 'calm',
  activeVariable: 'anchor',
  atomId: BUILT_ATOM_IDS[0] ?? 'centrifuge-engine',
  narrativeDensity: 'full' as NarrativeDensity,
  hudMode: 'breathing-hud' as const,
};

const BREATH_PATTERNS: { id: BreathPattern; label: string }[] = [
  { id: 'calm', label: 'Calm' },
  { id: 'simple', label: 'Simple' },
  { id: 'energize', label: 'Energize' },
  { id: 'box', label: 'Box' },
];

// =====================================================================
// ATOM COPY PROFILE — imported from shared module
// =====================================================================

import {
  getAtomCopyProfile,
  zoneToTop,
  weightOpacity,
} from '@/app/data/atom-copy-profile';
import type { CopyZone, CopyWeight, CtaMode, AtomCopyProfile } from '@/app/data/atom-copy-profile';

type VoiceVariableId = VoiceCompositionState['activeVariable'];
const VOICE_VARIABLE_IDS: VoiceVariableId[] = [
  'anchor', 'kinetic', 'friction', 'ambient', 'metacognitive', 'progressive', 'shadow', 'threshold',
];
const VOICE_VARIABLE_LABELS: Record<VoiceVariableId, string> = {
  anchor: 'Anchor Prompt',
  kinetic: 'Kinetic Payload',
  friction: 'Reactive Friction',
  ambient: 'Ambient Subtext',
  metacognitive: 'Metacognitive Tag',
  progressive: 'Progressive Sequence',
  shadow: 'Shadow Node',
  threshold: 'Threshold Shift',
};

// =====================================================================
// SEQUENCE ENGINE
// =====================================================================

function useSequence(entranceId: EntranceArchitectureId, exitId: ExitTransitionId) {
  const [phase, setPhase] = useState<SequencePhase>('idle');
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const rafRef = useRef<number>();
  const startRef = useRef(0);

  const entranceDuration = useMemo(() => {
    const spec = ENTRANCES[entranceId];
    // Use spec duration, but cap minimum for user-driven or instant (preview mode)
    return Math.max(spec.durationMs, spec.durationMs === 0 ? 600 : spec.durationMs);
  }, [entranceId]);

  const exitDuration = useMemo(() => {
    const spec = EXITS[exitId];
    return Math.max(spec.durationMs, spec.durationMs === 0 ? 400 : spec.durationMs);
  }, [exitId]);

  const animatePhase = useCallback((duration: number, nextPhase: SequencePhase) => {
    startRef.current = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setPhase(nextPhase);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const play = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase('entrance');
    setProgress(0);
    animatePhase(entranceDuration, 'active');
  }, [entranceDuration, animatePhase]);

  const triggerExit = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase('exit');
    setProgress(0);
    animatePhase(exitDuration, 'complete');
  }, [exitDuration, animatePhase]);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase('idle');
    setProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { phase, progress, play, triggerExit, reset, entranceDuration, exitDuration };
}

// =====================================================================
// SEQUENCE → PLAYER PHASE MAPPING
// =====================================================================

function mapSequenceToPlayerPhase(sp: SequencePhase): PlayerPhase {
  switch (sp) {
    case 'idle': return 'loading';
    case 'entrance': return 'entering';
    case 'active': return 'active';
    case 'exit': return 'resolving';
    case 'complete': return 'receipt';
    default: return 'loading';
  }
}

// =====================================================================
// NAVICUE SCENE — the phone screen content
// =====================================================================

function NaviCueScene({
  state,
  breathAmplitude,
  sequencePhase,
  sequenceProgress,
  onResolve,
}: {
  state: VoiceCompositionState;
  breathAmplitude: number;
  sequencePhase: SequencePhase;
  sequenceProgress: number;
  onResolve: () => void;
}) {
  const colorSig = COLOR_SIGNATURES[state.colorSignature];
  const atomicVoice = getAtomicVoiceCopy(state.atomId, state.voiceLane);
  const entranceCopyData = ENTRANCE_COPY[state.entranceId]?.[state.voiceLane];
  const exitCopy = EXIT_COPY[state.exitId]?.[state.voiceLane] ?? '';
  const gestureCopy = GESTURE_COPY[state.gestureId]?.[state.voiceLane] ?? '';
  const lane = VOICE_LANES[state.voiceLane];

  const AtomComponent = ATOM_COMPONENTS[state.atomId];
  const atomMeta = ATOM_CATALOG[state.atomId];
  const viewport = { width: 260, height: 530 };
  const copyProfile = useMemo(() => getAtomCopyProfile(state.atomId), [state.atomId]);

  // Resolve entrance/exit visual configs
  const entranceVis = ENTRANCE_VISUALS[state.entranceId];
  const exitVis = EXIT_VISUALS[state.exitId];

  // ── Compute visual values per phase ──
  const t = sequenceProgress;

  // Entrance-phase values
  const eCopyOpacity = sequencePhase === 'entrance' ? entranceVis.copyIn(t) : 0;
  const eAtomOpacity = sequencePhase === 'entrance' ? entranceVis.atomIn(t) : 0;
  const eCopyY       = sequencePhase === 'entrance' ? entranceVis.copyY(t) : 0;
  const eCopyBlur    = sequencePhase === 'entrance' ? entranceVis.copyBlur(t) : 0;
  const eAtmoIntensity = sequencePhase === 'entrance' ? entranceVis.atmoIn(t) : 0;
  const eFlash       = sequencePhase === 'entrance' ? entranceVis.flash(t) : 0;

  // Exit-phase values
  const xAtomOpacity  = sequencePhase === 'exit' ? exitVis.atomOut(t) : 0;
  const xCopyOpacity  = sequencePhase === 'exit' ? exitVis.copyIn(t) : sequencePhase === 'complete' ? 1 : 0;
  const xVoiceOut     = sequencePhase === 'exit' ? exitVis.voiceOut(t) : 0;
  const xCopyY        = sequencePhase === 'exit' ? exitVis.copyY(t) : sequencePhase === 'complete' ? (state.exitId === 'emerge' ? -30 : 0) : 0;
  const xFlash        = sequencePhase === 'exit' ? exitVis.flash(t) : 0;
  const xOverlay      = sequencePhase === 'exit' ? exitVis.overlayOpacity(t) : sequencePhase === 'complete' ? 0.6 : 0;

  // Active-phase: everything at full
  const activeAtomOpacity = sequencePhase === 'active' ? 1 : 0;
  const activeVoiceOpacity = sequencePhase === 'active' ? 1 : 0;

  // Combined values
  const atomOpacity = sequencePhase === 'entrance' ? eAtomOpacity
    : sequencePhase === 'active' ? activeAtomOpacity
    : sequencePhase === 'exit' ? xAtomOpacity
    : 0;

  const voiceCopyOpacity = sequencePhase === 'entrance' ? eCopyOpacity * 0.6
    : sequencePhase === 'active' ? activeVoiceOpacity
    : sequencePhase === 'exit' ? xVoiceOut
    : 0;

  const atmosphereIntensity = sequencePhase === 'entrance' ? eAtmoIntensity
    : sequencePhase === 'active' || sequencePhase === 'exit' ? 1
    : sequencePhase === 'idle' ? 0.2
    : 0.3;

  const atomPhase: AtomPhase = sequencePhase === 'entrance' ? 'enter'
    : sequencePhase === 'exit' || sequencePhase === 'complete' ? 'resolve'
    : 'active';

  // ── Track time in active phase for resolve indicator ──
  const [activeElapsed, setActiveElapsed] = useState(0);
  const activeStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (sequencePhase === 'active') {
      activeStartRef.current = Date.now();
      const tick = () => {
        if (activeStartRef.current) {
          setActiveElapsed(Date.now() - activeStartRef.current);
        }
        rafId = requestAnimationFrame(tick);
      };
      let rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    } else {
      activeStartRef.current = null;
      setActiveElapsed(0);
    }
  }, [sequencePhase]);

  const showResolveIndicator = sequencePhase === 'active' && activeElapsed > 3000;

  // ── BreathingHUD integration ──────────────────────────────────
  const playerPhase = mapSequenceToPlayerPhase(sequencePhase);
  const hudNarrative = useMemo(
    () => getNarrativeCopy(state.atomId, state.voiceLane, state.entranceId, state.gestureId, state.narrativeDensity),
    [state.atomId, state.voiceLane, state.entranceId, state.gestureId, state.narrativeDensity],
  );

  // Simulate interaction: auto-trigger after 2s active for preview
  const hudInteractionStarted = sequencePhase === 'active' && activeElapsed > 2000;
  // Simulate resolution: when exit triggers
  const hudResolved = sequencePhase === 'exit' || sequencePhase === 'complete';
  // Approximate breath cycle count from elapsed time (1 cycle ≈ 4s)
  const hudBreathCycles = sequencePhase === 'active' ? Math.floor(activeElapsed / 4000) : 0;
  // Phase elapsed approximation
  const hudPhaseElapsed = sequencePhase === 'active' ? activeElapsed : 0;
  // Atmosphere settled: 800ms into entrance or anytime active+
  const hudAtmosphereSettled = (sequencePhase === 'entrance' && sequenceProgress > 0.3) ||
    sequencePhase === 'active' || sequencePhase === 'exit' || sequencePhase === 'complete';

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: surfaces.solid.base,
    }}>
      {/* ── Atmosphere gradient ─────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, ${colorSig.surface} 0%, rgba(0,0,0,0) 70%)`,
        opacity: atmosphereIntensity * (0.5 + breathAmplitude * 0.3),
        transition: 'opacity 0.6s ease',
      }} />

      {/* ── Flash overlay (entrance/exit) ──── */}
      {(eFlash > 0 || xFlash > 0) && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 15,
          background: state.exitId === 'burn-in' && sequencePhase === 'exit'
            ? colors.neutral.white : colorSig.primary,
          opacity: eFlash + xFlash,
          pointerEvents: 'none',
        }} />
      )}

      {/* ── Exit overlay (void/white) ──────── */}
      {xOverlay > 0 && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 14,
          background: exitVis.overlayColor,
          opacity: xOverlay,
          pointerEvents: 'none',
        }} />
      )}

      {/* ══════════════════════════════════════
          IDLE STATE
          ══════════════════════════════════════ */}
      {sequencePhase === 'idle' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 32, gap: 12, zIndex: 5,
        }}>
          <div style={{
            fontFamily: fonts.secondary, fontSize: 13,
            color: colorSig.primary, opacity: 0.3,
            textAlign: 'center', lineHeight: 1.5, maxWidth: 200,
          }}>
            {atomMeta.intent}
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <motion.div
              animate={{
                scale: 0.6 + breathAmplitude * 0.5,
                opacity: 0.12 + breathAmplitude * 0.2,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              style={{
                width: 18, height: 18, borderRadius: '50%',
                background: `radial-gradient(circle, ${colorSig.primary}, rgba(0,0,0,0))`,
              }}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          BREATHING HUD MODE
          ══════════════════════════════════════ */}
      {state.hudMode === 'breathing-hud' && sequencePhase !== 'idle' && (
        <BreathingHUD
          narrative={hudNarrative}
          voiceLane={state.voiceLane}
          playerPhase={playerPhase}
          phaseElapsed={hudPhaseElapsed}
          atmosphereSettled={hudAtmosphereSettled}
          textVisible={sequencePhase !== 'idle'}
          breathAmplitude={breathAmplitude}
          width={viewport.width}
          height={viewport.height}
          minDim={Math.min(viewport.width, viewport.height)}
          primaryColor={colorSig.primary}
          reducedMotion={false}
          interactionStarted={hudInteractionStarted}
          resolved={hudResolved}
          breathCycleCount={hudBreathCycles}
        />
      )}

      {/* ══════════════════════════════════════
          ENTRANCE COPY (raw-copy mode)
          ══════════════════════════════════════ */}
      {state.hudMode === 'raw-copy' && sequencePhase === 'entrance' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 32, gap: 10, zIndex: 8,
          opacity: eCopyOpacity,
          transform: `translateY(${eCopyY}px)`,
          filter: eCopyBlur > 0 ? `blur(${eCopyBlur}px)` : 'none',
          pointerEvents: 'none',
        }}>
          {entranceCopyData ? (
            <>
              <div style={{
                fontFamily: fonts.secondary, fontSize: 15,
                color: colorSig.primary, opacity: 0.7,
                textAlign: 'center', lineHeight: 1.5, maxWidth: 200,
              }}>
                {entranceCopyData.text}
              </div>
              {entranceCopyData.followText && (
                <div style={{
                  fontFamily: fonts.primary, fontSize: 12,
                  color: colorSig.primary, opacity: 0.35,
                  textAlign: 'center', marginTop: 4,
                }}>
                  {entranceCopyData.followText}
                </div>
              )}
            </>
          ) : (
            <div style={{
              fontFamily: fonts.secondary, fontSize: 14,
              color: colorSig.primary, opacity: 0.35,
              textAlign: 'center', fontStyle: 'italic',
            }}>
              {formatId(state.entranceId)}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          ATOM LAYER
          ══════════════════════════════════════ */}
      {(sequencePhase === 'entrance' || sequencePhase === 'active' || sequencePhase === 'exit') && AtomComponent && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 4,
          opacity: atomOpacity,
        }}>
          <AtomComponent
            breathAmplitude={breathAmplitude}
            reducedMotion={false}
            color={colorSig.primary}
            accentColor={colorSig.accent}
            viewport={viewport}
            phase={atomPhase}
            composed={true}
            onHaptic={() => {}}
            onResolve={onResolve}
          />
        </div>
      )}

      {/* ══════════════════════════════════════
          VOICE COPY OVERLAY (5 canonical slots, raw-copy mode)
          ══════════════════════════════════════ */}
      {state.hudMode === 'raw-copy' && (sequencePhase === 'active' || sequencePhase === 'entrance' || sequencePhase === 'exit') && atomicVoice && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          opacity: voiceCopyOpacity,
          pointerEvents: 'none',
        }}>
          {/* ── AMBIENT: peripheral whisper ── */}
          <div style={{
            position: 'absolute',
            bottom: copyProfile.anchorZone === 'extreme-edge' ? '10%' : '18%',
            left: '6%', right: '6%',
            fontFamily: fonts.secondary, fontSize: 11,
            color: colorSig.primary,
            opacity: state.activeVariable === 'ambient'
              ? weightOpacity(copyProfile.copyWeight, true) * 0.3
              : weightOpacity(copyProfile.copyWeight, false),
            filter: state.activeVariable === 'ambient' ? 'blur(2px)' : 'blur(8px)',
            textAlign: 'center', lineHeight: 1.4,
            letterSpacing: '0.02em',
            transition: 'opacity 0.8s ease, filter 0.8s ease',
          }}>
            {atomicVoice.ambientSubtext}
          </div>

          {/* ── METACOGNITIVE: HUD state label ── */}
          <div style={{
            position: 'absolute', top: 40, right: 14,
            fontFamily: fonts.mono, fontSize: 7,
            color: colors.neutral.white,
            opacity: state.activeVariable === 'metacognitive' ? 0.4 : 0.08,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            transition: 'opacity 0.5s ease',
            maxWidth: 100, textAlign: 'right',
          }}>
            {atomicVoice.metacognitiveTag}
          </div>

          {/* ── ANCHOR: guiding prompt — position adapts to atom scale ── */}
          <div style={{
            position: 'absolute',
            top: zoneToTop(copyProfile.anchorZone),
            left: '10%', right: '10%',
            fontFamily: fonts.secondary,
            fontSize: copyProfile.anchorMaxFont,
            color: colorSig.primary,
            opacity: state.activeVariable === 'anchor'
              ? weightOpacity(copyProfile.copyWeight, true)
              : weightOpacity(copyProfile.copyWeight, false) + 0.06,
            textAlign: 'center', lineHeight: 1.5,
            transition: 'opacity 0.5s ease',
            transform: copyProfile.breathModulatesCopy
              ? `scale(${1 + breathAmplitude * 0.025})`
              : `scale(${1 + breathAmplitude * 0.01})`,
          }}>
            {atomicVoice.anchorPrompt}
          </div>

          {/* ── KINETIC: the transformative payload ── */}
          <div style={{
            position: 'absolute',
            top: zoneToTop(copyProfile.kineticZone),
            left: '12%', right: '12%',
            fontFamily: fonts.primary,
            fontSize: copyProfile.kineticMaxFont,
            fontWeight: 700, letterSpacing: '0.06em',
            color: colorSig.primary,
            opacity: state.activeVariable === 'kinetic' || state.activeVariable === 'threshold'
              ? weightOpacity(copyProfile.copyWeight, true) + 0.1
              : weightOpacity(copyProfile.copyWeight, false),
            textAlign: 'center',
            transition: 'opacity 0.5s ease',
          }}>
            {state.activeVariable === 'threshold'
              ? atomicVoice.thresholdShift.after
              : atomicVoice.kineticPayload}
          </div>

          {/* ── MID: friction / progressive / shadow ── */}
          <div style={{
            position: 'absolute',
            top: copyProfile.copyWeight === 'whisper' ? '72%' : '68%',
            left: '10%', right: '10%',
            textAlign: 'center',
          }}>
            {atomicVoice.midInteraction.type === 'friction' && (
              <div style={{
                fontFamily: fonts.secondary, fontSize: 10,
                fontStyle: 'italic',
                color: colorSig.primary,
                opacity: state.activeVariable === 'friction'
                  ? weightOpacity(copyProfile.copyWeight, true) - 0.1
                  : weightOpacity(copyProfile.copyWeight, false) + 0.02,
                transition: 'opacity 0.5s ease',
              }}>
                {atomicVoice.midInteraction.start} / {atomicVoice.midInteraction.mid} / {atomicVoice.midInteraction.max}
              </div>
            )}
            {atomicVoice.midInteraction.type === 'sequence' && (
              <div style={{
                display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
                opacity: state.activeVariable === 'progressive'
                  ? weightOpacity(copyProfile.copyWeight, true)
                  : weightOpacity(copyProfile.copyWeight, false),
                transition: 'opacity 0.5s ease',
              }}>
                {atomicVoice.midInteraction.steps.map((step, i) => (
                  <span key={i} style={{
                    fontFamily: fonts.mono, fontSize: 8,
                    color: colorSig.primary,
                    opacity: 0.7,
                  }}>
                    {step}
                  </span>
                ))}
              </div>
            )}
            {atomicVoice.shadowNode && (
              <div style={{
                fontFamily: fonts.secondary, fontSize: 10,
                color: colorSig.primary,
                opacity: state.activeVariable === 'shadow' ? 0.25 : 0.02,
                marginTop: 8,
                transition: 'opacity 0.8s ease',
                filter: state.activeVariable === 'shadow' ? 'none' : 'blur(2px)',
              }}>
                {atomicVoice.shadowNode}
              </div>
            )}
          </div>

          {/* ── CTA: atmospheric gesture prompt — no borders, no pills ── */}
          <div style={{
            position: 'absolute', bottom: 55, left: 0, right: 0,
            display: 'flex', justifyContent: 'center',
          }}>
            <div style={{
              fontFamily: fonts.mono, fontSize: 8,
              color: colorSig.primary,
              opacity: copyProfile.ctaMode === 'in-atom' ? 0.1 : 0.18,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              transform: copyProfile.breathModulatesCopy
                ? `scale(${1 + breathAmplitude * 0.04})`
                : undefined,
              transition: 'opacity 0.6s ease',
            }}>
              {gestureCopy}
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════
          EXIT COPY (raw-copy mode)
          ══════════════════════════════════════ */}
      {state.hudMode === 'raw-copy' && (sequencePhase === 'exit' || sequencePhase === 'complete') && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 32, gap: 10, zIndex: 16,
          opacity: xCopyOpacity,
          transform: `translateY(${xCopyY}px)`,
          pointerEvents: 'none',
        }}>
          <div style={{
            fontFamily: fonts.secondary, fontSize: 15,
            color: sequencePhase === 'exit' && state.exitId === 'burn-in'
              ? colors.neutral.white : colorSig.primary,
            opacity: 0.7,
            textAlign: 'center', lineHeight: 1.5, maxWidth: 200,
          }}>
            {exitCopy}
          </div>
        </div>
      )}

      {/* ══════════════════════════════���═══════
          RESOLVE INDICATOR — appears after 3s active (both modes)
          ══════════════════════════════════════ */}
      {showResolveIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          style={{
            position: 'absolute', bottom: 28, left: 0, right: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 8, zIndex: 18,
          }}
        >
          <button
            onClick={onResolve}
            style={{
              border: 'none',
              background: 'rgba(0,0,0,0)',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              padding: '8px 20px',
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.15, 0.4, 0.15],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: `radial-gradient(circle, ${colorSig.primary}, rgba(0,0,0,0))`,
              }}
            />
            <motion.span
              animate={{ opacity: [0.12, 0.25, 0.12] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                fontFamily: fonts.mono, fontSize: 7,
                color: colorSig.primary,
                letterSpacing: '0.12em',
              }}
            >
              {copyProfile.ctaMode === 'in-atom' ? 'COMPLETE' : 'CONTINUE'}
            </motion.span>
          </button>
        </motion.div>
      )}

    </div>
  );
}

// =====================================================================
// VOICE CATALOG (Left Panel)
// =====================================================================

type CatalogSection = 'atoms' | 'lanes' | 'gestures' | 'entrances' | 'exits';

function VoiceCatalog({
  state,
  onSelectAtom,
  onSelectVoice,
  onSelectGesture,
  onSelectEntrance,
  onSelectExit,
}: {
  state: VoiceCompositionState;
  onSelectAtom: (id: AtomId) => void;
  onSelectVoice: (id: VoiceLaneId) => void;
  onSelectGesture: (id: GestureId) => void;
  onSelectEntrance: (id: EntranceArchitectureId) => void;
  onSelectExit: (id: ExitTransitionId) => void;
}) {
  const [expandedSection, setExpandedSection] = useState<CatalogSection>('atoms');

  const sections: { id: CatalogSection; label: string; count: number; color: string }[] = [
    { id: 'atoms', label: 'Atoms', count: BUILT_ATOM_IDS.length, color: SECTION_ACCENTS.atom },
    { id: 'lanes', label: 'Voice Lanes', count: 5, color: SECTION_ACCENTS.voice },
    { id: 'gestures', label: 'Gesture Copy', count: 6, color: SECTION_ACCENTS.gesture },
    { id: 'entrances', label: 'Entrances', count: ENTRANCE_IDS.length, color: SECTION_ACCENTS.entrance },
    { id: 'exits', label: 'Exits', count: EXIT_IDS.length, color: SECTION_ACCENTS.exit },
  ];

  const atomsBySeries = useMemo(() => {
    const map = new Map<string, AtomId[]>();
    for (const id of BUILT_ATOM_IDS) {
      const meta = ATOM_CATALOG[id];
      if (!map.has(meta.series)) map.set(meta.series, []);
      map.get(meta.series)!.push(id);
    }
    return map;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sections.map(section => {
          const isExpanded = expandedSection === section.id;
          return (
            <div key={section.id}>
              <button
                onClick={() => setExpandedSection(section.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: isExpanded ? withAlpha(section.color, 0.06) : 'rgba(0,0,0,0)',
                  textAlign: 'left', transition: 'background 0.3s',
                }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: section.color,
                  opacity: isExpanded ? 0.7 : 0.25,
                  flexShrink: 0, transition: 'opacity 0.3s',
                }} />
                <div style={{
                  flex: 1, fontFamily: fonts.primary, fontSize: 11,
                  color: isExpanded ? section.color : colors.neutral.white,
                  opacity: isExpanded ? 0.7 : 0.3,
                  transition: 'all 0.3s',
                }}>
                  {section.label}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '4px 0 8px 14px', display: 'flex', flexDirection: 'column', gap: 1 }}>

                      {/* ── Atoms ────────────── */}
                      {section.id === 'atoms' && Array.from(atomsBySeries.entries()).map(([seriesId, atoms]) => {
                        const seriesMeta = SERIES_CATALOG[seriesId as keyof typeof SERIES_CATALOG];
                        return (
                          <div key={seriesId} style={{ marginBottom: 4 }}>
                            <div style={{
                              fontFamily: fonts.mono, fontSize: 7,
                              color: withAlpha(section.color, 0.3),
                              letterSpacing: '0.06em', padding: '4px 8px 2px',
                              textTransform: 'uppercase',
                            }}>
                              {seriesMeta?.subtitle ?? seriesId}
                            </div>
                            {atoms.map(id => {
                              const meta = ATOM_CATALOG[id];
                              const isActive = state.atomId === id;
                              return (
                                <CatalogItem
                                  key={id}
                                  label={meta.name}
                                  prefix={`${meta.number}`}
                                  isActive={isActive}
                                  color={section.color}
                                  onClick={() => onSelectAtom(id)}
                                />
                              );
                            })}
                          </div>
                        );
                      })}

                      {/* ── Lanes ────────────── */}
                      {section.id === 'lanes' && VOICE_LANE_IDS.map(id => {
                        const lane = VOICE_LANES[id];
                        return (
                          <CatalogItem
                            key={id}
                            label={lane.name}
                            sublabel={lane.vibe}
                            isActive={state.voiceLane === id}
                            color={section.color}
                            onClick={() => onSelectVoice(id)}
                          />
                        );
                      })}

                      {/* ── Gestures ─────────── */}
                      {section.id === 'gestures' && GESTURE_IDS.map(id => (
                          <CatalogItem
                            key={id}
                            label={id}
                            isActive={state.gestureId === id}
                            color={section.color}
                            onClick={() => onSelectGesture(id)}
                          />
                      ))}

                      {/* ── Entrances ────────── */}
                      {section.id === 'entrances' && ENTRANCE_IDS.map(id => (
                          <CatalogItem
                            key={id}
                            label={formatId(id)}
                            isActive={state.entranceId === id}
                            color={section.color}
                            onClick={() => onSelectEntrance(id)}
                          />
                      ))}

                      {/* ── Exits ────────────── */}
                      {section.id === 'exits' && EXIT_IDS.map(id => (
                          <CatalogItem
                            key={id}
                            label={formatId(id)}
                            isActive={state.exitId === id}
                            color={section.color}
                            onClick={() => onSelectExit(id)}
                          />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// =====================================================================
// TYPE BROWSER (Right Panel)
// =====================================================================
// Shows the structural TYPES available in each copy category.
// Voice lane is independent — these are architectural choices.
// Each type is selectable and shows its structural properties.

type TypeBrowserSection = 'entrance' | 'hero' | 'exit' | 'cta' | 'narrative';

// ── Phase sequence pill colors ────────────────────────────
const PHASE_COLORS: Record<string, string> = {
  void: colors.neutral.white,
  atmosphere: colors.accent.cyan.primary,
  signal: colors.brand.purple.light,
  reveal: colors.accent.green.primary,
  interaction: sectionAccents.voice,
};

// ── Hero copy slot definitions ────────────────────────────
const HERO_SLOT_TYPES = [
  { id: 'anchor', name: 'Anchor Prompt', variableId: 'anchor' as VoiceVariableId, position: 'Top zone', constraint: 'Max 12 words, 65 chars', description: 'The guiding question. Frames the moment. Breathes with the user.', interactionType: 'static' as const },
  { id: 'kinetic', name: 'Kinetic Payload', variableId: 'kinetic' as VoiceVariableId, position: 'Hero center', constraint: 'Max 4 words, 30 chars', description: 'The transformative noun. The big truth. Bold, weighted typography.', interactionType: 'static' as const },
  { id: 'ambient', name: 'Ambient Subtext', variableId: 'ambient' as VoiceVariableId, position: 'Bottom periphery', constraint: 'Whisper-weight', description: 'The internal monologue. Nearly invisible. Felt more than read.', interactionType: 'static' as const },
  { id: 'metacognitive', name: 'Metacognitive Tag', variableId: 'metacognitive' as VoiceVariableId, position: 'HUD top-right', constraint: 'Max 4 words, 25 chars', description: 'State label. Clinical, mono. Tells the system what mode is active.', interactionType: 'static' as const },
  { id: 'mid-friction', name: 'Reactive Friction', variableId: 'friction' as VoiceVariableId, position: 'Mid zone', constraint: '3 states: start / mid / max', description: 'Copy that responds to interaction intensity. Escalates with touch.', interactionType: 'reactive' as const },
  { id: 'mid-sequence', name: 'Progressive Sequence', variableId: 'progressive' as VoiceVariableId, position: 'Mid zone', constraint: '3\u20134 step pills', description: 'Step-by-step reveal. Each stage unlocks the next word.', interactionType: 'reactive' as const },
  { id: 'shadow', name: 'Shadow Node', variableId: 'shadow' as VoiceVariableId, position: 'Below mid', constraint: 'Optional, deeply hidden', description: 'The deeper truth. Almost invisible. Only surfaces with sustained attention.', interactionType: 'static' as const },
  { id: 'threshold', name: 'Threshold Shift', variableId: 'threshold' as VoiceVariableId, position: 'Mid reveal', constraint: 'Before \u2192 After pair', description: 'The transformation arc. Two words that capture the entire journey.', interactionType: 'static' as const },
] as const;

// ── CTA type definitions ──────────────────────────────────
const CTA_TYPES = [
  { id: 'tap' as const, physics: 'Single point contact', feel: 'Immediate, decisive' },
  { id: 'hold' as const, physics: 'Sustained pressure', feel: 'Patient, grounding' },
  { id: 'drag' as const, physics: 'Continuous directional', feel: 'Deliberate, agency' },
  { id: 'swipe' as const, physics: 'Velocity + release', feel: 'Letting go, shedding' },
  { id: 'pinch' as const, physics: 'Two-point scale', feel: 'Examination, zoom' },
  { id: 'breathe' as const, physics: 'Mic/motion detection', feel: 'Somatic, embodied' },
  { id: 'ping' as const, physics: 'Rhythmic sequential tap', feel: 'Entrainment, sync' },
];

function VoiceControls({
  state,
  onChange,
  sequencePhase,
  onPlay,
  onExit,
  onReset,
}: {
  state: VoiceCompositionState;
  onChange: (s: VoiceCompositionState) => void;
  sequencePhase: SequencePhase;
  onPlay: () => void;
  onExit: () => void;
  onReset: () => void;
}) {
  const [expandedSection, setExpandedSection] = useState<TypeBrowserSection>('entrance');
  const copyProfile = useMemo(() => getAtomCopyProfile(state.atomId), [state.atomId]);
  const atomicVoice = useMemo(() => getAtomicVoiceCopy(state.atomId, state.voiceLane), [state.atomId, state.voiceLane]);
  const atomMeta = ATOM_CATALOG[state.atomId];

  const sections: { id: TypeBrowserSection; label: string; count: number; accent: string }[] = [
    { id: 'entrance', label: 'Entrance Types', count: ENTRANCE_IDS.length, accent: SECTION_ACCENTS.entrance },
    { id: 'hero', label: 'Hero Copy Slots', count: HERO_SLOT_TYPES.length, accent: SECTION_ACCENTS.atom },
    { id: 'exit', label: 'Exit Types', count: EXIT_IDS.length, accent: SECTION_ACCENTS.exit },
    { id: 'cta', label: 'CTA / Gesture Types', count: CTA_TYPES.length, accent: SECTION_ACCENTS.gesture },
    { id: 'narrative', label: 'Breathing HUD', count: 7, accent: SECTION_ACCENTS.voice },
  ];

  // Derive narrative payload for the current atom x voice lane x density
  const narrativePayload = useMemo(
    () => getNarrativeCopy(state.atomId, state.voiceLane, state.entranceId, state.gestureId, state.narrativeDensity),
    [state.atomId, state.voiceLane, state.entranceId, state.gestureId, state.narrativeDensity],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto', maxHeight: 'calc(100vh - 80px)' }}
    >
      {/* ── Playback ──────────────────────── */}
      <div>
        <div style={{ display: 'flex', gap: 6 }}>
          {sequencePhase === 'idle' || sequencePhase === 'complete' ? (
            <PlayButton label={'\u25B6 PLAY'} color={SECTION_ACCENTS.voice} onClick={onPlay} />
          ) : sequencePhase === 'active' ? (
            <PlayButton label={'\u25C6 EXIT'} color={SECTION_ACCENTS.exit} onClick={onExit} />
          ) : (
            <PlayButton label="..." color={withAlpha(colors.neutral.white, 0.1)} onClick={() => {}} disabled />
          )}
          <PlayButton label={'\u21BA RESET'} color={withAlpha(colors.neutral.white, 0.15)} onClick={onReset} />
        </div>
      </div>

      {/* ── Type Browser sections ─────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sections.map(section => {
          const isExpanded = expandedSection === section.id;
          return (
            <div key={section.id}>
              <button
                onClick={() => setExpandedSection(section.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: isExpanded ? withAlpha(section.accent, 0.06) : 'rgba(0,0,0,0)',
                  textAlign: 'left', transition: 'background 0.3s',
                }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: section.accent,
                  opacity: isExpanded ? 0.7 : 0.25,
                  flexShrink: 0, transition: 'opacity 0.3s',
                }} />
                <div style={{
                  flex: 1, fontFamily: fonts.primary, fontSize: 11,
                  color: isExpanded ? section.accent : colors.neutral.white,
                  opacity: isExpanded ? 0.7 : 0.3,
                  transition: 'all 0.3s',
                }}>
                  {section.label}
                </div>
                <div style={{
                  fontFamily: fonts.mono, fontSize: 8,
                  color: colors.neutral.white, opacity: 0.1,
                }}>
                  {section.count}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '6px 4px 10px 4px', display: 'flex', flexDirection: 'column', gap: 6 }}>

                      {/* ══ ENTRANCE TYPES ════════���═════════ */}
                      {section.id === 'entrance' && ENTRANCE_IDS.map(entId => {
                        const spec = ENTRANCES[entId];
                        const isActive = state.entranceId === entId;
                        const voiceCoverage = VOICE_LANE_IDS.filter(vl => ENTRANCE_COPY[entId]?.[vl]).length;
                        return (
                          <button
                            key={entId}
                            onClick={() => onChange({ ...state, entranceId: entId })}
                            style={{
                              padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                              background: isActive ? withAlpha(section.accent, 0.08) : withAlpha(colors.neutral.white, 0.015),
                              borderLeft: isActive ? `2px solid ${withAlpha(section.accent, 0.5)}` : '2px solid rgba(0,0,0,0)',
                              textAlign: 'left', transition: 'all 0.2s',
                              display: 'flex', flexDirection: 'column', gap: 6,
                            }}
                          >
                            {/* Name + duration */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{
                                fontFamily: fonts.primary, fontSize: 11,
                                color: isActive ? section.accent : colors.neutral.white,
                                opacity: isActive ? 0.8 : 0.4,
                              }}>
                                {formatId(entId)}
                              </div>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                {spec.requiresUserAction && (
                                  <span style={{
                                    fontFamily: fonts.mono, fontSize: 6,
                                    color: sectionAccents.voice, opacity: 0.5,
                                    padding: '1px 4px', borderRadius: 3,
                                    background: withAlpha(sectionAccents.voice, 0.08),
                                    letterSpacing: '0.04em',
                                  }}>USER</span>
                                )}
                                <span style={{
                                  fontFamily: fonts.mono, fontSize: 8,
                                  color: colors.neutral.white, opacity: 0.15,
                                }}>
                                  {spec.durationMs === 0 ? 'user' : `${(spec.durationMs / 1000).toFixed(1)}s`}
                                </span>
                              </div>
                            </div>

                            {/* Phase sequence pills */}
                            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                              {spec.phaseSequence.map((phase, i) => (
                                <div key={`${phase}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <span style={{
                                    fontFamily: fonts.mono, fontSize: 7,
                                    color: PHASE_COLORS[phase] ?? colors.neutral.white,
                                    opacity: isActive ? 0.7 : 0.3,
                                    padding: '1px 5px', borderRadius: 3,
                                    background: withAlpha(PHASE_COLORS[phase] ?? colors.neutral.white, isActive ? 0.1 : 0.03),
                                    letterSpacing: '0.04em',
                                  }}>
                                    {phase}
                                  </span>
                                  {i < spec.phaseSequence.length - 1 && (
                                    <span style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.08 }}>{'\u203A'}</span>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Vibe */}
                            <div style={{
                              fontFamily: fonts.secondary, fontSize: 9,
                              color: colors.neutral.white, opacity: isActive ? 0.35 : 0.15, lineHeight: 1.4,
                            }}>
                              {spec.vibe}
                            </div>

                            {/* Voice coverage */}
                            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              {VOICE_LANE_IDS.map(vl => {
                                const hasCopy = !!ENTRANCE_COPY[entId]?.[vl];
                                return (
                                  <div key={vl} title={`${VOICE_LANES[vl].name}: ${hasCopy ? 'has copy' : 'no copy'}`} style={{
                                    width: 12, height: 3, borderRadius: 1,
                                    background: hasCopy
                                      ? withAlpha(section.accent, isActive ? 0.5 : 0.2)
                                      : withAlpha(colors.neutral.white, 0.04),
                                    transition: 'background 0.3s',
                                  }} />
                                );
                              })}
                              <span style={{
                                fontFamily: fonts.mono, fontSize: 6,
                                color: colors.neutral.white, opacity: 0.1, marginLeft: 4,
                              }}>
                                {voiceCoverage}/5 voices
                              </span>
                            </div>
                          </button>
                        );
                      })}

                      {/* ══ HERO COPY SLOT TYPES ════════════ */}
                      {section.id === 'hero' && (<>
                        {/* ── Atom context header ── */}
                        <div style={{
                          padding: '6px 10px 8px', marginBottom: 4,
                          display: 'flex', flexDirection: 'column', gap: 4,
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 7,
                              color: section.accent, opacity: 0.5,
                              letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                            }}>
                              {atomMeta?.defaultScale ?? 'focus'} scale
                            </span>
                            <span style={{
                              fontFamily: fonts.mono, fontSize: 7,
                              color: copyProfile.ctaMode === 'in-atom' ? colors.accent.green.primary : sectionAccents.voice,
                              opacity: 0.5, letterSpacing: '0.04em',
                            }}>
                              {copyProfile.ctaMode === 'in-atom' ? 'self-resolving' : copyProfile.ctaMode}
                            </span>
                          </div>
                          <div style={{
                            fontFamily: fonts.secondary, fontSize: 8,
                            color: colors.neutral.white, opacity: 0.2, lineHeight: 1.4,
                          }}>
                            {copyProfile.spatialHint}
                          </div>
                        </div>

                        {/* ── Slot cards ── */}
                        {HERO_SLOT_TYPES.map(slot => {
                          const isActive = state.activeVariable === slot.variableId;
                          const slotAccent = slot.interactionType === 'reactive' ? sectionAccents.voice : section.accent;

                          // Extract live copy for this slot from atomicVoice
                          let liveCopy = '';
                          if (atomicVoice) {
                            switch (slot.variableId) {
                              case 'anchor': liveCopy = atomicVoice.anchorPrompt; break;
                              case 'kinetic': liveCopy = atomicVoice.kineticPayload; break;
                              case 'ambient': liveCopy = atomicVoice.ambientSubtext; break;
                              case 'metacognitive': liveCopy = atomicVoice.metacognitiveTag; break;
                              case 'friction':
                                liveCopy = atomicVoice.midInteraction.type === 'friction'
                                  ? `${atomicVoice.midInteraction.start} \u203A ${atomicVoice.midInteraction.mid} \u203A ${atomicVoice.midInteraction.max}`
                                  : '\u2014';
                                break;
                              case 'progressive':
                                liveCopy = atomicVoice.midInteraction.type === 'sequence'
                                  ? atomicVoice.midInteraction.steps.join(' \u203A ')
                                  : '\u2014';
                                break;
                              case 'shadow': liveCopy = atomicVoice.shadowNode ?? '\u2014'; break;
                              case 'threshold': liveCopy = `${atomicVoice.thresholdShift.before} \u2192 ${atomicVoice.thresholdShift.after}`; break;
                            }
                          }
                          const wordCount = liveCopy.split(/\s+/).filter(Boolean).length;
                          const charCount = liveCopy.length;

                          // Atom-aware budget for this slot
                          const budget = slot.variableId === 'anchor'
                            ? `${copyProfile.anchorWordBudget}w / ${copyProfile.anchorMaxFont}px`
                            : slot.variableId === 'kinetic'
                              ? `${copyProfile.kineticWordBudget}w / ${copyProfile.kineticMaxFont}px`
                              : slot.constraint;

                          return (
                            <button
                              key={slot.id}
                              onClick={() => onChange({ ...state, activeVariable: slot.variableId })}
                              style={{
                                padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                background: isActive ? withAlpha(section.accent, 0.08) : withAlpha(colors.neutral.white, 0.015),
                                borderLeft: isActive
                                  ? `2px solid ${withAlpha(slotAccent, 0.5)}`
                                  : `2px solid ${withAlpha(slotAccent, 0.1)}`,
                                textAlign: 'left' as const, transition: 'all 0.2s',
                                display: 'flex', flexDirection: 'column' as const, gap: 3,
                              }}
                            >
                              {/* Slot name + zone */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{
                                  fontFamily: fonts.primary, fontSize: 10,
                                  color: isActive ? section.accent : colors.neutral.white,
                                  opacity: isActive ? 0.8 : 0.4,
                                }}>
                                  {slot.name}
                                </div>
                                <span style={{
                                  fontFamily: fonts.mono, fontSize: 6,
                                  color: colors.neutral.white, opacity: 0.15,
                                  letterSpacing: '0.04em',
                                }}>
                                  {slot.position}
                                </span>
                              </div>

                              {/* Live copy preview */}
                              {liveCopy && liveCopy !== '\u2014' && (
                                <div style={{
                                  fontFamily: slot.variableId === 'metacognitive' || slot.variableId === 'progressive'
                                    ? fonts.mono : fonts.secondary,
                                  fontSize: slot.variableId === 'kinetic' ? 11 : slot.variableId === 'threshold' ? 10 : 9,
                                  fontWeight: slot.variableId === 'kinetic' ? 700 : undefined,
                                  fontStyle: slot.variableId === 'ambient' ? 'italic' : undefined,
                                  color: isActive ? section.accent : colors.neutral.white,
                                  opacity: isActive ? 0.6 : 0.2,
                                  lineHeight: 1.4,
                                  letterSpacing: slot.variableId === 'kinetic' ? '0.04em'
                                    : slot.variableId === 'metacognitive' ? '0.06em' : undefined,
                                  textTransform: slot.variableId === 'metacognitive' ? 'uppercase' as const : undefined,
                                  transition: 'opacity 0.3s',
                                }}>
                                  {liveCopy}
                                </div>
                              )}

                              {/* Budget + metrics */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{
                                  fontFamily: fonts.mono, fontSize: 7,
                                  color: colors.neutral.white, opacity: isActive ? 0.2 : 0.1,
                                  letterSpacing: '0.04em',
                                }}>
                                  {budget}
                                </span>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  {liveCopy && liveCopy !== '\u2014' && (
                                    <span style={{
                                      fontFamily: fonts.mono, fontSize: 6,
                                      color: colors.neutral.white, opacity: isActive ? 0.2 : 0.08,
                                    }}>
                                      {wordCount}w {charCount}ch
                                    </span>
                                  )}
                                  <span style={{
                                    fontFamily: fonts.mono, fontSize: 6,
                                    color: slotAccent,
                                    opacity: isActive ? 0.5 : 0.25,
                                    letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                                  }}>
                                    {slot.interactionType}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}

                        {/* ── CTA mode indicator ── */}
                        <div style={{
                          padding: '6px 10px', marginTop: 4,
                          display: 'flex', flexDirection: 'column', gap: 3,
                        }}>
                          <div style={{
                            fontFamily: fonts.mono, fontSize: 7,
                            color: colors.neutral.white, opacity: 0.15,
                            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                          }}>
                            close-out
                          </div>
                          <div style={{
                            fontFamily: fonts.secondary, fontSize: 8,
                            color: colors.neutral.white, opacity: 0.25, lineHeight: 1.4,
                          }}>
                            {copyProfile.ctaHint}
                          </div>
                        </div>
                      </>)}

                      {/* ══ EXIT TYPES ══════════════════════ */}
                      {section.id === 'exit' && EXIT_IDS.map(exId => {
                        const spec = EXITS[exId];
                        const isActive = state.exitId === exId;
                        return (
                          <button
                            key={exId}
                            onClick={() => onChange({ ...state, exitId: exId })}
                            style={{
                              padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                              background: isActive ? withAlpha(section.accent, 0.08) : withAlpha(colors.neutral.white, 0.015),
                              borderLeft: isActive ? `2px solid ${withAlpha(section.accent, 0.5)}` : '2px solid rgba(0,0,0,0)',
                              textAlign: 'left', transition: 'all 0.2s',
                              display: 'flex', flexDirection: 'column', gap: 5,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{
                                fontFamily: fonts.primary, fontSize: 11,
                                color: isActive ? section.accent : colors.neutral.white,
                                opacity: isActive ? 0.8 : 0.4,
                              }}>
                                {formatId(exId)}
                              </div>
                              <span style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.neutral.white, opacity: 0.15 }}>
                                {spec.durationMs === 0 ? 'instant' : `${(spec.durationMs / 1000).toFixed(1)}s`}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <span style={{
                                fontFamily: fonts.mono, fontSize: 7,
                                color: spec.finalState === 'atmosphere' ? colors.accent.cyan.primary : colors.neutral.white,
                                opacity: isActive ? 0.5 : 0.2,
                                padding: '1px 5px', borderRadius: 3,
                                background: withAlpha(
                                  spec.finalState === 'atmosphere' ? colors.accent.cyan.primary : colors.neutral.white,
                                  isActive ? 0.08 : 0.02,
                                ),
                                letterSpacing: '0.04em',
                              }}>
                                {'\u2192'} {spec.finalState}
                              </span>
                              <span style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.1 }}>
                                receipt: max 10w / 55ch
                              </span>
                            </div>
                            <div style={{
                              fontFamily: fonts.secondary, fontSize: 9,
                              color: colors.neutral.white, opacity: isActive ? 0.35 : 0.15, lineHeight: 1.4,
                            }}>
                              {spec.vibe}
                            </div>
                          </button>
                        );
                      })}

                      {/* ══ CTA / GESTURE TYPES ════════════ */}
                      {section.id === 'cta' && CTA_TYPES.map(cta => {
                        const isGesture = cta.id !== 'ping';
                        const isActive = isGesture && state.gestureId === cta.id;
                        const liveGestureCopy = isGesture
                          ? (GESTURE_COPY[cta.id as GestureId]?.[state.voiceLane] ?? '')
                          : '';
                        // Check if atom surfaces support this gesture
                        const surfaceMap: Record<string, string> = {
                          tap: 'tappable', hold: 'holdable', drag: 'draggable',
                          swipe: 'swipeable', pinch: 'pinchable', breathe: 'breathable',
                        };
                        const atomSupports = isGesture && atomMeta?.surfaces.includes(surfaceMap[cta.id] as any);
                        return (
                          <button
                            key={cta.id}
                            onClick={() => { if (isGesture) onChange({ ...state, gestureId: cta.id as GestureId }); }}
                            style={{
                              padding: '8px 10px', borderRadius: 8,
                              border: 'none', cursor: isGesture ? 'pointer' : 'default',
                              background: isActive ? withAlpha(section.accent, 0.08) : withAlpha(colors.neutral.white, 0.015),
                              borderLeft: isActive ? `2px solid ${withAlpha(section.accent, 0.5)}` : '2px solid rgba(0,0,0,0)',
                              textAlign: 'left', transition: 'all 0.2s',
                              display: 'flex', flexDirection: 'column', gap: 3,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{
                                  fontFamily: fonts.primary, fontSize: 10,
                                  color: isActive ? section.accent : colors.neutral.white,
                                  opacity: isActive ? 0.8 : 0.4,
                                  textTransform: 'capitalize' as const,
                                }}>
                                  {cta.id}
                                </span>
                                {atomSupports && (
                                  <span style={{
                                    fontFamily: fonts.mono, fontSize: 6,
                                    color: colors.accent.green.primary, opacity: 0.45,
                                    letterSpacing: '0.04em',
                                  }}>
                                    NATIVE
                                  </span>
                                )}
                              </div>
                              {cta.id === 'ping' && (
                                <span style={{
                                  fontFamily: fonts.mono, fontSize: 6,
                                  color: colors.neutral.white, opacity: 0.15,
                                  letterSpacing: '0.04em',
                                }}>SPECIAL</span>
                              )}
                            </div>
                            {/* Live gesture copy */}
                            {liveGestureCopy && isActive && (
                              <div style={{
                                fontFamily: fonts.mono, fontSize: 8,
                                color: section.accent, opacity: 0.45,
                                letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                              }}>
                                {liveGestureCopy}
                              </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.12 }}>
                                {cta.physics}
                              </span>
                              <span style={{
                                fontFamily: fonts.secondary, fontSize: 8,
                                color: isActive ? section.accent : colors.neutral.white,
                                opacity: isActive ? 0.35 : 0.12, fontStyle: 'italic',
                              }}>
                                {cta.feel}
                              </span>
                            </div>
                          </button>
                        );
                      })}

                      {/* ══ BREATHING HUD (NARRATIVE) ═══════ */}
                      {section.id === 'narrative' && (() => {
                        const np = narrativePayload;
                        const hudModes: Array<{ id: 'breathing-hud' | 'raw-copy'; label: string }> = [
                          { id: 'breathing-hud', label: 'HUD' },
                          { id: 'raw-copy', label: 'Raw Copy' },
                        ];
                        const elemSt: React.CSSProperties = {
                          padding: '6px 10px', borderRadius: 6,
                          background: withAlpha(colors.neutral.white, 0.015),
                          display: 'flex', flexDirection: 'column', gap: 2,
                          marginBottom: 2,
                        };
                        const lbSt: React.CSSProperties = {
                          fontFamily: fonts.mono, fontSize: 7,
                          color: withAlpha(section.accent, 0.5),
                          letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                        };
                        const cpSt: React.CSSProperties = {
                          fontFamily: fonts.secondary, fontSize: 10,
                          color: colors.neutral.white, opacity: 0.6, lineHeight: 1.5,
                        };
                        const mtSt: React.CSSProperties = {
                          fontFamily: fonts.mono, fontSize: 7,
                          color: colors.neutral.white, opacity: 0.15,
                        };
                        return (
                          <>
                            {/* ── Mirror Mode Toggle ── */}
                            <div style={{ ...elemSt, flexDirection: 'column', gap: 6 }}>
                              <span style={lbSt}>mirror mode</span>
                              <div style={{ display: 'flex', gap: 3 }}>
                                {hudModes.map(m => {
                                  const isActive = state.hudMode === m.id;
                                  return (
                                    <button
                                      key={m.id}
                                      onClick={() => onChange({ ...state, hudMode: m.id })}
                                      style={{
                                        flex: 1, padding: '4px 0', borderRadius: 4, border: 'none',
                                        cursor: 'pointer',
                                        background: isActive ? withAlpha(section.accent, 0.2) : withAlpha(colors.neutral.white, 0.03),
                                        fontFamily: fonts.mono, fontSize: 8,
                                        color: isActive ? section.accent : colors.neutral.white,
                                        opacity: isActive ? 0.9 : 0.25,
                                        letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                                        transition: 'all 0.2s',
                                      }}
                                    >
                                      {m.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            <div style={{ ...elemSt, flexDirection: 'column', gap: 6 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={lbSt}>density</span>
                                <span style={mtSt}>collapse: {np.collapseModel}</span>
                              </div>
                              <div style={{ display: 'flex', gap: 3 }}>
                                {(['full', 'core', 'minimal', 'silent'] as NarrativeDensity[]).map(d => {
                                  const isActive = state.narrativeDensity === d;
                                  return (
                                    <button
                                      key={d}
                                      onClick={() => onChange({ ...state, narrativeDensity: d })}
                                      style={{
                                        flex: 1, padding: '4px 0', borderRadius: 4, border: 'none',
                                        cursor: 'pointer',
                                        background: isActive ? withAlpha(section.accent, 0.15) : withAlpha(colors.neutral.white, 0.03),
                                        fontFamily: fonts.mono, fontSize: 8,
                                        color: isActive ? section.accent : colors.neutral.white,
                                        opacity: isActive ? 0.8 : 0.25,
                                        letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                                        transition: 'all 0.2s',
                                      }}
                                    >
                                      {d}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            {np.inboundHook && (
                              <div style={elemSt}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span style={lbSt}>1. inbound hook</span>
                                  <span style={mtSt}>{np.inboundHook.position}</span>
                                </div>
                                <div style={cpSt}>{np.inboundHook.text}</div>
                              </div>
                            )}
                            {np.narrativeCanopy && (
                              <div style={elemSt}>
                                <span style={lbSt}>2. narrative canopy</span>
                                <div style={cpSt}>{np.narrativeCanopy.text}</div>
                                <div style={{ ...mtSt, marginTop: 2 }}>condensed: {np.narrativeCanopy.condensed}</div>
                              </div>
                            )}
                            {np.semanticPill && (
                              <div style={elemSt}>
                                <span style={lbSt}>3+6. pill → morph</span>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <span style={{ fontFamily: fonts.mono, fontSize: 10, color: section.accent, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                                    {np.semanticPill.before}
                                  </span>
                                  <span style={{ ...mtSt, fontSize: 9 }}>→</span>
                                  <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.neutral.white, opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                                    {np.semanticPill.after}
                                  </span>
                                </div>
                              </div>
                            )}
                            {np.ambientSubtext && (
                              <div style={elemSt}>
                                <span style={lbSt}>4. ambient subtext</span>
                                <div style={{ ...cpSt, fontStyle: 'italic', opacity: 0.35 }}>{np.ambientSubtext.text}</div>
                              </div>
                            )}
                            {np.idleWhisper && (
                              <div style={elemSt}>
                                <span style={lbSt}>5. idle whisper</span>
                                <div style={{ display: 'flex', gap: 12 }}>
                                  <div>
                                    <div style={{ ...mtSt, marginBottom: 2 }}>invite (5s)</div>
                                    <div style={cpSt}>{np.idleWhisper.invite}</div>
                                  </div>
                                  <div>
                                    <div style={{ ...mtSt, marginBottom: 2 }}>hint (4s)</div>
                                    <div style={cpSt}>{np.idleWhisper.hint}</div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {np.outboundReceipt && (
                              <div style={elemSt}>
                                <span style={lbSt}>7. outbound receipt</span>
                                <div style={cpSt}>{np.outboundReceipt.text}</div>
                              </div>
                            )}
                          </>
                        );
                      })()}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── Separator ────────────────────── */}
      <div style={{ height: 1, background: withAlpha(colors.neutral.white, 0.04) }} />

      {/* ── Color Signature (compact) ──────── */}
      <div>
        <SectionLabel>color</SectionLabel>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {COLOR_SIGNATURE_IDS.map(csId => {
            const cs = COLOR_SIGNATURES[csId];
            const isActive = state.colorSignature === csId;
            return (
              <button
                key={csId}
                onClick={() => onChange({ ...state, colorSignature: csId })}
                title={cs.name}
                style={{
                  width: 20, height: 20, borderRadius: 5, padding: 0,
                  border: isActive
                    ? `2px solid ${withAlpha(colors.neutral.white, 0.35)}`
                    : `1px solid ${withAlpha(colors.neutral.white, 0.06)}`,
                  background: cs.primary,
                  cursor: 'pointer', transition: 'border 0.2s',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Breath (compact) ────────────────── */}
      <div>
        <SectionLabel>breath</SectionLabel>
        <div style={{ display: 'flex', gap: 4 }}>
          {BREATH_PATTERNS.map(bp => (
            <button
              key={bp.id}
              onClick={() => onChange({ ...state, breathPattern: bp.id })}
              style={{
                padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontFamily: fonts.primary, fontSize: 10,
                color: colors.neutral.white,
                opacity: state.breathPattern === bp.id ? 0.65 : 0.2,
                background: state.breathPattern === bp.id ? surfaces.glass.light : 'rgba(0,0,0,0)',
                transition: 'all 0.3s',
              }}
            >
              {bp.label}
            </button>
          ))}
        </div>
      </div>

    </motion.div>
  );
}

// =====================================================================
// SHARED COMPONENTS
// =====================================================================

function CatalogItem({
  label, sublabel, prefix, suffix, isActive, color, onClick,
}: {
  label: string;
  sublabel?: string;
  prefix?: string;
  suffix?: string;
  isActive: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
        background: isActive ? withAlpha(color, 0.08) : 'rgba(0,0,0,0)',
        textAlign: 'left', transition: 'background 0.2s', width: '100%',
      }}
    >
      {prefix ? (
        <span style={{
          fontFamily: fonts.mono, fontSize: 8,
          color: withAlpha(color, 0.3), minWidth: 18, flexShrink: 0,
        }}>
          {prefix}
        </span>
      ) : (
        <div style={{
          width: 4, height: 4, borderRadius: '50%',
          background: isActive ? color : surfaces.glass.border,
          opacity: isActive ? 0.8 : 0.15,
          flexShrink: 0,
        }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: fonts.primary, fontSize: 10,
          color: isActive ? color : colors.neutral.white,
          opacity: isActive ? 0.7 : 0.3,
          transition: 'all 0.2s',
        }}>
          {label}
        </div>
        {sublabel && (
          <div style={{
            fontFamily: fonts.primary, fontSize: 8,
            color: colors.neutral.white, opacity: 0.12,
            marginTop: 1, lineHeight: 1.4,
          }}>
            {sublabel}
          </div>
        )}
      </div>
      {suffix && (
        <div style={{ fontFamily: fonts.mono, fontSize: 7, color: colors.neutral.white, opacity: 0.08, flexShrink: 0 }}>
          {suffix}
        </div>
      )}
    </button>
  );
}

function PlayButton({ label, color, onClick, disabled }: {
  label: string; color: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 18px', borderRadius: 8,
        border: `1px solid ${withAlpha(color, 0.2)}`,
        background: withAlpha(color, 0.06),
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: fonts.mono, fontSize: 10,
        color, letterSpacing: '0.08em',
        opacity: disabled ? 0.3 : 1,
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: fonts.mono, fontSize: 8,
      color: colors.neutral.white, opacity: 0.15,
      letterSpacing: '0.1em', textTransform: 'uppercase' as const,
      marginBottom: 8,
    }}>
      {children}
    </div>
  );
}

function formatId(id: string): string {
  return id.replace(/^the-/, 'The ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// =====================================================================
// MAIN WORKSPACE
// =====================================================================

export default function VoiceWorkspace() {
  const [state, setState] = useState<VoiceCompositionState>(INITIAL_STATE);
  const [isMobile, setIsMobile] = useState(false);
  const { setContent } = useDeviceMirror();
  const { amplitude } = useBreathEngine(state.breathPattern);
  const sequence = useSequence(state.entranceId, state.exitId);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < atomsLayout.mobileBreakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Atom's onResolve triggers exit
  const handleAtomResolve = useCallback(() => {
    if (sequence.phase === 'active') {
      sequence.triggerExit();
    }
  }, [sequence.phase, sequence.triggerExit]);

  // Push NaviCue scene into DeviceMirror
  useEffect(() => {
    const colorSig = COLOR_SIGNATURES[state.colorSignature];
    setContent({
      accent: colorSig.accent,
      glow: colorSig.glow,
      breathPattern: state.breathPattern,
      customRenderer: (
        <NaviCueScene
          state={state}
          breathAmplitude={amplitude}
          sequencePhase={sequence.phase}
          sequenceProgress={sequence.progress}
          onResolve={handleAtomResolve}
        />
      ),
    });
  }, [state, amplitude, setContent, sequence.phase, sequence.progress, handleAtomResolve]);

  if (!isMobile) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `${atomsLayout.catalogPanelWidth}px 1fr ${atomsLayout.controlsPanelWidth}px`,
        gap: 0,
        minHeight: `calc(100vh - ${layout.topBarHeight}px)`,
      }}>
        {/* Left */}
        <div style={{
          padding: '20px 16px',
          borderRight: `1px solid ${surfaces.glass.subtle}`,
          background: withAlpha(surfaces.solid.base, 0.4),
          overflowY: 'auto',
        }}>
          <VoiceCatalog
            state={state}
            onSelectAtom={id => setState(s => ({ ...s, atomId: id }))}
            onSelectVoice={id => setState(s => ({ ...s, voiceLane: id }))}
            onSelectGesture={id => setState(s => ({ ...s, gestureId: id }))}
            onSelectEntrance={id => setState(s => ({ ...s, entranceId: id }))}
            onSelectExit={id => setState(s => ({ ...s, exitId: id }))}
          />
        </div>

        {/* Center */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <DeviceMirror />
        </div>

        {/* Right */}
        <div style={{
          padding: '20px 16px',
          borderLeft: `1px solid ${surfaces.glass.subtle}`,
          background: withAlpha(surfaces.solid.base, 0.4),
          overflowY: 'auto',
        }}>
          <VoiceControls
            state={state}
            onChange={setState}
            sequencePhase={sequence.phase}
            onPlay={sequence.play}
            onExit={sequence.triggerExit}
            onReset={sequence.reset}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 20 }}>
        <DeviceMirror />
      </div>
      <VoiceCatalog
        state={state}
        onSelectAtom={id => setState(s => ({ ...s, atomId: id }))}
        onSelectVoice={id => setState(s => ({ ...s, voiceLane: id }))}
        onSelectGesture={id => setState(s => ({ ...s, gestureId: id }))}
        onSelectEntrance={id => setState(s => ({ ...s, entranceId: id }))}
        onSelectExit={id => setState(s => ({ ...s, exitId: id }))}
      />
      <div style={{ marginTop: 24 }}>
        <VoiceControls
          state={state}
          onChange={setState}
          sequencePhase={sequence.phase}
          onPlay={sequence.play}
          onExit={sequence.triggerExit}
          onReset={sequence.reset}
        />
      </div>
    </div>
  );
}