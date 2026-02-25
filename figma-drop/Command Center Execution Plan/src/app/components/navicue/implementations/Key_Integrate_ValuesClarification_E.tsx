/**
 * Key x Values Clarification x Embodying
 * Magic Signature: koan_paradox
 *
 * THE PARADOX
 * "If you already knew, what would change?"
 *
 * NEUROSCIENCE: Values aren't stored in a single brain region.
 * They're distributed across the ventromedial prefrontal cortex
 * (self-relevance), the anterior insula (body-based knowing),
 * and the dorsolateral prefrontal cortex (deliberate choice).
 * Values clarification works not by finding the "right" answer
 * but by making the neural competition VISIBLE. The tension
 * between competing values is where wisdom lives.
 *
 * PHILOSOPHY:
 * Alan Watts: "The meaning of life is just to be alive. It is so
 * plain and so obvious and so simple. And yet, everybody rushes
 * around in a great panic as if it were necessary to achieve
 * something beyond themselves."
 * Ram Dass: "We're all just walking each other home."
 *
 * INTERACTION: Two values appear. Neither is highlighted.
 * Neither is "correct." The user touches one. It doesn't win.
 * Instead, it reveals a deeper question. Either path leads to
 * the same insight: values compete. Living them requires
 * sacrifice. The tension IS the practice.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: avoiding values conflict, staying vague
 * 2. Different action possible: name the tension, choose
 * 3. Action executed: touching one reveals what it costs
 * 4. Evidence: the paradox resolves into something richer
 * 5. Repeated: values become lived practice, not abstract ideals
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces, spacing } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

const palette = {
  base: surfaces.solid.base,
  sienna: 'hsla(20, 50%, 50%, 1)',
  siennaGlow: 'hsla(20, 50%, 50%, 0.25)',
  siennaFaint: 'hsla(20, 50%, 50%, 0.06)',
  copper: 'hsla(25, 60%, 52%, 1)',
  copperGlow: 'hsla(25, 60%, 52%, 0.2)',
  terra: 'hsla(15, 55%, 55%, 1)',
  text: 'hsla(25, 20%, 85%, 0.85)',
  textFaint: 'hsla(25, 20%, 85%, 0.35)',
};

interface ValuesTension {
  left: string;
  right: string;
  leftReveal: string;
  rightReveal: string;
  resolution: string;
}

const TENSIONS: ValuesTension[] = [
  {
    left: 'Safety',
    right: 'Meaning',
    leftReveal: 'And what does safety cost you?',
    rightReveal: 'And what does meaning demand of you?',
    resolution: 'Courage',
  },
  {
    left: 'Connection',
    right: 'Autonomy',
    leftReveal: 'What do you hide to stay close?',
    rightReveal: 'What do you lose by standing alone?',
    resolution: 'Integrity',
  },
  {
    left: 'Certainty',
    right: 'Growth',
    leftReveal: 'What do you refuse to feel to stay sure?',
    rightReveal: 'What do you sacrifice for the unknown?',
    resolution: 'Trust',
  },
];

type Stage = 'arriving' | 'tension' | 'revealed' | 'resolving' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Key_Integrate_ValuesClarification_E({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [tensionIdx, setTensionIdx] = useState(0);
  const [chosen, setChosen] = useState<'left' | 'right' | null>(null);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  const tension = TENSIONS[tensionIdx];

  // ── Arrival ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setStage('tension'), 3200);
    return () => { clearTimeout(t); timersRef.current.forEach(clearTimeout); };
  }, []);

  // ── Choose a side ─────────────────────────────────────────────
  const handleChoose = (side: 'left' | 'right') => {
    if (stage !== 'tension') return;
    setChosen(side);
    setStage('revealed');

    // After the reveal sits, move to resolution
    safeTimeout(() => {
      setStage('resolving');

      // Then afterglow
      safeTimeout(() => {
        setStage('afterglow');
        onComplete?.();
      }, 5000);
    }, 4000);
  };

  // ── Ambient elements ──────────────────────────────────────────
  const embers = useRef(
    Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 40,
      size: 1 + Math.random() * 2,
      duration: 5 + Math.random() * 6,
      delay: Math.random() * 4,
      offsetX: (Math.random() - 0.5) * 60,
    }))
  ).current;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      style={{
        width: '100%',
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 45%, ${palette.siennaFaint}, ${palette.base} 75%)`,
        fontFamily: fonts.primary,
        cursor: 'default',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Ember particles ──────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {embers.map(e => (
          <motion.div
            key={e.id}
            animate={{
              y: [0, -50, -100],
              x: [0, e.offsetX],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: e.duration,
              repeat: Infinity,
              delay: e.delay,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              left: `${e.x}%`,
              top: `${e.y}%`,
              width: `${e.size}px`,
              height: `${e.size}px`,
              borderRadius: '50%',
              background: palette.copper,
            }}
          />
        ))}

        {/* Asymmetric accent line — koan energy */}
        <motion.div
          animate={{ opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 7, repeat: Infinity }}
          style={{
            position: 'absolute',
            top: '25%',
            right: '15%',
            width: '1px',
            height: '50%',
            background: `linear-gradient(180deg, transparent, ${palette.sienna}, transparent)`,
            transform: 'rotate(15deg)',
          }}
        />
      </div>

      {/* ── Central experience ───────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '640px',
          padding: spacing['2xl'],
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          {/* ── Arriving ─────────────────────────────────────────── */}
          {stage === 'arriving' && (
            <motion.div
              key="arrive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: 'center' }}
            >
              <div
                style={{
                  fontSize: navicueType.arrival.fontSize,
                  color: palette.text,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}
              >
                You already know what matters.
                <br />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 1.5, duration: 1.5 }}
                >
                  The question is what it costs.
                </motion.span>
              </div>
            </motion.div>
          )}

          {/* ── Tension — two values, asymmetric layout ──────────── */}
          {stage === 'tension' && (
            <motion.div
              key="tension"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '80px',
                minHeight: '320px',
                justifyContent: 'center',
                width: '100%',
              }}
            >
              {/* The two values — positioned with deliberate asymmetry */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: '440px',
                  position: 'relative',
                }}
              >
                {/* Left value */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  onClick={() => handleChoose('left')}
                  whileHover={{ scale: 1.03 }}
                  style={{
                    fontSize: navicueType.arrival.fontSize,
                    color: palette.text,
                    fontFamily: fonts.secondary,
                    fontWeight: 400,
                    cursor: 'pointer',
                    padding: '16px 24px',
                    borderRadius: radius.md,
                    border: `1px solid hsla(20, 50%, 50%, 0.1)`,
                    transition: 'border-color 0.3s ease',
                    letterSpacing: '0.02em',
                  }}
                >
                  {tension.left}
                </motion.div>

                {/* Tension line between */}
                <motion.div
                  animate={{
                    opacity: [0.15, 0.3, 0.15],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    left: '35%',
                    right: '35%',
                    top: '50%',
                    height: '1px',
                    background: `linear-gradient(90deg, ${palette.siennaGlow}, ${palette.copperGlow})`,
                  }}
                />

                {/* Right value */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                  onClick={() => handleChoose('right')}
                  whileHover={{ scale: 1.03 }}
                  style={{
                    fontSize: navicueType.arrival.fontSize,
                    color: palette.text,
                    fontFamily: fonts.secondary,
                    fontWeight: 400,
                    cursor: 'pointer',
                    padding: '16px 24px',
                    borderRadius: radius.md,
                    border: `1px solid hsla(20, 50%, 50%, 0.1)`,
                    transition: 'border-color 0.3s ease',
                    letterSpacing: '0.02em',
                  }}
                >
                  {tension.right}
                </motion.div>
              </div>

              {/* Provocation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                transition={{ duration: 1.5, delay: 1 }}
                style={{
                  fontSize: navicueType.hint.fontSize,
                  color: palette.textFaint,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                }}
              >
                which one is running the show right now?
              </motion.div>
            </motion.div>
          )}

          {/* ── Revealed — the deeper question ───────────────────── */}
          {stage === 'revealed' && chosen && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '48px',
                minHeight: '280px',
                justifyContent: 'center',
              }}
            >
              {/* The chosen value, dimmed */}
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0.35 }}
                transition={{ duration: 2 }}
                style={{
                  fontSize: navicueType.narrative.fontSize,
                  color: palette.text,
                  fontFamily: fonts.secondary,
                  fontWeight: 400,
                  letterSpacing: '0.05em',
                }}
              >
                {chosen === 'left' ? tension.left : tension.right}
              </motion.div>

              {/* The reveal — what it costs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: navicueType.subheading.fontSize,
                  color: palette.copper,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                {chosen === 'left' ? tension.leftReveal : tension.rightReveal}
              </motion.div>
            </motion.div>
          )}

          {/* ── Resolving — the paradox dissolves into synthesis ─── */}
          {stage === 'resolving' && (
            <motion.div
              key="resolving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.5 }}
              style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '48px',
              }}
            >
              {/* Both values merging */}
              <div style={{ position: 'relative', height: '120px', width: '300px' }}>
                <motion.div
                  initial={{ x: -60, opacity: 0.5 }}
                  animate={{ x: 0, opacity: 0.2 }}
                  transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '30%',
                    transform: 'translateX(-50%)',
                    fontSize: navicueType.narrative.fontSize,
                    color: palette.text,
                    fontFamily: fonts.secondary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tension.left}
                </motion.div>
                <motion.div
                  initial={{ x: 60, opacity: 0.5 }}
                  animate={{ x: 0, opacity: 0.2 }}
                  transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '55%',
                    transform: 'translateX(-50%)',
                    fontSize: navicueType.narrative.fontSize,
                    color: palette.text,
                    fontFamily: fonts.secondary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tension.right}
                </motion.div>

                {/* Resolution word emerging from center */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 2, delay: 2, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '40%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: navicueType.koan.fontSize,
                    color: palette.copper,
                    fontFamily: fonts.secondary,
                    fontWeight: 400,
                    letterSpacing: '0.08em',
                  }}
                >
                  {tension.resolution}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ duration: 2, delay: 3 }}
                style={{
                  fontSize: navicueType.texture.fontSize,
                  color: palette.text,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  lineHeight: 1.7,
                }}
              >
                Not one or the other.
                <br />
                The practice of holding both.
              </motion.div>
            </motion.div>
          )}

          {/* ── Afterglow ────────────────────────────────────────── */}
          {stage === 'afterglow' && (
            <motion.div
              key="afterglow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 3 }}
              style={{
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '32px',
              }}
            >
              <motion.div
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  boxShadow: [
                    `0 0 30px ${palette.siennaGlow}`,
                    `0 0 60px ${palette.siennaGlow}`,
                    `0 0 30px ${palette.siennaGlow}`,
                  ],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: palette.copper,
                }}
              />

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 2, delay: 1 }}
                style={{
                  fontSize: navicueType.afterglow.fontSize,
                  color: palette.textFaint,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  lineHeight: 1.8,
                }}
              >
                A life without contradiction
                <br />
                is a life without depth.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Accent line ──────────────────────────────────────────── */}
      <motion.div
        animate={{
          opacity: stage === 'afterglow' ? 0.4 : stage === 'resolving' ? 0.3 : 0.15,
        }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${palette.copper}, transparent)`,
        }}
      />
    </motion.div>
  );
}