/**
 * COMPOSITION ENGINE — The Multi-Beat Player
 *
 * Where CueEngine plays single PULSEs in infinite loop,
 * CompositionEngine plays a complete Composition:
 * TWINs (2 beats), TRIs (3 beats), ARCs (4+ beats).
 *
 * ═══════════════════════════════════════════════════════
 * BEAT LIFECYCLE — Five phases per beat
 * ═══════════════════════════════════════════════════════
 *
 *   ARRIVE   (800ms)   → Atom enters. Canopy appears.
 *   LIVE     (varies)  → Body interacts. Capture overlay may open.
 *   SEAL     (2s)      → Receipt stamps the moment.
 *   TRANSIT  (varies)  → Beat transition (snap/flow/breathe).
 *   → next beat or COMPLETE
 *
 * ═══════════════════════════════════════════════════════
 * CAPTURE ARCHITECTURE
 * ═══════════════════════════════════════════════════════
 *
 * During LIVE phase, if the beat has an overlay capture mode,
 * the CaptureOverlay fades in after the canopy settles.
 * The timer always runs. A declined invitation is valid signal.
 * onCapture → early seal. Timer expiry → seal with null result.
 *
 * ═══════════════════════════════════════════════════════
 * TRANSITION TYPES — Three species
 * ═══════════════════════════════════════════════════════
 *
 *   snap      (200ms)  → Hard cut. TWINs. Contrast.
 *   flow      (600ms)  → Cross-fade. TRIs. Continuity.
 *   breathe   (1200ms) → Slow bloom. ARCs. The room turns.
 *
 * ═══════════════════════════════════════════════════════
 * SESSION RECORD
 * ═══════════════════════════════════════════════════════
 *
 * The engine collects CaptureResult[] across all beats.
 * On completion, it emits the full session record.
 * The clinical engine reads this to update the user's
 * signal profile without ever feeling like data collection.
 */

