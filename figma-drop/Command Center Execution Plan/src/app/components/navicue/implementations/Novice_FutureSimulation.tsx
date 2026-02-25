/**
 * NOVICE COLLECTION #9
 * The Future Simulation
 *
 * "You already know how the old story ends. Here's another one."
 *
 * Two timelines. Same starting point, different choices. The old path
 * plays out — familiar, predictable, depleting. Then the new path —
 * uncertain, alive, growing. The user sees both futures unfold and
 * chooses which one to step toward.
 *
 * NEUROSCIENCE: Prospective memory simulation (Schacter & Addis).
 * The hippocampus and default mode network construct future scenarios
 * by recombining episodic memory fragments. When you vividly simulate
 * a future outcome, the brain treats it as partially experienced —
 * creating motivation through "pre-lived" consequences. Seeing the
 * old pattern's endpoint weakens its pull. Seeing the new path's
 * possibility strengthens approach motivation.
 *
 * INTERACTION: Two vertical timelines appear side by side. The old
 * path reveals itself first — each stage familiar, heavy. Then the
 * new path — each stage uncertain but alive. Both reach an endpoint.
 * The user taps the one they choose. The chosen path glows. The
 * unchosen one fades. "You chose."
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: autopilot, default future, no agency
 * 2. Different action possible: see both futures
 * 3. Action executed: chose the new path (or honored the old one)
 * 4. Evidence: the simulation is real. Your body felt the difference.
 * 5. Repeated: future-self connection builds decision momentum
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
  navicueQuickstart('poetic_precision', 'Behavioral Activation', 'believing', 'Mirror');

type Stage = 'arriving' | 'oldPath' | 'newPath' | 'choosing' | 'chosen' | 'afterglow';

// Timeline stages — the old path feels heavy, the new path feels alive
const OLD_PATH = [
  'the same morning',
  'the same avoidance',
  'the same exhaustion',
  'the same regret',
];

const NEW_PATH = [
  'a different morning',
  'a small brave choice',
  'the unfamiliar road',
  'something you built',
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Novice_FutureSimulation({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [oldRevealed, setOldRevealed] = useState(0);
  const [newRevealed, setNewRevealed] = useState(0);
  const [chosen, setChosen] = useState<'old' | 'new' | null>(null);
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => {
    // Arriving → old path begins revealing
    addTimer(() => setStage('oldPath'), 1000);

    // Old path reveals stage by stage
    addTimer(() => setOldRevealed(1), 1800);
    addTimer(() => setOldRevealed(2), 2800);
    addTimer(() => setOldRevealed(3), 3800);
    addTimer(() => setOldRevealed(4), 4800);

    // New path begins
    addTimer(() => setStage('newPath'), 5800);
    addTimer(() => setNewRevealed(1), 6600);
    addTimer(() => setNewRevealed(2), 7600);
    addTimer(() => setNewRevealed(3), 8600);
    addTimer(() => setNewRevealed(4), 9600);

    // Choosing
    addTimer(() => setStage('choosing'), 10800);

    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  const handleChoose = (path: 'old' | 'new') => {
    if (stage !== 'choosing') return;
    setChosen(path);
    setStage('chosen');
    addTimer(() => {
      setStage('afterglow');
      onComplete?.();
    }, 7000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Behavioral Activation" kbe="believing" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      {/* ── Ambient ────────────────────────────────────────────── */}
      <motion.div
        animate={{
          opacity: stage === 'chosen' || stage === 'afterglow' ? 0.08 : 0.03,
        }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute',
          inset: '-15%',
          background: `radial-gradient(ellipse at 50% 40%, ${palette.primaryGlow}, transparent 65%)`,
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
          {/* ── Two timelines side by side ──────────────────────── */}
          {(stage === 'oldPath' || stage === 'newPath' || stage === 'choosing' || stage === 'chosen') && (
            <motion.div
              key="timelines"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              style={{
                display: 'flex',
                gap: '32px',
                width: '100%',
                justifyContent: 'center',
              }}
            >
              {/* Old path */}
              <TimelinePath
                items={OLD_PATH}
                revealed={oldRevealed}
                label="the familiar path"
                isChosen={chosen === 'old'}
                isFaded={chosen === 'new'}
                isClickable={stage === 'choosing'}
                onClick={() => handleChoose('old')}
                palette={palette}
                dimColor="hsla(0, 0%, 50%, 0.3)"
              />

              {/* Vertical separator */}
              <motion.div
                animate={{
                  opacity: chosen ? 0.05 : 0.08,
                }}
                transition={{ duration: 1 }}
                style={{
                  width: '1px',
                  background: `linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)`,
                  alignSelf: 'stretch',
                }}
              />

              {/* New path */}
              <TimelinePath
                items={NEW_PATH}
                revealed={newRevealed}
                label="the other path"
                isChosen={chosen === 'new'}
                isFaded={chosen === 'old'}
                isClickable={stage === 'choosing'}
                onClick={() => handleChoose('new')}
                palette={palette}
                dimColor="hsla(0, 0%, 50%, 0.3)"
              />
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
              {/* Two dots — one bright, one dim */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <motion.div
                  animate={{
                    opacity: chosen === 'old' ? [0.4, 0.6, 0.4] : [0.08, 0.12, 0.08],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: chosen === 'old' ? palette.primary : palette.textFaint,
                    boxShadow: chosen === 'old' ? `0 0 16px ${palette.primaryGlow}` : 'none',
                  }}
                />
                <motion.div
                  animate={{
                    opacity: chosen === 'new' ? [0.4, 0.6, 0.4] : [0.08, 0.12, 0.08],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: chosen === 'new' ? palette.primary : palette.textFaint,
                    boxShadow: chosen === 'new' ? `0 0 16px ${palette.primaryGlow}` : 'none',
                  }}
                />
              </div>

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
                You chose.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Choosing instruction ─────────────────────────────── */}
        <AnimatePresence>
          {stage === 'choosing' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.35, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                bottom: '-50px',
                ...navicueType.hint,
                color: palette.textFaint,
                letterSpacing: '0.06em',
              }}
            >
              tap the path you choose
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom breath line ─────────────────────────────────── */}
      <motion.div
        animate={{
          scaleX: stage === 'chosen' ? 0.4 : stage === 'afterglow' ? 0 : 0.15,
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

// ── Timeline Path ───────────────────────────────────────────────────
function TimelinePath({
  items,
  revealed,
  label,
  isChosen,
  isFaded,
  isClickable,
  onClick,
  palette,
  dimColor,
}: {
  items: string[];
  revealed: number;
  label: string;
  isChosen: boolean;
  isFaded: boolean;
  isClickable: boolean;
  onClick: () => void;
  palette: any;
  dimColor: string;
}) {
  return (
    <motion.button
      onClick={isClickable ? onClick : undefined}
      whileHover={isClickable ? { scale: 1.02 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      animate={{
        opacity: isFaded ? 0.15 : 1,
      }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'none',
        border: 'none',
        cursor: isClickable ? 'pointer' : 'default',
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        flex: 1,
        borderRadius: radius.md,
        overflow: 'hidden',
        transition: 'background 0.3s ease',
      }}
      onMouseEnter={(e) => {
        if (isClickable) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'none';
      }}
    >
      {/* Label */}
      <motion.div
        animate={{
          opacity: revealed > 0 ? 0.3 : 0,
          color: isChosen ? palette.text : dimColor,
        }}
        transition={{ duration: 1 }}
        style={{
          fontSize: '11px',
          fontFamily: fonts.mono,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '4px',
        }}
      >
        {label}
      </motion.div>

      {/* Timeline items */}
      {items.map((item, i) => (
        <motion.div
          key={`${label}-${i}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{
            opacity: i < revealed
              ? isChosen ? 0.7 : isFaded ? 0.1 : 0.45
              : 0,
            y: i < revealed ? 0 : 6,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
          }}
        >
          {/* Node dot */}
          <div
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: isChosen ? palette.primary : 'rgba(255,255,255,0.2)',
              flexShrink: 0,
              boxShadow: isChosen ? `0 0 8px ${palette.primaryGlow}` : 'none',
              transition: 'all 1s ease',
            }}
          />
          <div
            style={{
              fontSize: 'clamp(12px, 2.2vw, 14px)',
              fontFamily: fonts.secondary,
              fontStyle: 'italic',
              fontWeight: 300,
              color: isChosen ? palette.textSecondary : 'rgba(255,255,255,0.35)',
              lineHeight: 1.4,
              textAlign: 'left',
              transition: 'color 1s ease',
            }}
          >
            {item}
          </div>
        </motion.div>
      ))}

      {/* Chosen indicator */}
      <AnimatePresence>
        {isChosen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              ...navicueType.hint,
              color: palette.primary,
              marginTop: '8px',
              letterSpacing: '0.06em',
            }}
          >
            this one
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}