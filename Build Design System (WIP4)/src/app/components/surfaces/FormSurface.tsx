/**
 * FORM SURFACE — The Consulting Room
 *
 * Not SYNC. This is the room where the work happens.
 * A therapist sat in a room with you. Deliberate. Clinical. Serious.
 *
 * The Somatic Compass — three ambient calibration dots (BODY, TONE, PACE)
 * locate the right practice from a 3×3×3 coordinate grid of 27 addresses.
 * Every coordinate is occupied. The user never browses, never chooses.
 * They describe the shape of their body right now, and the system
 * gives them the one.
 *
 * Five clinical containers execute in sequence:
 *   RESOURCE     — Vagal brake. Persistent somatic anchor. Always running.
 *   TITRATION    — Controlled exposure. Schema in constrained midground.
 *   PENDULATION  — Somatic shift. Hold/release oscillation.
 *   DEFUSION     — ACT decoupling. Schema sinks, reframe emerges.
 *   WASH         — Parasympathetic clearing. Glass returns to dark.
 *
 * Dual Awareness enforced at all times: the Resource pulse
 * runs continuously under every other container.
 *
 * Atom Phase Modulation:
 *   The atom shifts behavior per container:
 *     Resource     → phase='active', breath dampened to 40%, atom is calm
 *     Titration    → phase='active', breath at 60%, schema tension modulates
 *     Pendulation  → phase='active', breath at 100% + holdProgress amplifies
 *     Defusion     → phase='resolve' when schema sinks, atom dissolves
 *     Wash         → phase='resolve', atom clears to nothing
 *
 * Somatic Wash Canvas:
 *   During WASH, a full-screen Canvas 2D bimodal wave sweeps the
 *   glass clean. The parasympathetic clearing.
 *
 * KNOW→HONE Handoff:
 *   Accepts `schemaOverride` — raw text from KNOW insight navigation.
 *   The schema is injected into the titration step.
 *
 * Grounding escape: double-tap anywhere → instant return to Resource.
 * Once done, it is done. The practice does not loop.
 */

