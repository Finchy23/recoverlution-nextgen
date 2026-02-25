/**
 * NOVICE COLLECTION #10
 * The Connection Thread
 *
 * "Somewhere, right now, someone else is feeling exactly this."
 *
 * You feel alone in your struggle. Then a thread of light extends
 * outward from you. Other threads appear — faint, far, real. They pulse
 * in a shared rhythm. You are not the only one. The thread connecting
 * you to others was always there. You just couldn't see it.
 *
 * NEUROSCIENCE: Common humanity (Neff's self-compassion framework).
 * The brain's default response to suffering is isolation — "I'm the
 * only one." The anterior insula activates both for personal pain and
 * observed pain in others. When you recognize shared suffering, the
 * temporoparietal junction (TPJ) creates perspective-taking, reducing
 * isolation and activating the caregiving system. This isn't sympathy.
 * It's recognition: "We're all in this."
 *
 * INTERACTION: A single point of light — you. Then a prompt about
 * what you're carrying. Tap. A thread extends outward into the dark.
 * Other threads appear from the edges — faint, anonymous, real. They
 * all pulse together. A shared heartbeat. "Not alone in this."
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: isolation, "only I feel this," shame
 * 2. Different action possible: recognize shared humanity
 * 3. Action executed: the threads appear. Others are here.
 * 4. Evidence: the shared pulse. You felt it. It's real.
 * 5. Repeated: isolation loses its grip. Connection becomes reflex.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  navicueQuickstart,
  navicueType,
  immersiveTapButton,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

// ── Derive from blueprint ─────────────────────────────────────────
const { palette } =
  navicueQuickstart('relational_ghost', 'Self-Compassion', 'embodying', 'Parts Rollcall');

type Stage = 'arriving' | 'alone' | 'reaching' | 'connecting' | 'pulse' | 'afterglow';

// Other threads — angles and distances from center (representing other people)
const OTHER_THREADS = [
  { angle: -35, distance: 85, delay: 0.3 },
  { angle: 15, distance: 90, delay: 0.8 },
  { angle: -65, distance: 75, delay: 1.3 },
  { angle: 45, distance: 80, delay: 1.8 },
  { angle: -15, distance: 95, delay: 2.3 },
  { angle: 70, distance: 70, delay: 2.8 },
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Novice_ConnectionThread({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => {
    // arriving → alone (you, a single point)
    addTimer(() => setStage('alone'), 800);
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const handleReach = () => {
    if (stage !== 'alone') return;
    setStage('reaching');

    // Thread extends outward
    addTimer(() => setStage('connecting'), 2000);
    // Others appear
    addTimer(() => setStage('pulse'), 6000);
    // Afterglow
    addTimer(() => {
      setStage('afterglow');
      onComplete?.();
    }, 13000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Self-Compassion" kbe="embodying" form="PartsRollcall" mode="immersive" isAfterglow={stage === 'afterglow'}>
      {/* ── Shared pulse glow — appears during connection ──────── */}
      <motion.div
        animate={{
          opacity: stage === 'pulse'
            ? [0.03, 0.08, 0.03]
            : stage === 'connecting' ? 0.04 : stage === 'afterglow' ? 0.03 : 0,
          scale: stage === 'pulse' ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: stage === 'pulse' ? 3 : 2,
          repeat: stage === 'pulse' ? Infinity : 0,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          inset: '-30%',
          background: `radial-gradient(ellipse at 50% 55%, ${palette.primaryGlow}, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Thread visualization (SVG) ─────────────────────────── */}
      <svg
        viewBox="0 0 200 200"
        style={{
          position: 'absolute',
          inset: '5%',
          width: '90%',
          height: '90%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {/* Your thread — extends upward from center */}
        {(stage === 'reaching' || stage === 'connecting' || stage === 'pulse' || stage === 'afterglow') && (
          <motion.line
            x1={100} y1={115}
            x2={100} y2={30}
            stroke={palette.primary}
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: stage === 'reaching' ? 0.3 : 1,
              opacity: stage === 'afterglow' ? 0.15 : 0.3,
            }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          />
        )}

        {/* Other people's threads — appear during connecting */}
        {(stage === 'connecting' || stage === 'pulse' || stage === 'afterglow') &&
          OTHER_THREADS.map((thread, i) => {
            const radians = (thread.angle * Math.PI) / 180;
            const endX = 100 + Math.sin(radians) * thread.distance;
            const endY = 115 - Math.cos(radians) * thread.distance;

            return (
              <g key={`thread-${i}`}>
                {/* Thread line */}
                <motion.line
                  x1={100} y1={115}
                  x2={endX} y2={endY}
                  stroke={palette.primary}
                  strokeWidth="0.3"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: stage === 'afterglow' ? 0.08 : stage === 'pulse' ? [0.1, 0.2, 0.1] : 0.15,
                  }}
                  transition={{
                    pathLength: { duration: 2, delay: thread.delay, ease: [0.22, 1, 0.36, 1] },
                    opacity: stage === 'pulse'
                      ? { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: thread.delay * 0.3 }
                      : { duration: 1.5, delay: thread.delay },
                  }}
                />

                {/* Other person's node */}
                <motion.circle
                  cx={endX} cy={endY} r={1.5}
                  fill={palette.primary}
                  initial={{ opacity: 0, r: 0 }}
                  animate={{
                    opacity: stage === 'afterglow' ? 0.1 : stage === 'pulse' ? [0.15, 0.3, 0.15] : 0.2,
                    r: 1.5,
                  }}
                  transition={{
                    opacity: stage === 'pulse'
                      ? { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: thread.delay * 0.3 }
                      : { duration: 1, delay: thread.delay + 1.5 },
                    r: { duration: 0.8, delay: thread.delay + 1.5, ease: [0.22, 1, 0.36, 1] },
                  }}
                />
              </g>
            );
          })}

        {/* Your node — center, always present after arriving */}
        {stage !== 'arriving' && (
          <motion.circle
            cx={100} cy={115} r={2.5}
            fill={palette.primary}
            initial={{ opacity: 0 }}
            animate={{
              opacity: stage === 'pulse' ? [0.4, 0.7, 0.4] : stage === 'afterglow' ? 0.3 : 0.5,
              r: stage === 'pulse' ? [2.5, 3, 2.5] : 2.5,
            }}
            transition={{
              duration: stage === 'pulse' ? 3 : 1,
              repeat: stage === 'pulse' ? Infinity : 0,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Glow around your node */}
        {stage !== 'arriving' && (
          <motion.circle
            cx={100} cy={115} r={6}
            fill={palette.primaryGlow}
            initial={{ opacity: 0 }}
            animate={{
              opacity: stage === 'pulse' ? [0.05, 0.12, 0.05] : 0.06,
            }}
            transition={{
              duration: 3,
              repeat: stage === 'pulse' ? Infinity : 0,
              ease: 'easeInOut',
            }}
          />
        )}
      </svg>

      {/* ── Text layer ─────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <AnimatePresence mode="wait">
          {/* ── Alone: single prompt ───────────────────────────── */}
          {stage === 'alone' && (
            <motion.div
              key="alone"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '32px',
              }}
            >
              <div
                style={{
                  ...navicueType.texture,
                  color: palette.textSecondary,
                  textAlign: 'center',
                  maxWidth: '240px',
                  lineHeight: 1.8,
                }}
              >
                You feel like the only one
                <br />
                carrying this.
              </div>

              <motion.button
                whileHover={{ scale: 1.05, opacity: 0.8 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReach}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.45 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                style={{
                  ...immersiveTapButton(palette).base,
                  color: palette.textFaint,
                }}
              >
                reach out
              </motion.button>
            </motion.div>
          )}

          {/* ── Reaching: thread extending ──────────────────────── */}
          {stage === 'reaching' && (
            <motion.div
              key="reaching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              style={{
                ...navicueType.hint,
                color: palette.textFaint,
                textAlign: 'center',
                letterSpacing: '0.06em',
              }}
            >
              reaching...
            </motion.div>
          )}

          {/* ── Connecting: others appear ───────────────────────── */}
          {stage === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, delay: 2 }}
              style={{
                ...navicueType.texture,
                color: palette.textSecondary,
                textAlign: 'center',
                maxWidth: '260px',
                lineHeight: 1.8,
              }}
            >
              Somewhere right now,
              <br />
              someone else is feeling
              <br />
              exactly this.
            </motion.div>
          )}

          {/* ── Pulse: shared heartbeat ─────────────────────────── */}
          {stage === 'pulse' && (
            <motion.div
              key="pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                ...navicueType.prompt,
                color: palette.text,
                textAlign: 'center',
                maxWidth: '240px',
                lineHeight: 1.7,
              }}
            >
              Not alone
              <br />
              in this.
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                transition={{ duration: 3, delay: 1 }}
                style={{
                  ...navicueType.afterglow,
                  color: palette.textFaint,
                  textAlign: 'center',
                }}
              >
                Connected.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom breath line ─────────────────────────────────── */}
      <motion.div
        animate={{
          scaleX: stage === 'pulse' ? [0.3, 0.5, 0.3]
            : stage === 'connecting' ? 0.3
            : stage === 'afterglow' ? 0
            : 0.1,
          opacity: stage === 'afterglow' ? 0 : 0.12,
        }}
        transition={{
          duration: stage === 'pulse' ? 3 : 2,
          repeat: stage === 'pulse' ? Infinity : 0,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
          transformOrigin: 'center',
          zIndex: 3,
        }}
      />
    </NaviCueShell>
  );
}