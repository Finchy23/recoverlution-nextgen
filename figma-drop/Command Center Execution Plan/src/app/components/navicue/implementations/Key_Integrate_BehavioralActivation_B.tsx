/**
 * Key × Behavioral Activation × Believing
 * Magic Signature: sacred_ordinary
 *
 * THE MICRO-PROOF
 * "Captured. Yours. Irrefutable."
 *
 * NEUROSCIENCE: Memory Reconsolidation. The brain is a lawyer,
 * not a scientist — it believes evidence, not affirmations. When
 * the "I always fail" narrative runs, it references a long history
 * of confirming memories. A single, timestamped, tangible artifact
 * of a different choice creates a competing memory trace.
 *
 * INTERACTION: A vault mechanism. You tap to lock in this moment —
 * the moment you chose differently. A receipt prints with the
 * current time. Not what you did. Just WHEN. The brain needs
 * coordinates, not commentary. Captured. Stored. Yours.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

// ── Derive from blueprint ───────────────────────────────────────────
const { palette, radius, motion: motionConfig } =
  navicueQuickstart('sacred_ordinary', 'Behavioral Activation', 'believing', 'Key');

type Stage = 'arriving' | 'ready' | 'locking' | 'stamped' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Key_Integrate_BehavioralActivation_B({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [timestamp, setTimestamp] = useState('');
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  // ── Arrival ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setStage('ready'), motionConfig.arrivingDuration);
    return () => { clearTimeout(t); timersRef.current.forEach(clearTimeout); };
  }, []);

  // ── Capture interaction ────────────────────────────────────────
  const handleCapture = useCallback(() => {
    if (stage !== 'ready') return;

    const now = new Date();
    const hours = now.getHours();
    const mins = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    setTimestamp(`${displayHour}:${mins} ${ampm}`);

    setStage('locking');
    safeTimeout(() => setStage('stamped'), 1800);
    safeTimeout(() => {
      setStage('afterglow');
      onComplete?.();
    }, motionConfig.afterglowDuration + 3000);
  }, [stage, onComplete]);

  // ── Derived ───────────────────────────────────────────────────
  const breathProgress =
    stage === 'afterglow' ? 1 :
    stage === 'stamped' ? 0.7 :
    stage === 'locking' ? 0.4 : 0;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Behavioral Activation" kbe="believing" form="Key" mode="immersive" breathProgress={breathProgress} isAfterglow={stage === 'afterglow'} particleSeed={17}>
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
              You just chose differently.
              <br />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 1.5, duration: 1.5 }}
              >
                Don't let it pass uncounted.
              </motion.span>
            </div>
          </motion.div>
        )}

        {/* ── Ready — the vault ─────────────────────────────── */}
        {stage === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            {/* Vault mechanism */}
            <motion.div
              onClick={handleCapture}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                border: `2px solid ${palette.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                background: `radial-gradient(circle, ${palette.primaryFaint}, transparent 70%)`,
              }}
            >
              {/* Inner ring */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: `1px solid ${palette.secondaryGlow}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Lock symbol */}
                <svg width="40" height="48" viewBox="0 0 40 48">
                  <rect
                    x="4" y="20" width="32" height="24" rx="4"
                    fill="none" stroke={palette.primary} strokeWidth="1.5"
                  />
                  <path
                    d="M 12 20 L 12 14 A 8 8 0 0 1 28 14 L 28 20"
                    fill="none" stroke={palette.primary} strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="20" cy="32" r="3" fill={palette.primary} />
                  <line
                    x1="20" y1="35" x2="20" y2="39"
                    stroke={palette.primary} strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>

              {/* Pulse ring */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.15, 0.3, 0.15],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  border: `1px solid ${palette.primary}`,
                  pointerEvents: 'none',
                }}
              />
            </motion.div>

            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ ...navicueType.hint, color: palette.textFaint }}
            >
              tap to capture this moment
            </motion.div>
          </motion.div>
        )}

        {/* ── Locking — the vault closes ────────────────────── */}
        {stage === 'locking' && (
          <motion.div
            key="locking"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px',
            }}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 0.95, 1.02, 1] }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                border: `2px solid ${palette.accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `radial-gradient(circle, ${palette.accentGlow}, transparent 70%)`,
              }}
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -90] }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <svg width="40" height="48" viewBox="0 0 40 48">
                  <rect
                    x="4" y="20" width="32" height="24" rx="4"
                    fill="none" stroke={palette.accent} strokeWidth="2"
                  />
                  <path
                    d="M 12 20 L 12 14 A 8 8 0 0 1 28 14 L 28 20"
                    fill="none" stroke={palette.accent} strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="20" cy="32" r="3" fill={palette.accent} />
                </svg>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{ ...navicueType.texture, color: palette.accent, letterSpacing: '0.05em' }}
            >
              Sealed.
            </motion.div>
          </motion.div>
        )}

        {/* ── Stamped — the receipt ─────────────────────────── */}
        {stage === 'stamped' && (
          <motion.div
            key="stamped"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            {/* The receipt */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: 'clamp(240px, 60vw, 320px)',
                padding: '32px 28px',
                background: `linear-gradient(180deg, ${palette.primaryFaint}, ${palette.accentGlow})`,
                border: `1px solid ${palette.secondaryGlow}`,
                borderRadius: radius.xs,
                transformOrigin: 'top center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
              }}
            >
              {/* Decorative top line */}
              <div style={{
                width: '80%', height: '1px',
                background: `linear-gradient(90deg, transparent, ${palette.secondaryGlow}, transparent)`,
              }} />

              {/* Time */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                style={{
                  fontSize: navicueType.hero.fontSize,
                  color: palette.text,
                  fontFamily: fonts.secondary,
                  fontWeight: 300,
                  letterSpacing: '0.06em',
                }}
              >
                {timestamp}
              </motion.div>

              {/* The proof */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 1.5, duration: 1.5 }}
                style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center' }}
              >
                I chose differently.
              </motion.div>

              {/* Decorative bottom line */}
              <div style={{
                width: '80%', height: '1px',
                background: `linear-gradient(90deg, transparent, ${palette.secondaryGlow}, transparent)`,
              }} />

              {/* Seal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.4, scale: 1 }}
                transition={{ delay: 2, duration: 0.8 }}
                style={{
                  width: '40px', height: '40px',
                  borderRadius: '50%',
                  border: `1.5px solid ${palette.accent}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: navicueType.status.fontSize, color: palette.accent,
                  fontFamily: fonts.mono, letterSpacing: '0.1em',
                }}
              >
                ✓
              </motion.div>
            </motion.div>

            {/* Whisper below */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ delay: 2.5, duration: 2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}
            >
              Captured. Yours. Irrefutable.
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
              animate={{
                opacity: [0.3, 0.5, 0.3],
                boxShadow: [
                  `0 0 15px ${palette.accentGlow}`,
                  `0 0 30px ${palette.accentGlow}`,
                  `0 0 15px ${palette.accentGlow}`,
                ],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: palette.accent,
              }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 2, delay: 1 }}
              style={{ ...navicueType.afterglow, color: palette.textFaint }}
            >
              The brain believes evidence,
              <br />
              not promises.
              <br />
              Today you have one more receipt.
            </motion.div>

            <motion.div
              animate={{ opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 6, repeat: Infinity }}
              style={{
                width: '140px', height: '1px',
                background: `linear-gradient(90deg, transparent, ${palette.accent}, transparent)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}