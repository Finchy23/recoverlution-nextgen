/**
 * Practice × Metacognition × Believing
 * Magic Signature: witness_ritual (via poetic_precision fallback for cool clarity)
 *
 * THE SKY MIND
 * "Thoughts are weather. You are the sky."
 *
 * NEUROSCIENCE: The default mode network generates a continuous
 * stream of spontaneous thoughts. Most pass unnoticed — fused
 * into the self-narrative. The simple act of noticing ("there's
 * a worry") activates the anterior cingulate cortex, creating
 * distance between observer and thought. That distance is freedom.
 *
 * INTERACTION: Thought-bubbles drift across a soft sky. Tap to
 * notice them — not to fix or judge, just to see. Each one you
 * catch becomes a small light. Four noticed thoughts and the sky
 * clears. You didn't change the weather. You remembered you're
 * not the weather.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

// ── Derive from blueprint ───────────────────────────────────────────
const { palette, atmosphere, motion: motionConfig } =
  navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Practice');

type Stage = 'arriving' | 'watching' | 'catching' | 'clear' | 'afterglow';

const THOUGHT_WORDS = ['worry', 'plan', 'memory', 'comparison', 'wish', 'what-if'];

interface FloatingThought {
  id: number;
  label: string;
  y: number;
  speed: number;
}

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Practice_Integrate_Metacognition_B({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [caught, setCaught] = useState<string[]>([]);
  const [floating, setFloating] = useState<FloatingThought[]>([]);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };
  const spawnRef = useRef<NodeJS.Timeout | null>(null);

  // ── Arrival ───────────────────────────────────────────────────
  useEffect(() => {
    const t = safeTimeout(() => setStage('watching'), motionConfig.arrivingDuration);
    return () => {
      clearTimeout(t);
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, []);

  // ── Start spawning thoughts ────────────────────────────────────
  const startCatching = useCallback(() => {
    if (stage !== 'watching') return;
    setStage('catching');

    spawnRef.current = setInterval(() => {
      const label = THOUGHT_WORDS[Math.floor(Math.random() * THOUGHT_WORDS.length)];
      setFloating(prev => [
        ...prev.slice(-5),
        { id: Date.now(), label, y: 20 + Math.random() * 60, speed: 3.5 + Math.random() * 2 },
      ]);
    }, 1300);
  }, [stage]);

  // ── Catch a thought ────────────────────────────────────────────
  const catchThought = useCallback((id: number, label: string) => {
    setFloating(prev => prev.filter(f => f.id !== id));
    if (!caught.includes(label)) {
      const next = [...caught, label];
      setCaught(next);
      if (next.length >= 4) {
        if (spawnRef.current) clearInterval(spawnRef.current);
        safeTimeout(() => {
          setStage('clear');
          safeTimeout(() => {
            setStage('afterglow');
            onComplete?.();
          }, motionConfig.afterglowDuration);
        }, 1200);
      }
    }
  }, [caught, onComplete]);

  // ── Derived ───────────────────────────────────────────────────
  const breathProgress =
    stage === 'afterglow' ? 1 :
    stage === 'clear' ? 0.8 :
    caught.length > 0 ? (caught.length / 4) * 0.6 : 0;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" breathProgress={breathProgress} isAfterglow={stage === 'afterglow'} particleSeed={33}>
      {/* ── Central experience ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* ── Arriving ───────────────────────────────────────── */}
        {stage === 'arriving' && (
          <motion.div
            key="arrive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ ...navicueType.arrival, color: palette.text }}>
              Thoughts are weather.
              <br />
              You are the sky.
            </div>
          </motion.div>
        )}

        {/* ── Watching / Catching — the sky ──────────────────── */}
        {(stage === 'watching' || stage === 'catching') && (
          <motion.div
            key="sky"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px',
              width: '100%',
            }}
          >
            {/* The thought field */}
            <motion.div
              onClick={stage === 'watching' ? startCatching : undefined}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '340px',
                height: '220px',
                overflow: 'hidden',
                borderRadius: radius.md,
                border: `1px solid ${palette.accent}`,
                cursor: stage === 'watching' ? 'pointer' : 'default',
                background: `linear-gradient(180deg, ${palette.primaryFaint}, transparent)`,
              }}
            >
              {/* Floating thought bubbles */}
              <AnimatePresence>
                {floating.map(thought => (
                  <motion.div
                    key={thought.id}
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 380, opacity: [0, 0.7, 0.7, 0] }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: thought.speed, ease: 'linear' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      catchThought(thought.id, thought.label);
                    }}
                    onAnimationComplete={() =>
                      setFloating(prev => prev.filter(f => f.id !== thought.id))
                    }
                    style={{
                      position: 'absolute',
                      top: `${thought.y}%`,
                      padding: '6px 16px',
                      borderRadius: radius.full, // True pill — was '20px'
                      border: `1px solid ${palette.primary}`,
                      backgroundColor: palette.primaryFaint,
                      ...navicueType.hint,
                      color: palette.primary,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      userSelect: 'none',
                    }}
                  >
                    {thought.label}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Center instruction when waiting */}
              {stage === 'watching' && (
                <motion.div
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...navicueType.hint,
                    color: palette.textFaint,
                  }}
                >
                  tap to begin noticing
                </motion.div>
              )}
            </motion.div>

            {/* Caught thoughts — small lights */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {caught.map(label => (
                <motion.div
                  key={label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.8 }}
                  style={{
                    padding: '4px 14px',
                    borderRadius: radius.md,
                    border: `1px solid ${palette.accent}`,
                    ...navicueType.hint,
                    color: palette.accent,
                  }}
                >
                  {label}
                </motion.div>
              ))}
            </div>

            {/* Subtle progress hint */}
            {stage === 'catching' && caught.length > 0 && caught.length < 4 && (
              <motion.div
                animate={{ opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ ...navicueType.hint, color: palette.textFaint }}
              >
                catch the thoughts as they drift
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Clear — the sky empties ───────────────────────── */}
        {stage === 'clear' && (
          <motion.div
            key="clear"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            {/* Expanding clarity orb */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${palette.primaryGlow}, transparent 70%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 20px ${palette.primaryGlow}`,
                    `0 0 40px ${palette.primaryGlow}`,
                    `0 0 20px ${palette.primaryGlow}`,
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: palette.primary,
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, delay: 0.8 }}
              style={{ ...navicueType.prompt, color: palette.text }}
            >
              You didn't change the weather.
              <br />
              You remembered you're the sky.
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
              gap: '28px',
            }}
          >
            <motion.div
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity }}
              style={{
                width: '120px',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
              }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 2, delay: 1 }}
              style={{ ...navicueType.afterglow, color: palette.textFaint }}
            >
              Every thought you noticed
              <br />
              is a thought that didn't drive.
            </motion.div>

            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: palette.primary,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}