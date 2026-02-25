/**
 * CONDUCTOR #10 -- 1220. The Conductor Seal (The Proof)
 * "Power is not possessed. It is channeled."
 * INTERACTION: Observe -- Tesla coil arcing controlled lightning
 * STEALTH KBE: Conductivity -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1220
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

export default function Conductor_ConductorSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1220,
        isSeal: true,
      }}
      arrivalText="A coil rises from the dark."
      prompt="Power is not possessed. It is channeled."
      resonantText="Conductivity. The measure of a material's ability to allow the transport of an electric charge. Be copper, not rubber. Let the energy pass through."
      afterglowCoda="Be the wire."
      onComplete={onComplete}
    >
      {(verse) => <SealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);
  const [arcSeed, setArcSeed] = useState(0);
  const breathCycle = verse.breathAmplitude;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);
    const t2 = setTimeout(() => setPhase(2), 3500);
    const t3 = setTimeout(() => {
      setPhase(3);
      setTimeout(() => verse.advance(), 3000);
    }, 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [verse]);

  // Arc animation
  useEffect(() => {
    if (phase < 2) return;
    const interval = setInterval(() => {
      setArcSeed(prev => prev + 1);
    }, 200);
    return () => clearInterval(interval);
  }, [phase]);

  const SCENE_W = 260;
  const SCENE_H = 220;

  // Generate lightning arc paths
  const generateArc = (seed: number, startX: number, startY: number, endX: number, endY: number) => {
    const segments = 8;
    const points: string[] = [`M ${startX},${startY}`];
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const x = startX + (endX - startX) * t + (Math.sin(seed * 7 + i * 3) * 15);
      const y = startY + (endY - startY) * t + (Math.cos(seed * 11 + i * 5) * 8);
      points.push(`L ${x},${y}`);
    }
    points.push(`L ${endX},${endY}`);
    return points.join(' ');
  };

  return (
    <div style={navicueStyles.interactionContainer(24)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Ambient glow */}
          <defs>
            <radialGradient id="tesla-glow" cx="50%" cy="35%" r="50%">
              <stop offset="0%" stopColor={verse.palette.accent} stopOpacity={0.08} />
              <stop offset="100%" stopColor={verse.palette.accent} stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill="url(#tesla-glow)" />

          {/* Tesla coil base */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 1 }}
          >
            {/* Base platform */}
            <rect x={110} y={180} width={40} height={8} rx={2}
              fill={verse.palette.primary} opacity={safeOpacity(0.2)} />

            {/* Primary coil */}
            <rect x={120} y={140} width={20} height={40} rx={3}
              fill="none" stroke={verse.palette.primary}
              strokeWidth={1} opacity={safeOpacity(0.25)} />

            {/* Secondary coil (taller) */}
            <rect x={125} y={60} width={10} height={80} rx={2}
              fill="none" stroke={verse.palette.accent}
              strokeWidth={1.5} opacity={safeOpacity(0.3)} />

            {/* Top terminal (torus) */}
            <motion.ellipse
              cx={130} cy={55}
              rx={20} ry={8}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={1.5}
              animate={{
                opacity: safeOpacity(0.3 + breathCycle * 0.2),
              }}
            />
          </motion.g>

          {/* Lightning arcs */}
          {phase >= 2 && Array.from({ length: 4 }).map((_, i) => {
            const angle = (i / 4) * Math.PI * 2 + arcSeed * 0.3;
            const endX = 130 + Math.cos(angle) * (60 + breathCycle * 20);
            const endY = 45 + Math.sin(angle) * (40 + breathCycle * 15);

            return (
              <motion.path
                key={`arc-${i}`}
                d={generateArc(arcSeed + i, 130, 50, endX, endY)}
                fill="none"
                stroke={verse.palette.accent}
                strokeWidth={phase >= 3 ? 1.5 : 1}
                strokeLinecap="round"
                animate={{
                  opacity: [
                    safeOpacity(0.15 + breathCycle * 0.2),
                    safeOpacity(0.4 + breathCycle * 0.3),
                    safeOpacity(0.1),
                  ],
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  delay: i * 0.08,
                }}
              />
            );
          })}

          {/* Ambient sparks at arc tips */}
          {phase >= 2 && Array.from({ length: 6 }).map((_, i) => {
            const angle = (arcSeed + i * 1.3) * 0.5;
            const dist = 65 + breathCycle * 25;
            return (
              <motion.circle
                key={`spark-${i}`}
                cx={130 + Math.cos(angle) * dist}
                cy={48 + Math.sin(angle) * dist * 0.6}
                r={1.5}
                fill={verse.palette.accent}
                animate={{
                  opacity: [0, safeOpacity(0.4), 0],
                  scale: [0.5, 1.5, 0.5],
                }}
                transition={{
                  duration: 0.4,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            );
          })}

          {/* Phase 3: completion ring */}
          {phase >= 3 && (
            <motion.circle
              cx={130} cy={100}
              r={90}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.15), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </svg>
      </div>

      {/* Phase text */}
      <motion.div
        animate={{ opacity: phase >= 1 ? 0.7 : 0.4 }}
        style={{
          ...navicueType.hint,
          color: phase >= 3 ? verse.palette.accent : verse.palette.textFaint,
          textAlign: 'center',
          maxWidth: 280,
        }}
      >
        {phase < 1 && 'darkness hums with potential'}
        {phase === 1 && 'the coil charges'}
        {phase === 2 && 'controlled, beautiful power'}
        {phase >= 3 && 'be copper, not rubber'}
      </motion.div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 3 ? 'conductivity' : 'observe'}
      </div>
    </div>
  );
}
