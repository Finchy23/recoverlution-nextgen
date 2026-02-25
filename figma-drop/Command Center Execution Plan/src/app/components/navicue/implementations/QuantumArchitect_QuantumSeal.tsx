/**
 * QUANTUM ARCHITECT #10 -- 1240. The Quantum Seal (The Proof)
 * "You are the observer. You create the world by looking at it."
 * INTERACTION: Observe -- double-slit interference pattern resolves from wave to particle
 * STEALTH KBE: QBism -- seal completion
 *
 * COMPOSITOR: science_x_soul / Cosmos / night / knowing / observe / 1240
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

export default function QuantumArchitect_QuantumSeal({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'science_x_soul',
        form: 'Cosmos',
        chrono: 'night',
        kbe: 'k',
        hook: 'observe',
        specimenSeed: 1240,
        isSeal: true,
      }}
      arrivalText="Two slits. One photon."
      prompt="You are the observer. You create the world by looking at it."
      resonantText="Quantum Bayesianism. Reality is not a fixed external world. It is an agent's interaction with the world. The interference pattern proves it. You are not in the universe. The universe is in you."
      afterglowCoda="The world is built by your beliefs."
      onComplete={onComplete}
    >
      {(verse) => <QuantumSealInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function QuantumSealInteraction({ verse }: { verse: any }) {
  const [phase, setPhase] = useState(0);
  const breathCycle = verse.breathAmplitude;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1500);  // Show wave
    const t2 = setTimeout(() => setPhase(2), 4000);  // Show interference
    const t3 = setTimeout(() => setPhase(3), 7000);  // Transition to particles
    const t4 = setTimeout(() => {
      setPhase(4);
      setTimeout(() => verse.advance(), 3500);
    }, 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [verse]);

  const SCENE_W = 280;
  const SCENE_H = 220;

  // Interference pattern bands
  const BANDS = 9;
  const bandWidth = 20;
  const screenX = 220;
  const slitY1 = SCENE_H / 2 - 20;
  const slitY2 = SCENE_H / 2 + 20;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      <div style={{ position: 'relative', width: SCENE_W, height: SCENE_H }}>
        <svg width={SCENE_W} height={SCENE_H} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}>
          {/* Source */}
          <motion.circle
            cx={30} cy={SCENE_H / 2}
            r={4}
            fill={verse.palette.accent}
            animate={{
              opacity: [safeOpacity(0.3), safeOpacity(0.5), safeOpacity(0.3)],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
          <text x={30} y={SCENE_H / 2 + 18} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro}>
            source
          </text>

          {/* Barrier with two slits */}
          <rect x={96} y={20} width={8} height={SCENE_H / 2 - 30} rx={1}
            fill={verse.palette.primary} opacity={safeOpacity(0.2)} />
          <rect x={96} y={slitY1 + 10} width={8} height={slitY2 - slitY1 - 10} rx={1}
            fill={verse.palette.primary} opacity={safeOpacity(0.2)} />
          <rect x={96} y={slitY2 + 10} width={8} height={SCENE_H / 2 - 30} rx={1}
            fill={verse.palette.primary} opacity={safeOpacity(0.2)} />

          {/* Slit labels */}
          <text x={88} y={slitY1 + 6} textAnchor="end"
            fill={verse.palette.textFaint} style={navicueType.micro}>
            slit 1
          </text>
          <text x={88} y={slitY2 + 6} textAnchor="end"
            fill={verse.palette.textFaint} style={navicueType.micro}>
            slit 2
          </text>

          {/* Phase 1: Wave propagation from source through slits */}
          {phase >= 1 && phase < 3 && (
            <motion.g>
              {/* Wave from source to slits */}
              {[0, 1, 2].map(i => (
                <motion.circle
                  key={`wave-${i}`}
                  cx={30} cy={SCENE_H / 2}
                  fill="none"
                  stroke={verse.palette.accent}
                  strokeWidth={0.5}
                  animate={{
                    r: [0, 70],
                    opacity: [safeOpacity(0.2), 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    delay: i * 0.5,
                  }}
                />
              ))}

              {/* Waves from each slit */}
              {[slitY1, slitY2].map((sy, si) => (
                [0, 1].map(i => (
                  <motion.circle
                    key={`slit-wave-${si}-${i}`}
                    cx={104} cy={sy + 5}
                    fill="none"
                    stroke={verse.palette.accent}
                    strokeWidth={0.5}
                    animate={{
                      r: [0, 100],
                      opacity: [safeOpacity(0.15), 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.8,
                      delay: i * 0.9 + si * 0.3,
                    }}
                  />
                ))
              ))}
            </motion.g>
          )}

          {/* Detection screen */}
          <rect x={screenX} y={20} width={4} height={SCENE_H - 40} rx={1}
            fill={verse.palette.primary} opacity={safeOpacity(0.1)} />

          {/* Phase 2: Interference pattern (wave mode) */}
          {phase >= 2 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              {Array.from({ length: BANDS }).map((_, i) => {
                const y = 20 + ((SCENE_H - 40) / (BANDS - 1)) * i;
                const distFromCenter = Math.abs(i - (BANDS - 1) / 2);
                const intensity = Math.cos(distFromCenter * 0.7) ** 2;
                const isParticlePhase = phase >= 3;

                return (
                  <motion.g key={`band-${i}`}>
                    {/* Wave band */}
                    {!isParticlePhase && (
                      <motion.rect
                        x={screenX + 8}
                        y={y - 6}
                        width={30}
                        height={12}
                        rx={2}
                        fill={verse.palette.accent}
                        animate={{
                          opacity: safeOpacity(intensity * 0.3 + breathCycle * 0.03),
                        }}
                      />
                    )}

                    {/* Particle dots (phase 3+) */}
                    {isParticlePhase && Array.from({ length: Math.round(intensity * 6) }).map((_, j) => (
                      <motion.circle
                        key={`dot-${i}-${j}`}
                        cx={screenX + 12 + Math.random() * 22}
                        cy={y - 4 + Math.random() * 8}
                        r={1.5}
                        fill={verse.palette.accent}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: safeOpacity(0.3 + intensity * 0.3) }}
                        transition={{ delay: (i * 6 + j) * 0.04 }}
                      />
                    ))}
                  </motion.g>
                );
              })}
            </motion.g>
          )}

          {/* Labels */}
          {phase >= 2 && (
            <motion.text
              x={screenX + 24} y={SCENE_H - 10}
              textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.micro}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1 }}
            >
              {phase >= 3 ? 'particles' : 'interference'}
            </motion.text>
          )}

          {/* Phase 4: Seal ring */}
          {phase >= 4 && (
            <motion.circle
              cx={SCENE_W / 2} cy={SCENE_H / 2}
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
        animate={{ opacity: 0.6 }}
        style={{
          ...navicueType.hint,
          color: phase >= 4 ? verse.palette.accent : verse.palette.textFaint,
          textAlign: 'center',
          maxWidth: 280,
        }}
      >
        {phase === 0 && 'one photon at a time'}
        {phase === 1 && 'the wave passes through both slits'}
        {phase === 2 && 'it interferes with itself'}
        {phase === 3 && 'waves become particles on the screen'}
        {phase >= 4 && 'you create the world by looking at it'}
      </motion.div>

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {phase >= 4 ? 'quantum bayesianism' : 'observe'}
      </div>
    </div>
  );
}
