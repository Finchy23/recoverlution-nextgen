/**
 * NOVICE COLLECTION #7
 * The Micro-Proof
 *
 * "The old story says you can't change. This says otherwise."
 *
 * You just did something different — a micro-moment of courage, a tiny
 * deviation from the old script. The Micro-Proof catches it before it
 * vanishes. Because the brain discounts small wins unless they're COUNTED.
 * This specimen makes counting feel like ceremony, not homework.
 *
 * NEUROSCIENCE: The reticular activating system (RAS) filters reality.
 * When you explicitly tag a moment as "proof of change," you train the
 * RAS to notice more of them. This is cognitive behavioral "evidence
 * logging" — except made luminous. The hippocampus consolidates episodic
 * memories better when they carry emotional significance. Making the
 * proof feel important increases retention of the change itself.
 *
 * INTERACTION: A quiet question: "What did you just do differently?"
 * Three gentle options. Tap one. A counter materializes — "1" — etched
 * with slow light, like an inscription being carved. Then: "The old
 * story says you can't change. This says otherwise." Afterglow: the
 * number pulses. "Counted."
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: change goes unnoticed, discounted, forgotten
 * 2. Different action possible: capture the evidence
 * 3. Action executed: you named it. The counter inscribed it.
 * 4. Evidence: the number exists. It can only go up.
 * 5. Repeated: proof accumulates. The old story weakens.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

// ── Derive from blueprint ─────────────────────────────────────────
const { palette, radius } =
  navicueQuickstart('science_x_soul', 'Behavioral Activation', 'believing', 'Inventory Spark');

type Stage = 'arriving' | 'asking' | 'choosing' | 'inscribing' | 'landing' | 'afterglow';

// Options — things a novice might have just done differently
const PROOF_OPTIONS = [
  { id: 'pause', label: 'I paused before reacting' },
  { id: 'hard', label: 'I chose something hard' },
  { id: 'go', label: 'I let something go' },
  { id: 'spoke', label: 'I said what I meant' },
  { id: 'stayed', label: 'I stayed when I wanted to run' },
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Novice_MicroProof({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [inscribeProgress, setInscribeProgress] = useState(0); // 0-1 for etch effect
  const timersRef = useRef<number[]>([]);
  const inscribeRef = useRef<number | null>(null);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => {
    addTimer(() => setStage('asking'), 800);
    addTimer(() => setStage('choosing'), 2800);
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (inscribeRef.current) cancelAnimationFrame(inscribeRef.current);
    };
  }, []);

  const handleSelect = (id: string, label: string) => {
    if (stage !== 'choosing') return;
    setSelected(id);
    setSelectedLabel(label);
    setStage('inscribing');

    // Animate the inscription — slow, deliberate
    const start = performance.now();
    const duration = 2500; // 2.5s to etch the number
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out — starts fast, slows at the end (inscribing settling)
      const eased = 1 - Math.pow(1 - progress, 3);
      setInscribeProgress(eased);
      if (progress < 1) {
        inscribeRef.current = requestAnimationFrame(animate);
      } else {
        addTimer(() => setStage('landing'), 1000);
        addTimer(() => {
          setStage('afterglow');
          onComplete?.();
        }, 7500);
      }
    };
    inscribeRef.current = requestAnimationFrame(animate);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Behavioral Activation" kbe="believing" form="InventorySpark" mode="immersive" isAfterglow={stage === 'afterglow'}>
      {/* ── Ambient glow ──────────────────────────────────────── */}
      <motion.div
        animate={{
          opacity: stage === 'inscribing' ? 0.12 : stage === 'landing' ? 0.08 : stage === 'afterglow' ? 0.05 : 0.03,
        }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(ellipse at 50% 45%, ${palette.primaryGlow}, transparent 65%)`,
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
          {/* ── Asking ─────────────────────────────────────────── */}
          {stage === 'asking' && (
            <motion.div
              key="asking"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.7, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                ...navicueType.prompt,
                color: palette.text,
                textAlign: 'center',
                maxWidth: '250px',
              }}
            >
              What did you just
              <br />
              do differently?
            </motion.div>
          )}

          {/* ── Choosing ───────────────────────────────────────── */}
          {stage === 'choosing' && (
            <motion.div
              key="choosing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '32px',
                width: '100%',
              }}
            >
              <div
                style={{
                  ...navicueType.texture,
                  color: palette.textSecondary,
                  textAlign: 'center',
                  opacity: 0.5,
                }}
              >
                What did you just do differently?
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  width: '100%',
                }}
              >
                {PROOF_OPTIONS.map((opt, i) => (
                  <motion.button
                    key={opt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 0.6, x: 0 }}
                    whileHover={{ opacity: 1, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{
                      delay: i * 0.1,
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={() => handleSelect(opt.id, opt.label)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '14px 24px',
                      borderRadius: radius.sm,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: fonts.secondary,
                      fontStyle: 'italic',
                      fontSize: 'clamp(14px, 2.5vw, 16px)',
                      fontWeight: 300,
                      color: palette.textSecondary,
                      letterSpacing: '0.02em',
                      transition: 'background 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.background = 'none';
                    }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Inscribing — the counter etches itself ─────────── */}
          {stage === 'inscribing' && (
            <motion.div
              key="inscribing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '28px',
              }}
            >
              {/* The selected action — fading into record */}
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 0.3, y: 0 }}
                transition={{ duration: 1.5, delay: 0.3 }}
                style={{
                  ...navicueType.hint,
                  color: palette.textFaint,
                  textAlign: 'center',
                  letterSpacing: '0.04em',
                  fontStyle: 'italic',
                }}
              >
                {selectedLabel}
              </motion.div>

              {/* The number — etched with light */}
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Glow behind the number */}
                <div
                  style={{
                    position: 'absolute',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${palette.primaryGlow}, transparent 70%)`,
                    opacity: inscribeProgress * 0.3,
                    filter: `blur(${12 - inscribeProgress * 8}px)`,
                    transition: 'opacity 0.1s linear',
                  }}
                />

                {/* The number itself */}
                <div
                  style={{
                    fontSize: 'clamp(48px, 10vw, 64px)',
                    fontFamily: fonts.mono,
                    fontWeight: 300,
                    color: palette.text,
                    opacity: inscribeProgress,
                    textShadow: `0 0 ${inscribeProgress * 20}px ${palette.primaryGlow}`,
                    transition: 'opacity 0.05s linear',
                    letterSpacing: '-0.02em',
                    position: 'relative',
                  }}
                >
                  1
                </div>
              </div>

              {/* Etch line — reveals underneath the number */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: inscribeProgress,
                  opacity: inscribeProgress * 0.2,
                }}
                style={{
                  width: '60px',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
                  transformOrigin: 'center',
                }}
              />
            </motion.div>
          )}

          {/* ── Landing — the paradox ──────────────────────────── */}
          {stage === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              {/* The number persists, dimmed */}
              <div
                style={{
                  fontSize: 'clamp(36px, 8vw, 48px)',
                  fontFamily: fonts.mono,
                  fontWeight: 300,
                  color: palette.text,
                  opacity: 0.3,
                  textShadow: `0 0 12px ${palette.primaryGlow}`,
                }}
              >
                1
              </div>

              <div
                style={{
                  ...navicueType.texture,
                  color: palette.textSecondary,
                  textAlign: 'center',
                  maxWidth: '260px',
                  lineHeight: 1.8,
                }}
              >
                The old story says
                <br />
                you can't change.
                <br />
                <span style={{ color: palette.text, opacity: 0.9 }}>
                  This says otherwise.
                </span>
              </div>
            </motion.div>
          )}

          {/* ── Afterglow ─────────────────────────────────────── */}
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
              {/* The number, softly pulsing — it can only go up */}
              <motion.div
                animate={{
                  opacity: [0.25, 0.4, 0.25],
                  textShadow: [
                    `0 0 8px ${palette.primaryGlow}`,
                    `0 0 16px ${palette.primaryGlow}`,
                    `0 0 8px ${palette.primaryGlow}`,
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  fontSize: 'clamp(28px, 6vw, 36px)',
                  fontFamily: fonts.mono,
                  fontWeight: 300,
                  color: palette.text,
                }}
              >
                1
              </motion.div>

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
                Counted.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom breath line ─────────────────────────────────── */}
      <motion.div
        animate={{
          scaleX: stage === 'inscribing' ? inscribeProgress * 0.5
            : stage === 'landing' ? 0.4
            : stage === 'afterglow' ? 0
            : 0.1,
          opacity: stage === 'afterglow' ? 0 : 0.12,
        }}
        transition={{ duration: stage === 'inscribing' ? 0.1 : 2, ease: [0.22, 1, 0.36, 1] }}
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