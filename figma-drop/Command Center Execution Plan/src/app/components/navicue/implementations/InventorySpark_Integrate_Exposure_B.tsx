/**
 * InventorySpark × Exposure × Believing
 * Magic Signature: sensory_cinema
 *
 * THE DOOR
 * "Every door you've avoided is still there. This one is gentle."
 *
 * NEUROSCIENCE: The amygdala tags avoided experiences as dangerous,
 * reinforcing avoidance loops. Graduated exposure — approaching
 * the threshold at a safe distance — creates a new competing
 * memory: "I approached this and I was okay." The flip mechanic
 * mirrors this beautifully: the closed door is the avoidance,
 * the flip is the approach, and what's on the other side is
 * never as threatening as the imagination made it.
 *
 * INTERACTION: A closed doorway. Tap to flip it open — a gentle
 * threshold reveals itself. The door was never locked. You just
 * hadn't turned the handle yet. Step through or stay. Either
 * way, you approached.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import { radius } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

// ── Derive from blueprint ───────────────────────────────────────────
const { palette, atmosphere, motion: motionConfig } =
  navicueQuickstart('sensory_cinema', 'Exposure', 'believing', 'InventorySpark');

type Stage = 'arriving' | 'closed' | 'opening' | 'threshold' | 'stepped' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  cta_defer?: string;
  onComplete?: () => void;
}

export default function InventorySpark_Integrate_Exposure_B({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [isFlipped, setIsFlipped] = useState(false);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  // ── Arrival ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setStage('closed'), motionConfig.arrivingDuration);
    return () => { clearTimeout(t); timersRef.current.forEach(clearTimeout); };
  }, []);

  // ── Door flip ─────────────────────────────────────────────────
  const handleFlip = useCallback(() => {
    if (stage !== 'closed') return;
    setStage('opening');
    setIsFlipped(true);
    safeTimeout(() => setStage('threshold'), 800);
  }, [stage]);

  // ── Step through ──────────────────────────────────────────────
  const handleStep = useCallback(() => {
    if (stage !== 'threshold') return;
    setStage('stepped');
    safeTimeout(() => {
      setStage('afterglow');
      onComplete?.();
    }, motionConfig.afterglowDuration);
  }, [stage, onComplete]);

  // ── Derived ───────────────────────────────────────────────────
  const breathProgress =
    stage === 'afterglow' ? 1 :
    stage === 'stepped' ? 0.8 :
    stage === 'threshold' ? 0.5 :
    stage === 'opening' ? 0.3 : 0;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Exposure" kbe="believing" form="InventorySpark" mode="immersive" breathProgress={breathProgress} isAfterglow={stage === 'afterglow'}>
      {/* ── Door visualization ─────────────────────────────────── */}
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
              Every door you've avoided
              <br />
              is still there.
            </div>
          </motion.div>
        )}

        {/* ── Closed / Opening — the flip card ──────────────── */}
        {(stage === 'closed' || stage === 'opening' || stage === 'threshold') && (
          <motion.div
            key="door"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            {/* The flip card */}
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '280px',
                height: '200px',
                position: 'relative',
                transformStyle: 'preserve-3d',
                cursor: stage === 'closed' ? 'pointer' : 'default',
              }}
              onClick={stage === 'closed' ? handleFlip : undefined}
            >
              {/* Front — Closed Door */}
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  background: `linear-gradient(135deg, ${palette.primaryFaint}, ${palette.primaryGlow})`,
                  border: `1px solid ${palette.primary}`,
                  borderRadius: radius.lg,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                }}
              >
                <svg width="60" height="80" viewBox="0 0 60 80">
                  <rect
                    x="8" y="8" width="44" height="64" rx="4"
                    fill="none" stroke={palette.secondary} strokeWidth="1.5"
                  />
                  <motion.circle
                    cx="40" cy="40" r="3.5"
                    fill={palette.accent}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.path
                    d="M 30 35 L 30 45 M 30 35 A 3 3 0 1 1 30 34.99"
                    stroke={palette.accent}
                    strokeWidth="1.2"
                    fill="none"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                </svg>

                <motion.div
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{ ...navicueType.hint, color: palette.textFaint }}
                >
                  tap to open
                </motion.div>
              </div>

              {/* Back — Open Threshold */}
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: `linear-gradient(135deg, ${palette.accentGlow}, ${palette.primaryGlow})`,
                  border: `1px solid ${palette.accent}`,
                  borderRadius: radius.lg,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                }}
              >
                <svg width="60" height="80" viewBox="0 0 60 80">
                  <motion.rect
                    x="8" y="8" width="44" height="64" rx="4"
                    fill={palette.primaryGlow}
                    animate={{ opacity: [0.15, 0.3, 0.15] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <line
                    x1="8" y1="72" x2="52" y2="72"
                    stroke={palette.accent} strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <motion.path
                    d="M 30 40 L 30 58 M 25 53 L 30 58 L 35 53"
                    stroke={palette.accent} strokeWidth="1.5"
                    strokeLinecap="round" fill="none"
                    animate={{ y: [0, 4, 0], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </svg>

                <div style={{ ...navicueType.hint, color: palette.accent, opacity: 0.8 }}>
                  the threshold awaits
                </div>
              </div>
            </motion.div>

            {/* Step through button — only when threshold is visible */}
            {stage === 'threshold' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStep}
                  style={{
                    ...navicueType.choice,
                    padding: '12px 28px',
                    background: `linear-gradient(135deg, ${palette.accentGlow}, ${palette.primaryGlow})`,
                    border: `1px solid ${palette.accent}`,
                    borderRadius: radius.full,
                    color: palette.text,
                    cursor: 'pointer',
                  }}
                >
                  step through
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Stepped — you approached ──────────────────────── */}
        {stage === 'stepped' && (
          <motion.div
            key="stepped"
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
            {/* Opening light */}
            <motion.div
              initial={{ width: '2px', opacity: 0.3 }}
              animate={{ width: '200px', opacity: 0.15 }}
              transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: '200px',
                background: `linear-gradient(180deg, ${palette.accent}, transparent)`,
                borderRadius: radius.xs,
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, delay: 0.8 }}
              style={{ ...navicueType.prompt, color: palette.text }}
            >
              The door was never locked.
              <br />
              You just hadn't turned the handle.
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
                background: `linear-gradient(90deg, transparent, ${palette.accent}, transparent)`,
              }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 2, delay: 1 }}
              style={{ ...navicueType.afterglow, color: palette.textFaint }}
            >
              You approached.
              <br />
              That's the whole thing.
            </motion.div>

            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: palette.accent,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}