import { useState, useRef, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import type { AtomProps } from '../atoms/types';
import { getImplementedAtoms } from '../atoms/atom-registry';
import { TYPOGRAPHY } from './copy-guardrails';
import { hapticTick, hapticThreshold, hapticResolve, hapticPressure, hapticSeal, hapticBreathPulse } from './haptics';
import { sendFormTelemetry } from '../runtime/useSeekTelemetry';
import { useSurfaceArrival } from './useSurfaceArrival';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { useIndividualId } from '../runtime/session-seam';
import { useResilience } from '../runtime/resilience-seam';
import { ResilienceWhisper } from './ResilienceWhisper';
import {
  CONTAINERS,
  type ClinicalContainer,
  type FormPhase,
  type PracticeStep,
  type Practice,
} from '../form/form-types';
import { FORM_PRACTICES } from '../form/form-practices';
import { SEEK_INSIGHTS } from '../seek/seek-insights';
import { WashCanvas } from '../form/WashCanvas';
import { BilateralNode } from '../form/BilateralNode';
import { PendulationZone } from '../form/PendulationZone';
import { BreathVolume } from '../form/BreathVolume';
import { BoundaryField } from '../form/BoundaryField';
import { room, font, layout, tracking, typeSize, leading, weight, opacity, timing, glow, radii, glaze, void_, layer, glass, signal } from '../design-system/surface-tokens';
import { FormCalibration } from './FormCalibration';
import {
  type FormCalibrationState,
  DEFAULT_FORM_CALIBRATION,
  resolvePractice,
  getCoordinateKey,
} from '../form/form-calibration';

// ─── Lazy-load atoms ───
const atomComponents: Record<string, React.LazyExoticComponent<React.ComponentType<AtomProps>>> = {
  'somatic-resonance': lazy(() => import('../atoms/somatic-resonance')),
  'wave-collapse': lazy(() => import('../atoms/wave-collapse')),
  'dark-matter': lazy(() => import('../atoms/dark-matter')),
  'mycelial-routing': lazy(() => import('../atoms/mycelial-routing')),
  'phoenix-ash': lazy(() => import('../atoms/phoenix-ash')),
  'cymatic-coherence': lazy(() => import('../atoms/cymatic-coherence')),
  'future-memory': lazy(() => import('../atoms/future-memory')),
};

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════

const ORB_CLEARANCE = layout.orbClearance;
const SERIF = font.serif;
const SANS = font.sans;

const STEP_FADE_OUT = 0.8;
const STEP_GAP = 0.4;
const STEP_FADE_IN = 1.2;
const WASH_DURATION = 6000;

// Resource pulse — 5.5 BPM
const BREATH_CYCLE_MS = 10909;

// ═══════════════════════════════════════════════════
// ATOM PHASE MODULATION — container→atom mapping
// ═══════════════════════════════════════════════════

interface AtomModulation {
  /** Breath amplitude multiplier (0-1.5) */
  breathMultiplier: number;
  /** Atom lifecycle phase */
  phase: AtomProps['phase'];
  /** Opacity of the atom canvas layer */
  canvasOpacity: number;
  /** CSS filter applied to the atom canvas */
  canvasFilter: string;
}

function getAtomModulation(
  container: ClinicalContainer,
  holdProgress: number,
  schemaDepth: number,
  washProgress: number,
): AtomModulation {
  switch (container) {
    case 'resource':
      return {
        breathMultiplier: 0.4,
        phase: 'active',
        canvasOpacity: 0.7,
        canvasFilter: 'none',
      };
    case 'titration':
      return {
        breathMultiplier: 0.6 + schemaDepth * 0.2,
        phase: 'active',
        canvasOpacity: 0.5 + schemaDepth * 0.15,
        canvasFilter: `saturate(${0.7 + schemaDepth * 0.3})`,
      };
    case 'pendulation':
      return {
        breathMultiplier: 0.7 + holdProgress * 0.8,
        phase: 'active',
        canvasOpacity: 0.6 + holdProgress * 0.3,
        canvasFilter: holdProgress > 0.5
          ? `brightness(${1 + holdProgress * 0.15})`
          : 'none',
      };
    case 'defusion':
      return {
        breathMultiplier: 0.5 - schemaDepth * 0.3,
        phase: schemaDepth > 0.6 ? 'resolve' : 'active',
        canvasOpacity: 0.6 - schemaDepth * 0.35,
        canvasFilter: schemaDepth > 0.3
          ? `blur(${schemaDepth * 2}px) saturate(${1 - schemaDepth * 0.5})`
          : 'none',
      };
    case 'wash':
      return {
        breathMultiplier: Math.max(0.05, 0.3 - washProgress * 0.25),
        phase: 'resolve',
        canvasOpacity: Math.max(0, 0.4 - washProgress * 0.4),
        canvasFilter: `blur(${washProgress * 4}px) saturate(${1 - washProgress * 0.8})`,
      };
  }
}

// ═══════════════════════════════════════════════════
// SCHEMA INJECTION — rewrites titration step with user schema
// ═══════════════════════════════════════════════════

function injectSchemaIntoPractice(practice: Practice, schema: string): Practice {
  if (!schema) return practice;
  return {
    ...practice,
    schema,
    steps: practice.steps.map(step => {
      if (step.container === 'titration') {
        return {
          ...step,
          copy: schema,
          subCopy: 'Observe the shape of this thought. It is contained here.',
          instruction: 'Read. Do not react. The pulse continues.',
        };
      }
      return step;
    }),
  };
}

// ═══════════════════════════════════════════════════
// RESOURCE PULSE — The persistent somatic anchor
// ═══════════════════════════════════════════════════

function ResourcePulse({
  color,
  breath,
  active,
  intensity,
}: {
  color: string;
  breath: number;
  active: boolean;
  intensity: number;
}) {
  const baseSize = 5 + intensity * 3;
  const breathScale = 1 + Math.sin(breath * Math.PI * 2) * (0.15 + intensity * 0.2);
  const glowRadius = 16 + intensity * 24;
  const pulseOpacity = active ? (0.08 + Math.sin(breath * Math.PI * 2) * 0.04 + intensity * 0.12) : 0;

  return (
    <div
      className="absolute flex items-center justify-center pointer-events-none"
      style={{
        bottom: '14%',
        left: 0,
        right: 0,
        opacity: pulseOpacity,
        transition: `opacity ${active ? 2.5 : 0.8}s ease`,
      }}
    >
      {intensity > 0.3 && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: 3, height: 3, background: color,
              opacity: intensity * 0.3,
              left: `calc(50% - ${20 + intensity * 15}px)`,
              boxShadow: glow.soft(color),
              transform: `scale(${breathScale})`,
              transition: timing.t.easeModerate,
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 3, height: 3, background: color,
              opacity: intensity * 0.3,
              left: `calc(50% + ${20 + intensity * 15}px)`,
              boxShadow: glow.soft(color),
              transform: `scale(${breathScale})`,
              transition: timing.t.easeModerate,
            }}
          />
        </>
      )}
      <div
        className="rounded-full"
        style={{
          width: baseSize, height: baseSize, background: color,
          boxShadow: glow.halo(color, glowRadius, glowRadius * 2, '30', '10'),
          transform: `scale(${breathScale})`,
          transition: timing.t.resizeTransform,
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════
// STEP COPY LAYER
// ════════════════════════════════════════════════

function StepCopy({
  step,
  container,
  visible,
  schemaDepth,
  holdProgress,
}: {
  step: PracticeStep;
  container: typeof CONTAINERS[ClinicalContainer];
  visible: boolean;
  schemaDepth: number;
  holdProgress: number;
}) {
  const isResource = step.container === 'resource';
  const isTitration = step.container === 'titration';
  const isPendulation = step.container === 'pendulation';
  const isDefusion = step.container === 'defusion';
  const isWash = step.container === 'wash';

  const textBlur = isTitration
    ? 0.5 + schemaDepth * 6
    : isDefusion && schemaDepth > 0 ? 0 : 0;

  const textOpacity = visible
    ? isResource ? 0.2
      : isTitration ? 0.5 - schemaDepth * 0.35
        : isPendulation ? 0.7
          : isDefusion ? 0.85
            : isWash ? 0.5 : 0.7
    : 0;

  const textScale = isTitration ? 0.97 - schemaDepth * 0.08 : 1;
  const maxWidth = isTitration ? '52%' : isPendulation ? '55%' : isResource ? '60%' : '70%';

  const position: React.CSSProperties = isResource
    ? { bottom: '22%', left: 0, right: 0, position: 'absolute' }
    : isPendulation
      ? { top: `${35 + holdProgress * 8}%`, left: 0, right: 0, position: 'absolute' }
      : { top: '50%', left: 0, right: 0, position: 'absolute', transform: `translateY(-50%) scale(${textScale})` };

  return (
    <div
      style={{
        ...position,
        textAlign: 'center',
        padding: '0 10%',
        filter: textBlur > 0.1 ? `blur(${textBlur}px)` : 'none',
        opacity: textOpacity,
        transition: `opacity ${visible ? STEP_FADE_IN : STEP_FADE_OUT}s ease, filter 1.5s ease, transform 1.5s ease`,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <p style={{
        fontFamily: SERIF,
        fontSize: isResource ? 'clamp(10px, 2.5vw, 13px)'
          : isPendulation ? 'clamp(9px, 2vw, 11px)'
            : isTitration ? 'clamp(15px, 3.8vw, 20px)'
              : isDefusion ? 'clamp(18px, 4.5vw, 28px)'
                : 'clamp(15px, 3.8vw, 22px)',
        fontWeight: weight.light,
        lineHeight: isPendulation ? 1.3 : 1.45,
        letterSpacing: isPendulation ? '0.16em' : isTitration ? '0.01em' : '0.02em',
        fontStyle: isWash ? 'italic' : 'normal',
        textTransform: isPendulation ? 'uppercase' : 'none',
        color: room.fg,
        margin: 0,
        maxWidth,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        {step.copy}
      </p>

      {step.subCopy && (
        <p style={{
          fontFamily: SERIF,
          fontSize: 'clamp(9px, 2vw, 11px)',
          fontWeight: weight.light, fontStyle: 'italic',
          lineHeight: leading.body, letterSpacing: tracking.body,
          color: room.fg, opacity: opacity.voice,
          marginTop: 10, maxWidth,
          marginLeft: 'auto', marginRight: 'auto',
        }}>
          {step.subCopy}
        </p>
      )}

      {step.instruction && (
        <p style={{
          fontFamily: SANS,
          fontSize: 'clamp(7px, 1.6vw, 9px)',
          fontWeight: weight.medium, letterSpacing: tracking.spread,
          textTransform: 'uppercase',
          color: container.colorTint.replace('0.5)', '0.3)'),
          marginTop: 16,
        }}>
          {step.instruction}
        </p>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════
// CONTAINER INDICATOR
// ═══════════════════════════════════════════════════

function ContainerIndicator({ container, visible }: { container: ClinicalContainer; visible: boolean }) {
  const def = CONTAINERS[container];
  return (
    <motion.div
      className="absolute flex items-center gap-2 justify-center pointer-events-none"
      style={{ top: '6%', left: 0, right: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <span style={{
        fontFamily: SANS, fontSize: typeSize.label, fontWeight: weight.medium,
        letterSpacing: tracking.wide, textTransform: 'uppercase',
        color: glass(signal.resolution, 0.3),
      }}>
        {def.glyph}
      </span>
      <span style={{
        fontFamily: SANS, fontSize: typeSize.whisper, fontWeight: weight.medium,
        letterSpacing: tracking.wide, textTransform: 'uppercase',
        color: glaze.glint,
      }}>
        {def.label}
      </span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// STEP PROGRESS
// ═══════════════════════════════════════════════════

function StepProgress({ currentIndex, totalSteps, containerColor }: {
  currentIndex: number; totalSteps: number; containerColor: string;
}) {
  return (
    <div
      className="absolute flex items-center gap-1.5 justify-center pointer-events-none"
      style={{ bottom: ORB_CLEARANCE + 16, left: 0, right: 0 }}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === currentIndex ? 10 : 3,
            height: 2, borderRadius: radii.dot,
            background: i === currentIndex ? containerColor
              : i < currentIndex ? glaze.glint : glaze.thin,
            opacity: i === currentIndex ? opacity.steady : 1,
            transition: timing.t.settle,
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// GROUNDING FLASH
// ══════════════════════════════════════════════════

function GroundingFlash({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: layer.pinnacle }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${glass(signal.resolution, 0.04)} 0%, transparent 60%)`,
            }}
          >
            <span style={{
              fontFamily: SANS, fontSize: typeSize.label, fontWeight: weight.medium,
              letterSpacing: tracking.wide, textTransform: 'uppercase',
              color: glass(signal.resolution, 0.3),
            }}>
              GROUNDED
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════
// ADVANCE HINT
// ══════════════════════════════════════════════════

function AdvanceHint({ container, schemaDepth }: { container: ClinicalContainer; schemaDepth: number }) {
  const [visible, setVisible] = useState(false);
  const minDuration = CONTAINERS[container].persistent ? 6000 : 4000;

  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), minDuration);
    return () => clearTimeout(t);
  }, [container, minDuration]);

  if (!visible) return null;

  const hint =
    container === 'resource' ? 'TAP TO CONTINUE' :
      container === 'titration' ? 'TAP WHEN OBSERVED' :
        container === 'pendulation' ? 'DRAG BETWEEN ZONES' :
          container === 'defusion' ? (schemaDepth > 0.8 ? 'TAP TO INTEGRATE' : 'HOLD THE THOUGHT') :
            container === 'wash' ? 'TAP TO CLOSE' : 'TAP';

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ bottom: ORB_CLEARANCE + 42, left: 0, right: 0, textAlign: 'center' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <span style={{
        fontFamily: SANS, fontSize: typeSize.whisper, fontWeight: weight.medium,
        letterSpacing: tracking.wide, textTransform: 'uppercase',
        color: glaze.glint,
      }}>
        {hint}
      </span>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// THE FORM SURFACE
// ═══════════════════════════════════════════════════

interface FormSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
  /** Override which practice to run (workbench) */
  practiceOverride?: Practice;
  /** Override which step to show (workbench) */
  stepOverride?: number;
  /** Schema text from KNOW handoff */
  schemaOverride?: string;
}

export function FormSurface({
  mode,
  breath,
  onResolve,
  practiceOverride,
  stepOverride,
  schemaOverride,
}: FormSurfaceProps) {
  const userId = useIndividualId();
  const resilience = useResilience();

  // ─── Somatic Compass — the three-axis calibration ───
  const [calibration, setCalibration] = useState<FormCalibrationState>(DEFAULT_FORM_CALIBRATION);

  // ─── Handoff overrides (TALK→HONE, KNOW→HONE) ───
  const [handoffPractice, setHandoffPractice] = useState<Practice | null>(null);
  const [handoffReason, setHandoffReason] = useState<string | null>(null);
  const [talkHandoffSchema, setTalkHandoffSchema] = useState<string | null>(null);

  useEffect(() => {
    if (practiceOverride) return; // External override takes precedence

    const RECO_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;
    const recoHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    };

    // Check for TALK→FORM handoff (one-shot, higher priority than calibration)
    fetch(`${RECO_BASE}/talk/form-handoff/${userId}`, { headers: recoHeaders })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.found && data.handoff?.schema) {
          setTalkHandoffSchema(data.handoff.schema);
          console.log(`[FORM] TALK handoff loaded: ${data.handoff.schema} (insight: ${data.handoff.insightId})`);

          const SEEK_INSIGHT = SEEK_INSIGHTS.find(s => s.id === data.handoff.insightId);
          if (SEEK_INSIGHT) {
            const matchedPractice = FORM_PRACTICES.find(p => p.atomId === SEEK_INSIGHT.atomId);
            if (matchedPractice) {
              setHandoffPractice(matchedPractice);
              setHandoffReason(`The corridor found a shape. The body receives it.`);
            }
          }
        }
      })
      .catch(err => console.error('[FORM] Handoff load failed:', err));
  }, [practiceOverride]);

  // ─── Practice resolution: handoff > override > calibration compass ───
  const calibratedPracticeId = useMemo(() => resolvePractice(calibration), [calibration]);
  const calibratedPractice = useMemo(
    () => FORM_PRACTICES.find(p => p.id === calibratedPracticeId) || FORM_PRACTICES[0],
    [calibratedPracticeId],
  );

  const basePractice = practiceOverride || handoffPractice || calibratedPractice;
  const effectiveSchema = schemaOverride || talkHandoffSchema;
  const practice = useMemo(
    () => effectiveSchema ? injectSchemaIntoPractice(basePractice, effectiveSchema) : basePractice,
    [basePractice, effectiveSchema],
  );
  const totalSteps = practice.steps.length;

  // Log calibration changes
  useEffect(() => {
    const key = getCoordinateKey(calibration);
    console.log(`[FORM] Compass: ${key} → ${calibratedPracticeId} (${calibratedPractice.name})`);
  }, [calibration, calibratedPracticeId, calibratedPractice.name]);

  // ─── Phase & step state ───
  const [phase, setPhase] = useState<FormPhase>('arriving');
  const [stepIndex, setStepIndex] = useState(stepOverride ?? 0);
  const [stepVisible, setStepVisible] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [schemaDepth, setSchemaDepth] = useState(0);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [groundingFlash, setGroundingFlash] = useState(false);
  const [washProgress, setWashProgress] = useState(0);
  const [pendulationPos, setPendulationPos] = useState(0); // 0=anchor, 1=schema
  const [draggingPendulation, setDraggingPendulation] = useState(false);

  const { arrived } = useSurfaceArrival(mode);

  // Refs
  const holdStartRef = useRef(0);
  const holdingRef = useRef(false);
  const rafRef = useRef(0);
  const lastTapRef = useRef(0);
  const washStartRef = useRef(0);
  const washRafRef = useRef(0);
  const practiceStartRef = useRef(Date.now());

  // ─── Current step ───
  const currentStep = practice.steps[stepIndex];
  const currentContainer = currentStep ? CONTAINERS[currentStep.container] : CONTAINERS.resource;

  // ─── Atom setup ───
  const implementedAtoms = useMemo(() => getImplementedAtoms(), []);
  const atomMeta = implementedAtoms.find(a => a.id === practice.atomId);
  const AtomComponent = atomComponents[practice.atomId];
  const [viewport, setViewport] = useState({ width: 375, height: 667 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport tracking
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setViewport({ width, height });
    });
    ro.observe(el);
    setViewport({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // ─── Step override sync ───
  useEffect(() => {
    if (stepOverride !== undefined) {
      setStepIndex(stepOverride);
      setStepVisible(true);
      setSchemaDepth(0);
      setHoldProgress(0);
      setPulseIntensity(0);
      setWashProgress(0);
    }
  }, [stepOverride]);

  // ─── Phase reset on practice change ───
  useEffect(() => {
    setPhase('arriving');
    setStepIndex(stepOverride ?? 0);
    setStepVisible(false);
    setSchemaDepth(0);
    setHoldProgress(0);
    setPulseIntensity(0);
    setWashProgress(0);
    practiceStartRef.current = Date.now();
  }, [practice.id]);

  // Arrival → active
  useEffect(() => {
    if (arrived && phase === 'arriving') {
      setPhase('active');
      const t = setTimeout(() => setStepVisible(true), 300);
      return () => clearTimeout(t);
    }
  }, [arrived, phase]);

  // ─── Haptic breath pulse ───
  useEffect(() => {
    if (phase !== 'active' && phase !== 'transitioning') return;
    if (currentStep?.container === 'wash') return;

    const interval = setInterval(() => {
      hapticBreathPulse();
    }, BREATH_CYCLE_MS);

    return () => clearInterval(interval);
  }, [phase, currentStep?.container]);

  // ─── Wash progress animation ───
  useEffect(() => {
    if (phase !== 'completing') {
      setWashProgress(0);
      cancelAnimationFrame(washRafRef.current);
      return;
    }

    washStartRef.current = Date.now();
    const loop = () => {
      const elapsed = Date.now() - washStartRef.current;
      const progress = Math.min(1, elapsed / WASH_DURATION);
      setWashProgress(progress);

      if (progress < 1) {
        washRafRef.current = requestAnimationFrame(loop);
      }
    };
    washRafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(washRafRef.current);
  }, [phase]);

  // ─── Advance step ───
  const advanceStep = useCallback(() => {
    if (phase === 'sealed' || phase === 'completing') return;

    const nextIndex = stepIndex + 1;

    if (nextIndex >= totalSteps) {
      setPhase('completing');
      setStepVisible(false);
      hapticSeal();

      setTimeout(() => {
        setPhase('sealed');
        // Fire FORM telemetry
        sendFormTelemetry({
          practiceId: practice.id,
          protocol: practice.protocol,
          schema: practice.schema,
          containerSequence: practice.steps.map(s => s.container),
          totalDurationMs: Date.now() - practiceStartRef.current,
          atomId: practice.atomId,
        });

        // ── FORM → PLOT: Coordinate nudge based on pillar ──
        // Each pillar maps to specific coordinates it strengthens:
        //   BASELINE → anchorage (grounding, breath, nervous system)
        //   SHIELD   → clarity (boundaries, energy clearing)
        //   REWIRE   → clarity + energy (defusion, bilateral, rescripting)
        //   BRIDGE   → anchorage + energy (relational, ground-holding)
        const pillarNudges: Record<string, { id: string; nudge: number }[]> = {
          baseline: [{ id: 'anchorage', nudge: 0.06 }],
          shield:   [{ id: 'clarity', nudge: 0.05 }],
          rewire:   [{ id: 'clarity', nudge: 0.04 }, { id: 'energy', nudge: 0.03 }],
          bridge:   [{ id: 'anchorage', nudge: 0.03 }, { id: 'energy', nudge: 0.04 }],
        };

        const nudges = pillarNudges[practice.pillar];
        if (nudges) {
          const PLOT_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;
          const plotHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          };

          // Read current coordinates, apply nudge, save back
          fetch(`${PLOT_BASE_URL}/plot/coordinates/${userId}`, { headers: plotHeaders })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              const currentCoords = data?.found && data.coordinates
                ? data.coordinates.map((c: any) => ({ id: c.id, value: c.value }))
                : [
                    { id: 'clarity', value: 0.5 },
                    { id: 'energy', value: 0.5 },
                    { id: 'anchorage', value: 0.5 },
                  ];

              // Apply nudges
              const updatedCoords = currentCoords.map((c: { id: string; value: number }) => {
                const nudge = nudges.find(n => n.id === c.id);
                if (nudge) {
                  return { id: c.id, value: Math.min(1, c.value + nudge.nudge) };
                }
                return c;
              });

              // Save updated coordinates
              return fetch(`${PLOT_BASE_URL}/plot/coordinates`, {
                method: 'POST',
                headers: plotHeaders,
                body: JSON.stringify({ userId, coordinates: updatedCoords }),
              });
            })
            .then(() => {
              console.log(`[FORM→PLOT] Coordinates nudged via pillar: ${practice.pillar}`);
            })
            .catch(err => {
              console.error('[FORM→PLOT] Coordinate nudge failed:', err);
            });
        }

        // ── HONE → ∞MAP: K.B.E. Believing nudge ──
        // Match this practice's atomId to a KNOW insight,
        // then bump its Believing score. The body did the work.
        const matchedInsight = SEEK_INSIGHTS.find(s => s.atomId === practice.atomId);
        if (matchedInsight) {
          const KBE_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;
          fetch(`${KBE_BASE}/form/kbe-believing-nudge`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              userId,
              insightId: matchedInsight.id,
              practiceId: practice.id,
              protocol: practice.protocol,
              pillar: practice.pillar,
              durationMs: Date.now() - practiceStartRef.current,
            }),
          })
            .then(() => {
              console.log(`[FORM→MAP] Believing nudged for insight: ${matchedInsight.id} via practice: ${practice.id}`);
            })
            .catch(err => {
              console.error('[FORM→MAP] Believing nudge failed:', err);
            });
        }

        onResolve?.();
      }, WASH_DURATION);
      return;
    }

    setPhase('transitioning');
    setStepVisible(false);
    setSchemaDepth(0);
    setHoldProgress(0);
    setPulseIntensity(0);
    hapticTick();

    setTimeout(() => {
      setStepIndex(nextIndex);
      setPhase('active');
      setTimeout(() => setStepVisible(true), 200);
    }, (STEP_FADE_OUT + STEP_GAP) * 1000);
  }, [phase, stepIndex, totalSteps, onResolve, practice]);

  // ─── Grounding escape ───
  const handleDoubleTap = useCallback(() => {
    if (phase !== 'active' || stepIndex === 0) return;

    setGroundingFlash(true);
    hapticThreshold();
    setStepVisible(false);
    setSchemaDepth(0);
    setHoldProgress(0);
    setPulseIntensity(0);

    setTimeout(() => {
      setStepIndex(0);
      setPhase('active');
      setTimeout(() => {
        setStepVisible(true);
        setGroundingFlash(false);
      }, 300);
    }, 600);
  }, [phase, stepIndex]);

  // ─── Pointer handlers ───
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (phase === 'sealed' || phase === 'completing' || phase === 'arriving') return;

    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      handleDoubleTap();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    holdingRef.current = true;
    holdStartRef.current = now;

    if (currentStep?.container === 'pendulation') {
      setDraggingPendulation(true);
      setPulseIntensity(0.5);
      // Initial position from pointer Y
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const relY = (e.clientY - rect.top) / rect.height;
        // Map Y to pendulation position: top = schema (1), bottom = anchor (0)
        const pos = Math.max(0, Math.min(1, 1 - relY));
        setPendulationPos(pos);
        setHoldProgress(pos);
        setPulseIntensity(0.3 + (1 - pos) * 0.7);
      }
    }
  }, [phase, currentStep?.container, handleDoubleTap]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!holdingRef.current || currentStep?.container !== 'pendulation') return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const relY = (e.clientY - rect.top) / rect.height;
    // Map Y to pendulation position: top = schema (1), bottom = anchor (0)
    const pos = Math.max(0, Math.min(1, 1 - relY));
    setPendulationPos(pos);
    setHoldProgress(pos);
    setPulseIntensity(0.3 + (1 - pos) * 0.7);

    // Haptic feedback at zone boundaries
    const prevPos = pendulationPos;
    if (prevPos < 0.3 && pos >= 0.3) hapticTick();
    if (prevPos < 0.7 && pos >= 0.7) hapticThreshold();
    if (prevPos > 0.7 && pos <= 0.7) hapticTick();
    if (prevPos > 0.3 && pos <= 0.3) hapticThreshold();
  }, [currentStep?.container, pendulationPos]);

  const handlePointerUp = useCallback(() => {
    if (!holdingRef.current) return;
    holdingRef.current = false;

    if (currentStep?.container === 'pendulation') {
      setDraggingPendulation(false);
      // Spring back to anchor zone (safety)
      setPendulationPos(0);
      setPulseIntensity(0);
      setHoldProgress(0);
      // If user dragged high enough (into schema zone) and released, that counts as one oscillation
      if (pendulationPos > 0.6) {
        hapticResolve();
      }
    }
  }, [currentStep?.container, pendulationPos]);

  // ─── Hold physics loop ───
  useEffect(() => {
    if (phase !== 'active') return;

    const loop = () => {
      if (holdingRef.current) {
        const elapsed = Date.now() - holdStartRef.current;
        const progress = Math.min(1, elapsed / 3000);

        // Pendulation is now drag-based — skip the old hold logic
        if (currentStep?.container === 'defusion' || currentStep?.container === 'titration') {
          setSchemaDepth(Math.min(1, progress));
          if (progress > 0.5 && progress < 0.52) hapticThreshold();
          if (progress >= 1) {
            hapticResolve();
            holdingRef.current = false;
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, currentStep?.container]);

  // ─── Tap advance ───
  const handleTap = useCallback(() => {
    if (phase !== 'active') return;
    const c = currentStep?.container;
    if (c === 'resource' || c === 'wash') advanceStep();
    if (c === 'titration') advanceStep();
    if (c === 'defusion' && schemaDepth > 0.8) advanceStep();
    if (c === 'pendulation' && holdProgress === 0 && !holdingRef.current) advanceStep();
  }, [phase, currentStep?.container, schemaDepth, holdProgress, advanceStep]);

  // ─── Atom modulation ───
  const containerForModulation = currentStep?.container || 'resource';
  const atomMod = useMemo(
    () => getAtomModulation(containerForModulation, holdProgress, schemaDepth, washProgress),
    [containerForModulation, holdProgress, schemaDepth, washProgress],
  );

  // Modulated breath for atom
  const modulatedBreath = breath * atomMod.breathMultiplier;

  // Noop callbacks for atom
  const noop = useCallback(() => {}, []);
  const noopState = useCallback((_v: number) => {}, []);

  // Atom element with modulated props
  const atomElement = AtomComponent ? (
    <Suspense fallback={null}>
      <AtomComponent
        breathAmplitude={modulatedBreath}
        reducedMotion={false}
        color={atomMeta?.color || signal.neutral}
        accentColor={atomMeta?.accentColor || signal.neutralLight}
        viewport={viewport}
        phase={atomMod.phase}
        onHaptic={noop}
        onStateChange={noopState}
        onResolve={noop}
      />
    </Suspense>
  ) : null;

  // ─── Derived states ───
  const isWashing = phase === 'completing';
  const isSealed = phase === 'sealed';
  const showArrival = phase === 'arriving' && !arrived;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={{ touchAction: 'none', cursor: 'default' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={handleTap}
    >
      {/* ══ BACKGROUND ══ */}
      <div className="absolute inset-0" style={{ background: room.void }} />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 55% 45% at 50% 42%, ${currentContainer.colorTint.replace('0.5)', '0.03)')} 0%, transparent 70%)`,
          transition: timing.t.atmosphereEase,
        }}
      />

      {/* ═══ ATOM CANVAS — z:1 — MODULATED ═══ */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: layer.base,
          opacity: atomMod.canvasOpacity,
          filter: atomMod.canvasFilter,
          transition: timing.t.fadeFilterEmerge,
        }}
      >
        {atomElement}
      </div>

      {/* ═══ WASH CANVAS — z:1.5 — above atom, below copy ═══ */}
      {(isWashing || washProgress > 0) && (
        <div style={{ position: 'absolute', inset: 0, zIndex: layer.content }}>
          <WashCanvas
            width={viewport.width}
            height={viewport.height}
            color={CONTAINERS.wash.colorTint}
            progress={washProgress}
            breath={breath}
            active={isWashing}
          />
        </div>
      )}

      {/* ═══ BILATERAL NODE — z:2.5 — during bilateral-processing titration ═══ */}
      {practice.protocol === 'bilateral-processing' &&
       currentStep?.container === 'titration' &&
       stepVisible && (
        <div style={{ position: 'absolute', inset: 0, zIndex: layer.content }}>
          <BilateralNode
            width={viewport.width}
            height={viewport.height}
            color={atomMeta?.color || mode.color}
            breath={breath}
            active={true}
            onReversal={() => hapticTick()}
          />
        </div>
      )}

      {/* ═══ PENDULATION ZONE — z:2.5 — during pendulation container ═══ */}
      {currentStep?.container === 'pendulation' && stepVisible && (
        <div style={{ position: 'absolute', inset: 0, zIndex: layer.content }}>
          <PendulationZone
            width={viewport.width}
            height={viewport.height}
            position={pendulationPos}
            schemaColor={CONTAINERS.titration.colorTint}
            anchorColor={CONTAINERS.resource.colorTint}
            breath={breath}
            dragging={draggingPendulation}
            active={true}
          />
        </div>
      )}

      {/* ═══ BREATH VOLUME — z:2.5 — active resource entrainment ═══ */}
      {practice.useBreathVolume && currentStep?.container === 'resource' && stepVisible && (
        <div style={{ position: 'absolute', inset: 0, zIndex: layer.content }}>
          <BreathVolume
            width={viewport.width}
            height={viewport.height}
            color={CONTAINERS.resource.colorTint}
            breath={breath}
            active={true}
          />
        </div>
      )}

      {/* ═══ BOUNDARY FIELD — z:2.5 — Shield pillar pendulation ═══ */}
      {practice.useBoundaryField && currentStep?.container === 'pendulation' && stepVisible && (
        <div style={{ position: 'absolute', inset: 0, zIndex: layer.content }}>
          <BoundaryField
            width={viewport.width}
            height={viewport.height}
            color={atomMeta?.color || mode.color}
            breath={breath}
            active={true}
          />
        </div>
      )}

      {/* ═══ CLINICAL LAYER — z:3 ═══ */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: layer.raised,
          pointerEvents: 'none',
        }}
      >
        {/* Somatic Compass — three calibration dots, always available */}
        {!practiceOverride && !handoffPractice && (
          <div style={{ pointerEvents: 'auto' }}>
            <FormCalibration
              calibration={calibration}
              breath={breath}
              onCalibrationChange={setCalibration}
            />
          </div>
        )}

        {/* Resource pulse */}
        <ResourcePulse
          color={mode.color}
          breath={breath}
          active={phase === 'active' || phase === 'transitioning'}
          intensity={pulseIntensity}
        />

        {/* Container indicator */}
        {currentStep && (
          <ContainerIndicator
            container={currentStep.container}
            visible={stepVisible}
          />
        )}

        {/* Arrival canopy */}
        <AnimatePresence>
          {showArrival && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
            >
              <div className="flex flex-col items-center gap-4">
                <span style={{ ...TYPOGRAPHY.eyebrow, color: mode.color, opacity: opacity.present }}>
                  FORM
                </span>
                <p style={{
                  ...TYPOGRAPHY.description,
                  color: room.fg, opacity: opacity.gentle,
                  textAlign: 'center', maxWidth: 240,
                }}>
                  {mode.canopy}
                </p>

                {/* SYNC → FORM recommendation whisper */}
                {handoffReason && handoffPractice && (
                  <motion.div
                    className="flex flex-col items-center gap-2 mt-2"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span style={{
                      fontFamily: SERIF,
                      fontSize: typeSize.detail,
                      fontWeight: weight.light,
                      fontStyle: 'italic',
                      color: room.fg,
                      opacity: opacity.quiet,
                      textAlign: 'center',
                      maxWidth: '65vw',
                      lineHeight: leading.body,
                    }}>
                      {handoffReason}
                    </span>
                    <span style={{
                      fontFamily: SANS,
                      fontSize: typeSize.trace,
                      fontWeight: weight.medium,
                      letterSpacing: tracking.normal,
                      textTransform: 'uppercase',
                      color: mode.color,
                      opacity: opacity.trace,
                    }}>
                      RECOMMENDED
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active step copy */}
        {currentStep && phase !== 'arriving' && !isSealed && (
          <StepCopy
            step={currentStep}
            container={currentContainer}
            visible={stepVisible && !isWashing}
            schemaDepth={schemaDepth}
            holdProgress={holdProgress}
          />
        )}

        {/* Defusion: schema ghost in background */}
        {currentStep?.container === 'defusion' && schemaDepth > 0.3 && (
          <div
            className="absolute"
            style={{
              top: '50%', left: 0, right: 0,
              transform: `translateY(-50%) scale(${0.85 - schemaDepth * 0.1})`,
              textAlign: 'center', padding: '0 12%',
              filter: `blur(${3 + schemaDepth * 5}px)`,
              opacity: opacity.flicker + (1 - schemaDepth) * opacity.ghost,
              transition: timing.t.easeAtmosphere,
              pointerEvents: 'none', userSelect: 'none',
            }}
          >
            <p style={{
              fontFamily: SERIF,
              fontSize: 'clamp(13px, 3.2vw, 17px)',
              fontWeight: weight.light, color: room.fg, margin: 0,
            }}>
              {practice.schema}
            </p>
          </div>
        )}

        {/* Wash text — emerges during the canvas sweep */}
        <AnimatePresence>
          {isWashing && washProgress > 0.2 && washProgress < 0.9 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: opacity.body, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <p style={{
                fontFamily: SERIF,
                fontSize: 'clamp(14px, 3.5vw, 20px)',
                fontWeight: weight.light, fontStyle: 'italic',
                letterSpacing: tracking.data, lineHeight: leading.body,
                color: room.fg, textAlign: 'center', maxWidth: '70%',
              }}>
                {practice.steps[practice.steps.length - 1]?.copy || ''}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sealed state */}
        <AnimatePresence>
          {isSealed && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className="rounded-full"
                  style={{
                    width: 4, height: 4, background: mode.color,
                    boxShadow: glow.halo(mode.color),
                  }}
                />
                <span style={{
                  fontFamily: SERIF, fontSize: typeSize.small,
                  fontWeight: weight.light, fontStyle: 'italic',
                  color: room.fg, opacity: opacity.gentle,
                }}>
                  The work is done.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step progress */}
        {phase === 'active' && !isWashing && !isSealed && (
          <StepProgress
            currentIndex={stepIndex}
            totalSteps={totalSteps}
            containerColor={currentContainer.colorTint.replace('0.5)', '0.4)')}
          />
        )}

        {/* Advance hint */}
        {phase === 'active' && stepVisible && !isWashing && !isSealed && (
          <AdvanceHint
            container={currentStep?.container || 'resource'}
            schemaDepth={schemaDepth}
          />
        )}
      </div>

      {/* Grounding flash */}
      <GroundingFlash visible={groundingFlash} />

      {/* ═══ RESILIENCE WHISPER ═══ */}
      <ResilienceWhisper posture={resilience.posture} breath={breath} runtimeName="form" />

      {/* Orb clearance */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: ORB_CLEARANCE,
          background: `linear-gradient(to top, ${void_.haze} 0%, transparent 100%)`,
          zIndex: layer.overlay, pointerEvents: 'none',
          transition: timing.t.settle,
        }}
      />
    </div>
  );
}