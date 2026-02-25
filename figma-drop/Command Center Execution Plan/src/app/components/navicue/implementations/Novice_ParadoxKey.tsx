/**
 * NOVICE COLLECTION #5
 * The Paradox Key
 *
 * "The door was never locked."
 *
 * A word appears. You're told to push it away. The harder you push,
 * the larger and brighter it becomes — resisting you, feeding on
 * your effort. When you finally let go... it dissolves instantly.
 * Effortlessly. The paradox made visceral.
 *
 * NEUROSCIENCE: Paradoxical intention (Viktor Frankl, 1946). The
 * anterior cingulate cortex (ACC) acts as the brain's "effort monitor."
 * When you try to suppress a thought, the ACC flags it as high-priority,
 * creating an ironic rebound effect — the white bear problem. Letting go
 * deactivates the monitoring loop entirely. The thought loses its charge
 * not through force, but through permission.
 *
 * This is also the core mechanism of ACT (Acceptance and Commitment
 * Therapy): the struggle switch. Fighting the wave makes you drown.
 * Floating lets you ride it.
 *
 * INTERACTION: Press and hold on the word. Watch it resist — growing,
 * pulsing, heating. The screen tenses. Then release. Instant dissolution.
 * The paradox lands in the body, not the intellect.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: suppress, push away, resist the feeling
 * 2. Different action possible: stop pushing
 * 3. Action executed: release — the word vanishes without effort
 * 4. Evidence: forcing created resistance; allowing created freedom
 * 5. Repeated: "let it be" becomes a felt skill, not a platitude
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

// ── Derive from blueprint ─────────────────────────────────────────
const { palette, radius } =
  navicueQuickstart('koan_paradox', 'Cognitive Restructuring', 'believing', 'Key');

type Stage =
  | 'arriving'      // Dark, the word materializes
  | 'instruction'   // "Push it away."
  | 'pushing'       // User is pressing — word resists, grows
  | 'released'      // User let go — instant dissolution
  | 'landing'       // The paradox settles
  | 'afterglow';    // "The door was never locked."

// The words that could appear — universal human struggles
const STRUGGLE_WORDS = ['worry', 'doubt', 'shame', 'fear', 'enough'];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Novice_ParadoxKey({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [word] = useState(() => STRUGGLE_WORDS[Math.floor(Math.random() * STRUGGLE_WORDS.length)]);
  const [pushIntensity, setPushIntensity] = useState(0);  // 0-1 how hard they're pushing
  const [hasPushedEnough, setHasPushedEnough] = useState(false);
  const timersRef = useRef<number[]>([]);
  const pushIntervalRef = useRef<number | null>(null);
  const pushStartRef = useRef<number>(0);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  // ── Stage progression ─────────────────────────────────────────
  useEffect(() => {
    addTimer(() => setStage('instruction'), 1200);
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (pushIntervalRef.current) clearInterval(pushIntervalRef.current);
    };
  }, []);

  // ── Press handlers ────────────────────────────────────────────
  const startPushing = useCallback(() => {
    if (stage !== 'instruction' && stage !== 'pushing') return;
    setStage('pushing');
    pushStartRef.current = Date.now();

    // Ramp up intensity over time
    pushIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - pushStartRef.current;
      const intensity = Math.min(elapsed / 3000, 1); // Full intensity at 3s
      setPushIntensity(intensity);
      if (intensity >= 0.7 && !hasPushedEnough) {
        setHasPushedEnough(true);
      }
    }, 30);
  }, [stage, hasPushedEnough]);

  const stopPushing = useCallback(() => {
    if (pushIntervalRef.current) {
      clearInterval(pushIntervalRef.current);
      pushIntervalRef.current = null;
    }

    if (stage !== 'pushing') return;

    if (hasPushedEnough) {
      // They pushed enough to feel the resistance — now the release is meaningful
      setStage('released');
      setPushIntensity(0);

      addTimer(() => setStage('landing'), 2500);
      addTimer(() => {
        setStage('afterglow');
        onComplete?.();
      }, 8000);
    } else {
      // Released too early — intensity fades, stays in instruction
      setPushIntensity(0);
      setStage('instruction');
    }
  }, [stage, hasPushedEnough, onComplete]);

  // ── Derived visual values ─────────────────────────────────────
  const wordScale = 1 + pushIntensity * 1.8;           // Grows up to 2.8x
  const wordGlow = pushIntensity * 30;                  // Glow radius
  const bgTension = pushIntensity * 0.08;               // Background reddens
  const shake = stage === 'pushing' && pushIntensity > 0.5
    ? pushIntensity * 2 : 0;                             // Tremor at high intensity

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Cognitive Restructuring" kbe="believing" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      {/* ── Background tension layer ──────────────────────────── */}
      <motion.div
        animate={{
          opacity: bgTension,
        }}
        transition={{ duration: 0.1 }}
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 50% 50%, hsla(15, 60%, 40%, 0.3), transparent 60%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Release flash ─────────────────────────────────────── */}
      <AnimatePresence>
        {stage === 'released' && (
          <motion.div
            key="release-flash"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at 50% 50%, ${palette.primaryGlow}, transparent 50%)`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Central word ──────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
        }}
      >
        <AnimatePresence mode="wait">
          {/* ── The word (arriving → instruction → pushing) ─────── */}
          {(stage === 'arriving' || stage === 'instruction' || stage === 'pushing') && (
            <motion.div
              key="word-container"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: stage === 'arriving' ? 0.3 : 1,
                scale: stage === 'pushing' ? wordScale : 1,
                x: shake ? [0, -shake, shake, -shake * 0.5, 0] : 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.01,
                transition: { duration: 0.3, ease: [0.4, 0, 1, 1] },
              }}
              transition={{
                opacity: { duration: 1 },
                scale: { duration: 0.15, ease: 'linear' },
                x: { duration: 0.15, repeat: stage === 'pushing' && pushIntensity > 0.5 ? Infinity : 0 },
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                startPushing();
              }}
              onPointerUp={stopPushing}
              onPointerLeave={stopPushing}
              onPointerCancel={stopPushing}
              style={{
                cursor: stage === 'instruction' || stage === 'pushing' ? 'pointer' : 'default',
                padding: '24px 32px',
                position: 'relative',
              }}
            >
              {/* Resistance glow — appears during pushing */}
              {stage === 'pushing' && pushIntensity > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: '-40%',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, hsla(15, 70%, 50%, ${pushIntensity * 0.2}), transparent 60%)`,
                    filter: `blur(${wordGlow}px)`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              <div
                style={{
                  fontSize: 'clamp(28px, 6vw, 40px)',
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: stage === 'pushing'
                    ? `hsla(${20 - pushIntensity * 10}, ${40 + pushIntensity * 30}%, ${65 + pushIntensity * 15}%, ${0.6 + pushIntensity * 0.4})`
                    : palette.text,
                  textAlign: 'center',
                  letterSpacing: '0.04em',
                  textShadow: stage === 'pushing'
                    ? `0 0 ${wordGlow}px hsla(15, 60%, 60%, ${pushIntensity * 0.5})`
                    : 'none',
                  transition: 'color 0.1s ease',
                }}
              >
                {word}
              </div>
            </motion.div>
          )}

          {/* ── Released: the space where the word was ──────────── */}
          {stage === 'released' && (
            <motion.div
              key="dissolved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                ...navicueType.prompt,
                color: palette.textSecondary,
                textAlign: 'center',
                maxWidth: '240px',
              }}
            >
              Gone.
            </motion.div>
          )}

          {/* ── Landing: the paradox settles ────────────────────── */}
          {stage === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              <div
                style={{
                  ...navicueType.texture,
                  color: palette.textSecondary,
                  textAlign: 'center',
                  maxWidth: '260px',
                  lineHeight: 1.8,
                }}
              >
                You fought it and it grew.
                <br />
                You released it and it left.
              </div>
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
                gap: '28px',
              }}
            >
              {/* Small keyhole shape */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.06, 1],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '8px',
                  height: '16px',
                  borderRadius: `${radius.xs} ${radius.xs} 2px 2px`,
                  background: palette.primary,
                  boxShadow: `0 0 20px ${palette.primaryGlow}`,
                }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                transition={{ duration: 3, delay: 1.5 }}
                style={{
                  ...navicueType.afterglow,
                  color: palette.textFaint,
                  textAlign: 'center',
                }}
              >
                The door was never locked.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Instruction text ─────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {stage === 'instruction' && (
            <motion.div
              key="instruction"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.4, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                bottom: '-60px',
                ...navicueType.hint,
                color: palette.textFaint,
                letterSpacing: '0.08em',
              }}
            >
              press and hold to push it away
            </motion.div>
          )}

          {stage === 'pushing' && hasPushedEnough && (
            <motion.div
              key="release-hint"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0, 0.35, 0.25] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                bottom: '-60px',
                ...navicueType.hint,
                color: palette.textFaint,
                letterSpacing: '0.08em',
              }}
            >
              now... let go
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Tension border — edges glow during pushing ─────────── */}
      <motion.div
        animate={{
          opacity: stage === 'pushing' ? pushIntensity * 0.15 : 0,
        }}
        transition={{ duration: 0.1 }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          boxShadow: `inset 0 0 60px hsla(15, 60%, 40%, 0.3)`,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* ── Bottom breath line ────────────────────────────────── */}
      <motion.div
        animate={{
          scaleX: stage === 'pushing' ? 0.3 + pushIntensity * 0.7
            : stage === 'released' ? 0
            : stage === 'afterglow' ? 0
            : 0.15,
          opacity: stage === 'released' || stage === 'afterglow' ? 0 : 0.12,
          background: stage === 'pushing'
            ? `linear-gradient(90deg, transparent, hsla(15, 60%, 55%, ${0.3 + pushIntensity * 0.7}), transparent)`
            : `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
        }}
        transition={{ duration: stage === 'pushing' ? 0.1 : 2, ease: stage === 'pushing' ? 'linear' : [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          transformOrigin: 'center',
          zIndex: 3,
        }}
      />
    </NaviCueShell>
  );
}