/**
 * CATALYST III #10 -- 1230. The Catalyst Seal (The Proof)
 * "Be the tunnel, not the hill."
 * INTERACTION: Observe -- activation energy graph with tunnel through the hill
 * STEALTH KBE: Catalysis -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1230
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

export default function CatalystIII_CatalystSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1230,
        isSeal: true,
      }}
      arrivalText="A hill. A tunnel."
      prompt="Be the tunnel, not the hill."
      resonantText="Catalysis. A substance that increases the rate of a chemical reaction without itself undergoing any permanent chemical change. You facilitate the change without being consumed by it."
      afterglowCoda="Unchanged. Unchanging."
      onComplete={onComplete}
    >
      {(verse) => <SealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function SealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);
  const [particlePhase, setParticlePhase] = useState(0);
  const breathCycle = verse.breathAmplitude;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 3000);
    const t3 = setTimeout(() => {
      setPhase(3);
      setTimeout(() => verse.advance(), 3500);
    }, 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [verse]);

  // Particle animation through tunnel
  useEffect(() => {
    if (phase < 2) return;
    const interval = setInterval(() => {
      setParticlePhase(prev => prev + 1);
    }, 150);
    return () => clearInterval(interval);
  }, [phase]);

  const SCENE_W = 280;
  const SCENE_H = 200;

  // Hill profile (activation energy curve)
  const hillPath = (withTunnel: boolean) => {
    const points: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      const x = 30 + t * (SCENE_W - 60);

      // Gaussian hill
      const peak = 0.5;
      const sigma = 0.18;
      const gaussian = Math.exp(-((t - peak) ** 2) / (2 * sigma ** 2));

      // Reactants higher than products (exothermic)
      const baseline = 150 - (t > 0.5 ? 20 : 0);
      const y = baseline - gaussian * 80;

      points.push(`${i === 0 ? 'M' : 'L'} ${x},${y}`);
    }
    return points.join(' ');
  };

  // Tunnel path (lower activation energy)
  const tunnelPath = () => {
    const points: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      const x = 30 + t * (SCENE_W - 60);

      const peak = 0.5;
      const sigma = 0.22;
      const gaussian = Math.exp(-((t - peak) ** 2) / (2 * sigma ** 2));

      const baseline = 150 - (t > 0.5 ? 20 : 0);
      const y = baseline - gaussian * 30; // Much lower hill

      points.push(`${i === 0 ? 'M' : 'L'} ${x},${y}`);
    }
    return points.join(' ');
  };

  // Particle position along tunnel path
  const particleOnPath = (offset: number) => {
    const t = ((particlePhase * 0.05 + offset) % 1);
    const x = 30 + t * (SCENE_W - 60);
    const peak = 0.5;
    const sigma = 0.22;
    const gaussian = Math.exp(-((t - peak) ** 2) / (2 * sigma ** 2));
    const baseline = 150 - (t > 0.5 ? 20 : 0);
    const y = baseline - gaussian * 30;
    return { x, y };
  };

  return (
    <div style={navicueStyles.interactionContainer(20)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Axes */}
          <line x1={25} y1={170} x2={SCENE_W - 25} y2={170}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.15)} />
          <line x1={25} y1={170} x2={25} y2={40}
            stroke={verse.palette.primary} strokeWidth={0.5}
            opacity={safeOpacity(0.15)} />

          {/* Axis labels */}
          <text x={SCENE_W / 2} y={190} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro}>
            reaction progress
          </text>
          <text x={12} y={105} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro}
            transform="rotate(-90 12 105)">
            energy
          </text>

          {/* Phase 1: High hill (uncatalyzed) */}
          {phase >= 1 && (
            <motion.path
              d={hillPath(false)}
              fill="none"
              stroke={verse.palette.primary}
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: safeOpacity(0.3) }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          )}

          {/* Activation energy arrow */}
          {phase >= 1 && phase < 3 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.25) }}
              transition={{ delay: 1.5 }}
            >
              <line x1={SCENE_W / 2 + 20} y1={150} x2={SCENE_W / 2 + 20} y2={72}
                stroke={verse.palette.shadow} strokeWidth={0.8}
                strokeDasharray="3 2" />
              <text x={SCENE_W / 2 + 35} y={110} textAnchor="start"
                fill={verse.palette.shadow} style={navicueType.micro}>
                Ea
              </text>
            </motion.g>
          )}

          {/* Phase 2: Tunnel (catalyzed path) */}
          {phase >= 2 && (
            <motion.path
              d={tunnelPath()}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={2}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: safeOpacity(0.4 + breathCycle * 0.1),
              }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          )}

          {/* Catalyzed Ea arrow */}
          {phase >= 2 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.3) }}
              transition={{ delay: 1.5 }}
            >
              <line x1={SCENE_W / 2 - 20} y1={150} x2={SCENE_W / 2 - 20} y2={122}
                stroke={verse.palette.accent} strokeWidth={0.8}
                strokeDasharray="3 2" />
              <text x={SCENE_W / 2 - 35} y={138} textAnchor="end"
                fill={verse.palette.accent} style={navicueType.micro}>
                Ea (cat.)
              </text>
            </motion.g>
          )}

          {/* Particles flowing through tunnel */}
          {phase >= 2 && Array.from({ length: 3 }).map((_, i) => {
            const pos = particleOnPath(i * 0.33);
            return (
              <motion.circle
                key={i}
                cx={pos.x} cy={pos.y}
                r={3}
                fill={verse.palette.accent}
                animate={{
                  opacity: [0, safeOpacity(0.4), 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: i * 0.6,
                }}
              />
            );
          })}

          {/* Phase 3: Seal ring */}
          {phase >= 3 && (
            <motion.circle
              cx={SCENE_W / 2} cy={SCENE_H / 2 - 10}
              r={80}
              fill="none"
              stroke={verse.palette.accent}
              strokeWidth={0.5}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: safeOpacity(0.15), scale: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          )}

          {/* Reactant / product labels */}
          {phase >= 1 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: safeOpacity(0.25) }}
              transition={{ delay: 2 }}
            >
              <text x={40} y={155} textAnchor="start"
                fill={verse.palette.textFaint} style={navicueType.micro}>
                reactants
              </text>
              <text x={SCENE_W - 40} y={135} textAnchor="end"
                fill={verse.palette.accent} style={navicueType.micro}>
                products
              </text>
            </motion.g>
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
        {phase < 1 && 'energy required to change'}
        {phase === 1 && 'the hill is high without help'}
        {phase === 2 && 'the tunnel through the barrier'}
        {phase >= 3 && 'facilitate without being consumed'}
      </motion.div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 3 ? 'catalysis' : 'observe'}
      </div>
    </div>
  );
}