import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import type { LazyExoticComponent, ComponentType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { AtomProps } from '../atoms/types';
import type {
  Composition,
  Beat,
  CaptureResult,
  TransitionType,
} from './composition-types';
import { isOverlayCapture, TRANSITION_META, type OverlayCaptureMode } from './composition-types';
import { getAtomById } from '../atoms/atom-registry';
import { CaptureOverlay } from './CaptureOverlays';
import {
  getAtomTreatment,
  getTreatmentTypography,
  getTreatmentLayout,
} from './voice-treatments';
import {
  room, font, typeSize, weight,
  opacity, timing, glow, void_,
} from '../design-system/surface-tokens';

// ─── Lazy atoms (same registry as CueEngine) ───

const atomComponents: Record<string, LazyExoticComponent<ComponentType<AtomProps>>> = {
  'somatic-resonance': lazy(() => import('../atoms/somatic-resonance')),
  'wave-collapse':     lazy(() => import('../atoms/wave-collapse')),
  'dark-matter':       lazy(() => import('../atoms/dark-matter')),
  'mycelial-routing':  lazy(() => import('../atoms/mycelial-routing')),
  'phoenix-ash':       lazy(() => import('../atoms/phoenix-ash')),
  'cymatic-coherence': lazy(() => import('../atoms/cymatic-coherence')),
  'future-memory':     lazy(() => import('../atoms/future-memory')),
  'still-point':       lazy(() => import('../atoms/still-point')),
  'tidal-breath':      lazy(() => import('../atoms/tidal-breath')),
  'weight-release':    lazy(() => import('../atoms/weight-release')),
  'signal-fire':       lazy(() => import('../atoms/signal-fire')),
  'dissolve':          lazy(() => import('../atoms/dissolve')),
  'ember-grid':        lazy(() => import('../atoms/ember-grid')),
  'pendulum-rest':     lazy(() => import('../atoms/pendulum-rest')),
  'mirror-breath':     lazy(() => import('../atoms/mirror-breath')),
  'root-pulse':        lazy(() => import('../atoms/root-pulse')),
  'threshold':         lazy(() => import('../atoms/threshold')),
};

// ─── Phase ───

type BeatPhase = 'arrive' | 'live' | 'seal' | 'transit' | 'complete';

const ARRIVE_MS  = 800;
const SEAL_MS    = 2000;

/** Get transition duration from type */
function getTransitMs(type?: TransitionType): number {
  if (!type) return 150; // default snap
  const meta = TRANSITION_META.find(t => t.type === type);
  return meta?.durationMs ?? 150;
}

// ─── Session Record ───

export interface CompositionSessionRecord {
  compositionId: string;
  compositionType: Composition['type'];
  startedAt: number;
  completedAt: number;
  captures: CaptureResult[];
  /** Whether the person completed all beats or exited early */
  completedFully: boolean;
}

// ═══════════════════════════════════════════════════════
// COMPOSITION ENGINE
// ═══════════════════════════════════════════════════════

interface CompositionEngineProps {
  /** The composition to play */
  composition: Composition;
  /** Breath amplitude from the glass (0–1) */
  breath: number;
  /** Called when the current atom's color changes */
  onAtomColorChange?: (color: string, accentColor: string) => void;
  /** Called when the full composition completes */
  onComplete?: (record: CompositionSessionRecord) => void;
  /** Called when the person exits early (not yet wired — requires exit gesture from universal player) */
  onExit?: (record: CompositionSessionRecord) => void;
}

export function CompositionEngine({
  composition,
  breath,
  onAtomColorChange,
  onComplete,
  onExit,
}: CompositionEngineProps) {
  const [beatIndex, setBeatIndex]         = useState(0);
  const [phase, setPhase]                 = useState<BeatPhase>('arrive');
  const [sealPulse, setSealPulse]         = useState(0);
  const [showCapture, setShowCapture]     = useState(false);
  const [viewport, setViewport]           = useState({ w: 368, h: 656 });

  const mountedRef       = useRef(true);
  const timerRef         = useRef<ReturnType<typeof setTimeout>>();
  const mainTimerRef     = useRef<ReturnType<typeof setTimeout>>();
  const rafRef           = useRef<number>();
  const containerRef     = useRef<HTMLDivElement>(null);
  const phaseRef         = useRef<BeatPhase>(phase);
  const captureResults   = useRef<CaptureResult[]>([]);
  const startedAtRef     = useRef(Date.now());
  const capturedThisBeat = useRef(false);

  phaseRef.current = phase;

  // ── Current beat ──
  const beat = composition.beats[beatIndex];
  const isLastBeat = beatIndex === composition.beats.length - 1;
  const AtomComponent = atomComponents[beat.atomId];
  const atomMeta = getAtomById(beat.atomId);
  const atomColor = atomMeta?.color ?? '#5A46B4';
  const atomAccent = atomMeta?.accentColor ?? '#C8D2FF';
  const captureMode = beat.capture ?? 'none';
  const hasOverlayCapture = isOverlayCapture(captureMode);

  // ── Voice treatment for this atom ──
  const treatment = getAtomTreatment(beat.atomId);
  const typo = getTreatmentTypography(treatment);
  const layout = getTreatmentLayout(treatment);

  // ── Report color to parent glass ──
  useEffect(() => {
    onAtomColorChange?.(atomColor, atomAccent);
  }, [atomColor, atomAccent, onAtomColorChange]);

  // ── Measure container ──
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setViewport({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Lifecycle: mount, cleanup, and reset on composition change ──
  useEffect(() => {
    mountedRef.current = true;
    startedAtRef.current = Date.now();
    captureResults.current = [];
    setBeatIndex(0);
    setPhase('arrive');
    setSealPulse(0);
    setShowCapture(false);
    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
      clearTimeout(mainTimerRef.current);
      cancelAnimationFrame(rafRef.current!);
    };
  }, [composition.id]);

  // ═══════════════════════════════════════════════════
  // BUILD SESSION RECORD
  // ═══════════════════════════════════════════════════

  const buildRecord = useCallback((full: boolean): CompositionSessionRecord => ({
    compositionId: composition.id,
    compositionType: composition.type,
    startedAt: startedAtRef.current,
    completedAt: Date.now(),
    captures: [...captureResults.current],
    completedFully: full,
  }), [composition.id, composition.type]);

  // ═══════════════════════════════════════════════════
  // PHASE MACHINE
  // ═══════════════════════════════════════════════════

  useEffect(() => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current!);

    if (phase === 'arrive') {
      setSealPulse(0);
      setShowCapture(false);
      capturedThisBeat.current = false;

      timerRef.current = setTimeout(() => {
        if (mountedRef.current) setPhase('live');
      }, ARRIVE_MS);

    } else if (phase === 'live') {
      // Show capture overlay after canopy settles (if overlay capture)
      if (hasOverlayCapture) {
        timerRef.current = setTimeout(() => {
          if (mountedRef.current && phaseRef.current === 'live') {
            setShowCapture(true);
          }
        }, 1200); // 1.2s delay — let the canopy land first
      }

      // Main duration timer — always runs
      mainTimerRef.current = setTimeout(() => {
        if (mountedRef.current && phaseRef.current === 'live') {
          // Timer expired — capture was declined if overlay was showing
          if (hasOverlayCapture && !capturedThisBeat.current) {
            // Record declined capture
            const declinedResult = buildDeclinedResult(captureMode, beat);
            captureResults.current.push(declinedResult);
          } else if (!hasOverlayCapture && captureMode !== 'none') {
            // Ambient capture (gesture) — record the interaction
            captureResults.current.push({
              mode: 'gesture',
              atomId: beat.atomId,
              durationMs: beat.durationMs,
            });
          } else if (captureMode === 'none') {
            captureResults.current.push({ mode: 'none' });
          }

          setShowCapture(false);
          setPhase('seal');
        }
      }, beat.durationMs);

      return () => { clearTimeout(mainTimerRef.current); clearTimeout(timerRef.current); };

    } else if (phase === 'seal') {
      // Atmospheric pulse
      let t = 0;
      const pulseTick = () => {
        if (!mountedRef.current || phaseRef.current !== 'seal') return;
        t += 0.025;
        const v = t < 0.3 ? t / 0.3 : Math.max(0, 1 - (t - 0.3) / 0.7);
        setSealPulse(v);
        if (t < 1) rafRef.current = requestAnimationFrame(pulseTick);
      };
      rafRef.current = requestAnimationFrame(pulseTick);

      timerRef.current = setTimeout(() => {
        if (mountedRef.current) setPhase('transit');
      }, SEAL_MS);

    } else if (phase === 'transit') {
      const transitMs = getTransitMs(beat.transitionOut);

      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;

        if (isLastBeat) {
          // Composition complete
          setPhase('complete');
          onComplete?.(buildRecord(true));
        } else {
          // Advance to next beat
          setBeatIndex(prev => prev + 1);
          setPhase('arrive');
        }
      }, transitMs);

    }
    // 'complete' — no timer, composition is done

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(mainTimerRef.current);
      cancelAnimationFrame(rafRef.current!);
    };
  }, [phase, beatIndex, composition.id]);

  // ═══════════════════════════════════════════════════
  // CALLBACKS
  // ═══════════════════════════════════════════════════

  /** Atom fires onResolve → early seal */
  const handleAtomResolve = useCallback(() => {
    if (phaseRef.current !== 'live') return;
    // Don't early-seal if capture overlay is active and not yet captured
    if (hasOverlayCapture && !capturedThisBeat.current) return;
    clearTimeout(timerRef.current);
    clearTimeout(mainTimerRef.current);
    setShowCapture(false);
    setPhase('seal');
  }, [hasOverlayCapture]);

  /** Capture overlay resolves */
  const handleCapture = useCallback((result: CaptureResult) => {
    if (capturedThisBeat.current) return; // prevent double capture
    capturedThisBeat.current = true;
    captureResults.current.push(result);
    setShowCapture(false);

    // After capture, let the beat continue naturally
    // The main timer will seal it, or the person can interact with the atom
  }, []);

  /** Tap during seal → advance */
  const handleSealTap = useCallback(() => {
    if (phaseRef.current !== 'seal') return;
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current!);
    setPhase('transit');
  }, []);

  // ── Atom phase ──
  const atomPhase: AtomProps['phase'] =
    phase === 'arrive' ? 'enter' :
    phase === 'seal' || phase === 'transit' || phase === 'complete' ? 'resolve' :
    'active';

  // ── Gesture breathes with you ──
  const gesturePulse = phase === 'live'
    ? 0.12 + 0.18 * Math.max(0, Math.sin((breath - 0.3) * Math.PI / 0.5))
    : 0.45;

  // ── Transition visual ──
  const transitOpacity =
    phase === 'transit'
      ? beat.transitionOut === 'breathe' ? 0.6
        : beat.transitionOut === 'flow' ? 0.8
        : 1 // snap
      : 0;

  const transitDuration =
    beat.transitionOut === 'breathe' ? 1.0
    : beat.transitionOut === 'flow' ? 0.5
    : 0.12;

  // ── Beat progress indicator (subtle) ──
  const totalBeats = composition.beats.length;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">

      {/* ── Atom-tinted atmosphere ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 65% 55% at 50% 45%, ${atomColor}${Math.round((0.04 + breath * 0.06 + sealPulse * 0.15) * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
        }}
      />

      {/* ══════════════════════════════════════
          ATOM — unmounted during complete phase to stop canvas RAF
          ═══════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {phase !== 'complete' && (
          <motion.div
            key={`beat-${beatIndex}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'transit' ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: phase === 'transit' ? transitDuration : 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {AtomComponent && (
              <Suspense fallback={null}>
                <AtomComponent
                  breathAmplitude={breath}
                  reducedMotion={false}
                  color={atomColor}
                  accentColor={atomAccent}
                  viewport={{ width: viewport.w, height: viewport.h }}
                  phase={atomPhase}
                  onHaptic={() => {}}
                  onResolve={handleAtomResolve}
                />
              </Suspense>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          CANOPY — emotional orientation
          ═══════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {(phase === 'arrive' || phase === 'live') && (
          <motion.p
            key={`canopy-${beatIndex}`}
            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            animate={{
              opacity: phase === 'live' ? (showCapture ? 0.02 : 0.035) : 0.32,
              y: 0,
              filter: 'blur(0px)',
            }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.3 } }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none select-none"
            style={{
              ...layout.canopy,
              ...typo.canopy,
              zIndex: 10,
            }}
          >
            {beat.sync.canopy}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          GESTURE — somatic instruction (breathes)
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {(phase === 'arrive' || phase === 'live') && !showCapture && (
          <motion.div
            key={`gesture-${beatIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 1.4, delay: 0.3 }}
            className="pointer-events-none select-none"
            style={{
              ...layout.gesture,
              zIndex: 10,
            }}
          >
            <div className="flex items-center gap-2" style={{ opacity: gesturePulse }}>
              <span
                className="rounded-full"
                style={{
                  width: 3, height: 3,
                  background: atomColor,
                  boxShadow: glow.soft(atomColor, '40'),
                }}
              />
              <span
                style={{
                  ...typo.gesture,
                  color: atomColor,
                }}
              >
                {beat.sync.gesture}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          CAPTURE OVERLAY — the door the glass opens
          ═══════════════════════════════════════ */}
      {hasOverlayCapture && (
        <CaptureOverlay
          mode={captureMode as OverlayCaptureMode}
          visible={showCapture}
          options={beat.captureOptions ?? {}}
          onCapture={handleCapture}
        />
      )}

      {/* ═══════════════════════════════════════
          SEAL — receipt
          ═══════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {phase === 'seal' && (
          <motion.div
            key={`seal-${beatIndex}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: 'blur(6px)', transition: { duration: 0.35 } }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 select-none"
            style={{ zIndex: 10, cursor: 'pointer' }}
            onClick={handleSealTap}
          >
            {/* Receipt — positioned by treatment layout */}
            <div
              className="pointer-events-none"
              style={layout.receipt}
            >
              <div
                className="flex flex-col gap-2"
                style={{
                  alignItems: typo.receipt.textAlign === 'right' ? 'flex-end'
                    : typo.receipt.textAlign === 'left' ? 'flex-start'
                    : 'center',
                }}
              >
                {/* Resolved particle */}
                <div
                  className="rounded-full"
                  style={{
                    width: 4, height: 4,
                    background: atomColor,
                    boxShadow: glow.halo(atomColor),
                  }}
                />
                <span style={typo.receipt}>
                  {beat.sync.receipt}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Transit dissolve ── */}
      <AnimatePresence>
        {phase === 'transit' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: transitOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: transitDuration }}
            style={{ background: room.void, zIndex: 20 }}
          />
        )}
      </AnimatePresence>

      {/* ── Beat position indicator — almost invisible ── */}
      {totalBeats > 1 && (
        <div
          className="absolute flex gap-1 justify-center"
          style={{
            bottom: 8,
            left: 0,
            right: 0,
            zIndex: 15,
            pointerEvents: 'none',
          }}
        >
          {composition.beats.map((_, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 3,
                height: 3,
                background: i === beatIndex ? atomColor : room.fg,
                opacity: i === beatIndex ? opacity.spoken : opacity.whisper,
                transition: timing.t.settle,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Completion state ── */}
      <AnimatePresence>
        {phase === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              zIndex: 25,
              background: `linear-gradient(180deg, transparent 0%, ${void_.shade} 50%, ${void_.deep} 100%)`,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="rounded-full"
                style={{
                  width: 4,
                  height: 4,
                  background: atomColor,
                  boxShadow: glow.halo(atomColor),
                }}
              />
              <span
                style={{
                  fontFamily: font.serif,
                  fontSize: typeSize.small,
                  fontWeight: weight.light,
                  fontStyle: 'italic',
                  color: room.fg,
                  opacity: opacity.spoken,
                }}
              >
                {composition.essence}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Utility: build a declined CaptureResult for timed-out overlays ───

function buildDeclinedResult(mode: string, beat: Beat): CaptureResult {
  switch (mode) {
    case 'binary':
      return {
        mode: 'binary',
        chosen: null,
        options: (beat.captureOptions?.options ?? ['this', 'that']) as [string, string],
      };
    case 'select':
      return {
        mode: 'select',
        chosen: [],
        options: beat.captureOptions?.options ?? [],
      };
    case 'whisper':
      return { mode: 'whisper', text: null };
    case 'thought':
      return { mode: 'thought', text: null, durationMs: 0 };
    case 'voice':
      return { mode: 'voice', durationMs: 0, declined: true };
    default:
      return { mode: 'none' };
  }
}