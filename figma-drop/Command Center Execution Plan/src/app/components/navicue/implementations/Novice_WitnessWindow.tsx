/**
 * NOVICE COLLECTION #3
 * The Witness Window
 *
 * "You are not the storm. You are the sky watching the storm."
 *
 * A single thought fills your entire world. Then the camera pulls back.
 * Slowly, steadily, the thought shrinks. More space opens. Other thoughts
 * appear in the periphery — faint, passing. You realize: you were never
 * the thought. You were the one watching it.
 *
 * NEUROSCIENCE: Cognitive defusion (ACT). The dorsomedial prefrontal
 * cortex creates "metacognitive distance" — the ability to observe a
 * thought without being fused with it. This is literally what meditation
 * builds: the gap between stimulus and response. The Witness Window
 * makes this invisible neural process visible and felt.
 *
 * INTERACTION: A thought-word fills the screen (overwhelming, close).
 * The z-axis pulls back — parallax layers separate. The thought shrinks
 * into a small contained shape. Other passing thoughts drift through
 * the periphery. The observer position is revealed. Then space.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: thought = reality, no distance
 * 2. Different action possible: watch the thought instead of being it
 * 3. Action executed: the pullback creates physical felt distance
 * 4. Evidence: the thought is small. You are large. Both are true.
 * 5. Repeated: the witness becomes available in real life
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
const { palette, atmosphere, radius } =
  navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'Mirror');

type Stage = 'arriving' | 'close' | 'pulling' | 'witness' | 'afterglow';

// Passing thoughts that drift through the periphery once distance is created
const PASSING_THOUGHTS = [
  'what if…',
  'I should have…',
  'not enough',
  'tomorrow',
  'always',
  'why did I…',
  'they think…',
  'what now',
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Novice_WitnessWindow({
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
    // arriving → close (thought fills the screen)
    addTimer(() => setStage('close'), 600);
    // close → pulling (camera begins to pull back)
    addTimer(() => setStage('pulling'), 4000);
    // pulling → witness (full distance achieved)
    addTimer(() => setStage('witness'), 9000);
    // witness → afterglow
    addTimer(() => {
      setStage('afterglow');
      onComplete?.();
    }, 16000);

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // ── Depth layer calculations ────────────────────────────────────
  const getThoughtScale = () => {
    switch (stage) {
      case 'arriving': return 0;
      case 'close': return 3.5;      // Overwhelming, fills everything
      case 'pulling': return 1.0;    // Normal size, creating distance
      case 'witness': return 0.45;   // Small, contained, just a thought
      case 'afterglow': return 0.2;
    }
  };

  const getThoughtOpacity = () => {
    switch (stage) {
      case 'arriving': return 0;
      case 'close': return 1;
      case 'pulling': return 0.8;
      case 'witness': return 0.5;
      case 'afterglow': return 0.15;
    }
  };

  const getFrameOpacity = () => {
    switch (stage) {
      case 'arriving':
      case 'close': return 0;
      case 'pulling': return 0.15;
      case 'witness': return 0.3;
      case 'afterglow': return 0.1;
    }
  };

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      {/* ── Depth field — subtle background parallax layers ───── */}
      <DepthField stage={stage} />

      {/* ── The Window Frame — reveals itself during pullback ─── */}
      <motion.div
        animate={{
          opacity: getFrameOpacity(),
          scale: stage === 'witness' || stage === 'afterglow' ? 1 : 1.3,
        }}
        transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {/* Rounded inner window border */}
        <div
          style={{
            width: '65%',
            height: '55%',
            maxWidth: '280px',
            maxHeight: '300px',
            borderRadius: radius['2xl'],
            border: `1px solid ${palette.primary}`,
            boxShadow: `0 0 60px ${palette.primaryGlow}, inset 0 0 40px ${palette.primaryGlow}`,
          }}
        />
      </motion.div>

      {/* ── Central thought — fills screen then shrinks ────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <motion.div
          animate={{
            scale: getThoughtScale(),
            opacity: getThoughtOpacity(),
          }}
          transition={{
            scale: {
              duration: stage === 'close' ? 1.5 : stage === 'pulling' ? 5 : 3,
              ease: [0.22, 1, 0.36, 1],
            },
            opacity: {
              duration: stage === 'close' ? 1.2 : 2.5,
              ease: 'easeInOut',
            },
          }}
          style={{
            ...navicueType.prompt,
            color: palette.text,
            textAlign: 'center',
            lineHeight: 1.6,
            padding: '24px',
            maxWidth: '240px',
            userSelect: 'none',
          }}
        >
          I'm not doing
          <br />
          enough.
        </motion.div>

        {/* ── Contained label — appears when thought is small ──── */}
        <AnimatePresence>
          {stage === 'witness' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.3, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                top: '62%',
                ...navicueType.hint,
                color: palette.textFaint,
                letterSpacing: '0.08em',
              }}
            >
              a thought. not a truth.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Passing thoughts — drift through periphery ─────────── */}
      <AnimatePresence>
        {(stage === 'witness' || stage === 'afterglow') && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
            {PASSING_THOUGHTS.map((thought, i) => (
              <PassingThought
                key={thought}
                text={thought}
                index={i}
                total={PASSING_THOUGHTS.length}
                isAfterGlow={stage === 'afterglow'}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* ── Observer position indicator — "You are here" ───────── */}
      <AnimatePresence>
        {stage === 'witness' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, delay: 2.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              bottom: '12%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              zIndex: 3,
            }}
          >
            {/* Soft pulse dot — you are here */}
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.15, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: palette.primary,
                boxShadow: `0 0 16px ${palette.primaryGlow}`,
              }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 2, delay: 1 }}
              style={{
                ...navicueType.texture,
                color: palette.textFaint,
                textAlign: 'center',
                maxWidth: '220px',
                lineHeight: 1.8,
              }}
            >
              You are here.
              <br />
              Watching.
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Afterglow ──────────────────────────────────────────── */}
      <AnimatePresence>
        {stage === 'afterglow' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            transition={{ duration: 3, delay: 1 }}
            style={{
              position: 'absolute',
              bottom: '15%',
              zIndex: 3,
              ...navicueType.afterglow,
              color: palette.textFaint,
              textAlign: 'center',
            }}
          >
            The distance was always available.
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom breath line ─────────────────────────────────── */}
      <motion.div
        animate={{
          scaleX: stage === 'close' ? 1 : stage === 'pulling' ? 0.5 : stage === 'witness' ? 0.2 : 0,
          opacity: stage === 'afterglow' ? 0 : 0.15,
        }}
        transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
          transformOrigin: 'center',
          zIndex: 4,
        }}
      />
    </NaviCueShell>
  );
}

