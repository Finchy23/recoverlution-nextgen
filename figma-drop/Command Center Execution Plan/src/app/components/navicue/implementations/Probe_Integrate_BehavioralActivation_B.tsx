/**
 * Probe x Behavioral Activation x Believing
 * Magic Signature: sacred_ordinary
 *
 * THE THRESHOLD
 * "The edge is closer than you think."
 *
 * NEUROSCIENCE: The basal ganglia's habit loops create invisible
 * walls — things that feel impossible are often just unfamiliar.
 * Depth probing works by making the invisible visible. Each layer
 * you name reduces the amygdala's threat response because named
 * fears are processed by the prefrontal cortex, not the limbic system.
 * "What stops you?" becomes navigable the moment it has layers.
 *
 * INTERACTION: Concentric depth rings. Each tap drills deeper.
 * As you descend, textures resolve — what seemed solid becomes
 * layered. At the core: not a wall, but a door. The block was
 * never structural. It was just unexplored.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: "I can't" as a monolith
 * 2. Different action possible: drill into the layers
 * 3. Action executed: each tap reveals another question
 * 4. Evidence: the block has components → it's workable
 * 5. Repeated: barriers become puzzles, not walls
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

// ── Derive from blueprint ───────────────────────────────────────────
const { palette, atmosphere, motion: motionConfig } =
  navicueQuickstart('sacred_ordinary', 'Behavioral Activation', 'believing', 'Probe');

type Stage = 'arriving' | 'present' | 'drilling' | 'core' | 'afterglow';

const LAYERS = [
  'What stops you?',
  'What lies beneath that?',
  'And deeper still?',
  'There. The lever.',
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Probe_Integrate_BehavioralActivation_B({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [depth, setDepth] = useState(0);

  // ── Arrival ───────────────────────────────────────────────────
  useEffect(() => {
    const t = safeTimeout(() => setStage('present'), motionConfig.arrivingDuration);
    return () => clearTimeout(t);
  }, []);

  // ── Drill interaction ──────────────────────────────────────────
  const handleDrill = useCallback(() => {
    if (stage === 'core' || stage === 'afterglow') return;

    const next = depth + 1;
    setDepth(next);
    setStage('drilling');

    if (next >= LAYERS.length - 1) {
      safeTimeout(() => {
        setStage('core');
        safeTimeout(() => {
          setStage('afterglow');
          onComplete?.();
        }, motionConfig.afterglowDuration);
      }, 2000);
    }
  }, [stage, depth, onComplete]);

  // ── Derived values ────────────────────────────────────────────
  const progress = depth / (LAYERS.length - 1);
  const breathProgress = stage === 'afterglow' ? 1 : stage === 'core' ? 0.8 : progress * 0.6;
  const totalRings = 5;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Behavioral Activation" kbe="believing" form="Probe" mode="immersive" breathProgress={breathProgress} isAfterglow={stage === 'afterglow'} particleSeed={10}>
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
              Something is in the way.
              <br />
              Let's see what it's made of.
            </div>
          </motion.div>
        )}

        {/* ── Present + Drilling — the depth rings ──────────── */}
        {(stage === 'present' || stage === 'drilling') && (
          <motion.div
            key="depth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '48px',
            }}
          >
            {/* Concentric depth rings */}
            <motion.div
              onClick={handleDrill}
              style={{
                position: 'relative',
                width: '260px',
                height: '260px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {Array.from({ length: totalRings }).map((_, i) => {
                const size = 260 - i * 48;
                const isPassed = i < depth;
                const isCurrent = i === depth;
                return (
                  <motion.div
                    key={i}
                    animate={{
                      opacity: isPassed ? 0.1 : isCurrent ? 0.5 : 0.2,
                      scale: isCurrent ? [1, 1.02, 1] : 1,
                    }}
                    transition={{
                      opacity: { duration: 0.6 },
                      scale: { duration: 3, repeat: Infinity },
                    }}
                    style={{
                      position: 'absolute',
                      width: `${size}px`,
                      height: `${size}px`,
                      borderRadius: '50%',
                      border: `1px solid ${isPassed ? palette.accent : palette.primary}`,
                      transition: 'border-color 0.6s ease',
                    }}
                  />
                );
              })}

              {/* Core point — grows luminous as you approach */}
              <motion.div
                animate={{
                  scale: depth >= LAYERS.length - 1 ? [1, 1.3, 1] : 1,
                  opacity: 0.2 + progress * 0.7,
                }}
                transition={{ scale: { duration: 2, repeat: Infinity } }}
                style={{
                  width: `${12 + progress * 10}px`,
                  height: `${12 + progress * 10}px`,
                  borderRadius: '50%',
                  background: progress > 0.5 ? palette.accent : palette.primary,
                  boxShadow: progress > 0.5
                    ? `0 0 ${20 + progress * 40}px ${palette.accentGlow}`
                    : 'none',
                  transition: 'all 0.6s ease',
                }}
              />

              {/* Drill indicator descending */}
              <motion.div
                animate={{ y: depth * 16, opacity: 0.4 + progress * 0.3 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  width: '1.5px',
                  height: '24px',
                  background: `linear-gradient(${palette.accent}, transparent)`,
                }}
              />
            </motion.div>

            {/* Layer narration */}
            <div style={{ minHeight: '60px', textAlign: 'center' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={depth}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 1 }}
                  style={{ ...navicueType.texture, color: palette.text }}
                >
                  {depth < LAYERS.length ? LAYERS[depth] : ''}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Touch invitation */}
            {stage === 'present' && depth === 0 && (
              <motion.div
                animate={{ opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ ...navicueType.hint, color: palette.textFaint }}
              >
                tap to go deeper
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Core — the lever found ────────────────────────── */}
        {stage === 'core' && (
          <motion.div
            key="core"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5 }}
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            {/* Core luminance */}
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 40px ${palette.accentGlow}`,
                  `0 0 80px ${palette.accentGlow}`,
                  `0 0 40px ${palette.accentGlow}`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${palette.accent}, ${palette.accentGlow})`,
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, delay: 0.8 }}
              style={{ ...navicueType.prompt, color: palette.text }}
            >
              Not a wall.
              <br />
              A door you haven't opened.
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
              The things that block you
              <br />
              are made of things you can name.
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