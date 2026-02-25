/**
 * NOVICE COLLECTION #2
 * The Somatic Sigh
 *
 * "Nowhere to go. Nothing to be. Just this breath. And... release."
 *
 * A single sphere of liquid, diffused light that breathes.
 * The expansion is gentle. The contraction is the sigh —
 * longer, slower, with a release that the body recognizes
 * before the mind does.
 *
 * NEUROSCIENCE: The physiological sigh — a double inhale followed
 * by an extended exhale — is the fastest known voluntary mechanism
 * to shift the autonomic nervous system from sympathetic (fight/flight)
 * to parasympathetic (rest/digest). It hacks the vagus nerve directly.
 * No thinking required. The body does the rewiring.
 *
 * INTERACTION: A luminous sphere expands with the inhale and
 * contracts with the exhale. No buttons. No progress bars.
 * Just sync your breath to the light. The sphere bleeds outward
 * across cycles until you're inside the light itself.
 * Then: "Release."
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: shallow, chest-level panic breathing
 * 2. Different action possible: follow the light
 * 3. Action executed: nervous system physically downshifts
 * 4. Evidence: the exhale is longer, the shoulders drop
 * 5. Repeated: calm becomes a skill, not an accident
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import { fonts } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

// ── Derive from blueprint ─────────────────────────────────────────
const { palette, atmosphere, motion: motionConfig } =
  navicueQuickstart('sensory_cinema', 'Somatic Regulation', 'embodying', 'Practice');

// ── Custom palette overlays for the liquid light ──────────────────
// The sphere needs its own luminous quality — opal moonlight on ocean
const liquidPalette = {
  sphereCore: 'hsla(200, 35%, 75%, 0.9)',
  sphereMid: 'hsla(210, 30%, 65%, 0.5)',
  sphereEdge: 'hsla(215, 25%, 55%, 0.15)',
  sphereGlow: 'hsla(200, 35%, 70%, 0.08)',
  shimmerA: 'hsla(195, 40%, 80%, 0.3)',
  shimmerB: 'hsla(220, 30%, 70%, 0.2)',
  warmBreath: 'hsla(35, 30%, 80%, 0.15)',
};

type Stage = 'arriving' | 'breathing' | 'expanding' | 'immersed' | 'afterglow';

// Breath timing (ms)
const INHALE = 4000;
const HOLD = 1000;
const EXHALE = 6000;
const CYCLE = INHALE + HOLD + EXHALE; // 11s per cycle
const CYCLES_BEFORE_EXPAND = 3;

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Novice_SomaticSigh({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [cycleCount, setCycleCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const timersRef = useRef<number[]>([]);
  const cycleRef = useRef(0);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  // ── Breath cycle engine ─────────────────────────────────────────
  const runBreathCycle = useCallback(() => {
    // Inhale
    setBreathPhase('inhale');
    addTimer(() => {
      // Hold
      setBreathPhase('hold');
      addTimer(() => {
        // Exhale
        setBreathPhase('exhale');
        addTimer(() => {
          cycleRef.current += 1;
          setCycleCount(cycleRef.current);

          if (cycleRef.current >= CYCLES_BEFORE_EXPAND) {
            // Transition to expanding
            setStage('expanding');
            // After one more slow cycle in expanded state → immersed
            addTimer(() => {
              setStage('immersed');
              // Afterglow after dwelling in immersion
              addTimer(() => {
                setStage('afterglow');
                onComplete?.();
              }, 6000);
            }, CYCLE);
          } else {
            // Continue cycling
            runBreathCycle();
          }
        }, EXHALE);
      }, HOLD);
    }, INHALE);
  }, [onComplete]);

  // ── Stage progression ─────────────────────────────────────────
  useEffect(() => {
    // Arriving → breathing
    addTimer(() => {
      setStage('breathing');
      // Start first breath cycle after sphere materializes
      addTimer(() => runBreathCycle(), 800);
    }, 800);

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // ── Sphere scale based on breath phase ──────────────────────────
  const getTargetScale = () => {
    if (stage === 'arriving') return 0;
    if (stage === 'afterglow') return 0.15;
    if (stage === 'immersed') return 3.5;

    const baseExpansion = stage === 'expanding' ? 1.8 : 1.0;
    if (breathPhase === 'inhale') return baseExpansion * 1.0;
    if (breathPhase === 'hold') return baseExpansion * 1.0;
    if (breathPhase === 'exhale') return baseExpansion * 0.7;
    return baseExpansion * 0.7;
  };

  const getBreathDuration = () => {
    if (breathPhase === 'inhale') return INHALE / 1000;
    if (breathPhase === 'hold') return HOLD / 1000;
    if (breathPhase === 'exhale') return EXHALE / 1000;
    return 2;
  };

  // Background fill progression
  const bgOpacity = stage === 'immersed' ? 0.2 : stage === 'expanding' ? 0.1 : stage === 'afterglow' ? 0.05 : 0;

  // Whisper text
  const whispers = ['Nowhere to go.', 'Nothing to fix.', 'Just this breath.'];
  const showWhisper = stage === 'breathing' && cycleCount >= 1;
  const whisperIndex = Math.min(cycleCount - 1, whispers.length - 1);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Somatic Regulation" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      {/* ── Background glow fill (bleeds outward over cycles) ──── */}
      <motion.div
        animate={{
          opacity: bgOpacity,
        }}
        transition={{ duration: stage === 'immersed' ? 4 : 2, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(circle at 50% 50%, ${liquidPalette.sphereGlow}, ${liquidPalette.sphereMid}, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Ambient particles — very sparse, breath-like ───────── */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          animate={{
            opacity: [0, 0.08, 0],
            y: [0, -30 - i * 10, -60 - i * 15],
            x: [0, Math.sin(i * 1.3) * 15],
          }}
          transition={{
            duration: 10 + i * 3,
            repeat: Infinity,
            delay: i * 2,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            left: `${25 + i * 12}%`,
            top: `${55 + (i % 3) * 10}%`,
            width: `${1.5 + i * 0.3}px`,
            height: `${1.5 + i * 0.3}px`,
            borderRadius: '50%',
            background: palette.primary,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── The Sphere ─────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '48px',
        }}
      >
        <AnimatePresence mode="wait">
          {stage !== 'afterglow' ? (
            <motion.div
              key="sphere-container"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: stage === 'immersed' ? 0.6 : 1,
                scale: getTargetScale(),
              }}
              exit={{ opacity: 0, scale: 0.1 }}
              transition={{
                scale: {
                  duration: stage === 'arriving' ? 1.2
                    : stage === 'immersed' ? 4
                    : getBreathDuration(),
                  ease: breathPhase === 'exhale'
                    ? [0.22, 1, 0.36, 1]  // The sigh — ease out gently
                    : [0.33, 1, 0.68, 1],  // Inhale — ease in naturally
                },
                opacity: { duration: 2 },
              }}
              style={{
                width: 'clamp(140px, 35vw, 200px)',
                height: 'clamp(140px, 35vw, 200px)',
                borderRadius: '50%',
                position: 'relative',
                willChange: 'transform',
              }}
            >
              {/* Outer diffusion ring */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-30%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${liquidPalette.sphereEdge}, transparent 70%)`,
                  filter: 'blur(20px)',
                }}
              />

              {/* Mid sphere — the main body */}
              <div
                style={{
                  position: 'absolute',
                  inset: '5%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 45% 40%, ${liquidPalette.sphereCore}, ${liquidPalette.sphereMid} 50%, ${liquidPalette.sphereEdge} 80%, transparent 100%)`,
                  filter: 'blur(8px)',
                }}
              />

              {/* Inner highlight — the light source */}
              <div
                style={{
                  position: 'absolute',
                  inset: '20%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 40% 35%, ${liquidPalette.shimmerA}, transparent 60%)`,
                  filter: 'blur(4px)',
                }}
              />

              {/* Caustic shimmer — rotates slowly */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  inset: '15%',
                  borderRadius: '50%',
                  background: `conic-gradient(from 0deg, transparent 0%, ${liquidPalette.shimmerB} 15%, transparent 30%, ${liquidPalette.warmBreath} 45%, transparent 60%, ${liquidPalette.shimmerA} 75%, transparent 90%)`,
                  filter: 'blur(12px)',
                  opacity: 0.5,
                }}
              />

              {/* Core glow — warm center */}
              <motion.div
                animate={{
                  opacity: breathPhase === 'hold' ? [0.4, 0.6, 0.4] : 0.3,
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: '30%',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${liquidPalette.warmBreath}, transparent 70%)`,
                  filter: 'blur(6px)',
                }}
              />
            </motion.div>
          ) : (
            /* ── Afterglow: gathered point ─────────────────────── */
            <motion.div
              key="afterglow-point"
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '32px',
              }}
            >
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${liquidPalette.sphereCore}, ${liquidPalette.sphereMid} 60%, transparent 100%)`,
                  boxShadow: `0 0 30px ${liquidPalette.sphereGlow}`,
                  filter: 'blur(1px)',
                }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 3, delay: 1.5 }}
                style={{
                  ...navicueType.afterglow,
                  color: palette.textFaint,
                  textAlign: 'center',
                }}
              >
                Held. Peaceful.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Breath phase indicator — barely visible ───────────── */}
        {(stage === 'breathing' || stage === 'expanding') && (
          <motion.div
            key={`phase-${breathPhase}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              position: 'absolute',
              bottom: '-80px',
              ...navicueType.hint,
              color: palette.textFaint,
              letterSpacing: '0.1em',
              textTransform: 'lowercase',
            }}
          >
            {breathPhase === 'inhale' && 'breathe in'}
            {breathPhase === 'hold' && 'hold'}
            {breathPhase === 'exhale' && 'release'}
          </motion.div>
        )}

        {/* ── Immersion whisper ────────────────────────────────── */}
        <AnimatePresence>
          {stage === 'immersed' && (
            <motion.div
              key="immersed-whisper"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                ...navicueType.prompt,
                color: palette.text,
                textAlign: 'center',
                maxWidth: '260px',
              }}
            >
              Release.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Cycle whispers — appear after each breath ──────────── */}
      <AnimatePresence mode="wait">
        {showWhisper && stage === 'breathing' && (
          <motion.div
            key={`whisper-${whisperIndex}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.3, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              bottom: '15%',
              ...navicueType.texture,
              color: palette.textFaint,
              textAlign: 'center',
            }}
          >
            {whispers[whisperIndex]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom breath line ─────────────────────────────────── */}
      <motion.div
        animate={{
          scaleX: breathPhase === 'inhale' ? [0, 0.6] :
                  breathPhase === 'hold' ? 0.6 :
                  breathPhase === 'exhale' ? [0.6, 0] : 0,
          opacity: stage === 'afterglow' ? 0 : 0.15,
        }}
        transition={{
          scaleX: { duration: getBreathDuration(), ease: 'easeInOut' },
          opacity: { duration: 2 },
        }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
          transformOrigin: 'center',
          zIndex: 2,
        }}
      />
    </NaviCueShell>
  );
}