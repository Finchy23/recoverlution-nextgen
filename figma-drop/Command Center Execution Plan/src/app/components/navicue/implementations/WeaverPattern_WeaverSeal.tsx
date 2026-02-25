/**
 * WEAVER PATTERN #10 -- 1290. The Weaver Seal (The Proof)
 * "You are the weaver. You are the thread. You are the web."
 * INTERACTION: Observe -- Indra's Net: jewels reflecting jewels in infinite recursion
 * STEALTH KBE: Network Theory / Small World Networks -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1290
 */
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function WeaverPattern_WeaverSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1290,
        isSeal: true,
      }}
      arrivalText="A net of jewels."
      prompt="You are the weaver. You are the thread. You are the web."
      resonantText="Network theory. Small world networks. You are only six degrees of separation from anyone on earth. The network is denser than you think. Every jewel reflects every other. Indra's Net."
      afterglowCoda="You are the web."
      onComplete={onComplete}
    >
      {(verse) => <WeaverSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function WeaverSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 4000);
    const t3 = setTimeout(() => setPhase(3), 7000);
    const t4 = setTimeout(() => setPhase(4), 10000);
    const t5 = setTimeout(() => {
      setPhase(5);
      setTimeout(() => verse.advance(), 3500);
    }, 12500);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5);
    };
  }, [verse]);

  const W = 240, H = 240;
  const CX = W / 2, CY = H / 2;

  // Jewel nodes in a hexagonal-ish arrangement
  const jewels = [
    { x: CX, y: CY },          // 0: center
    { x: CX, y: CY - 60 },    // 1: top
    { x: CX + 52, y: CY - 30 },// 2: top-right
    { x: CX + 52, y: CY + 30 },// 3: bottom-right
    { x: CX, y: CY + 60 },    // 4: bottom
    { x: CX - 52, y: CY + 30 },// 5: bottom-left
    { x: CX - 52, y: CY - 30 },// 6: top-left
    // Outer ring
    { x: CX, y: CY - 95 },
    { x: CX + 82, y: CY - 47 },
    { x: CX + 82, y: CY + 47 },
    { x: CX, y: CY + 95 },
    { x: CX - 82, y: CY + 47 },
    { x: CX - 82, y: CY - 47 },
  ];

  // Connections between jewels
  const connections = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
    [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1],
    [1, 7], [2, 8], [3, 9], [4, 10], [5, 11], [6, 12],
    [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 7],
  ];

  // Which connections/jewels to show per phase
  const visibleJewels = phase >= 3 ? jewels.length : phase >= 2 ? 7 : phase >= 1 ? 1 : 0;
  const visibleConns = phase >= 3 ? connections.length : phase >= 2 ? 12 : 0;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Outer seal ring */}
          {phase >= 5 && (
            <motion.circle
              cx={CX} cy={CY} r={112}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.15), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Connection threads */}
          {connections.slice(0, visibleConns).map(([a, b], i) => (
            <motion.line key={`conn-${i}`}
              x1={jewels[a].x} y1={jewels[a].y}
              x2={jewels[b].x} y2={jewels[b].y}
              stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(phase >= 4 ? 0.2 : 0.1) }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            />
          ))}

          {/* Jewel nodes */}
          {jewels.slice(0, visibleJewels).map((j, i) => {
            const isCenter = i === 0;
            const isInner = i < 7;
            const r = isCenter ? 8 : isInner ? 5 : 4;

            return (
              <motion.g key={`jewel-${i}`}>
                {/* Glow */}
                <motion.circle
                  cx={j.x} cy={j.y}
                  r={r * 2.5}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: safeOpacity(phase >= 4 ? 0.06 : 0.03),
                  }}
                  transition={{ delay: i * 0.05 }}
                />

                {/* Jewel body */}
                <motion.circle
                  cx={j.x} cy={j.y} r={r}
                  fill={verse.palette.accent}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: safeOpacity(isCenter ? 0.4 : 0.25),
                    scale: 1,
                  }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                />

                {/* Reflection shimmer (phase 4+) */}
                {phase >= 4 && (
                  <motion.circle
                    cx={j.x} cy={j.y} r={r}
                    fill="none" stroke={verse.palette.accent}
                    strokeWidth={0.5}
                    animate={{
                      opacity: [safeOpacity(0.15), safeOpacity(0.35), safeOpacity(0.15)],
                      r: [r, r + 2, r],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2 + (i % 3) * 0.5,
                      delay: i * 0.15,
                    }}
                  />
                )}
              </motion.g>
            );
          })}

          {/* Reflection lines (phase 4+): jewels reflecting each other */}
          {phase >= 4 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Subtle reflection arcs between non-adjacent jewels */}
              {[
                [1, 4], [2, 5], [3, 6],
                [7, 10], [8, 11], [9, 12],
              ].map(([a, b], i) => (
                <motion.path key={`ref-${i}`}
                  d={`M ${jewels[a].x},${jewels[a].y} Q ${CX},${CY} ${jewels[b].x},${jewels[b].y}`}
                  fill="none" stroke={verse.palette.accent}
                  strokeWidth={0.3} strokeDasharray="2 4"
                  animate={{
                    opacity: [safeOpacity(0.05), safeOpacity(0.12), safeOpacity(0.05)],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    delay: i * 0.4,
                  }}
                />
              ))}
            </motion.g>
          )}

          {/* Phase text */}
          <motion.text
            x={CX} y={H - 8}
            textAnchor="middle"
            fill={phase >= 5 ? verse.palette.accent : verse.palette.textFaint}
            style={navicueType.hint}
            animate={{ opacity: 0.6 }}
          >
            {phase === 0 && 'a net'}
            {phase === 1 && 'one jewel'}
            {phase === 2 && 'seven jewels'}
            {phase === 3 && 'thirteen jewels'}
            {phase === 4 && 'every jewel reflects every other'}
            {phase >= 5 && 'you are the weaver, the thread, the web'}
          </motion.text>
        </svg>
      </div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 5 ? 'network theory' : 'observe'}
      </div>
    </div>
  );
}
