/**
 * NOVICE COLLECTION #6
 * The Reality Anchor
 *
 * "You are here. This is real."
 *
 * The screen drifts — unmoored, soft blur. Then a whisper: "Where are
 * you right now?" Five sensory prompts appear one at a time, each a
 * poetic invitation. Each tap anchors a glowing node. Lines connect
 * them — a constellation of presence forming in real time. Five anchors
 * and you are grounded. The constellation pulses. Then folds into a
 * single warm point. "Grounded."
 *
 * NEUROSCIENCE: Sensory grounding activates the somatosensory cortex
 * and deactivates the default mode network (DMN) — the brain's
 * rumination highway. When attention lands on concrete sensory input
 * (what you see, hear, touch), the amygdala receives a safety signal:
 * "right now, right here, nothing is wrong." This is the mechanism
 * beneath every grounding exercise. The Reality Anchor makes it
 * visible: each sense becomes a literal point of light.
 *
 * INTERACTION: Five sequential sensory invitations. Each one waits for
 * a tap. Each tap creates a luminous anchor node. Thin connecting lines
 * build between them — a constellation. When all five are placed, the
 * constellation breathes. Then folds into one point. Grounded.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: dissociation, rumination, floating in abstraction
 * 2. Different action possible: land in the body, sense by sense
 * 3. Action executed: five taps, five anchors, tangible presence
 * 4. Evidence: the constellation exists. You built it from real contact.
 * 5. Repeated: grounding becomes a 15-second skill, not a crisis tool
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
  navicueQuickstart('sensory_cinema', 'Exposure', 'embodying', 'Practice');

type Stage = 'arriving' | 'asking' | 'anchoring' | 'resonant' | 'afterglow';

// Five sensory prompts — poetic, not clinical
const SENSES = [
  { id: 'see',   prompt: 'Something you can see right now.' },
  { id: 'hear',  prompt: 'A sound, even faint.' },
  { id: 'touch', prompt: 'Something you can feel against your skin.' },
  { id: 'smell', prompt: 'A scent in the air.' },
  { id: 'taste', prompt: 'A taste, even old.' },
];

// Constellation node positions — arranged in a gentle organic spread
const NODE_POSITIONS = [
  { x: 50, y: 30 },   // see — top center
  { x: 72, y: 42 },   // hear — right
  { x: 64, y: 65 },   // touch — lower right
  { x: 36, y: 65 },   // smell — lower left
  { x: 28, y: 42 },   // taste — left
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Novice_RealityAnchor({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [currentSense, setCurrentSense] = useState(0); // 0-4 during anchoring
  const [anchored, setAnchored] = useState<boolean[]>([false, false, false, false, false]);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => {
    addTimer(() => setStage('asking'), 1000);
    addTimer(() => setStage('anchoring'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const handleTap = useCallback(() => {
    if (stage !== 'anchoring') return;
    if (currentSense >= SENSES.length) return;

    const next = [...anchored];
    next[currentSense] = true;
    setAnchored(next);

    if (currentSense === SENSES.length - 1) {
      // All five anchored
      addTimer(() => setStage('resonant'), 1200);
      addTimer(() => {
        setStage('afterglow');
        onComplete?.();
      }, 8000);
    } else {
      // Next sense after a brief pause
      addTimer(() => setCurrentSense(prev => prev + 1), 900);
    }
  }, [stage, currentSense, anchored, onComplete]);

  const anchoredCount = anchored.filter(Boolean).length;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Exposure" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      {/* ── Drifting background — unmoored at start, steadies ──── */}
      <DriftField stage={stage} anchoredCount={anchoredCount} palette={palette} />

      {/* ── Constellation layer ────────────────────────────────── */}
      <svg
        viewBox="0 0 100 100"
        style={{
          position: 'absolute',
          inset: '10%',
          width: '80%',
          height: '80%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {/* Connecting lines — appear between anchored nodes */}
        {anchored.map((isAnchored, i) => {
          if (!isAnchored) return null;
          // Connect to the NEXT anchored node
          const nextIdx = anchored.findIndex((a, j) => j > i && a);
          if (nextIdx === -1) {
            // Connect last to first to close the constellation
            if (anchoredCount >= 3 && i === anchored.lastIndexOf(true)) {
              const firstIdx = anchored.indexOf(true);
              if (firstIdx !== i) {
                return (
                  <motion.line
                    key={`line-close-${i}`}
                    x1={NODE_POSITIONS[i].x}
                    y1={NODE_POSITIONS[i].y}
                    x2={NODE_POSITIONS[firstIdx].x}
                    y2={NODE_POSITIONS[firstIdx].y}
                    stroke={palette.primary}
                    strokeWidth="0.3"
                    strokeOpacity="0.2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                );
              }
            }
            return null;
          }
          return (
            <motion.line
              key={`line-${i}-${nextIdx}`}
              x1={NODE_POSITIONS[i].x}
              y1={NODE_POSITIONS[i].y}
              x2={NODE_POSITIONS[nextIdx].x}
              y2={NODE_POSITIONS[nextIdx].y}
              stroke={palette.primary}
              strokeWidth="0.3"
              strokeOpacity="0.2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          );
        })}

        {/* Anchor nodes */}
        {NODE_POSITIONS.map((pos, i) => (
          <AnchorNode
            key={`node-${i}`}
            cx={pos.x}
            cy={pos.y}
            isAnchored={anchored[i]}
            isCurrent={stage === 'anchoring' && currentSense === i}
            isResonant={stage === 'resonant'}
            isAfterGlow={stage === 'afterglow'}
            palette={palette}
            index={i}
          />
        ))}
      </svg>

      {/* ── Central text area ──────────────────────────────────── */}
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
          {/* ── Asking: "Where are you right now?" ─────────────── */}
          {stage === 'asking' && (
            <motion.div
              key="asking"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.7, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                ...navicueType.prompt,
                color: palette.text,
                textAlign: 'center',
                maxWidth: '240px',
              }}
            >
              Where are you
              <br />
              right now?
            </motion.div>
          )}

          {/* ── Anchoring: sensory prompts ─────────────────────── */}
          {stage === 'anchoring' && (
            <motion.div
              key={`sense-${currentSense}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.65, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '28px',
              }}
            >
              <div
                style={{
                  ...navicueType.texture,
                  color: palette.textSecondary,
                  textAlign: 'center',
                  maxWidth: '240px',
                  lineHeight: 1.7,
                }}
              >
                {SENSES[currentSense].prompt}
              </div>

              <motion.button
                whileHover={{ scale: 1.06, opacity: 0.8 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTap}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{
                  background: 'none',
                  border: `1px solid ${palette.primary}`,
                  borderRadius: radius.full, // True pill — was hardcoded '20px'
                  padding: '14px 28px',
                  cursor: 'pointer',
                  fontFamily: fonts.secondary,
                  fontStyle: 'italic',
                  fontSize: '13px',
                  fontWeight: 300,
                  color: palette.textSecondary,
                  letterSpacing: '0.04em',
                  transition: 'all 0.3s ease',
                }}
              >
                found it
              </motion.button>

              {/* Progress dots */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {SENSES.map((_, i) => (
                  <motion.div
                    key={`dot-${i}`}
                    animate={{
                      background: anchored[i]
                        ? palette.primary
                        : i === currentSense
                          ? palette.primaryGlow
                          : 'rgba(255,255,255,0.08)',
                      scale: i === currentSense ? 1.3 : 1,
                    }}
                    transition={{ duration: 0.4 }}
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Resonant: constellation complete ───────────────── */}
          {stage === 'resonant' && (
            <motion.div
              key="resonant"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  ...navicueType.prompt,
                  color: palette.text,
                  textAlign: 'center',
                  maxWidth: '240px',
                  lineHeight: 1.7,
                }}
              >
                You are here.
                <br />
                This is real.
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.25 }}
                transition={{ duration: 2, delay: 1.5 }}
                style={{
                  ...navicueType.hint,
                  color: palette.textFaint,
                  letterSpacing: '0.06em',
                }}
              >
                five points of contact
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
              {/* Single anchor point — the constellation folded */}
              <motion.div
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: palette.primary,
                  boxShadow: `0 0 24px ${palette.primaryGlow}, 0 0 48px ${palette.primaryGlow}`,
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
                Grounded.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom breath line ─────────────────────────────────── */}
      <motion.div
        animate={{
          scaleX: stage === 'anchoring'
            ? 0.1 + anchoredCount * 0.15
            : stage === 'resonant' ? 0.6
            : stage === 'afterglow' ? 0
            : 0.1,
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
          zIndex: 3,
        }}
      />
    </NaviCueShell>
  );
}

// ── Drift Field — background particles that settle as you anchor ──
function DriftField({
  stage,
  anchoredCount,
  palette,
}: {
  stage: Stage;
  anchoredCount: number;
  palette: any;
}) {
  // Particles drift fast when ungrounded, slow as anchors accumulate
  const driftSpeed = Math.max(1, 6 - anchoredCount * 1.2);
  const blurAmount = Math.max(0, 4 - anchoredCount);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        filter: stage === 'arriving' ? `blur(${blurAmount}px)` : `blur(${blurAmount * 0.5}px)`,
        transition: 'filter 1.5s ease',
      }}
    >
      {/* Ambient glow */}
      <motion.div
        animate={{
          opacity: stage === 'afterglow' ? 0.04 : stage === 'resonant' ? 0.1 : 0.06,
        }}
        transition={{ duration: 3 }}
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(ellipse at 50% 50%, ${palette.primaryGlow}, transparent 65%)`,
        }}
      />

      {/* Drifting particles */}
      {[...Array(8)].map((_, i) => {
        const startX = 15 + (i * 11) % 70;
        const startY = 20 + (i * 17) % 60;
        return (
          <motion.div
            key={`drift-${i}`}
            animate={{
              x: [0, (i % 2 === 0 ? 1 : -1) * (12 * driftSpeed), 0],
              y: [0, (i % 3 === 0 ? -1 : 1) * (8 * driftSpeed), 0],
              opacity: stage === 'afterglow'
                ? [0.03, 0.01, 0.03]
                : [0.04, 0.08, 0.04],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.7,
            }}
            style={{
              position: 'absolute',
              left: `${startX}%`,
              top: `${startY}%`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              borderRadius: '50%',
              background: palette.primary,
            }}
          />
        );
      })}
    </div>
  );
}

// ── Anchor Node — SVG circle that lights up when anchored ─────────
function AnchorNode({
  cx,
  cy,
  isAnchored,
  isCurrent,
  isResonant,
  isAfterGlow,
  palette,
  index,
}: {
  cx: number;
  cy: number;
  isAnchored: boolean;
  isCurrent: boolean;
  isResonant: boolean;
  isAfterGlow: boolean;
  palette: any;
  index: number;
}) {
  if (isAfterGlow) {
    // During afterglow, all nodes migrate toward center
    return (
      <motion.circle
        cx={cx}
        cy={cy}
        r={1}
        fill={palette.primary}
        initial={{ opacity: isAnchored ? 0.5 : 0 }}
        animate={{
          cx: 50,
          cy: 50,
          opacity: 0,
          r: 0.5,
        }}
        transition={{
          duration: 3,
          delay: index * 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    );
  }

  if (!isAnchored && !isCurrent) return null;

  return (
    <g>
      {/* Glow halo */}
      {isAnchored && (
        <motion.circle
          cx={cx}
          cy={cy}
          r={3}
          fill={palette.primaryGlow}
          initial={{ opacity: 0, r: 1 }}
          animate={{
            opacity: isResonant ? [0.1, 0.2, 0.1] : 0.12,
            r: isResonant ? [3, 4, 3] : 3,
          }}
          transition={{
            duration: isResonant ? 3 : 1.5,
            repeat: isResonant ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Core dot */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={isCurrent && !isAnchored ? 0.8 : 1.2}
        fill={isAnchored ? palette.primary : palette.primaryGlow}
        initial={{ opacity: 0, scale: 0 }}
        animate={{
          opacity: isAnchored ? 0.7 : isCurrent ? [0.15, 0.3, 0.15] : 0,
          r: isAnchored ? 1.2 : 0.8,
        }}
        transition={{
          duration: isCurrent && !isAnchored ? 2 : 0.8,
          repeat: isCurrent && !isAnchored ? Infinity : 0,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </g>
  );
}