// ── Depth field — parallax layers that separate during pullback ──
function DepthField({ stage }: { stage: Stage }) {
  // Three depth layers: far, mid, near
  // Each moves at a different parallax rate during the pullback
  const layers = [
    { y: 0, blur: 0, opacity: 0.03, size: '120%', delay: 0 },    // far
    { y: 0, blur: 2, opacity: 0.05, size: '110%', delay: 0.3 },  // mid
    { y: 0, blur: 4, opacity: 0.04, size: '105%', delay: 0.6 },  // near
  ];

  const getLayerY = (layerIndex: number) => {
    if (stage === 'close') return 0;
    if (stage === 'pulling') return (layerIndex - 1) * 15;
    if (stage === 'witness') return (layerIndex - 1) * 25;
    return (layerIndex - 1) * 10;
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {layers.map((layer, i) => (
        <motion.div
          key={`depth-${i}`}
          animate={{
            y: getLayerY(i),
            opacity: stage === 'afterglow' ? layer.opacity * 0.3 : layer.opacity,
          }}
          transition={{ duration: 4, ease: [0.22, 1, 0.36, 1], delay: layer.delay }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: layer.size,
              height: layer.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${palette.primaryGlow}, transparent 60%)`,
              filter: `blur(${layer.blur}px)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// ── Passing thought — drifts through the field at varying speeds ─
function PassingThought({
  text,
  index,
  total,
  isAfterGlow,
}: {
  text: string;
  index: number;
  total: number;
  isAfterGlow: boolean;
}) {
  // Distribute thoughts around the periphery
  const angle = (index / total) * Math.PI * 2;
  const radius = 35 + (index % 3) * 8; // % from center
  const startX = 50 + Math.cos(angle) * radius;
  const startY = 50 + Math.sin(angle) * radius;

  // Drift direction — gentle, not chaotic
  const driftX = Math.cos(angle + 0.5) * 8;
  const driftY = Math.sin(angle + 0.5) * 6;

  return (
    <motion.div
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{
        opacity: isAfterGlow ? [0, 0.08, 0] : [0, 0.15, 0.12, 0],
        x: [0, driftX, driftX * 1.5],
        y: [0, driftY, driftY * 1.5],
      }}
      transition={{
        duration: 8 + index * 1.5,
        delay: index * 0.8,
        ease: 'linear',
        repeat: Infinity,
      }}
      style={{
        position: 'absolute',
        left: `${startX}%`,
        top: `${startY}%`,
        transform: 'translate(-50%, -50%)',
        ...navicueType.caption,
        fontWeight: '300',
        color: palette.textFaint,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {text}
    </motion.div>
  );
}