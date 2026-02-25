/**
 * NOVICE COLLECTION #8
 * The Value Compass
 *
 * "Your body already knows which way to lean."
 *
 * Two values appear — both good, both true, both yours. But which one
 * pulls harder right now? The user doesn't analyze — they feel. A subtle
 * gravity field pulls toward whichever value resonates more. The body
 * votes before the mind decides.
 *
 * NEUROSCIENCE: Somatic markers (Damasio). The ventromedial prefrontal
 * cortex stores emotional associations with past decisions. When faced
 * with a values choice, the body produces micro-signals (gut feeling,
 * chest warmth, shoulder tension) BEFORE conscious reasoning. The Value
 * Compass externalizes this invisible process — the visual gravity IS
 * the somatic marker made visible.
 *
 * INTERACTION: Two values appear on opposite sides. A floating indicator
 * sits between them. User taps the one that pulls harder. The indicator
 * drifts toward it — not a binary snap, but a gentle lean. The chosen
 * value glows. "This is what matters right now." Not forever. Right now.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: values confusion, analysis paralysis
 * 2. Different action possible: feel instead of think
 * 3. Action executed: the lean. The body's vote made visible.
 * 4. Evidence: your compass pointed somewhere. That's real.
 * 5. Repeated: values become felt directions, not abstract ideals
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts, radius } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

// ── Derive from blueprint ─────────────────────────────────────────
const { palette } =
  navicueQuickstart('sacred_ordinary', 'Values Clarification', 'embodying', 'Mirror');

type Stage = 'arriving' | 'presenting' | 'choosing' | 'leaning' | 'afterglow';

// Value pairs — both are good. The question is: which one, right now?
const VALUE_PAIRS = [
  { a: 'courage', b: 'peace' },
  { a: 'connection', b: 'solitude' },
  { a: 'honesty', b: 'kindness' },
  { a: 'growth', b: 'rest' },
  { a: 'adventure', b: 'stability' },
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Novice_ValueCompass({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [pair] = useState(() => VALUE_PAIRS[Math.floor(Math.random() * VALUE_PAIRS.length)]);
  const [chosen, setChosen] = useState<'a' | 'b' | null>(null);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => {
    addTimer(() => setStage('presenting'), 800);
    addTimer(() => setStage('choosing'), 3000);
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const handleChoose = (side: 'a' | 'b') => {
    if (stage !== 'choosing') return;
    setChosen(side);
    setStage('leaning');

    addTimer(() => {
      setStage('afterglow');
      onComplete?.();
    }, 8000);
  };

  const leanX = chosen === 'a' ? -30 : chosen === 'b' ? 30 : 0;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Values Clarification" kbe="embodying" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      {/* ── Ambient field ──────────────────────────────────────── */}
      <motion.div
        animate={{
          opacity: stage === 'leaning' ? 0.1 : 0.04,
        }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(ellipse at ${chosen === 'a' ? '35%' : chosen === 'b' ? '65%' : '50%'} 50%, ${palette.primaryGlow}, transparent 60%)`,
          transition: 'background 3s ease',
          pointerEvents: 'none',
        }}
      />

      {/* ── Central content ────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          width: '100%',
          maxWidth: '340px',
        }}
      >
        <AnimatePresence mode="wait">
          {/* ── Presenting: the question ───────────────────────── */}
          {stage === 'presenting' && (
            <motion.div
              key="presenting"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                ...navicueType.texture,
                color: palette.textSecondary,
                textAlign: 'center',
                maxWidth: '260px',
                lineHeight: 1.8,
              }}
            >
              Both are yours.
              <br />
              Which one pulls harder
              <br />
              right now?
            </motion.div>
          )}

          {/* ── Choosing: two values on opposite sides ─────────── */}
          {stage === 'choosing' && (
            <motion.div
              key="choosing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                position: 'relative',
                gap: '16px',
              }}
            >
              {/* Value A */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 0.6, x: 0 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => handleChoose('a')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '20px 16px',
                  flex: 1,
                  borderRadius: radius.md,
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'none';
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(18px, 3.5vw, 22px)',
                    fontFamily: fonts.secondary,
                    fontStyle: 'italic',
                    fontWeight: 300,
                    color: palette.text,
                    textAlign: 'center',
                  }}
                >
                  {pair.a}
                </div>
              </motion.button>

              {/* Center indicator — the compass needle */}
              <motion.div
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: palette.primary,
                  flexShrink: 0,
                }}
              />

              {/* Value B */}
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 0.6, x: 0 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => handleChoose('b')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '20px 16px',
                  flex: 1,
                  borderRadius: radius.md,
                  transition: 'background 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = 'none';
                }}
              >
                <div
                  style={{
                    fontSize: 'clamp(18px, 3.5vw, 22px)',
                    fontFamily: fonts.secondary,
                    fontStyle: 'italic',
                    fontWeight: 300,
                    color: palette.text,
                    textAlign: 'center',
                  }}
                >
                  {pair.b}
                </div>
              </motion.button>
            </motion.div>
          )}

          {/* ── Leaning: the compass has spoken ────────────────── */}
          {stage === 'leaning' && chosen && (
            <motion.div
              key="leaning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '32px',
              }}
            >
              {/* Both values — but chosen one glows, other fades */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '40px',
                  width: '100%',
                }}
              >
                <motion.div
                  animate={{
                    opacity: chosen === 'a' ? 0.8 : 0.15,
                    x: leanX,
                    scale: chosen === 'a' ? 1.1 : 0.9,
                  }}
                  transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    fontSize: 'clamp(18px, 3.5vw, 22px)',
                    fontFamily: fonts.secondary,
                    fontStyle: 'italic',
                    fontWeight: 300,
                    color: chosen === 'a' ? palette.text : palette.textFaint,
                    textShadow: chosen === 'a' ? `0 0 20px ${palette.primaryGlow}` : 'none',
                  }}
                >
                  {pair.a}
                </motion.div>

                {/* Compass dot — drifts toward chosen */}
                <motion.div
                  animate={{
                    x: leanX * 0.8,
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    x: { duration: 2.5, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                    scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: palette.primary,
                    boxShadow: `0 0 12px ${palette.primaryGlow}`,
                    flexShrink: 0,
                  }}
                />

                <motion.div
                  animate={{
                    opacity: chosen === 'b' ? 0.8 : 0.15,
                    x: leanX,
                    scale: chosen === 'b' ? 1.1 : 0.9,
                  }}
                  transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    fontSize: 'clamp(18px, 3.5vw, 22px)',
                    fontFamily: fonts.secondary,
                    fontStyle: 'italic',
                    fontWeight: 300,
                    color: chosen === 'b' ? palette.text : palette.textFaint,
                    textShadow: chosen === 'b' ? `0 0 20px ${palette.primaryGlow}` : 'none',
                  }}
                >
                  {pair.b}
                </motion.div>
              </div>

              {/* The landing text */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.5, y: 0 }}
                transition={{ duration: 2.5, delay: 2, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  ...navicueType.texture,
                  color: palette.textSecondary,
                  textAlign: 'center',
                  maxWidth: '260px',
                  lineHeight: 1.8,
                }}
              >
                This is what matters
                <br />
                right now.
              </motion.div>
            </motion.div>
          )}

          {/* ── Afterglow ──────────────────────────────────────── */}
          {stage === 'afterglow' && (
            <motion.div
              key="afterglow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <motion.div
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  rotate: [0, 15, 0, -15, 0],
                }}
                transition={{
                  opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                }}
                style={{
                  width: '1px',
                  height: '20px',
                  background: palette.primary,
                  boxShadow: `0 0 12px ${palette.primaryGlow}`,
                  transformOrigin: 'bottom center',
                }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                transition={{ duration: 3, delay: 1 }}
                style={{
                  ...navicueType.afterglow,
                  color: palette.textFaint,
                  textAlign: 'center',
                }}
              >
                Oriented.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom breath line ─────────────────────────────────── */}
      <motion.div
        animate={{
          scaleX: stage === 'leaning' ? 0.4 : stage === 'afterglow' ? 0 : 0.15,
          opacity: stage === 'afterglow' ? 0 : 0.12,
        }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
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