/**
 * CUE ENGINE — Only Now
 *
 * The CUE Engine is the Universal Player's home state.
 * There is no progress. No count. No destination.
 * Only this atom. Only this breath. Only now.
 *
 * ═══════════════════════════════════════════════════════
 * LIFECYCLE — Four phases.
 * ═══════════════════════════════════════════════════════
 *
 *   ARRIVE  (600ms)  → Atom enters. Canopy appears.
 *   LIVE    (varies) → Body interacts. Gesture breathes.
 *   SEAL    (2.5s)   → Receipt stamps the moment.
 *   CROSS   (400ms)  → Dissolve. Next CUE arrives.
 *
 * ═══════════════════════════════════════════════════════
 * NO CHROME — Lives inside GlassSurface
 * ═══════════════════════════════════════════════════════
 *
 * CueEngine is a content layer. It renders absolute inset-0
 * inside whatever glass contains it. The glass provides the
 * device chrome, base atmosphere, vignette, sheen.
 *
 * CueEngine adds its own atom-tinted atmosphere on top —
 * a radial glow that shifts color with each CUE.
 *
 * ═══════════════════════════════════════════════════════
 * NO PROGRESS — There is no time here.
 * ═══════════════════════════════════════════════════════
 *
 * No bars. No dots. No rings. No counts.
 * Each CUE is complete in itself. The sequence is infinite.
 * You are not going somewhere. You are here.
 */

import { useState, useRef, useEffect, useCallback, lazy, Suspense } from 'react';
import type { LazyExoticComponent, ComponentType } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { AtomProps } from '../atoms/types';
import { CUE_SEQUENCE, getNextCue } from './cue-library';
import { getAtomById } from '../atoms/atom-registry';
import {
  getAtomTreatment,
  getTreatmentTypography,
  getTreatmentLayout,
} from './voice-treatments';
import {
  room, glow,
} from '../design-system/surface-tokens';

// ─── Lazy atoms ───

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

type Phase = 'arrive' | 'live' | 'seal' | 'cross';

const ARRIVE_MS = 600;
const SEAL_MS   = 2500;
const CROSS_MS  = 400;

// ═══════════════════════════════════════════════════════
// CUE ENGINE — content layer
// ═══════════════════════════════════════════════════════

interface CueEngineProps {
  /** Breath amplitude from the glass (0–1) */
  breath: number;
  /** Called when the current atom's color changes — lets the glass atmosphere respond */
  onAtomColorChange?: (color: string, accentColor: string) => void;
}

export function CueEngine({ breath, onAtomColorChange }: CueEngineProps) {
  const [cueIndex, setCueIndex]   = useState(0);
  const [phase, setPhase]         = useState<Phase>('arrive');
  const [sealPulse, setSealPulse] = useState(0);
  const [viewport, setViewport]   = useState({ w: 368, h: 656 });

  const mountedRef   = useRef(true);
  const timerRef     = useRef<ReturnType<typeof setTimeout>>();
  const rafRef       = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const liveStartRef = useRef(0);
  const phaseRef     = useRef<Phase>(phase);
  phaseRef.current = phase;

  const cue = CUE_SEQUENCE[cueIndex];
  const AtomComponent = atomComponents[cue.atomId];
  const atomMeta = getAtomById(cue.atomId);
  const atomColor = atomMeta?.color ?? '#5A46B4';
  const atomAccent = atomMeta?.accentColor ?? '#C8D2FF';

  // ── Voice treatment for this atom ──
  const treatment = getAtomTreatment(cue.atomId);
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

  // ── Cleanup ──
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; clearTimeout(timerRef.current); cancelAnimationFrame(rafRef.current!); };
  }, []);

  // ═══════════════════════════════════════════════════
  // PHASE MACHINE
  // ═══════════════════════════════════════════════════

  useEffect(() => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current!);

    if (phase === 'arrive') {
      setSealPulse(0);
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) setPhase('live');
      }, ARRIVE_MS);

    } else if (phase === 'live') {
      // Universal timer — every CUE has a duration.
      // onResolve is always an accelerator, never a requirement.
      liveStartRef.current = performance.now();
      timerRef.current = setTimeout(() => {
        if (mountedRef.current && phaseRef.current === 'live') setPhase('seal');
      }, cue.durationMs);

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
        if (mountedRef.current) setPhase('cross');
      }, SEAL_MS);

    } else if (phase === 'cross') {
      timerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        const { index } = getNextCue(cueIndex);
        setCueIndex(index);
        setPhase('arrive');
      }, CROSS_MS);
    }

    return () => { clearTimeout(timerRef.current); cancelAnimationFrame(rafRef.current!); };
  }, [phase, cueIndex]);

  // ═══════════════════════════════════════════════════
  // CALLBACKS
  // ═══════════════════════════════════════════════════

  /** Atom fires onResolve → early seal */
  const handleAtomResolve = useCallback(() => {
    if (phaseRef.current !== 'live') return;
    clearTimeout(timerRef.current);
    setPhase('seal');
  }, []);

  /** Tap during seal → advance */
  const handleSealTap = useCallback(() => {
    if (phaseRef.current !== 'seal') return;
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current!);
    setPhase('cross');
  }, []);

  // ── Atom phase ──
  const atomPhase: AtomProps['phase'] =
    phase === 'arrive' ? 'enter' :
    phase === 'seal' || phase === 'cross' ? 'resolve' :
    'active';

  // ── Gesture breathes with you ──
  const gesturePulse = phase === 'live'
    ? 0.12 + 0.18 * Math.max(0, Math.sin((breath - 0.3) * Math.PI / 0.5))
    : 0.45;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">

      {/* ── Atom-tinted atmosphere ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 65% 55% at 50% 45%, ${atomColor}${Math.round((0.04 + breath * 0.06 + sealPulse * 0.15) * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
        }}
      />

      {/* ═══════════════════════════════════════
          ATOM
          ═══════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cueIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'cross' ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: phase === 'cross' ? 0.35 : 0.6, ease: [0.16, 1, 0.3, 1] }}
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
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          CANOPY — emotional orientation
          ═══════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {(phase === 'arrive' || phase === 'live') && (
          <motion.p
            key={`canopy-${cueIndex}`}
            initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
            animate={{
              opacity: phase === 'live' ? 0.035 : 0.32,
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
            {cue.canopy}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          GESTURE — somatic instruction (breathes)
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {(phase === 'arrive' || phase === 'live') && (
          <motion.div
            key={`gesture-${cueIndex}`}
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
                {cue.gesture}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          SEAL — receipt
          ═══════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {phase === 'seal' && (
          <motion.div
            key={`seal-${cueIndex}`}
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
                  {cue.receipt}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cross dissolve ── */}
      <AnimatePresence>
        {phase === 'cross' && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ background: room.void, zIndex: 20 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}