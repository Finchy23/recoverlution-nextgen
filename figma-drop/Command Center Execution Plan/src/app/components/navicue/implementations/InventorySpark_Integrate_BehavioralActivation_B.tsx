/**
 * InventorySpark x Behavioral Activation x Believing
 * Magic Signature: pattern_glitch
 *
 * THE CRACK
 * "You don't have to do what you always do."
 *
 * NEUROSCIENCE: Behavioral activation targets the basal ganglia's
 * habit loops. Autopilot lives in the striatum — efficient, fast,
 * and completely blind. A pattern interrupt creates a prediction
 * error in the dopamine system: "wait, this isn't what usually
 * happens here." That error IS the window. In that microsecond
 * of surprise, the prefrontal cortex gets a vote. The smaller
 * the alternative action, the more likely it wins.
 *
 * PHILOSOPHY:
 * Alan Watts: "The only way to make sense out of change is to
 * plunge into it, move with it, and join the dance."
 * Ram Dass: "The next message you need is always right where you
 * are."
 *
 * INTERACTION: A comfortable visual pattern plays. Repetitive.
 * Expected. Autopilot-inducing. Then it glitches. Through the
 * crack in the pattern, a single word appears — a tiny,
 * possible, different action. Not "change your life." Just...
 * "pause" or "ask" or "wait." Touch it before it fades. The
 * glitch resolves into something subtly new.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: autopilot, same response, every time
 * 2. Different action possible: the crack reveals an alternative
 * 3. Action executed: catching the word = choosing to see it
 * 4. Evidence: the pattern didn't collapse, it just... shifted
 * 5. Repeated: pattern flexibility becomes the new default
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { colors, fonts, surfaces, spacing } from '@/design-tokens';
import { navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

const palette = {
  base: surfaces.solid.base,
  indigo: 'hsla(250, 50%, 58%, 1)',
  indigoGlow: 'hsla(250, 50%, 58%, 0.25)',
  indigoFaint: 'hsla(250, 50%, 58%, 0.06)',
  violet: 'hsla(255, 45%, 60%, 1)',
  neon: 'hsla(245, 55%, 62%, 1)',
  neonGlow: 'hsla(245, 55%, 62%, 0.4)',
  text: 'hsla(250, 15%, 85%, 0.85)',
  textFaint: 'hsla(250, 15%, 85%, 0.35)',
  patternLine: 'hsla(250, 50%, 58%, 0.08)',
};

// Micro-actions — tiny, achievable, real
const MICRO_ACTIONS = [
  'pause',
  'ask',
  'breathe',
  'wait',
  'look',
  'listen',
  'notice',
  'name it',
];

type Stage = 'arriving' | 'pattern' | 'glitching' | 'crack' | 'caught' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function InventorySpark_Integrate_BehavioralActivation_B({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [actionWord, setActionWord] = useState('');
  const [caught, setCaught] = useState(false);
  const [glitchLines, setGlitchLines] = useState<number[]>([]);
  const patternTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };
  const fadeTimeoutRef = useRef<number | null>(null);

  // Pick a random micro-action
  useEffect(() => {
    setActionWord(MICRO_ACTIONS[Math.floor(Math.random() * MICRO_ACTIONS.length)]);
  }, []);

  // ── Arrival → Pattern → Glitch sequence ───────────────────────
  useEffect(() => {
    safeTimeout(() => setStage('pattern'), 2500);
    safeTimeout(() => {
      // Start glitch
      setStage('glitching');
      // Random glitch line indices
      const lines = Array.from({ length: 6 }, () => Math.floor(Math.random() * 12));
      setGlitchLines(lines);

      // After glitch, reveal the crack
      safeTimeout(() => {
        setStage('crack');
        // Word fades if not caught within 4 seconds
        fadeTimeoutRef.current = window.setTimeout(() => {
          if (!caught) {
            // Word fades but still completes — the seeing IS enough
            setStage('afterglow');
            onComplete?.();
          }
        }, 4500);
        timersRef.current.push(fadeTimeoutRef.current);
      }, 1200);
    }, 7000); // Let the pattern establish for ~4.5s

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // ── Catch the word ────────────────────────────────────────────
  const handleCatch = useCallback(() => {
    if (stage !== 'crack' || caught) return;
    setCaught(true);
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    setStage('caught');

    safeTimeout(() => {
      setStage('afterglow');
      onComplete?.();
    }, 4500);
  }, [stage, caught, onComplete]);

  // ── Pattern lines — the autopilot visual ──────────────────────
  const patternLines = useRef(
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      y: 8 + i * 7.5,
      width: 30 + Math.random() * 40,
      offset: Math.random() * 20,
    }))
  ).current;

  const isGlitchy = stage === 'glitching' || stage === 'crack';

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
        background: `radial-gradient(ellipse at 50% 50%, ${palette.indigoFaint}, ${palette.base} 75%)`,
        fontFamily: fonts.primary,
        cursor: 'default',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ── Background pattern — the autopilot ───────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        {patternLines.map(line => (
          <motion.div
            key={line.id}
            animate={{
              x: isGlitchy && glitchLines.includes(line.id)
                ? [0, (Math.random() - 0.5) * 40, 0, (Math.random() - 0.5) * 20, 0]
                : stage === 'caught' || stage === 'afterglow'
                ? [0, 2, 0]
                : [0, 0, 0],
              opacity: isGlitchy && glitchLines.includes(line.id)
                ? [0.08, 0.2, 0.05, 0.15, 0.08]
                : stage === 'afterglow'
                ? 0.04
                : [0.06, 0.1, 0.06],
            }}
            transition={{
              duration: isGlitchy ? 0.3 : stage === 'afterglow' ? 4 : 3,
              repeat: isGlitchy ? 3 : Infinity,
              ease: isGlitchy ? 'linear' : 'easeInOut',
              delay: isGlitchy ? 0 : line.id * 0.15,
            }}
            style={{
              position: 'absolute',
              top: `${line.y}%`,
              left: `${line.offset}%`,
              width: `${line.width}%`,
              height: '1px',
              background: palette.indigo,
              transition: 'opacity 2s ease',
            }}
          />
        ))}

        {/* Glitch scan line */}
        {isGlitchy && (
          <motion.div
            animate={{
              top: ['0%', '100%'],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: 2,
            }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${palette.neonGlow}, transparent)`,
            }}
          />
        )}
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
                Notice the rhythm
                <br />
                you didn't choose.
              </div>
            </motion.div>
          )}

          {/* ── Pattern — establishing autopilot ─────────────────── */}
          {stage === 'pattern' && (
            <motion.div
              key="pattern"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(2px)' }}
              transition={{ duration: 1 }}
              style={{
                textAlign: 'center',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Subtle repeating pulse — hypnotic, expected */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.15, 0.25, 0.15],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: `1px solid ${palette.indigo}`,
                }}
              />
            </motion.div>
          )}

          {/* ── Glitching — pattern breaks ───────────────────────── */}
          {stage === 'glitching' && (
            <motion.div
              key="glitch"
              initial={{ opacity: 1 }}
              animate={{
                opacity: [1, 0.3, 1, 0.5, 1],
                x: [0, -3, 5, -2, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'linear' }}
              style={{
                textAlign: 'center',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.div
                animate={{
                  borderColor: [palette.indigo, palette.neon, palette.indigo],
                  scale: [1, 1.1, 0.9, 1.05, 1],
                }}
                transition={{ duration: 1, ease: 'linear' }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: `1px solid ${palette.indigo}`,
                }}
              />
            </motion.div>
          )}

          {/* ── Crack — the word appears through the break ────────── */}
          {stage === 'crack' && (
            <motion.div
              key="crack"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                textAlign: 'center',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '32px',
              }}
            >
              {/* The word — emerging through the glitch */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
                animate={{
                  opacity: [0, 1, 1, 0.8],
                  scale: [0.8, 1, 1, 0.95],
                  filter: ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(2px)'],
                }}
                transition={{ duration: 4.5, times: [0, 0.15, 0.7, 1] }}
                onClick={handleCatch}
                style={{
                  fontSize: navicueType.hero.fontSize,
                  color: palette.neon,
                  fontFamily: fonts.secondary,
                  fontWeight: 400,
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  textShadow: `0 0 30px ${palette.neonGlow}`,
                  padding: '16px 40px',
                  position: 'relative',
                }}
              >
                {actionWord}

                {/* Glow behind word */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '-20px',
                    borderRadius: radius.xl,
                    background: `radial-gradient(circle, ${palette.indigoGlow}, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              </motion.div>

              {/* Whisper */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 0.5, duration: 1 }}
                style={{
                  fontSize: navicueType.caption.fontSize,
                  color: palette.textFaint,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                }}
              >
                catch it
              </motion.div>
            </motion.div>
          )}

          {/* ── Caught — the word solidifies ──────────────────────── */}
          {stage === 'caught' && (
            <motion.div
              key="caught"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
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
              {/* Word solidified */}
              <motion.div
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: navicueType.koan.fontSize,
                  color: palette.text,
                  fontFamily: fonts.secondary,
                  fontWeight: 400,
                  letterSpacing: '0.08em',
                }}
              >
                {actionWord}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 2, delay: 1 }}
                style={{
                  fontSize: navicueType.narrative.fontSize,
                  color: palette.text,
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}
              >
                The smallest different thing
                <br />
                is still different.
              </motion.div>

              {/* Subtle indication that the pattern has shifted */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 2, delay: 2 }}
                style={{
                  width: '100px',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${palette.indigo}, transparent)`,
                  transformOrigin: 'center',
                }}
              />
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
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: palette.indigo,
                  boxShadow: `0 0 20px ${palette.indigoGlow}`,
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
                Autopilot is comfortable.
                <br />
                That's the trap.
              </motion.div>

              <motion.div
                animate={{ opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 6, repeat: Infinity }}
                style={{
                  width: '140px',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${palette.indigo}, transparent)`,
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom line ──────────────────────────────────────────── */}
      <motion.div
        animate={{
          opacity: stage === 'afterglow' ? 0.3 : stage === 'caught' ? 0.25 : 0.1,
        }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${palette.indigo}, transparent)`,
        }}
      />
    </motion.div>
  );
}